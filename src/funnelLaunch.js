const crypto = require("crypto");
const { actorFromSession } = require("./funnelArtifacts");
const { REQUIRED_FUNNEL_ARTIFACTS, artifactState } = require("./funnelLifecycle");

const digest = value => crypto.createHash("sha256").update(value).digest("hex");
function fail(status, code, message, details = {}) {
  throw Object.assign(new Error(message), { status, code, details });
}
function atomic(db, work) {
  db.exec("SAVEPOINT funnel_launch");
  try { const value = work(); db.exec("RELEASE funnel_launch"); return value; }
  catch (error) { db.exec("ROLLBACK TO funnel_launch; RELEASE funnel_launch"); throw error; }
}

function migrateFunnelLaunch(db) {
  atomic(db, () => db.exec(`
    CREATE TABLE IF NOT EXISTS funnel_launch_operations (
      id TEXT PRIMARY KEY, funnel_id TEXT NOT NULL REFERENCES vacancy_openings(id),
      channel_id TEXT NOT NULL REFERENCES funnel_channels(id), channel_type TEXT NOT NULL,
      user_id TEXT NOT NULL, username TEXT NOT NULL, role TEXT NOT NULL,
      idempotency_key TEXT NOT NULL, request_hash TEXT NOT NULL,
      snapshot_hash TEXT NOT NULL, pending_version INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending','active','failed')),
      result_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, completed_at TEXT,
      UNIQUE(user_id, idempotency_key)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS funnel_launch_pending ON funnel_launch_operations(funnel_id, channel_type) WHERE status = 'pending';
    CREATE TABLE IF NOT EXISTS funnel_showcase_publications (
      funnel_id TEXT PRIMARY KEY REFERENCES vacancy_openings(id), vacancy_code TEXT NOT NULL UNIQUE,
      operation_id TEXT NOT NULL REFERENCES funnel_launch_operations(id), title TEXT NOT NULL, url TEXT NOT NULL,
      snapshot_hash TEXT NOT NULL, snapshot_json TEXT NOT NULL, activated_at TEXT NOT NULL
    );
  `));
}

function launchReadiness(db, funnelId) {
  const rows = db.prepare(`SELECT a.* FROM funnel_artifacts a WHERE a.funnel_id = ? AND a.version =
    (SELECT MAX(b.version) FROM funnel_artifacts b WHERE b.funnel_id = a.funnel_id AND b.artifact_type = a.artifact_type)`)
    .all(funnelId);
  const profile = rows.find(row => row.artifact_type === "role_profile");
  const blockers = [];
  for (const type of REQUIRED_FUNNEL_ARTIFACTS) {
    const row = rows.find(item => item.artifact_type === type);
    let reason = "";
    if (!row) reason = "missing";
    else {
      const state = artifactState({ content: JSON.parse(row.content_json), version: row.version, generationStatus: row.generation_status,
        approvalStatus: row.approval_status, approvedVersion: row.approved_version, approvedByUserId: row.approved_by_user_id, approvedAt: row.approved_at });
      if (state !== "approved") reason = "not_approved";
      else if (digest(row.content_json) !== row.content_hash) reason = "content_hash_mismatch";
      else if (!["owner", "hr", "hiring_manager"].includes(row.approved_by_role) || /^(system|ai):/i.test(row.approved_by_user_id)) reason = "human_approval_required";
      else if (!db.prepare(`SELECT 1 FROM funnel_artifact_approvals WHERE artifact_id = ? AND review_cycle = ?
        AND user_id = ? AND role = ? AND approved_at = ?`).get(row.id, row.review_cycle, row.approved_by_user_id, row.approved_by_role, row.approved_at)) reason = "human_approval_required";
      else if (type !== "role_profile" && (!profile || row.profile_version !== profile.version)) reason = "profile_version_mismatch";
    }
    if (reason) blockers.push({ type, reason, version: row?.version || null });
  }
  const snapshot = REQUIRED_FUNNEL_ARTIFACTS.map(type => rows.find(row => row.artifact_type === type) || null);
  return { ready: blockers.length === 0, blockers, snapshot, hash: digest(JSON.stringify(snapshot)) };
}

