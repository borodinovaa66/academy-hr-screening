const crypto = require("crypto");
const { REQUIRED_FUNNEL_ARTIFACTS } = require("./funnelLifecycle");
const { canReadFunnel, getFunnel } = require("./funnelStore");

const CRITERIA_VERSION = "six-materials-v1-2026-09-15";
const criteria = Object.fromEntries(Object.entries({
  role_profile: ["П", 12], headhunter_vacancy: ["Х", 12], questionnaire: ["А", 12],
  test_assignment: ["Т", 12], recruiter_interview: ["Р", 12], hiring_manager_interview: ["Л", 14]
}).map(([type, [prefix, count]]) => [type, Array.from({ length: count }, (_, index) => `${prefix}-${String(index + 1).padStart(2, "0")}`)]));
const managerEditable = new Set(["role_profile", "headhunter_vacancy", "hiring_manager_interview"]);
const defaultApprovalGroups = {
  role_profile: [["owner", "hiring_manager"]],
  headhunter_vacancy: [["owner", "hr", "hiring_manager"]],
  questionnaire: [["owner", "hr"]],
  test_assignment: [["owner", "hr", "hiring_manager"]],
  recruiter_interview: [["owner", "hr"]],
  hiring_manager_interview: [["owner", "hiring_manager"]]
};

function fail(status, code, message, details = {}) {
  const error = new Error(message);
  Object.assign(error, { status, code, details });
  throw error;
}

function migrateArtifactWorkflow(db) {
  db.exec("SAVEPOINT artifact_workflow_schema");
  try {
    const columns = db.prepare("PRAGMA table_info(funnel_artifacts)").all().map(row => row.name);
    if (!columns.includes("profile_version")) db.exec("ALTER TABLE funnel_artifacts ADD COLUMN profile_version INTEGER");
    db.exec(`
      CREATE TABLE IF NOT EXISTS funnel_artifact_approvals (
        id TEXT PRIMARY KEY,
        artifact_id TEXT NOT NULL REFERENCES funnel_artifacts(id),
        review_cycle INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        role TEXT NOT NULL,
        approved_at TEXT NOT NULL,
        criteria_version TEXT NOT NULL,
        checks_json TEXT NOT NULL,
        comment TEXT NOT NULL,
        UNIQUE(artifact_id, review_cycle, user_id)
      );
      CREATE TABLE IF NOT EXISTS funnel_artifact_operations (
        user_id TEXT NOT NULL,
        idempotency_key TEXT NOT NULL,
        request_hash TEXT NOT NULL,
        response_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY(user_id, idempotency_key)
      );
    `);
    if (!columns.includes("review_cycle")) db.exec("ALTER TABLE funnel_artifacts ADD COLUMN review_cycle INTEGER NOT NULL DEFAULT 0");
    db.exec("RELEASE artifact_workflow_schema");
  } catch (error) {
    db.exec("ROLLBACK TO artifact_workflow_schema; RELEASE artifact_workflow_schema");
    throw error;
  }
}

function actorFromSession(db, session) {
  const row = session?.userId && db.prepare("SELECT id, username, role, active, vacancy_access_json FROM users WHERE id = ?").get(session.userId);
  if (!row || row.active !== 1) fail(403, "human_required", "Требуется действующая учётная запись сотрудника.");
  // Do not use legacy normalizeRole: it maps unknown/service roles to HR.
  if (!["owner", "hr", "hiring_manager"].includes(row.role) || /^(system|ai):/i.test(row.id) || /^(system|ai):/i.test(row.username)) {
    fail(403, "human_required", "Системные и ИИ-аккаунты не могут выполнять эти действия.");
  }
  return { id: row.id, username: row.username, role: row.role, active: true, vacancyAccess: JSON.parse(row.vacancy_access_json || "[]") };
}

function currentArtifact(db, funnelId, type) {
  return db.prepare("SELECT * FROM funnel_artifacts WHERE funnel_id = ? AND artifact_type = ? ORDER BY version DESC LIMIT 1").get(funnelId, type);
}

function approvalGroups(db, type, { required = true } = {}) {
  const stored = db.prepare("SELECT value_json FROM configs WHERE key = 'funnel_approval_policy'").get();
  let policy;
  try { policy = stored ? JSON.parse(stored.value_json) : defaultApprovalGroups; }
  catch {
    if (!required) return null;
    fail(409, "invalid_approval_policy", "Матрица утверждения повреждена. Обратитесь к владельцу.");
  }
  const groups = policy?.[type];
  if (!Array.isArray(groups) || groups.length !== 1 || groups.some(group => !Array.isArray(group) || !group.length || group.some(role => !["owner", "hr", "hiring_manager"].includes(role)))) {
    if (!required) return null;
    fail(409, "invalid_approval_policy", "Матрица утверждения не настроена. Обратитесь к владельцу.");
  }
  return groups;
}

