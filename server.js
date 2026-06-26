const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const net = require("net");
const tls = require("tls");
const { scoreSubmission, buildFlowAnalytics } = require("./src/scoring");
const { defaultConfig } = require("./src/defaultConfig");
const {
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
} = require("./src/database");

const PORT = Number(process.env.PORT || 4173);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "hr-demo";
const ADMIN_PASSWORD_RESET = process.env.ADMIN_PASSWORD_RESET === "1";
const HR_USERNAME = process.env.HR_USERNAME || "";
const HR_PASSWORD = process.env.HR_PASSWORD || "";
const HR_PASSWORD_RESET = process.env.HR_PASSWORD_RESET === "1";
const AI_PROVIDER = process.env.AI_PROVIDER || (process.env.YANDEX_GPT_API_KEY ? "yandex" : "openai");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const YANDEX_GPT_API_KEY = process.env.YANDEX_GPT_API_KEY || "";
const YANDEX_FOLDER_ID = process.env.YANDEX_FOLDER_ID || "";
const YANDEX_GPT_MODEL = process.env.YANDEX_GPT_MODEL || "yandexgpt-lite";
const HH_CLIENT_ID = process.env.HH_CLIENT_ID || "";
const HH_CLIENT_SECRET = process.env.HH_CLIENT_SECRET || "";
const HH_REDIRECT_URI = process.env.HH_REDIRECT_URI || "https://hr.academy-management.ru/api/hh/oauth/callback";
const HH_USER_AGENT = process.env.HH_USER_AGENT || "AcademyHR/1.0 (hr@praktiki.pro)";
const HH_WEBHOOK_SECRET = process.env.HH_WEBHOOK_SECRET || "";
const HH_WEBHOOK_URL = process.env.HH_WEBHOOK_URL || (HH_WEBHOOK_SECRET ? `https://hr.academy-management.ru/api/hh/webhook?token=${encodeURIComponent(HH_WEBHOOK_SECRET)}` : "");
const HH_VACANCY_IMPORT_INTERVAL_MS = Number(process.env.HH_VACANCY_IMPORT_INTERVAL_MS || 60 * 60 * 1000);
const HH_VACANCY_AUTO_IMPORT_DISABLED = process.env.HH_VACANCY_AUTO_IMPORT_DISABLED === "1";
const HH_API_BASE = "https://api.hh.ru";
const HH_AUTH_BASE = "https://hh.ru/oauth/authorize";
const HH_TOKEN_URL = "https://hh.ru/oauth/token";
const APP_PUBLIC_URL = String(process.env.APP_PUBLIC_URL || "https://hr.academy-management.ru").replace(/\/+$/, "");
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === "1" || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || "hr@praktiki.pro";
const SMTP_ENABLED = Boolean(SMTP_HOST && SMTP_PORT && SMTP_FROM);
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_BOT_USERNAME = String(process.env.TELEGRAM_BOT_USERNAME || "").replace(/^@/, "");
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "";
const TELEGRAM_WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || (TELEGRAM_WEBHOOK_SECRET ? `${APP_PUBLIC_URL}/api/telegram/webhook?token=${encodeURIComponent(TELEGRAM_WEBHOOK_SECRET)}` : "");
const BITRIX_WEBHOOK_BASE = String(process.env.BITRIX_WEBHOOK_BASE || "").replace(/\/+$/, "");
const BITRIX_BOT_ID = process.env.BITRIX_BOT_ID || "";
const BITRIX_CLIENT_ID = process.env.BITRIX_CLIENT_ID || "";
const BITRIX_DEFAULT_DIALOG_ID = process.env.BITRIX_NOTIFY_DIALOG_ID || "";
const LEGAL_VERSION = {
  privacy: "privacy_v2",
  personalDataConsent: "personal_data_consent_v2"
};

const rootDir = __dirname;
const publicDir = path.join(rootDir, "public");
const dataDir = path.join(rootDir, "data");
const resumeUploadDir = path.join(dataDir, "uploads", "resumes");
const MAX_RESUME_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_RESUME_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

function sendJson(res, status, payload, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  res.end(JSON.stringify(payload));
}

function staticHeaders(ext) {
  const headers = { "Content-Type": mime[ext] || "application/octet-stream" };
  if ([".html", ".js", ".css", ".json"].includes(ext)) {
    headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
    headers.Pragma = "no-cache";
    headers.Expires = "0";
  }
  return headers;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 2_000_000) {
        req.destroy();
        reject(new Error("Request body is too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function readRawBody(req, limit = MAX_RESUME_UPLOAD_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", chunk => {
      size += chunk.length;
      if (size > limit) {
        req.destroy();
        reject(new Error("Файл слишком большой. Максимальный размер: 8 МБ."));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function encodeMailHeader(value) {
  const text = String(value || "");
  return /^[\x00-\x7F]*$/.test(text) ? text : `=?UTF-8?B?${Buffer.from(text, "utf8").toString("base64")}?=`;
}

function dotStuff(text) {
  return String(text || "").replace(/\r?\n/g, "\r\n").split("\r\n").map(line => line.startsWith(".") ? `.${line}` : line).join("\r\n");
}

function smtpRead(socket, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("SMTP timeout"));
    }, timeoutMs);
    function cleanup() {
      clearTimeout(timer);
      socket.off("data", onData);
      socket.off("error", onError);
    }
    function onError(error) {
      cleanup();
      reject(error);
    }
    function onData(chunk) {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1] || "";
      if (/^\d{3}\s/.test(last)) {
        cleanup();
        resolve(buffer);
      }
    }
    socket.on("data", onData);
    socket.on("error", onError);
  });
}

async function smtpCommand(socket, command, expected = /^[23]/) {
  if (command) socket.write(`${command}\r\n`);
  const response = await smtpRead(socket);
  if (!expected.test(response)) throw new Error(response.trim());
  return response;
}

function smtpConnect() {
  return new Promise((resolve, reject) => {
    const socket = SMTP_SECURE
      ? tls.connect({ host: SMTP_HOST, port: SMTP_PORT, servername: SMTP_HOST })
      : net.connect({ host: SMTP_HOST, port: SMTP_PORT });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("SMTP connection timeout"));
    }, 12000);
    socket.once("connect", () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once("secureConnect", () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once("error", error => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

async function upgradeSmtpToTls(socket) {
  return new Promise((resolve, reject) => {
    const secureSocket = tls.connect({ socket, servername: SMTP_HOST }, () => resolve(secureSocket));
    secureSocket.once("error", reject);
  });
}

async function sendSmtpMail({ to, subject, body }) {
  if (!SMTP_ENABLED) throw new Error("SMTP_NOT_CONFIGURED");
  let socket = await smtpConnect();
  try {
    await smtpCommand(socket, null);
    let ehlo = await smtpCommand(socket, `EHLO ${SMTP_HOST}`);
    if (!SMTP_SECURE && /STARTTLS/i.test(ehlo)) {
      await smtpCommand(socket, "STARTTLS");
      socket = await upgradeSmtpToTls(socket);
      ehlo = await smtpCommand(socket, `EHLO ${SMTP_HOST}`);
    }
    if (SMTP_USER && SMTP_PASSWORD) {
      await smtpCommand(socket, "AUTH LOGIN", /^334/);
      await smtpCommand(socket, Buffer.from(SMTP_USER, "utf8").toString("base64"), /^334/);
      await smtpCommand(socket, Buffer.from(SMTP_PASSWORD, "utf8").toString("base64"));
    }
    await smtpCommand(socket, `MAIL FROM:<${SMTP_FROM}>`);
    await smtpCommand(socket, `RCPT TO:<${to}>`);
    await smtpCommand(socket, "DATA", /^354/);
    const message = [
      `From: ${encodeMailHeader("Академия менеджмента")} <${SMTP_FROM}>`,
      `To: <${to}>`,
      `Subject: ${encodeMailHeader(subject)}`,
      `Date: ${new Date().toUTCString()}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      dotStuff(body),
      "."
    ].join("\r\n");
    socket.write(`${message}\r\n`);
    const response = await smtpRead(socket);
    if (!/^[23]/.test(response)) throw new Error(response.trim());
    socket.write("QUIT\r\n");
    return { response: response.trim() };
  } finally {
    socket.end();
  }
}

function candidateEmail(record) {
  return String(record?.answers?.email || record?.candidate?.email || "").trim();
}

function candidateName(record) {
  return String(record?.candidate?.fullName || record?.answers?.fullName || "кандидат").trim();
}

function testAssignmentUrl(record) {
  return `${APP_PUBLIC_URL}/v/${encodeURIComponent(record.vacancyCode || "smm")}#test/${encodeURIComponent(record.id)}`;
}

function renderEmailTemplate(eventType, record) {
  const name = candidateName(record);
  const signature = [
    "",
    "С уважением,",
    "HR-команда Бизнес-школы \"Академия менеджмента\""
  ].join("\n");
  if (eventType === "test_assignment_invite") {
    return {
      subject: "Следующий этап: тестовое задание",
      body: [
        `${name}, здравствуйте!`,
        "",
        "Спасибо за анкету. По итогам первого этапа мы готовы предложить вам показать себя в деле и выполнить небольшое тестовое задание.",
        "",
        `Перейдите по ссылке: ${testAssignmentUrl(record)}`,
        "",
        "Задание можно выполнить в Google Документе, а затем прикрепить ссылку на странице задания.",
        signature
      ].join("\n")
    };
  }
  if (eventType === "test_assignment_received") {
    return {
      subject: "Тестовое задание получено",
      body: [
        `${name}, здравствуйте!`,
        "",
        "Спасибо, мы получили ссылку на ваше тестовое задание.",
        "HR и руководитель изучат результат и вернутся с обратной связью по следующему этапу.",
        signature
      ].join("\n")
    };
  }
  return {
    subject: "Анкета получена",
    body: [
      `${name}, здравствуйте!`,
      "",
      "Спасибо, мы получили вашу анкету.",
      "HR-команда изучит ответы и вернется с обратной связью, если следующий этап будет актуален.",
      signature
    ].join("\n")
  };
}

async function queueCandidateEmail(record, eventType, payload = {}) {
  const recipient = candidateEmail(record);
  const template = renderEmailTemplate(eventType, record);
  const communication = createCommunication({
    candidateId: record.id,
    vacancyCode: record.vacancyCode,
    channel: "email",
    eventType,
    recipient,
    subject: template.subject,
    body: template.body,
    status: recipient ? "pending" : "skipped",
    provider: "smtp",
    error: recipient ? "" : "candidate_email_missing",
    payload
  });
  if (!recipient) return communication;
  if (!SMTP_ENABLED) {
    return updateCommunication(communication.id, { status: "pending", error: "SMTP_NOT_CONFIGURED" });
  }
  try {
    const providerResponse = await sendSmtpMail({ to: recipient, subject: template.subject, body: template.body });
    return updateCommunication(communication.id, {
      status: "sent",
      sentAt: new Date().toISOString(),
      error: "",
      providerResponse
    });
  } catch (error) {
    return updateCommunication(communication.id, {
      status: "failed",
      error: error.message || String(error)
    });
  }
}

function queueCandidateEmailAsync(record, eventType, payload = {}) {
  queueCandidateEmail(record, eventType, payload).catch(error => {
    console.error("Email communication failed", error);
  });
}

const DEFAULT_BITRIX_NOTIFICATION_SETTINGS = {
  enabled: false,
  provider: "im",
  dialogId: BITRIX_DEFAULT_DIALOG_ID,
  events: {
    questionnaireSubmitted: true,
    testAssignmentSubmitted: true,
    testAssignmentOverdue: false,
    interviewRecommended: true
  }
};

function getBitrixNotificationSettings() {
  const saved = getConfig("bitrixNotifications", {});
  return {
    ...DEFAULT_BITRIX_NOTIFICATION_SETTINGS,
    ...saved,
    events: {
      ...DEFAULT_BITRIX_NOTIFICATION_SETTINGS.events,
      ...(saved.events || {})
    },
    dialogId: saved.dialogId || BITRIX_DEFAULT_DIALOG_ID || "",
    provider: saved.provider || DEFAULT_BITRIX_NOTIFICATION_SETTINGS.provider
  };
}

function publicBitrixNotificationStatus() {
  const settings = getBitrixNotificationSettings();
  return {
    configured: Boolean(BITRIX_WEBHOOK_BASE),
    enabled: Boolean(settings.enabled),
    provider: settings.provider,
    dialogId: settings.dialogId,
    hasBot: Boolean(BITRIX_BOT_ID),
    events: settings.events
  };
}

function normalizeBitrixNotificationSettings(payload = {}) {
  const current = getBitrixNotificationSettings();
  const provider = ["im", "imbot"].includes(payload.provider) ? payload.provider : current.provider;
  return {
    enabled: Boolean(payload.enabled),
    provider,
    dialogId: String(payload.dialogId || "").trim(),
    events: {
      ...current.events,
      ...(payload.events || {})
    }
  };
}

async function bitrixRest(method, payload = {}) {
  if (!BITRIX_WEBHOOK_BASE) throw new Error("BITRIX_WEBHOOK_BASE_NOT_CONFIGURED");
  const response = await fetch(`${BITRIX_WEBHOOK_BASE}/${method}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || `Bitrix24 API HTTP ${response.status}`);
  }
  return data;
}

function bitrixCandidateUrl(record) {
  const vacancy = encodeURIComponent(record.vacancyCode || "smm");
  return `${APP_PUBLIC_URL}/#admin/${vacancy}/candidates`;
}

function bitrixCandidateMessage(record, eventType) {
  const candidateName = [record.candidate?.firstName, record.candidate?.lastName].filter(Boolean).join(" ") || record.candidate?.fullName || "Кандидат";
  const vacancyTitle = vacancyLabelFromConfig(record.vacancyCode);
  const score = Number.isFinite(Number(record.score?.total)) ? `${Math.round(Number(record.score.total))}/100` : "нет оценки";
  const status = record.recommendation?.label || record.recommendation?.code || "нет статуса";
  const action = eventType === "test_assignment_submitted"
    ? "прикрепил(а) тестовое задание"
    : "заполнил(а) анкету";
  return [
    `[B]Новый шаг по кандидату[/B]`,
    "",
    `${candidateName} ${action}.`,
    `Вакансия: ${vacancyTitle}`,
    `Оценка анкеты: ${score}`,
    `Статус: ${status}`,
    "",
    `[URL=${bitrixCandidateUrl(record)}]Открыть кандидатов на платформе[/URL]`
  ].join("\n");
}

async function sendBitrixNotification(record, eventType) {
  const settings = getBitrixNotificationSettings();
  const eventKey = eventType === "test_assignment_submitted" ? "testAssignmentSubmitted" : "questionnaireSubmitted";
  if (!settings.enabled || !settings.events?.[eventKey]) return null;
  const dialogId = String(settings.dialogId || "").trim();
  const communication = createCommunication({
    candidateId: record.id,
    vacancyCode: record.vacancyCode,
    channel: "bitrix24",
    eventType,
    recipient: dialogId,
    subject: "Уведомление Bitrix24",
    body: bitrixCandidateMessage(record, eventType),
    status: dialogId ? "pending" : "skipped",
    provider: settings.provider,
    error: dialogId ? "" : "bitrix_dialog_id_missing",
    payload: { settingsProvider: settings.provider }
  });
  if (!dialogId) return communication;
  try {
    const method = settings.provider === "imbot" ? "imbot.message.add" : "im.message.add";
    const providerResponse = await bitrixRest(method, {
      ...(settings.provider === "imbot" && BITRIX_BOT_ID ? { BOT_ID: Number(BITRIX_BOT_ID) } : {}),
      ...(settings.provider === "imbot" && BITRIX_CLIENT_ID ? { CLIENT_ID: BITRIX_CLIENT_ID } : {}),
      DIALOG_ID: dialogId,
      MESSAGE: communication.body,
      SYSTEM: "N",
      URL_PREVIEW: "Y"
    });
    return updateCommunication(communication.id, {
      status: "sent",
      sentAt: new Date().toISOString(),
      error: "",
      providerResponse
    });
  } catch (error) {
    return updateCommunication(communication.id, {
      status: "failed",
      error: error.message || String(error)
    });
  }
}

function sendBitrixNotificationAsync(record, eventType) {
  sendBitrixNotification(record, eventType).catch(error => {
    console.error("Bitrix24 notification failed", error);
  });
}

function telegramConfigured() {
  return Boolean(TELEGRAM_BOT_TOKEN);
}

function telegramBotDeepLink(candidateId) {
  if (!TELEGRAM_BOT_USERNAME || !candidateId) return null;
  return `https://t.me/${TELEGRAM_BOT_USERNAME}?start=c_${encodeURIComponent(candidateId)}`;
}

async function telegramApi(method, payload) {
  if (!telegramConfigured()) throw new Error("TELEGRAM_BOT_TOKEN_NOT_CONFIGURED");
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.description || `Telegram API HTTP ${response.status}`);
  }
  return data;
}

async function sendTelegramCandidateMessage(record, chatId, eventType, text, payload = {}) {
  const recipient = String(chatId || "");
  const communication = createCommunication({
    candidateId: record.id,
    vacancyCode: record.vacancyCode,
    channel: "telegram",
    eventType,
    recipient,
    subject: "Сообщение Telegram",
    body: text,
    status: recipient ? "pending" : "skipped",
    provider: "telegram",
    error: recipient ? "" : "telegram_chat_id_missing",
    payload
  });
  if (!recipient) return communication;
  try {
    const providerResponse = await telegramApi("sendMessage", {
      chat_id: recipient,
      text,
      disable_web_page_preview: true
    });
    return updateCommunication(communication.id, {
      status: "sent",
      sentAt: new Date().toISOString(),
      error: "",
      providerResponse
    });
  } catch (error) {
    return updateCommunication(communication.id, {
      status: "failed",
      error: error.message || String(error)
    });
  }
}

function telegramContactLabel(from, chatId) {
  if (from?.username) return `@${from.username}`;
  return String(chatId || from?.id || "");
}

function parseTelegramStartCandidateId(text) {
  const match = String(text || "").trim().match(/^\/start(?:@\w+)?(?:\s+(.+))?$/i);
  if (!match) return "";
  const payload = String(match[1] || "").trim();
  if (!payload.startsWith("c_")) return "";
  return payload.slice(2);
}

async function processTelegramWebhook(payload) {
  const message = payload?.message || payload?.edited_message || null;
  const text = String(message?.text || "").trim();
  const chatId = message?.chat?.id;
  const from = message?.from || {};
  const candidateId = parseTelegramStartCandidateId(text);
  if (!message || !candidateId) {
    return { ignored: true, reason: "not_candidate_start" };
  }
  const record = getSubmission(candidateId);
  if (!record) {
    if (chatId && telegramConfigured()) {
      await telegramApi("sendMessage", {
        chat_id: chatId,
        text: "Не смог найти анкету по этой ссылке. Вернитесь на страницу анкеты и откройте Telegram еще раз.",
        disable_web_page_preview: true
      }).catch(() => null);
    }
    return { ignored: true, reason: "candidate_not_found" };
  }
  const telegramLink = upsertTelegramLink({
    candidateId: record.id,
    vacancyCode: record.vacancyCode,
    telegramUserId: from.id,
    chatId,
    username: from.username || "",
    firstName: from.first_name || "",
    lastName: from.last_name || "",
    status: "linked",
    payload: {
      updateId: payload.update_id || null,
      linkedFrom: "deep_link_start"
    }
  });
  createCommunication({
    candidateId: record.id,
    vacancyCode: record.vacancyCode,
    channel: "telegram",
    eventType: "telegram_deep_link_linked",
    recipient: telegramContactLabel(from, chatId),
    subject: "Telegram привязан",
    body: "Кандидат открыл Telegram-бота по персональной deep-link ссылке.",
    status: "received",
    provider: "telegram",
    payload: {
      updateId: payload.update_id || null,
      telegramLinkId: telegramLink?.id || "",
      telegramUserId: String(from.id || ""),
      chatId: String(chatId || ""),
      username: from.username || ""
    }
  });
  await sendTelegramCandidateMessage(
    record,
    chatId,
    "telegram_link_confirmation_sent",
    "Готово, я привязал Telegram к вашей анкете. Здесь мы сможем присылать уведомления по следующим этапам подбора.",
    { telegramLinkId: telegramLink?.id || "" }
  );
  return { linked: true, candidateId: record.id };
}

function parseMultipartFile(buffer, contentType) {
  const boundary = String(contentType || "").match(/boundary=(?:"([^"]+)"|([^;]+))/i)?.[1] ||
    String(contentType || "").match(/boundary=(?:"([^"]+)"|([^;]+))/i)?.[2];
  if (!boundary) throw new Error("Некорректная загрузка файла: не найден boundary.");
  const raw = buffer.toString("latin1");
  const parts = raw.split(`--${boundary}`);
  for (const part of parts) {
    if (!part.includes('name="resume"')) continue;
    const [rawHeaders, ...bodyParts] = part.split("\r\n\r\n");
    const headers = rawHeaders || "";
    const filename = headers.match(/filename="([^"]*)"/i)?.[1];
    const contentMime = headers.match(/Content-Type:\s*([^\r\n]+)/i)?.[1]?.trim() || "application/octet-stream";
    if (!filename) throw new Error("Файл не выбран.");
    let body = bodyParts.join("\r\n\r\n");
    body = body.replace(/\r\n$/u, "");
    return {
      originalName: path.basename(Buffer.from(filename, "latin1").toString("utf8")),
      mimeType: contentMime,
      buffer: Buffer.from(body, "latin1")
    };
  }
  throw new Error("Файл резюме не найден в запросе.");
}

function safeResumeFileName(originalName) {
  const ext = path.extname(originalName || "").toLowerCase();
  if (!ALLOWED_RESUME_EXTENSIONS.has(ext)) {
    throw new Error("Можно прикрепить только PDF, DOC или DOCX.");
  }
  const base = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9а-яА-ЯёЁ._-]+/g, "-")
    .slice(0, 80) || "resume";
  return `${Date.now()}-${crypto.randomUUID()}-${base}${ext}`;
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return Object.fromEntries(
    header
      .split(";")
      .map(item => item.trim())
      .filter(Boolean)
      .map(item => {
        const index = item.indexOf("=");
        return [decodeURIComponent(item.slice(0, index)), decodeURIComponent(item.slice(index + 1))];
      })
  );
}

function cookieHeader(name, value, options = {}) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  parts.push("Path=/");
  parts.push("HttpOnly");
  parts.push("SameSite=Lax");
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

function getSession(req) {
  const token = parseCookies(req).hr_session;
  return findSession(token);
}

function requireAdmin(req, res) {
  const session = getSession(req);
  if (!session) {
    sendJson(res, 401, { error: "Unauthorized" });
    return null;
  }
  return session;
}

function publicSessionUser(session) {
  return {
    username: session.username,
    email: session.email || session.username,
    displayName: session.displayName || "",
    role: session.role,
    vacancyAccess: session.vacancyAccess || []
  };
}

function requireOwner(session, res) {
  if (session?.role === "owner") return true;
  sendJson(res, 403, { error: "Недостаточно прав. Доступ только для владельца." });
  return false;
}

function canManageVacancy(session, vacancyCode) {
  return session?.role === "owner" || session?.role === "hr" || userCanAccessVacancy(session, vacancyCode);
}

function canWriteVacancy(session, vacancyCode) {
  return (session?.role === "owner" || session?.role === "hr") && userCanAccessVacancy(session, vacancyCode);
}

function vacancyCodes(config = getQuestionnaireConfig()) {
  return Object.keys(config.vacancies || { [config.vacancyCode || "smm"]: config });
}

function visibleVacancies(session, config = getQuestionnaireConfig()) {
  const allowed = allowedVacancyCodes(session, vacancyCodes(config));
  const vacancies = getVacancies(config);
  return Object.fromEntries(Object.entries(vacancies).filter(([code]) => allowed.includes(code)));
}

function filterByVacancyAccess(session, items, getCode = item => item.vacancyCode) {
  const baseConfig = getQuestionnaireConfig();
  const allowed = allowedVacancyCodes(session, vacancyCodes(baseConfig));
  return items.filter(item => {
    const code = getCode(item);
    if (!code) return session.role === "owner" || session.role === "hr";
    return allowed.includes(code);
  });
}

function buildHeadHunterDraft(vacancyCode, opening = null) {
  const baseConfig = getQuestionnaireConfig();
  const config = getVacancyConfig(vacancyCode, baseConfig);
  const title = config.publicTitle || config.title || opening?.title || vacancyCode;
  const questionnaireLink = `https://hr.academy-management.ru/v/${encodeURIComponent(vacancyCode)}?source=headhunter`;
  return [
    `# ${title}`,
    "",
    "Академия менеджмента - онлайн-школа для предпринимателей, руководителей и специалистов, которые хотят сильнее управлять бизнесом, командами и результатом.",
    "",
    `Сейчас мы открываем роль "${title}", потому что усиливаем команду и хотим передать важную зону ответственности человеку, который умеет работать системно, спокойно и на результат.`,
    "",
    "## Чем интересна роль",
    "",
    "- можно влиять на реальные процессы, а не просто выполнять разрозненные задачи;",
    "- рядом предпринимательская команда, где ценят ответственность и ясную коммуникацию;",
    "- роль связана с ростом образовательных продуктов и развитием внутренней системы управления;",
    "- мы активно внедряем ИИ и автоматизацию в рабочие процессы.",
    "",
    "## Что предстоит делать",
    "",
    "Конкретный функционал зависит от вакансии и будет подробно обсуждаться на интервью. В целом нам важен человек, который умеет брать зону ответственности, доводить задачи до результата и ясно показывать статус работы.",
    "",
    "## Кому подойдет",
    "",
    "- вы умеете работать самостоятельно;",
    "- не теряетесь в задачах и сроках;",
    "- спокойно относитесь к обратной связи;",
    "- умеете договариваться и фиксировать договоренности;",
    "- хотите работать в среде, где важны развитие, качество и результат.",
    "",
    "## Кому не подойдет",
    "",
    "- если вам нужен постоянный микроконтроль;",
    "- если вы не готовы работать с цифрами, задачами и ответственностью;",
    "- если вам комфортнее просто выполнять поручения без вовлечения в результат.",
    "",
    "## Как проходит отбор",
    "",
    "Первый шаг - короткая анкета на нашей платформе. Она занимает 7-10 минут и помогает нам быстрее понять ваш опыт и подход к рабочим ситуациям.",
    "",
    `Анкета: ${questionnaireLink}`,
    "",
    "После анкеты мы вернемся с понятным следующим шагом: тестовое задание, интервью с HR или интервью с руководителем."
  ].join("\n");
}

function buildTelegramDrafts(vacancyCode, opening = null) {
  const baseConfig = getQuestionnaireConfig();
  const config = getVacancyConfig(vacancyCode, baseConfig);
  const title = config.publicTitle || config.title || opening?.title || vacancyCode;
  const questionnaireLink = `https://hr.academy-management.ru/v/${encodeURIComponent(vacancyCode)}?source=telegram`;
  const chatPost = [
    `Ищем в команду: ${title}`,
    "",
    "Бизнес-школа \"Академия менеджмента\" усиливает команду и ищет человека, который умеет работать системно, спокойно и на результат.",
    "",
    "Что важно:",
    "- самостоятельность и ответственность;",
    "- ясная коммуникация;",
    "- готовность работать с задачами, сроками и результатом;",
    "- интерес к развитию и современным рабочим инструментам.",
    "",
    "Первый шаг отбора - короткая анкета на 7-10 минут. Она помогает нам быстро понять ваш опыт и не тратить ваше время на неподходящие этапы.",
    "",
    `Анкета: ${questionnaireLink}`,
    "",
    "Если откликается по смыслу - заполните анкету, и мы вернемся с обратной связью."
  ].join("\n");
  const directMessage = [
    "Здравствуйте!",
    "",
    `Увидели ваш профиль/сообщение и хотим предложить рассмотреть роль: ${title}.`,
    "",
    "Мы - Бизнес-школа \"Академия менеджмента\". Сейчас усиливаем команду и ищем человека, который умеет брать зону ответственности и доводить задачи до результата.",
    "",
    "Если вам интересно, пройдите короткую анкету. Это займет 7-10 минут и поможет нам понять, есть ли смысл двигаться дальше к тестовому или интервью.",
    "",
    `Анкета: ${questionnaireLink}`,
    "",
    "Будем рады познакомиться."
  ].join("\n");
  return { chatPost, directMessage };
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function cleanText(value, max = 12000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

const QUESTION_TYPES = new Set([
  "namePair",
  "contactPair",
  "resumeAttachment",
  "text",
  "textarea",
  "radio",
  "checkbox",
  "questionRating",
  "expectations"
]);

function normalizeQuestionnaireQuestions(value) {
  if (!Array.isArray(value) || !value.length) {
    const error = new Error("В опроснике должен быть хотя бы один вопрос.");
    error.statusCode = 400;
    throw error;
  }
  const ids = new Set();
  return value.map((question, index) => {
    const id = cleanText(question?.id || `customQuestion${index + 1}`, 80).replace(/[^a-zA-Z0-9_-]/g, "");
    const title = cleanText(question?.title, 800);
    const type = cleanText(question?.type || "text", 40);
    if (!id) {
      const error = new Error(`У вопроса ${index + 1} нет технического кода.`);
      error.statusCode = 400;
      throw error;
    }
    if (ids.has(id)) {
      const error = new Error(`Повторяется технический код вопроса: ${id}.`);
      error.statusCode = 400;
      throw error;
    }
    ids.add(id);
    if (!title) {
      const error = new Error(`У вопроса ${index + 1} нет текста.`);
      error.statusCode = 400;
      throw error;
    }
    if (!QUESTION_TYPES.has(type)) {
      const error = new Error(`Неизвестный тип вопроса: ${type}.`);
      error.statusCode = 400;
      throw error;
    }
    const next = {
      id,
      title,
      type,
      required: Boolean(question?.required)
    };
    const section = cleanText(question?.section, 160);
    const placeholder = cleanText(question?.placeholder, 240);
    const max = Number(question?.max);
    const maxPick = Number(question?.maxPick);
    if (section) next.section = section;
    if (placeholder) next.placeholder = placeholder;
    if (Number.isFinite(max) && max > 0) next.max = Math.min(Math.round(max), 5000);
    if (Number.isFinite(maxPick) && maxPick > 0) next.maxPick = Math.min(Math.round(maxPick), 30);
    return next;
  });
}

function makeVacancyCode(title, existingCodes = []) {
  const dictionary = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", "ж": "zh", "з": "z", "и": "i", "й": "y",
    "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "h", "ц": "c", "ч": "ch", "ш": "sh", "щ": "sch", "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya"
  };
  const base = String(title || "vacancy")
    .toLowerCase()
    .split("")
    .map(char => dictionary[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42) || "vacancy";
  let code = base;
  let index = 2;
  while (existingCodes.includes(code)) {
    code = `${base}-${index}`;
    index += 1;
  }
  return code;
}

function vacancyBriefGaps(text) {
  const lower = String(text || "").toLowerCase();
  const checks = [
    {
      ok: /(нужен|нужна|ищем|ваканси|роль|должност|позици|менеджер|специалист|руководител)/i.test(lower),
      question: "Как точно называется роль и зачем сейчас открываем эту позицию?"
    },
    {
      ok: /(делать|задач|обязан|функц|вести|отвеч|контрол|созда|настраив|анализ)/i.test(lower),
      question: "Какие 5-7 ключевых задач будут в зоне ответственности человека?"
    },
    {
      ok: /(результ|показател|цель|kpi|метрик|итог|успех|заяв|выруч|срок)/i.test(lower),
      question: "Какой результат через 1-3 месяца покажет, что человек подходит?"
    },
    {
      ok: /(опыт|навык|умени|инструмент|сервис|таблиц|crm|дизайн|аналит|продаж|проект)/i.test(lower),
      question: "Какой опыт, навыки и инструменты обязательны, а что можно добрать в работе?"
    },
    {
      ok: /(удален|офис|гибрид|график|полный день|частич|зарплат|доход|вилка|руб|оклад)/i.test(lower),
      question: "Какой формат работы, график и примерная вилка дохода предполагаются?"
    }
  ];
  return checks.filter(item => !item.ok).map(item => item.question);
}

function guessVacancyTitle(text) {
  const source = cleanText(text, 800);
  const patterns = [
    /(?:нужен|нужна|ищем|требуется)\s+([^,.!?]{4,80})/i,
    /(?:роль|позиция|вакансия)\s+([^,.!?]{4,80})/i
  ];
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1]) {
      return match[1]
        .replace(/^(на|для)\s+/i, "")
        .replace(/\s+(который|которая|чтобы|для).*$/i, "")
        .trim();
    }
  }
  return "Новая роль";
}

