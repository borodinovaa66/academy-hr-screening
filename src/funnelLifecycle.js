const REQUIRED_FUNNEL_ARTIFACTS = Object.freeze([
  "role_profile",
  "headhunter_vacancy",
  "questionnaire",
  "test_assignment",
  "recruiter_interview",
  "hiring_manager_interview"
]);

const FUNNEL_STATUSES = Object.freeze({
  ASSEMBLING: "assembling",
  REVIEW: "review",
  READY: "ready",
  OPENING: "opening",
  OPEN: "open",
  EXTERNAL_OPEN_BLOCKED: "external_open_blocked",
  PAUSED: "paused",
  CLOSED: "closed",
  ARCHIVED: "archived"
});

const ACTIVE_CHANNEL_STATUSES = new Set(["active", "open", "published"]);
const PENDING_CHANNEL_STATUSES = new Set(["pending", "requested", "publishing", "syncing"]);

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function hasArtifactContent(artifact) {
  if (!artifact) return false;
  if (artifact.contentPresent === false) return false;
  if (artifact.contentPresent === true) return true;
  if (artifact.content === null || artifact.content === undefined) return false;
  if (typeof artifact.content === "string") return artifact.content.trim().length > 0;
  if (Array.isArray(artifact.content)) return artifact.content.length > 0;
  return typeof artifact.content === "object" && Object.keys(artifact.content).length > 0;
}

function artifactState(artifact) {
  if (!artifact || !hasArtifactContent(artifact)) return "missing";
  const generationStatus = normalizeStatus(artifact.generationStatus);
  if (generationStatus === "generating") return "generating";
  if (generationStatus === "failed") return "generation_failed";

  const approval = artifact.approval || {};
  const approvalStatus = normalizeStatus(approval.status || artifact.approvalStatus);
  const currentVersion = Number(artifact.version || 1);
  const approvedVersion = Number(approval.version || artifact.approvedVersion || 0);
  const approvedBy = String(approval.approvedByUserId || approval.approvedBy || artifact.approvedByUserId || "").trim();
  const approvedAt = String(approval.approvedAt || artifact.approvedAt || "").trim();
  const actorType = normalizeStatus(approval.actorType || "human");
  if (approvalStatus === "rejected") return "rejected";
  if (approvalStatus === "approved" && approvedVersion === currentVersion && approvedBy && approvedAt && actorType !== "ai") return "approved";
  return "review";
}

function evaluateFunnelArtifacts(artifacts = []) {
  const byType = new Map((artifacts || []).map(item => [item.type, item]));
  const items = REQUIRED_FUNNEL_ARTIFACTS.map(type => {
    const artifact = byType.get(type) || null;
    return { type, state: artifactState(artifact), artifact };
  });
  const approvedCount = items.filter(item => item.state === "approved").length;
  const createdCount = items.filter(item => !["missing", "generating", "generation_failed"].includes(item.state)).length;
  return {
    items,
    total: REQUIRED_FUNNEL_ARTIFACTS.length,
    createdCount,
    approvedCount,
    readinessPercent: Math.floor((approvedCount / REQUIRED_FUNNEL_ARTIFACTS.length) * 100),
    missing: items.filter(item => item.state === "missing").map(item => item.type),
    generating: items.filter(item => item.state === "generating").map(item => item.type),
    failed: items.filter(item => item.state === "generation_failed").map(item => item.type),
    rejected: items.filter(item => item.state === "rejected").map(item => item.type),
    awaitingApproval: items.filter(item => item.state === "review").map(item => item.type),
    ready: approvedCount === REQUIRED_FUNNEL_ARTIFACTS.length
  };
}

function channelState(channel) {
  const status = normalizeStatus(channel?.externalStatus || channel?.status);
  if (ACTIVE_CHANNEL_STATUSES.has(status)) return "active";
  if (PENDING_CHANNEL_STATUSES.has(status)) return "pending";
  if (["paused", "closed", "archived", "failed"].includes(status)) return status;
  return "inactive";
}

function resolveFunnelLifecycle({ artifacts = [], channels = [], manualStatus = "" } = {}) {
  const readiness = evaluateFunnelArtifacts(artifacts);
  const normalizedManualStatus = normalizeStatus(manualStatus);
  const evaluatedChannels = (channels || []).map(channel => ({ ...channel, state: channelState(channel) }));
  const activeChannels = evaluatedChannels.filter(channel => channel.state === "active");
  const pendingChannels = evaluatedChannels.filter(channel => channel.state === "pending");

  let code;
  if (normalizedManualStatus === FUNNEL_STATUSES.ARCHIVED) code = FUNNEL_STATUSES.ARCHIVED;
  else if (normalizedManualStatus === FUNNEL_STATUSES.CLOSED) code = FUNNEL_STATUSES.CLOSED;
  else if (activeChannels.length && !readiness.ready) code = FUNNEL_STATUSES.EXTERNAL_OPEN_BLOCKED;
  else if (normalizedManualStatus === FUNNEL_STATUSES.PAUSED) code = FUNNEL_STATUSES.PAUSED;
  else if (activeChannels.length && readiness.ready) code = FUNNEL_STATUSES.OPEN;
  else if (pendingChannels.length && readiness.ready) code = FUNNEL_STATUSES.OPENING;
  else if (readiness.ready) code = FUNNEL_STATUSES.READY;
  else if (readiness.createdCount === readiness.total) code = FUNNEL_STATUSES.REVIEW;
  else code = FUNNEL_STATUSES.ASSEMBLING;

  return {
    code,
    readiness,
    channels: evaluatedChannels,
    activeChannels,
    pendingChannels,
    canLaunch: code === FUNNEL_STATUSES.READY,
    canProcessCandidates: code === FUNNEL_STATUSES.OPEN,
    candidateIntakeMode: code === FUNNEL_STATUSES.EXTERNAL_OPEN_BLOCKED ? "quarantine" : code === FUNNEL_STATUSES.OPEN ? "active" : "disabled"
  };
}

module.exports = {
  REQUIRED_FUNNEL_ARTIFACTS,
  FUNNEL_STATUSES,
  artifactState,
  evaluateFunnelArtifacts,
  channelState,
  resolveFunnelLifecycle
};
