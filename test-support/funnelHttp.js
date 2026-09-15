const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const net = require("node:net");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const { DatabaseSync } = require("node:sqlite");

async function startFixture(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "hr-materials-"));
  const probe = net.createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  const child = spawn(process.execPath, ["server.js"], {
    cwd: path.join(__dirname, ".."), windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
    env: { SystemRoot: process.env.SystemRoot, PATH: process.env.PATH, TEMP: os.tmpdir(), TMP: os.tmpdir(),
      PORT: String(port), HR_DATA_DIR: directory, ADMIN_USERNAME: "test-owner", ADMIN_PASSWORD: "synthetic-owner-password",
      HR_USERNAME: "test-hr", HR_PASSWORD: "synthetic-hr-password", HH_VACANCY_AUTO_IMPORT_DISABLED: "1" }
  });
  let output = "";
  child.stderr.on("data", chunk => { output += chunk; });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const stopped = once(child, "exit"); child.kill(); await stopped;
    }
    assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir()) + path.sep));
    await fs.rm(directory, { recursive: true, force: true });
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(output || "Server timeout")), 8000);
    child.stdout.on("data", chunk => {
      output += chunk;
      if (output.includes("Screening app:")) { clearTimeout(timer); resolve(); }
    });
    child.once("exit", () => { clearTimeout(timer); reject(new Error(output)); });
    child.once("error", error => { clearTimeout(timer); reject(error); });
  });
  async function request(route, actor, method = "GET", body, headers = {}) {
    const response = await fetch(`http://127.0.0.1:${port}${route}`, {
      method, headers: { "Content-Type": "application/json", Cookie: actor?.cookie || "", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: response.status, body: await response.json(), headers: response.headers };
  }
  async function login(username, password) {
    const result = await request("/api/auth/login", null, "POST", { username, password });
    assert.equal(result.status, 200);
    const actor = { user: result.body.user, cookie: result.headers.get("set-cookie").split(";")[0] };
    actor.csrf = (await request("/api/admin/funnels/csrf", actor)).body.csrfToken;
    return actor;
  }
  const owner = await login("test-owner", "synthetic-owner-password");
  const hr = await login("test-hr", "synthetic-hr-password");
  const user = await request("/api/admin/users", owner, "POST", {
    email: "manager@example.test", password: "synthetic-manager-password", role: "hiring_manager", vacancyAccess: ["smm"]
  });
  assert.equal(user.status, 201);
  const manager = await login("manager@example.test", "synthetic-manager-password");
  const opening = await request("/api/admin/vacancy-openings", owner, "POST", {
    vacancyCode: "smm", title: "Synthetic funnel", recruitmentChannels: ["telegram"], hiringManagerUserId: manager.user.id
  });
  assert.equal(opening.status, 201);
  const id = opening.body.opening.id;
  let sequence = 0;
  const route = type => `/api/admin/funnels/${id}/artifacts/${type}`;
  async function current(type, actor = owner) { return (await request(route(type), actor)).body; }
  async function write(type, action, fields = {}, actor = owner, key, snapshot) {
    const state = snapshot || await current(type, actor);
    return request(route(type) + (action === "save" ? "" : `/${action}`), actor, action === "save" ? "PUT" : "POST", {
      funnelVersion: state.funnelVersion, artifactVersion: state.artifact.version || 0, ...fields
    }, { "X-CSRF-Token": actor.csrf, "Idempotency-Key": key || `fixture-key-${++sequence}` });
  }
  function withDb(work) {
    const db = new DatabaseSync(path.join(directory, "hr-screening.sqlite"));
    try { return work(db); } finally { db.close(); }
  }
  return { request, login, owner, hr, manager, id, route, current, write, withDb };
}

module.exports = { startFixture };