function sentenceItems(text, fallback = []) {
  const cleaned = String(text || "")
    .split(/[.;\n]/)
    .map(item => item.trim())
    .filter(item => item.length > 8 && item.length < 180);
  return [...new Set(cleaned)].slice(0, 8).length ? [...new Set(cleaned)].slice(0, 8) : fallback;
}

function localVacancyDraft(sourceText) {
  const title = guessVacancyTitle(sourceText);
  const responsibilities = sentenceItems(sourceText, [
    "вести ключевые задачи роли от постановки до результата",
    "поддерживать регулярную коммуникацию с руководителем и командой",
    "фиксировать договоренности, сроки, риски и статус выполнения",
    "работать с рабочими инструментами компании и отчетностью",
    "предлагать улучшения процесса на основе фактов и обратной связи"
  ]);
  const specialQuestions = [
    `Опишите самый близкий к роли "${title}" опыт: задача, ваша зона ответственности и результат.`,
    "С какой самой сложной рабочей ситуацией в этой роли вы сталкивались и как ее решили?",
    "Какие инструменты вы используете, чтобы держать задачи, сроки и результат под контролем?",
    "Что вы сделаете в первые две недели, чтобы быстро войти в роль?"
  ];
  return {
    mode: "local",
    title,
    adminTitle: title.length > 22 ? title.slice(0, 21).trim() : title,
    roleProfile: `Самостоятельный специалист на роль "${title}", который умеет брать зону ответственности, ясно коммуницировать, доводить задачи до результата и работать с показателями.`,
    responsibilities,
    requiredExperience: [
      "релевантный опыт в похожих задачах",
      "умение работать самостоятельно и показывать статус",
      "готовность работать с цифрами, сроками и обратной связью"
    ],
    hhText: "",
    specialQuestions,
    testAssignment: `Подготовьте короткий документ: как вы разберете текущую задачу роли "${title}", какие первые шаги предложите, какие риски увидите и как будете измерять результат.`
  };
}

function vacancyDraftPrompt(sourceText) {
  return [
    "Ты помогаешь HR-платформе Бизнес-школы \"Академия менеджмента\" собрать новую вакансию.",
    "Нельзя придумывать критичные факты, которых нет во вводных. Если данных достаточно, аккуратно обобщи их.",
    "Пиши только по-русски. Не используй английские служебные слова и англицизмы.",
    "Верни строго JSON без Markdown в формате:",
    "{title:string,adminTitle:string,roleProfile:string,responsibilities:string[],requiredExperience:string[],specialQuestions:string[],testAssignment:string,hhText:string}.",
    "specialQuestions - 3-6 специфических вопросов для анкеты именно под эту вакансию.",
    "hhText - готовый текст вакансии для hh.ru с разделами: кто мы, зачем роль, задачи, кому подойдет, условия, как проходит отбор.",
    "",
    "Вводные руководителя:",
    sourceText
  ].join("\n");
}

async function callVacancyDraftAi(sourceText) {
  if (AI_PROVIDER === "yandex" && YANDEX_GPT_API_KEY && YANDEX_FOLDER_ID) {
    const response = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
      method: "POST",
      headers: {
        "Authorization": `Api-Key ${YANDEX_GPT_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        modelUri: `gpt://${YANDEX_FOLDER_ID}/${YANDEX_GPT_MODEL}/latest`,
        completionOptions: { stream: false, temperature: 0.2, maxTokens: 1800 },
        messages: [
          { role: "system", text: "Верни только валидный JSON. Пиши по-русски, без Markdown." },
          { role: "user", text: vacancyDraftPrompt(sourceText) }
        ]
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { mode: "yandex", ...parseAiJson(data.result?.alternatives?.[0]?.message?.text || "{}") };
  }

  if (OPENAI_API_KEY) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "Верни только валидный JSON. Пиши по-русски, без Markdown." },
          { role: "user", content: vacancyDraftPrompt(sourceText) }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { mode: "ai", ...parseAiJson(data.choices?.[0]?.message?.content || "{}") };
  }

  throw new Error("ключ нейросети не настроен");
}

function normalizeVacancyDraft(draft, sourceText) {
  const local = localVacancyDraft(sourceText);
  const title = cleanText(draft?.title || local.title, 120) || local.title;
  const normalized = {
    mode: draft?.mode || "local",
    title,
    adminTitle: cleanText(draft?.adminTitle || title, 40) || title,
    roleProfile: cleanText(draft?.roleProfile || local.roleProfile, 1000),
    responsibilities: Array.isArray(draft?.responsibilities) && draft.responsibilities.length ? draft.responsibilities.map(item => cleanText(item, 220)).filter(Boolean).slice(0, 10) : local.responsibilities,
    requiredExperience: Array.isArray(draft?.requiredExperience) && draft.requiredExperience.length ? draft.requiredExperience.map(item => cleanText(item, 220)).filter(Boolean).slice(0, 8) : local.requiredExperience,
    specialQuestions: Array.isArray(draft?.specialQuestions) && draft.specialQuestions.length ? draft.specialQuestions.map(item => cleanText(item, 240)).filter(Boolean).slice(0, 8) : local.specialQuestions,
    testAssignment: cleanText(draft?.testAssignment || local.testAssignment, 1200),
    hhText: String(draft?.hhText || "").trim(),
    sourceText: cleanText(draft?.sourceText || sourceText, 6000)
  };
  if (!normalized.hhText) {
    normalized.hhText = [
      `# ${normalized.title}`,
      "",
      "Бизнес-школа \"Академия менеджмента\" усиливает команду и открывает новую роль.",
      "",
      "## Профиль роли",
      normalized.roleProfile,
      "",
      "## Что предстоит делать",
      ...normalized.responsibilities.map(item => `- ${item}`),
      "",
      "## Что важно",
      ...normalized.requiredExperience.map(item => `- ${item}`),
      "",
      "Первый шаг отбора - короткая анкета на нашей платформе. Она помогает быстро понять ваш опыт и не тратить время на неподходящие этапы."
    ].join("\n");
  }
  return normalized;
}

