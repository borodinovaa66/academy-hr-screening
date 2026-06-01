const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");
const { defaultConfig } = require("./defaultConfig");

const dataDir = path.join(__dirname, "..", "data");
const sqlitePath = path.join(dataDir, "hr-screening.sqlite");

let db;

function json(value) {
  return JSON.stringify(value);
}

function parseJson(value, fallback = null) {
  if (!value) return fallback;
  return JSON.parse(value);
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 32, "sha256").toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, expectedHash) {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(expectedHash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function initDb({ adminUsername, adminPassword, resetAdminPassword = false }) {
  await fs.mkdir(dataDir, { recursive: true });
  db = new DatabaseSync(sqlitePath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      submitted_at TEXT NOT NULL,
      candidate_json TEXT NOT NULL,
      answers_json TEXT NOT NULL,
      score_json TEXT NOT NULL,
      recommendation_json TEXT NOT NULL,
      flags_json TEXT NOT NULL,
      strengths_json TEXT NOT NULL,
      risks_json TEXT NOT NULL,
      hr_note TEXT NOT NULL,
      consents_json TEXT NOT NULL DEFAULT '{}',
      test_assignment_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS configs (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      session_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      step INTEGER,
      payload_json TEXT NOT NULL DEFAULT '{}'
    );
  `);

  const submissionColumns = db.prepare("PRAGMA table_info(submissions)").all().map(column => column.name);
  if (!submissionColumns.includes("consents_json")) {
    db.exec("ALTER TABLE submissions ADD COLUMN consents_json TEXT NOT NULL DEFAULT '{}';");
  }
  if (!submissionColumns.includes("test_assignment_json")) {
    db.exec("ALTER TABLE submissions ADD COLUMN test_assignment_json TEXT NOT NULL DEFAULT '{}';");
  }

  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (userCount === 0) {
    const { salt, hash } = hashPassword(adminPassword);
    db.prepare(`
      INSERT INTO users (id, username, password_hash, password_salt, role, created_at)
      VALUES (?, ?, ?, ?, 'admin', ?)
    `).run(crypto.randomUUID(), adminUsername, hash, salt, new Date().toISOString());
  } else if (resetAdminPassword) {
    const { salt, hash } = hashPassword(adminPassword);
    db.prepare("UPDATE users SET password_hash = ?, password_salt = ? WHERE username = ?")
      .run(hash, salt, adminUsername);
  }

  const config = db.prepare("SELECT key FROM configs WHERE key = 'questionnaire'").get();
  if (!config) {
    db.prepare("INSERT INTO configs (key, value_json, updated_at) VALUES ('questionnaire', ?, ?)")
      .run(json(defaultConfig), new Date().toISOString());
  } else {
    const current = getQuestionnaireConfig();
    if (Number(current.version || 0) < Number(defaultConfig.version || 1)) {
      db.prepare("UPDATE configs SET value_json = ?, updated_at = ? WHERE key = 'questionnaire'")
        .run(json(defaultConfig), new Date().toISOString());
    }
  }
}

function getQuestionnaireConfig() {
  const row = db.prepare("SELECT value_json FROM configs WHERE key = 'questionnaire'").get();
  return parseJson(row?.value_json, defaultConfig);
}

function saveQuestionnaireConfig(config) {
  validateQuestionnaireConfig(config);
  db.prepare(`
    INSERT INTO configs (key, value_json, updated_at)
    VALUES ('questionnaire', ?, ?)
    ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
  `).run(json(config), new Date().toISOString());
  return config;
}

function validateQuestionnaireConfig(config) {
  if (!config || typeof config !== "object") throw new Error("Config must be an object");
  if (!Array.isArray(config.questions) || config.questions.length === 0) throw new Error("Config must include questions[]");
  if (!config.labels || typeof config.labels !== "object") throw new Error("Config must include labels");
  if (!config.scoring?.optionScores || typeof config.scoring.optionScores !== "object") throw new Error("Config must include scoring.optionScores");
  if (!Number(config.scoring.rawMax)) throw new Error("Config must include scoring.rawMax");
  return true;
}

function insertSubmission(record) {
  db.prepare(`
    INSERT INTO submissions (
      id, submitted_at, candidate_json, answers_json, score_json, recommendation_json,
      flags_json, strengths_json, risks_json, hr_note, consents_json, test_assignment_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.id,
    record.submittedAt,
    json(record.candidate),
    json(record.answers),
    json(record.score),
    json(record.recommendation),
    json(record.flags),
    json(record.strengths),
    json(record.risks),
    record.hrNote,
    json(record.consents || {}),
    json(record.testAssignment || {})
  );
}

function rowToSubmission(row) {
  return {
    id: row.id,
    submittedAt: row.submitted_at,
    candidate: parseJson(row.candidate_json, {}),
    answers: parseJson(row.answers_json, {}),
    score: parseJson(row.score_json, {}),
    recommendation: parseJson(row.recommendation_json, {}),
    flags: parseJson(row.flags_json, []),
    strengths: parseJson(row.strengths_json, []),
    risks: parseJson(row.risks_json, []),
    hrNote: row.hr_note,
    consents: parseJson(row.consents_json, {}),
    testAssignment: parseJson(row.test_assignment_json, {})
  };
}

function updateTestAssignment(id, patch) {
  const current = getSubmission(id);
  if (!current) return null;
  const next = {
    ...(current.testAssignment || {}),
    ...patch,
    updatedAt: new Date().toISOString()
  };
  db.prepare("UPDATE submissions SET test_assignment_json = ? WHERE id = ?").run(json(next), id);
  return getSubmission(id);
}

function listSubmissions() {
  return db.prepare("SELECT * FROM submissions ORDER BY submitted_at DESC").all().map(rowToSubmission);
}

function getSubmission(id) {
  const row = db.prepare("SELECT * FROM submissions WHERE id = ?").get(id);
  return row ? rowToSubmission(row) : null;
}

function insertEvent(record) {
  db.prepare(`
    INSERT INTO events (id, created_at, session_id, event_type, step, payload_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    new Date().toISOString(),
    String(record.sessionId || "unknown").slice(0, 120),
    String(record.eventType || "unknown").slice(0, 80),
    Number.isInteger(record.step) ? record.step : null,
    json(record.payload || {})
  );
}

function listEvents() {
  return db.prepare("SELECT * FROM events ORDER BY created_at DESC").all().map(row => ({
    id: row.id,
    createdAt: row.created_at,
    sessionId: row.session_id,
    eventType: row.event_type,
    step: row.step,
    payload: parseJson(row.payload_json, {})
  }));
}

function findUserByUsername(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
}

function findSession(token) {
  if (!token) return null;
  const tokenHash = hashToken(token);
  const row = db.prepare(`
    SELECT sessions.*, users.username, users.role
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `).get(tokenHash, new Date().toISOString());
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    role: row.role,
    expiresAt: row.expires_at
  };
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const now = new Date();
  const expires = new Date(now.getTime() + 1000 * 60 * 60 * 12);
  db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), userId, hashToken(token), expires.toISOString(), now.toISOString());
  return { token, expiresAt: expires };
}

function deleteSession(token) {
  if (!token) return;
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
}

function authenticate(username, password) {
  const user = findUserByUsername(username);
  if (!user) return null;
  if (!verifyPassword(password, user.password_salt, user.password_hash)) return null;
  return { id: user.id, username: user.username, role: user.role };
}

module.exports = {
  initDb,
  getQuestionnaireConfig,
  saveQuestionnaireConfig,
  insertSubmission,
  updateTestAssignment,
  insertEvent,
  listEvents,
  listSubmissions,
  getSubmission,
  authenticate,
  createSession,
  findSession,
  deleteSession
};
