const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const net = require("node:net");

test("empty manager can create a first private vacancy and opening", async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "hr-onboarding-"));
  const socket = net.createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const child = spawn(process.execPath, ["server.js"], {
    cwd: path.join(__dirname, ".."),
    env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, TEMP: os.tmpdir(),
      PORT: String(port), HR_DATA_DIR: dir, ADMIN_USERNAME: "test-owner", ADMIN_PASSWORD: "synthetic-test-password",
      HH_VACANCY_AUTO_IMPORT_DISABLED: "1" }, stdio: ["ignore", "pipe", "pipe"]
  });
  let logs = "";
  child.stdout.on("data", data => { logs += data; });
  child.stderr.on("data", data => { logs += data; });
  t.after(async () => {
    if (child.exitCode === null) { const stopped = once(child, "exit"); child.kill(); await stopped; }
    await fs.rm(dir, { recursive: true, force: true });
  });
  const request = async (route, cookie = "", method = "GET", body) => {
    const response = await fetch(`http://127.0.0.1:${port}${route}`, {
      method, headers: { cookie, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined
    });
    return { status: response.status, body: await response.json(), cookie: response.headers.get("set-cookie")?.split(";")[0] };
  };
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { await request("/api/auth/me"); ready = true; break; } catch { await new Promise(r => setTimeout(r, 100)); }
  }
  assert.ok(ready, logs);
  const login = username => request("/api/auth/login", "", "POST", { username, password: "synthetic-test-password" });
  const owner = (await login("test-owner")).cookie;
  assert.equal((await request("/api/admin/position-catalog")).status, 401);
  for (const email of ["manager@example.test", "other@example.test"]) {
    const created = await request("/api/admin/users", owner, "POST", {
      email, password: "synthetic-test-password", role: "hiring_manager", vacancyAccess: []
    });
    assert.equal(created.status, 201);
    assert.deepEqual(created.body.user.vacancyAccess, []);
  }
  const manager = (await login("manager@example.test")).cookie;
  const other = (await login("other@example.test")).cookie;
  const config = await request("/api/admin/config", manager);
  assert.deepEqual(config.body, { config: { vacancies: {} }, vacancies: {} });
  const empty = await request("/api/admin/submissions?vacancy=smm", manager);
  assert.equal(empty.status, 200);
  assert.deepEqual(empty.body.submissions, []);
  assert.equal((await request("/api/admin/analytics", manager)).body.analytics.total, 0);
  const catalog = await request("/api/admin/position-catalog", manager);
  assert.ok(catalog.body.titles.length > 0);
  assert.deepEqual(Object.keys(catalog.body), ["titles"]);
  assert.ok(catalog.body.titles.every(title => typeof title === "string"));
  assert.equal((await request("/api/admin/vacancy-openings", manager, "POST", { vacancyCode: "smm", recruitmentChannels: ["hh"] })).status, 403);
  const vacancy = await request("/api/admin/vacancies", manager, "POST", {
    draft: { title: "Test Operations Coordinator", roleProfile: "Synthetic role", sourceText: "Synthetic operations role for a private test funnel" }
  });
  assert.equal(vacancy.status, 201);
  const code = vacancy.body.vacancyCode;
  assert.equal(vacancy.body.config.vacancyArtifacts.publicFunnelApproved, false);
  const own = await request("/api/admin/config", manager);
  assert.deepEqual(Object.keys(own.body.vacancies), [code]);
  assert.deepEqual((await request("/api/admin/config", other)).body.vacancies, {});
  const opening = await request("/api/admin/vacancy-openings", manager, "POST", { vacancyCode: code, recruitmentChannels: ["hh"] });
  assert.equal(opening.status, 201);
  assert.equal((await request("/api/admin/vacancy-openings", other)).body.openings.length, 0);
  assert.equal((await request("/api/admin/users", manager)).status, 403);
  assert.equal((await request("/api/admin/config", other, "PUT", { vacancyCode: code })).status, 403);
});
