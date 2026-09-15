const crypto = require("crypto");
const { REQUIRED_FUNNEL_ARTIFACTS, resolveFunnelLifecycle } = require("./funnelLifecycle");
const LEGACY_ADAPTER_ACTOR = "system:funnel-legacy-adapter";

function parse(value, fallback = {}) {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}

function transaction(db, work) {
  db.exec("SAVEPOINT funnel_stage1");
  try {
    const result = work();
    db.exec("RELEASE funnel_stage1");
    return result;
  } catch (error) {
    db.exec("ROLLBACK TO funnel_stage1; RELEASE funnel_stage1");
    throw error;
  }
}

function migrateFunnelSchema(db) {
  transaction(db, () => {
    const columns = new Set(db.prepare("PRAGMA table_info(vacancy_openings)").all().map(row => row.name));
    const additions = {
      source: "TEXT NOT NULL DEFAULT 'platform'",
      manual_status: "TEXT NOT NULL DEFAULT '' CHECK(manual_status IN ('', 'paused', 'closed', 'archived'))",
      opened_at: "TEXT",
      closed_at: "TEXT",
      last_status_sync_at: "TEXT",
      version: "INTEGER NOT NULL DEFAULT 1 CHECK(version >= 1)"
    };
    for (const [name, definition] of Object.entries(additions)) {
      if (!columns.has(name)) db.exec(`ALTER TABLE vacancy_openings ADD COLUMN ${name} ${definition}`);
    }
    if (!columns.has("manual_status")) {
      db.exec("UPDATE vacancy_openings SET manual_status = status WHERE status IN ('paused', 'closed', 'archived')");
    }
    db.exec(`
      CREATE TABLE IF NOT EXISTS funnel_artifacts (
        id TEXT PRIMARY KEY,
        funnel_id TEXT NOT NULL REFERENCES vacancy_openings(id),
        artifact_type TEXT NOT NULL CHECK(artifact_type IN (${REQUIRED_FUNNEL_ARTIFACTS.map(type => `'${type}'`).join(",")})),
        version INTEGER NOT NULL CHECK(version >= 1),
        content_json TEXT NOT NULL,
        content_hash TEXT NOT NULL,
        generation_status TEXT NOT NULL DEFAULT 'completed',
        source TEXT NOT NULL,
        source_ref TEXT NOT NULL DEFAULT '',
        approval_status TEXT NOT NULL DEFAULT 'draft',
        approved_version INTEGER,
        created_by_user_id TEXT,
        approved_by_user_id TEXT,
        approved_by_role TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        approved_at TEXT,
        review_comment TEXT NOT NULL DEFAULT '',
        UNIQUE(funnel_id, artifact_type, version)
      );
      CREATE INDEX IF NOT EXISTS funnel_artifacts_latest ON funnel_artifacts(funnel_id, artifact_type, version DESC);
      CREATE TABLE IF NOT EXISTS funnel_channels (
        id TEXT PRIMARY KEY,
        funnel_id TEXT NOT NULL REFERENCES vacancy_openings(id),
        channel_type TEXT NOT NULL CHECK(channel_type IN ('headhunter', 'showcase')),
        status TEXT NOT NULL DEFAULT 'unknown',
        external_status TEXT NOT NULL DEFAULT 'unknown',
        external_id TEXT,
        url TEXT NOT NULL DEFAULT '',
        last_synced_at TEXT,
        last_error TEXT NOT NULL DEFAULT '',
        payload_json TEXT NOT NULL DEFAULT '{}'
      );
      CREATE UNIQUE INDEX IF NOT EXISTS funnel_channel_external ON funnel_channels(channel_type, external_id)
        WHERE channel_type = 'headhunter' AND external_id IS NOT NULL AND external_id != '';
      CREATE UNIQUE INDEX IF NOT EXISTS funnel_channel_showcase ON funnel_channels(funnel_id)
        WHERE channel_type = 'showcase';
      CREATE TABLE IF NOT EXISTS funnel_legacy_publications (
        publication_id TEXT PRIMARY KEY REFERENCES hh_publications(id),
        channel_id TEXT NOT NULL REFERENCES funnel_channels(id)
      );
    `);
    for (const table of ["submissions", "hh_responses"]) {
      const fields = db.prepare(`PRAGMA table_info(${table})`).all();
      if (!fields.some(row => row.name === "funnel_id")) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN funnel_id TEXT REFERENCES vacancy_openings(id)`);
      }
      db.exec(`CREATE INDEX IF NOT EXISTS ${table}_funnel ON ${table}(funnel_id)`);
    }
  });
}

function legacyMaterials(config, opening, texts) {
  const vacancy = config.vacancies ? config.vacancies[opening.vacancy_code] :
    (opening.vacancy_code === (config.vacancyCode || "smm") ? config : null);
  const artifacts = vacancy?.vacancyArtifacts || {};
  // Never borrow a text from a different launch of the same role.
  const text = texts.find(item => item.id === opening.hh_text_id && item.vacancy_code === opening.vacancy_code)
    || texts.find(item => item.opening_id === opening.id && item.vacancy_code === opening.vacancy_code);
  return {
    role_profile: artifacts.roleProfile ? { profile: artifacts.roleProfile, responsibilities: artifacts.responsibilities || [], requiredExperience: artifacts.requiredExperience || [] } : vacancy?.roleProfile || null,
    headhunter_vacancy: text?.body || artifacts.hhText || null,
    questionnaire: vacancy?.questions?.length ? { questions: vacancy.questions, labels: vacancy.labels, scoring: vacancy.scoring } : null,
    test_assignment: vacancy?.testAssignment || null,
    recruiter_interview: vacancy?.recruiterInterview || vacancy?.interview || null,
    hiring_manager_interview: vacancy?.hiringManagerInterview || null,
    textId: text?.id || ""
  };
}

function syncLegacyFunnels(db, config) {
  return transaction(db, () => {
    const now = new Date().toISOString();
    const openings = db.prepare("SELECT * FROM vacancy_openings ORDER BY created_at, id").all();
    const texts = db.prepare("SELECT * FROM hh_vacancy_texts ORDER BY updated_at DESC, id").all();
    const publications = db.prepare("SELECT * FROM hh_publications ORDER BY updated_at DESC, id").all();
    for (const opening of openings) {
      const payload = parse(opening.payload_json);
      if (opening.source === "platform" && payload.importedFromHeadHunter) {
        db.prepare("UPDATE vacancy_openings SET source = 'headhunter_import' WHERE id = ?").run(opening.id);
      }
      const materials = legacyMaterials(config, opening, texts);
      for (const type of REQUIRED_FUNNEL_ARTIFACTS) {
        const latest = db.prepare("SELECT * FROM funnel_artifacts WHERE funnel_id = ? AND artifact_type = ? ORDER BY version DESC LIMIT 1").get(opening.id, type);
        // Native lifecycle edits take ownership; the compatibility adapter must not overwrite them.
        if (latest && !latest.source.startsWith("legacy_")) continue;
        const content = materials[type];
        if (!latest && (content === null || content === "")) continue;
        const encoded = JSON.stringify(content);
        const hash = crypto.createHash("sha256").update(encoded).digest("hex");
        if (latest?.content_hash === hash) continue;
        const version = (latest?.version || 0) + 1;
        db.prepare(`INSERT INTO funnel_artifacts
          (id, funnel_id, artifact_type, version, content_json, content_hash, source, source_ref, created_by_user_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          crypto.randomUUID(), opening.id, type, version, encoded, hash,
          type === "headhunter_vacancy" && materials.textId ? "legacy_hh_text" : "legacy_config",
          type === "headhunter_vacancy" && materials.textId ? materials.textId : `questionnaire:${opening.vacancy_code}`,
          LEGACY_ADAPTER_ACTOR, now, now
        );
        db.prepare(`INSERT INTO audit_logs (id, created_at, user_id, username, role, action, target_type, target_id, vacancy_code, payload_json)
          VALUES (?, ?, ?, ?, 'system', 'funnel.legacy_draft', 'funnel', ?, ?, ?)`).run(
          crypto.randomUUID(), now, LEGACY_ADAPTER_ACTOR, LEGACY_ADAPTER_ACTOR, opening.id, opening.vacancy_code,
          JSON.stringify({ funnelId: opening.id, artifactType: type, version })
        );
        db.prepare("UPDATE vacancy_openings SET version = version + 1 WHERE id = ?").run(opening.id);
        if (type === "role_profile") {
          const dependent = db.prepare(`SELECT a.* FROM funnel_artifacts a WHERE a.funnel_id = ? AND a.artifact_type != 'role_profile'
            AND a.version = (SELECT MAX(b.version) FROM funnel_artifacts b WHERE b.funnel_id = a.funnel_id AND b.artifact_type = a.artifact_type)
            AND a.approval_status IN ('approved', 'review')`).all(opening.id);
          for (const item of dependent) {
            db.prepare(`UPDATE funnel_artifacts SET approval_status = 'draft', approved_version = NULL, approved_by_user_id = NULL,
              approved_by_role = NULL, approved_at = NULL, updated_at = ? WHERE id = ?`).run(now, item.id);
            db.prepare(`INSERT INTO audit_logs (id, created_at, user_id, username, role, action, target_type, target_id, vacancy_code, payload_json)
              VALUES (?, ?, ?, ?, 'system', 'funnel.artifact.approval_invalidated', 'funnel', ?, ?, ?)`).run(crypto.randomUUID(), now,
              LEGACY_ADAPTER_ACTOR, LEGACY_ADAPTER_ACTOR, opening.id, opening.vacancy_code,
              JSON.stringify({ funnelId: opening.id, artifactType: item.artifact_type, version: item.version,
                reason: "legacy_profile_changed", previousApprovedBy: item.approved_by_user_id }));
          }
        }
      }
    }
    // Only explicit legacy launch links are migrated. Orphans/conflicts stay visible as warnings.
    for (const publication of publications) {
      const candidates = openings.filter(item => item.vacancy_code === publication.vacancy_code &&
        (item.id === publication.opening_id || item.hh_publication_id === publication.id));
      const ids = [...new Set(candidates.map(item => item.id))];
      if (ids.length !== 1) continue;
      const externalId = String(publication.hh_vacancy_id || "").trim() || null;
      const existing = externalId ? db.prepare("SELECT * FROM funnel_channels WHERE channel_type = 'headhunter' AND external_id = ?").get(externalId) :
        db.prepare("SELECT c.* FROM funnel_channels c JOIN funnel_legacy_publications l ON l.channel_id = c.id WHERE l.publication_id = ?").get(publication.id);
      if (existing && existing.funnel_id !== ids[0]) continue;
      const payload = parse(publication.payload_json);
      const metrics = payload.hhMetrics || {};
      const verified = Boolean(externalId && metrics.fetchedAt && typeof metrics.archived === "boolean");
      const externalStatus = verified ? (metrics.archived ? "archived" : metrics.closedForApplicants ? "closed" : "active") : "unknown";
      const channelId = existing?.id || crypto.randomUUID();
      const channelPayload = JSON.stringify({ adapter: "legacy", publicationId: publication.id });
      let changed = false;
      if (!existing) {
        db.prepare(`INSERT INTO funnel_channels (id, funnel_id, channel_type, status, external_status, external_id, url, last_synced_at, payload_json)
          VALUES (?, ?, 'headhunter', ?, ?, ?, ?, ?, ?)`).run(channelId, ids[0], publication.status, externalStatus, externalId, publication.url, verified ? metrics.fetchedAt : null, channelPayload);
        changed = true;
      } else if (parse(existing.payload_json).adapter === "legacy" &&
        (!existing.last_synced_at || (verified && metrics.fetchedAt >= existing.last_synced_at)) &&
        (existing.status !== publication.status || existing.external_status !== externalStatus || existing.url !== publication.url || existing.last_synced_at !== (verified ? metrics.fetchedAt : null))) {
        db.prepare(`UPDATE funnel_channels SET status = ?, external_status = ?, url = ?, last_synced_at = ?, payload_json = ? WHERE id = ?`)
          .run(publication.status, externalStatus, publication.url, verified ? metrics.fetchedAt : null, channelPayload, channelId);
        changed = true;
      }
      const previousLink = db.prepare("SELECT channel_id FROM funnel_legacy_publications WHERE publication_id = ?").get(publication.id);
      db.prepare(`INSERT INTO funnel_legacy_publications (publication_id, channel_id) VALUES (?, ?)
        ON CONFLICT(publication_id) DO UPDATE SET channel_id = excluded.channel_id`).run(publication.id, channelId);
      if (previousLink && previousLink.channel_id !== channelId) {
        const remaining = db.prepare("SELECT COUNT(*) AS n FROM funnel_legacy_publications WHERE channel_id = ?").get(previousLink.channel_id).n;
        if (!remaining) {
          db.prepare("UPDATE funnel_channels SET status = 'inactive', external_status = 'inactive' WHERE id = ?").run(previousLink.channel_id);
        }
      }
      if (changed) {
        db.prepare(`INSERT INTO audit_logs (id, created_at, user_id, username, role, action, target_type, target_id, vacancy_code, payload_json)
          VALUES (?, ?, ?, ?, 'system', 'funnel.legacy_channel_sync', 'funnel', ?, ?, ?)`).run(
          crypto.randomUUID(), now, LEGACY_ADAPTER_ACTOR, LEGACY_ADAPTER_ACTOR, ids[0], publication.vacancy_code,
          JSON.stringify({ funnelId: ids[0], channelId, externalStatus, source: "legacy_adapter" }));
        db.prepare(`UPDATE vacancy_openings SET version = version + 1,
          last_status_sync_at = (SELECT MAX(last_synced_at) FROM funnel_channels WHERE funnel_id = ?) WHERE id = ?`).run(ids[0], ids[0]);
      }
    }
  });
}

