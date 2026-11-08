/* Layout checks at desktop and mobile widths. */
const fs = require('fs');
const path = require('path');
const CDP = 'http://127.0.0.1:9229';
const BASE = 'http://127.0.0.1:9137/index.html';
const root = path.resolve(__dirname, '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const list = await (await fetch(CDP + '/json/list')).json();
  const page = list.find((t) => t.type === 'page' && t.url.includes('127.0.0.1:9137'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map();
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params })); });
  await send('Page.enable'); await send('Runtime.enable');
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };
  const goto = async (hash) => { await send('Page.navigate', { url: BASE + '#' + hash }); await sleep(420); };
  const shot = async (name) => {
    const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(root, 'qa', name), Buffer.from(r.data, 'base64'));
  };
  const results = [];
  const check = (name, ok, details = '') => { results.push({ name, ok: !!ok, details }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (details ? ' — ' + details : '')); if (!ok) process.exitCode = 1; };

  for (const [label, width, height] of [['desktop', 1440, 1100], ['mobile', 390, 844]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: label === 'mobile' });
    await goto('students');
    let m = await evalJs(`(() => { const g = document.querySelector('.stu-filter-grid'); return { w: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, rows: document.querySelectorAll('.stu-list-table tbody tr').length, summaries: getComputedStyle(document.querySelector('.stu-summary')).gridTemplateColumns.split(' ').length, filters: g ? getComputedStyle(g).gridTemplateColumns.split(' ').length : 0 }; })()`);
    check(label + ' list no page overflow', m.sw <= m.w + 1, JSON.stringify(m));
    check(label + ' list rows', m.rows === 10, 'rows=' + m.rows);
    if (label === 'desktop') await shot('stu-layout-desktop-list.png');
    else await shot('stu-layout-mobile-list.png');
    await evalJs(`document.querySelector('.stu-filter-toggle').click()`);
    await sleep(180);
    m.filters = await evalJs(`(() => { const g = document.querySelector('.stu-filter-grid'); return g ? getComputedStyle(g).gridTemplateColumns.split(' ').length : 0; })()`);
    check(label + ' advanced filters open', m.filters > 0, 'cols=' + m.filters);
    await evalJs(`document.querySelector('.stu-filter-toggle').click()`);
    await sleep(120);

    await goto('student/D2026003/profile');
    m = await evalJs(`(() => ({ w: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, tabsVisible: getComputedStyle(document.querySelector('.student-tabs')).display, picker: getComputedStyle(document.querySelector('.section-picker')).display, facts: getComputedStyle(document.querySelector('.student-facts')).gridTemplateColumns.split(' ').length }))()`);
    check(label + ' profile no page overflow', m.sw <= m.w + 1, JSON.stringify(m));
    if (label === 'mobile') check('mobile uses tab picker', m.tabsVisible === 'none' && m.picker !== 'none', JSON.stringify(m));
    await shot('stu-layout-' + label + '-profile.png');

    await goto('student/D2026001/applications');
    m = await evalJs(`({ w: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, tables: document.querySelectorAll('.table-wrap').length })`);
    check(label + ' applications no page overflow', m.sw <= m.w + 1, JSON.stringify(m));
    await shot('stu-layout-' + label + '-applications.png');
  }

  fs.writeFileSync(path.join(root, 'qa', 'stu-layout-results.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log(results.filter((r) => !r.ok).length ? 'LAYOUT FAILURES' : 'ALL LAYOUT CHECKS PASSED');
  ws.close();
  setTimeout(() => process.exit(process.exitCode || 0), 100);
})().catch((e) => { console.error(e); process.exit(1); });
