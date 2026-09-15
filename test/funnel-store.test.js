const test = require("node:test");
const assert = require("node:assert/strict");
const { DatabaseSync } = require("node:sqlite");
const { migrateFunnelSchema, syncLegacyFunnels, listFunnels, getFunnel, funnelMigrationSummary } = require("../src/funnelStore");

const owner = { id: "owner", role: "owner" };
const config = { vacancies: { role: {
  questions: [{ id: "experience", title: "Experience" }],
  testAssignment: { instruction: ["Solve a case"] }, interview: { title: "Recruiter" },
  vacancyArtifacts: { publicFunnelApproved: true, roleProfile: "Profile", hhText: "Description" }
} } };

function fixture(t) {
  const db = new DatabaseSync(":memory:");
  db.exec(`PRAGMA foreign_keys = ON;
    CREATE TABLE vacancy_openings (id TEXT PRIMARY KEY, vacancy_code TEXT, title TEXT, created_at TEXT, updated_at TEXT,
      status TEXT DEFAULT 'draft', hiring_manager_user_id TEXT, hiring_manager_username TEXT, hr_owner_user_id TEXT,
      hr_owner_username TEXT, hh_text_id TEXT, hh_publication_id TEXT, payload_json TEXT DEFAULT '{}');
    CREATE TABLE hh_vacancy_texts (id TEXT PRIMARY KEY, opening_id TEXT, vacancy_code TEXT, body TEXT, updated_at TEXT);
    CREATE TABLE hh_publications (id TEXT PRIMARY KEY, opening_id TEXT, vacancy_code TEXT, hh_vacancy_id TEXT,
      status TEXT, url TEXT, updated_at TEXT, payload_json TEXT);
    CREATE TABLE submissions (id TEXT PRIMARY KEY, vacancy_code TEXT, candidate_json TEXT);
    CREATE TABLE hh_responses (id TEXT PRIMARY KEY, vacancy_code TEXT);
    CREATE TABLE audit_logs (id TEXT PRIMARY KEY, created_at TEXT, user_id TEXT, username TEXT, role TEXT,
      action TEXT, target_type TEXT, target_id TEXT, vacancy_code TEXT, payload_json TEXT);
    INSERT INTO vacancy_openings (id, vacancy_code, title, created_at, updated_at) VALUES ('a', 'role', 'Launch A', '2026-01-01', '2026-01-01');
    INSERT INTO submissions VALUES ('s', 'role', '{"synthetic":true}');
  `);
  t.after(() => db.close());
  return db;
}

function publication(db, { id = "p", opening = "a", external = "123", metrics = {}, status = "published" } = {}) {
  db.prepare("INSERT INTO hh_publications VALUES (?, ?, 'role', ?, ?, 'https://example.test/job', '2026-01-01', ?)")
    .run(id, opening, external, status, JSON.stringify({ hhMetrics: metrics }));
}

test("additive migration and adapter are repeatable and preserve legacy rows", t => {
  const db = fixture(t);
  db.exec("UPDATE vacancy_openings SET status = 'paused'");
  const before = db.prepare("SELECT * FROM submissions").all();
  migrateFunnelSchema(db);
  syncLegacyFunnels(db, config);
  const snapshot = db.prepare("SELECT * FROM funnel_artifacts ORDER BY artifact_type").all();
  const auditCount = db.prepare("SELECT COUNT(*) AS n FROM audit_logs").get().n;
  migrateFunnelSchema(db);
  syncLegacyFunnels(db, config);
  assert.deepEqual(db.prepare("SELECT id, vacancy_code, candidate_json FROM submissions").all(), before);
  assert.deepEqual(db.prepare("SELECT * FROM funnel_artifacts ORDER BY artifact_type").all(), snapshot);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_logs").get().n, auditCount);
  const funnel = getFunnel(db, "a", owner);
  assert.equal(funnel.status, "paused");
  assert.equal(funnel.legacyStatus, "paused");
  assert.equal(funnel.readiness.createdCount, 5);
  assert.equal(funnel.readiness.approvedCount, 0);
  assert.equal(funnel.artifacts.length, 6);
  assert.equal(funnel.artifacts.find(a => a.type === "hiring_manager_interview").content, null);
  assert.equal(funnel.candidateCounts.linked, 0);
  assert.equal(funnel.candidateCounts.unassignedForRole, 1);
  assert.equal(funnel.candidateCounts.quarantine, null);
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
});

