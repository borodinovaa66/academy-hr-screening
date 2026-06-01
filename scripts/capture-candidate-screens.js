const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawn } = require("node:child_process");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:4173/";
const DEBUG_PORT = 9333;
const OUT_DIR = path.resolve(__dirname, "..", "screenshots", "candidate-flow");
const VIEWPORT = { width: 1440, height: 1100 };

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function httpJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();
    this.ws.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result || {});
        return;
      }
      const waiters = this.events.get(message.method);
      if (waiters?.length) waiters.shift()(message.params || {});
    });
  }

  async ready() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
  }

  send(method, params = {}, timeout = 45000) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, timeout);
    });
  }

  waitFor(method, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const list = this.events.get(method) || [];
      list.push(resolve);
      this.events.set(method, list);
      setTimeout(() => reject(new Error(`Event timeout: ${method}`)), timeout);
    });
  }

  close() {
    this.ws.close();
  }
}

async function startBrowser() {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hr-capture-edge-"));
  const args = [
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${userDataDir}`,
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
    "about:blank"
  ];
  const browser = spawn(EDGE_PATH, args, { stdio: "ignore" });

  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      await httpJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      return { browser, userDataDir };
    } catch {
      await sleep(250);
    }
  }
  throw new Error("Edge remote debugging did not start.");
}

async function openPage() {
  let target;
  try {
    target = await httpJson(`http://127.0.0.1:${DEBUG_PORT}/json/new?${encodeURIComponent(BASE_URL)}`, { method: "PUT" });
  } catch {
    const targets = await httpJson(`http://127.0.0.1:${DEBUG_PORT}/json`);
    target = targets[0];
  }
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.ready();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: VIEWPORT.width,
    height: VIEWPORT.height,
    deviceScaleFactor: 1,
    mobile: false
  });
  await client.send("Page.navigate", { url: `${BASE_URL}?capture=${Date.now()}` });
  await client.waitFor("Page.loadEventFired").catch(() => {});
  await sleep(900);
  return client;
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
  }
  return result.result?.value;
}

async function capture(client, filename) {
  await sleep(450);
  await evaluate(client, "window.scrollTo(0, 0);");
  await sleep(120);
  const screenshot = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true
  }, 90000);
  fs.writeFileSync(path.join(OUT_DIR, filename), Buffer.from(screenshot.data, "base64"));
}

async function click(client, selector, index = 0) {
  await evaluate(client, `
    (() => {
      const el = document.querySelectorAll(${JSON.stringify(selector)})[${index}];
      if (!el) throw new Error("Element not found: ${selector}");
      el.click();
    })()
  `);
  await sleep(350);
}

async function fill(client, selector, value, index = 0) {
  await evaluate(client, `
    (() => {
      const el = document.querySelectorAll(${JSON.stringify(selector)})[${index}];
      if (!el) throw new Error("Input not found: ${selector}");
      el.value = ${JSON.stringify(value)};
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    })()
  `);
  await sleep(180);
}

async function answerCurrentQuestion(client, stepIndex) {
  const oneBased = stepIndex + 1;
  if (oneBased === 1) {
    await fill(client, ".answer-area input", "Анна", 0);
    await fill(client, ".answer-area input", "Иванова", 1);
    return;
  }
  if (oneBased === 2) {
    await fill(client, ".answer-area input", "anna.ivanova@example.com", 0);
    await fill(client, ".answer-area input", "+7 999 000-00-00", 1);
    return;
  }
  if (oneBased === 3) {
    await fill(client, ".answer-area input", "https://example.com/resume.pdf");
    return;
  }
  if (oneBased === 10) {
    await fill(client, ".answer-area textarea", "Карусель с 5 ошибками, короткий Reels про самую дорогую ошибку, stories-опрос, Telegram-разбор с примерами и CTA на чек-лист. Метрики: сохранения, досмотры, переходы, подписки и заявки.");
    return;
  }
  if (oneBased === 16) {
    await fill(client, ".answer-area textarea", "Внедрила серию коротких Reels из экспертных тезисов, добавила субтитры и CTA в Telegram. Формат дал рост досмотров и переходов в профиль, поэтому закрепили его в контент-плане.");
    return;
  }
  if (oneBased === 20) {
    await click(client, ".answer-area input[type='checkbox']", 0);
    await click(client, ".answer-area input[type='checkbox']", 1);
    await click(client, ".answer-area input[type='checkbox']", 2);
    await click(client, ".answer-area input[type='checkbox']", 10);
    await fill(client, ".answer-area input[type='number']", "120000");
    await click(client, ".answer-area input[type='radio']", 0);
    return;
  }

  const type = await evaluate(client, `
    (() => {
      if (document.querySelector(".answer-area input[type='radio']")) return "radio";
      if (document.querySelector(".answer-area input[type='checkbox']")) return "checkbox";
      return "unknown";
    })()
  `);
  if (type === "radio") {
    await click(client, ".answer-area input[type='radio']", 0);
    return;
  }
  if (type === "checkbox") {
    const count = await evaluate(client, "document.querySelectorAll(\".answer-area input[type='checkbox']\").length");
    const picks = Math.min(count, oneBased === 5 ? 4 : 3);
    for (let i = 0; i < picks; i++) await click(client, ".answer-area input[type='checkbox']", i);
  }
}

async function main() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const { browser } = await startBrowser();
  let client;
  try {
    client = await openPage();
    await capture(client, "00-welcome.png");

    await click(client, ".consent-row input", 0);
    await click(client, ".consent-row input", 1);
    await click(client, ".start-btn");

    for (let i = 0; i < 20; i++) {
      const number = String(i + 1).padStart(2, "0");
      const title = await evaluate(client, "document.querySelector('.bubble h2')?.textContent || ''");
      const slug = title
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/[^a-zа-я0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);
      await capture(client, `${number}-question-${slug || "screen"}.png`);
      await answerCurrentQuestion(client, i);
      await click(client, "[data-current-action='next']");
      await sleep(700);
    }

    await capture(client, "21-thank-you.png");
  } finally {
    if (client) client.close();
    browser.kill();
  }

  console.log(OUT_DIR);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