function buildGeneratedVacancyConfig(vacancyCode, draft, sourceText) {
  const base = cloneJson(defaultConfig.vacancies?.["project-manager"] || defaultConfig);
  const title = draft.title || "Новая роль";
  const generatedQuestionIds = (draft.specialQuestions || []).slice(0, 4).map((question, index) => ({
    section: index === 0 ? "Специфика роли" : undefined,
    id: `roleSpecific${index + 1}`,
    title: question,
    type: "textarea",
    max: 800,
    required: true
  }));
  const baseQuestions = (base.questions || []).filter(question => !["projectCase", "deadlineRiskCase", "funnelCheck", "questionnaireFeedbackRating"].includes(question.id));
  const scoring = cloneJson(base.scoring || {});
  scoring.blocks = {
    ...(scoring.blocks || {}),
    practicalCases: generatedQuestionIds.map(question => ({
      field: question.id,
      type: "text",
      keywords: ["результ", "срок", "задач", "ответствен", "риск", "команд", "инструмент", "показател", "решен"],
      max: 10
    }))
  };
  return {
    ...base,
    version: 1,
    vacancyCode,
    publicTitle: title,
    adminTitle: draft.adminTitle || title,
    title: `Анкета: ${title}`,
    intro: "7-10 минут. Цель - быстро понять релевантность опыта, самостоятельность, рабочее поведение и соответствие роли.",
    questions: [
      ...baseQuestions,
      ...generatedQuestionIds,
      { section: "Финальная оценка", id: "questionnaireFeedbackRating", title: "Это был последний вопрос. Насколько вопросы показались вам понятными и уместными?", type: "questionRating", required: true }
    ],
    scoring,
    testAssignment: {
      ...(base.testAssignment || {}),
      enabled: true,
      threshold: Number(base.testAssignment?.threshold || 70),
      enabledStatuses: ["green", "yellow"],
      title: `Практическое задание: ${title}`,
      submitFormat: "Google Документ с открытым доступом по ссылке",
      instruction: [
        draft.testAssignment,
        "Оформите результат в Google Документе.",
        "Откройте доступ по ссылке и прикрепите ссылку на странице задания."
      ].filter(Boolean),
      evaluationCriteria: [
        { id: "understanding", title: "Понимание роли и задачи", max: 20, description: "Кандидат правильно понял контекст и цель работы." },
        { id: "logic", title: "Логика решения", max: 20, description: "Есть последовательность действий, приоритеты и связь с результатом." },
        { id: "specificity", title: "Конкретика", max: 20, description: "Предложения применимы, не сводятся к общим словам." },
        { id: "risks", title: "Работа с рисками", max: 15, description: "Кандидат видит ограничения, слабые места и варианты действий." },
        { id: "metrics", title: "Показатели результата", max: 15, description: "Понимает, как измерить успешность работы." },
        { id: "clarity", title: "Ясность подачи", max: 10, description: "Документ легко читать и использовать." }
      ]
    },
    ui: {
      ...(base.ui || {}),
      welcomeLabel: title,
      welcomeLead: `Мы рады, что вы заинтересовались вакансией "${title}". Ответьте на несколько вопросов, чтобы мы быстрее поняли ваш опыт и соответствие роли.`,
      guideAlt: `Помощник анкеты: ${title}`,
      testLead: "Спасибо за ответы. По итогам анкеты видно, что ваш опыт может быть близок к нашей роли, поэтому предлагаем следующий шаг - показать себя в деле.",
      testSpeech: "Класс! Анкета выглядит сильной. Давайте посмотрим, как вы думаете на практике."
    },
    guideCaptions: {
      ...(base.guideCaptions || {}),
      ...Object.fromEntries(generatedQuestionIds.map(question => [question.id, "Здесь важен ваш реальный опыт и ход мыслей именно под эту роль."]))
    },
    vacancyArtifacts: {
      generatedAt: new Date().toISOString(),
      sourceText: cleanText(sourceText, 6000),
      roleProfile: draft.roleProfile,
      responsibilities: draft.responsibilities,
      requiredExperience: draft.requiredExperience,
      hhText: draft.hhText,
      specialQuestions: draft.specialQuestions
    }
  };
}

function hhConfigured() {
  return Boolean(HH_CLIENT_ID && HH_CLIENT_SECRET && HH_REDIRECT_URI);
}

function hhOAuthUrl(session) {
  const statePayload = Buffer.from(JSON.stringify({
    userId: session.userId,
    ts: Date.now(),
    nonce: crypto.randomBytes(12).toString("hex")
  })).toString("base64url");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: HH_CLIENT_ID,
    redirect_uri: HH_REDIRECT_URI,
    state: statePayload
  });
  return `${HH_AUTH_BASE}?${params.toString()}`;
}

async function hhTokenRequest(params) {
  const response = await fetch(HH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": HH_USER_AGENT,
      "HH-User-Agent": HH_USER_AGENT
    },
    body: new URLSearchParams(params)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error_description || data.error || `HeadHunter token HTTP ${response.status}`);
  }
  return data;
}

function hhTokenExpiresAt(tokenData) {
  const seconds = Number(tokenData.expires_in || 0);
  if (!seconds) return null;
  return new Date(Date.now() + Math.max(60, seconds - 60) * 1000).toISOString();
}

async function refreshHhAccountIfNeeded() {
  const account = getHhIntegrationAccount();
  if (!account?.accessToken) return account;
  if (!account.expiresAt || new Date(account.expiresAt).getTime() > Date.now()) return account;
  if (!account.refreshToken) return account;
  const tokenData = await hhTokenRequest({
    grant_type: "refresh_token",
    refresh_token: account.refreshToken
  });
  return saveHhIntegrationAccount({
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token || account.refreshToken,
    expiresAt: hhTokenExpiresAt(tokenData),
    status: "connected"
  });
}

async function hhApi(pathname, options = {}) {
  const account = await refreshHhAccountIfNeeded();
  if (!account?.accessToken) throw new Error("HeadHunter не подключен.");
  const formBody = options.form ? new URLSearchParams(options.form) : null;
  const response = await fetch(`${HH_API_BASE}${pathname}`, {
    method: options.method || "GET",
    headers: {
      "Authorization": `Bearer ${account.accessToken}`,
      "User-Agent": HH_USER_AGENT,
      "HH-User-Agent": HH_USER_AGENT,
      ...(formBody ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {})
    },
    body: formBody || (options.body ? JSON.stringify(options.body) : undefined)
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.description || data.error_description || data.error || `HeadHunter API HTTP ${response.status}`);
  }
  return data;
}

function hhApiPathFromUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, HH_API_BASE);
    return `${url.pathname}${url.search}`;
  } catch {
    return raw.startsWith("/") ? raw : `/${raw}`;
  }
}

function hhPathWithQuery(pathname, params = {}) {
  const url = new URL(hhApiPathFromUrl(pathname), HH_API_BASE);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return `${url.pathname}${url.search}`;
}

const HH_WEBHOOK_ACTIONS = [
  { type: "NEW_NEGOTIATION_VACANCY", settings: { vacancies_only_mine: false } }
];

async function ensureHhWebhookSubscription() {
  if (!HH_WEBHOOK_URL) throw new Error("Не задан HH_WEBHOOK_SECRET или HH_WEBHOOK_URL.");
  const account = getHhIntegrationAccount();
  if (!account?.accessToken) throw new Error("HeadHunter не подключен.");
  if (account.me?.is_employer === false || account.me?.auth_type === "applicant") {
    throw new Error("HeadHunter подключен как аккаунт соискателя. Нужно переподключить через кабинет работодателя/менеджера HH.");
  }
  const existing = await hhApi("/webhook/subscriptions");
  const subscriptions = existing.items || existing.subscriptions || [];
  const current = subscriptions.find(item => item.url === HH_WEBHOOK_URL);
  const body = { url: HH_WEBHOOK_URL, actions: HH_WEBHOOK_ACTIONS };
  let subscriptionId = current?.id || current?.subscription_id || null;
  if (subscriptionId) {
    await hhApi(`/webhook/subscriptions/${encodeURIComponent(subscriptionId)}`, {
      method: "PUT",
      body
    });
  } else {
    try {
      const created = await hhApi("/webhook/subscriptions", {
        method: "POST",
        body
      });
      subscriptionId = created.id || created.subscription_id || null;
    } catch (error) {
      if (!String(error.message || "").includes("already_exist")) throw error;
      const refreshed = await hhApi("/webhook/subscriptions");
      const refreshedSubscriptions = refreshed.items || refreshed.subscriptions || [];
      const fallback = refreshedSubscriptions[0];
      subscriptionId = fallback?.id || fallback?.subscription_id || null;
      if (subscriptionId) {
        await hhApi(`/webhook/subscriptions/${encodeURIComponent(subscriptionId)}`, {
          method: "PUT",
          body
        });
      }
    }
  }
  const updatedAccount = saveHhIntegrationAccount({
    me: {
      ...(account.me || {}),
      webhook: {
        configured: Boolean(subscriptionId),
        subscriptionId,
        url: HH_WEBHOOK_URL.replace(HH_WEBHOOK_SECRET, "***"),
        actions: HH_WEBHOOK_ACTIONS.map(action => action.type),
        updatedAt: new Date().toISOString()
      }
    },
    status: "connected"
  });
  return updatedAccount.me.webhook;
}

async function processHhWebhookEvent(event) {
  const actionType = String(event?.action_type || "");
  const payload = event?.payload || {};
  const hhVacancyId = String(payload.vacancy_id || "").trim();
  const webhookEvent = registerHhWebhookEvent(event);
  if (webhookEvent.duplicate) return { duplicate: true };
  if (!["NEW_NEGOTIATION_VACANCY", "NEW_RESPONSE_OR_INVITATION_VACANCY"].includes(actionType)) {
    markHhWebhookEventProcessed(event.id, { ...event, ignored: true, reason: "unsupported_action" });
    return { ignored: true, reason: "unsupported_action" };
  }
  if (!hhVacancyId) {
    markHhWebhookEventProcessed(event.id, { ...event, ignored: true, reason: "no_vacancy_id" });
    return { ignored: true, reason: "no_vacancy_id" };
  }
  const publications = findHhPublicationsByVacancyId(hhVacancyId);
  if (!publications.length) {
    markHhWebhookEventProcessed(event.id, { ...event, ignored: true, reason: "publication_not_linked" });
    return { ignored: true, reason: "publication_not_linked", hhVacancyId };
  }
  const results = [];
  for (const publication of publications) {
    const result = await syncHhPublicationResponses(publication);
    const sent = [];
    const failed = [];
    for (const responseItem of result.responses.filter(item => !item.questionnaireSent)) {
      try {
        const sendResult = await sendHhQuestionnaireMessage(responseItem);
        if (!sendResult.skipped) sent.push(responseItem.id);
      } catch (error) {
        failed.push({ responseId: responseItem.id, negotiationId: responseItem.negotiationId, error: error.message });
      }
    }
    results.push({
      publicationId: publication.id,
      vacancyCode: publication.vacancyCode,
      found: result.found,
      synced: result.responses.length,
      questionnaireSent: sent.length,
      questionnaireFailed: failed.length
    });
    insertAuditLog({
      user: null,
      action: "hh.webhook.sync",
      targetType: "hh_publication",
      targetId: publication.id,
      vacancyCode: publication.vacancyCode,
      payload: { eventId: event.id, actionType, hhVacancyId, found: result.found, synced: result.responses.length, questionnaireSent: sent.length, questionnaireFailed: failed }
    });
  }
  markHhWebhookEventProcessed(event.id, { ...event, processedResults: results });
  return { duplicate: false, hhVacancyId, results };
}

function hhQuestionnaireMessage(responseItem) {
  const title = vacancyLabelFromConfig(responseItem.vacancyCode);
  const link = `https://hr.academy-management.ru/v/${encodeURIComponent(responseItem.vacancyCode)}?source=headhunter&negotiation=${encodeURIComponent(responseItem.negotiationId)}`;
  const name = responseItem.candidateName ? `${responseItem.candidateName}, здравствуйте!` : "Здравствуйте!";
  return [
    name,
    "",
    `Спасибо за отклик на вакансию "${title}" в Бизнес-школу "Академия менеджмента".`,
    "",
    "Чтобы быстрее познакомиться с вами и понять, насколько роль вам подходит, мы просим пройти короткую анкету. Это займет около 7-10 минут.",
    "",
    "В анкете нет длинного тестового задания - только вопросы по опыту, инструментам и рабочим ситуациям.",
    "",
    `Пройти анкету: ${link}`,
    "",
    "После заполнения мы посмотрим ответы и вернемся с понятным следующим шагом."
  ].join("\n");
}

async function sendHhQuestionnaireMessage(responseItem) {
  if (!responseItem || responseItem.questionnaireSent) return { skipped: true, reason: "already_sent", response: responseItem };
  const message = hhQuestionnaireMessage(responseItem);
  const data = await hhApi(`/negotiations/${encodeURIComponent(responseItem.negotiationId)}/messages`, {
    method: "POST",
    form: { message }
  });
  const updated = markHhQuestionnaireSent(responseItem.id, message, data);
  insertAuditLog({
    user: null,
    action: "hh.questionnaire.auto_send",
    targetType: "hh_response",
    targetId: responseItem.id,
    vacancyCode: responseItem.vacancyCode,
    payload: { negotiationId: responseItem.negotiationId }
  });
  return { skipped: false, response: updated };
}

function normalizeHhNegotiation(item, publication) {
  const resume = item.resume || {};
  const candidateName = [resume.first_name, resume.last_name].filter(Boolean).join(" ") || resume.title || "";
  return {
    vacancyCode: publication.vacancyCode,
    publicationId: publication.id,
    hhVacancyId: publication.hhVacancyId,
    negotiationId: item.id || item.nid || item.negotiation_id,
    resumeId: resume.id || item.resume_id || "",
    candidateName,
    resumeUrl: resume.alternate_url || resume.url || "",
    state: item.state?.id || item.employer_state?.id || "",
    payload: item
  };
}

function collectHhNegotiationCollectionUrls(collections = [], result = []) {
  for (const collection of collections || []) {
    if (collection?.url) result.push(collection.url);
    collectHhNegotiationCollectionUrls(collection?.sub_collections || [], result);
  }
  return [...new Set(result.map(hhApiPathFromUrl).filter(Boolean))];
}

function hhNegotiationBelongsToPublication(item, publication) {
  const expected = String(publication.hhVacancyId || "");
  const values = [
    item?.vacancy?.id,
    item?.vacancy_id,
    item?.resume?.vacancy?.id
  ].map(value => String(value || "")).filter(Boolean);
  return values.length === 0 || values.includes(expected);
}

async function fetchHhNegotiationItemsFromCollection(collectionUrl, publication) {
  const items = [];
  const perPage = 50;
  const maxPages = 50;
  for (let page = 0; page < maxPages; page += 1) {
    const data = await hhApi(hhPathWithQuery(collectionUrl, { vacancy_id: publication.hhVacancyId, per_page: perPage, page }));
    const pageItems = Array.isArray(data.items) ? data.items : [];
    items.push(...pageItems.filter(item => hhNegotiationBelongsToPublication(item, publication)));
    const pages = Number(data.pages);
    if (!Number.isFinite(pages) || page >= pages - 1 || pageItems.length === 0) break;
  }
  return items;
}

function asMetricNumber(...values) {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
}

function normalizeHhVacancyMetrics(data = {}) {
  const counters = data.counters || {};
  const statistics = data.statistics || data.stats || {};
  const views = asMetricNumber(
    counters.views,
    counters.total_views,
    counters.views_total,
    statistics.views,
    statistics.total_views,
    data.views
  );
  const responses = asMetricNumber(
    counters.responses,
    counters.negotiations,
    counters.total_responses,
    statistics.responses,
    statistics.negotiations,
    data.responses
  );
  return {
    views,
    responses,
    archived: Boolean(data.archived),
    published: Boolean(data.published_at || data.publishedAt),
    name: data.name || "",
    area: data.area?.name || "",
    employer: data.employer?.name || "",
    alternateUrl: data.alternate_url || data.alternateUrl || "",
    fetchedAt: new Date().toISOString()
  };
}

function hhEmployerIdFromAccount(account = {}) {
  return account.me?.employer?.id
    || account.me?.employers?.[0]?.id
    || account.me?.manager?.employer?.id
    || account.me?.manager?.employer_id
    || "";
}

function hhPropertyLabel(type) {
  const labels = {
    HH_STANDARD: "Стандарт",
    HH_STANDARD_PLUS: "Стандарт плюс",
    HH_PREMIUM: "Премиум",
    HH_VP_OPTIMUM: "Оптимум",
    HH_FREE: "Бесплатная публикация",
    HH_ANONYMOUS: "Анонимная публикация",
    HH_ADVERTISING: "Рекламная публикация",
    ZP_CROSSPOSTING: "Дополнительное размещение"
  };
  return labels[type] || type || "Неизвестное свойство";
}

function normalizeHhPromotionStatus(vacancy = {}) {
  const rawProperties = vacancy.vacancy_properties?.properties || [];
  const propertyTypes = rawProperties.map(item => item.property_type).filter(Boolean);
  const promotionTypes = propertyTypes.filter(type => !["HH_STANDARD", "HH_FREE", "ZP_CROSSPOSTING"].includes(type));
  const billingName = vacancy.vacancy_properties?.appearance?.title
    || vacancy.billing_type?.name
    || (vacancy.premium ? "Премиум" : "Стандарт");
  const isPromoted = Boolean(vacancy.premium)
    || promotionTypes.some(type => ["HH_PREMIUM", "HH_STANDARD_PLUS", "HH_VP_OPTIMUM", "HH_ADVERTISING"].includes(type));
  const properties = rawProperties.map(item => ({
    type: item.property_type || "",
    label: hhPropertyLabel(item.property_type),
    startAt: item.start_time || item.startAt || null,
    endAt: item.end_time || item.endAt || null
  }));
  const promotionProperties = properties.filter(item => !["HH_STANDARD", "HH_FREE", "ZP_CROSSPOSTING"].includes(item.type));
  const endAt = properties
    .map(item => item.endAt)
    .filter(Boolean)
    .sort()
    .at(-1) || vacancy.expires_at || null;
  return {
    publicationType: billingName,
    promoted: isPromoted,
    promotionLabel: isPromoted
      ? (promotionProperties.map(item => item.label).join(", ") || billingName)
      : "Без платного продвижения",
    properties,
    endAt
  };
}

async function listAllHhActiveVacancies(employerId) {
  const items = [];
  for (let page = 0; page < 20; page += 1) {
    const data = await hhApi(`/employers/${encodeURIComponent(employerId)}/vacancies/active?all_accessible=true&per_page=50&page=${page}`);
    items.push(...(data.items || []));
    const pages = Number(data.pages || 1);
    if (page >= pages - 1) break;
  }
  return items;
}