function audit(db, operation, action, payload) {
  db.prepare(`INSERT INTO audit_logs (id, created_at, user_id, username, role, action, target_type, target_id, payload_json)
    VALUES (?, ?, ?, ?, ?, ?, 'funnel', ?, ?)`).run(crypto.randomUUID(), new Date().toISOString(), operation.user_id,
      operation.username, operation.role, action, operation.funnel_id, JSON.stringify({ funnelId: operation.funnel_id,
        operationId: operation.id, channelId: operation.channel_id, channel: operation.channel_type, ...payload }));
}

function configForRole(db, code) {
  const stored = db.prepare("SELECT value_json FROM configs WHERE key = 'questionnaire'").get();
  const config = stored ? JSON.parse(stored.value_json) : {};
  return config.vacancies ? config.vacancies[code] : code === (config.vacancyCode || "smm") ? config : null;
}

function incompatibleShowcaseMaterials(db, opening, snapshot) {
  const config = configForRole(db, opening.vacancy_code);
  if (!config) return ["questionnaire", "test_assignment"];
  const material = type => JSON.parse(snapshot.find(row => row?.artifact_type === type)?.content_json || "null");
  const questionnaire = material("questionnaire");
  const incompatible = [];
  if (JSON.stringify(questionnaire) !== JSON.stringify({ questions: config.questions, labels: config.labels, scoring: config.scoring })) incompatible.push("questionnaire");
  if (JSON.stringify(material("test_assignment")) !== JSON.stringify(config.testAssignment)) incompatible.push("test_assignment");
  return incompatible;
}

function localShowcaseAdapter(db) {
  return async context => {
    const incompatibleMaterials = incompatibleShowcaseMaterials(db, context.opening, context.snapshot);
    if (incompatibleMaterials.length) {
      return { ok: false, code: "showcase_materials_not_compatible", incompatibleMaterials,
        message: `С действующими страницами не совпадают: ${incompatibleMaterials.map(type => type === "questionnaire" ? "анкета" : "тестовое задание").join(", ")}. Публикация не активирована.` };
    }
    return { ok: true, evidence: { operationId: context.operationId, channel: "showcase", observedAt: new Date().toISOString(),
      url: `/v/${encodeURIComponent(context.opening.vacancy_code)}`, snapshotHash: context.snapshotHash } };
  };
}

// There is deliberately no live HH transport, token reader or network call in this module.
async function disabledHeadHunterAdapter() {
  return { ok: false, code: "hh_transport_not_configured", message: "Реальное размещение HeadHunter отключено на этом этапе." };
}

