const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { startFixture } = require("../test-support/funnelHttp");
const { criteria, CRITERIA_VERSION, migrateArtifactWorkflow } = require("../src/funnelArtifacts");

function checks(type) {
  return { criteriaVersion: CRITERIA_VERSION, comment: "Synthetic human review", checks: criteria[type].map(id => ({
    id, result: "passed", ...(id === "Т-12" ? { lprConfirmation: { name: "Synthetic manager", confirmedAt: "2026-09-15T10:00:00Z" } } : {})
  })) };
}

async function approve(f, type, actor = f.owner) {
  assert.equal((await f.write(type, "save", { content: `Synthetic ${type}` }, actor)).status, 200);
  assert.equal((await f.write(type, "submit", {}, actor)).status, 200);
  const result = await f.write(type, "approve", checks(type), actor);
  assert.equal(result.status, 200, JSON.stringify(result.body));
  return result;
}

test("HTTP: all six current versions require human review; one approval is enough", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  await approve(f, "role_profile", f.manager);
  for (const type of Object.keys(criteria).filter(type => type !== "role_profile")) {
    const result = await approve(f, type, type === "hiring_manager_interview" ? f.manager : f.hr);
    assert.equal(result.body.artifact.approvalStatus, "approved");
    assert.equal(result.body.artifact.approvedVersion, result.body.artifact.version);
    assert.equal(result.body.approvals.length, 1);
    assert.equal(result.body.approvals[0].checks.length, criteria[type].length);
  }
  const funnel = (await f.request(`/api/admin/funnels/${f.id}`, f.owner)).body.funnel;
  assert.equal(funnel.readiness.approvedCount, 6);
  assert.equal(funnel.status, "ready");
  assert.equal(funnel.canProcessCandidates, false);
  f.withDb(db => {
    const audits = db.prepare("SELECT * FROM audit_logs WHERE action LIKE 'funnel.artifact.%'").all();
    assert.equal(audits.length, 18);
    assert.ok(audits.every(row => row.user_id && row.username && ["hr", "hiring_manager"].includes(row.role)));
    assert.ok(audits.every(row => { const p = JSON.parse(row.payload_json); return p.funnelId === f.id && p.artifactType && p.version; }));
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM hh_message_logs").get().n, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM candidate_communications").get().n, 0);
    migrateArtifactWorkflow(db);
    migrateArtifactWorkflow(db);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM funnel_artifact_approvals").get().n, 6);
    assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  });
});

test("HTTP: 401, CSRF and role 403, hidden 404, and service/AI actors cannot approve", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  const state = await f.current("role_profile");
  const payload = { funnelVersion: state.funnelVersion, artifactVersion: 0, content: "Synthetic" };
  assert.equal((await f.request(f.route("role_profile"), null, "PUT", payload)).status, 401);
  assert.equal((await f.request(f.route("role_profile"), f.owner, "PUT", payload)).status, 403);
  const headers = { "X-CSRF-Token": f.hr.csrf, "Idempotency-Key": "csrf-test-0001" };
  assert.equal((await f.request(f.route("role_profile"), f.owner, "PUT", payload, headers)).status, 403);
  assert.equal((await f.request(f.route("role_profile"), f.owner, "PUT", payload, { ...headers, "X-CSRF-Token": f.owner.csrf, "Sec-Fetch-Site": "cross-site" })).status, 403);
  assert.equal((await f.write("role_profile", "save", { content: "Draft", actorType: "ai" })).status, 403);
  assert.equal((await f.write("role_profile", "save", { content: "Draft", approvedByUserId: f.manager.user.id })).status, 403);
  assert.equal((await f.write("questionnaire", "save", { content: "Draft" }, f.manager)).status, 403);
  assert.equal((await f.write("role_profile", "save", { content: "Draft" })).status, 200);
  assert.equal((await f.write("role_profile", "submit")).status, 200);
  assert.equal((await f.write("role_profile", "approve", checks("role_profile"), f.hr)).status, 403);
  assert.equal((await f.request(`/api/admin/funnels/missing/artifacts/role_profile`, f.owner)).status, 404);
  assert.equal((await f.request(`/api/admin/funnels/${f.id}/artifacts/unknown`, f.owner)).status, 404);
  const validHeaders = { "X-CSRF-Token": f.owner.csrf, "Idempotency-Key": "missing-0001" };
  assert.equal((await f.request(`/api/admin/funnels/missing/artifacts/role_profile`, f.owner, "PUT", payload, validHeaders)).status, 404);
  f.withDb(db => db.prepare("UPDATE users SET vacancy_access_json = '[]' WHERE id = ?").run(f.manager.user.id));
  assert.equal((await f.request(f.route("role_profile"), f.manager)).status, 404);
  f.withDb(db => db.prepare("UPDATE users SET role = 'ai' WHERE id = ?").run(f.hr.user.id));
  const response = await f.request(`${f.route("role_profile")}/approve`, f.hr, "POST", {
    ...payload, ...checks("role_profile")
  }, { "X-CSRF-Token": f.hr.csrf, "Idempotency-Key": "ai-forbidden-0001" });
  assert.equal(response.status, 403);
  assert.equal(response.body.code, "human_required");
  f.withDb(db => db.prepare("UPDATE users SET role = 'hr', username = 'system:funnel-legacy-adapter' WHERE id = ?").run(f.hr.user.id));
  assert.equal((await f.request(`${f.route("role_profile")}/approve`, f.hr, "POST", payload, {
    "X-CSRF-Token": f.hr.csrf, "Idempotency-Key": "system-forbidden-0001"
  })).status, 403);
});