async function getHhPromotionStatus() {
  const account = await refreshHhAccountIfNeeded();
  if (!account?.accessToken) throw new Error("HeadHunter не подключен.");
  const me = await hhApi("/me").catch(() => null);
  const employerId = me?.employer?.id
    || me?.employers?.[0]?.id
    || me?.manager?.employer?.id
    || me?.manager?.employer_id
    || hhEmployerIdFromAccount(account);
  if (!employerId) throw new Error("Не удалось определить работодателя HeadHunter.");

  const [availablePublicationsResult, payableActionsResult, activeVacanciesResult] = await Promise.allSettled([
    hhApi(`/employers/${encodeURIComponent(employerId)}/services/available_publications`),
    hhApi(`/employers/${encodeURIComponent(employerId)}/services/payable_api_actions/active`),
    listAllHhActiveVacancies(employerId)
  ]);

  const publicationVariants = availablePublicationsResult.status === "fulfilled"
    ? (availablePublicationsResult.value.publication_variants || [])
    : [];
  const availablePublications = publicationVariants.map(item => ({
    title: item.appearance?.title || "Пакет публикаций",
    description: item.appearance?.description || "",
    count: Number(item.available_publications_count || 0),
    propertyTypes: (item.vacancy_properties?.required || []).map(prop => prop.property_type).filter(Boolean)
  }));
  const availableTotal = availablePublications.reduce((sum, item) => sum + item.count, 0);
  const payableActions = payableActionsResult.status === "fulfilled"
    ? (payableActionsResult.value.items || [])
    : [];
  const activeVacancies = activeVacanciesResult.status === "fulfilled" ? activeVacanciesResult.value : [];
  return {
    employer: {
      id: String(employerId),
      name: me?.employer?.name || account.me?.employer?.name || ""
    },
    fetchedAt: new Date().toISOString(),
    accountPayment: {
      hasAvailablePublications: availableTotal > 0,
      availableTotal,
      availablePublications,
      payableActionsCount: payableActions.length,
      payableActions: payableActions.map(item => ({
        id: item.id || item.type || item.name || "",
        name: item.name || item.title || item.id || "Оплачиваемое действие",
        description: item.description || ""
      })),
      errors: {
        availablePublications: availablePublicationsResult.status === "rejected" ? availablePublicationsResult.reason.message : "",
        payableActions: payableActionsResult.status === "rejected" ? payableActionsResult.reason.message : "",
        activeVacancies: activeVacanciesResult.status === "rejected" ? activeVacanciesResult.reason.message : ""
      }
    },
    vacancies: activeVacancies.map(vacancy => {
      const promotion = normalizeHhPromotionStatus(vacancy);
      return {
        id: String(vacancy.id || ""),
        name: vacancy.name || "",
        url: vacancy.alternate_url || "",
        area: vacancy.area?.name || "",
        publishedAt: vacancy.published_at || vacancy.created_at || null,
        expiresAt: vacancy.expires_at || null,
        billingType: vacancy.billing_type?.name || "",
        canUpgrade: Boolean(vacancy.can_upgrade_billing_type),
        counters: vacancy.counters || {},
        promotion
      };
    })
  };
}

function htmlToPlainText(value = "") {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function hhSalaryText(salary = null) {
  if (!salary) return "";
  const parts = [];
  if (salary.from) parts.push(`от ${salary.from}`);
  if (salary.to) parts.push(`до ${salary.to}`);
  if (salary.currency) parts.push(salary.currency);
  if (salary.gross !== undefined) parts.push(salary.gross ? "до вычета налогов" : "на руки");
  return parts.join(" ");
}

function hhVacancySourceText(vacancy = {}) {
  const skills = (vacancy.key_skills || []).map(item => item.name).filter(Boolean);
  return [
    `Вакансия на HeadHunter: ${vacancy.name || "без названия"}`,
    vacancy.area?.name ? `Город или регион: ${vacancy.area.name}` : "",
    vacancy.employment?.name ? `Занятость: ${vacancy.employment.name}` : "",
    vacancy.schedule?.name ? `График: ${vacancy.schedule.name}` : "",
    vacancy.experience?.name ? `Опыт: ${vacancy.experience.name}` : "",
    hhSalaryText(vacancy.salary) ? `Доход: ${hhSalaryText(vacancy.salary)}` : "",
    skills.length ? `Ключевые навыки: ${skills.join(", ")}` : "",
    "",
    htmlToPlainText(vacancy.description || "")
  ].filter(Boolean).join("\n");
}

function safeHhVacancyCode(vacancy, existingCodes = []) {
  const baseTitle = vacancy.name || `headhunter-${vacancy.id || Date.now()}`;
  let code = makeVacancyCode(baseTitle, existingCodes);
  const suffix = String(vacancy.id || "").trim();
  if (suffix && existingCodes.includes(code)) {
    code = makeVacancyCode(`${baseTitle} ${suffix}`, existingCodes);
  }
  return code;
}

function normalizeVacancyTitleForMatch(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/gi, " ")
    .replace(/\b(менеджер|manager|специалист|вакансия|удаленно|онлайн)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findExistingVacancyCodeByTitle(title, config = getQuestionnaireConfig()) {
  const target = normalizeVacancyTitleForMatch(title);
  if (!target) return "";
  const vacancies = config.vacancies || {};
  const entries = Object.entries(vacancies).map(([code, vacancy]) => ({
    code,
    title: normalizeVacancyTitleForMatch(vacancy.publicTitle || vacancy.title || vacancy.adminTitle || code)
  }));
  const exact = entries.find(item => item.title === target);
  if (exact) return exact.code;
  const partial = entries.find(item => item.title && (item.title.includes(target) || target.includes(item.title)));
  return partial?.code || "";
}

function titleTokensForDuplicateAnalysis(value = "") {
  return normalizeVacancyTitleForMatch(value)
    .split(/\s+/)
    .map(token => token
      .replace(/^smm$/i, "соцсети")
      .replace(/^смм$/i, "соцсети")
      .replace(/^project$/i, "проект")
      .replace(/^проджект$/i, "проект")
      .replace(/^projects$/i, "проект"))
    .filter(token => token && token.length > 1);
}

function titleSimilarityScore(first = "", second = "") {
  const a = new Set(titleTokensForDuplicateAnalysis(first));
  const b = new Set(titleTokensForDuplicateAnalysis(second));
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter(token => b.has(token)).length;
  const smaller = Math.min(a.size, b.size);
  const larger = Math.max(a.size, b.size);
  return Math.max(intersection / smaller, intersection / larger);
}

function findVacancyDuplicateGroups(session) {
  const config = getQuestionnaireConfig();
  const visible = visibleVacancies(session, config);
  const submissions = listSubmissions();
  const publications = listHhPublications();
  const responses = listHhResponses();
  const openings = listVacancyOpenings();
  const records = Object.entries(visible).map(([code, vacancy]) => {
    const title = vacancy.adminTitle || vacancy.title || vacancy.publicTitle || code;
    const vacancySubmissions = submissions.filter(item => item.vacancyCode === code);
    const vacancyPublications = publications.filter(item => item.vacancyCode === code);
    const vacancyResponses = responses.filter(item => item.vacancyCode === code);
    const vacancyOpenings = openings.filter(item => item.vacancyCode === code);
    const activeOpenings = vacancyOpenings.filter(item => !["closed", "cancelled"].includes(item.status));
    const hasHeadHunter = vacancyPublications.some(item => item.hhVacancyId);
    const active = vacancy.active !== false;
    const score = (
      vacancySubmissions.length * 4 +
      vacancyResponses.length * 2 +
      vacancyPublications.length * 3 +
      activeOpenings.length * 4 +
      (hasHeadHunter ? 5 : 0) +
      (active ? 2 : 0)
    );
    return {
      code,
      title,
      normalizedTitle: normalizeVacancyTitleForMatch(title),
      active,
      score,
      stats: {
        candidates: vacancySubmissions.length,
        hhResponses: vacancyResponses.length,
        hhPublications: vacancyPublications.length,
        activeOpenings: activeOpenings.length,
        hasHeadHunter
      }
    };
  });

  const visited = new Set();
  const groups = [];
  for (const record of records) {
    if (visited.has(record.code)) continue;
    const matches = records.filter(candidate => {
      if (candidate.code === record.code) return true;
      if (visited.has(candidate.code)) return false;
      const exact = candidate.normalizedTitle && candidate.normalizedTitle === record.normalizedTitle;
      const similarity = titleSimilarityScore(record.title, candidate.title);
      const includes = candidate.normalizedTitle && record.normalizedTitle &&
        (candidate.normalizedTitle.includes(record.normalizedTitle) || record.normalizedTitle.includes(candidate.normalizedTitle));
      return exact || similarity >= 0.72 || (includes && similarity >= 0.5);
    });
    if (matches.length < 2) continue;
    matches.forEach(item => visited.add(item.code));
    const sorted = [...matches].sort((a, b) => b.score - a.score || b.stats.candidates - a.stats.candidates || a.title.localeCompare(b.title, "ru"));
    const primary = sorted[0];
    const secondary = sorted.slice(1);
    const reasons = [];
    if (secondary.some(item => item.normalizedTitle === primary.normalizedTitle)) reasons.push("названия практически совпадают");
    if (secondary.some(item => titleSimilarityScore(primary.title, item.title) >= 0.72)) reasons.push("названия и смысл роли очень близкие");
    if (sorted.reduce((sum, item) => sum + item.stats.hhPublications, 0) > 1) reasons.push("есть несколько связанных публикаций HeadHunter");
    groups.push({
      id: sorted.map(item => item.code).sort().join("__"),
      severity: sorted.length > 2 ? "high" : "medium",
      primary,
      duplicates: secondary,
      all: sorted,
      summary: `Найдены похожие вакансии: ${sorted.map(item => item.title).join(", ")}.`,
      conclusion: `Основной лучше считать вакансию "${primary.title}", потому что у нее больше связей с воронкой, кандидатами или публикациями.`,
      recommendation: secondary.map(item => `Проверить "${item.title}": если это та же роль, перенести нужные связи и оставить одну вакансию "${primary.title}"; если роль отличается, переименовать так, чтобы отличие было понятно.`).join(" ")
        || `Оставить "${primary.title}" как основную.`,
      reasons
    });
  }
  return {
    checkedAt: new Date().toISOString(),
    totalVacancies: records.length,
    duplicateGroups: groups,
    hasDuplicates: groups.length > 0,
    summary: groups.length
      ? `Найдено ${groups.length} ${pluralServer(groups.length, "группа возможных дублей", "группы возможных дублей", "групп возможных дублей")}.`
      : "Явных дублей вакансий не найдено."
  };
}

function buildPlatformQuestionContext(session) {
  const config = getQuestionnaireConfig();
  const visible = visibleVacancies(session, config);
  const submissions = listSubmissions();
  const publications = listHhPublications();
  const responses = listHhResponses();
  const openings = listVacancyOpenings();
  const duplicateAnalysis = findVacancyDuplicateGroups(session);
  const vacancies = Object.entries(visible).map(([code, vacancy]) => {
    const vacancySubmissions = submissions.filter(item => item.vacancyCode === code);
    const vacancyPublications = publications.filter(item => item.vacancyCode === code);
    const vacancyResponses = responses.filter(item => item.vacancyCode === code);
    const vacancyOpenings = openings.filter(item => item.vacancyCode === code);
    const activeOpenings = vacancyOpenings.filter(item => !["closed", "cancelled"].includes(item.status));
    return {
      code,
      title: vacancy.adminTitle || vacancy.title || vacancy.publicTitle || code,
      publicTitle: vacancy.publicTitle || vacancy.title || vacancy.adminTitle || code,
      active: vacancy.active !== false,
      questionnaireCount: vacancySubmissions.length,
      hhResponseCount: vacancyResponses.length,
      hhPublicationCount: vacancyPublications.length,
      activeOpeningCount: activeOpenings.length,
      hhVacancyIds: vacancyPublications.map(item => item.hhVacancyId).filter(Boolean),
      hhVacancyNames: vacancyPublications
        .map(item => item.hhData?.name || item.payload?.name || item.title || "")
        .filter(Boolean)
    };
  });
  const hhAccount = getHhIntegrationAccount();
  return {
    product: "HR-платформа Бизнес-школы \"Академия менеджмента\"",
    userRole: session?.role || "unknown",
    checkedAt: new Date().toISOString(),
    headHunterConnected: Boolean(hhAccount?.accessToken),
    vacancies,
    duplicateAnalysis,
    currentRules: [
      "Публикация вакансии требует проверки и подтверждения человеком.",
      "Сообщения с анкетой отправляются кандидатам после отклика на HeadHunter.",
      "Оценка тестового задания: руководитель ставит финальный ручной балл, нейросеть дает второе мнение.",
      "Удаление или объединение вакансий должно выполняться только после проверки связей с кандидатами, публикациями и активными подборами."
    ]
  };
}

function platformQuestionPrompt(question, context) {
  return [
    "Ты внутренний помощник HR-платформы Бизнес-школы \"Академия менеджмента\".",
    "Отвечай пользователю как практичный эксперт по платформе и подбору персонала.",
    "Пиши только по-русски. Не используй английские служебные слова и англицизмы, кроме названий сервисов HeadHunter и Telegram.",
    "Если вопрос про дубли вакансий, различай: явный дубль, похожие роли, разные роли. Не советуй удалять вакансию без проверки связей.",
    "Если данных платформы недостаточно, прямо скажи, чего не хватает и что проверить.",
    "Ответ должен быть коротким: 2-5 абзацев или короткий список. Без Markdown-таблиц.",
    "",
    "Вопрос пользователя:",
    question,
    "",
    "Контекст платформы в JSON:",
    JSON.stringify(context)
  ].join("\n");
}

function localPlatformQuestionAnswer(question, context) {
  const text = String(question || "").toLowerCase();
  const duplicateGroups = context.duplicateAnalysis?.duplicateGroups || [];
  const vacancies = context.vacancies || [];
  const projectRoles = vacancies.filter(item => /проект|project|проджект|менеджер проектов|маркетолог/i.test(`${item.title} ${item.publicTitle}`));
  if (/дубл|одинаков|повтор|похож/.test(text)) {
    if (duplicateGroups.length) {
      const groupText = duplicateGroups.map(group => group.summary || group.all?.map(item => item.title).join(", ")).filter(Boolean).join(" ");
      return {
        mode: "local",
        answer: `Платформа нашла возможные дубли: ${groupText} Проверьте, описывают ли они одну и ту же роль. Если да, оставьте вакансию с большим числом связей с кандидатами и публикациями, а вторую объедините или закройте после переноса данных.`
      };
    }
    if (projectRoles.length >= 2) {
      return {
        mode: "local",
        answer: "Менеджер проектов и проектный маркетолог не выглядят явными дублями. Обычно первая роль отвечает за управление сроками, задачами, людьми и результатом проекта, а вторая сильнее привязана к маркетинговым запускам, упаковке, воронке, контенту и продвижению. Если в ваших описаниях задачи совпадают на 70-80%, их лучше объединить или переименовать так, чтобы отличие было понятно пользователю."
      };
    }
    return {
      mode: "local",
      answer: `Явных дублей сейчас не видно. Проверено вакансий: ${context.duplicateAnalysis?.totalVacancies || vacancies.length}. Если сомневаетесь по двум ролям, сравните задачи, результат роли, инструменты и канал подбора: при сильном совпадении лучше оставить одну вакансию, при разной зоне ответственности - переименовать роли точнее.`
    };
  }
  return {
    mode: "local",
    answer: `На платформе сейчас ${vacancies.length} ${pluralServer(vacancies.length, "вакансия", "вакансии", "вакансий")}. HeadHunter ${context.headHunterConnected ? "подключен" : "не подключен"}. Задайте вопрос про конкретную вакансию, дубль, отклики, анкету или следующий шаг воронки - я отвечу по данным, которые есть в системе.`
  };
}

async function answerPlatformQuestion(question, session) {
  const context = buildPlatformQuestionContext(session);
  if (AI_PROVIDER === "yandex" && YANDEX_GPT_API_KEY && YANDEX_FOLDER_ID) {
    const response = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
      method: "POST",
      headers: {
        "Authorization": `Api-Key ${YANDEX_GPT_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        modelUri: `gpt://${YANDEX_FOLDER_ID}/${YANDEX_GPT_MODEL}/latest`,
        completionOptions: { stream: false, temperature: 0.15, maxTokens: 1200 },
        messages: [
          { role: "system", text: "Отвечай по-русски, кратко и прикладно. Не используй английские служебные слова." },
          { role: "user", text: platformQuestionPrompt(question, context) }
        ]
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return {
      mode: "yandex",
      answer: cleanText(data.result?.alternatives?.[0]?.message?.text || "", 4000) || localPlatformQuestionAnswer(question, context).answer,
      contextSummary: {
        vacancies: context.vacancies.length,
        duplicateGroups: context.duplicateAnalysis?.duplicateGroups?.length || 0,
        headHunterConnected: context.headHunterConnected
      }
    };
  }

  if (OPENAI_API_KEY) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "Отвечай по-русски, кратко и прикладно. Не используй английские служебные слова." },
          { role: "user", content: platformQuestionPrompt(question, context) }
        ],
        temperature: 0.15
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return {
      mode: "ai",
      answer: cleanText(data.choices?.[0]?.message?.content || "", 4000) || localPlatformQuestionAnswer(question, context).answer,
      contextSummary: {
        vacancies: context.vacancies.length,
        duplicateGroups: context.duplicateAnalysis?.duplicateGroups?.length || 0,
        headHunterConnected: context.headHunterConnected
      }
    };
  }

  const local = localPlatformQuestionAnswer(question, context);
  return {
    ...local,
    contextSummary: {
      vacancies: context.vacancies.length,
      duplicateGroups: context.duplicateAnalysis?.duplicateGroups?.length || 0,
      headHunterConnected: context.headHunterConnected
    }
  };
}

function pluralServer(number, one, few, many) {
  const n = Math.abs(Number(number || 0)) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return many;
  if (n1 > 1 && n1 < 5) return few;
  if (n1 === 1) return one;
  return many;
}

async function buildDraftFromHhVacancy(vacancy) {
  const sourceText = hhVacancySourceText(vacancy);
  try {
    return normalizeVacancyDraft(await callVacancyDraftAi(sourceText), sourceText);
  } catch (error) {
    return normalizeVacancyDraft({ ...localVacancyDraft(sourceText), title: vacancy.name || localVacancyDraft(sourceText).title, mode: "local", aiError: error.message }, sourceText);
  }
}

async function fetchHhVacancyDetails(hhVacancyId) {
  return hhApi(`/vacancies/${encodeURIComponent(hhVacancyId)}`);
}