function createLaunchService(db, { showcase = localShowcaseAdapter(db), headhunter = disabledHeadHunterAdapter, timeoutMs = 5000 } = {}) {
  function begin(session, funnelId, payload, key) {
    const actor = actorFromSession(db, session);
    if (!["owner", "hr"].includes(actor.role)) fail(403, "launch_forbidden", "Запуск доступен владельцу и менеджеру по персоналу.");
    if (!payload || typeof payload !== "object" || Array.isArray(payload) || Object.keys(payload).some(field => !["channel", "funnelVersion"].includes(field))) {
      fail(400, "invalid_launch_request", "Укажите только канал и версию воронки. Статус задаёт сервер.");
    }
    if (!["showcase", "headhunter"].includes(payload.channel)) fail(400, "unknown_channel", "Допустимы только витрина и HeadHunter.");
    if (!Number.isSafeInteger(payload.funnelVersion) || payload.funnelVersion < 1) fail(400, "version_required", "Укажите текущую версию воронки.");
    if (!/^[A-Za-z0-9._:-]{8,128}$/.test(key || "")) fail(400, "idempotency_key_required", "Нужен уникальный ключ операции.");
    const requestHash = digest(JSON.stringify({ funnelId, channel: payload.channel, funnelVersion: payload.funnelVersion }));
    return atomic(db, () => {
      const opening = db.prepare("SELECT * FROM vacancy_openings WHERE id = ?").get(funnelId);
      if (!opening) fail(404, "funnel_not_found", "Воронка не найдена.");
      const old = db.prepare("SELECT * FROM funnel_launch_operations WHERE user_id = ? AND idempotency_key = ?").get(actor.id, key);
      if (old) {
        if (old.request_hash !== requestHash) fail(409, "idempotency_conflict", "Этот ключ уже использован для другого запроса.");
        return { replay: JSON.parse(old.result_json) };
      }
      if (opening.version !== payload.funnelVersion) fail(409, "version_conflict", "Воронка изменилась. Загрузите свежую версию.", { funnelVersion: opening.version });
      if (opening.manual_status) fail(409, "funnel_not_launchable", "Приостановленную, закрытую или архивную воронку нельзя запустить.");
      const readiness = launchReadiness(db, funnelId);
      if (!readiness.ready) fail(409, "funnel_not_ready", "Перед запуском утвердите все шесть актуальных материалов.", { blockers: readiness.blockers });
      const channels = db.prepare("SELECT * FROM funnel_channels WHERE funnel_id = ? AND channel_type = ?").all(funnelId, payload.channel);
      if (channels.some(item => {
        const details = JSON.parse(item.payload_json || "{}");
        if (item.external_status === "pending") return true;
        return ["active", "published", "open"].includes(item.external_status) &&
          (details.adapter !== "platform_first" || details.evidence?.snapshotHash === readiness.hash);
      })) {
        fail(409, "channel_already_started", "Канал уже активен или ожидает завершения запуска.");
      }
      const previous = channels.find(item => JSON.parse(item.payload_json || "{}").adapter === "platform_first");
      const channelId = previous?.id || crypto.randomUUID();
      const operation = { id: crypto.randomUUID(), funnel_id: funnelId, channel_id: channelId, channel_type: payload.channel,
        user_id: actor.id, username: actor.username, role: actor.role };
      const now = new Date().toISOString();
      if (!previous) db.prepare("INSERT INTO funnel_channels (id, funnel_id, channel_type) VALUES (?, ?, ?)").run(channelId, funnelId, payload.channel);
      db.prepare("UPDATE funnel_channels SET status = 'pending', external_status = 'pending', last_error = '', payload_json = ? WHERE id = ?")
        .run(JSON.stringify({ adapter: "platform_first", operationId: operation.id }), channelId);
      const response = { operationId: operation.id, channelId, channel: payload.channel, status: "pending", funnelVersion: opening.version + 1 };
      db.prepare(`INSERT INTO funnel_launch_operations (id, funnel_id, channel_id, channel_type, user_id, username, role,
        idempotency_key, request_hash, snapshot_hash, pending_version, status, result_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`).run(operation.id, funnelId, channelId, payload.channel,
        actor.id, actor.username, actor.role, key, requestHash, readiness.hash, opening.version + 1, JSON.stringify(response), now);
      db.prepare("UPDATE vacancy_openings SET version = version + 1, updated_at = ? WHERE id = ?").run(now, funnelId);
      audit(db, operation, "funnel.launch.requested", { snapshotHash: readiness.hash, funnelVersion: opening.version + 1 });
      return { context: { operationId: operation.id, opening, snapshot: readiness.snapshot, snapshotHash: readiness.hash } };
    });
  }

  // Internal completion only: no HTTP endpoint accepts channel status or activation evidence.
  function complete(context, result) {
    return atomic(db, () => {
      const op = db.prepare("SELECT * FROM funnel_launch_operations WHERE id = ?").get(context.operationId);
      if (!op || op.status !== "pending") return op ? JSON.parse(op.result_json) : null;
      const opening = db.prepare("SELECT * FROM vacancy_openings WHERE id = ?").get(op.funnel_id);
      const readiness = launchReadiness(db, op.funnel_id);
      let failure = null;
      const evidence = result?.evidence;
      if (!readiness.ready || readiness.hash !== op.snapshot_hash || opening.manual_status || opening.version !== op.pending_version) {
        failure = { code: "funnel_changed_during_launch", message: "Во время запуска изменились материалы или состояние воронки. Запуск не подтверждён." };
      } else if (!result?.ok) {
        failure = { code: result?.code || "adapter_failed", message: result?.message || "Адаптер не подтвердил публикацию.",
          ...(result?.incompatibleMaterials ? { incompatibleMaterials: result.incompatibleMaterials } : {}) };
      } else if (!evidence || evidence.operationId !== op.id || evidence.channel !== op.channel_type || evidence.snapshotHash !== op.snapshot_hash ||
        !Number.isFinite(Date.parse(evidence.observedAt)) || Date.parse(evidence.observedAt) < Date.parse(op.created_at) ||
        (op.channel_type === "headhunter" && (!/^\d+$/.test(evidence.externalId || "") || evidence.archived !== false || !/^https:\/\//.test(evidence.url || ""))) ||
        (op.channel_type === "showcase" && evidence.url !== `/v/${encodeURIComponent(opening.vacancy_code)}`)) {
        failure = { code: "invalid_adapter_evidence", message: "Нет корректного подтверждения активности канала." };
      }
      if (!failure && op.channel_type === "showcase") {
        const incompatibleMaterials = incompatibleShowcaseMaterials(db, opening, readiness.snapshot);
        if (incompatibleMaterials.length) failure = { code: "showcase_materials_not_compatible", incompatibleMaterials,
          message: `Во время запуска изменились действующие страницы: ${incompatibleMaterials.map(type => type === "questionnaire" ? "анкета" : "тестовое задание").join(", ")}. Публикация не активирована.` };
      }
      if (!failure) {
        try {
          const actor = actorFromSession(db, { userId: op.user_id });
          if (!["owner", "hr"].includes(actor.role)) throw new Error("revoked");
        } catch { failure = { code: "launch_permission_revoked", message: "До завершения запуска изменились права инициатора. Канал не активирован." }; }
      }
      if (!failure && op.channel_type === "showcase") {
        const conflict = db.prepare("SELECT funnel_id FROM funnel_showcase_publications WHERE vacancy_code = ?").get(opening.vacancy_code);
        if (conflict && conflict.funnel_id !== opening.id) failure = { code: "showcase_role_conflict", message: "Для этой роли уже закреплён другой запуск на витрине." };
      }
      if (!failure && op.channel_type === "headhunter") {
        const conflict = db.prepare("SELECT id FROM funnel_channels WHERE channel_type = 'headhunter' AND external_id = ? AND id != ?").get(evidence.externalId, op.channel_id);
        if (conflict) failure = { code: "hh_publication_conflict", message: "Этот внешний номер уже связан с другим каналом." };
      }
      const now = new Date().toISOString();
      const status = failure ? "failed" : "active";
      if (!failure && op.channel_type === "showcase") {
        db.prepare(`INSERT INTO funnel_showcase_publications (funnel_id, vacancy_code, operation_id, title, url, snapshot_hash, snapshot_json, activated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(funnel_id) DO UPDATE SET operation_id = excluded.operation_id,
          title = excluded.title, url = excluded.url, snapshot_hash = excluded.snapshot_hash, snapshot_json = excluded.snapshot_json, activated_at = excluded.activated_at`)
          .run(opening.id, opening.vacancy_code, op.id, opening.title, evidence.url, op.snapshot_hash, JSON.stringify(readiness.snapshot), now);
      }
      db.prepare(`UPDATE funnel_channels SET status = ?, external_status = ?, external_id = ?, url = ?, last_synced_at = ?, last_error = ?, payload_json = ? WHERE id = ?`)
        .run(status, status, failure ? null : evidence.externalId || null, failure ? "" : evidence.url, now, failure?.message || "",
          JSON.stringify({ adapter: "platform_first", operationId: op.id, evidence: failure ? null : evidence, failure }), op.channel_id);
      db.prepare(`UPDATE vacancy_openings SET version = version + 1, updated_at = ?, last_status_sync_at = ?,
        opened_at = CASE WHEN ? = 'active' THEN COALESCE(opened_at, ?) ELSE opened_at END WHERE id = ?`).run(now, now, status, now, op.funnel_id);
      const response = { operationId: op.id, channelId: op.channel_id, channel: op.channel_type, status, funnelVersion: opening.version + 1,
        ...(failure ? { code: failure.code, error: failure.message, ...(failure.incompatibleMaterials ? { incompatibleMaterials: failure.incompatibleMaterials } : {}) } : { url: evidence.url }) };
      db.prepare("UPDATE funnel_launch_operations SET status = ?, result_json = ?, completed_at = ? WHERE id = ?").run(status, JSON.stringify(response), now, op.id);
      const completedBy = `system:${op.channel_type}-adapter`;
      audit(db, { ...op, user_id: completedBy, username: completedBy, role: "system" }, `funnel.launch.${status}`,
        { code: failure?.code || null, snapshotHash: op.snapshot_hash, initiatedByUserId: op.user_id, initiatedByRole: op.role });
      return response;
    });
  }

  async function launch(session, funnelId, payload, key) {
    const started = begin(session, funnelId, payload, key);
    if (started.replay) return started.replay;
    let timer;
    let result;
    try {
      result = await Promise.race([
        Promise.resolve().then(() => (payload.channel === "showcase" ? showcase : headhunter)(started.context)),
        new Promise(resolve => { timer = setTimeout(() => resolve({ ok: false, code: "adapter_timeout", message: "Время ожидания подтверждения истекло." }), timeoutMs); })
      ]);
    } catch {
      result = { ok: false, code: "adapter_failed", message: "Адаптер завершился с ошибкой. Публикация не подтверждена." };
    } finally { clearTimeout(timer); }
    return complete(started.context, result);
  }
  function failPendingAfterRestart() {
    for (const operation of db.prepare("SELECT id FROM funnel_launch_operations WHERE status = 'pending'").all()) {
      complete({ operationId: operation.id }, { ok: false, code: "launch_interrupted", message: "Запуск прерван перезапуском сервера; внешнее действие не повторялось." });
    }
  }
  return { launch, failPendingAfterRestart };
}

function showcasePublication(db, code) {
  const record = db.prepare(`SELECT p.*, c.status, c.external_status FROM funnel_showcase_publications p
    JOIN funnel_launch_operations o ON o.id = p.operation_id JOIN funnel_channels c ON c.id = o.channel_id WHERE p.vacancy_code = ?`).get(code);
  if (!record || record.status !== "active" || record.external_status !== "active") return null;
  const opening = db.prepare("SELECT * FROM vacancy_openings WHERE id = ?").get(record.funnel_id);
  const readiness = launchReadiness(db, opening.id);
  if (opening.manual_status || !readiness.ready || readiness.hash !== record.snapshot_hash || incompatibleShowcaseMaterials(db, opening, readiness.snapshot).length) return null;
  return record;
}

function showcaseCatalog(db) {
  const rows = db.prepare("SELECT vacancy_code FROM funnel_showcase_publications").all();
  return { managedCodes: rows.map(row => row.vacancy_code), vacancies: rows.map(row => showcasePublication(db, row.vacancy_code)).filter(Boolean)
    .map(row => ({ code: row.vacancy_code, title: row.title, url: row.url })) };
}

module.exports = { migrateFunnelLaunch, createLaunchService, launchReadiness, showcaseCatalog, showcasePublication };
