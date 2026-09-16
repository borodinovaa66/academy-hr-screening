const fs = require('node:fs');
const base = 'http://127.0.0.1:4173';
const env = Object.fromEntries(fs.readFileSync('/etc/hr-screening/app.env', 'utf8').split('\n').filter(line => /^[A-Z_]+=/.test(line)).map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1).trim()]; }));
(async () => {
  const started = Date.now();
  const login = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: env.HR_USERNAME, password: env.HR_PASSWORD }) });
  console.log('login', login.status, Date.now() - started);
  if (!login.ok) return;
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const paths = ['/api/admin/config', '/api/admin/analytics?vacancy=smm', '/api/admin/submissions?vacancy=smm', '/api/admin/hh-publications?vacancy=smm', '/api/admin/hh-publications?vacancy=smm&refresh=1', '/api/admin/hh/promotion-status'];
  await Promise.all(paths.map(async path => {
    const start = Date.now();
    try { const r = await fetch(base + path, { headers: { cookie }, signal: AbortSignal.timeout(12000) }); await r.text(); console.log(path, r.status, Date.now() - start); }
    catch { console.log(path, 'timeout/error', Date.now() - start); }
  }));
  await fetch(base + '/api/auth/logout', { method: 'POST', headers: { cookie } });
})();
