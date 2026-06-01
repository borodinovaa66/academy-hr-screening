const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { scoreSubmission, buildFlowAnalytics } = require("./src/scoring");
const {
  initDb,
  getQuestionnaireConfig,
  saveQuestionnaireConfig,
  insertSubmission,
  updateTestAssignment,
  insertEvent,
  listEvents,
  listSubmissions,
  getSubmission,
  authenticate,
  createSession,
  findSession,
  deleteSession
} = require("./src/database");

const PORT = Number(process.env.PORT || 4173);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "hr-demo";
const ADMIN_PASSWORD_RESET = process.env.ADMIN_PASSWORD_RESET === "1";
const AI_PROVIDER = process.env.AI_PROVIDER || (process.env.YANDEX_GPT_API_KEY ? "yandex" : "openai");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const YANDEX_GPT_API_KEY = process.env.YANDEX_GPT_API_KEY || "";
const YANDEX_FOLDER_ID = process.env.YANDEX_FOLDER_ID || "";
const YANDEX_GPT_MODEL = process.env.YANDEX_GPT_MODEL || "yandexgpt-lite";
const LEGAL_VERSION = {
  privacy: "privacy_v2",
  personalDataConsent: "personal_data_consent_v2"
};

const rootDir = __dirname;
const publicDir = path.join(rootDir, "public");

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
  ".ico": "image/x-icon"
};