function canReadFunnel(user, row) {
  if (!user || user.active === false) return false;
  if (user.role === "owner" || user.role === "hr") return true;
  if (user.role !== "hiring_manager") return false;
  if (!(user.vacancyAccess || []).includes(row.vacancy_code)) return false;
  // An explicit launch owner narrows the older, role-wide vacancy permission.
  const id = user.userId || user.id;
  if (row.hiring_manager_user_id) return row.hiring_manager_user_id === id;
  if (row.hiring_manager_username) return row.hiring_manager_username === user.username;
  return true;
}

function rowArtifact(row) {
  return {
    id: row.id, type: row.artifact_type, version: row.version,
    profileVersion: row.profile_version ?? null, reviewCycle: row.review_cycle ?? 0,
    content: parse(row.content_json, null), contentHash: row.content_hash,
    generationStatus: row.generation_status, approvalStatus: row.approval_status,
    approvedVersion: row.approved_version, approvedByUserId: row.approved_by_user_id,
    approvedByRole: row.approved_by_role, approvedAt: row.approved_at,
    createdByUserId: row.created_by_user_id, createdAt: row.created_at, updatedAt: row.updated_at,
    source: row.source, sourceRef: row.source_ref, reviewComment: row.review_comment
  };
}

function readFunnel(db, row, detail = false, user = null) {
  const artifacts = db.prepare(`SELECT a.* FROM funnel_artifacts a WHERE funnel_id = ? AND version =
    (SELECT MAX(b.version) FROM funnel_artifacts b WHERE b.funnel_id = a.funnel_id AND b.artifact_type = a.artifact_type)`)
    .all(row.id).map(rowArtifact);
  const channels = db.prepare("SELECT * FROM funnel_channels WHERE funnel_id = ? ORDER BY channel_type, id").all(row.id).map(channel => ({
    id: channel.id, type: channel.channel_type, status: channel.status, externalStatus: channel.external_status,
    externalId: channel.external_id, url: channel.url, lastSyncedAt: channel.last_synced_at, lastError: channel.last_error
  }));
  const lifecycle = resolveFunnelLifecycle({ artifacts, channels, manualStatus: row.manual_status });
  const readiness = { ...lifecycle.readiness, items: lifecycle.readiness.items.map(({ type, state }) => ({ type, state })) };
  const unlinked = db.prepare(`SELECT COUNT(*) AS count FROM hh_publications p WHERE
    (p.opening_id = ? OR p.id = ?) AND NOT EXISTS (SELECT 1 FROM funnel_legacy_publications l WHERE l.publication_id = p.id)`)
    .get(row.id, row.hh_publication_id).count;
  const payload = parse(row.payload_json);
  const result = {
    id: row.id, vacancyCode: row.vacancy_code, title: row.title, source: row.source, version: row.version,
    manualStatus: row.manual_status, legacyStatus: row.status, status: lifecycle.code,
    createdAt: row.created_at, updatedAt: row.updated_at, openedAt: row.opened_at, closedAt: row.closed_at,
    lastStatusSyncAt: row.last_status_sync_at, hiringManagerUserId: row.hiring_manager_user_id,
    hiringManagerUsername: row.hiring_manager_username, hrOwnerUserId: row.hr_owner_user_id,
    hrOwnerUsername: row.hr_owner_username, headcount: Number(payload.headcount || 1),
    readiness, channels: lifecycle.channels, activeChannels: lifecycle.activeChannels,
    canLaunch: lifecycle.canLaunch, canProcessCandidates: lifecycle.canProcessCandidates,
    candidateIntakeMode: lifecycle.candidateIntakeMode,
    candidateCounts: {
      linked: db.prepare("SELECT COUNT(*) AS count FROM submissions WHERE funnel_id = ?").get(row.id).count,
      unassignedForRole: ["owner", "hr"].includes(user?.role) ? db.prepare("SELECT COUNT(*) AS count FROM submissions WHERE vacancy_code = ? AND funnel_id IS NULL").get(row.vacancy_code).count : null,
      quarantine: null
    },
    warnings: ["legacy_candidate_processing_not_gated", ...(unlinked ? ["unresolved_publication_links"] : [])]
  };
  if (detail) {
    result.artifacts = REQUIRED_FUNNEL_ARTIFACTS.map(type => artifacts.find(item => item.type === type) || { type, version: null, content: null, approvalStatus: "missing" });
    result.history = db.prepare(`SELECT id, created_at, user_id, username, role, action, payload_json FROM audit_logs
      WHERE target_type IN ('funnel', 'vacancy_opening') AND target_id = ? ORDER BY created_at DESC, id LIMIT 200`)
      .all(row.id).map(item => ({ id: item.id, createdAt: item.created_at, userId: item.user_id,
        username: item.username, role: item.role, action: item.action, payload: parse(item.payload_json) }));
  }
  return result;
}

function listFunnels(db, user) {
  return db.prepare("SELECT * FROM vacancy_openings ORDER BY created_at DESC, id").all()
    .filter(row => canReadFunnel(user, row)).map(row => readFunnel(db, row, false, user));
}

function getFunnel(db, id, user) {
  const row = db.prepare("SELECT * FROM vacancy_openings WHERE id = ?").get(id);
  return row && canReadFunnel(user, row) ? readFunnel(db, row, true, user) : null;
}

function funnelMigrationSummary(db, user) {
  if (!user || user.active === false || !["owner", "hr"].includes(user.role)) return null;
  return {
    unlinkedPublicationCount: db.prepare(`SELECT COUNT(*) AS n FROM hh_publications p WHERE NOT EXISTS
      (SELECT 1 FROM funnel_legacy_publications l WHERE l.publication_id = p.id)`).get().n,
    unassignedSubmissionCount: db.prepare("SELECT COUNT(*) AS n FROM submissions WHERE funnel_id IS NULL").get().n,
    candidateProcessingGateImplemented: false
  };
}

module.exports = { migrateFunnelSchema, syncLegacyFunnels, listFunnels, getFunnel, canReadFunnel, funnelMigrationSummary };
