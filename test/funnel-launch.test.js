const test = require("node:test");
const assert = require("node:assert/strict");
const { startFixture } = require("../test-support/funnelHttp");
const { createLaunchService, launchReadiness, showcaseCatalog } = require("../src/funnelLaunch");
const { CRITERIA_VERSION, criteria } = require("../src/funnelArtifacts");

async function ready(f, compatible = true) {
  const config = (await f.request("/api/config?vacancy=smm")).body.config;
  for (const type of Object.keys(criteria)) {
    let content = `Synthetic ${type}`;
    if (compatible && type === "questionnaire") content = { questions: config.questions, labels: config.labels, scoring: config.scoring };
    if (compatible && type === "test_assignment") content = config.testAssignment;
    assert.equal((await f.write(type, "save", { content })).status, 200);
    assert.equal((await f.write(type, "submit")).status, 200);
    assert.equal((await f.write(type, "approve", { criteriaVersion: CRITERIA_VERSION, comment: "Synthetic review", checks: criteria[type].map(id => ({
      id, result: "passed", ...(id === "Т-12" ? { lprConfirmation: { name: "Synthetic manager", confirmedAt: "2026-09-15" } } : {})
    })) })).status, 200);
  }
}
async function launch(f, channel, actor = f.owner, key = "launch-key-0001", extra = {}) {
  const state = await f.current("role_profile", actor);
  return f.request(`/api/admin/funnels/${f.id}/launch`, actor, "POST", { channel, funnelVersion: state.funnelVersion, ...extra },
    { "X-CSRF-Token": actor.csrf, "Idempotency-Key": key });
}
function session(actor) { return { userId: actor.user.id }; }
function fakeEvidence(context, channel = "headhunter", extra = {}) {
  return { ok: true, evidence: { operationId: context.operationId, channel, snapshotHash: context.snapshotHash,
    observedAt: new Date().toISOString(), ...(channel === "showcase" ? { url: "/v/smm" } : { externalId: "123456", archived: false, url: "https://example.test/vacancy/123456" }), ...extra } };
}

test("launch gate blocks incomplete, stale-profile, fake-human and changed-hash materials before any adapter call", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  await f.withDb(async db => {
    let calls = 0;
    const service = createLaunchService(db, { headhunter: async () => { calls++; } });
    const version = () => db.prepare("SELECT version FROM vacancy_openings WHERE id = ?").get(f.id).version;
    await assert.rejects(service.launch(session(f.owner), f.id, { channel: "headhunter", funnelVersion: version() }, "blocked-key"), e => e.code === "funnel_not_ready" && e.details.blockers.length === 6);
    assert.equal(calls, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM funnel_launch_operations").get().n, 0);
  });
  await ready(f);
  await f.withDb(async db => {
    let calls = 0;
    const service = createLaunchService(db, { headhunter: async () => { calls++; } });
    for (const [sql, reason] of [
      ["profile_version = 999", "profile_version_mismatch"],
      ["approved_by_role = 'ai'", "human_approval_required"],
      ["content_hash = 'invalid'", "content_hash_mismatch"]
    ]) {
      db.exec("SAVEPOINT corrupt");
      db.exec(`UPDATE funnel_artifacts SET ${sql} WHERE artifact_type = 'questionnaire' AND source = 'human'`);
      await assert.rejects(service.launch(session(f.owner), f.id, { channel: "headhunter", funnelVersion: db.prepare("SELECT version FROM vacancy_openings WHERE id = ?").get(f.id).version }, `blocked-${reason}`),
        e => e.code === "funnel_not_ready" && e.details.blockers.some(b => b.reason === reason));
      db.exec("ROLLBACK TO corrupt; RELEASE corrupt");
    }
    assert.equal(calls, 0);
  });
});

test("HTTP launch permissions, CSRF, unknown channel, no client activation and optimistic conflict", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  const route = `/api/admin/funnels/${f.id}/launch`;
  assert.equal((await f.request(route, null, "POST", {})).status, 401);
  assert.equal((await f.request(route, f.owner, "POST", {})).status, 403);
  assert.equal((await launch(f, "showcase", f.manager)).status, 403);
  assert.equal((await launch(f, "other")).body.code, "unknown_channel");
  assert.equal((await launch(f, "showcase", f.owner, "spoof-activation", { status: "active" })).status, 400);
  assert.equal((await launch(f, "showcase", f.owner, "wrong-version", { funnelVersion: 999 })).status, 409);
  const blocked = await launch(f, "showcase");
  assert.equal(blocked.status, 409);
  assert.equal(blocked.body.code, "funnel_not_ready");
  assert.equal(blocked.body.blockers.length, 6);
  f.withDb(db => db.prepare("UPDATE users SET role = 'ai' WHERE id = ?").run(f.hr.user.id));
  assert.equal((await f.request(route, f.hr, "POST", { channel: "showcase", funnelVersion: 1 }, {
    "X-CSRF-Token": f.hr.csrf, "Idempotency-Key": "service-attempt"
  })).status, 403);
  assert.equal((await f.request(`${route}/complete`, f.owner, "POST", { status: "active" })).status, 404);
});