function sendJson(res, status, payload, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  res.end(JSON.stringify(payload));
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

function publicCandidate(item) {
  return {
    id: item.id,
    submittedAt: item.submittedAt,
    candidate: item.candidate,
    score: item.score,
    recommendation: item.recommendation,
    flags: item.flags,
    strengths: item.strengths,
    risks: item.risks,
    hrNote: item.hrNote,
    testAssignment: item.testAssignment
  };
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

async function generateAiInsights(submissions, analytics) {
  const fallback = (risk = null) => ({
    mode: "local",
    summary: analytics.summary,
    recommendations: analytics.recommendations,
    risks: risk ? [risk, ...analytics.marketRisks] : analytics.marketRisks
  });

  if (AI_PROVIDER === "yandex") {
    if (!YANDEX_GPT_API_KEY || !YANDEX_FOLDER_ID) {
      return fallback("AI-анализ не выполнен: не заданы YANDEX_GPT_API_KEY или YANDEX_FOLDER_ID.");
    }
    return generateYandexInsights(submissions, analytics).catch(error => (
      fallback(`AI-анализ не выполнен: YandexGPT вернул ошибку: ${error.message}.`)
    ));
  }

  if (!OPENAI_API_KEY) {
    return fallback();
  }

  return generateOpenAiInsights(submissions, analytics).catch(error => (
    fallback(`AI-анализ не выполнен: OpenAI вернул ошибку: ${error.message}.`)
  ));
}

function compactSubmissions(submissions) {
  return submissions.slice(-40).map(item => ({
    score: item.score.total,
    status: item.recommendation.status,
    projects: item.answers.projectTypes,
    responsibilities: item.answers.responsibilities,
    metrics: item.answers.metrics,
    income: item.answers.income,
    flags: item.flags.map(flag => flag.title)
  }));
}

function aiPrompt(submissions, analytics) {
  return [
    "Ты HR-аналитик для подбора SMM-менеджера.",
    "Проанализируй поток кандидатов и дай короткие практические рекомендации HR.",
    "Нужно выявить: качество рынка, слабые места вакансии, что исправить в описании вакансии, что проверить на интервью.",
    "Ответ строго JSON: {summary:string,recommendations:string[],risks:string[],interviewFocus:string[]}.",
    JSON.stringify({ analytics, candidates: compactSubmissions(submissions) })
  ].join("\n");
}

function parseAiJson(content) {
  const text = String(content || "{}").trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonText = fenced ? fenced[1].trim() : text;
  return JSON.parse(jsonText);
}

async function generateYandexInsights(submissions, analytics) {
  const payload = {
    modelUri: `gpt://${YANDEX_FOLDER_ID}/${YANDEX_GPT_MODEL}/latest`,
    completionOptions: {
      stream: false,
      temperature: 0.2,
      maxTokens: 1200
    },
    messages: [
      { role: "system", text: "Отвечай по-русски, кратко, прикладно, без воды. Верни только валидный JSON без Markdown." },
      { role: "user", text: aiPrompt(submissions, analytics) }
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

async function generateOpenAiInsights(submissions, analytics) {
  const prompt = aiPrompt(submissions, analytics);

  const payload = {
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: "Отвечай по-русски, кратко, прикладно, без воды." },
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

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/api/legal") {
    return sendJson(res, 200, { version: LEGAL_VERSION });
  }

  if (req.method === "GET" && url.pathname === "/api/config") {
    return sendJson(res, 200, { config: getQuestionnaireConfig() });
  }

  if (req.method === "POST" && url.pathname === "/api/events") {
    const payload = await readBody(req);
    insertEvent({
      sessionId: payload.sessionId,
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
    const config = getQuestionnaireConfig();
    const scored = scoreSubmission(payload, config);
    const consentTimestamp = new Date().toISOString();
    const forwardedFor = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    const record = {
      id: crypto.randomUUID(),
      submittedAt: consentTimestamp,
      candidate: scored.candidate,
      answers: scored.answers,
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
    return sendJson(res, 201, {
      id: record.id,
      score: record.score,
      recommendation: record.recommendation,
      nextStep: {
        testAssignmentEligible: eligible,
        testAssignmentUrl: eligible ? `/#test/${record.id}` : null
      }
    });
  }

  if (req.method === "POST" && url.pathname.match(/^\/api\/submissions\/[^/]+\/test-assignment$/)) {
    const id = url.pathname.split("/")[3];
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
    return sendJson(res, 200, { ok: true, testAssignment: updated.testAssignment });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const payload = await readBody(req);
    const user = authenticate(payload.username || "", payload.password || "");
    if (!user) return sendJson(res, 401, { error: "Invalid credentials" });
    const session = createSession(user.id);
    return sendJson(res, 200, { user }, {
      "Set-Cookie": cookieHeader("hr_session", session.token, { expires: session.expiresAt })
    });
  }

  if (req.method === "GET" && url.pathname === "/api/auth/me") {
    const session = getSession(req);
    if (!session) return sendJson(res, 401, { error: "Unauthorized" });
    return sendJson(res, 200, { user: { username: session.username, role: session.role } });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/logout") {
    const token = parseCookies(req).hr_session;
    deleteSession(token);
    return sendJson(res, 200, { ok: true }, {
      "Set-Cookie": cookieHeader("hr_session", "", { maxAge: 0 })
    });
  }

  if (url.pathname.startsWith("/api/admin/") && !requireAdmin(req, res)) return;

  if (req.method === "GET" && url.pathname === "/api/admin/submissions") {
    return sendJson(res, 200, { submissions: listSubmissions().map(publicCandidate) });
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/admin/submissions/")) {
    const id = url.pathname.split("/").pop();
    const record = getSubmission(id);
    if (!record) return sendJson(res, 404, { error: "Not found" });
    return sendJson(res, 200, { submission: record });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/analytics") {
    const analytics = buildFlowAnalytics(listSubmissions(), listEvents());
    return sendJson(res, 200, { analytics });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/config") {
    return sendJson(res, 200, { config: getQuestionnaireConfig() });
  }

  if (req.method === "PUT" && url.pathname === "/api/admin/config") {
    const payload = await readBody(req);
    const config = saveQuestionnaireConfig(payload.config);
    return sendJson(res, 200, { config });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/ai-insights") {
    const submissions = listSubmissions();
    const analytics = buildFlowAnalytics(submissions, listEvents());
    const insights = await generateAiInsights(submissions, analytics);
    return sendJson(res, 200, { insights });
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
    res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" });
    res.end(file);
  } catch {
    const fallback = await fs.readFile(path.join(publicDir, "index.html"));
    res.writeHead(200, { "Content-Type": mime[".html"] });
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

initDb({ adminUsername: ADMIN_USERNAME, adminPassword: ADMIN_PASSWORD, resetAdminPassword: ADMIN_PASSWORD_RESET }).then(() => {
  server.listen(PORT, () => {
    console.log(`HR SMM Screening app: http://localhost:${PORT}`);
    console.log(`Admin login: ${ADMIN_USERNAME}`);
  });
});
