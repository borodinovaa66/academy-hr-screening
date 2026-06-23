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

function normalizeRole(role) {
  if (role === "owner" || role === "hr" || role === "hiring_manager") return role;
  if (role === "admin") return "owner";
  return "hr";
}

function normalizeVacancyAccess(role, vacancyAccess = []) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "owner" || normalizedRole === "hr") return [];
  return [...new Set((Array.isArray(vacancyAccess) ? vacancyAccess : [])
    .map(item => String(item || "").trim())
    .filter(Boolean))];
}

function publicUser(row) {
  const role = normalizeRole(row.role);
  return {
    id: row.id,
    username: row.username,
    email: row.email || row.username,
    displayName: row.display_name || "",
    role,
    vacancyAccess: normalizeVacancyAccess(role, parseJson(row.vacancy_access_json, [])),
    active: Number(row.active ?? 1) === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function upsertUser({ username, email, password, role = "hr", displayName = "", vacancyAccess = [], active = true, resetPassword = false }) {
  const login = String(username || email || "").trim().toLowerCase();
  if (!login) throw new Error("User email is required");
  const existing = db.prepare("SELECT * FROM users WHERE username = ?").get(login);
  const normalizedRole = normalizeRole(role);
  const normalizedAccess = normalizeVacancyAccess(normalizedRole, vacancyAccess);
  const now = new Date().toISOString();
  if (existing) {
    const updates = {
      email: String(email || login).trim().toLowerCase(),
      displayName: String(displayName || existing.display_name || "").trim(),
      role: normalizedRole,
      vacancyAccessJson: json(normalizedAccess),
      active: active ? 1 : 0,
      updatedAt: now
    };
    db.prepare(`
      UPDATE users
      SET email = ?, display_name = ?, role = ?, vacancy_access_json = ?, active = ?, updated_at = ?
      WHERE id = ?
    `).run(updates.email, updates.displayName, updates.role, updates.vacancyAccessJson, updates.active, updates.updatedAt, existing.id);
    if (password && resetPassword) {
      const { salt, hash } = hashPassword(password);
      db.prepare("UPDATE users SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?")
        .run(hash, salt, now, existing.id);
    }
    return getUser(existing.id);
  }
  if (!password) throw new Error("Password is required for a new user");
  const { salt, hash } = hashPassword(password);
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO users (
      id, username, email, display_name, password_hash, password_salt, role,
      vacancy_access_json, active, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    login,
    String(email || login).trim().toLowerCase(),
    String(displayName || "").trim(),
    hash,
    salt,
    normalizedRole,
    json(normalizedAccess),
    active ? 1 : 0,
    now,
    now
  );
  return getUser(id);
}

async function initDb({
  adminUsername,
  adminPassword,
  resetAdminPassword = false,
  hrUsername = "",
  hrPassword = "",
  resetHrPassword = false
}) {
  await fs.mkdir(dataDir, { recursive: true });
  db = new DatabaseSync(sqlitePath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      vacancy_code TEXT NOT NULL DEFAULT 'smm',
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
      test_assignment_json TEXT NOT NULL DEFAULT '{}',
      interview_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT,
      display_name TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'hr',
      vacancy_access_json TEXT NOT NULL DEFAULT '[]',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT
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
      vacancy_code TEXT NOT NULL DEFAULT 'smm',
      event_type TEXT NOT NULL,
      step INTEGER,
      payload_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      user_id TEXT,
      username TEXT,
      role TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      vacancy_code TEXT,
      payload_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS candidate_communications (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      candidate_id TEXT NOT NULL,
      vacancy_code TEXT NOT NULL DEFAULT '',
      channel TEXT NOT NULL,
      event_type TEXT NOT NULL,
      recipient TEXT NOT NULL DEFAULT '',
      subject TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      provider TEXT NOT NULL DEFAULT '',
      provider_response_json TEXT NOT NULL DEFAULT '{}',
      error TEXT NOT NULL DEFAULT '',
      sent_at TEXT,
      payload_json TEXT NOT NULL DEFAULT '{}',
      FOREIGN KEY (candidate_id) REFERENCES submissions(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS candidate_telegram_links (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      candidate_id TEXT NOT NULL UNIQUE,
      vacancy_code TEXT NOT NULL DEFAULT '',
      telegram_user_id TEXT NOT NULL DEFAULT '',
      chat_id TEXT NOT NULL DEFAULT '',
      username TEXT NOT NULL DEFAULT '',
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'linked',
      payload_json TEXT NOT NULL DEFAULT '{}',
      FOREIGN KEY (candidate_id) REFERENCES submissions(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS hiring_requests (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      created_by_user_id TEXT,
      created_by_username TEXT,
      request_type TEXT NOT NULL DEFAULT 'start_existing',
      vacancy_code TEXT,
      title TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT '',
      urgency TEXT NOT NULL DEFAULT 'normal',
      desired_start_date TEXT NOT NULL DEFAULT '',
      headcount INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'new',
      payload_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS vacancy_openings (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      vacancy_code TEXT NOT NULL,
      title TEXT NOT NULL,
      hiring_manager_user_id TEXT,
      hiring_manager_username TEXT,
      hr_owner_user_id TEXT,
      hr_owner_username TEXT,
      request_id TEXT,
      reason TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      hh_text_id TEXT,
      hh_publication_id TEXT,
      payload_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS hh_vacancy_texts (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      vacancy_code TEXT NOT NULL,
      opening_id TEXT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      payload_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS hh_publications (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      vacancy_code TEXT NOT NULL,
      opening_id TEXT,
      hh_text_id TEXT,
      hh_vacancy_id TEXT,
      url TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      published_at TEXT,
      payload_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS hh_integration_accounts (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      account_name TEXT NOT NULL DEFAULT 'HeadHunter',
      access_token TEXT NOT NULL DEFAULT '',
      refresh_token TEXT NOT NULL DEFAULT '',
      expires_at TEXT,
      me_json TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'disconnected'
    );
    CREATE TABLE IF NOT EXISTS hh_responses (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      vacancy_code TEXT NOT NULL,
      publication_id TEXT,
      hh_vacancy_id TEXT,
      negotiation_id TEXT NOT NULL UNIQUE,
      resume_id TEXT,
      candidate_name TEXT NOT NULL DEFAULT '',
      resume_url TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT '',
      questionnaire_sent INTEGER NOT NULL DEFAULT 0,
      questionnaire_sent_at TEXT,
      payload_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS hh_message_logs (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      vacancy_code TEXT NOT NULL,
      response_id TEXT,
      negotiation_id TEXT,
      message_text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'sent',
      payload_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS hh_webhook_events (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      action_type TEXT NOT NULL DEFAULT '',
      subscription_id TEXT NOT NULL DEFAULT '',
      processed INTEGER NOT NULL DEFAULT 0,
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
  if (!submissionColumns.includes("interview_json")) {
    db.exec("ALTER TABLE submissions ADD COLUMN interview_json TEXT NOT NULL DEFAULT '{}';");
  }
  if (!submissionColumns.includes("vacancy_code")) {
    db.exec("ALTER TABLE submissions ADD COLUMN vacancy_code TEXT NOT NULL DEFAULT 'smm';");
  }

  const eventColumns = db.prepare("PRAGMA table_info(events)").all().map(column => column.name);
  if (!eventColumns.includes("vacancy_code")) {
    db.exec("ALTER TABLE events ADD COLUMN vacancy_code TEXT NOT NULL DEFAULT 'smm';");
  }

  const userColumns = db.prepare("PRAGMA table_info(users)").all().map(column => column.name);
  if (!userColumns.includes("email")) {
    db.exec("ALTER TABLE users ADD COLUMN email TEXT;");
  }
  if (!userColumns.includes("display_name")) {
    db.exec("ALTER TABLE users ADD COLUMN display_name TEXT NOT NULL DEFAULT '';");
  }
  if (!userColumns.includes("vacancy_access_json")) {
    db.exec("ALTER TABLE users ADD COLUMN vacancy_access_json TEXT NOT NULL DEFAULT '[]';");
  }
  if (!userColumns.includes("active")) {
    db.exec("ALTER TABLE users ADD COLUMN active INTEGER NOT NULL DEFAULT 1;");
  }
  if (!userColumns.includes("updated_at")) {
    db.exec("ALTER TABLE users ADD COLUMN updated_at TEXT;");
  }
  db.prepare("UPDATE users SET email = username WHERE email IS NULL OR email = ''").run();
  db.prepare("UPDATE users SET role = 'owner' WHERE role = 'admin'").run();

  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (userCount === 0) {
    upsertUser({
      username: adminUsername,
      email: adminUsername,
      password: adminPassword,
      role: "owner",
      displayName: "Владелец",
      resetPassword: true
    });
  } else {
    upsertUser({
      username: adminUsername,
      email: adminUsername,
      password: adminPassword,
      role: "owner",
      displayName: "Владелец",
      resetPassword: resetAdminPassword
    });
  }
  if (hrUsername && hrPassword) {
    upsertUser({
      username: hrUsername,
      email: hrUsername,
      password: hrPassword,
      role: "hr",
      displayName: "HR",
      resetPassword: resetHrPassword
    });
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

function getUser(id) {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  return row ? publicUser(row) : null;
}

function listUsers() {
  return db.prepare("SELECT * FROM users ORDER BY created_at DESC").all().map(publicUser);
}

function createUser(payload) {
  return upsertUser({
    username: payload.email || payload.username,
    email: payload.email || payload.username,
    password: payload.password,
    role: payload.role,
    displayName: payload.displayName,
    vacancyAccess: payload.vacancyAccess,
    active: payload.active !== false,
    resetPassword: true
  });
}

function updateUser(id, payload) {
  const current = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!current) return null;
  const currentUser = publicUser(current);
  return upsertUser({
    username: current.username,
    email: payload.email || current.email || current.username,
    password: payload.password || "",
    role: payload.role || currentUser.role,
    displayName: payload.displayName ?? currentUser.displayName,
    vacancyAccess: payload.vacancyAccess ?? currentUser.vacancyAccess,
    active: payload.active ?? currentUser.active,
    resetPassword: Boolean(payload.password)
  });
}

function userCanAccessVacancy(user, vacancyCode) {
  if (!user) return false;
  const role = normalizeRole(user.role);
  if (role === "owner" || role === "hr") return true;
  const access = normalizeVacancyAccess(role, user.vacancyAccess);
  return access.includes(String(vacancyCode || ""));
}

function allowedVacancyCodes(user, allCodes = []) {
  if (!user) return [];
  const role = normalizeRole(user.role);
  if (role === "owner" || role === "hr") return allCodes;
  return normalizeVacancyAccess(role, user.vacancyAccess).filter(code => allCodes.includes(code));
}

function rowToHiringRequest(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdByUserId: row.created_by_user_id,
    createdByUsername: row.created_by_username,
    requestType: row.request_type,
    vacancyCode: row.vacancy_code,
    title: row.title,
    reason: row.reason,
    urgency: row.urgency,
    desiredStartDate: row.desired_start_date,
    headcount: row.headcount,
    status: row.status,
    payload: parseJson(row.payload_json, {})
  };
}

function listHiringRequests() {
  return db.prepare("SELECT * FROM hiring_requests ORDER BY created_at DESC").all().map(rowToHiringRequest);
}

function createHiringRequest(record) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO hiring_requests (
      id, created_at, updated_at, created_by_user_id, created_by_username, request_type,
      vacancy_code, title, reason, urgency, desired_start_date, headcount, status, payload_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    now,
    now,
    record.createdByUserId || null,
    record.createdByUsername || "",
    record.requestType || "start_existing",
    record.vacancyCode || null,
    String(record.title || "Новая заявка").trim(),
    String(record.reason || "").trim(),
    record.urgency || "normal",
    String(record.desiredStartDate || "").trim(),
    Number(record.headcount || 1),
    record.status || "new",
    json(record.payload || {})
  );
  return getHiringRequest(id);
}

function getHiringRequest(id) {
  const row = db.prepare("SELECT * FROM hiring_requests WHERE id = ?").get(id);
  return row ? rowToHiringRequest(row) : null;
}

function updateHiringRequest(id, patch) {
  const current = getHiringRequest(id);
  if (!current) return null;
  const next = { ...current, ...patch, payload: { ...(current.payload || {}), ...(patch.payload || {}) } };
  db.prepare(`
    UPDATE hiring_requests
    SET updated_at = ?, request_type = ?, vacancy_code = ?, title = ?, reason = ?, urgency = ?,
      desired_start_date = ?, headcount = ?, status = ?, payload_json = ?
    WHERE id = ?
  `).run(
    new Date().toISOString(),
    next.requestType,
    next.vacancyCode || null,
    String(next.title || "").trim(),
    String(next.reason || "").trim(),
    next.urgency || "normal",
    String(next.desiredStartDate || "").trim(),
    Number(next.headcount || 1),
    next.status || "new",
    json(next.payload || {}),
    id
  );
  return getHiringRequest(id);
}

function rowToVacancyOpening(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    vacancyCode: row.vacancy_code,
    title: row.title,
    hiringManagerUserId: row.hiring_manager_user_id,
    hiringManagerUsername: row.hiring_manager_username,
    hrOwnerUserId: row.hr_owner_user_id,
    hrOwnerUsername: row.hr_owner_username,
    requestId: row.request_id,
    reason: row.reason,
    status: row.status,
    hhTextId: row.hh_text_id,
    hhPublicationId: row.hh_publication_id,
    payload: parseJson(row.payload_json, {})
  };
}

function listVacancyOpenings() {
  return db.prepare("SELECT * FROM vacancy_openings ORDER BY created_at DESC").all().map(rowToVacancyOpening);
}

function createVacancyOpening(record) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO vacancy_openings (
      id, created_at, updated_at, vacancy_code, title, hiring_manager_user_id, hiring_manager_username,
      hr_owner_user_id, hr_owner_username, request_id, reason, status, hh_text_id, hh_publication_id, payload_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    now,
    now,
    record.vacancyCode,
    String(record.title || record.vacancyCode || "").trim(),
    record.hiringManagerUserId || null,
    record.hiringManagerUsername || "",
    record.hrOwnerUserId || null,
    record.hrOwnerUsername || "",
    record.requestId || null,
    String(record.reason || "").trim(),
    record.status || "draft",
    record.hhTextId || null,
    record.hhPublicationId || null,
    json(record.payload || {})
  );
  return getVacancyOpening(id);
}

function getVacancyOpening(id) {
  const row = db.prepare("SELECT * FROM vacancy_openings WHERE id = ?").get(id);
  return row ? rowToVacancyOpening(row) : null;
}

function updateVacancyOpening(id, patch) {
  const current = getVacancyOpening(id);
  if (!current) return null;
  const next = { ...current, ...patch, payload: { ...(current.payload || {}), ...(patch.payload || {}) } };
  db.prepare(`
    UPDATE vacancy_openings
    SET updated_at = ?, title = ?, reason = ?, status = ?, hh_text_id = ?, hh_publication_id = ?, payload_json = ?
    WHERE id = ?
  `).run(
    new Date().toISOString(),
    String(next.title || "").trim(),
    String(next.reason || "").trim(),
    next.status || "draft",
    next.hhTextId || null,
    next.hhPublicationId || null,
    json(next.payload || {}),
    id
  );
  return getVacancyOpening(id);
}

function rowToHhVacancyText(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    vacancyCode: row.vacancy_code,
    openingId: row.opening_id,
    title: row.title,
    body: row.body,
    status: row.status,
    payload: parseJson(row.payload_json, {})
  };
}

function listHhVacancyTexts() {
  return db.prepare("SELECT * FROM hh_vacancy_texts ORDER BY created_at DESC").all().map(rowToHhVacancyText);
}

function createHhVacancyText(record) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO hh_vacancy_texts (id, created_at, updated_at, vacancy_code, opening_id, title, body, status, payload_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    now,
    now,
    record.vacancyCode,
    record.openingId || null,
    String(record.title || "").trim(),
    String(record.body || "").trim(),
    record.status || "draft",
    json(record.payload || {})
  );
  return getHhVacancyText(id);
}

function getHhVacancyText(id) {
  const row = db.prepare("SELECT * FROM hh_vacancy_texts WHERE id = ?").get(id);
  return row ? rowToHhVacancyText(row) : null;
}

function rowToHhPublication(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    vacancyCode: row.vacancy_code,
    openingId: row.opening_id,
    hhTextId: row.hh_text_id,
    hhVacancyId: row.hh_vacancy_id,
    url: row.url,
    status: row.status,
    publishedAt: row.published_at,
    payload: parseJson(row.payload_json, {})
  };
}

function listHhPublications() {
  return db.prepare("SELECT * FROM hh_publications ORDER BY created_at DESC").all().map(rowToHhPublication);
}

function createHhPublication(record) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO hh_publications (
      id, created_at, updated_at, vacancy_code, opening_id, hh_text_id, hh_vacancy_id, url, status, published_at, payload_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    now,
    now,
    record.vacancyCode,
    record.openingId || null,
    record.hhTextId || null,
    record.hhVacancyId || "",
    record.url || "",
    record.status || "draft",
    record.publishedAt || null,
    json(record.payload || {})
  );
  return getHhPublication(id);
}

function getHhPublication(id) {
  const row = db.prepare("SELECT * FROM hh_publications WHERE id = ?").get(id);
  return row ? rowToHhPublication(row) : null;
}

function updateHhPublication(id, patch) {
  const current = getHhPublication(id);
  if (!current) return null;
  const next = { ...current, ...patch, payload: { ...(current.payload || {}), ...(patch.payload || {}) } };
  db.prepare(`
    UPDATE hh_publications
    SET updated_at = ?, hh_vacancy_id = ?, url = ?, status = ?, published_at = ?, payload_json = ?
    WHERE id = ?
  `).run(
    new Date().toISOString(),
    String(next.hhVacancyId || "").trim(),
    String(next.url || "").trim(),
    next.status || "draft",
    next.publishedAt || null,
    json(next.payload || {}),
    id
  );
  return getHhPublication(id);
}

function getHhIntegrationAccount() {
  const row = db.prepare("SELECT * FROM hh_integration_accounts ORDER BY created_at DESC LIMIT 1").get();
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    accountName: row.account_name,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    expiresAt: row.expires_at,
    me: parseJson(row.me_json, {}),
    status: row.status
  };
}

function saveHhIntegrationAccount(record) {
  const current = getHhIntegrationAccount();
  const now = new Date().toISOString();
  if (current) {
    db.prepare(`
      UPDATE hh_integration_accounts
      SET updated_at = ?, account_name = ?, access_token = ?, refresh_token = ?, expires_at = ?, me_json = ?, status = ?
      WHERE id = ?
    `).run(
      now,
      record.accountName || current.accountName || "HeadHunter",
      record.accessToken ?? current.accessToken,
      record.refreshToken ?? current.refreshToken,
      record.expiresAt ?? current.expiresAt,
      json(record.me ?? current.me ?? {}),
      record.status || current.status || "connected",
      current.id
    );
    return getHhIntegrationAccount();
  }
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO hh_integration_accounts (id, created_at, updated_at, account_name, access_token, refresh_token, expires_at, me_json, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    now,
    now,
    record.accountName || "HeadHunter",
    record.accessToken || "",
    record.refreshToken || "",
    record.expiresAt || null,
    json(record.me || {}),
    record.status || "connected"
  );
  return getHhIntegrationAccount();
}

function disconnectHhIntegrationAccount() {
  const current = getHhIntegrationAccount();
  if (!current) return null;
  db.prepare(`
    UPDATE hh_integration_accounts
    SET updated_at = ?, access_token = '', refresh_token = '', expires_at = NULL, status = 'disconnected'
    WHERE id = ?
  `).run(new Date().toISOString(), current.id);
  return getHhIntegrationAccount();
}

function publicHhAccount(account) {
  if (!account) return { connected: false, status: "disconnected", me: {} };
  return {
    connected: account.status === "connected" && Boolean(account.accessToken),
    status: account.status,
    accountName: account.accountName,
    expiresAt: account.expiresAt,
    me: account.me || {}
  };
}

function rowToHhResponse(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    vacancyCode: row.vacancy_code,
    publicationId: row.publication_id,
    hhVacancyId: row.hh_vacancy_id,
    negotiationId: row.negotiation_id,
    resumeId: row.resume_id,
    candidateName: row.candidate_name,
    resumeUrl: row.resume_url,
    state: row.state,
    questionnaireSent: Number(row.questionnaire_sent || 0) === 1,
    questionnaireSentAt: row.questionnaire_sent_at,
    payload: parseJson(row.payload_json, {})
  };
}

function upsertHhResponse(record) {
  const existing = db.prepare("SELECT * FROM hh_responses WHERE negotiation_id = ?").get(String(record.negotiationId));
  const now = new Date().toISOString();
  if (existing) {
    db.prepare(`
      UPDATE hh_responses
      SET updated_at = ?, vacancy_code = ?, publication_id = ?, hh_vacancy_id = ?, resume_id = ?,
        candidate_name = ?, resume_url = ?, state = ?, payload_json = ?
      WHERE negotiation_id = ?
    `).run(
      now,
      record.vacancyCode,
      record.publicationId || null,
      record.hhVacancyId || "",
      record.resumeId || "",
      record.candidateName || "",
      record.resumeUrl || "",
      record.state || "",
      json(record.payload || {}),
      String(record.negotiationId)
    );
    return getHhResponseByNegotiation(record.negotiationId);
  }
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO hh_responses (
      id, created_at, updated_at, vacancy_code, publication_id, hh_vacancy_id, negotiation_id,
      resume_id, candidate_name, resume_url, state, questionnaire_sent, payload_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    id,
    now,
    now,
    record.vacancyCode,
    record.publicationId || null,
    record.hhVacancyId || "",
    String(record.negotiationId),
    record.resumeId || "",
    record.candidateName || "",
    record.resumeUrl || "",
    record.state || "",
    json(record.payload || {})
  );
  return getHhResponseByNegotiation(record.negotiationId);
}

function getHhResponse(id) {
  const row = db.prepare("SELECT * FROM hh_responses WHERE id = ?").get(id);
  return row ? rowToHhResponse(row) : null;
}

function getHhResponseByNegotiation(negotiationId) {
  const row = db.prepare("SELECT * FROM hh_responses WHERE negotiation_id = ?").get(String(negotiationId));
  return row ? rowToHhResponse(row) : null;
}

function listHhResponses() {
  return db.prepare("SELECT * FROM hh_responses ORDER BY created_at DESC").all().map(rowToHhResponse);
}

function markHhQuestionnaireSent(id, messageText, payload = {}) {
  const current = getHhResponse(id);
  if (!current) return null;
  const now = new Date().toISOString();
  db.prepare("UPDATE hh_responses SET questionnaire_sent = 1, questionnaire_sent_at = ?, updated_at = ? WHERE id = ?")
    .run(now, now, id);
  db.prepare(`
    INSERT INTO hh_message_logs (id, created_at, vacancy_code, response_id, negotiation_id, message_text, status, payload_json)
    VALUES (?, ?, ?, ?, ?, ?, 'sent', ?)
  `).run(crypto.randomUUID(), now, current.vacancyCode, id, current.negotiationId, messageText, json(payload));
  return getHhResponse(id);
}

function registerHhWebhookEvent(event) {
  const id = String(event?.id || "").trim();
  if (!id) return { duplicate: false, inserted: false };
  const existing = db.prepare("SELECT id FROM hh_webhook_events WHERE id = ?").get(id);
  if (existing) return { duplicate: true, inserted: false };
  db.prepare(`
    INSERT INTO hh_webhook_events (id, created_at, action_type, subscription_id, processed, payload_json)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(
    id,
    new Date().toISOString(),
    String(event.action_type || ""),
    String(event.subscription_id || ""),
    json(event || {})
  );
  return { duplicate: false, inserted: true };
}

function markHhWebhookEventProcessed(id, payload = {}) {
  if (!id) return;
  db.prepare("UPDATE hh_webhook_events SET processed = 1, payload_json = ? WHERE id = ?")
    .run(json(payload || {}), String(id));
}

function getQuestionnaireConfig() {
  const row = db.prepare("SELECT value_json FROM configs WHERE key = 'questionnaire'").get();
  return parseJson(row?.value_json, defaultConfig);
}

function getConfig(key, fallback = {}) {
  const row = db.prepare("SELECT value_json FROM configs WHERE key = ?").get(String(key || ""));
  return parseJson(row?.value_json, fallback);
}

function saveConfig(key, value) {
  db.prepare(`
    INSERT INTO configs (key, value_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
  `).run(String(key || ""), json(value || {}), new Date().toISOString());
  return value || {};
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
      id, vacancy_code, submitted_at, candidate_json, answers_json, score_json, recommendation_json,
      flags_json, strengths_json, risks_json, hr_note, consents_json, test_assignment_json, interview_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.id,
    record.vacancyCode || record.answers?.vacancyCode || "smm",
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
    json(record.testAssignment || {}),
    json(record.interview || {})
  );
}

function rowToSubmission(row) {
  return {
    id: row.id,
    vacancyCode: row.vacancy_code || "smm",
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
    testAssignment: parseJson(row.test_assignment_json, {}),
    interview: parseJson(row.interview_json, {})
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

function updateInterview(id, patch) {
  const current = getSubmission(id);
  if (!current) return null;
  const next = {
    ...(current.interview || {}),
    ...patch,
    updatedAt: new Date().toISOString()
  };
  db.prepare("UPDATE submissions SET interview_json = ? WHERE id = ?").run(json(next), id);
  return getSubmission(id);
}

function listSubmissions() {
  return db.prepare("SELECT * FROM submissions ORDER BY submitted_at DESC").all().map(rowToSubmission);
}

function listSubmissionsByVacancy(vacancyCode) {
  if (!vacancyCode) return listSubmissions();
  return db.prepare("SELECT * FROM submissions WHERE vacancy_code = ? ORDER BY submitted_at DESC").all(String(vacancyCode)).map(rowToSubmission);
}

function getSubmission(id) {
  const row = db.prepare("SELECT * FROM submissions WHERE id = ?").get(id);
  return row ? rowToSubmission(row) : null;
}

function deleteSubmission(id) {
  const result = db.prepare("DELETE FROM submissions WHERE id = ?").run(id);
  return result.changes > 0;
}

function insertEvent(record) {
  db.prepare(`
    INSERT INTO events (id, created_at, session_id, vacancy_code, event_type, step, payload_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    new Date().toISOString(),
    String(record.sessionId || "unknown").slice(0, 120),
    String(record.vacancyCode || "smm").slice(0, 80),
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
    vacancyCode: row.vacancy_code || "smm",
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
    SELECT
      sessions.*,
      users.username,
      users.email,
      users.display_name,
      users.role,
      users.vacancy_access_json,
      users.active
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ? AND users.active = 1
  `).get(tokenHash, new Date().toISOString());
  if (!row) return null;
  const role = normalizeRole(row.role);
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    email: row.email || row.username,
    displayName: row.display_name || "",
    role,
    vacancyAccess: normalizeVacancyAccess(role, parseJson(row.vacancy_access_json, [])),
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
  if (Number(user.active ?? 1) !== 1) return null;
  if (!verifyPassword(password, user.password_salt, user.password_hash)) return null;
  const publicRecord = publicUser(user);
  return {
    id: user.id,
    username: user.username,
    email: publicRecord.email,
    displayName: publicRecord.displayName,
    role: publicRecord.role,
    vacancyAccess: publicRecord.vacancyAccess
  };
}

function insertAuditLog({ user = null, action, targetType = "", targetId = "", vacancyCode = "", payload = {} }) {
  db.prepare(`
    INSERT INTO audit_logs (
      id, created_at, user_id, username, role, action, target_type, target_id, vacancy_code, payload_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    new Date().toISOString(),
    user?.userId || user?.id || null,
    user?.username || "",
    user?.role || "",
    String(action || "unknown").slice(0, 120),
    String(targetType || "").slice(0, 80),
    String(targetId || "").slice(0, 160),
    String(vacancyCode || "").slice(0, 80),
    json(payload || {})
  );
}

function listAuditLogs(limit = 200) {
  return db.prepare("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?").all(Math.max(1, Math.min(500, Number(limit) || 200))).map(row => ({
    id: row.id,
    createdAt: row.created_at,
    userId: row.user_id,
    username: row.username,
    role: row.role,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    vacancyCode: row.vacancy_code,
    payload: parseJson(row.payload_json, {})
  }));
}

function rowToCommunication(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    candidateId: row.candidate_id,
    vacancyCode: row.vacancy_code,
    channel: row.channel,
    eventType: row.event_type,
    recipient: row.recipient,
    subject: row.subject,
    body: row.body,
    status: row.status,
    provider: row.provider,
    providerResponse: parseJson(row.provider_response_json, {}),
    error: row.error,
    sentAt: row.sent_at,
    payload: parseJson(row.payload_json, {})
  };
}

function createCommunication(record) {
  const now = new Date().toISOString();
  const id = record.id || crypto.randomUUID();
  db.prepare(`
    INSERT INTO candidate_communications (
      id, created_at, updated_at, candidate_id, vacancy_code, channel, event_type, recipient,
      subject, body, status, provider, provider_response_json, error, sent_at, payload_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    record.createdAt || now,
    record.updatedAt || now,
    String(record.candidateId || ""),
    String(record.vacancyCode || ""),
    String(record.channel || "email"),
    String(record.eventType || ""),
    String(record.recipient || ""),
    String(record.subject || ""),
    String(record.body || ""),
    String(record.status || "pending"),
    String(record.provider || ""),
    json(record.providerResponse || {}),
    String(record.error || ""),
    record.sentAt || null,
    json(record.payload || {})
  );
  return getCommunication(id);
}

function getCommunication(id) {
  const row = db.prepare("SELECT * FROM candidate_communications WHERE id = ?").get(id);
  return row ? rowToCommunication(row) : null;
}

function updateCommunication(id, patch) {
  const current = getCommunication(id);
  if (!current) return null;
  const next = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
    providerResponse: patch.providerResponse || current.providerResponse || {},
    payload: patch.payload || current.payload || {}
  };
  db.prepare(`
    UPDATE candidate_communications
    SET updated_at = ?, status = ?, provider = ?, provider_response_json = ?, error = ?, sent_at = ?, payload_json = ?
    WHERE id = ?
  `).run(
    next.updatedAt,
    String(next.status || "pending"),
    String(next.provider || ""),
    json(next.providerResponse || {}),
    String(next.error || ""),
    next.sentAt || null,
    json(next.payload || {}),
    id
  );
  return getCommunication(id);
}

function listCommunicationsByCandidate(candidateId) {
  return db.prepare("SELECT * FROM candidate_communications WHERE candidate_id = ? ORDER BY created_at DESC").all(String(candidateId || "")).map(rowToCommunication);
}

function listCommunications(limit = 200) {
  return db.prepare("SELECT * FROM candidate_communications ORDER BY created_at DESC LIMIT ?").all(Math.max(1, Math.min(500, Number(limit) || 200))).map(rowToCommunication);
}

function rowToTelegramLink(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    candidateId: row.candidate_id,
    vacancyCode: row.vacancy_code,
    telegramUserId: row.telegram_user_id,
    chatId: row.chat_id,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    status: row.status,
    payload: parseJson(row.payload_json, {})
  };
}

function getTelegramLinkByCandidate(candidateId) {
  const row = db.prepare("SELECT * FROM candidate_telegram_links WHERE candidate_id = ?").get(String(candidateId || ""));
  return row ? rowToTelegramLink(row) : null;
}

function upsertTelegramLink(record) {
  const now = new Date().toISOString();
  const candidateId = String(record.candidateId || "");
  const current = getTelegramLinkByCandidate(candidateId);
  if (current) {
    db.prepare(`
      UPDATE candidate_telegram_links
      SET updated_at = ?, vacancy_code = ?, telegram_user_id = ?, chat_id = ?, username = ?,
        first_name = ?, last_name = ?, status = ?, payload_json = ?
      WHERE candidate_id = ?
    `).run(
      now,
      String(record.vacancyCode || current.vacancyCode || ""),
      String(record.telegramUserId || current.telegramUserId || ""),
      String(record.chatId || current.chatId || ""),
      String(record.username || current.username || ""),
      String(record.firstName || current.firstName || ""),
      String(record.lastName || current.lastName || ""),
      String(record.status || current.status || "linked"),
      json({ ...(current.payload || {}), ...(record.payload || {}) }),
      candidateId
    );
    return getTelegramLinkByCandidate(candidateId);
  }
  const id = record.id || crypto.randomUUID();
  db.prepare(`
    INSERT INTO candidate_telegram_links (
      id, created_at, updated_at, candidate_id, vacancy_code, telegram_user_id, chat_id,
      username, first_name, last_name, status, payload_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    now,
    now,
    candidateId,
    String(record.vacancyCode || ""),
    String(record.telegramUserId || ""),
    String(record.chatId || ""),
    String(record.username || ""),
    String(record.firstName || ""),
    String(record.lastName || ""),
    String(record.status || "linked"),
    json(record.payload || {})
  );
  return getTelegramLinkByCandidate(candidateId);
}

module.exports = {
  initDb,
  getConfig,
  saveConfig,
  getQuestionnaireConfig,
  saveQuestionnaireConfig,
  listUsers,
  createUser,
  updateUser,
  userCanAccessVacancy,
  allowedVacancyCodes,
  listHiringRequests,
  createHiringRequest,
  updateHiringRequest,
  listVacancyOpenings,
  createVacancyOpening,
  updateVacancyOpening,
  getVacancyOpening,
  listHhVacancyTexts,
  createHhVacancyText,
  getHhVacancyText,
  listHhPublications,
  createHhPublication,
  getHhPublication,
  updateHhPublication,
  getHhIntegrationAccount,
  saveHhIntegrationAccount,
  disconnectHhIntegrationAccount,
  publicHhAccount,
  upsertHhResponse,
  getHhResponse,
  listHhResponses,
  markHhQuestionnaireSent,
  registerHhWebhookEvent,
  markHhWebhookEventProcessed,
  createCommunication,
  updateCommunication,
  listCommunicationsByCandidate,
  listCommunications,
  upsertTelegramLink,
  getTelegramLinkByCandidate,
  insertAuditLog,
  listAuditLogs,
  insertSubmission,
  updateTestAssignment,
  updateInterview,
  insertEvent,
  listEvents,
  listSubmissions,
  listSubmissionsByVacancy,
  getSubmission,
  deleteSubmission,
  authenticate,
  createSession,
  findSession,
  deleteSession
};
