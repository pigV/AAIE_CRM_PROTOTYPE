/* Headless Edge (CDP) smoke test for the student management prototype. */
const fs = require('fs');
const path = require('path');

const CDP = 'http://127.0.0.1:9229';
const BASE = 'http://127.0.0.1:9137/index.html';
const root = path.resolve(__dirname, '..');

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function target() {
  const list = await (await fetch(CDP + '/json/list')).json();
  const page = list.find((t) => t.type === 'page' && t.url.includes('127.0.0.1:9137'));
  if (!page) throw new Error('prototype target not found');
  return page.webSocketDebuggerUrl;
}

async function connect() {
  const ws = new WebSocket(await target());
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
    } else if (msg.method) {
      events.push(msg);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  return { ws, send, events };
}

(async () => {
  const { ws, send, events } = await connect();
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  const errors = [];
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''));
    return r.result.value;
  };
  const goto = async (hash) => {
    await send('Page.navigate', { url: BASE + '#' + hash });
    await sleep(450);
  };
  const shot = async (name) => {
    const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(root, 'qa', name), Buffer.from(r.data, 'base64'));
  };
  const results = [];
  const check = (name, ok, details = '') => {
    results.push({ name, ok: !!ok, details });
    console.log((ok ? 'PASS ' : 'FAIL ') + name + (details ? ' — ' + details : ''));
    if (!ok) process.exitCode = 1;
  };

  await goto('students');
  const list = await evalJs(`(() => ({
    title: document.title,
    h1: document.querySelector('.page-head h1')?.textContent,
    rows: document.querySelectorAll('.stu-list-table tbody tr').length,
    cards: document.querySelectorAll('.stu-summary-card').length,
    tools: [...document.querySelectorAll('.stu-toolbar .btn')].map(b => b.textContent.trim()),
    hasFilters: !!document.querySelector('#stu-filter-form'),
    bodyLen: document.body.innerText.length,
    stuGlobal: typeof STU_DETAILS,
    errors: window.__stuErrors || []
  }))()`);
  check('list page renders', list.h1 === '学生管理' && list.bodyLen > 1500, JSON.stringify(list).slice(0, 300));
  check('list has 10 rows on page 1', list.rows === 10, 'rows=' + list.rows);
  check('four summary cards', list.cards === 4, 'cards=' + list.cards);
  check('six toolbar actions', list.tools.length === 6, list.tools.join(' | '));
  check('filter form present', list.hasFilters);
  check('student data loaded', list.stuGlobal === 'object');
  await shot('stu-01-list.png');

  const tabs = ['profile', 'applications', 'contracts', 'school_plans', 'offer', 'payments', 'coe', 'visa', 'homestay', 'history', 'reminders', 'revenue'];
  for (const tab of tabs) {
    await goto('student/D2026003/' + tab);
    const info = await evalJs(`(() => ({ h: document.querySelector('.stu-tab-head h2, .stu-profile-grid h2, .card h2')?.textContent || '', tabs: document.querySelectorAll('.stu-tabbar .tab').length, len: document.body.innerText.length, denied: !!document.querySelector('.lock-message'), hasTable: !!document.querySelector('table'), cards: document.querySelectorAll('.card').length }))()`);
    check('tab ' + tab, info.len > 700 && info.tabs === 12 && !info.denied, JSON.stringify(info));
    if (tab === 'profile') await shot('stu-02-profile.png');
    if (tab === 'applications') await shot('stu-03-applications.png');
    if (tab === 'school_plans') await shot('stu-04-plans.png');
    if (tab === 'visa') await shot('stu-05-visa.png');
  }

  await goto('student/D2026001/applications');
  const materialCheck = await evalJs(`(() => { const b=[...document.querySelectorAll('[data-stu="materials-check"]')][0]; return b ? {disabled:b.disabled, text:b.textContent.trim()} : null; })()`);
  check('materials check button rendered for D1', !!materialCheck, JSON.stringify(materialCheck));

  await goto('student/D2026002/offer');
  const offerBefore = await evalJs(`(() => { const b=document.querySelector('[data-stu="offer-accept"]'); return !!b; })()`);
  if (offerBefore) {
    await evalJs(`document.querySelector('[data-stu="offer-accept"]').click()`);
    await sleep(200);
    const after = await evalJs(`document.body.innerText.includes('已接受')`);
    check('accept offer updates state', after);
  } else check('accept offer button present', false);

  await goto('students');
  await evalJs(`document.querySelector('[data-stu="new-student"]').click()`);
  await sleep(150);
  const formInfo = await evalJs(`(() => ({ open: document.querySelector('#dialog').open, fields: document.querySelectorAll('#stu-form input,#stu-form select,#stu-form textarea').length, sections: document.querySelectorAll('#stu-form .stu-form-section').length, title: document.querySelector('#dialog-title')?.textContent }))()`);
  check('new student dialog opens', formInfo.open && formInfo.fields > 90 && formInfo.sections === 11, JSON.stringify(formInfo));
  await shot('stu-06-new-form.png');
  await evalJs(`document.querySelector('#dialog [data-action="close-dialog"]').click()`);

  const runtimeErrors = events.filter((e) => e.method === 'Runtime.exceptionThrown').map((e) => e.params.exceptionDetails.text);
  check('no runtime exceptions', runtimeErrors.length === 0, runtimeErrors.join(' | '));

  fs.writeFileSync(path.join(root, 'qa', 'stu-results.json'), JSON.stringify({ results, runtimeErrors }, null, 2), 'utf8');
  console.log('---');
  console.log(results.filter((r) => !r.ok).length ? 'FAILURES: ' + results.filter((r) => !r.ok).length : 'ALL STUDENT CHECKS PASSED');
  ws.close();
  setTimeout(() => process.exit(process.exitCode || 0), 100);
})().catch((e) => { console.error('SMOKE ERROR', e); process.exit(1); });
