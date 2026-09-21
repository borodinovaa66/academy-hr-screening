const test = require("node:test");
const assert = require("node:assert/strict");
const {
  REQUIRED_FUNNEL_ARTIFACTS,
  FUNNEL_STATUSES,
  evaluateFunnelArtifacts,
  resolveFunnelLifecycle
} = require("../src/funnelLifecycle");

function approvedArtifacts() {
  return REQUIRED_FUNNEL_ARTIFACTS.map(type => ({
    type,
    version: 2,
    content: { title: type },
    approval: { status: "approved", version: 2, approvedByUserId: "owner-1", approvedAt: "2026-09-15T15:00:00Z", actorType: "human" }
  }));
}

test("готовность требует шесть утвержденных актуальных артефактов", () => {
  const artifacts = approvedArtifacts();
  artifacts[0].version = 3;
  const result = evaluateFunnelArtifacts(artifacts);
  assert.equal(result.ready, false);
  assert.equal(result.approvedCount, 5);
  assert.deepEqual(result.awaitingApproval, ["role_profile"]);
});

test("флаг без личности и времени человека не считается утверждением", () => {
  const artifacts = approvedArtifacts();
  artifacts[2].approval = { status: "approved", version: 2 };
  artifacts[3].approval.actorType = "ai";
  const result = evaluateFunnelArtifacts(artifacts);
  assert.equal(result.ready, false);
  assert.equal(result.approvedCount, 4);
  assert.deepEqual(result.awaitingApproval, ["questionnaire", "test_assignment"]);
});

test("полностью утвержденная воронка без активного канала готова к запуску", () => {
  const result = resolveFunnelLifecycle({ artifacts: approvedArtifacts() });
  assert.equal(result.code, FUNNEL_STATUSES.READY);
  assert.equal(result.canLaunch, true);
  assert.equal(result.canProcessCandidates, false);
});

test("активный HeadHunter открывает только полностью готовую воронку", () => {
  const result = resolveFunnelLifecycle({
    artifacts: approvedArtifacts(),
    channels: [{ type: "headhunter", externalStatus: "active" }]
  });
  assert.equal(result.code, FUNNEL_STATUSES.OPEN);
  assert.equal(result.canProcessCandidates, true);
  assert.equal(result.candidateIntakeMode, "active");
});

test("HeadHunter-first не пропускает кандидатов в несобранную воронку", () => {
  const result = resolveFunnelLifecycle({
    artifacts: approvedArtifacts().slice(0, 2),
    channels: [{ type: "headhunter", externalStatus: "published" }]
  });
  assert.equal(result.code, FUNNEL_STATUSES.EXTERNAL_OPEN_BLOCKED);
  assert.equal(result.canProcessCandidates, false);
  assert.equal(result.candidateIntakeMode, "quarantine");
});

test("все создано, но не утверждено — воронка на проверке", () => {
  const artifacts = approvedArtifacts().map(item => ({ ...item, approval: { status: "pending", version: 2 } }));
  const result = resolveFunnelLifecycle({ artifacts });
  assert.equal(result.code, FUNNEL_STATUSES.REVIEW);
  assert.equal(result.readiness.createdCount, 6);
  assert.equal(result.readiness.approvedCount, 0);
});

test("ожидающая публикация получает отдельный статус запуска", () => {
  const result = resolveFunnelLifecycle({
    artifacts: approvedArtifacts(),
    channels: [{ type: "showcase", status: "publishing" }]
  });
  assert.equal(result.code, FUNNEL_STATUSES.OPENING);
  assert.equal(result.canProcessCandidates, false);
});

test("закрытие и архив имеют приоритет над готовностью", () => {
  assert.equal(resolveFunnelLifecycle({ artifacts: approvedArtifacts(), manualStatus: "closed" }).code, FUNNEL_STATUSES.CLOSED);
  assert.equal(resolveFunnelLifecycle({ artifacts: approvedArtifacts(), manualStatus: "archived" }).code, FUNNEL_STATUSES.ARCHIVED);
});
