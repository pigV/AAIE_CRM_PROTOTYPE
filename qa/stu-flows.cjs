/* End-to-end interaction checks for the student management prototype (CDP + headless Edge). */
const fs = require('fs');
const path = require('path');
const CDP = 'http://127.0.0.1:9229';
const BASE = 'http://127.0.0.1:9137/index.html';
const root = path.resolve(__dirname, '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect() {
  const list = await (await fetch(CDP + '/json/list')).json();
  const page = list.find((t) => t.type === 'page' && t.url.includes('127.0.0.1:9137'));
  if (!page) throw new Error('no prototype target');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map(); const events = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
    else if (m.method) events.push(m);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params })); });
  return { ws, send, events };
}

(async () => {
  const { ws, send, events } = await connect();
  await send('Page.enable'); await send('Runtime.enable');
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''));
    return r.result.value;
  };
  const goto = async (hash) => { await send('Page.navigate', { url: BASE + '#' + hash }); await sleep(400); };
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
  const click = async (selector) => { await evalJs(`document.querySelector(${JSON.stringify(selector)}).click()`); await sleep(160); };
  const submit = async () => { await evalJs(`document.querySelector('#stu-form').requestSubmit()`); await sleep(260); };
  const text = () => evalJs(`document.body.innerText`);

  await send('Page.reload'); await sleep(650);
  await goto('students');
  await shot('stu-01-list.png');

  // filters
  await evalJs(`(() => { const f=document.querySelector('#stu-filter-form'); f.querySelector('[name="q"]').value='许安然'; f.requestSubmit(); })()`);
  await sleep(250);
  let state = await evalJs(`({rows:document.querySelectorAll('.stu-list-table tbody tr').length, summary:document.querySelector('.stu-summary-card strong').textContent})`);
  check('filter by student name', state.rows === 1 && state.summary === '1', JSON.stringify(state));
  await click('[data-stu="reset-filters"]');

  // pagination
  await click('[data-stu="page-next"]');
  state = await evalJs(`({rows:document.querySelectorAll('.stu-list-table tbody tr').length, pager:document.querySelector('.stu-pager span').textContent})`);
  check('pagination page 2', state.rows === 3 && state.pager.includes('2 / 2'), JSON.stringify(state));
  await click('[data-stu="page-prev"]');

  // deleted students + restore + re-delete
  await goto('students/deleted');
  state = await evalJs(`({rows:document.querySelectorAll('tbody tr').length, text:document.body.innerText.includes('样例学生（已删除）')})`);
  check('deleted students page', state.rows === 1 && state.text, JSON.stringify(state));
  await click('[data-stu="restore-student"]');
  await sleep(200);
  state = await evalJs(`({rows:document.querySelectorAll('tbody tr').length, text:document.body.innerText, toast:document.querySelector('#toast').textContent})`);
  check('restore deleted student', state.text.includes('暂无已删除学生') && state.toast.includes('已恢复'), JSON.stringify(state));
  await goto('students');
  state = await evalJs(`document.querySelector('.stu-summary-card strong').textContent`);
  check('restored student visible in list', state === '14', 'count=' + state);

  // new student with all required fields
  await click('[data-stu="new-student"]');
  const filled = await evalJs(`(() => {
    const f=document.querySelector('#stu-form'); const seen=new Set();
    f.querySelectorAll('[required]').forEach(el=>{
      if(el.type==='radio'){ if(!seen.has(el.name)){ el.checked=true; seen.add(el.name); } }
      else if(el.tagName==='SELECT'){ el.selectedIndex=1; }
      else if(el.type==='checkbox'){ el.checked=true; }
      else if(el.type==='email'){ el.value='new.student@example.test'; }
      else if(el.type==='tel'){ el.value='0400000000'; }
      else if(el.name==='date_of_birth'||el.name.includes('_date_of_birth')){ el.value='01/01/2010'; }
      else { el.value='测试'; }
    });
    f.querySelectorAll('input[name="preferred_cities"]').forEach((x,i)=>{ if(i===0) x.checked=true; });
    f.querySelectorAll('input[name="accommodation_preference"]').forEach((x,i)=>{ if(i===0) x.checked=true; });
    return f.querySelectorAll('[required]').length;
  })()`);
  await submit();
  state = await evalJs(`({hash:location.hash, open:document.querySelector('#dialog').open, toast:document.querySelector('#toast').textContent, sections:document.querySelectorAll('.stu-section-card').length})`);
  check('create student from full 11-section form', state.hash.includes('/profile') && !state.open && state.sections === 11, 'required=' + filled + ' ' + JSON.stringify(state));
  await shot('stu-07-created-profile.png');

  // materials upload + review on D2026001
  await goto('student/D2026001/applications');
  await click('[data-stu="material-upload"]');
  await evalJs(`(() => { const f=document.querySelector('#stu-form'); f.querySelector('[name="material_type"]').value='Transcripts'; f.querySelector('[name="file_name"]').value='成绩单_补交.pdf'; })()`);
  await submit();
  state = await evalJs(`({missing:document.body.innerText.includes('缺少：'), uploaded:document.body.innerText.includes('成绩单_补交.pdf')})`);
  check('upload missing required material', !state.missing && state.uploaded, JSON.stringify(state));
  await click('[data-stu="materials-check"]');
  state = await evalJs(`document.body.innerText.includes('材料审核已完成')`);
  check('complete material review', state);
  await shot('stu-03-applications.png');

  // contract creation D2026008
  await goto('student/D2026008/contracts');
  const beforeContract = await evalJs(`document.querySelectorAll('.stu-record-card').length`);
  await click('[data-stu="contract-new"]');
  await submit();
  state = await evalJs(`({cards:document.querySelectorAll('.stu-record-card').length, hasNew:document.body.innerText.includes('新留学生合同')})`);
  check('create contract', state.cards === beforeContract + 1 && state.hasNew, JSON.stringify(state));
  await shot('stu-08-contracts.png');

  // school plan result D2026002
  await goto('student/D2026002/school_plans');
  await click('[data-stu="plan-result"]');
  await evalJs(`(() => { const f=document.querySelector('#stu-form'); f.querySelector('[name="result_status"]').value='offer_received'; f.querySelector('[name="is_offer_received"]').checked=true; f.querySelector('[name="is_final_school"]').checked=true; })()`);
  await submit();
  state = await evalJs(`document.body.innerText.includes('最终入读学校') && document.body.innerText.includes('已收到 Offer')`);
  check('update school plan result', state);
  await shot('stu-04-plans.png');

  // payment D2026003
  await goto('student/D2026003/payments');
  const beforePay = await evalJs(`document.querySelectorAll('tbody tr').length`);
  await click('[data-stu="payment-add"]');
  await evalJs(`(() => { const f=document.querySelector('#stu-form'); f.querySelector('[name="amount"]').value='1234.00'; f.querySelector('[name="category"]').value='Tuition Fee'; })()`);
  await submit();
  state = await evalJs(`({rows:document.querySelectorAll('tbody tr').length, has:document.body.innerText.includes('1234.00')})`);
  check('add payment record', state.rows === beforePay + 1 && state.has, JSON.stringify(state));
  await shot('stu-09-payments.png');

  // COE D2026005
  await goto('student/D2026005/coe');
  const beforeCoe = await evalJs(`document.querySelectorAll('.stu-record-card').length`);
  await click('[data-stu="coe-add"]');
  await submit();
  state = await evalJs(`document.querySelectorAll('.stu-record-card').length`);
  check('add COE record', state === beforeCoe + 1, beforeCoe + ' -> ' + state);
  await shot('stu-10-coe.png');

  // visa D2026012
  await goto('student/D2026012/visa');
  const beforeVisa = await evalJs(`document.querySelectorAll('.stu-record-card').length`);
  await click('[data-stu="visa-add"][data-purpose="current_application"]');
  await submit();
  state = await evalJs(`document.querySelectorAll('.stu-record-card').length`);
  check('add visa record', state === beforeVisa + 1, beforeVisa + ' -> ' + state);
  await shot('stu-05-visa.png');

  // reminder add D2026006
  await goto('student/D2026006/reminders');
  const beforeNotes = await evalJs(`document.querySelectorAll('.stu-note-card').length`);
  await evalJs(`(() => { const f=document.querySelector('form[data-stu-form="note-add"]'); f.querySelector('[name="description"]').value='自动化测试：跟进家长补充材料'; f.requestSubmit(); })()`);
  await sleep(260);
  state = await evalJs(`({cards:document.querySelectorAll('.stu-note-card').length, has:document.body.innerText.includes('自动化测试')})`);
  check('add reminder note', state.cards === beforeNotes + 1 && state.has, JSON.stringify(state));
  await shot('stu-11-reminders.png');

  // permissions
  await goto('student/D2026003/applications');
  await evalJs(`(() => { const r=document.querySelector('#role'); r.value='财务'; r.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await sleep(300);
  state = await evalJs(`({denied:!!document.querySelector('.lock-message'), tabs:document.querySelectorAll('.stu-tabbar .tab').length})`);
  check('finance role cannot see applications', state.denied && state.tabs === 5, JSON.stringify(state));
  await goto('student/D2026003/payments');
  state = await evalJs(`({denied:!!document.querySelector('.lock-message'), tabs:document.querySelectorAll('.stu-tabbar .tab').length})`);
  check('finance role sees payments', !state.denied && state.tabs === 5, JSON.stringify(state));
  await evalJs(`(() => { const r=document.querySelector('#role'); r.value='签证专员'; r.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await sleep(250);
  await goto('student/D2026003/contracts');
  state = await evalJs(`!!document.querySelector('.lock-message')`);
  check('visa officer cannot see contracts', state);
  await evalJs(`(() => { const r=document.querySelector('#role'); r.value='管理员'; r.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await sleep(250);

  // back to a clean list, reset demo state
  await send('Page.reload');
  await sleep(600);
  await goto('students');
  await shot('stu-01-list.png');

  const runtimeErrors = events.filter((e) => e.method === 'Runtime.exceptionThrown').map((e) => e.params.exceptionDetails.text);
  check('no runtime exceptions', runtimeErrors.length === 0, runtimeErrors.join(' | '));
  fs.writeFileSync(path.join(root, 'qa', 'stu-flow-results.json'), JSON.stringify({ results, runtimeErrors }, null, 2), 'utf8');
  console.log('---');
  console.log(results.filter((r) => !r.ok).length ? 'FAILURES: ' + results.filter((r) => !r.ok).length : 'ALL FLOW CHECKS PASSED');
  ws.close();
  setTimeout(() => process.exit(process.exitCode || 0), 100);
})().catch((e) => { console.error('FLOW ERROR', e); process.exit(1); });
