/* Smoke test for the single-file build: no external assets, full 12-tab student module. */
const fs = require('fs');
const path = require('path');
const CDP = 'http://127.0.0.1:9229';
const BASE = 'http://127.0.0.1:9137/crm-redesign-demo.html';
const root = path.resolve(__dirname, '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const list = await (await fetch(CDP + '/json/list')).json();
  const page = list.find((t) => t.type === 'page' && t.url.includes('127.0.0.1:9137')) || list.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map(); const events = [];
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } else if (m.method) events.push(m); };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params })); });
  await send('Page.enable'); await send('Runtime.enable');
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''));
    return r.result.value;
  };
  const goto = async (hash) => { await send('Page.navigate', { url: BASE + '#' + hash }); await sleep(500); };
  const results = [];
  const check = (name, ok, details = '') => { results.push({ name, ok: !!ok, details }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (details ? ' — ' + details : '')); if (!ok) process.exitCode = 1; };

  const html = fs.readFileSync(path.join(root, 'crm-redesign-demo.html'), 'utf8');
  check('no external script/link assets', !/(?:src|href)="(?!data:|#)[^"]+"/.test(html));

  await goto('students');
  let state = await evalJs(`({
    rows: document.querySelectorAll('.stu-list-table tbody tr').length,
    tools: document.querySelectorAll('.stu-toolbar .btn').length,
    cards: document.querySelectorAll('.stu-summary-card').length,
    resources: performance.getEntriesByType('resource').map(r => r.name).filter(n => !n.startsWith(location.origin + '/crm-redesign-demo.html')),
    scripts: [...document.scripts].map(s => s.src).filter(Boolean)
  })`);
  check('standalone list renders', state.rows === 10 && state.tools === 6 && state.cards === 4, JSON.stringify(state));
  check('standalone loads no external resources', state.resources.length === 0 && state.scripts.length === 0, JSON.stringify(state.resources.concat(state.scripts)));

  for (const tab of ['profile', 'applications', 'contracts', 'school_plans', 'offer', 'payments', 'coe', 'visa', 'homestay', 'history', 'reminders', 'revenue']) {
    await goto('student/D2026005/' + tab);
    const info = await evalJs(`({ tabs: document.querySelectorAll('.stu-tabbar .tab').length, len: document.body.innerText.length, denied: !!document.querySelector('.lock-message') })`);
    check('standalone tab ' + tab, info.tabs === 12 && info.len > 600 && !info.denied, JSON.stringify(info));
  }

  await goto('student/D2026005/coe');
  check('standalone CAAW shows Provider', await evalJs(`document.body.innerText.includes('CAAW_D2026005.pdf') && document.body.innerText.includes('Provider')`));
  await goto('student/D2026003/contracts');
  check('standalone contract version has single v', await evalJs(`/(^|\\s)v1 · /.test(document.body.innerText) && !/vv\\d/.test(document.body.innerText)`));

  const errs = events.filter((e) => e.method === 'Runtime.exceptionThrown').map((e) => e.params.exceptionDetails.text);
  check('standalone no runtime exceptions', errs.length === 0, errs.join(' | '));

  fs.writeFileSync(path.join(root, 'qa', 'standalone-student-results.json'), JSON.stringify({ results, runtimeErrors: errs }, null, 2), 'utf8');
  console.log('---');
  console.log(results.filter((r) => !r.ok).length ? 'FAILURES: ' + results.filter((r) => !r.ok).length : 'ALL STANDALONE CHECKS PASSED');
  ws.close();
  setTimeout(() => process.exit(process.exitCode || 0), 100);
})().catch((e) => { console.error('STANDALONE ERROR', e); process.exit(1); });