function nonempty(content) {
  if (typeof content === "string") return content.trim().length > 0;
  if (Array.isArray(content)) return content.some(nonempty);
  if (content && typeof content === "object") return Object.values(content).some(nonempty);
  return typeof content === "number" || content === true;
}

function validateChecks(type, payload, actor) {
  if (payload.criteriaVersion !== CRITERIA_VERSION || !Array.isArray(payload.checks)) {
    fail(400, "criteria_required", "Заполните проверку всех критериев текущей версии методики.");
  }
  const required = criteria[type];
  const ids = payload.checks.map(check => check?.id);
  if (ids.length !== required.length || new Set(ids).size !== ids.length || required.some(id => !ids.includes(id))) {
    fail(400, "criteria_incomplete", "Нужна отдельная отметка для каждого критерия без пропусков и дублей.", { requiredCriteria: required });
  }
  for (const check of payload.checks) {
    if (!["passed", "not_applicable"].includes(check.result)) fail(409, "criteria_not_passed", "Нельзя утвердить материал с непройденным критерием.");
    if (check.result === "not_applicable" && (typeof check.reason !== "string" || !check.reason.trim())) {
      fail(400, "criteria_reason_required", "Для неприменимого критерия нужно обоснование.");
    }
  }
  if (type === "test_assignment" && actor.role !== "hiring_manager") {
    const confirmation = payload.checks.find(check => check.id === "Т-12")?.lprConfirmation;
    if (!confirmation || typeof confirmation.name !== "string" || !confirmation.name.trim() || !Number.isFinite(Date.parse(confirmation.confirmedAt))) {
      fail(400, "lpr_confirmation_required", "Укажите в Т-12, кто из руководителей и когда подтвердил профессиональную уместность задания.");
    }
  }
}

function readCurrentArtifact(db, session, funnelId, type) {
  const actor = actorFromSession(db, session);
  if (!REQUIRED_FUNNEL_ARTIFACTS.includes(type)) fail(404, "artifact_not_found", "Материал не найден.");
  const funnel = getFunnel(db, funnelId, actor);
  if (!funnel) fail(404, "funnel_not_found", "Воронка не найдена или недоступна.");
  const artifact = currentArtifact(db, funnelId, type);
  const groups = approvalGroups(db, type, { required: false });
  return {
    funnelVersion: funnel.version,
    artifact: funnel.artifacts.find(item => item.type === type),
    profileVersion: artifact?.profile_version ?? null,
    reviewCycle: artifact?.review_cycle ?? 0,
    criteriaVersion: CRITERIA_VERSION, requiredCriteria: criteria[type],
    approvalGroups: groups || [], approvalPolicyValid: Boolean(groups),
    approvals: artifact ? db.prepare(`SELECT user_id AS userId, username, role, approved_at AS approvedAt, criteria_version AS criteriaVersion,
      checks_json AS checksJson, comment FROM funnel_artifact_approvals WHERE artifact_id = ? AND review_cycle = ? ORDER BY approved_at, id`)
      .all(artifact.id, artifact.review_cycle).map(({ checksJson, ...item }) => ({ ...item, checks: JSON.parse(checksJson),
        valid: artifact.approval_status === "approved" && artifact.approved_version === artifact.version })) : []
  };
}