test("local showcase publishes saved evidence; repeated key has no duplicate; later edit hides new listing", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  await ready(f);
  const before = await f.current("role_profile");
  const result = await launch(f, "showcase");
  assert.equal(result.body.status, "active");
  assert.equal(result.body.url, "/v/smm");
  assert.equal(result.body.funnelVersion, before.funnelVersion + 2);
  const replay = await launch(f, "showcase", f.owner, "launch-key-0001", { funnelVersion: before.funnelVersion });
  assert.deepEqual(replay.body, result.body);
  assert.equal((await f.request("/api/vacancies")).body.vacancies.filter(v => v.code === "smm").length, 1);
  f.withDb(db => {
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM funnel_showcase_publications").get().n, 1);
    const record = db.prepare("SELECT payload_json FROM funnel_channels WHERE id = ?").get(result.body.channelId);
    assert.equal(JSON.parse(record.payload_json).evidence.operationId, result.body.operationId);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_logs WHERE action LIKE 'funnel.launch.%'").get().n, 2);
    const completion = db.prepare("SELECT * FROM audit_logs WHERE action = 'funnel.launch.active'").get();
    assert.equal(completion.user_id, "system:showcase-adapter");
    assert.equal(completion.role, "system");
    assert.equal(JSON.parse(completion.payload_json).initiatedByUserId, f.owner.user.id);
  });
  assert.equal((await f.write("role_profile", "save", { content: "Changed profile" })).status, 200);
  assert.equal((await f.request("/api/vacancies")).body.vacancies.some(v => v.code === "smm"), false);
});

test("showcase incompatibility fails with both material names and leaves old runtime intact", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  const oldConfig = (await f.request("/api/config?vacancy=smm")).body.config;
  const oldCatalog = (await f.request("/api/vacancies")).body;
  await ready(f, false);
  const result = await launch(f, "showcase");
  assert.equal(result.body.status, "failed");
  assert.equal(result.body.code, "showcase_materials_not_compatible");
  assert.deepEqual(result.body.incompatibleMaterials, ["questionnaire", "test_assignment"]);
  assert.match(result.body.error, /анкета.*тестовое/);
  assert.deepEqual((await f.request("/api/config?vacancy=smm")).body.config, oldConfig);
  assert.deepEqual((await f.request("/api/vacancies")).body, oldCatalog);
  f.withDb(db => assert.equal(db.prepare("SELECT COUNT(*) AS n FROM funnel_showcase_publications").get().n, 0));
});

test("HH default is disabled; fake success and duplicate retry do not touch real HH", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  await ready(f);
  const disabled = await launch(f, "headhunter");
  assert.equal(disabled.body.status, "failed");
  assert.equal(disabled.body.code, "hh_transport_not_configured");
  await f.withDb(async db => {
    let calls = 0;
    const service = createLaunchService(db, { headhunter: async context => { calls++; return fakeEvidence(context); } });
    const payload = { channel: "headhunter", funnelVersion: db.prepare("SELECT version FROM vacancy_openings WHERE id = ?").get(f.id).version };
    const result = await service.launch(session(f.owner), f.id, payload, "fake-hh-success");
    assert.equal(result.status, "active");
    assert.deepEqual(await service.launch(session(f.owner), f.id, payload, "fake-hh-success"), result);
    assert.equal(calls, 1);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM hh_publications").get().n, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM hh_message_logs").get().n, 0);
  });
});