async function importHhActiveVacancies({ user = null } = {}) {
  const account = await refreshHhAccountIfNeeded();
  if (!account?.accessToken) throw new Error("HeadHunter не подключен.");
  const me = await hhApi("/me").catch(() => null);
  const employerId = me?.employer?.id
    || me?.employers?.[0]?.id
    || me?.manager?.employer?.id
    || me?.manager?.employer_id
    || hhEmployerIdFromAccount(account);
  if (!employerId) throw new Error("Не удалось определить работодателя HeadHunter.");

  const activeVacancies = await listAllHhActiveVacancies(employerId);
  const config = getQuestionnaireConfig();
  const nextConfig = cloneJson(config);
  const rootVacancy = cloneJson(nextConfig);
  delete rootVacancy.vacancies;
  nextConfig.vacancies = nextConfig.vacancies ? { ...nextConfig.vacancies } : { [nextConfig.vacancyCode || "smm"]: rootVacancy };

  const existingPublications = listHhPublications();
  const existingCodes = new Set(vacancyCodes(nextConfig));
  const created = [];
  const linked = [];
  const attached = [];
  const skipped = [];
  const failed = [];

  for (const item of activeVacancies) {
    const hhVacancyId = String(item.id || "").trim();
    if (!hhVacancyId) continue;
    const existing = existingPublications.find(publication => String(publication.hhVacancyId || "") === hhVacancyId);
    if (existing) {
      linked.push({ hhVacancyId, vacancyCode: existing.vacancyCode, title: item.name || "" });
      continue;
    }
    try {
      const details = await fetchHhVacancyDetails(hhVacancyId).catch(() => item);
      const matchedVacancyCode = findExistingVacancyCodeByTitle(details.name || item.name || "", nextConfig);
      if (matchedVacancyCode) {
        let opening = createVacancyOpening({
          vacancyCode: matchedVacancyCode,
          title: vacancyLabelFromConfig(matchedVacancyCode, nextConfig),
          hrOwnerUserId: user?.role === "hr" ? user.userId : null,
          hrOwnerUsername: user?.role === "hr" ? user.username : "",
          reason: "Связана существующая вакансия HeadHunter",
          status: "published",
          payload: {
            recruitmentChannels: ["hh"],
            importedFromHeadHunter: true,
            matchedExistingVacancy: true,
            hhVacancyId,
            hhUrl: details.alternate_url || item.alternate_url || "",
            source: "headhunter_import"
          }
        });
        const text = createHhVacancyText({
          vacancyCode: matchedVacancyCode,
          openingId: opening.id,
          title: details.name || vacancyLabelFromConfig(matchedVacancyCode, nextConfig),
          body: htmlToPlainText(details.description || "") || buildHeadHunterDraft(matchedVacancyCode, opening),
          status: "imported",
          payload: { source: "headhunter_import", hhVacancyId, matchedExistingVacancy: true }
        });
        const publication = createHhPublication({
          vacancyCode: matchedVacancyCode,
          openingId: opening.id,
          hhTextId: text.id,
          hhVacancyId,
          url: details.alternate_url || item.alternate_url || "",
          status: "published",
          publishedAt: details.published_at || details.created_at || item.published_at || item.created_at || null,
          payload: {
            source: "headhunter_import",
            importMode: "read_only",
            matchedExistingVacancy: true,
            note: "Подключена к существующей вакансии платформы без обратной записи на HeadHunter",
            hhMetrics: normalizeHhVacancyMetrics(details),
            hhPromotion: normalizeHhPromotionStatus(item)
          }
        });
        opening = updateVacancyOpening(opening.id, { hhTextId: text.id, hhPublicationId: publication.id, status: "active" }) || opening;
        attached.push({ vacancyCode: matchedVacancyCode, hhVacancyId, title: details.name || item.name || "", openingId: opening.id, publicationId: publication.id });
        continue;
      }
      const draft = await buildDraftFromHhVacancy(details);
      draft.title = cleanText(details.name || draft.title, 120) || draft.title;
      draft.adminTitle = cleanText(details.name || draft.adminTitle || draft.title, 40) || draft.adminTitle;
      const vacancyCode = safeHhVacancyCode(details, [...existingCodes]);
      existingCodes.add(vacancyCode);
      const sourceText = hhVacancySourceText(details);
      const generatedConfig = buildGeneratedVacancyConfig(vacancyCode, draft, sourceText);
      generatedConfig.vacancyArtifacts = {
        ...(generatedConfig.vacancyArtifacts || {}),
        source: "headhunter_import",
        headHunter: {
          id: hhVacancyId,
          url: details.alternate_url || item.alternate_url || "",
          importedAt: new Date().toISOString(),
          status: details.archived ? "archived" : "active",
          area: details.area?.name || "",
          employer: details.employer?.name || ""
        }
      };
      nextConfig.vacancies[vacancyCode] = generatedConfig;

      let opening = createVacancyOpening({
        vacancyCode,
        title: draft.title,
        hrOwnerUserId: user?.role === "hr" ? user.userId : null,
        hrOwnerUsername: user?.role === "hr" ? user.username : "",
        reason: "Импорт активной вакансии из HeadHunter",
        status: "published",
        payload: {
          recruitmentChannels: ["hh"],
          importedFromHeadHunter: true,
          hhVacancyId,
          hhUrl: details.alternate_url || item.alternate_url || "",
          source: "headhunter_import"
        }
      });
      const text = createHhVacancyText({
        vacancyCode,
        openingId: opening.id,
        title: draft.title,
        body: draft.hhText || buildHeadHunterDraft(vacancyCode, opening),
        status: "imported",
        payload: { source: "headhunter_import", hhVacancyId }
      });
      const publication = createHhPublication({
        vacancyCode,
        openingId: opening.id,
        hhTextId: text.id,
        hhVacancyId,
        url: details.alternate_url || item.alternate_url || "",
        status: "published",
        publishedAt: details.published_at || details.created_at || item.published_at || item.created_at || null,
        payload: {
          source: "headhunter_import",
          importMode: "read_only",
          note: "Импортировано из активных вакансий HeadHunter без обратной записи",
          hhMetrics: normalizeHhVacancyMetrics(details),
          hhPromotion: normalizeHhPromotionStatus(item)
        }
      });
      opening = updateVacancyOpening(opening.id, { hhTextId: text.id, hhPublicationId: publication.id, status: "active" }) || opening;
      created.push({ vacancyCode, hhVacancyId, title: draft.title, openingId: opening.id, publicationId: publication.id });
    } catch (error) {
      failed.push({ hhVacancyId, title: item.name || "", error: error.message || String(error) });
    }
  }

  if (created.length) {
    nextConfig.version = Number(nextConfig.version || 1) + 1;
    saveQuestionnaireConfig(nextConfig);
  }

  return {
    employer: { id: String(employerId), name: me?.employer?.name || account.me?.employer?.name || "" },
    fetched: activeVacancies.length,
    created,
    linked,
    attached,
    skipped,
    failed,
    configUpdated: created.length > 0,
    importedAt: new Date().toISOString()
  };
}

let hhVacancyImportInProgress = false;

async function runScheduledHhVacancyImport() {
  if (HH_VACANCY_AUTO_IMPORT_DISABLED || hhVacancyImportInProgress) return;
  const account = getHhIntegrationAccount();
  if (!account?.accessToken) return;
  hhVacancyImportInProgress = true;
  try {
    const result = await importHhActiveVacancies({ user: null });
    if (result.created.length || result.attached.length || result.failed.length) {
      insertAuditLog({
        user: null,
        action: "hh.vacancies.scheduled_import",
        targetType: "integration",
        targetId: "headhunter",
        payload: {
          fetched: result.fetched,
          created: result.created.length,
          attached: result.attached.length,
          linked: result.linked.length,
          failed: result.failed.length
        }
      });
      console.log(`HeadHunter vacancy import: fetched=${result.fetched}, created=${result.created.length}, attached=${result.attached.length}, linked=${result.linked.length}, failed=${result.failed.length}`);
    }
  } catch (error) {
    console.error("HeadHunter vacancy import failed:", error.message || error);
  } finally {
    hhVacancyImportInProgress = false;
  }
}

async function syncHhPublicationMetrics(publication) {
  if (!publication?.hhVacancyId) return publication;
  try {
    const vacancy = await hhApi(`/vacancies/${encodeURIComponent(publication.hhVacancyId)}`);
    const metrics = normalizeHhVacancyMetrics(vacancy);
    return updateHhPublication(publication.id, {
      url: publication.url || metrics.alternateUrl || "",
      status: metrics.archived ? "archived" : (publication.status || "published"),
      publishedAt: publication.publishedAt || vacancy.published_at || vacancy.created_at || null,
      payload: {
        hhMetrics: metrics,
        hhVacancy: {
          id: publication.hhVacancyId,
          name: metrics.name,
          area: metrics.area,
          employer: metrics.employer,
          alternateUrl: metrics.alternateUrl,
          fetchedAt: metrics.fetchedAt
        }
      }
    });
  } catch (error) {
    return updateHhPublication(publication.id, {
      payload: {
        hhMetricsError: {
          message: error.message || "Не удалось получить метрики вакансии HeadHunter.",
          fetchedAt: new Date().toISOString()
        }
      }
    });
  }
}

async function syncHhPublicationResponses(publication) {
  if (!publication?.hhVacancyId) throw new Error("У публикации нет ID вакансии HeadHunter.");
  await syncHhPublicationMetrics(publication);
  const root = await hhApi(`/negotiations?vacancy_id=${encodeURIComponent(publication.hhVacancyId)}`);
  const collectionUrls = collectHhNegotiationCollectionUrls(root.collections || []);
  if (!collectionUrls.length) {
    collectionUrls.push(`/negotiations/response?vacancy_id=${encodeURIComponent(publication.hhVacancyId)}`);
  }
  const seen = new Set();
  const items = [];
  for (const collectionUrl of collectionUrls) {
    const collectionItems = await fetchHhNegotiationItemsFromCollection(collectionUrl, publication);
    for (const item of collectionItems) {
      const id = String(item.id || item.nid || item.negotiation_id || "");
      if (!id || seen.has(id)) continue;
      seen.add(id);
      items.push(item);
    }
  }
  const responses = items
    .map(item => normalizeHhNegotiation(item, publication))
    .filter(item => item.negotiationId)
    .map(item => upsertHhResponse(item));
  return { responses, found: responses.length, collections: collectionUrls.length };
}

function findHhPublicationsByVacancyId(hhVacancyId) {
  const id = String(hhVacancyId || "").trim();
  if (!id) return [];
  return listHhPublications().filter(publication => String(publication.hhVacancyId || "") === id);
}

function publicCandidate(item) {
  return {
    id: item.id,
    vacancyCode: item.vacancyCode,
    submittedAt: item.submittedAt,
    candidate: item.candidate,
    answers: item.answers,
    consents: item.consents,
    score: item.score,
    recommendation: item.recommendation,
    flags: item.flags,
    strengths: item.strengths,
    risks: item.risks,
    hrNote: item.hrNote,
    testAssignment: item.testAssignment,
    interview: item.interview,
    telegramLink: getTelegramLinkByCandidate(item.id),
    communications: listCommunicationsByCandidate(item.id),
    funnelReview: buildCandidateFunnelReview(item)
  };
}

function finalRecommendationByScore(score, hasFinalEvaluation, waitingForTestEvaluation = false, fallbackRecommendation = null) {
  if (waitingForTestEvaluation) {
    return {
      code: "pending",
      label: "Ждем оценку тестового",
      status: "рекомендация на интервью пока не финальная",
      action: "Оцените тестовое задание, чтобы получить суммарную рекомендацию."
    };
  }
  if (!hasFinalEvaluation && fallbackRecommendation) {
    return {
      ...fallbackRecommendation,
      status: fallbackRecommendation.status || "решение принято по анкете",
      action: fallbackRecommendation.action || "Тестовое задание не назначалось: кандидат не прошел порог для следующего этапа."
    };
  }
  if (score >= 75) {
    return {
      code: "green",
      label: "Рекомендован на первое интервью",
      status: "анкета и тестовое достаточно сильные",
      action: "Пригласить на первое интервью с менеджером по персоналу."
    };
  }
  if (score >= 55) {
    return {
      code: "yellow",
      label: "Ручной разбор",
      status: "есть сильные стороны, но тестовое или анкета требуют проверки",
      action: "Разобрать риски вручную перед приглашением на интервью."
    };
  }
  return {
    code: "red",
    label: "Не рекомендован",
    status: "суммарная оценка слабая",
    action: "Не приглашать на интервью без отдельной причины."
  };
}

function normalizeScore(value) {
  const score = Math.round(Number(value || 0));
  return Math.max(0, Math.min(100, score));
}

function buildTestAssignmentReview(testAssignment = {}) {
  const aiEvaluation = testAssignment.evaluation || null;
  const manualReview = testAssignment.manualReview || null;
  const aiScore = aiEvaluation ? normalizeScore(aiEvaluation.score) : null;
  const manualScore = manualReview ? normalizeScore(manualReview.score) : null;
  const hasAi = aiScore !== null;
  const hasManual = manualScore !== null;
  const finalScore = hasAi && hasManual
    ? Math.round(manualScore * 0.7 + aiScore * 0.3)
    : hasManual
      ? manualScore
      : hasAi
        ? aiScore
        : null;
  const difference = hasAi && hasManual ? Math.abs(manualScore - aiScore) : null;
  const comparisonStatus = difference === null
    ? (hasManual ? "waiting_ai" : hasAi ? "waiting_manual" : "waiting_scores")
    : difference <= 15
      ? "aligned"
      : difference <= 25
        ? "manual_review"
        : "conflict";
  const comparisonLabel = {
    waiting_scores: "ждем оценку руководителя и нейросети",
    waiting_ai: "ждем оценку нейросети",
    waiting_manual: "ждем оценку руководителя",
    aligned: "оценки согласованы",
    manual_review: "есть расхождение, нужна ручная проверка",
    conflict: "сильное расхождение оценок"
  }[comparisonStatus];
  return {
    aiScore,
    manualScore,
    finalScore,
    difference,
    comparisonStatus,
    comparisonLabel,
    formula: hasAi && hasManual
      ? "руководитель 70% + ИИ 30%"
      : hasManual
        ? "пока только оценка руководителя"
        : hasAi
          ? "пока только оценка нейросети"
          : "тестовое еще не оценено"
  };
}

function buildCandidateFunnelReview(item) {
  const questionnaireScore = Number(item.score?.total || 0);
  const testReview = buildTestAssignmentReview(item.testAssignment || {});
  const hasAssignedTest = Boolean(item.testAssignment?.eligible);
  const hasTestEvaluation = testReview.finalScore !== null;
  const testScore = hasTestEvaluation ? testReview.finalScore : 0;
  const interviewScore = Number(item.interview?.evaluation?.score || 0);
  const hasInterviewEvaluation = Number.isFinite(interviewScore) && item.interview?.evaluation;
  const waitingForTestEvaluation = hasAssignedTest && !hasTestEvaluation && !hasInterviewEvaluation;
  const totalScore = hasTestEvaluation && hasInterviewEvaluation
    ? Math.round(questionnaireScore * 0.35 + testScore * 0.30 + interviewScore * 0.35)
    : hasTestEvaluation
      ? Math.round(questionnaireScore * 0.6 + testScore * 0.4)
      : hasInterviewEvaluation
        ? Math.round(questionnaireScore * 0.65 + interviewScore * 0.35)
        : questionnaireScore;
  return {
    questionnaireScore,
    testScore: hasTestEvaluation ? testScore : null,
    testReview,
    interviewScore: hasInterviewEvaluation ? interviewScore : null,
    totalScore,
    formula: hasTestEvaluation && hasInterviewEvaluation
      ? "анкета 35% + тестовое 30% + интервью 35%"
      : hasTestEvaluation
        ? "анкета 60% + тестовое 40%"
        : hasInterviewEvaluation
        ? "анкета 65% + интервью 35%"
        : "пока только анкета",
    recommendation: finalRecommendationByScore(
      totalScore,
      hasTestEvaluation || hasInterviewEvaluation,
      waitingForTestEvaluation,
      item.recommendation
    )
  };
}

function getVacancies(config = getQuestionnaireConfig()) {
  const vacancies = config.vacancies || {
    [config.vacancyCode || "smm"]: config
  };
  return Object.fromEntries(Object.entries(vacancies).map(([code, vacancy]) => [
    code,
    {
      code,
      title: vacancy.publicTitle || vacancy.title || code,
      adminTitle: vacancy.adminTitle || vacancy.publicTitle || code,
      active: vacancy.status !== "paused"
    }
  ]));
}

function getVacancyConfig(vacancyCode, config = getQuestionnaireConfig()) {
  const code = vacancyCode || config.activeVacancyCode || config.vacancyCode || "smm";
  return config.vacancies?.[code] || config;
}

function vacancyLabelFromConfig(vacancyCode, config = getQuestionnaireConfig()) {
  if (!vacancyCode) return "";
  const vacancy = getVacancyConfig(vacancyCode, config);
  return vacancy?.adminTitle || vacancy?.publicTitle || vacancy?.title || vacancyCode;
}

function requestedVacancyCode(url, fallback = "smm") {
  return url.searchParams.get("vacancy") || fallback;
}

function testAssignmentConfig(config) {
  return {
    threshold: 80,
    enabledStatuses: ["green"],
    ...(config.testAssignment || {})
  };
}

function isTestAssignmentEligible(record, config) {
  const testConfig = testAssignmentConfig(config);
  return record.score.total >= Number(testConfig.threshold || 80) &&
    (testConfig.enabledStatuses || ["green"]).includes(record.recommendation.code);
}

const VALUE_LABELS_RU = {
  b2b: "Корпоративные проекты",
  b2c: "Проекты для массового потребителя",
  expert: "Экспертные продукты",
  education: "Образовательные проекты",
  consulting: "Консалтинг / услуги",
  premium: "Премиальные продукты",
  personalBrand: "Личный бренд",
  ecommerce: "Интернет-магазины",
  lifestyle: "Развлекательные проекты",
  reach: "Охваты и показы",
  er: "Уровень вовлеченности",
  saves: "Сохранения и репосты",
  follows: "Подписки и отписки",
  leads: "Заявки",
  portfolio: "Резюме и портфолио",
  experience: "Релевантный опыт",
  responsibilities: "Зона ответственности",
  tools: "Инструменты",
  analytics: "Аналитика и рост",
  culture: "Рабочее поведение",
  green: "сильный кандидат",
  yellow: "ручная проверка",
  orange: "резерв",
  red: "отказ",
  Green: "сильный кандидат",
  Yellow: "ручная проверка",
  Orange: "резерв",
  Red: "отказ"
};

function labelValueRu(config, field, value) {
  return config?.labels?.[field]?.[value] || VALUE_LABELS_RU[value] || value;
}

function labelListRu(config, field, values) {
  const list = Array.isArray(values) ? values : [values];
  return list.filter(Boolean).map(value => labelValueRu(config, field, value));
}

async function generateAiInsights(submissions, analytics, config = {}) {
  const fallback = (risk = null) => ({
    mode: "local",
    summary: analytics.summary,
    recommendations: analytics.recommendations,
    risks: risk ? [risk, ...analytics.marketRisks] : analytics.marketRisks
  });

  if (AI_PROVIDER === "yandex") {
    if (!YANDEX_GPT_API_KEY || !YANDEX_FOLDER_ID) {
      return fallback("Анализ нейросетью не выполнен: на сервере не заданы ключ и каталог Яндекс GPT.");
    }
    return generateYandexInsights(submissions, analytics, config).catch(error => (
      fallback(`Анализ нейросетью не выполнен: Яндекс GPT вернул ошибку: ${error.message}.`)
    ));
  }

  if (!OPENAI_API_KEY) {
    return fallback();
  }

  return generateOpenAiInsights(submissions, analytics, config).catch(error => (
    fallback(`Анализ нейросетью не выполнен: внешний нейросетевой сервис вернул ошибку: ${error.message}.`)
  ));
}

function compactSubmissions(submissions, config = {}) {
  return submissions.slice(-40).map(item => ({
    score: item.score.total,
    status: VALUE_LABELS_RU[item.recommendation?.label] || VALUE_LABELS_RU[item.recommendation?.code] || item.recommendation.status,
    projects: labelListRu(config, "projectTypes", item.answers.projectTypes),
    responsibilities: labelListRu(config, "responsibilities", item.answers.responsibilities),
    metrics: labelListRu(config, "metrics", item.answers.metrics),
    income: item.answers.income,
    flags: item.flags.map(flag => flag.title)
  }));
}