function mutateArtifact(db, session, funnelId, type, action, payload, idempotencyKey) {
  const actor = actorFromSession(db, session);
  if (!REQUIRED_FUNNEL_ARTIFACTS.includes(type)) fail(404, "artifact_not_found", "Материал не найден.");
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) fail(400, "invalid_payload", "Нужен объект с данными материала.");
  const identityFields = ["actor", "actorType", "role", "userId", "approvedByUserId", "approvedByRole", "approvedVersion", "approvalStatus", "approvedAt", "source", "createdByUserId"];
  if (identityFields.some(key => Object.hasOwn(payload, key))) fail(403, "actor_override_forbidden", "Автор и проверяющий определяются по входу в систему, а не из запроса.");
  const allowed = ["funnelVersion", "artifactVersion", "comment", ...(action === "save" ? ["content", "profileVersion"] : action === "approve" ? ["criteriaVersion", "checks"] : [])];
  if (Object.keys(payload).some(key => !allowed.includes(key))) fail(400, "unknown_fields", "В запросе есть неподдерживаемые поля.");
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey || "")) fail(400, "idempotency_key_required", "Нужен уникальный ключ операции Idempotency-Key.");
  if (!Number.isSafeInteger(payload.funnelVersion) || payload.funnelVersion < 1 || !Number.isSafeInteger(payload.artifactVersion) || payload.artifactVersion < 0) {
    fail(400, "version_required", "Укажите версии воронки и материала, которые вы редактируете.");
  }
  const hash = crypto.createHash("sha256").update(JSON.stringify({ funnelId, type, action, payload })).digest("hex");
  db.exec("SAVEPOINT artifact_mutation");
  try {
    const opening = db.prepare("SELECT * FROM vacancy_openings WHERE id = ?").get(funnelId);
    if (!opening || !canReadFunnel(actor, opening)) fail(404, "funnel_not_found", "Воронка не найдена или недоступна.");
    if (actor.role === "hiring_manager" && ["save", "submit"].includes(action) && !managerEditable.has(type)) {
      fail(403, "artifact_forbidden", "Для этого материала доступно чтение и возврат с комментарием.");
    }
    const groups = action === "approve" ? approvalGroups(db, type) : null;
    if (action === "approve" && actor.role !== "owner" && !groups.some(group => group.includes(actor.role))) fail(403, "approval_forbidden", "Ваша роль не может утверждать этот материал.");
    const replay = db.prepare("SELECT * FROM funnel_artifact_operations WHERE user_id = ? AND idempotency_key = ?").get(actor.id, idempotencyKey);
    if (replay) {
      if (replay.request_hash !== hash) fail(409, "idempotency_conflict", "Этот ключ операции уже использован с другими данными.");
      db.exec("RELEASE artifact_mutation");
      return JSON.parse(replay.response_json);
    }
    if (["closed", "archived"].includes(opening.manual_status)) fail(409, "funnel_read_only", "Закрытая или архивная воронка доступна только для чтения.");
    const current = currentArtifact(db, funnelId, type);
    if (opening.version !== payload.funnelVersion || (current?.version || 0) !== payload.artifactVersion) {
      fail(409, "version_conflict", "Материал уже изменён. Загрузите свежую версию.", { funnelVersion: opening.version, artifactVersion: current?.version || 0 });
    }
    const now = new Date().toISOString();
    let nextVersion = current?.version || 0;
    const audit = (event, details) => db.prepare(`INSERT INTO audit_logs
      (id, created_at, user_id, username, role, action, target_type, target_id, vacancy_code, payload_json)
      VALUES (?, ?, ?, ?, ?, ?, 'funnel', ?, ?, ?)`).run(crypto.randomUUID(), now, actor.id, actor.username, actor.role,
      event, funnelId, opening.vacancy_code, JSON.stringify({ funnelId, artifactType: type, version: nextVersion, ...details }));
    const comment = typeof payload.comment === "string" ? payload.comment.trim() : "";
    if (comment.length > 8000) fail(400, "comment_too_long", "Комментарий слишком длинный.");
    if (action === "save") {
      if (!["string", "object"].includes(typeof payload.content) || !nonempty(payload.content)) fail(400, "content_required", "Нужен непустой текст или структура материала.");
      const encoded = JSON.stringify(payload.content);
      if (Buffer.byteLength(encoded) > 500000) fail(400, "content_too_large", "Материал превышает допустимый размер.");
      const profile = currentArtifact(db, funnelId, "role_profile");
      const profileVersion = type === "role_profile" ? null : payload.profileVersion ?? profile?.version ?? null;
      if (profileVersion !== null && (!Number.isSafeInteger(profileVersion) || profileVersion < 1 || profileVersion !== profile?.version)) {
        fail(409, "profile_version_conflict", "Указана неактуальная версия профиля должности.");
      }
      nextVersion++;
      db.prepare(`INSERT INTO funnel_artifacts (id, funnel_id, artifact_type, version, content_json, content_hash, source,
        created_by_user_id, created_at, updated_at, profile_version) VALUES (?, ?, ?, ?, ?, ?, 'human', ?, ?, ?, ?)`)
        .run(crypto.randomUUID(), funnelId, type, nextVersion, encoded, crypto.createHash("sha256").update(encoded).digest("hex"), actor.id, now, now, profileVersion);
      audit("funnel.artifact.save", { previousVersion: current?.version || null, previousApprovalStatus: current?.approval_status || null, profileVersion });
    } else {
      if (!current) fail(404, "artifact_not_found", "Сначала сохраните материал.");
      if (action === "submit") {
        if (!["draft", "rejected"].includes(current.approval_status)) fail(409, "invalid_transition", "На проверку можно передать черновик или возвращённый материал.");
        if (!nonempty(JSON.parse(current.content_json))) fail(409, "content_required", "Нельзя отправить пустой материал на проверку.");
        db.prepare("UPDATE funnel_artifacts SET approval_status = 'review', review_cycle = review_cycle + 1, updated_at = ?, review_comment = ? WHERE id = ?").run(now, comment, current.id);
      } else if (action === "reject") {
        if (!comment) fail(400, "comment_required", "Укажите причину возврата.");
        if (!["review", "approved"].includes(current.approval_status)) fail(409, "invalid_transition", "Вернуть можно материал на проверке или утверждённый материал.");
        db.prepare(`UPDATE funnel_artifacts SET approval_status = 'rejected', approved_version = NULL, approved_by_user_id = NULL,
          approved_by_role = NULL, approved_at = NULL, review_comment = ?, updated_at = ? WHERE id = ?`).run(comment, now, current.id);
      } else if (action === "approve") {
        if (current.approval_status !== "review") fail(409, "invalid_transition", "Утверждать можно только материал, переданный на проверку.");
        validateChecks(type, payload, actor);
        if (!comment) fail(400, "comment_required", "Укажите, что подтверждено при проверке материала.");
        if (type !== "role_profile") {
          const profile = currentArtifact(db, funnelId, "role_profile");
          if (!profile || profile.approval_status !== "approved" || profile.approved_version !== profile.version || current.profile_version !== profile.version) {
            fail(409, "profile_not_approved", "Материал должен опираться на текущую утверждённую версию профиля должности. Сохраните актуальную версию материала.");
          }
        }
        const previous = db.prepare("SELECT * FROM funnel_artifact_approvals WHERE artifact_id = ? AND review_cycle = ?").all(current.id, current.review_cycle);
        if (previous.some(item => item.user_id === actor.id)) fail(409, "already_reviewed", "Вы уже подтвердили эту версию. Требуется другой проверяющий.");
        db.prepare(`INSERT INTO funnel_artifact_approvals (id, artifact_id, review_cycle, user_id, username, role, approved_at, criteria_version, checks_json, comment)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(crypto.randomUUID(), current.id, current.review_cycle, actor.id, actor.username, actor.role, now, CRITERIA_VERSION, JSON.stringify(payload.checks), comment);
        db.prepare(`UPDATE funnel_artifacts SET approval_status = ?, approved_version = ?, approved_by_user_id = ?, approved_by_role = ?,
          approved_at = ?, review_comment = ?, updated_at = ? WHERE id = ?`).run("approved", current.version,
          actor.id, actor.role, now, comment, now, current.id);
      } else fail(404, "action_not_found", "Действие не найдено.");
      audit(`funnel.artifact.${action}`, { previousApprovalStatus: current.approval_status, comment, criteriaVersion: action === "approve" ? CRITERIA_VERSION : undefined });
    }
    if (type === "role_profile" && ["save", "reject"].includes(action)) {
      const dependents = db.prepare(`SELECT a.* FROM funnel_artifacts a WHERE a.funnel_id = ? AND a.artifact_type != 'role_profile'
        AND a.version = (SELECT MAX(b.version) FROM funnel_artifacts b WHERE b.funnel_id = a.funnel_id AND b.artifact_type = a.artifact_type)
        AND a.approval_status IN ('approved', 'review')`).all(funnelId);
      for (const dependent of dependents) {
        db.prepare(`UPDATE funnel_artifacts SET approval_status = 'draft', approved_version = NULL, approved_by_user_id = NULL,
          approved_by_role = NULL, approved_at = NULL, updated_at = ? WHERE id = ?`).run(now, dependent.id);
        audit("funnel.artifact.approval_invalidated", { artifactType: dependent.artifact_type, version: dependent.version, reason: "profile_changed", previousApprovedBy: dependent.approved_by_user_id });
      }
    }
    db.prepare("UPDATE vacancy_openings SET version = version + 1, updated_at = ? WHERE id = ? AND version = ?").run(now, funnelId, opening.version);
    const response = readCurrentArtifact(db, session, funnelId, type);
    db.prepare("INSERT INTO funnel_artifact_operations VALUES (?, ?, ?, ?, ?)").run(actor.id, idempotencyKey, hash, JSON.stringify(response), now);
    db.exec("RELEASE artifact_mutation");
    return response;
  } catch (error) {
    db.exec("ROLLBACK TO artifact_mutation; RELEASE artifact_mutation");
    throw error;
  }
}

module.exports = { migrateArtifactWorkflow, readCurrentArtifact, mutateArtifact, CRITERIA_VERSION, criteria, actorFromSession };