test("pending core state, in-flight retry and changed readiness prevent late activation", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  await ready(f);
  await f.withDb(async db => {
    let finish, calls = 0;
    const service = createLaunchService(db, { headhunter: context => { calls++; return new Promise(resolve => { finish = () => resolve(fakeEvidence(context)); }); } });
    const payload = { channel: "headhunter", funnelVersion: db.prepare("SELECT version FROM vacancy_openings WHERE id = ?").get(f.id).version };
    const pending = service.launch(session(f.owner), f.id, payload, "pending-launch");
    await new Promise(resolve => setImmediate(resolve));
    assert.equal((await f.request(`/api/admin/funnels/${f.id}`, f.owner)).body.funnel.status, "opening");
    assert.equal((await service.launch(session(f.owner), f.id, payload, "pending-launch")).status, "pending");
    assert.equal(calls, 1);
    await f.write("role_profile", "save", { content: "New role" });
    finish();
    const result = await pending;
    assert.equal(result.status, "failed");
    assert.equal(result.code, "funnel_changed_during_launch");
  });
});

test("fake adapters cannot cause active without correct evidence; error, timeout and restart fail safely", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  await ready(f);
  await f.withDb(async db => {
    let key = 0;
    for (const adapter of [async () => ({ ok: true }), async context => fakeEvidence(context, "headhunter", { archived: true }),
      async () => { throw new Error("synthetic transport error"); }, async () => new Promise(() => {})]) {
      const service = createLaunchService(db, { headhunter: adapter, timeoutMs: 15 });
      const result = await service.launch(session(f.owner), f.id, { channel: "headhunter", funnelVersion: db.prepare("SELECT version FROM vacancy_openings WHERE id = ?").get(f.id).version }, `failure-key-${++key}`);
      assert.equal(result.status, "failed");
    }
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM funnel_channels WHERE external_status = 'active'").get().n, 0);
  });
});

test("audit errors roll back start and completion; interrupted pending is failed without rerunning adapter", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  await ready(f);
  await f.withDb(async db => {
    let calls = 0;
    const service = createLaunchService(db, { showcase: async context => { calls++; return fakeEvidence(context, "showcase"); } });
    const payload = { channel: "showcase", funnelVersion: db.prepare("SELECT version FROM vacancy_openings WHERE id = ?").get(f.id).version };
    db.exec(`CREATE TRIGGER audit_failure BEFORE INSERT ON audit_logs WHEN NEW.action = 'funnel.launch.requested'
      BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END;`);
    await assert.rejects(service.launch(session(f.owner), f.id, payload, "rollback-start"));
    assert.equal(calls, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM funnel_launch_operations").get().n, 0);
    db.exec("DROP TRIGGER audit_failure");
    db.exec(`CREATE TRIGGER audit_failure BEFORE INSERT ON audit_logs WHEN NEW.action = 'funnel.launch.active'
      BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END;`);
    await assert.rejects(service.launch(session(f.owner), f.id, payload, "rollback-finish"));
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM funnel_showcase_publications").get().n, 0);
    assert.equal(db.prepare("SELECT status FROM funnel_launch_operations").get().status, "pending");
    db.exec("DROP TRIGGER audit_failure");
    service.failPendingAfterRestart();
    assert.equal(calls, 1);
    assert.equal(db.prepare("SELECT status FROM funnel_launch_operations").get().status, "failed");
    assert.deepEqual(showcaseCatalog(db).vacancies, []);
    assert.equal(launchReadiness(db, f.id).ready, true);
  });
});

test("mock showcase rechecks runtime on completion; stable compatible mock stores real local evidence", { timeout: 20000 }, async t => {
  const f = await startFixture(t);
  await ready(f);
  await f.withDb(async db => {
    const original = db.prepare("SELECT value_json FROM configs WHERE key = 'questionnaire'").get().value_json;
    const service = createLaunchService(db, { showcase: async context => {
      const config = JSON.parse(original);
      config.vacancies.smm.questions.push({ id: "changed-during-launch" });
      db.prepare("UPDATE configs SET value_json = ? WHERE key = 'questionnaire'").run(JSON.stringify(config));
      return fakeEvidence(context, "showcase");
    } });
    const payload = () => ({ channel: "showcase", funnelVersion: db.prepare("SELECT version FROM vacancy_openings WHERE id = ?").get(f.id).version });
    const failed = await service.launch(session(f.owner), f.id, payload(), "runtime-race");
    assert.equal(failed.code, "showcase_materials_not_compatible");
    assert.equal(failed.status, "failed");
    assert.deepEqual(failed.incompatibleMaterials, ["questionnaire"]);
    db.prepare("UPDATE configs SET value_json = ? WHERE key = 'questionnaire'").run(original);
    const working = createLaunchService(db, { showcase: async context => fakeEvidence(context, "showcase") });
    const result = await working.launch(session(f.owner), f.id, payload(), "showcase-fake-success");
    assert.equal(result.status, "active");
    assert.equal(showcaseCatalog(db).vacancies.length, 1);
  });
});