function aiPrompt(submissions, analytics, config = {}) {
  return [
    `Ты аналитик по подбору персонала для вакансии "${config.publicTitle || config.title || "специалист"}".`,
    "Проанализируй поток кандидатов и дай короткие практические рекомендации HR.",
    "Нужно выявить: качество рынка, слабые места вакансии, что исправить в описании вакансии, что проверить на интервью.",
    "Не используй английские служебные статусы, технические ключи и англицизмы. Пиши пользовательские термины только по-русски.",
    "Ответ строго JSON: {summary:string,recommendations:string[],risks:string[],interviewFocus:string[]}.",
    JSON.stringify({ analytics, candidates: compactSubmissions(submissions, config) })
  ].join("\n");
}

function parseAiJson(content) {
  const text = String(content || "{}").trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonText = fenced ? fenced[1].trim() : text;
  return JSON.parse(jsonText);
}

async function generateYandexInsights(submissions, analytics, config = {}) {
  const payload = {
    modelUri: `gpt://${YANDEX_FOLDER_ID}/${YANDEX_GPT_MODEL}/latest`,
    completionOptions: {
      stream: false,
      temperature: 0.2,
      maxTokens: 1200
    },
    messages: [
      { role: "system", text: "Отвечай по-русски, кратко, прикладно, без воды. Не используй английские служебные слова и технические ключи. Верни только валидный JSON без Markdown." },
      { role: "user", text: aiPrompt(submissions, analytics, config) }
    ]
  };

  const response = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
    method: "POST",
    headers: {
      "Authorization": `Api-Key ${YANDEX_GPT_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  const content = data.result?.alternatives?.[0]?.message?.text || "{}";
  return { mode: "yandex", ...parseAiJson(content) };
}

async function generateOpenAiInsights(submissions, analytics, config = {}) {
  const prompt = aiPrompt(submissions, analytics, config);

  const payload = {
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: "Отвечай по-русски, кратко, прикладно, без воды. Не используй английские служебные слова и технические ключи." },
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
    response_format: { type: "json_object" }
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  return { mode: "ai", ...parseAiJson(content) };
}

function extractGoogleFileId(link) {
  const text = String(link || "");
  return text.match(/\/document\/d\/([^/]+)/)?.[1] ||
    text.match(/\/file\/d\/([^/]+)/)?.[1] ||
    text.match(/[?&]id=([^&]+)/)?.[1] ||
    null;
}

async function fetchTestAssignmentText(link) {
  const id = extractGoogleFileId(link);
  if (!id) throw new Error("Не удалось определить идентификатор Google-документа.");
  const urls = [
    `https://docs.google.com/document/d/${id}/export?format=txt`,
    `https://drive.google.com/uc?export=download&id=${id}`
  ];
  let lastError = null;
  for (const exportUrl of urls) {
    try {
      const response = await fetch(exportUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (text.trim().length > 80 && !/<html/i.test(text.slice(0, 500))) {
        return text.slice(0, 18000);
      }
      lastError = new Error("документ вернул пустой текст или HTML-страницу");
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Не удалось прочитать Google-документ. Проверьте доступ по ссылке: ${lastError?.message || "нет данных"}.`);
}

function testAssignmentPrompt(record, config, text) {
  const criteria = config.testAssignment?.evaluationCriteria || [];
  return [
    `Ты оцениваешь тестовое задание кандидата на вакансию "${config.publicTitle || config.title}".`,
    "Оцени только по содержанию выполненного тестового задания. Не придумывай факты, которых нет в тексте.",
    "Верни строго JSON без Markdown: {score:number,summary:string,strengths:string[],risks:string[],criteria:{title:string,score:number,max:number,comment:string}[],recommendation:string,interviewQuestions:string[]}.",
    "score - итоговая оценка от 0 до 100.",
    "recommendation - одно короткое решение: пригласить на первое интервью / ручной разбор / отказ.",
    JSON.stringify({
      candidate: {
        score: record.score?.total,
        vacancyCode: record.vacancyCode,
        answers: record.answers
      },
      testAssignment: {
        title: config.testAssignment?.title,
        instruction: config.testAssignment?.instruction,
        criteria
      },
      submittedText: text
    })
  ].join("\n");
}

function localTestAssignmentEvaluation(record, config, text, reason = null) {
  const lower = String(text || "").toLowerCase();
  const signals = [
    "срок", "задач", "ответствен", "риск", "чек", "ссыл", "форм", "письм", "вебинар", "отчет", "продаж", "метрик"
  ];
  const hits = signals.filter(signal => lower.includes(signal)).length;
  const score = Math.max(20, Math.min(85, 25 + hits * 5 + Math.min(20, Math.floor(String(text || "").length / 800))));
  return {
    mode: "local",
    score,
    summary: reason
      ? `Автоматическая ИИ-оценка не выполнена: ${reason}. Выполнена локальная предварительная оценка по структуре текста.`
      : "Локальная предварительная оценка по структуре текста.",
    strengths: hits >= 6 ? ["в работе есть признаки структуры, сроков, рисков и проверок"] : ["есть выполненный материал, требуется ручной разбор"],
    risks: hits < 6 ? ["мало явных признаков проектной структуры в тексте"] : [],
    criteria: [],
    recommendation: score >= 70 ? "пригласить на первое интервью" : score >= 55 ? "ручной разбор" : "отказ",
    interviewQuestions: ["Попросить кандидата объяснить логику плана, приоритеты и работу с рисками."]
  };
}

async function evaluateTestAssignment(record, config) {
  const link = record.testAssignment?.link;
  if (!link) throw new Error("Кандидат еще не прикрепил ссылку на результат тестового задания.");
  const text = await fetchTestAssignmentText(link);
  const prompt = testAssignmentPrompt(record, config, text);

  if (AI_PROVIDER === "yandex" && YANDEX_GPT_API_KEY && YANDEX_FOLDER_ID) {
    try {
      const payload = {
        modelUri: `gpt://${YANDEX_FOLDER_ID}/${YANDEX_GPT_MODEL}/latest`,
        completionOptions: { stream: false, temperature: 0.2, maxTokens: 1800 },
        messages: [
          { role: "system", text: "Отвечай по-русски, кратко, прикладно. Верни только валидный JSON без Markdown." },
          { role: "user", text: prompt }
        ]
      };
      const response = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
        method: "POST",
        headers: {
          "Authorization": `Api-Key ${YANDEX_GPT_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const content = data.result?.alternatives?.[0]?.message?.text || "{}";
      return { mode: "yandex", ...parseAiJson(content) };
    } catch (error) {
      return localTestAssignmentEvaluation(record, config, text, `YandexGPT вернул ошибку: ${error.message}`);
    }
  }

  if (OPENAI_API_KEY) {
    try {
      const payload = {
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "Отвечай по-русски, кратко, прикладно. Верни только валидный JSON без Markdown." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      };
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "{}";
      return { mode: "openai", ...parseAiJson(content) };
    } catch (error) {
      return localTestAssignmentEvaluation(record, config, text, `OpenAI вернул ошибку: ${error.message}`);
    }
  }

  return localTestAssignmentEvaluation(record, config, text, "не настроен ключ YandexGPT/OpenAI");
}

function normalizeInterviewDraft(payload = {}) {
  return {
    status: payload.status || "draft",
    interviewer: String(payload.interviewer || "").trim(),
    interviewDate: String(payload.interviewDate || "").trim(),
    scriptNotes: payload.scriptNotes && typeof payload.scriptNotes === "object" ? payload.scriptNotes : {},
    scorecard: payload.scorecard && typeof payload.scorecard === "object" ? payload.scorecard : {},
    cases: payload.cases && typeof payload.cases === "object" ? payload.cases : {},
    decision: payload.decision && typeof payload.decision === "object" ? payload.decision : {},
    savedAt: new Date().toISOString()
  };
}

function interviewPrompt(record, config, interview) {
  const methodology = config.interview || {};
  return [
    `Ты HR-эксперт. Оцени интервью кандидата на вакансию "${config.publicTitle || config.title}".`,
    "Методология: структурированное интервью с проективными вопросами и кейсами. Нельзя решать по общему впечатлению, только по фактам, цитатам и оценкам интервьюера.",
    "Верни строго JSON без Markdown: {score:number,summary:string,strengths:string[],risks:string[],competencyFindings:{title:string,score:number,comment:string}[],recommendation:string,nextSteps:string[],interviewQuestionsToClarify:string[]}.",
    "score - итоговая оценка интервью от 0 до 100.",
    "recommendation - одно короткое решение: двигать дальше / ручной разбор / отказ / резерв.",
    JSON.stringify({
      candidate: {
        vacancyCode: record.vacancyCode,
        questionnaireScore: record.score?.total,
        questionnaireRecommendation: record.recommendation,
        testEvaluation: record.testAssignment?.evaluation || null
      },
      methodology: {
        principles: methodology.principles,
        scorecard: methodology.scorecard,
        decisionFields: methodology.decisionFields
      },
      interview
    })
  ].join("\n");
}

function localInterviewEvaluation(record, config, interview, reason = null) {
  const entries = Object.values(interview.scorecard || {});
  const scores = entries.map(item => Number(item.score || 0)).filter(value => value > 0);
  const avg = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0;
  const score = scores.length ? Math.round((avg / 5) * 100) : 0;
  const text = JSON.stringify(interview).toLowerCase();
  const riskHints = ["не", "сомнен", "риск", "слаб", "конфликт", "хаос", "уходит", "нет данных"].filter(word => text.includes(word));
  return {
    mode: "local",
    score,
    summary: reason
      ? `ИИ-оценка интервью не выполнена: ${reason}. Выполнена локальная оценка по выставленным баллам.`
      : "Локальная оценка по баллам оценочного листа.",
    strengths: score >= 70 ? ["по оценочному листу кандидат показывает достаточный уровень"] : [],
    risks: riskHints.length ? ["в заметках есть маркеры риска, нужен ручной разбор"] : [],
    competencyFindings: (config.interview?.scorecard || []).map(item => ({
      title: item.title,
      score: Number(interview.scorecard?.[item.id]?.score || 0),
      comment: interview.scorecard?.[item.id]?.notes || ""
    })),
    recommendation: score >= 75 ? "двигать дальше" : score >= 55 ? "ручной разбор" : "отказ",
    nextSteps: score >= 75 ? ["передать кандидата на следующий этап"] : ["провести ручную сверку фактов и рисков"],
    interviewQuestionsToClarify: ["Уточнить спорные компетенции, где оценка ниже 4 или нет фактов в заметках."]
  };
}

async function evaluateInterview(record, config, interview) {
  const prompt = interviewPrompt(record, config, interview);

  if (AI_PROVIDER === "yandex" && YANDEX_GPT_API_KEY && YANDEX_FOLDER_ID) {
    try {
      const payload = {
        modelUri: `gpt://${YANDEX_FOLDER_ID}/${YANDEX_GPT_MODEL}/latest`,
        completionOptions: { stream: false, temperature: 0.2, maxTokens: 1800 },
        messages: [
          { role: "system", text: "Отвечай по-русски, кратко, прикладно. Верни только валидный JSON без Markdown." },
          { role: "user", text: prompt }
        ]
      };
      const response = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
        method: "POST",
        headers: {
          "Authorization": `Api-Key ${YANDEX_GPT_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const content = data.result?.alternatives?.[0]?.message?.text || "{}";
      return { mode: "yandex", ...parseAiJson(content) };
    } catch (error) {
      return localInterviewEvaluation(record, config, interview, `YandexGPT вернул ошибку: ${error.message}`);
    }
  }

  if (OPENAI_API_KEY) {
    try {
      const payload = {
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "Отвечай по-русски, кратко, прикладно. Верни только валидный JSON без Markdown." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      };
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "{}";
      return { mode: "openai", ...parseAiJson(content) };
    } catch (error) {
      return localInterviewEvaluation(record, config, interview, `OpenAI вернул ошибку: ${error.message}`);
    }
  }

  return localInterviewEvaluation(record, config, interview, "не настроен ключ YandexGPT/OpenAI");
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean);

  if (req.method === "GET" && url.pathname === "/api/legal") {
    return sendJson(res, 200, { version: LEGAL_VERSION });
  }

  if (req.method === "POST" && url.pathname === "/api/telegram/webhook") {
    if (!TELEGRAM_WEBHOOK_SECRET || url.searchParams.get("token") !== TELEGRAM_WEBHOOK_SECRET) {
      return sendJson(res, 403, { error: "Forbidden" });
    }
    const payload = await readBody(req);
    try {
      const result = await processTelegramWebhook(payload);
      return sendJson(res, 200, { ok: true, ...result });
    } catch (error) {
      insertAuditLog({
        user: null,
        action: "telegram.webhook.error",
        targetType: "telegram_webhook",
        targetId: String(payload?.update_id || ""),
        payload: { error: error.message }
      });
      return sendJson(res, 500, { error: "Telegram webhook processing failed" });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/hh/webhook") {
    if (!HH_WEBHOOK_SECRET || url.searchParams.get("token") !== HH_WEBHOOK_SECRET) {
      return sendJson(res, 403, { error: "Forbidden" });
    }
    const payload = await readBody(req);
    try {
      const result = await processHhWebhookEvent(payload);
      if (result.duplicate) return sendJson(res, 409, { ok: true, duplicate: true });
      return sendJson(res, 200, { ok: true, ...result });
    } catch (error) {
      insertAuditLog({
        user: null,
        action: "hh.webhook.error",
        targetType: "hh_webhook",
        targetId: String(payload?.id || ""),
        payload: { error: error.message, actionType: payload?.action_type || "" }
      });
      return sendJson(res, 500, { error: "Webhook processing failed" });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/uploads/resume") {
    try {
      const raw = await readRawBody(req);
      const uploaded = parseMultipartFile(raw, req.headers["content-type"]);
      const fileName = safeResumeFileName(uploaded.originalName);
      await fs.mkdir(resumeUploadDir, { recursive: true });
      await fs.writeFile(path.join(resumeUploadDir, fileName), uploaded.buffer);
      return sendJson(res, 201, {
        file: {
          id: fileName,
          originalName: uploaded.originalName,
          mimeType: uploaded.mimeType,
          size: uploaded.buffer.length,
          url: `/api/admin/uploads/resumes/${encodeURIComponent(fileName)}`
        }
      });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || "Не удалось загрузить файл." });
    }
  }

  if (req.method === "GET" && url.pathname === "/api/config") {
    const baseConfig = getQuestionnaireConfig();
    const vacancyCode = requestedVacancyCode(url, baseConfig.activeVacancyCode || "smm");
    return sendJson(res, 200, {
      config: getVacancyConfig(vacancyCode, baseConfig),
      vacancyCode,
      vacancies: getVacancies(baseConfig),
      integrations: {
        telegramBotUsername: TELEGRAM_BOT_USERNAME,
        telegramAvailable: Boolean(TELEGRAM_BOT_USERNAME)
      }
    });
  }

  if (req.method === "POST" && url.pathname === "/api/events") {
    const payload = await readBody(req);
    insertEvent({
      sessionId: payload.sessionId,
      vacancyCode: payload.vacancyCode || requestedVacancyCode(url),
      eventType: payload.eventType,
      step: payload.step,
      payload: {
        path: url.pathname,
        referrer: req.headers.referer || "",
        userAgent: req.headers["user-agent"] || ""
      }
    });
    return sendJson(res, 201, { ok: true });
  }

  if (req.method === "POST" && url.pathname === "/api/submissions") {
    const payload = await readBody(req);
    if (!payload.consents?.privacy || !payload.consents?.dataProcessing) {
      return sendJson(res, 400, { error: "Both legal consents are required" });
    }
    const baseConfig = getQuestionnaireConfig();
    const vacancyCode = String(payload.vacancyCode || payload.answers?.vacancyCode || baseConfig.activeVacancyCode || "smm");
    const config = getVacancyConfig(vacancyCode, baseConfig);
    const scored = scoreSubmission(payload, config);
    const consentTimestamp = new Date().toISOString();
    const forwardedFor = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    const record = {
      id: crypto.randomUUID(),
      vacancyCode,
      submittedAt: consentTimestamp,
      candidate: scored.candidate,
      answers: {
        ...scored.answers,
        vacancyCode
      },
      consents: {
        privacy: {
          accepted: true,
          version: LEGAL_VERSION.privacy,
          acceptedAt: consentTimestamp,
          url: "/privacy"
        },
        dataProcessing: {
          accepted: true,
          version: LEGAL_VERSION.personalDataConsent,
          acceptedAt: consentTimestamp,
          url: "/personal-data-consent"
        },
        source: {
          ip: forwardedFor || req.socket.remoteAddress || "",
          userAgent: req.headers["user-agent"] || ""
        }
      },
      score: scored.score,
      recommendation: scored.recommendation,
      flags: scored.flags,
      strengths: scored.strengths,
      risks: scored.risks,
      hrNote: scored.hrNote,
      testAssignment: {
        eligible: false,
        status: "not_assigned"
      }
    };
    const eligible = isTestAssignmentEligible(record, config);
    record.testAssignment = {
      eligible,
      status: eligible ? "assigned" : "not_assigned",
      threshold: testAssignmentConfig(config).threshold,
      assignedAt: eligible ? consentTimestamp : null
    };
    insertSubmission(record);
    queueCandidateEmailAsync(record, eligible ? "test_assignment_invite" : "questionnaire_completed", {
      source: "questionnaire_submission",
      recommendation: record.recommendation?.code || "",
      score: record.score?.total ?? null
    });
    sendBitrixNotificationAsync(record, "questionnaire_submitted");
    return sendJson(res, 201, {
      id: record.id,
      score: record.score,
      recommendation: record.recommendation,
      nextStep: {
        testAssignmentEligible: eligible,
        testAssignmentUrl: eligible ? `/v/${encodeURIComponent(vacancyCode)}#test/${record.id}` : null,
        telegramBotUrl: telegramBotDeepLink(record.id)
      }
    });
  }

  if (req.method === "POST" && parts[0] === "api" && parts[1] === "submissions" && parts[3] === "test-assignment" && parts.length === 4) {
    const id = parts[2];
    const payload = await readBody(req);
    const testLink = String(payload.testLink || "").trim();
    if (!/^https:\/\/(docs\.google\.com|drive\.google\.com)\//i.test(testLink)) {
      return sendJson(res, 400, { error: "Укажите ссылку на Google Документ или Google Drive." });
    }
    const record = getSubmission(id);
    if (!record) return sendJson(res, 404, { error: "Submission not found" });
    if (!record.testAssignment?.eligible) return sendJson(res, 403, { error: "Test assignment is not available for this submission" });
    const updated = updateTestAssignment(id, {
      ...record.testAssignment,
      status: "submitted",
      link: testLink,
      submittedAt: new Date().toISOString()
    });
    queueCandidateEmailAsync(updated, "test_assignment_received", {
      source: "test_assignment_submission",
      link: testLink
    });
    sendBitrixNotificationAsync(updated, "test_assignment_submitted");
    return sendJson(res, 200, { ok: true, testAssignment: updated.testAssignment });
  }

  if (req.method === "POST" && parts[0] === "api" && parts[1] === "submissions" && parts[3] === "test-assignment" && parts[4] === "viewed") {
    const id = parts[2];
    const record = getSubmission(id);
    if (!record) return sendJson(res, 404, { error: "Submission not found" });
    if (!record.testAssignment?.eligible) return sendJson(res, 403, { error: "Test assignment is not available for this submission" });
    if (["submitted", "evaluated"].includes(record.testAssignment.status)) {
      return sendJson(res, 200, { ok: true, testAssignment: record.testAssignment });
    }
    const updated = updateTestAssignment(id, {
      ...record.testAssignment,
      status: "issued",
      issuedAt: record.testAssignment.issuedAt || new Date().toISOString()
    });
    return sendJson(res, 200, { ok: true, testAssignment: updated.testAssignment });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const payload = await readBody(req);
    const user = authenticate(payload.username || "", payload.password || "");
    if (!user) return sendJson(res, 401, { error: "Invalid credentials" });
    const session = createSession(user.id);
    insertAuditLog({ user, action: "auth.login", targetType: "user", targetId: user.id });
    return sendJson(res, 200, { user }, {
      "Set-Cookie": cookieHeader("hr_session", session.token, { expires: session.expiresAt })
    });
  }

  if (req.method === "GET" && url.pathname === "/api/auth/me") {
    const session = getSession(req);
    if (!session) return sendJson(res, 401, { error: "Unauthorized" });
    return sendJson(res, 200, { user: publicSessionUser(session) });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/logout") {
    const session = getSession(req);
    const token = parseCookies(req).hr_session;
    deleteSession(token);
    if (session) insertAuditLog({ user: session, action: "auth.logout", targetType: "user", targetId: session.userId });
    return sendJson(res, 200, { ok: true }, {
      "Set-Cookie": cookieHeader("hr_session", "", { maxAge: 0 })
    });
  }

  if (req.method === "GET" && url.pathname === "/api/hh/oauth/callback") {
    const session = getSession(req);
    if (!session) {
      res.writeHead(302, { Location: "/#admin" });
      return res.end();
    }
    if (!(session.role === "owner" || session.role === "hr")) {
      res.writeHead(302, { Location: "/#admin?hh=forbidden" });
      return res.end();
    }
    if (!hhConfigured()) {
      res.writeHead(302, { Location: "/#admin?hh=not_configured" });
      return res.end();
    }
    const code = url.searchParams.get("code");
    if (!code) {
      res.writeHead(302, { Location: "/#admin?hh=no_code" });
      return res.end();
    }
    try {
      const tokenData = await hhTokenRequest({
        grant_type: "authorization_code",
        client_id: HH_CLIENT_ID,
        client_secret: HH_CLIENT_SECRET,
        redirect_uri: HH_REDIRECT_URI,
        code
      });
      saveHhIntegrationAccount({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: hhTokenExpiresAt(tokenData),
        status: "connected"
      });
      const me = await hhApi("/me").catch(error => ({ error: error.message }));
      saveHhIntegrationAccount({ me, status: "connected" });
      insertAuditLog({ user: session, action: "hh.oauth.connected", targetType: "integration", targetId: "headhunter" });
      res.writeHead(302, { Location: "/#admin/hh" });
      return res.end();
    } catch (error) {
      res.writeHead(302, { Location: `/#admin/hh?error=${encodeURIComponent(error.message)}` });
      return res.end();
    }
  }

  const adminSession = url.pathname.startsWith("/api/admin/") ? requireAdmin(req, res) : null;
  if (url.pathname.startsWith("/api/admin/") && !adminSession) return;

  if (req.method === "GET" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "uploads" && parts[3] === "resumes" && parts[4]) {
    const fileName = path.basename(decodeURIComponent(parts[4]));
    const ext = path.extname(fileName).toLowerCase();
    if (!ALLOWED_RESUME_EXTENSIONS.has(ext)) return sendJson(res, 400, { error: "Unsupported file type" });
    const filePath = path.join(resumeUploadDir, fileName);
    try {
      const file = await fs.readFile(filePath);
      res.writeHead(200, {
        "Content-Type": mime[ext] || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "private, no-store"
      });
      return res.end(file);
    } catch {
      return sendJson(res, 404, { error: "Файл не найден." });
    }
  }

  if (req.method === "GET" && url.pathname === "/api/admin/submissions") {
    const baseConfig = getQuestionnaireConfig();
    const allowed = allowedVacancyCodes(adminSession, vacancyCodes(baseConfig));
    const requestedVacancy = url.searchParams.get("vacancy");
    const vacancyCode = requestedVacancy && allowed.includes(requestedVacancy) ? requestedVacancy : allowed[0];
    if (!vacancyCode) return sendJson(res, 403, { error: "Нет доступа к вакансиям." });
    const submissions = vacancyCode ? listSubmissionsByVacancy(vacancyCode) : listSubmissions();
    return sendJson(res, 200, { vacancyCode, submissions: submissions.map(publicCandidate) });
  }

  if (req.method === "POST" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "submissions" && parts[4] === "test-assignment" && parts[5] === "evaluate") {
    const id = parts[3];
    const record = getSubmission(id);
    if (!record) return sendJson(res, 404, { error: "Not found" });
    if (!canWriteVacancy(adminSession, record.vacancyCode)) return sendJson(res, 403, { error: "Нет прав на оценку тестового по этой вакансии." });
    if (!record.testAssignment?.link) {
      return sendJson(res, 400, { error: "Кандидат еще не прикрепил ссылку на результат тестового задания." });
    }
    const baseConfig = getQuestionnaireConfig();
    const config = getVacancyConfig(record.vacancyCode, baseConfig);
    const evaluation = await evaluateTestAssignment(record, config);
    const normalizedEvaluation = {
      ...evaluation,
      score: Math.max(0, Math.min(100, Math.round(Number(evaluation.score || 0)))),
      evaluatedAt: new Date().toISOString()
    };
    const updated = updateTestAssignment(id, {
      ...record.testAssignment,
      status: "evaluated",
      evaluation: normalizedEvaluation
    });
    insertAuditLog({
      user: adminSession,
      action: "test_assignment.evaluate",
      targetType: "submission",
      targetId: id,
      vacancyCode: record.vacancyCode,
      payload: { score: normalizedEvaluation.score }
    });
    return sendJson(res, 200, {
      ok: true,
      submission: publicCandidate(updated)
    });
  }

  if (req.method === "PUT" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "submissions" && parts[4] === "test-assignment" && parts[5] === "manual-review") {
    const id = parts[3];
    const record = getSubmission(id);
    if (!record) return sendJson(res, 404, { error: "Not found" });
    if (!canManageVacancy(adminSession, record.vacancyCode)) return sendJson(res, 403, { error: "Нет доступа к этой вакансии." });
    if (!record.testAssignment?.link) {
      return sendJson(res, 400, { error: "Кандидат еще не прикрепил ссылку на результат тестового задания." });
    }
    const payload = await readBody(req);
    const score = normalizeScore(payload.score);
    const manualReview = {
      score,
      decision: String(payload.decision || "").trim(),
      comment: String(payload.comment || "").trim(),
      reviewer: adminSession.displayName || adminSession.username,
      reviewerUsername: adminSession.username,
      reviewedAt: new Date().toISOString()
    };
    const currentStatus = record.testAssignment.status || "submitted";
    const updated = updateTestAssignment(id, {
      ...record.testAssignment,
      status: currentStatus === "evaluated" ? "evaluated" : "manual_reviewed",
      manualReview
    });
    insertAuditLog({
      user: adminSession,
      action: "test_assignment.manual_review",
      targetType: "submission",
      targetId: id,
      vacancyCode: record.vacancyCode,
      payload: { score, decision: manualReview.decision }
    });
    return sendJson(res, 200, {
      ok: true,
      submission: publicCandidate(updated)
    });
  }

  if (req.method === "PUT" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "submissions" && parts[4] === "interview") {
    const id = parts[3];
    const record = getSubmission(id);
    if (!record) return sendJson(res, 404, { error: "Not found" });
    if (!canManageVacancy(adminSession, record.vacancyCode)) return sendJson(res, 403, { error: "Нет доступа к этой вакансии." });
    const payload = await readBody(req);
    const draft = normalizeInterviewDraft(payload.interview || payload || {});
    const updated = updateInterview(id, {
      ...draft,
      status: draft.status || "draft"
    });
    insertAuditLog({
      user: adminSession,
      action: "interview.save",
      targetType: "submission",
      targetId: id,
      vacancyCode: record.vacancyCode,
      payload: { interviewer: draft.interviewer || "" }
    });
    return sendJson(res, 200, {
      ok: true,
      submission: publicCandidate(updated)
    });
  }

  if (req.method === "POST" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "submissions" && parts[4] === "interview" && parts[5] === "evaluate") {
    const id = parts[3];
    const record = getSubmission(id);
    if (!record) return sendJson(res, 404, { error: "Not found" });
    if (!canWriteVacancy(adminSession, record.vacancyCode)) return sendJson(res, 403, { error: "Нет прав на оценку интервью по этой вакансии." });
    const payload = await readBody(req);
    const interview = payload.interview ? normalizeInterviewDraft(payload.interview) : normalizeInterviewDraft(record.interview || {});
    const hasEvidence = Object.keys(interview.scorecard || {}).length || Object.keys(interview.cases || {}).length || Object.keys(interview.scriptNotes || {}).length;
    if (!hasEvidence) return sendJson(res, 400, { error: "Сначала заполните хотя бы часть оценочного листа или заметок интервью." });
    const baseConfig = getQuestionnaireConfig();
    const config = getVacancyConfig(record.vacancyCode, baseConfig);
    const evaluation = await evaluateInterview(record, config, interview);
    const normalizedEvaluation = {
      ...evaluation,
      score: Math.max(0, Math.min(100, Math.round(Number(evaluation.score || 0)))),
      evaluatedAt: new Date().toISOString()
    };
    const updated = updateInterview(id, {
      ...interview,
      status: "evaluated",
      evaluation: normalizedEvaluation,
      evaluatedAt: normalizedEvaluation.evaluatedAt
    });
    insertAuditLog({
      user: adminSession,
      action: "interview.evaluate",
      targetType: "submission",
      targetId: id,
      vacancyCode: record.vacancyCode,
      payload: { score: normalizedEvaluation.score }
    });
    return sendJson(res, 200, {
      ok: true,
      submission: publicCandidate(updated)
    });
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/admin/submissions/")) {
    const id = url.pathname.split("/").pop();
    const record = getSubmission(id);
    if (!record) return sendJson(res, 404, { error: "Not found" });
    if (!canManageVacancy(adminSession, record.vacancyCode)) return sendJson(res, 403, { error: "Нет доступа к этой вакансии." });
    return sendJson(res, 200, { submission: publicCandidate(record) });
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/admin/submissions/")) {
    const id = url.pathname.split("/").pop();
    const record = getSubmission(id);
    if (!record) return sendJson(res, 404, { error: "Not found" });
    if (!canWriteVacancy(adminSession, record.vacancyCode)) return sendJson(res, 403, { error: "Нет прав на удаление кандидата по этой вакансии." });
    const deleted = deleteSubmission(id);
    if (!deleted) return sendJson(res, 404, { error: "Not found" });
    insertAuditLog({
      user: adminSession,
      action: "submission.delete",
      targetType: "submission",
      targetId: id,
      vacancyCode: record.vacancyCode,
      payload: { candidate: record.candidate?.fullName || "" }
    });
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/analytics") {
    const baseConfig = getQuestionnaireConfig();
    const allowed = allowedVacancyCodes(adminSession, vacancyCodes(baseConfig));
    const requestedVacancy = url.searchParams.get("vacancy");
    const vacancyCode = requestedVacancy && allowed.includes(requestedVacancy) ? requestedVacancy : allowed[0];
    if (!vacancyCode) return sendJson(res, 403, { error: "Нет доступа к вакансиям." });
    const submissions = vacancyCode ? listSubmissionsByVacancy(vacancyCode) : listSubmissions();
    const events = vacancyCode ? listEvents().filter(event => event.vacancyCode === vacancyCode) : listEvents();
    const analytics = buildFlowAnalytics(submissions, events);
    return sendJson(res, 200, { vacancyCode, analytics });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/config") {
    const config = getQuestionnaireConfig();
    const visible = visibleVacancies(adminSession, config);
    const visibleConfig = adminSession.role === "owner" || adminSession.role === "hr"
      ? config
      : {
        ...config,
        vacancies: Object.fromEntries(Object.keys(visible).map(code => [code, config.vacancies?.[code]]).filter(([, value]) => Boolean(value)))
      };
    return sendJson(res, 200, { config: visibleConfig, vacancies: visible });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/vacancy-duplicate-analysis") {
    return sendJson(res, 200, findVacancyDuplicateGroups(adminSession));
  }

  if (req.method === "POST" && url.pathname === "/api/admin/platform-question") {
    const payload = await readBody(req);
    const question = cleanText(payload.question, 1000);
    if (question.length < 4) return sendJson(res, 400, { error: "Напишите вопрос чуть подробнее." });
    try {
      const result = await answerPlatformQuestion(question, adminSession);
      insertAuditLog({
        user: adminSession,
        action: "platform.question",
        targetType: "assistant",
        targetId: "platform",
        payload: {
          question: question.slice(0, 300),
          mode: result.mode,
          contextSummary: result.contextSummary
        }
      });
      return sendJson(res, 200, {
        ok: true,
        question,
        answer: result.answer,
        mode: result.mode,
        contextSummary: result.contextSummary,
        answeredAt: new Date().toISOString()
      });
    } catch (error) {
      const context = buildPlatformQuestionContext(adminSession);
      const fallback = localPlatformQuestionAnswer(question, context);
      return sendJson(res, 200, {
        ok: true,
        question,
        answer: `${fallback.answer}\n\nНейросетевой ответ временно недоступен: ${error.message}.`,
        mode: "local",
        contextSummary: {
          vacancies: context.vacancies.length,
          duplicateGroups: context.duplicateAnalysis?.duplicateGroups?.length || 0,
          headHunterConnected: context.headHunterConnected
        },
        answeredAt: new Date().toISOString()
      });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/admin/vacancy-draft") {
    if (!(adminSession.role === "owner" || adminSession.role === "hr" || adminSession.role === "hiring_manager")) {
      return sendJson(res, 403, { error: "Создавать вакансию может владелец, HR или руководитель-заказчик." });
    }
    const payload = await readBody(req);
    const sourceText = cleanText(payload.sourceText, 12000);
    if (sourceText.length < 20) return sendJson(res, 400, { error: "Опишите вакансию подробнее." });
    const questions = vacancyBriefGaps(sourceText).slice(0, 5);
    if (!payload.forceDraft && questions.length) {
      return sendJson(res, 200, { complete: false, questions });
    }
    let draft;
    try {
      draft = normalizeVacancyDraft(await callVacancyDraftAi(sourceText), sourceText);
    } catch (error) {
      draft = normalizeVacancyDraft({ ...localVacancyDraft(sourceText), mode: "local", aiError: error.message }, sourceText);
    }
    return sendJson(res, 200, { complete: true, mode: draft.mode || "local", draft });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/vacancies") {
    if (!(adminSession.role === "owner" || adminSession.role === "hr" || adminSession.role === "hiring_manager")) {
      return sendJson(res, 403, { error: "Сохранять вакансию может владелец, HR или руководитель-заказчик." });
    }
    const payload = await readBody(req);
    const draft = normalizeVacancyDraft(payload.draft || {}, payload.draft?.sourceText || "");
    const config = getQuestionnaireConfig();
    const existingCodes = vacancyCodes(config);
    const vacancyCode = makeVacancyCode(draft.title, existingCodes);
    const nextConfig = cloneJson(config);
    const rootVacancy = cloneJson(nextConfig);
    delete rootVacancy.vacancies;
    nextConfig.vacancies = nextConfig.vacancies ? { ...nextConfig.vacancies } : { [nextConfig.vacancyCode || "smm"]: rootVacancy };
    nextConfig.vacancies[vacancyCode] = buildGeneratedVacancyConfig(vacancyCode, draft, payload.draft?.sourceText || "");
    nextConfig.version = Number(nextConfig.version || 1) + 1;
    const savedConfig = saveQuestionnaireConfig(nextConfig);
    if (adminSession.role === "hiring_manager") {
      const access = Array.isArray(adminSession.vacancyAccess) ? adminSession.vacancyAccess : [];
      updateUser(adminSession.userId, { vacancyAccess: [...new Set([...access, vacancyCode])] });
    }
    insertAuditLog({ user: adminSession, action: "vacancy.create", targetType: "vacancy", targetId: vacancyCode, vacancyCode, payload: { title: draft.title } });
    return sendJson(res, 201, {
      vacancyCode,
      vacancy: getVacancies(savedConfig)[vacancyCode],
      config: savedConfig.vacancies?.[vacancyCode]
    });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/hiring-requests") {
    return sendJson(res, 200, {
      requests: filterByVacancyAccess(adminSession, listHiringRequests(), item => item.vacancyCode)
    });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/hiring-requests") {
    const payload = await readBody(req);
    const vacancyCode = payload.vacancyCode || "";
    if (vacancyCode && !canManageVacancy(adminSession, vacancyCode)) {
      return sendJson(res, 403, { error: "Нет доступа к этой вакансии." });
    }
    const request = createHiringRequest({
      createdByUserId: adminSession.userId,
      createdByUsername: adminSession.username,
      requestType: payload.requestType || (vacancyCode ? "start_existing" : "new_vacancy"),
      vacancyCode,
      title: payload.title || vacancyLabelFromConfig(vacancyCode) || "Новая заявка",
      reason: payload.reason,
      urgency: payload.urgency,
      desiredStartDate: payload.desiredStartDate,
      headcount: payload.headcount,
      status: "new",
      payload: {
        responsibilities: payload.responsibilities || "",
        expectedResult: payload.expectedResult || "",
        budget: payload.budget || "",
        comment: payload.comment || ""
      }
    });
    insertAuditLog({ user: adminSession, action: "hiring_request.create", targetType: "hiring_request", targetId: request.id, vacancyCode: request.vacancyCode || "" });
    return sendJson(res, 201, { request });
  }

  if (req.method === "PUT" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "hiring-requests" && parts[3]) {
    if (!(adminSession.role === "owner" || adminSession.role === "hr")) return sendJson(res, 403, { error: "Менять статус заявки может только владелец или HR." });
    const payload = await readBody(req);
    const request = updateHiringRequest(parts[3], payload);
    if (!request) return sendJson(res, 404, { error: "Заявка не найдена." });
    insertAuditLog({ user: adminSession, action: "hiring_request.update", targetType: "hiring_request", targetId: request.id, vacancyCode: request.vacancyCode || "", payload: { status: request.status } });
    return sendJson(res, 200, { request });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/vacancy-openings") {
    return sendJson(res, 200, {
      openings: filterByVacancyAccess(adminSession, listVacancyOpenings(), item => item.vacancyCode)
    });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/vacancy-openings") {
    const payload = await readBody(req);
    const vacancyCode = String(payload.vacancyCode || "").trim();
    const recruitmentChannels = Array.isArray(payload.recruitmentChannels)
      ? payload.recruitmentChannels.filter(channel => ["hh", "telegram"].includes(channel))
      : ["hh"];
    if (!vacancyCode) return sendJson(res, 400, { error: "Выберите вакансию." });
    if (!recruitmentChannels.length) return sendJson(res, 400, { error: "Выберите хотя бы один канал подбора." });
    if (!canManageVacancy(adminSession, vacancyCode)) return sendJson(res, 403, { error: "Нет доступа к этой вакансии." });
    let opening = createVacancyOpening({
      vacancyCode,
      title: payload.title || vacancyLabelFromConfig(vacancyCode),
      hiringManagerUserId: adminSession.role === "hiring_manager" ? adminSession.userId : payload.hiringManagerUserId,
      hiringManagerUsername: adminSession.role === "hiring_manager" ? adminSession.username : payload.hiringManagerUsername,
      hrOwnerUserId: adminSession.role === "hr" ? adminSession.userId : null,
      hrOwnerUsername: adminSession.role === "hr" ? adminSession.username : "",
      requestId: payload.requestId,
      reason: payload.reason,
      status: "draft",
      payload: {
        headcount: payload.headcount || 1,
        desiredStartDate: payload.desiredStartDate || "",
        urgency: payload.urgency || "normal",
        recruitmentChannels,
        telegramDrafts: recruitmentChannels.includes("telegram") ? buildTelegramDrafts(vacancyCode, { title: payload.title || vacancyLabelFromConfig(vacancyCode) }) : null
      }
    });
    if (recruitmentChannels.includes("hh")) {
      const text = createHhVacancyText({
        vacancyCode,
        openingId: opening.id,
        title: opening.title,
        body: buildHeadHunterDraft(vacancyCode, opening),
        status: "draft",
        payload: { source: "vacancy_opening", autoCreated: true }
      });
      opening = updateVacancyOpening(opening.id, { hhTextId: text.id });
    }
    insertAuditLog({ user: adminSession, action: "vacancy_opening.create", targetType: "vacancy_opening", targetId: opening.id, vacancyCode });
    return sendJson(res, 201, { opening });
  }

  if (req.method === "PUT" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "vacancy-openings" && parts[3]) {
    const current = getVacancyOpening(parts[3]);
    if (!current) return sendJson(res, 404, { error: "Запуск подбора не найден." });
    if (!canManageVacancy(adminSession, current.vacancyCode)) return sendJson(res, 403, { error: "Нет доступа к этой вакансии." });
    const payload = await readBody(req);
    const opening = updateVacancyOpening(parts[3], payload);
    insertAuditLog({ user: adminSession, action: "vacancy_opening.update", targetType: "vacancy_opening", targetId: opening.id, vacancyCode: opening.vacancyCode, payload: { status: opening.status } });
    return sendJson(res, 200, { opening });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/hh-texts") {
    return sendJson(res, 200, {
      texts: filterByVacancyAccess(adminSession, listHhVacancyTexts(), item => item.vacancyCode)
    });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/hh-texts") {
    if (!(adminSession.role === "owner" || adminSession.role === "hr")) return sendJson(res, 403, { error: "Текст HeadHunter создает HR или владелец." });
    const payload = await readBody(req);
    const vacancyCode = String(payload.vacancyCode || "").trim();
    if (!vacancyCode) return sendJson(res, 400, { error: "Выберите вакансию." });
    if (!canWriteVacancy(adminSession, vacancyCode)) return sendJson(res, 403, { error: "Нет прав на эту вакансию." });
    const opening = payload.openingId ? getVacancyOpening(payload.openingId) : null;
    const text = createHhVacancyText({
      vacancyCode,
      openingId: payload.openingId || null,
      title: payload.title || vacancyLabelFromConfig(vacancyCode),
      body: payload.body || buildHeadHunterDraft(vacancyCode, opening),
      status: "draft",
      payload: { questionnaireLink: `https://hr.academy-management.ru/v/${encodeURIComponent(vacancyCode)}?source=headhunter` }
    });
    if (opening) updateVacancyOpening(opening.id, { hhTextId: text.id });
    insertAuditLog({ user: adminSession, action: "hh_text.create", targetType: "hh_text", targetId: text.id, vacancyCode });
    return sendJson(res, 201, { text });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/hh-publications") {
    return sendJson(res, 200, {
      publications: filterByVacancyAccess(adminSession, listHhPublications(), item => item.vacancyCode)
    });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/hh/status") {
    const account = getHhIntegrationAccount();
    return sendJson(res, 200, {
      configured: hhConfigured(),
      redirectUri: HH_REDIRECT_URI,
      userAgent: HH_USER_AGENT,
      webhookConfigured: Boolean(HH_WEBHOOK_URL),
      webhook: account?.me?.webhook || null,
      account: publicHhAccount(account)
    });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/hh/promotion-status") {
    if (!(adminSession.role === "owner" || adminSession.role === "hr")) return sendJson(res, 403, { error: "Статус оплат HeadHunter доступен HR или владельцу." });
    try {
      return sendJson(res, 200, await getHhPromotionStatus());
    } catch (error) {
      return sendJson(res, 400, { error: error.message || "Не удалось получить статус оплат HeadHunter." });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/admin/hh/import-active-vacancies") {
    if (!(adminSession.role === "owner" || adminSession.role === "hr")) return sendJson(res, 403, { error: "Импорт вакансий HeadHunter доступен HR или владельцу." });
    try {
      const result = await importHhActiveVacancies({ user: adminSession });
      insertAuditLog({
        user: adminSession,
        action: "hh.vacancies.import_active",
        targetType: "integration",
        targetId: "headhunter",
        payload: {
          fetched: result.fetched,
          created: result.created.length,
          attached: result.attached.length,
          linked: result.linked.length,
          failed: result.failed.length
        }
      });
      return sendJson(res, 200, result);
    } catch (error) {
      return sendJson(res, 400, { error: error.message || "Не удалось импортировать активные вакансии HeadHunter." });
    }
  }

  if (req.method === "GET" && url.pathname === "/api/admin/bitrix/notifications") {
    if (!(adminSession.role === "owner" || adminSession.role === "hr")) return sendJson(res, 403, { error: "Нет доступа к настройкам уведомлений." });
    return sendJson(res, 200, { settings: publicBitrixNotificationStatus() });
  }

  if (req.method === "PUT" && url.pathname === "/api/admin/bitrix/notifications") {
    if (!(adminSession.role === "owner" || adminSession.role === "hr")) return sendJson(res, 403, { error: "Настройки уведомлений меняет HR или владелец." });
    const payload = await readBody(req);
    const settings = normalizeBitrixNotificationSettings(payload);
    saveConfig("bitrixNotifications", settings);
    insertAuditLog({ user: adminSession, action: "bitrix.notifications.update", targetType: "integration", targetId: "bitrix24", payload: { enabled: settings.enabled, provider: settings.provider, dialogId: settings.dialogId, events: settings.events } });
    return sendJson(res, 200, { settings: publicBitrixNotificationStatus() });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/bitrix/notifications/test") {
    if (!(adminSession.role === "owner" || adminSession.role === "hr")) return sendJson(res, 403, { error: "Тест уведомлений запускает HR или владелец." });
    const settings = getBitrixNotificationSettings();
    if (!BITRIX_WEBHOOK_BASE) return sendJson(res, 400, { error: "BITRIX_WEBHOOK_BASE не настроен на сервере." });
    if (!settings.dialogId) return sendJson(res, 400, { error: "Укажите DIALOG_ID чата Bitrix24." });
    const method = settings.provider === "imbot" ? "imbot.message.add" : "im.message.add";
    try {
      const providerResponse = await bitrixRest(method, {
        ...(settings.provider === "imbot" && BITRIX_BOT_ID ? { BOT_ID: Number(BITRIX_BOT_ID) } : {}),
        ...(settings.provider === "imbot" && BITRIX_CLIENT_ID ? { CLIENT_ID: BITRIX_CLIENT_ID } : {}),
        DIALOG_ID: settings.dialogId,
        MESSAGE: [
          "[B]Тест уведомлений платформы подбора[/B]",
          "",
          "Если вы видите это сообщение, интеграция Bitrix24 работает.",
          `[URL=${APP_PUBLIC_URL}/#admin]Открыть HR-платформу[/URL]`
        ].join("\n"),
        SYSTEM: "N",
        URL_PREVIEW: "Y"
      });
      insertAuditLog({ user: adminSession, action: "bitrix.notifications.test", targetType: "integration", targetId: "bitrix24", payload: { provider: settings.provider, dialogId: settings.dialogId } });
      return sendJson(res, 200, { ok: true, providerResponse });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || "Не удалось отправить тестовое сообщение Bitrix24." });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/admin/hh/webhook/setup") {
    if (!(adminSession.role === "owner" || adminSession.role === "hr")) return sendJson(res, 403, { error: "Автоматический прием событий hh.ru настраивает HR или владелец." });
    if (!hhConfigured()) return sendJson(res, 400, { error: "HeadHunter API не настроен." });
    try {
      const webhook = await ensureHhWebhookSubscription();
      insertAuditLog({ user: adminSession, action: "hh.webhook.setup", targetType: "integration", targetId: "headhunter", payload: { configured: webhook.configured, subscriptionId: webhook.subscriptionId } });
      return sendJson(res, 200, { webhook });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || "Не удалось настроить автоматический прием событий hh.ru." });
    }
  }

  if (req.method === "GET" && url.pathname === "/api/admin/hh/oauth-url") {
    if (!(adminSession.role === "owner" || adminSession.role === "hr")) return sendJson(res, 403, { error: "HeadHunter подключает HR или владелец." });
    if (!hhConfigured()) return sendJson(res, 400, { error: "Не заданы HH_CLIENT_ID, HH_CLIENT_SECRET или HH_REDIRECT_URI." });
    return sendJson(res, 200, { url: hhOAuthUrl(adminSession), redirectUri: HH_REDIRECT_URI });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/hh/disconnect") {
    if (!requireOwner(adminSession, res)) return;
    const account = disconnectHhIntegrationAccount();
    insertAuditLog({ user: adminSession, action: "hh.oauth.disconnect", targetType: "integration", targetId: "headhunter" });
    return sendJson(res, 200, { account: publicHhAccount(account) });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/hh/responses") {
    return sendJson(res, 200, {
      responses: filterByVacancyAccess(adminSession, listHhResponses(), item => item.vacancyCode)
    });
  }

  if (req.method === "POST" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "hh" && parts[3] === "publications" && parts[5] === "sync-responses") {
    const publication = getHhPublication(parts[4]);
    if (!publication) return sendJson(res, 404, { error: "Публикация не найдена." });
    if (!canWriteVacancy(adminSession, publication.vacancyCode)) return sendJson(res, 403, { error: "Нет прав на эту вакансию." });
    if (!publication.hhVacancyId) return sendJson(res, 400, { error: "У публикации нет ID вакансии HeadHunter." });
    const result = await syncHhPublicationResponses(publication);
    const responses = result.responses;
    insertAuditLog({ user: adminSession, action: "hh.responses.sync", targetType: "hh_publication", targetId: publication.id, vacancyCode: publication.vacancyCode, payload: { count: responses.length } });
    return sendJson(res, 200, { responses, found: result.found });
  }

  if (req.method === "POST" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "hh" && parts[3] === "responses" && parts[5] === "send-questionnaire") {
    const responseItem = getHhResponse(parts[4]);
    if (!responseItem) return sendJson(res, 404, { error: "Отклик не найден." });
    if (!canWriteVacancy(adminSession, responseItem.vacancyCode)) return sendJson(res, 403, { error: "Нет прав на эту вакансию." });
    if (responseItem.questionnaireSent) return sendJson(res, 409, { error: "Ссылка уже отправлена этому кандидату." });
    const sendResult = await sendHhQuestionnaireMessage(responseItem);
    const updated = sendResult.response;
    insertAuditLog({ user: adminSession, action: "hh.questionnaire.send", targetType: "hh_response", targetId: responseItem.id, vacancyCode: responseItem.vacancyCode });
    return sendJson(res, 200, { response: updated });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/hh-publications") {
    if (!(adminSession.role === "owner" || adminSession.role === "hr")) return sendJson(res, 403, { error: "Публикацию создает HR или владелец." });
    const payload = await readBody(req);
    const vacancyCode = String(payload.vacancyCode || "").trim();
    if (!vacancyCode) return sendJson(res, 400, { error: "Выберите вакансию." });
    if (!canWriteVacancy(adminSession, vacancyCode)) return sendJson(res, 403, { error: "Нет прав на эту вакансию." });
    const publication = createHhPublication({
      vacancyCode,
      openingId: payload.openingId || null,
      hhTextId: payload.hhTextId || null,
      hhVacancyId: payload.hhVacancyId || "",
      url: payload.url || "",
      status: payload.status || "manual_ready",
      payload: { mode: "manual_first", note: payload.note || "Готово для ручной публикации на HeadHunter" }
    });
    if (payload.openingId) updateVacancyOpening(payload.openingId, { hhPublicationId: publication.id, status: "publication_ready" });
    insertAuditLog({ user: adminSession, action: "hh_publication.create", targetType: "hh_publication", targetId: publication.id, vacancyCode, payload: { status: publication.status } });
    return sendJson(res, 201, { publication });
  }

  if (req.method === "PUT" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "hh-publications" && parts[3]) {
    const current = getHhPublication(parts[3]);
    if (!current) return sendJson(res, 404, { error: "Публикация не найдена." });
    if (!canWriteVacancy(adminSession, current.vacancyCode)) return sendJson(res, 403, { error: "Нет прав на эту вакансию." });
    const payload = await readBody(req);
    const publication = updateHhPublication(parts[3], {
      hhVacancyId: payload.hhVacancyId ?? current.hhVacancyId,
      url: payload.url ?? current.url,
      status: payload.status ?? current.status,
      publishedAt: payload.publishedAt ?? current.publishedAt
    });
    insertAuditLog({ user: adminSession, action: "hh_publication.update", targetType: "hh_publication", targetId: publication.id, vacancyCode: publication.vacancyCode, payload: { hhVacancyId: publication.hhVacancyId, status: publication.status } });
    return sendJson(res, 200, { publication });
  }

  if (req.method === "PUT" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "vacancies" && parts[4] === "questions") {
    const vacancyCode = decodeURIComponent(parts[3] || "");
    if (!vacancyCode) return sendJson(res, 400, { error: "Не указана вакансия." });
    if (!canWriteVacancy(adminSession, vacancyCode)) return sendJson(res, 403, { error: "Менять опросник может владелец или HR с доступом к этой вакансии." });
    try {
      const payload = await readBody(req);
      const normalizedQuestions = normalizeQuestionnaireQuestions(payload.questions);
      const config = getQuestionnaireConfig();
      if (!config.vacancies?.[vacancyCode]) return sendJson(res, 404, { error: "Вакансия не найдена." });
      const nextConfig = cloneJson(config);
      nextConfig.vacancies = { ...(nextConfig.vacancies || {}) };
      nextConfig.vacancies[vacancyCode] = {
        ...nextConfig.vacancies[vacancyCode],
        questions: normalizedQuestions,
        version: Number(nextConfig.vacancies[vacancyCode].version || 1) + 1
      };
      if ((nextConfig.vacancyCode || "smm") === vacancyCode || nextConfig.activeVacancyCode === vacancyCode) {
        nextConfig.questions = normalizedQuestions;
      }
      nextConfig.version = Number(nextConfig.version || 1) + 1;
      const savedConfig = saveQuestionnaireConfig(nextConfig);
      insertAuditLog({
        user: adminSession,
        action: "questionnaire.questions.update",
        targetType: "vacancy",
        targetId: vacancyCode,
        vacancyCode,
        payload: { questions: normalizedQuestions.length }
      });
      return sendJson(res, 200, {
        config: savedConfig.vacancies?.[vacancyCode],
        rootConfig: savedConfig,
        vacancies: getVacancies(savedConfig)
      });
    } catch (error) {
      return sendJson(res, error.statusCode || 400, { error: error.message || "Не удалось сохранить опросник." });
    }
  }

  if (req.method === "PUT" && url.pathname === "/api/admin/config") {
    if (!requireOwner(adminSession, res)) return;
    const payload = await readBody(req);
    const config = saveQuestionnaireConfig(payload.config);
    insertAuditLog({ user: adminSession, action: "config.update", targetType: "config", targetId: "questionnaire" });
    return sendJson(res, 200, { config });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/ai-insights") {
    const baseConfig = getQuestionnaireConfig();
    const allowed = allowedVacancyCodes(adminSession, vacancyCodes(baseConfig));
    const requestedVacancy = url.searchParams.get("vacancy");
    const vacancyCode = requestedVacancy && allowed.includes(requestedVacancy) ? requestedVacancy : allowed[0];
    if (!vacancyCode) return sendJson(res, 403, { error: "Нет доступа к вакансиям." });
    const submissions = vacancyCode ? listSubmissionsByVacancy(vacancyCode) : listSubmissions();
    const events = vacancyCode ? listEvents().filter(event => event.vacancyCode === vacancyCode) : listEvents();
    const analytics = buildFlowAnalytics(submissions, events);
    const insights = await generateAiInsights(submissions, analytics, getVacancyConfig(vacancyCode, baseConfig));
    insertAuditLog({ user: adminSession, action: "analytics.ai_insights", targetType: "vacancy", targetId: vacancyCode, vacancyCode });
    return sendJson(res, 200, { insights });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/users") {
    if (!requireOwner(adminSession, res)) return;
    return sendJson(res, 200, { users: listUsers() });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/users") {
    if (!requireOwner(adminSession, res)) return;
    const payload = await readBody(req);
    const user = createUser(payload);
    insertAuditLog({
      user: adminSession,
      action: "user.create",
      targetType: "user",
      targetId: user.id,
      payload: { username: user.username, role: user.role, vacancyAccess: user.vacancyAccess }
    });
    return sendJson(res, 201, { user });
  }

  if (req.method === "PUT" && parts[0] === "api" && parts[1] === "admin" && parts[2] === "users" && parts[3]) {
    if (!requireOwner(adminSession, res)) return;
    const payload = await readBody(req);
    const user = updateUser(parts[3], payload);
    if (!user) return sendJson(res, 404, { error: "Пользователь не найден." });
    insertAuditLog({
      user: adminSession,
      action: "user.update",
      targetType: "user",
      targetId: user.id,
      payload: { username: user.username, role: user.role, vacancyAccess: user.vacancyAccess, active: user.active }
    });
    return sendJson(res, 200, { user });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/audit") {
    if (!requireOwner(adminSession, res)) return;
    return sendJson(res, 200, { logs: listAuditLogs(url.searchParams.get("limit") || 200) });
  }

  return sendJson(res, 404, { error: "API route not found" });
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(publicDir, requested));

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, staticHeaders(ext));
    res.end(file);
  } catch {
    const fallback = await fs.readFile(path.join(publicDir, "index.html"));
    res.writeHead(200, staticHeaders(".html"));
    res.end(fallback);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) {
      await handleApi(req, res);
    } else {
      await serveStatic(req, res);
    }
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Server error" });
  }
});

initDb({
  adminUsername: ADMIN_USERNAME,
  adminPassword: ADMIN_PASSWORD,
  resetAdminPassword: ADMIN_PASSWORD_RESET,
  hrUsername: HR_USERNAME,
  hrPassword: HR_PASSWORD,
  resetHrPassword: HR_PASSWORD_RESET
}).then(() => {
  server.listen(PORT, () => {
    console.log(`HR SMM Screening app: http://localhost:${PORT}`);
    console.log(`Admin login: ${ADMIN_USERNAME}`);
    if (!HH_VACANCY_AUTO_IMPORT_DISABLED && HH_VACANCY_IMPORT_INTERVAL_MS > 0) {
      setTimeout(runScheduledHhVacancyImport, 15000);
      setInterval(runScheduledHhVacancyImport, HH_VACANCY_IMPORT_INTERVAL_MS);
    }
  });
});