test("HTTP: optimistic 409 and idempotency preserve versions and audit under competing writes", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  const snapshot = await f.current("role_profile");
  const responses = await Promise.all([
    f.write("role_profile", "save", { content: "First" }, f.owner, "race-first", snapshot),
    f.write("role_profile", "save", { content: "Second" }, f.owner, "race-second", snapshot)
  ]);
  assert.deepEqual(responses.map(r => r.status).sort(), [200, 409]);
  const winning = responses[0].status === 200 ? 0 : 1;
  const version = (await f.current("role_profile")).funnelVersion;
  const replay = await f.write("role_profile", "save", { content: winning ? "Second" : "First" }, f.owner, winning ? "race-second" : "race-first", snapshot);
  assert.equal(replay.status, 200);
  assert.deepEqual(replay.body, responses[winning].body);
  assert.equal((await f.current("role_profile")).funnelVersion, version);
  assert.equal((await f.write("role_profile", "save", { content: "Different" }, f.owner, winning ? "race-second" : "race-first", snapshot)).body.code, "idempotency_conflict");
  f.withDb(db => assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'funnel.artifact.save'").get().n, 1));
});

test("HTTP: rejection needs a comment; edits and profile changes invalidate approvals", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  await approve(f, "role_profile");
  await approve(f, "questionnaire", f.hr);
  assert.equal((await f.write("questionnaire", "reject", {}, f.manager)).status, 400);
  assert.equal((await f.write("questionnaire", "reject", { comment: "Fix criteria" }, f.manager)).status, 200);
  assert.equal((await f.current("questionnaire")).artifact.approvedVersion, null);
  assert.equal((await f.write("questionnaire", "submit", {}, f.hr)).status, 200);
  assert.equal((await f.write("questionnaire", "approve", checks("questionnaire"), f.hr)).status, 200);
  const beforeEdit = await f.current("questionnaire", f.hr);
  assert.equal((await f.write("questionnaire", "save", { content: "Updated draft" }, f.hr)).status, 200);
  assert.equal((await f.write("questionnaire", "approve", checks("questionnaire"), f.hr, "stale-approval", beforeEdit)).body.code, "version_conflict");
  const draft = await f.current("questionnaire");
  assert.equal(draft.artifact.approvalStatus, "draft");
  assert.equal(draft.artifact.approvedByUserId, null);
  assert.equal(draft.artifact.approvedVersion, null);
  assert.equal((await f.write("questionnaire", "submit", {}, f.hr)).status, 200);
  assert.equal((await f.write("questionnaire", "approve", checks("questionnaire"), f.hr)).status, 200);
  assert.equal((await f.write("role_profile", "save", { content: "Changed role" })).status, 200);
  assert.equal((await f.current("questionnaire")).artifact.approvalStatus, "draft");
  assert.equal((await f.write("questionnaire", "submit", {}, f.hr)).status, 200);
  assert.equal((await f.write("questionnaire", "approve", checks("questionnaire"), f.hr)).body.code, "profile_not_approved");
  assert.equal((await f.request("/api/config?vacancy=smm")).status, 200);
  const legacy = (await f.request("/api/admin/vacancy-openings", f.owner)).body.openings[0];
  assert.equal(legacy.status, "draft");
  const old = await f.request(`/api/admin/vacancy-openings/${f.id}`, f.owner, "PUT", { status: "archived" });
  assert.equal(old.status, 200);
  assert.equal((await f.write("role_profile", "save", { content: "Attempt" })).body.code, "funnel_read_only");
});