test("changed legacy content creates a draft version and does not reuse approval", t => {
  const db = fixture(t);
  migrateFunnelSchema(db);
  syncLegacyFunnels(db, config);
  db.exec("UPDATE funnel_artifacts SET approval_status = 'approved', approved_version = version, approved_by_user_id = 'human', approved_at = '2026-01-01' WHERE artifact_type = 'questionnaire'");
  assert.equal(getFunnel(db, "a", owner).readiness.approvedCount, 1);
  const next = structuredClone(config);
  next.vacancies.role.questions.push({ id: "new" });
  syncLegacyFunnels(db, next);
  const current = getFunnel(db, "a", owner).artifacts.find(a => a.type === "questionnaire");
  assert.equal(current.version, 2);
  assert.equal(current.approvalStatus, "draft");
  assert.equal(current.approvedByUserId, null);
  assert.equal(getFunnel(db, "a", owner).readiness.approvedCount, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM funnel_artifacts WHERE artifact_type = 'questionnaire'").get().n, 2);
  db.exec("UPDATE funnel_artifacts SET source = 'human' WHERE artifact_type = 'questionnaire' AND version = 2");
  syncLegacyFunnels(db, config);
  assert.equal(getFunnel(db, "a", owner).artifacts.find(a => a.type === "questionnaire").version, 2);
});

test("active HH requires saved API evidence; archive wins; external ID has only one channel", t => {
  const db = fixture(t);
  publication(db);
  publication(db, { id: "duplicate" });
  migrateFunnelSchema(db);
  syncLegacyFunnels(db, config);
  assert.equal(getFunnel(db, "a", owner).activeChannels.length, 0);
  db.prepare("UPDATE hh_publications SET payload_json = ? WHERE id = 'p'")
    .run(JSON.stringify({ hhMetrics: { fetchedAt: "2026-01-02", archived: false } }));
  syncLegacyFunnels(db, config);
  assert.equal(getFunnel(db, "a", owner).status, "external_open_blocked");
  assert.equal(getFunnel(db, "a", owner).canProcessCandidates, false);
  assert.equal(getFunnel(db, "a", owner).channels.length, 1);
  db.prepare("UPDATE hh_publications SET payload_json = ? WHERE id = 'p'")
    .run(JSON.stringify({ hhMetrics: { fetchedAt: "2026-01-03", archived: true } }));
  syncLegacyFunnels(db, config);
  assert.equal(getFunnel(db, "a", owner).activeChannels.length, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM funnel_legacy_publications").get().n, 2);
  assert.throws(() => db.prepare("INSERT INTO funnel_channels (id, funnel_id, channel_type, external_id) VALUES ('duplicate', 'a', 'headhunter', '123')").run(), /UNIQUE/);
});

test("missing roles, orphan publications and conflicting launches are not silently guessed", t => {
  const db = fixture(t);
  db.exec("INSERT INTO vacancy_openings (id, vacancy_code, title) VALUES ('b', 'role', 'B')");
  publication(db);
  publication(db, { id: "conflict", opening: "b" });
  publication(db, { id: "orphan", opening: null, external: "orphan" });
  migrateFunnelSchema(db);
  syncLegacyFunnels(db, { vacancies: {} });
  assert.equal(listFunnels(db, owner).length, 2);
  assert.equal(listFunnels(db, owner).every(f => f.readiness.createdCount === 0), true);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM funnel_channels").get().n, 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM hh_publications").get().n, 3);
  assert.equal(listFunnels(db, owner).some(f => f.warnings.includes("unresolved_publication_links")), true);
  assert.equal(funnelMigrationSummary(db, owner).unlinkedPublicationCount, 2);
  assert.equal(funnelMigrationSummary(db, { role: "hiring_manager" }), null);
});

test("changing the legacy external ID detaches the old channel instead of leaving it active", t => {
  const db = fixture(t);
  publication(db, { metrics: { fetchedAt: "2026-01-02", archived: false } });
  migrateFunnelSchema(db);
  syncLegacyFunnels(db, config);
  db.exec("UPDATE hh_publications SET hh_vacancy_id = '456'");
  syncLegacyFunnels(db, config);
  const funnel = getFunnel(db, "a", owner);
  assert.equal(funnel.activeChannels.length, 1);
  assert.equal(funnel.activeChannels[0].externalId, "456");
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM funnel_legacy_publications").get().n, 1);
});

test("text from another launch is not borrowed and template alone does not create a funnel", t => {
  const db = fixture(t);
  db.exec("INSERT INTO hh_vacancy_texts VALUES ('text', 'other', 'role', 'Other launch text', '2026-01-01')");
  migrateFunnelSchema(db);
  syncLegacyFunnels(db, { vacancies: { role: {}, unlaunched: config.vacancies.role } });
  assert.equal(listFunnels(db, owner).length, 1);
  assert.equal(getFunnel(db, "a", owner).readiness.createdCount, 0);
});

test("read permissions narrow role access when a launch has an explicit owner", t => {
  const db = fixture(t);
  db.exec("UPDATE vacancy_openings SET hiring_manager_user_id = 'manager-a'");
  migrateFunnelSchema(db);
  syncLegacyFunnels(db, config);
  assert.equal(listFunnels(db, { role: "hr" }).length, 1);
  assert.equal(listFunnels(db, { role: "hiring_manager", id: "manager-b", vacancyAccess: ["role"] }).length, 0);
  assert.equal(getFunnel(db, "a", { role: "hiring_manager", id: "manager-b", vacancyAccess: ["role"] }), null);
  assert.equal(getFunnel(db, "missing", owner), null);
  assert.equal(listFunnels(db, null).length, 0);
  assert.equal(listFunnels(db, { role: "ai" }).length, 0);
  assert.equal(listFunnels(db, { ...owner, active: false }).length, 0);
  assert.equal(getFunnel(db, "a", { role: "hiring_manager", userId: "manager-a", vacancyAccess: [] }), null);
  const manager = { role: "hiring_manager", userId: "manager-a", vacancyAccess: ["role"] };
  assert.equal(getFunnel(db, "a", manager).candidateCounts.unassignedForRole, null);
  assert.equal(JSON.stringify(listFunnels(db, owner)).includes("Solve a case"), false);
});

test("migration failure rolls back schema changes", t => {
  const db = fixture(t);
  db.exec("DROP TABLE hh_responses");
  assert.throws(() => migrateFunnelSchema(db), /no such table/);
  assert.equal(db.prepare("PRAGMA table_info(vacancy_openings)").all().some(c => c.name === "source"), false);
  assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE name = 'funnel_artifacts'").get(), undefined);
});
