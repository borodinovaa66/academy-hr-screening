const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const net = require("node:net");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const { DatabaseSync } = require("node:sqlite");

test("HTTP reads require session, enforce launch access and preserve legacy APIs", { timeout: 20000 }, async t => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "hr-funnel-api-"));
  const probe = net.createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  const child = spawn(process.execPath, ["server.js"], {
    cwd: path.join(__dirname, ".."),
    env: {
      SystemRoot: process.env.SystemRoot, PATH: process.env.PATH,
      TEMP: os.tmpdir(), TMP: os.tmpdir(), PORT: String(port), HR_DATA_DIR: temporary,
      ADMIN_USERNAME: "test-owner", ADMIN_PASSWORD: "synthetic-owner-password",
      HR_USERNAME: "test-hr", HR_PASSWORD: "synthetic-hr-password",
      HH_VACANCY_AUTO_IMPORT_DISABLED: "1"
    },
    stdio: ["ignore", "pipe", "pipe"], windowsHide: true
  });
  let output = "";
  child.stderr.on("data", chunk => { output += chunk; });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const stopped = once(child, "exit");
      child.kill();
      await stopped;
    }
    assert.ok(path.resolve(temporary).startsWith(path.resolve(os.tmpdir()) + path.sep));
    await fs.rm(temporary, { recursive: true, force: true });
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server did not start: ${output}`)), 8000);
    child.stdout.on("data", chunk => {
      output += chunk;
      if (output.includes("Screening app:")) { clearTimeout(timer); resolve(); }
    });
    child.once("exit", () => { clearTimeout(timer); reject(new Error(`Server exited: ${output}`)); });
    child.once("error", error => { clearTimeout(timer); reject(error); });
  });
  const base = `http://127.0.0.1:${port}`;
  async function request(route, cookie = "", method = "GET", body) {
    const response = await fetch(base + route, { method, headers: { Cookie: cookie, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    return { status: response.status, body: await response.json(), headers: response.headers };
  }
  async function login(username, password) {
    const response = await request("/api/auth/login", "", "POST", { username, password });
    assert.equal(response.status, 200);
    return response.headers.get("set-cookie").split(";")[0];
  }
  assert.equal((await request("/api/admin/funnels")).status, 401);
  assert.equal((await request("/api/admin/funnels/hidden")).status, 401);
  const owner = await login("test-owner", "synthetic-owner-password");
  const hr = await login("test-hr", "synthetic-hr-password");
  assert.deepEqual((await request("/api/admin/funnels", owner)).body.funnels, []);
  const created = await request("/api/admin/users", owner, "POST", {
    email: "manager@example.test", password: "synthetic-manager-password", role: "hiring_manager", vacancyAccess: ["smm"]
  });
  assert.equal(created.status, 201);
  const manager = await login("manager@example.test", "synthetic-manager-password");
  const first = await request("/api/admin/vacancy-openings", owner, "POST", {
    vacancyCode: "smm", title: "Synthetic A", hiringManagerUserId: created.body.user.id, recruitmentChannels: ["telegram"]
  });
  assert.equal(first.status, 201);
  const second = await request("/api/admin/vacancy-openings", owner, "POST", {
    vacancyCode: "smm", title: "Synthetic B", hiringManagerUserId: "another-manager", recruitmentChannels: ["telegram"]
  });
  assert.equal(second.status, 201);
  const id = first.body.opening.id;
  assert.equal((await request("/api/admin/funnels", owner)).body.funnels.length, 2);
  assert.equal((await request("/api/admin/funnels", hr)).body.funnels.length, 2);
  const visible = await request("/api/admin/funnels", manager);
  assert.equal(visible.body.funnels.length, 1);
  assert.equal(visible.body.funnels[0].id, id);
  assert.equal((await request(`/api/admin/funnels/${second.body.opening.id}`, manager)).status, 404);
  assert.equal((await request("/api/admin/funnels/not-found", owner)).status, 404);
  const detail = await request(`/api/admin/funnels/${id}`, owner);
  assert.equal(detail.body.funnel.artifacts.length, 6);
  assert.equal(detail.body.funnel.readiness.approvedCount, 0);
  assert.equal(detail.body.funnel.legacyStatus, "draft");
  assert.equal(detail.headers.get("cache-control"), "private, no-store");
  assert.equal((await request(`/api/admin/funnels/${id}/launch`, owner, "POST", {})).status, 403);
  assert.equal((await request("/api/admin/vacancy-openings", owner)).body.openings.length, 2);
  assert.equal((await request("/api/config?vacancy=smm")).status, 200);
  assert.equal((await request("/api/vacancies")).status, 200);
  const db = new DatabaseSync(path.join(temporary, "hr-screening.sqlite"));
  try {
    const before = db.prepare("SELECT version FROM vacancy_openings WHERE id = ?").get(id).version;
    const audits = db.prepare("SELECT COUNT(*) AS n FROM audit_logs").get().n;
    await request("/api/admin/funnels", owner);
    await request(`/api/admin/funnels/${id}`, owner);
    assert.equal(db.prepare("SELECT version FROM vacancy_openings WHERE id = ?").get(id).version, before);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_logs").get().n, audits);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM hh_message_logs").get().n, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM candidate_communications").get().n, 0);
    assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  } finally { db.close(); }
});