test("HTTP: checklist is complete, failed checks block approval, T-12 records LPR confirmation", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  await f.write("role_profile", "save", { content: "Profile" });
  assert.equal((await f.write("role_profile", "approve", checks("role_profile"))).body.code, "invalid_transition");
  await f.write("role_profile", "submit");
  assert.equal((await f.write("role_profile", "approve", { comment: "Test" })).status, 400);
  const incomplete = checks("role_profile"); incomplete.checks.pop();
  assert.equal((await f.write("role_profile", "approve", incomplete)).body.code, "criteria_incomplete");
  const failed = checks("role_profile"); failed.checks[0].result = "failed";
  assert.equal((await f.write("role_profile", "approve", failed)).status, 409);
  const irrelevant = checks("role_profile"); irrelevant.checks[0].result = "not_applicable";
  assert.equal((await f.write("role_profile", "approve", irrelevant)).body.code, "criteria_reason_required");
  assert.equal((await f.write("role_profile", "approve", checks("role_profile"))).status, 200);
  await f.write("test_assignment", "save", { content: "Case" }, f.hr);
  await f.write("test_assignment", "submit", {}, f.hr);
  const noLpr = checks("test_assignment"); delete noLpr.checks.at(-1).lprConfirmation;
  assert.equal((await f.write("test_assignment", "approve", noLpr, f.hr)).body.code, "lpr_confirmation_required");
  assert.equal((await f.write("test_assignment", "approve", checks("test_assignment"), f.hr)).status, 200);
});

test("HTTP: failed audit rolls back content, version and idempotency writes", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  const before = await f.current("role_profile");
  f.withDb(db => db.exec(`CREATE TRIGGER fail_artifact_audit BEFORE INSERT ON audit_logs
    WHEN NEW.action = 'funnel.artifact.save' BEGIN SELECT RAISE(ABORT, 'synthetic audit failure'); END;`));
  assert.equal((await f.write("role_profile", "save", { content: "Must roll back" })).status, 500);
  assert.deepEqual(await f.current("role_profile"), before);
  f.withDb(db => assert.equal(db.prepare("SELECT COUNT(*) AS n FROM funnel_artifact_operations").get().n, 0));
});

test("machine checklist IDs match all 74 canonical criteria", () => {
  const source = fs.readFileSync(path.join(__dirname, "../docs/SIX_FUNNEL_ARTIFACT_ACCEPTANCE_CRITERIA_V1.md"), "utf8");
  const ids = [...source.matchAll(/^\| ([ПХАТРЛ]-\d\d) \|/gm)].map(match => match[1]);
  assert.equal(ids.length, 74);
  assert.deepEqual(Object.values(criteria).flat().sort(), ids.sort());
});

test("HTTP: configurable approval matrix fails closed on invalid/service roles", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  f.withDb(db => db.prepare("INSERT INTO configs (key, value_json, updated_at) VALUES ('funnel_approval_policy', ?, '2026-09-15')")
    .run(JSON.stringify({ role_profile: [["hr"]] })));
  await f.write("role_profile", "save", { content: "Profile" }, f.hr);
  await f.write("role_profile", "submit", {}, f.hr);
  assert.equal((await f.write("role_profile", "approve", checks("role_profile"), f.hr)).status, 200);
  f.withDb(db => db.prepare("UPDATE configs SET value_json = ? WHERE key = 'funnel_approval_policy'").run(JSON.stringify({ role_profile: [["ai"]] })));
  const response = await f.request(f.route("role_profile"), f.owner);
  assert.equal(response.status, 409);
  assert.equal(response.body.code, "invalid_approval_policy");
});
