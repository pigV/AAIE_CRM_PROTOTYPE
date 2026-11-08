/* Student management module — aligned with the CRM source business flow.
   Loaded after app.js so its page renderers replace the generic demo ones. */
'use strict';

const STU_TAB_LABELS = {
  profile: '学生资料',
  applications: '申请材料',
  contracts: '合同',
  school_plans: '学校方案',
  offer: '录取通知',
  payments: '付款',
  coe: '入学确认与学生保险',
  visa: '签证',
  homestay: '住宿与接机',
  history: '历史记录',
  reminders: '留言与提醒',
  revenue: '收入与佣金',
};
const STU_TAB_ORDER = ['profile', 'applications', 'contracts', 'school_plans', 'offer', 'payments', 'coe', 'visa', 'homestay', 'history', 'reminders', 'revenue'];
const STU_PROFILE_ORDER = ['basic', 'contact', 'siblings', 'father', 'mother', 'accommodation', 'health', 'visa', 'study', 'emergency', 'notes'];
const STU_FILTER_DEFAULTS = {
  q: '', sort: 'recent', stage: '', lifecycle_type: '', consultant: '', year_level: '',
  alert: '', contract_status: '', parent_form: '', created_from: '', created_to: '', updated_from: '', updated_to: '',
};
const STU_SORT_OPTIONS = [
  ['recent', '最近更新'], ['created', '创建时间'], ['student_name', '学生姓名'], ['student_id', 'Student ID'],
  ['stage', '当前阶段'], ['consultant', '负责顾问'], ['waiting', '等待家长'], ['risk', '风险优先'],
  ['offer_expiry', 'Offer即将过期'], ['visa_expiry', '签证即将到期'],
];
const STU_ALERT_OPTIONS = [
  ['', '全部提醒'], ['waiting', '等待家长'], ['risk', '风险优先'], ['materials_pending', '材料待审核'],
  ['missing_docs', '缺材料'], ['missing_school_plan', '未制作学校方案'], ['offer_expiring', 'Offer即将过期'],
  ['visa_expiring', '签证即将到期'],
];
const STU_PLAN_RESULT_OPTIONS = [
  ['pending', '等待学校结果'], ['offer_received', '已收到 Offer'], ['rejected', '学校拒绝'],
  ['no_place_or_closed', '无学位／申请关闭'], ['withdrawn', '主动撤回'], ['voided', '申请记录作废'],
];
const STU_PLAN_SECTOR_LABELS = { public: '公校', private: '私校', unclassified: '待分类' };
const STU_PLAN_RESULT_LABELS = Object.fromEntries(STU_PLAN_RESULT_OPTIONS);
const STU_REVENUE_STREAM = { school_education: '中小学', higher_education: '高等教育' };
const STU_REVENUE_CYCLE = { initial: '初始申请', transfer: '转学', progression: '升学' };

const STU_PARENT_SUBMISSIONS = [
  {
    key: 'PF-2026-0101', name: '赵一川', english: 'Yichuan Zhao', grade: 'Year 9',
    city: 'Melbourne', owner: '陈顾问', submitted_at: '2026-11-08T08:40:00', form: '学生与家庭资料',
  },
  {
    key: 'PF-2026-0102', name: '钱雨桐', english: 'Yutong Qian', grade: 'Year 11',
    city: 'Sydney', owner: '王顾问', submitted_at: '2026-11-07T16:20:00', form: '学生与家庭资料',
  },
];

function stuFilters() {
  state.stuFilters = state.stuFilters || { ...STU_FILTER_DEFAULTS };
  return state.stuFilters;
}
function stuSelected() {
  state.stuSelected = state.stuSelected || new Set();
  return state.stuSelected;
}
function stuDeleted() {
  state.stuDeleted = state.stuDeleted || STU_DELETED_SEED.map((x) => ({ ...x }));
  return state.stuDeleted;
}
function stuParentLinks() {
  state.stuParentLinks = state.stuParentLinks || STU_PARENT_LINKS_SEED.map((x) => ({ ...x }));
  return state.stuParentLinks;
}
function stuParentSubmissions() {
  state.stuParentSubmissions = state.stuParentSubmissions || STU_PARENT_SUBMISSIONS.map((x) => ({ ...x }));
  return state.stuParentSubmissions;
}
function stuDetail(id) { return STU_DETAILS[id]; }
function stuAlerts(s) { return (STU_DETAILS[s.id] || {}).alerts || s.alerts || []; }
function stuLifecycleLabel(v) { return v === 'transfer' ? '转学' : v === 'progression' ? '升学' : '新申请'; }
function stuToday() { return '08/11/2026'; }
function stuIsoToday() { return '2026-11-08'; }
function stuAuToIso(v) {
  const m = String(v || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? m[3] + '-' + m[2] + '-' + m[1] : '';
}
function stuIsoToAu(v) {
  const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[3] + '/' + m[2] + '/' + m[1] : String(v || '');
}
function stuWithin(iso, from, to) {
  if (from && iso && iso < from) return false;
  if (to && iso && iso > to) return false;
  return true;
}
function stuHasAlert(s, key) {
  const alerts = stuAlerts(s);
  return key === 'waiting' || key === 'risk'
    ? alerts.some((a) => a.level === key)
    : alerts.some((a) => a.key === key);
}
function stuContractStatuses(s) {
  return (stuDetail(s.id)?.contracts || []).map((c) => c.status);
}
function stuOfferExpiryIso(s) {
  const d = stuDetail(s.id);
  const dates = (d?.offers || []).filter((o) => !o.accepted && o.status !== 'rejected')
    .map((o) => stuAuToIso(o.offer_expiry_date)).filter(Boolean).sort();
  return dates[0] || '9999-12-31';
}
function stuVisaExpiryIso(s) {
  const d = stuDetail(s.id);
  const dates = (d?.visas || []).filter((v) => ['granted', 'active'].includes(v.visa_status))
    .map((v) => stuAuToIso(v.visa_expiry_date)).filter(Boolean).sort();
  return dates[0] || '9999-12-31';
}

function stuFilteredStudents() {
  const f = stuFilters();
  const q = String(f.q || '').trim().toLowerCase();
  let rows = DEMO.students.filter((s) => {
    if (q && ![s.id, s.name, s.english, s.school, s.owner, s.email, s.phone, s.grade].join(' ').toLowerCase().includes(q)) return false;
    if (f.stage && s.stage !== f.stage) return false;
    if (f.lifecycle_type && s.lifecycle !== f.lifecycle_type) return false;
    if (f.consultant && s.owner !== f.consultant) return false;
    if (f.year_level && s.grade !== f.year_level) return false;
    if (f.alert && !stuHasAlert(s, f.alert)) return false;
    if (f.contract_status && !stuContractStatuses(s).includes(f.contract_status)) return false;
    if (f.parent_form === 'pending' && s.parent_form !== 'Pending') return false;
    if (!stuWithin(s.created_at, f.created_from, f.created_to)) return false;
    if (!stuWithin(s.updated, f.updated_from, f.updated_to)) return false;
    return true;
  });
  const byNumber = (a, b) => String(a).localeCompare(String(b), 'zh-Hans-CN');
  rows = rows.slice().sort((a, b) => {
    switch (f.sort) {
      case 'created': return String(b.created_at).localeCompare(String(a.created_at));
      case 'student_name': return byNumber(a.name, b.name);
      case 'student_id': return byNumber(a.id, b.id);
      case 'stage': return b.stage_index - a.stage_index;
      case 'consultant': return byNumber(a.owner, b.owner) || byNumber(a.id, b.id);
      case 'waiting': {
        const ca = stuAlerts(a).filter((x) => x.level === 'waiting').length;
        const cb = stuAlerts(b).filter((x) => x.level === 'waiting').length;
        return cb - ca;
      }
      case 'risk': {
        const ca = stuAlerts(a).filter((x) => x.level === 'risk').length;
        const cb = stuAlerts(b).filter((x) => x.level === 'risk').length;
        return cb - ca;
      }
      case 'offer_expiry': return stuOfferExpiryIso(a).localeCompare(stuOfferExpiryIso(b));
      case 'visa_expiry': return stuVisaExpiryIso(a).localeCompare(stuVisaExpiryIso(b));
      default: return String(b.updated).localeCompare(String(a.updated));
    }
  });
  return rows;
}

function stuSelect(name, value, options, extra = '') {
  return `<select name="${name}" ${extra}>${options.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
}
function stuField(label, name, value, opts = {}) {
  const wide = opts.wide ? ' wide' : '';
  if (opts.options) {
    return `<label class="${wide.trim()}">${esc(label)}${opts.required ? ' <span class="stu-req">*</span>' : ''}${stuSelect(name, value, opts.options, opts.required ? 'required' : '')}</label>`;
  }
  if (opts.textarea) {
    return `<label class="${wide.trim()}">${esc(label)}${opts.required ? ' <span class="stu-req">*</span>' : ''}<textarea name="${name}" ${opts.required ? 'required' : ''} placeholder="${esc(opts.placeholder || '')}">${esc(value || '')}</textarea></label>`;
  }
  return `<label class="${wide.trim()}">${esc(label)}${opts.required ? ' <span class="stu-req">*</span>' : ''}<input type="${opts.type || 'text'}" name="${name}" value="${esc(value || '')}" ${opts.required ? 'required' : ''} placeholder="${esc(opts.placeholder || '')}"></label>`;
}
function stuDisplayOption(key, value) {
  if (value === null || value === undefined || value === '') return '—';
  const year = String(value).match(/^Year (\d+)$/);
  if (year) return year[1] + '年级';
  if (key === 'preferred_intake_term') return ({ '02': '2月入学', '04': '4月入学', '07': '7月入学', '10': '10月入学', unsure: '不确定' })[value] || value;
  if (key === 'application_stream') return ({ school_education: '中小学申请', higher_education: '高等教育申请' })[value] || value;
  if (key === 'higher_education_course_type') return ({ Foundation: '预科', Diploma: '文凭课程', Bachelor: '本科', Postgraduate: '研究生', Package: '打包课程' })[value] || value;
  if (key === 'higher_education_package_combination') return ({ 'Foundation + Bachelor': '预科 + 本科', 'Diploma + Bachelor': '文凭课程 + 本科', 'Foundation + Diploma + Bachelor': '预科 + 文凭课程 + 本科' })[value] || value;
  if (key === 'preferred_cities') return ({ melbourne: '墨尔本', sydney: '悉尼', brisbane: '布里斯班', adelaide: '阿德莱德', perth: '珀斯', canberra: '堪培拉', tasmania: '塔斯马尼亚', unsure: '不确定' })[value] || value;
  const meta = STU_FIELD_MAP[key];
  if (meta && meta.options) {
    const hit = meta.options.find((o) => String(o).split('|')[0] === String(value));
    if (hit) return String(hit).split('|').slice(1).join('|') || hit;
  }
  return String(value);
}
function stuDisplay(key, value) {
  if (Array.isArray(value)) {
    const parts = value.map((v) => stuDisplayOption(key, v)).filter((v) => v && v !== '—');
    return parts.length ? parts.join('、') : '—';
  }
  return stuDisplayOption(key, value);
}
function stuProfileFacts(fields, profile) {
  return `<div class="facts-grid stu-facts">${fields.map((f) => {
    const key = f[0], label = f[1];
    const val = stuDisplay(key, (profile || {})[key]);
    return `<div class="fact"><small>${esc(label)}</small><span title="${esc(val)}">${esc(val)}</span></div>`;
  }).join('')}</div>`;
}
function stuSectionDef(id) { return STU_SECTIONS.find((x) => x[0] === id); }
function stuSummaryCard(label, value, foot, tone = '') {
  return `<div class="stu-summary-card ${tone}"><small>${esc(label)}</small><strong>${value}</strong><span>${esc(foot || '')}</span></div>`;
}
function stuBtn(text, action, kind = '', attrs = '') {
  return `<button class="btn ${kind}" data-stu="${action}" ${attrs}>${text}</button>`;
}
function stuLink(text, href, kind = '') {
  return `<a class="btn ${kind}" href="#${href}">${text}</a>`;
}
function stuEmpty(text) {
  return `<div class="empty">${ico('folder')}<p>${esc(text)}</p></div>`;
}
function stuBadge(value) { return badge(value); }
function stuWritable() { return writable(); }

function stuPlanCurrent(s) {
  return (stuDetail(s.id)?.plans || []).filter((p) => p.is_current);
}
function stuFinalSchool(s) {
  const plan = stuPlanCurrent(s).find((p) => p.status === 'confirmed');
  const row = plan && plan.confirmed_schools.find((x) => x.is_final_school);
  return (row && row.school_name) || s.final_school || '待确认';
}
function stuPlanSummary(s) {
  const plans = stuPlanCurrent(s);
  if (!plans.length) return '未制作';
  const p = plans[0];
  if (p.status === 'confirmed') return '已确认 · ' + stuFinalSchool(s);
  return '草稿 / 待家长确认';
}
function stuOfferSummary(s) {
  const offers = stuDetail(s.id)?.offers || [];
  if (!offers.length) return '无 Offer';
  const accepted = offers.find((o) => o.accepted);
  if (accepted) return '已接受 · ' + accepted.school_name;
  return (STU_OFFER_STATUS[offers[0].status] || offers[0].status) + ' · ' + offers[0].school_name;
}
function stuParentFormLabel(s) { return s.parent_form === 'Pending' ? '待提交' : '已提交'; }
function stuMaterialsLabel(s) {
  const d = stuDetail(s.id);
  if (!d) return '—';
  return d.materials_checked ? '材料审核已完成' : (d.parent_form_submitted ? '材料待审核' : '等待家长提交');
}

/* ---------------- student list ---------------- */
function stuStageCounts() {
  const counts = {};
  DEMO.students.forEach((s) => { counts[s.stage] = (counts[s.stage] || 0) + 1; });
  return counts;
}
function stuAdvancedCount(f) {
  return ['lifecycle_type', 'consultant', 'year_level', 'alert', 'contract_status', 'created_from', 'created_to', 'updated_from', 'updated_to'].filter((k) => f[k]).length;
}
function stuCaptureFilters() {
  const form = document.querySelector('#stu-filter-form');
  if (!form) return;
  const fd = new FormData(form);
  const f = stuFilters();
  Object.keys(STU_FILTER_DEFAULTS).forEach((k) => { const v = fd.get(k); if (v !== null) f[k] = String(v); });
}
function stuFilterChips(f) {
  const chips = [];
  const push = (label, key) => chips.push({ label, key });
  if (f.q) push('搜索：' + f.q, 'q');
  if (f.stage) push('阶段：' + f.stage, 'stage');
  if (f.parent_form) push('表单待提交', 'parent_form');
  if (f.alert) push((STU_ALERT_OPTIONS.find((x) => x[0] === f.alert) || ['', f.alert])[1], 'alert');
  if (f.lifecycle_type) push('业务：' + ({ initial: '新申请', transfer: '转学', progression: '升学' }[f.lifecycle_type] || f.lifecycle_type), 'lifecycle_type');
  if (f.consultant) push('顾问：' + f.consultant, 'consultant');
  if (f.year_level) push('年级：' + f.year_level, 'year_level');
  if (f.contract_status) push('合同：' + (STU_CONTRACT_STATUS[f.contract_status] || f.contract_status), 'contract_status');
  if (f.created_from) push('建档 ≥ ' + f.created_from, 'created_from');
  if (f.created_to) push('建档 ≤ ' + f.created_to, 'created_to');
  if (f.updated_from) push('更新 ≥ ' + f.updated_from, 'updated_from');
  if (f.updated_to) push('更新 ≤ ' + f.updated_to, 'updated_to');
  return chips;
}
function stuSummaryAction(label, value, foot, tone, key, val, active) {
  return `<button type="button" class="stu-summary-card ${tone} ${active ? 'is-active' : ''}" data-stu="stu-quick" data-key="${key}" data-value="${val}" aria-pressed="${active}"><small>${esc(label)}</small><strong>${value}</strong><span>${esc(foot)}</span></button>`;
}
function students() {
  if (route().split('/')[1] === 'deleted') return stuDeletedPage();
  const f = stuFilters();
  const rows = stuFilteredStudents();
  const perPage = 10;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  state.stuPage = Math.min(Math.max(1, state.stuPage || 1), pages);
  const pageRows = rows.slice((state.stuPage - 1) * perPage, state.stuPage * perPage);
  const waiting = rows.filter((s) => stuHasAlert(s, 'waiting')).length;
  const risk = rows.filter((s) => stuHasAlert(s, 'risk')).length;
  const pendingForm = rows.filter((s) => s.parent_form === 'Pending').length;
  const selected = stuSelected();
  const activeAdvanced = stuAdvancedCount(f);
  const advOpen = !!state.stuAdvOpen;
  const stageCounts = stuStageCounts();
  const chips = stuFilterChips(f);
  const toolbar = `<div class="stu-toolbar">
    ${stuBtn(ico('plus') + ' 新建学生', 'new-student', 'primary', !stuWritable() ? 'disabled' : '')}
    ${stuBtn('生成家长表单链接', 'parent-link')}
    ${stuBtn('从家长表单建档', 'from-parent')}
    ${stuBtn('下载 Excel 模板', 'excel-template')}
    ${stuBtn('已删除学生', 'deleted-students')}
    ${stuBtn('Excel 导入', 'excel-import')}
  </div>`;
  const advanced = `<div class="stu-advanced-panel" id="stu-advanced-panel">
      <div class="stu-filter-grid">
        <label>业务类型${stuSelect('lifecycle_type', f.lifecycle_type, [['', '全部业务类型'], ['initial', '新申请'], ['transfer', '转学'], ['progression', '升学']])}</label>
        <label>负责顾问${stuSelect('consultant', f.consultant, [['', '全部顾问']].concat([...new Set(DEMO.students.map((s) => s.owner))].map((x) => [x, x])))}</label>
        <label>申请年级${stuSelect('year_level', f.year_level, [['', '全部年级']].concat([...new Set(DEMO.students.map((s) => s.grade))].map((x) => [x, x])))}</label>
        <label>提醒筛选${stuSelect('alert', f.alert, STU_ALERT_OPTIONS)}</label>
        <label>合同状态${stuSelect('contract_status', f.contract_status, [['', '全部合同状态']].concat(Object.entries(STU_CONTRACT_STATUS).map(([v, l]) => [v, l])))}</label>
        <label>建档时间从<input type="date" name="created_from" value="${esc(f.created_from)}"></label>
        <label>建档时间到<input type="date" name="created_to" value="${esc(f.created_to)}"></label>
        <label>更新时间从<input type="date" name="updated_from" value="${esc(f.updated_from)}"></label>
        <label>更新时间到<input type="date" name="updated_to" value="${esc(f.updated_to)}"></label>
      </div>
      <div class="stu-filter-actions">
        <button class="btn primary" type="submit">应用筛选</button>
        <button class="btn" type="button" data-stu="reset-filters">重置筛选</button>
        <span class="muted">筛选条件可组合使用，结果即时更新。</span>
      </div>
    </div>`;
  const filter = `<section class="card stu-filter-card">
    <form id="stu-filter-form" data-stu-form="filters">
      <input type="hidden" name="stage" value="${esc(f.stage)}">
      <input type="hidden" name="parent_form" value="${esc(f.parent_form)}">
      <div class="stu-searchrow">
        <label class="search-field stu-search">${ico('search')}<input name="q" type="text" enterkeyhint="search" value="${esc(f.q)}" placeholder="搜索学生姓名、编号、学校或顾问" aria-label="搜索学生"></label>
        <label class="stu-sort">${stuSelect('sort', f.sort, STU_SORT_OPTIONS, 'data-stu-auto aria-label="排序"')}</label>
        <button type="button" class="btn stu-filter-toggle ${advOpen ? 'is-open' : ''}" data-stu="stu-adv-toggle" aria-expanded="${advOpen}" aria-controls="stu-advanced-panel"><svg class="stu-filter-ico" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 3.5h12L9.6 8.9v4.1l-3.2 1.6V8.9L2 3.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg> 筛选${activeAdvanced ? `<span class="stu-filter-count">${activeAdvanced}</span>` : ''}</button>
        <button type="submit" class="btn primary stu-submit">查询</button>
      </div>
      ${advOpen ? advanced : ''}
      ${chips.length ? `<div class="stu-chips">${chips.map((c) => `<button type="button" class="stu-chip" data-stu="stu-chip" data-key="${c.key}" aria-label="移除筛选：${esc(c.label)}">${esc(c.label)}<span class="stu-chip-x" aria-hidden="true">×</span></button>`).join('')}<button type="button" class="stu-chip-clear" data-stu="reset-filters">清除全部</button></div>` : ''}
    </form>
    <div class="stu-stagebar" role="group" aria-label="按申请阶段筛选">
      <button type="button" class="stu-stage ${!f.stage ? 'is-active' : ''}" data-stu="stu-stage" data-value="" aria-pressed="${!f.stage}" title="全部 ${DEMO.students.length} 位学生">全部阶段<span class="stu-stage-n">${DEMO.students.length}</span></button>
      ${STU_STAGES.map((st, i) => `<button type="button" class="stu-stage ${f.stage === st ? 'is-active' : ''}" data-stu="stu-stage" data-value="${esc(st)}" aria-pressed="${f.stage === st}" title="${esc(st)} · ${stageCounts[st] || 0} 位学生"><span class="stu-stage-order">${String(i + 1).padStart(2, '0')}</span>${esc(st)}</button>`).join('')}
    </div>
  </section>`;
  const summary = `<div class="stu-summary stu-list-summary" aria-label="筛选结果摘要">
    <div class="stu-summary-card accent"><small>当前结果</small><strong>${rows.length}</strong><span>符合当前筛选条件</span></div>
    ${stuSummaryAction('等待家长', waiting, '含未提交表单或等待家长', 'warn', 'alert', 'waiting', f.alert === 'waiting')}
    ${stuSummaryAction('风险提醒', risk, '缺材料、签证到期', 'danger', 'alert', 'risk', f.alert === 'risk')}
    ${stuSummaryAction('表单待提交', pendingForm, '家长表单尚未提交', 'warn', 'parent_form', 'pending', f.parent_form === 'pending')}
  </div>`;
  const bulk = `<div class="stu-bulk">
    <label class="stu-check"><input type="checkbox" data-stu-select-all ${pageRows.length && pageRows.every((s) => selected.has(s.id)) ? 'checked' : ''}> 本页全选</label>
    <span class="result-count">已选 ${selected.size}</span>
    <div class="stu-bulk-actions">
      ${stuBtn('分配顾问', 'bulk-assign', 'small', 'disabled')}
      ${stuBtn('导出选中', 'bulk-export', 'small', 'disabled')}
      ${stuBtn('标记等待/提醒', 'bulk-remind', 'small', 'disabled')}
      ${stuBtn('批量删除', 'bulk-delete', 'small danger', selected.size ? '' : 'disabled')}
    </div>
    <span class="stu-bulk-note" title="Admin / Manager 可批量软删除；删除后可在已删除学生中恢复">${ico('info')}</span>
  </div>`;
  const table = `<div class="table-wrap stu-list-table" tabindex="0" aria-label="学生列表，可横向滚动">
    <table><thead><tr>
      <th class="stu-col-check"><input type="checkbox" data-stu-select-all ${pageRows.length && pageRows.every((s) => selected.has(s.id)) ? 'checked' : ''} aria-label="选择本页学生"></th>
      <th>学生号</th><th>学生名</th><th>申请阶段</th><th>最终确认学校</th><th>申请年级</th><th>建档时间</th><th>Offer开学时间</th><th>下签时间</th><th class="stu-col-ops">操作</th>
    </tr></thead><tbody>${pageRows.length ? pageRows.map((s, idx) => {
      const alerts = stuAlerts(s);
      const riskN = alerts.filter((a) => a.level === 'risk').length;
      const waitN = alerts.filter((a) => a.level === 'waiting').length;
      const flag = riskN
        ? `<span class="stu-flag risk" title="${riskN} 项风险提醒" aria-label="${riskN} 项风险提醒">${riskN > 1 ? riskN : ''}</span>`
        : waitN
          ? `<span class="stu-flag waiting" title="${waitN} 项等待家长提醒" aria-label="${waitN} 项等待家长提醒">${waitN > 1 ? waitN : ''}</span>`
          : '';
      const school = stuFinalSchool(s);
      const tone = ['', 'sage', 'blue', 'rose'][idx % 4];
      return `<tr data-id="${esc(s.id)}">
      <td class="stu-td-check"><input type="checkbox" data-stu-select="${esc(s.id)}" ${selected.has(s.id) ? 'checked' : ''} aria-label="选择 ${esc(s.name)}"></td>
      <td class="stu-td-id" data-label="学生号"><a class="stu-id-link" href="#student/${esc(s.id)}/profile">${esc(s.id)}</a></td>
      <td class="stu-td-name" data-label="学生"><div class="student-cell"><span class="avatar ${tone}">${esc(s.avatar || s.name[0])}</span><div><div class="stu-name-line"><strong>${esc(s.name)}</strong>${flag}</div><small>${esc(s.english)} · ${esc(stuLifecycleLabel(s.lifecycle))}</small></div></div></td>
      <td class="stu-td-stage" data-label="申请阶段"><span class="stu-stage-tag"><i></i>${esc(s.stage)}</span></td>
      <td class="stu-td-school" data-label="最终确认学校"><span class="stu-school" title="${esc(school)}">${esc(school.replace('（虚构）', ''))}</span></td>
      <td class="stu-td-grade" data-label="申请年级">${esc(s.grade)}</td>
      <td class="stu-td-created" data-label="建档时间"><span class="stu-date">${esc(stuIsoToAu(s.created_at))}</span></td>
      <td class="stu-td-offer" data-label="Offer开学时间"><span class="stu-date">${esc(s.offer_course_start || '—')}</span></td>
      <td class="stu-td-visa" data-label="下签时间"><span class="stu-date">${esc(s.visa_grant_date || '—')}</span></td>
      <td class="stu-td-ops"><div class="stu-row-actions">${stuLink('查看档案', 'student/' + s.id + '/profile', 'stu-op')}${stuBtn('编辑', 'edit-student', 'stu-op', `data-id="${s.id}"`)}${stuBtn('删除', 'delete-student', 'stu-op danger', `data-id="${s.id}"`)}</div></td>
    </tr>`;
    }).join('') : `<tr><td colspan="10"><div class="stu-empty">${ico('search')}<strong>没有符合条件的学生</strong><p>换个关键词，或清除当前筛选。</p><button class="btn small" type="button" data-stu="reset-filters">清除筛选</button></div></td></tr>`}</tbody></table>
  </div>`;
  const pager = `<div class="stu-pager"><span>共 ${rows.length} 条 · 第 ${state.stuPage} / ${pages} 页</span><div>${stuBtn('上一页', 'page-prev', 'small', state.stuPage <= 1 ? 'disabled' : '')}${stuBtn('下一页', 'page-next', 'small', state.stuPage >= pages ? 'disabled' : '')}</div></div>`;
  return head('学生管理', '查找学生，查看办理进度，直接推进下一步。', '', 'STUDENTS / 学生全生命周期')
    + toolbar + filter + summary + `<section class="card stu-list-card">${bulk}${table}${pager}</section>`
    + `<p class="demo-note">13 名虚构学生，覆盖全部 13 个办理阶段；刷新页面恢复初始数据。</p>`;
}

function stuDeletedPage() {
  const rows = stuDeleted();
  return `<div class="page-head"><div class="page-heading"><h1>已删除学生</h1><p>软删除记录保留学生号、顾问与删除审计信息，可恢复。</p></div><div class="head-actions">${stuLink('返回学生列表', 'students', 'small')}</div></div>
    <section class="card"><div class="card-head"><div><h2>已删除学生</h2><p>仅 Admin / Manager 可恢复；正式系统同时保留关联业务记录。</p></div></div>
    <div class="table-wrap"><table><thead><tr><th>Student ID</th><th>学生</th><th>顾问</th><th>删除时间</th><th>删除人</th><th>操作</th></tr></thead><tbody>
    ${rows.length ? rows.map((r) => `<tr><td class="mono">${esc(r.student.id)}</td><td><strong>${esc(r.student.name)}</strong><small class="muted"> ${esc(r.student.english)}</small></td><td>${esc(r.student.owner)}</td><td>${esc(stuIsoToAu(r.deleted_at))} ${esc(String(r.deleted_at).slice(11, 16))}</td><td>${esc(r.deleted_by)}</td><td>${stuBtn('恢复', 'restore-student', 'small primary', `data-id="${esc(r.student.id)}"`)}</td></tr>`).join('') : `<tr><td colspan="6">${stuEmpty('暂无已删除学生。')}</td></tr>`}
    </tbody></table></div></section>`;
}

/* ---------------- student detail ---------------- */
function student(id, sub) {
  const s = studentById(id);
  if (!s) return head('未找到学生', '此编号不在本次演示数据中。', stuLink('返回学生列表', 'students'));
  const d = stuDetail(id);
  if (!d) return head('学生档案未建立', '该学生缺少演示档案数据。', stuLink('返回学生列表', 'students'));
  const tab = STU_TAB_LABELS[sub] ? sub : 'profile';
  const alerts = stuAlerts(s);
  const allowed = canViewStudentTab(tab);
  const hero = `<section class="student-hero stu-hero">
    <div class="student-hero-top">
      <div class="student-identity"><span class="avatar">${esc(s.avatar || s.name[0])}</span><div><div class="stu-hero-title"><h1>${esc(s.name)}</h1>${stuBadge(s.stage)}<span class="badge blue">${esc(stuLifecycleLabel(s.lifecycle))}</span></div><small>${esc(s.english)} · ${esc(s.id)} · ${esc(s.type)}</small></div></div>
      <div class="head-actions">${stuLink('转学 / 升学', 'case/' + (s.lifecycle === 'progression' ? 'progression' : 'transfer') + '/' + s.id + '/overview', 'small')}${stuBtn('编辑学生资料', 'edit-student', '', `data-id="${s.id}"`)}${stuBtn('删除学生', 'delete-student', 'danger', `data-id="${s.id}"`)}</div>
    </div>
    <div class="student-facts">${[['当前业务', stuLifecycleLabel(s.lifecycle)], ['申请类型', s.type], ['申请年级', s.grade], ['入学时间', s.intake], ['目标城市', s.city], ['负责顾问', s.owner], ['最终确认学校', stuFinalSchool(s)], ['建档时间', stuIsoToAu(s.created_at)]].map(([k, v]) => `<div><small>${k}</small><strong>${esc(v)}</strong></div>`).join('')}</div>
  </section>`;
  const summary = `<div class="stu-summary stu-detail-summary">
    ${stuSummaryCard('当前阶段', esc(s.stage), '建档 ' + stuIsoToAu(s.created_at) + ' · 更新 ' + stuIsoToAu(s.updated), 'accent')}
    ${stuSummaryCard('学校方案', esc(stuPlanSummary(s)), (stuPlanCurrent(s)[0] ? 'v' + stuPlanCurrent(s)[0].version : '尚未制作'))}
    ${stuSummaryCard('Offer', esc(stuOfferSummary(s)), (stuDetail(s.id)?.offers || []).length + ' 条录取记录')}
    ${stuSummaryCard('家长表单 / 材料', esc(stuParentFormLabel(s)), esc(stuMaterialsLabel(s)), s.parent_form === 'Pending' ? 'warn' : '')}
    ${stuSummaryCard('文件存储', esc(d.storage_status), '学生目录与文件归档状态', d.storage_status === '正常' ? '' : 'warn')}
  </div>`;
  const alertHTML = alerts.length ? `<div class="stu-alert-list">${alerts.map((a) => `<a class="stu-alert ${a.level}" href="#student/${s.id}/${a.tab}">${ico(a.level === 'risk' ? 'bell' : 'clock')}<span><strong>${esc(a.label)}</strong><small>${a.level === 'risk' ? '需优先处理' : '等待家长或下一步'}</small></span>${ico('chevron')}</a>`).join('')}</div>` : `<div class="stu-alert-list"><span class="stu-alert ok">${ico('check')}<span><strong>暂无风险提醒</strong><small>当前阶段关键事项均已完成</small></span></span></div>`;
  const actions = `<div class="stu-actionbar">
    ${stuBtn((s.type === '高等教育' ? '制作高等教育学校方案' : '制作学校方案'), 'new-plan', '', `data-id="${s.id}"`)}
    ${stuBtn('编辑学生资料', 'edit-student', '', `data-id="${s.id}"`)}
    ${stuBtn('记录留言', 'note-add', '', `data-id="${s.id}"`)}
    ${stuBtn('建立500签证', 'visa-add', '', `data-id="${s.id}" data-purpose="current_application" data-sector="Schools Sector"`)}
    ${stuBtn('建立590签证', 'visa-add', '', `data-id="${s.id}" data-purpose="current_application" data-sector="590 陪读"`)}
    <span class="stu-actionbar-note">${ico('info')} 学生号、文件夹路径、建档时间不可修改</span>
  </div>`;
  return `<div class="page-head stu-crumb"><div class="crumb"><a href="#students">学生管理</a><span>/</span><strong>${esc(s.name)}</strong></div>${stuLink('返回学生列表', 'students', 'small')}</div>`
    + hero + summary + alertHTML + actions + studentNavigation(s.id, tab) + (allowed ? stuTab(s, d, tab) : denied())
    + `<p class="demo-note">学生档案、业务记录与家长协作状态均为虚构演示；刷新页面恢复初始数据。</p>`;
}

function canViewStudentTab(tab) {
  if (['revenue', 'payments'].includes(tab)) return ['管理员', '财务'].includes(state.role);
  if (state.role === '签证专员') return ['profile', 'applications', 'coe', 'visa', 'history', 'reminders'].includes(tab);
  if (state.role === '财务') return ['profile', 'contracts', 'payments', 'revenue', 'history'].includes(tab);
  return true;
}

function studentNavigation(id, active) {
  const tabs = STU_TAB_ORDER.filter((k) => canViewStudentTab(k));
  if (!tabs.length) return '';
  const prefix = 'student/' + id + '/';
  return `<div class="student-navigation stu-tabbar"><nav class="tabs student-tabs" aria-label="学生业务分区">${tabs.map((k) => `<a class="tab ${k === active ? 'active' : ''}" href="#${prefix + k}" ${k === active ? 'aria-current="page"' : ''}>${esc(STU_TAB_LABELS[k])}</a>`).join('')}</nav><label class="section-picker">当前分区${stuSelect('', active, tabs.map((k) => [k, STU_TAB_LABELS[k]]), `data-route-picker aria-label="选择学生业务分区"`)}</label></div>`;
}

function stuTab(s, d, tab) {
  switch (tab) {
    case 'applications': return stuApplicationsTab(s, d);
    case 'contracts': return stuContractsTab(s, d);
    case 'school_plans': return stuPlansTab(s, d);
    case 'offer': return stuOfferTab(s, d);
    case 'payments': return stuPaymentsTab(s, d);
    case 'coe': return stuCoeTab(s, d);
    case 'visa': return stuVisaTab(s, d);
    case 'homestay': return stuHomestayTab(s, d);
    case 'history': return stuHistoryTab(s, d);
    case 'reminders': return stuRemindersTab(s, d);
    case 'revenue': return stuRevenueTab(s, d);
    default: return stuProfileTab(s, d);
  }
}

function stuProfileTab(s, d) {
  const left = STU_PROFILE_ORDER.map((id) => {
    const def = stuSectionDef(id);
    if (!def) return '';
    return `<section class="card stu-section-card"><div class="card-head"><h2>${esc(def[1])}</h2></div><div class="card-pad stu-section-body">${stuProfileFacts(def[2], d.profile[id])}</div></section>`;
  }).join('');
  const recent = d.history.slice(0, 6).map((h) => `<div class="activity-item"><strong>${esc(h.field)}</strong><p>${esc(h.before || '—')} → ${esc(h.after || '—')}</p><time>${esc(stuIsoToAu(h.changed_at))} · ${esc(h.user)}</time></div>`).join('');
  const right = `<section class="card"><div class="card-head"><h2>档案信息</h2>${stuBadge('档案已建立')}</div><div class="card-pad">${facts([
    ['Student ID', s.id], ['建档时间', stuIsoToAu(s.created_at)], ['最近更新', stuIsoToAu(s.updated)],
    ['负责顾问', s.owner], ['文件夹路径', 'students/' + s.id + '/' + s.english.replace(/\s+/g, '_')],
    ['学生状态', s.lifecycle === 'progression' ? '升学中' : s.lifecycle === 'transfer' ? '转学中' : '在读申请'],
  ])}</div></section>
  <section class="card"><div class="card-head"><div><h2>StudentInfo.docx</h2><p>学生信息表由资料自动生成或保留现有文件</p></div>${stuBadge(d.docx.updated_at ? '已生成' : '待生成')}</div><div class="card-pad"><div class="facts-grid"><div class="fact"><small>文件名称</small><span>${esc(d.docx.file_name)}</span></div><div class="fact"><small>更新时间</small><span>${esc(stuIsoToAu(d.docx.updated_at))}</span></div></div><div class="link-row">${stuBtn('下载', 'docx-download', 'small', `data-id="${s.id}"`)}${stuBtn('重新生成', 'docx-regenerate', 'small primary', `data-id="${s.id}"`)}</div></div></section>
  <section class="card"><div class="card-head"><h2>最近变更</h2></div><div class="activity">${recent || '<p class="muted">暂无变更记录。</p>'}</div></section>`;
  return `<div class="detail-grid stu-profile-grid"><div class="stack">${left}</div><div class="stack">${right}</div></div>`;
}

/* ---------------- applications ---------------- */
function stuApplicationsTab(s, d) {
  const required = stuRequiredMaterials(s);
  const byType = {};
  d.documents.forEach((doc) => { (byType[doc.type] = byType[doc.type] || []).push(doc); });
  const missing = required.filter((t) => !(byType[t] || []).length);
  const checklist = STU_MATERIALS.map(([type, label]) => {
    const docs = byType[type] || [];
    const isRequired = required.includes(type);
    const status = !docs.length ? '未上传' : docs.some((x) => x.status === '已确认') ? '已确认' : '待审核';
    return `<tr><td><strong>${esc(label)}</strong>${isRequired ? ' <span class="stu-req">*</span>' : ''}<br><small class="muted mono">${esc(type)}</small></td><td>${isRequired ? '必需' : '可选'}</td><td>${docs.length ? '已上传 ' + docs.length : '未上传'}</td><td>${docs.length ? stuBadge(status) : '<span class="muted">—</span>'}</td><td>${docs.length ? docs.map((x) => esc(x.name)).join('<br>') : '—'}</td><td class="stu-row-actions">${stuBtn(docs.length ? '补充上传' : '上传', 'material-upload', 'small', `data-id="${s.id}" data-type="${type}"`)}${docs.length ? stuBtn('查看', 'material-view', 'small', `data-id="${s.id}" data-type="${type}"`) : ''}</td></tr>`;
  }).join('');
  const uploaded = d.documents.length ? `<div class="table-wrap"><table><thead><tr><th>文件名称</th><th>材料类型</th><th>版本</th><th>上传时间</th><th>审核状态</th><th>操作</th></tr></thead><tbody>${d.documents.map((doc) => `<tr><td>${esc(doc.name)}</td><td>${esc((STU_MATERIALS.find((x) => x[0] === doc.type) || [doc.type, doc.type])[1])}</td><td>${esc(doc.version)}</td><td>${esc(stuIsoToAu(doc.uploaded_at))}</td><td>${stuBadge(doc.status)}</td><td>${stuBtn('查看 / 审核', 'doc-review', 'small', `data-id="${s.id}" data-key="${doc.id}"`)}</td></tr>`).join('')}</tbody></table></div>` : stuEmpty('尚未上传任何申请材料。');
  return `<section class="card"><div class="card-head"><div><h2>申请材料清单</h2><p>支持多文件 / ZIP 上传；上传后确认材料类型并完成审核。必填材料以 * 标记。</p></div>${stuBtn(ico('upload') + ' 上传材料', 'material-upload', 'primary', `data-id="${s.id}"`)}</div>
    <div class="stu-status-strip"><span>${ico('file')} 家长表单：<strong>${esc(stuParentFormLabel(s))}</strong></span><span>${ico('check')} 材料审核：<strong>${d.materials_checked ? '已完成' : '待审核'}</strong></span><span>${ico('clock')} 已上传：<strong>${d.documents.length}</strong> 个文件</span></div>
    ${!d.parent_form_submitted ? `<div class="info-strip warn">${ico('info')} 家长表单尚未提交。可先生成家长表单链接，家长提交后再建档 / 审核。</div>` : ''}
    ${missing.length ? `<div class="info-strip warn">${ico('info')} 缺少：${missing.map((t) => esc((STU_MATERIALS.find((x) => x[0] === t) || [t, t])[1])).join('、')}</div>` : `<div class="info-strip">${ico('check')} 必填材料已齐全。${d.materials_checked ? '材料审核已完成。' : '可点击“材料审核完成”记录审核结果。'}</div>`}
    <div class="table-wrap"><table><thead><tr><th>材料类型</th><th>要求</th><th>上传状态</th><th>审核状态</th><th>文件</th><th>操作</th></tr></thead><tbody>${checklist}</tbody></table></div>
    <div class="stu-card-foot">${stuBtn(d.materials_checked ? '材料审核已完成' : '材料审核完成', 'materials-check', 'primary', `data-id="${s.id}" ${!stuWritable() || d.materials_checked ? 'disabled' : ''}`)}<span class="muted">审核完成后记录审核人与时间；后续补充材料会保留版本。</span></div>
  </section>
  <section class="card"><div class="card-head"><div><h2>已上传文件</h2><p>文件版本、上传时间与审核状态</p></div></div>${uploaded}</section>`;
}

/* ---------------- contracts ---------------- */
function stuContractsTab(s, d) {
  const cards = d.contracts.length ? d.contracts.map((c) => `<section class="card stu-record-card"><div class="card-head"><div><h2>${esc(STU_CONTRACT_TYPES[c.contract_type] || c.contract_type)}</h2><p>${esc(/^v/i.test(c.version) ? c.version : 'v' + c.version)} · 创建 ${esc(stuIsoToAu(c.created_at))} · ${esc(c.file_name)}</p></div>${stuBadge(STU_CONTRACT_STATUS[c.status] || c.status)}</div><div class="card-pad">
    <div class="stu-meta-grid"><div><small>服务费</small><strong>¥ ${esc(c.fee)}</strong></div><div><small>优惠</small><strong>¥ ${esc(c.discount || '0.00')}</strong></div><div><small>付款方式</small><strong>${esc(c.payment_method)}</strong></div><div><small>签署时间</small><strong>${esc(c.signed_at ? stuIsoToAu(c.signed_at) : '—')}</strong></div></div>
    <h3 class="stu-subtitle">服务范围</h3><ul class="stu-scope-list">${c.service_scopes.map((k) => `<li>${esc((STU_SERVICE_SCOPES.find((x) => x[0] === k) || [k, k])[1])}</li>`).join('')}</ul>
    <div class="link-row">${stuBtn('预览合同', 'contract-preview', 'small', `data-id="${s.id}" data-key="${c.id}"`)}${stuBtn('下载', 'contract-download', 'small', `data-id="${s.id}" data-key="${c.id}"`)}${c.status !== 'Deleted' ? stuBtn('删除', 'contract-delete', 'small danger', `data-id="${s.id}" data-key="${c.id}"`) : ''}</div>
  </div></section>`).join('') : stuEmpty('该学生尚未创建合同。');
  return `<div class="stu-tab-head"><div><h2>合同</h2><p>合同类型、服务范围、费用与付款方式按当前业务记录独立保存。</p></div>${stuBtn('新建合同', 'contract-new', 'primary', `data-id="${s.id}" ${!stuWritable() ? 'disabled' : ''}`)}</div>${cards}`;
}

/* ---------------- school plans ---------------- */
function stuPlansTab(s, d) {
  const plans = d.plans;
  const current = plans.filter((p) => p.is_current);
  const history = plans.filter((p) => !p.is_current);
  const planCard = (p) => {
    const decisions = p.confirmed_schools.length ? `<div class="stu-decision-list">${p.confirmed_schools.map((x) => `<div class="stu-decision"><div class="stu-decision-main"><span class="stu-rank">${x.decision_mode === 'ranked' ? '第 ' + (x.rank_order || 1) + ' 顺位' : '家长已选择'}</span><strong>${esc(x.school_name)}</strong><span class="stu-decision-badges">${stuBadge(x.submission_status === 'submitted' ? '已递交' : '未递交')}${x.is_final_school ? stuBadge('最终入读学校') : ''}${x.is_offer_received ? stuBadge('已收到 Offer') : ''}${x.is_offer_accepted ? stuBadge('已接受') : ''}</span></div><div class="stu-decision-result"><small>学校结果</small>${stuBadge(STU_PLAN_RESULT_LABELS[x.result_status] || x.result_status)}${stuBtn('更新结果', 'plan-result', 'small', `data-id="${s.id}" data-key="${p.id}" data-type="${x.id}"`)}</div></div>`).join('')}</div>` : `<div class="info-strip">${ico('info')} 尚未形成家长确认递交学校清单。</div>`;
    return `<section class="card stu-plan-card"><div class="card-head"><div><h2>学校方案报告 · v${esc(p.version)}</h2><p>${esc(p.city)} · ${esc(STU_PLAN_SECTOR_LABELS[p.sector] || p.sector)} · 更新 ${esc(stuIsoToAu(p.updated_at))}</p></div><div class="head-actions">${stuBadge(p.status === 'confirmed' ? '已确认' : p.status === 'draft' ? '草稿' : p.status)}${stuBtn('查看 / 编辑', 'plan-edit', 'small', `data-id="${s.id}" data-key="${p.id}"`)}${stuBtn('预览', 'plan-preview', 'small', `data-id="${s.id}" data-key="${p.id}"`)}${stuBtn('下载', 'plan-download', 'small', `data-id="${s.id}" data-key="${p.id}"`)}${stuBtn('复制链接', 'plan-link', 'small', `data-id="${s.id}" data-key="${p.id}"`)}</div></div>
      <div class="card-pad"><h3 class="stu-subtitle">家长确认递交的学校</h3>${decisions}${p.sector === 'public' ? `<div class="link-row">${stuBtn('递交全部公校申请', 'plan-submit-public', '', `data-id="${s.id}" data-key="${p.id}"`)}</div>` : ''}</div></section>`;
  };
  const historyHTML = history.length ? `<section class="card"><div class="card-head"><div><h2>历史过期方案</h2><p>历史版本保留，不参与当前递交与最终入读判断。</p></div></div><div class="card-pad"><div class="table-wrap"><table><thead><tr><th>版本</th><th>城市</th><th>类别</th><th>状态</th><th>更新时间</th></tr></thead><tbody>${history.map((p) => `<tr><td>v${esc(p.version)}</td><td>${esc(p.city)}</td><td>${esc(STU_PLAN_SECTOR_LABELS[p.sector] || p.sector)}</td><td>${stuBadge(p.status)}</td><td>${esc(stuIsoToAu(p.updated_at))}</td></tr>`).join('')}</tbody></table></div></div></section>` : '';
  return `<div class="stu-tab-head"><div><h2>学校方案</h2><p>集中查看家长确认递交的学校、递交进度、学校结果与最终入读状态。</p></div>${stuBtn('新建学校方案', 'new-plan', 'primary', `data-id="${s.id}" ${!stuWritable() ? 'disabled' : ''}`)}</div>${current.length ? current.map(planCard).join('') : stuEmpty('尚未制作学校方案。')}${historyHTML}`;
}

/* ---------------- offers ---------------- */
function stuOfferTab(s, d) {
  const offers = d.offers;
  const cards = offers.length ? offers.map((o) => `<section class="card stu-record-card"><div class="card-head"><div><h2>${esc(o.school_name)}</h2><p>${esc(STU_OFFER_STATUS[o.status] || o.status)} · ${esc(o.document_type || 'Offer')} · ${esc(o.file_name || '')}</p></div>${stuBadge(o.accepted ? '已接受' : (STU_OFFER_STATUS[o.status] || o.status))}</div><div class="card-pad">
    <div class="stu-meta-grid"><div><small>发 Offer 时间</small><strong>${esc(o.offer_date || '—')}</strong></div><div><small>语言学校</small><strong>${esc(o.language_school_name || '待确认')}</strong></div><div><small>课程开学日期</small><strong>${esc(o.course_start_date || '—')}</strong></div><div><small>有效期</small><strong>${esc(o.offer_expiry_date || '—')}</strong></div><div><small>接收定金</small><strong>${esc(o.deposit_amount ? o.deposit_currency + ' ' + o.deposit_amount : '—')}</strong></div><div><small>文件类型</small><strong>${esc(o.document_type || 'Offer')}</strong></div></div>
    <div class="link-row">${stuBtn('编辑', 'offer-edit', 'small', `data-id="${s.id}" data-key="${o.id}"`)}${!o.accepted && o.status !== 'rejected' ? stuBtn('设为已接受', 'offer-accept', 'small primary', `data-id="${s.id}" data-key="${o.id}"`) : ''}${o.accepted ? stuBtn('撤回接受', 'offer-withdraw', 'small', `data-id="${s.id}" data-key="${o.id}"`) : ''}${o.file_name ? stuBtn('查看 Offer 文件', 'offer-file', 'small', `data-id="${s.id}" data-key="${o.id}"`) : ''}</div>
  </div></section>`).join('') : stuEmpty('尚无录取通知记录。');
  return `<div class="stu-tab-head"><div><h2>录取通知与接受记录</h2><p>按学校记录 Offer 文件、开学时间、定金、状态与家长接受结果。</p></div>${stuBtn('手动新增', 'offer-add', 'primary', `data-id="${s.id}" ${!stuWritable() ? 'disabled' : ''}`)}</div>${cards}<div class="info-strip">${ico('info')} Offer 接受后仍需核对已签 Offer、付款凭证与后续 COE；状态变更会同步到学生列表与提醒。</div>`;
}

/* ---------------- payments ---------------- */
function stuPaymentsTab(s, d) {
  const rows = d.payments;
  const totals = {};
  rows.forEach((r) => { totals[r.currency] = (totals[r.currency] || 0) + Number(r.amount || 0); });
  const totalText = Object.entries(totals).map(([c, n]) => c + ' ' + n.toLocaleString('en-AU', { minimumFractionDigits: 2 })).join(' · ') || '—';
  return `<div class="stu-tab-head"><div><h2>付款</h2><p>记录类别、金额、币种、支付方式、付款人与收款人，可上传多个付款凭证。</p></div>${stuBtn('新增付款记录', 'payment-add', 'primary', `data-id="${s.id}" ${!stuWritable() ? 'disabled' : ''}`)}</div>
    <section class="card"><div class="stu-status-strip"><span>${ico('wallet')} 已记录付款：<strong>${rows.length}</strong> 笔</span><span>${ico('chart')} 合计：<strong>${esc(totalText)}</strong></span><span>${ico('file')} 凭证：<strong>${rows.filter((r) => r.proof).length}</strong> 份</span></div>
    ${rows.length ? `<div class="table-wrap"><table><thead><tr><th>类别</th><th>金额</th><th>币种</th><th>日期</th><th>方式</th><th>付款人 / 收款人</th><th>转学确认</th><th>凭证</th><th>操作</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r.category)}</td><td class="mono">${esc(r.amount)}</td><td>${esc(r.currency)}</td><td>${esc(r.paid_date)}</td><td>${esc(r.method)}</td><td>${esc(r.payer_name)} → ${esc(r.receiver_name)}</td><td>${r.transfer_confirmed ? stuBadge(r.transfer_confirmed) : '<span class="muted">—</span>'}</td><td>${r.proof ? esc(r.proof) : '<span class="muted">待补充</span>'}</td><td>${stuBtn('查看凭证', 'payment-proof', 'small', `data-id="${s.id}" data-key="${r.id}"`)}</td></tr>`).join('')}</tbody></table></div>` : stuEmpty('暂无付款记录。')}</section>`;
}

/* ---------------- COE / OSHC ---------------- */
function stuCoeTab(s, d) {
  const records = d.coe;
  const label = (k) => (STU_COE_KINDS.find((x) => x[0] === k) || [k, k])[1];
  const card = (r) => {
    let meta = [];
    if (r.kind === 'COE' || r.kind === 'COE_CAAW') meta = [['Provider', r.coe_provider], ['Course', r.coe_course], ['Course Start Date', r.coe_start_date], ['Course End Date', r.coe_end_date]];
    if (r.kind === 'CAAW') meta = [['Provider', r.coe_provider]];
    if (r.kind === 'CAAW' || r.kind === 'COE_CAAW') meta = meta.concat([['Nominated Welfare Period Start Date', r.caaw_welfare_start_date], ['Nominated Welfare Period End Date', r.caaw_welfare_end_date]]);
    if (r.kind === 'OSHC' || r.kind === 'OSHCReceipt') meta = meta.concat([['OSHC Company Name', r.oshc_company_name], ['Policy / Membership Number', r.oshc_policy_number], ['Commencement Date', r.oshc_commencement_date], ['Expiry Date', r.oshc_expiry_date]]);
    if (r.kind === 'LetterOfConfirmation') meta = [['Language Course / English Language Centre', r.loc_language_course], ['Language Course Start Date', r.loc_language_start], ['Language Course End Date', r.loc_language_end], ['Year Level', r.loc_year_level], ['Main Course / Host School', r.loc_main_course], ['Main Course Start Date', r.loc_main_start], ['Main Course End Date', r.loc_main_end]];
    return `<section class="card stu-record-card"><div class="card-head"><div><h2>${esc(label(r.kind))}</h2><p>${esc(r.file_name || '尚未上传文件')}</p></div>${stuBadge('已确认')}</div><div class="card-pad"><div class="stu-meta-grid">${meta.map(([k, v]) => `<div><small>${esc(k)}</small><strong>${esc(v || '—')}</strong></div>`).join('')}</div><div class="link-row">${stuBtn('编辑', 'coe-edit', 'small', `data-id="${s.id}" data-key="${r.id}"`)}${r.file_name ? stuBtn('预览文件', 'coe-file', 'small', `data-id="${s.id}" data-key="${r.id}"`) : ''}</div></div></section>`;
  };
  return `<div class="stu-tab-head"><div><h2>入学确认与学生保险</h2><p>分别记录 COE、CAAW、OSHC 与 Letter of Confirmation；字段与源系统一致。</p></div>${stuBtn('录入文件信息', 'coe-add', 'primary', `data-id="${s.id}" ${!stuWritable() ? 'disabled' : ''}`)}</div>${records.length ? records.map(card).join('') : stuEmpty('尚无 COE / OSHC 记录。')}<div class="info-strip warn">${ico('info')} 转学、升学各自核对 COE、保险与完成条件；不因页面展示自动完成。</div>`;
}

/* ---------------- visa ---------------- */
function stuVisaTab(s, d) {
  const cards = d.visas.length ? d.visas.map((v) => `<section class="card stu-record-card"><div class="card-head"><div><h2>${esc(v.visa_type)}</h2><p>${esc(v.existing ? '已有签证证据' : '本轮签证记录')} · ${esc(v.visa_sector)} · ${esc(v.file_name || '')}</p></div>${stuBadge(STU_VISA_STATUS_LABELS[v.visa_status] || v.visa_status)}</div><div class="card-pad">
    <div class="stu-meta-grid"><div><small>文件类型</small><strong>${esc((STU_VISA_DOCUMENT_TYPES.find((x) => x[0] === v.document_type) || [v.document_type, v.document_type])[1])}</strong></div><div><small>Sector</small><strong>${esc(v.visa_sector)}</strong></div><div><small>批准 / 拒签</small><strong>${esc(v.visa_grant_date || (v.visa_status === 'refused' ? '已拒签' : '待审批'))}</strong></div><div><small>开始日期</small><strong>${esc(v.visa_start_date || '—')}</strong></div><div><small>到期日期</small><strong>${esc(v.visa_expiry_date || '—')}</strong></div><div><small>状态</small><strong>${esc(STU_VISA_STATUS_LABELS[v.visa_status] || v.visa_status)}</strong></div></div>
    <div class="stu-note-block"><small>签证条件 / 备注</small><p>${esc(v.visa_conditions || '—')}</p></div>
    <div class="link-row">${stuBtn('编辑', 'visa-edit', 'small', `data-id="${s.id}" data-key="${v.id}"`)}${['pending'].includes(v.visa_status) ? stuBtn('记录下签', 'visa-grant', 'small primary', `data-id="${s.id}" data-key="${v.id}"`) : ''}${v.file_name ? stuBtn('预览签证文件', 'visa-file', 'small', `data-id="${s.id}" data-key="${v.id}"`) : ''}</div>
  </div></section>`).join('') : stuEmpty('尚无签证记录。');
  return `<div class="stu-tab-head"><div><h2>签证</h2><p>区分“上传已有签证”和“新增本轮签证记录”，记录 Sector、文件类型、批准日期与签证条件。</p></div><div class="head-actions">${stuBtn('上传已有签证', 'visa-add', 'small', `data-id="${s.id}" data-purpose="existing_evidence"`)}${stuBtn('新增本轮签证记录', 'visa-add', 'primary', `data-id="${s.id}" data-purpose="current_application"`)}</div></div>${cards}`;
}

/* ---------------- homestay / airport ---------------- */
function stuHomestayTab(s, d) {
  const a = d.profile.accommodation || {};
  const docs = d.homestay;
  const docRows = docs.length ? `<div class="table-wrap"><table><thead><tr><th>文件类型</th><th>文件名称</th><th>上传时间</th><th>状态</th><th>操作</th></tr></thead><tbody>${docs.map((x) => `<tr><td>${esc((STU_HOMESTAY_TYPES.find((y) => y[0] === x.type) || [x.type, x.type])[1])}</td><td>${esc(x.name)}</td><td>${esc(stuIsoToAu(x.uploaded_at))}</td><td>${stuBadge(x.status)}</td><td>${stuBtn('查看', 'homestay-view', 'small', `data-id="${s.id}" data-key="${x.id}"`)}</td></tr>`).join('')}</tbody></table></div>` : stuEmpty('尚无住宿 / 接机文件。');
  return `<div class="stu-tab-head"><div><h2>住宿与接机</h2><p>陪读、住宿偏好、寄宿家庭与接机文件集中展示；资料字段来自学生资料。</p></div>${stuBtn('上传住宿 / 接机文件', 'homestay-add', 'primary', `data-id="${s.id}" ${!stuWritable() ? 'disabled' : ''}`)}</div>
    <div class="detail-grid"><section class="card"><div class="card-head"><h2>住宿与监护安排</h2></div><div class="card-pad">${facts([
      ['是否需要陪读', stuDisplay('requires_parent_accompaniment', a.requires_parent_accompaniment)],
      ['与学生关系', stuDisplay('accompanying_person_relationship', a.accompanying_person_relationship)],
      ['申请住宿方式', stuDisplay('accommodation_preference', a.accommodation_preference)],
      ['接受住家有 8 岁以下小孩', stuDisplay('accept_homestay_with_young_children', a.accept_homestay_with_young_children)],
      ['中式 / 西式住家', stuDisplay('homestay_style_preference', a.homestay_style_preference)],
      ['食物过敏', stuDisplay('food_allergy', a.food_allergy) + (a.food_allergy_notes ? ' · ' + a.food_allergy_notes : '')],
      ['宠物过敏', stuDisplay('pet_allergy', a.pet_allergy)],
      ['药物过敏', stuDisplay('medicine_allergy', a.medicine_allergy)],
      ['其他补充', a.accommodation_notes || '—'],
    ])}</div></section>
    <section class="card"><div class="card-head"><h2>接机安排</h2></div><div class="card-pad">${facts([
      ['航班', docs.find((x) => x.type === 'FlightItinerary') ? '已上传行程单' : '待补充'],
      ['到达机场', s.city],
      ['接机确认', docs.find((x) => x.type === 'AirportPickupConfirmation') ? '已确认' : '待确认'],
      ['接机申请', docs.find((x) => x.type === 'AirportPickupRequest') ? '已提交' : '待提交'],
    ])}</div></section></div>
    <section class="card"><div class="card-head"><div><h2>住宿 / 接机文件</h2><p>按文件类型归档，供顾问与家长协作核对。</p></div></div>${docRows}</section>`;
}

/* ---------------- history ---------------- */
function stuHistoryTab(s, d) {
  const rows = d.history.slice(0, 80);
  return `<section class="card"><div class="card-head"><div><h2>历史记录</h2><p>按时间倒序保留学生资料分区、字段、原值与新值；最多展示 80 条。</p></div></div>${rows.length ? `<div class="table-wrap"><table><thead><tr><th>修改时间</th><th>修改人</th><th>资料分区</th><th>字段</th><th>原值</th><th>新值</th></tr></thead><tbody>${rows.map((h) => `<tr><td>${esc(stuIsoToAu(h.changed_at))} ${esc(String(h.changed_at).slice(11, 16))}</td><td>${esc(h.user)}</td><td>${esc(h.section)}</td><td>${esc(h.field)}</td><td>${esc(h.before || '—')}</td><td>${esc(h.after || '—')}</td></tr>`).join('')}</tbody></table></div>` : stuEmpty('暂无历史变更。')}</section>`;
}

/* ---------------- reminders ---------------- */
function stuRemindersTab(s, d) {
  const notes = d.notes;
  const cards = notes.length ? notes.map((n) => `<div class="stu-note-card"><div class="stu-note-head"><div><strong>${esc(n.description)}</strong><p>${esc(n.creator_name)} · ${esc(n.recipient_name)} · ${esc(stuIsoToAu(n.reminder_at))} ${esc(String(n.reminder_at).slice(11, 16))}</p></div><div class="stu-note-badges">${stuBadge(STU_REMINDER_STATUS[n.status] || n.status)}${stuBadge(STU_REMINDER_PRIORITY[n.priority] || n.priority)}</div></div><div class="link-row">${n.status !== 'Completed' ? stuBtn('完成', 'note-done', 'small', `data-id="${s.id}" data-key="${n.id}"`) : ''}${n.status !== 'Completed' ? stuBtn('稍后提醒', 'note-snooze', 'small', `data-id="${s.id}" data-key="${n.id}"`) : ''}${n.status !== 'Completed' ? stuBtn('忽略', 'note-dismiss', 'small', `data-id="${s.id}" data-key="${n.id}"`) : ''}${stuBtn('编辑', 'note-edit', 'small', `data-id="${s.id}" data-key="${n.id}"`)}${stuBtn('删除', 'note-delete', 'small danger', `data-id="${s.id}" data-key="${n.id}"`)}</div></div>`).join('') : stuEmpty('暂无留言与提醒。');
  const otherRows = d.other_reminders.length ? d.other_reminders.map((r) => `<tr><td>${stuBadge(STU_REMINDER_STATUS[r.status] || r.status)}</td><td>${esc(r.type_label)}<br><small class="muted">${esc(r.type)}</small></td><td>${esc(stuIsoToAu(r.reminder_at))} ${esc(String(r.reminder_at).slice(11, 16))}</td><td>${stuBadge(STU_REMINDER_PRIORITY[r.priority] || r.priority)}</td><td>${esc(r.owner)}</td></tr>`).join('') : `<tr><td colspan="5">${stuEmpty('暂无系统提醒。')}</td></tr>`;
  return `<section class="card card-pad"><div class="card-head" style="padding:0"><div><h2>新增留言与提醒</h2><p>提醒接收人默认负责顾问，可选择其他同事。</p></div></div>
    <form data-stu-form="note-add" data-id="${s.id}" class="form-grid stu-inline-form"><label class="wide">留言内容<textarea name="description" required placeholder="例如：跟进家长补充成绩单"></textarea></label><label>提醒日期<input type="date" name="reminder_date" value="2026-11-08" required></label><label>提醒时间<input type="time" name="reminder_time" value="10:00" required></label><label>提醒接收人${stuSelect('recipient_name', s.owner, [...new Set(DEMO.students.map((x) => x.owner))].map((x) => [x, x]))}</label><div class="stu-form-submit"><button class="btn primary" type="submit">添加留言</button></div></form></section>
    <section class="card"><div class="card-head"><div><h2>留言与提醒</h2><p>完成、稍后提醒、忽略或编辑会更新当前演示状态。</p></div></div><div class="card-pad stu-note-list">${cards}</div></section>
    <section class="card"><div class="card-head"><div><h2>其他提醒</h2><p>来自合同、Offer、签证等业务事实的系统提醒。</p></div></div><div class="table-wrap"><table><thead><tr><th>状态</th><th>提醒</th><th>提醒时间</th><th>优先级</th><th>负责人</th></tr></thead><tbody>${otherRows}</tbody></table></div></section>`;
}

/* ---------------- revenue ---------------- */
function stuRevenueTab(s, d) {
  const rows = d.revenue;
  return `<section class="card"><div class="card-head"><div><h2>收入与佣金</h2><p>按申请周期查看收费与佣金档案；不同申请、转学、升学周期独立保留。</p></div></div>${rows.length ? `<div class="card-pad stu-revenue-list">${rows.map((r) => `<div class="stu-revenue-card"><div><small>申请周期 #${esc(r.application_cycle_id)}</small><strong>${esc(STU_REVENUE_CYCLE[r.cycle_type] || r.cycle_type)} · ${esc(STU_REVENUE_STREAM[r.education_stream] || r.education_stream)}</strong><span>${esc(r.case_uid)}</span></div><div>${stuBadge(r.cycle_status === 'active' ? '进行中' : '已完成')}${stuBadge(r.case_status)}<small>更新 ${esc(stuIsoToAu(r.updated_at))}</small></div><div>${stuLink('查看收费档案', r.href.replace('#', ''), 'small')}</div></div>`).join('')}</div>` : stuEmpty('该学生暂未建立收费与佣金档案。')}</section>`;
}

/* ---------------- student edit / create form ---------------- */
function stuBlankProfile() {
  const profile = {};
  STU_SECTIONS.forEach(([id, , fields]) => {
    profile[id] = {};
    fields.forEach((f) => { profile[id][f[0]] = f[2] === 'checkbox' ? [] : ''; });
  });
  return profile;
}
function stuFormField(field, values) {
  const [key, label, type, required, options] = field;
  const value = values ? values[key] : '';
  const star = required ? ' <span class="stu-req">*</span>' : '';
  const wide = type === 'textarea' ? ' wide' : '';
  if (type === 'radio') {
    return `<fieldset class="stu-radio ${wide.trim()}"><legend>${esc(label)}${star}</legend><div class="stu-option-row">${(options || []).map((opt) => `<label class="stu-option"><input type="radio" name="${key}" value="${esc(opt)}" ${String(value) === String(opt) ? 'checked' : ''} ${required ? 'required' : ''}> ${esc(opt)}</label>`).join('')}</div></fieldset>`;
  }
  if (type === 'checkbox') {
    const arr = Array.isArray(value) ? value : [];
    return `<fieldset class="stu-radio wide"><legend>${esc(label)}${star}</legend><div class="stu-option-row">${(options || []).map((opt) => {
      const raw = String(opt).split('|')[0];
      const lab = String(opt).split('|').slice(1).join('|') || raw;
      return `<label class="stu-option"><input type="checkbox" name="${key}" value="${esc(raw)}" ${arr.includes(raw) ? 'checked' : ''}> ${esc(lab)}</label>`;
    }).join('')}</div></fieldset>`;
  }
  if (type === 'select') {
    const opts = (options || []).map((opt) => {
      const raw = String(opt).split('|')[0];
      const lab = String(opt).split('|').slice(1).join('|') || raw;
      return [raw, lab];
    });
    return `<label class="${wide.trim()}">${esc(label)}${star}${stuSelect(key, value, opts, required ? 'required' : '')}</label>`;
  }
  if (type === 'textarea') {
    return `<label class="wide">${esc(label)}${star}<textarea name="${key}" ${required ? 'required' : ''}>${esc(value || '')}</textarea></label>`;
  }
  const inputType = type === 'date' ? 'text' : type === 'tel' ? 'tel' : type === 'email' ? 'email' : 'text';
  return `<label>${esc(label)}${star}<input type="${inputType}" name="${key}" value="${esc(value || '')}" ${required ? 'required' : ''} ${type === 'date' ? 'placeholder="DD/MM/YYYY" inputmode="numeric"' : ''}></label>`;
}
function stuStudentForm(id) {
  const s = id ? studentById(id) : null;
  const d = s ? STU_DETAILS[id] : null;
  const profile = d ? d.profile : stuBlankProfile();
  const readonly = s ? `<div class="stu-readonly-box"><div><small>Student ID</small><strong class="mono">${esc(s.id)}</strong></div><div><small>文件夹路径</small><strong>students/${esc(s.id)}/${esc(s.english.replace(/\s+/g, '_'))}</strong></div><div><small>建档时间</small><strong>${esc(stuIsoToAu(s.created_at))}</strong></div><span>以上字段由系统生成，不可修改。</span></div>` : `<div class="info-strip">${ico('info')} 新建学生保存后自动生成 Student ID、学生文件夹与建档记录。</div>`;
  const sections = STU_PROFILE_ORDER.map((sid) => {
    const def = stuSectionDef(sid);
    return `<section class="card stu-form-section"><div class="card-head"><h3>${esc(def[1])}</h3><span class="muted">${def[2].length} 个字段</span></div><div class="card-pad"><div class="form-grid">${def[2].map((f) => stuFormField(f, profile[sid] || {})).join('')}</div></div></section>`;
  }).join('');
  const docx = s ? `<section class="card stu-form-section"><div class="card-head"><h3>StudentInfo.docx</h3></div><div class="card-pad"><fieldset class="stu-radio"><legend>生成方式</legend><div class="stu-option-row"><label class="stu-option"><input type="radio" name="student_info_option" value="keep" checked> 保留现有文件</label><label class="stu-option"><input type="radio" name="student_info_option" value="regenerate"> 重新生成 StudentInfo.docx</label></div></fieldset><p class="form-hint">当前文件：${esc(d.docx.file_name)} · 更新 ${esc(stuIsoToAu(d.docx.updated_at))}</p></div></section>` : '';
  const body = `<form id="stu-form" data-stu-form="student-save" data-id="${esc(id || '')}">${readonly}${sections}${docx}</form>`;
  openDialog(s ? '编辑学生资料' : '新建学生', body, `<button class="btn primary" type="submit" form="stu-form">保存修改</button>`, '字段与学生/家长资料表一致；保存后同步更新学生档案。');
}
function stuNextStudentId() {
  const max = DEMO.students.reduce((m, s) => Math.max(m, Number(String(s.id).replace(/\D/g, '').slice(-3)) || 0), 0);
  return 'D2026' + String(max + 1).padStart(3, '0');
}
function stuCityFromValue(v) {
  const hit = STU_CITIES.find((x) => x[0] === (Array.isArray(v) ? v[0] : v));
  return hit ? hit[1] : '待确认';
}
function stuIntakeLabel(profile) {
  const y = profile.preferred_intake_year || '2027';
  const term = stuDisplayOption('preferred_intake_term', profile.preferred_intake_term);
  return y + ' · ' + (term === '—' ? '2月入学' : term);
}

function stuSaveStudent(form, fd) {
  const id = form.dataset.id;
  const profile = {};
  Object.entries(STU_FIELD_MAP).forEach(([key, meta]) => {
    profile[key] = meta.type === 'checkbox' ? fd.getAll(key) : String(fd.get(key) || '');
  });
  const missing = Object.entries(STU_FIELD_MAP).filter(([key, meta]) => {
    if (!meta.required) return false;
    const v = profile[key];
    return Array.isArray(v) ? !v.length : !String(v).trim();
  }).map(([, meta]) => meta.label);
  if (missing.length) { toast('请填写必填项：' + missing.slice(0, 4).join('、') + (missing.length > 4 ? ' 等' : '')); return; }
  if (id) {
    const s = studentById(id);
    const d = STU_DETAILS[id];
    if (!s || !d) return;
    d.profile = profile;
    s.grade = profile.applying_year_level || s.grade;
    s.intake = stuIntakeLabel(profile);
    s.city = stuCityFromValue(profile.preferred_cities);
    s.email = profile.student_email || s.email;
    s.phone = profile.mobile_phone || s.phone;
    s.updated = stuIsoToday();
    if (fd.get('student_info_option') === 'regenerate') d.docx.updated_at = stuIsoToday();
    d.history.unshift({ id: 'LOG-' + id + '-' + Date.now(), changed_at: stuIsoToday() + 'T10:30:00', user: state.role, section: '学生资料', field: '资料批量编辑', before: '原资料', after: '已保存 11 个分区' });
    closeDialog(); render(); toast('学生资料已保存（演示）');
    return;
  }
  const last = String(profile.passport_last_name || '').toUpperCase();
  const first = String(profile.passport_first_name || '').toUpperCase();
  const s = {
    id: stuNextStudentId(),
    name: (last + ' ' + first).trim() || '未命名学生',
    english: (first + ' ' + last).trim(),
    avatar: (first || '新').slice(0, 1),
    lifecycle: 'initial', stage: '建档', stage_index: 0, school: '待确认', final_school: '待确认',
    grade: profile.applying_year_level || profile.current_year_level || '不确定',
    intake: stuIntakeLabel(profile), owner: state.role === '管理员' ? '陈顾问' : state.role,
    updated: stuIsoToday(), created_at: stuIsoToday(), city: stuCityFromValue(profile.preferred_cities),
    email: profile.student_email || '', phone: profile.mobile_phone || '',
    parent_form: 'Pending', type: profile.application_stream === 'higher_education' ? '高等教育' : '中小学申请',
    offer_course_start: '', visa_grant_date: '', alerts: [],
  };
  const d = stuBuildDetail(s, DEMO.students.length);
  d.profile = profile;
  d.parent_form_submitted = false;
  d.materials_checked = false;
  d.alerts = stuBuildAlerts(s, d);
  s.alerts = d.alerts;
  STU_DETAILS[s.id] = d;
  DEMO.students.unshift(s);
  audit('新建学生 ' + s.name, s.id);
  closeDialog();
  location.hash = 'student/' + s.id + '/profile';
  render();
  toast('学生已建档：' + s.id + '（演示）');
}

/* ---------------- generic dialogs ---------------- */
function stuDialog(title, body, foot, desc) {
  openDialog(title, body, foot, desc || '演示操作仅在当前页面内存中生效。');
}
function stuClose(message) {
  closeDialog();
  render();
  if (message) toast(message);
}
function stuConfirm(title, text, action, attrs = '') {
  stuDialog(title, `<p class="stu-confirm-text">${esc(text)}</p><div class="editor-note">此操作仅修改当前原型的演示状态。</div>`,
    `${stuBtn('确认', action, 'primary', attrs)}`);
}
function stuFileDialog(title, fileName, extra = '') {
  stuDialog(title, `<div class="stu-file-box">${ico('file')}<div><strong>${esc(fileName || '演示文件.pdf')}</strong><p>演示文件 · 不包含真实学生信息</p></div></div>${extra ? `<div class="info-strip">${ico('info')} ${esc(extra)}</div>` : ''}`,
    `${stuBtn('下载演示文件', 'download-demo', 'primary', 'data-name="' + esc(fileName || 'demo.pdf') + '"')}`);
}
function stuApplyStudentSummary(s) {
  s.offer_course_start = (STU_DETAILS[s.id]?.offers || []).find((o) => o.accepted)?.course_start_date || '';
  s.visa_grant_date = (STU_DETAILS[s.id]?.visas || []).find((v) => v.visa_status === 'granted')?.visa_grant_date || '';
  s.alerts = stuBuildAlerts(s, STU_DETAILS[s.id]);
}

/* ---------------- list dialogs ---------------- */
function stuParentLinkDialog() {
  const links = stuParentLinks();
  const rows = links.length ? `<div class="table-wrap"><table><thead><tr><th>链接编号</th><th>学生</th><th>表单类型</th><th>状态</th><th>有效期</th><th>访问</th></tr></thead><tbody>${links.map((l) => {
    const s = studentById(l.student);
    return `<tr><td class="mono">${esc(l.id)}</td><td>${esc(s ? s.name + ' · ' + s.id : l.student)}</td><td>${esc(l.type)}</td><td>${stuBadge(l.status === 'Pending' ? '待填写' : l.status)}</td><td>${esc(l.expires)}</td><td>${esc(l.visits)} 次</td></tr>`;
  }).join('')}</tbody></table></div>` : stuEmpty('尚未生成家长表单链接。');
  const body = `<form id="stu-form" data-stu-form="parent-link">${rows}<div class="stu-dialog-divider"></div><div class="form-grid"><label>选择学生${stuSelect('student', DEMO.students[0].id, DEMO.students.map((s) => [s.id, s.name + ' · ' + s.id]))}</label><label>表单类型${stuSelect('type', '学生资料', [['学生资料', '学生资料'], ['签证信息采集', '签证信息采集']])}</label><label>链接有效期<input type="date" name="expires" value="2026-11-30" required></label></div></form>`;
  stuDialog('生成家长表单链接', body, `<button class="btn primary" type="submit" form="stu-form">生成链接</button>`, '生成后可通过复制链接让家长补充资料；提交后可在“从家长表单建档”中处理。');
}
function stuFromParentDialog() {
  const rows = stuParentSubmissions();
  const body = `<div class="stu-parent-submissions">${rows.length ? rows.map((r) => `<div class="stu-parent-row"><div><strong>${esc(r.name)}</strong><small>${esc(r.english)} · ${esc(r.grade)} · ${esc(r.city)} · ${esc(r.form)}</small><p>提交时间 ${esc(stuIsoToAu(r.submitted_at))} ${esc(String(r.submitted_at).slice(11, 16))} · 顾问 ${esc(r.owner)}</p></div><div>${stuBadge('待建档')}${stuBtn('从表单建档', 'parent-create', 'small primary', `data-key="${esc(r.key)}"`)}</div></div>`).join('') : stuEmpty('暂无待建档的家长表单提交。')}</div>`;
  stuDialog('从家长表单建档', body, ``, '家长提交的资料将生成新的学生档案，并保留原始表单记录。');
}
function stuExcelImportDialog() {
  const body = `<form id="stu-form" data-stu-form="excel-import"><div class="form-grid"><label class="wide">选择 Excel 文件<input type="file" name="file" accept=".xlsx,.xls,.csv" required></label><label class="wide">导入选项${stuSelect('mode', 'create', [['create', '新建学生档案'], ['update', '按 Student ID 更新']])}</label></div><div class="info-strip warn">${ico('info')} 导入会校验必填字段、年级与城市映射；演示环境不会写入真实数据。</div><p class="form-hint">可先下载 Excel 模板，按模板列填写后上传。</p></form>`;
  stuDialog('Excel 导入', body, `<button class="btn primary" type="submit" form="stu-form">开始导入</button>`, '支持批量导入学生资料；重复学生号按所选模式处理。');
}

/* ---------------- materials ---------------- */
function stuMaterialDialog(s, type) {
  const body = `<form id="stu-form" data-stu-form="material-save" data-id="${s.id}" data-type="${esc(type || '')}"><div class="form-grid"><label>材料类型${stuSelect('material_type', type || 'StudentPassport', STU_MATERIALS.map(([v, l]) => [v, l]))}</label><label>文件名称<input type="text" name="file_name" value="${esc(type ? (STU_MATERIALS.find((x) => x[0] === type) || [type, type])[1] : '学生护照') + '.pdf'}" required></label><label class="wide">上传文件（演示）<input type="file" name="file"></label><label class="wide">备注<textarea name="note" placeholder="例如：家长补充材料"></textarea></label></div></form>`;
  stuDialog('上传申请材料', body, `<button class="btn primary" type="submit" form="stu-form">上传</button>`, '支持多文件 / ZIP；演示环境仅记录文件元数据。');
}
function stuDocListDialog(s, type) {
  const docs = (STU_DETAILS[s.id].documents || []).filter((d) => !type || d.type === type);
  const body = docs.length ? `<div class="table-wrap"><table><thead><tr><th>文件</th><th>版本</th><th>上传时间</th><th>状态</th><th>操作</th></tr></thead><tbody>${docs.map((d) => `<tr><td>${esc(d.name)}</td><td>${esc(d.version)}</td><td>${esc(stuIsoToAu(d.uploaded_at))}</td><td>${stuBadge(d.status)}</td><td>${stuBtn(d.status === '已确认' ? '查看' : '确认通过', 'doc-review', 'small', `data-id="${s.id}" data-key="${d.id}"`)}</td></tr>`).join('')}</tbody></table></div>` : stuEmpty('该材料尚未上传文件。');
  stuDialog('材料文件', body, `${stuBtn('继续上传', 'material-upload', 'primary', `data-id="${s.id}" data-type="${esc(type || '')}"`)}`);
}

/* ---------------- contracts ---------------- */
function stuContractDialog(s) {
  const types = [['NewInternationalStudentContract', '新留学生合同'], ['LocalStudentApplicationContract', '本地生申请合同']];
  if (s.lifecycle === 'transfer') types.unshift(['TransferApplicationContract', '转学申请合同']);
  const body = `<form id="stu-form" data-stu-form="contract-save" data-id="${s.id}"><div class="form-grid"><fieldset class="stu-radio wide"><legend>合同类型</legend><div class="stu-option-row">${types.map(([v, l], i) => `<label class="stu-option"><input type="radio" name="contract_type" value="${v}" ${i === 0 ? 'checked' : ''} required> ${l}</label>`).join('')}</div></fieldset><label>服务费（元）<input type="text" name="fee" value="2400.00" required></label><label>优惠（元）<input type="text" name="discount" value="0.00"></label><label>付款方式${stuSelect('payment_method', '支付宝', STU_CONTRACT_PAYMENT_METHODS.map((x) => [x, x]))}</label><label>合同文件名称<input type="text" name="file_name" value="Study_Contract_${s.id}.pdf"></label></div><h3 class="stu-subtitle">服务范围</h3><div class="stu-scope-check">${STU_SERVICE_SCOPES.map(([v, l], i) => `<label class="stu-option"><input type="checkbox" name="scopes" value="${v}" ${i < 5 ? 'checked' : ''}> ${esc(l)}</label>`).join('')}</div></form>`;
  stuDialog('新建合同', body, `<button class="btn primary" type="submit" form="stu-form">创建合同</button>`, '合同创建后进入草稿 / 发送 / 签署流程；费用与付款方式按合同独立保存。');
}
function stuContractDeleteDialog(s, c) {
  const body = `<form id="stu-form" data-stu-form="contract-delete" data-id="${s.id}" data-key="${c.id}"><div class="form-grid"><label class="wide">删除原因${stuSelect('reason', 'content_error', [['content_error', '合同内容错误'], ['parent_info_error', '家长信息错误'], ['regenerate_contract', '重新生成合同'], ['wrong_signature', '家长签错'], ['other', '其他']])}</label><label class="wide">补充说明<textarea name="note" placeholder="记录删除原因，便于后续审计"></textarea></label></div></form>`;
  stuDialog('删除合同', body, `<button class="btn danger" type="submit" form="stu-form">确认删除</button>`, '删除会保留审计记录；家长端已签署文件不会自动失效。');
}

/* ---------------- school plans ---------------- */
function stuPlanDialog(s, plan) {
  const schools = plan ? plan.confirmed_schools.map((x) => x.school_name).join('\n') : '';
  const body = `<form id="stu-form" data-stu-form="plan-save" data-id="${s.id}" data-key="${plan ? plan.id : ''}"><div class="form-grid"><label>城市<input type="text" name="city" value="${esc(plan ? plan.city : s.city)}" required></label><label>方案类别${stuSelect('sector', plan ? plan.sector : 'private', [['private', '私校'], ['public', '公校'], ['unclassified', '待分类']])}</label><label>版本<input type="number" name="version" value="${plan ? plan.version : 1}" min="1"></label><label>方案状态${stuSelect('status', plan ? plan.status : 'draft', [['draft', '草稿'], ['confirmed', '家长已确认']])}</label><label class="wide">确认递交学校（每行一所）<textarea name="schools" placeholder="Northfield College（虚构）&#10;Westhaven School（虚构）">${esc(schools)}</textarea></label></div><p class="form-hint">公校方案可多校排序递交；私校方案保留家长选择结果。历史版本不会被覆盖。</p></form>`;
  stuDialog(plan ? '查看 / 编辑学校方案' : '新建学校方案', body, `<button class="btn primary" type="submit" form="stu-form">保存方案</button>`, '方案报告与家长确认、正式递交分别记录。');
}
function stuPlanResultDialog(s, plan, school) {
  const offers = STU_DETAILS[s.id].offers || [];
  const body = `<form id="stu-form" data-stu-form="plan-result-save" data-id="${s.id}" data-key="${plan.id}" data-type="${school.id}"><div class="form-grid"><label class="wide">学校<strong>${esc(school.school_name)}</strong></label><label>结果状态${stuSelect('result_status', school.result_status, STU_PLAN_RESULT_OPTIONS)}</label><label>关联正式 Offer${stuSelect('offer_id', school.offer_id || '', [['', '不关联']].concat(offers.map((o) => [o.id, o.school_name + ' · ' + o.offer_date])))}</label><label class="wide">结果备注<textarea name="result_note" placeholder="例如：学校要求补充成绩单">${esc(school.result_note || '')}</textarea></label></div><div class="stu-scope-check"><label class="stu-option"><input type="checkbox" name="is_offer_received" ${school.is_offer_received ? 'checked' : ''}> 已收到 Offer</label><label class="stu-option"><input type="checkbox" name="is_offer_accepted" ${school.is_offer_accepted ? 'checked' : ''}> 已接受 Offer</label><label class="stu-option"><input type="checkbox" name="is_final_school" ${school.is_final_school ? 'checked' : ''}> 最终入读学校</label></div></form>`;
  stuDialog('更新学校结果', body, `<button class="btn primary" type="submit" form="stu-form">保存结果</button>`, '最终入读学校仅保留一所；结果会同步到方案报告与学生摘要。');
}
function stuPlanLinkDialog(s, plan) {
  const url = 'https://demo.aaie.example/parent/school-plan/' + s.id + '/' + plan.id;
  const body = `<div class="form-grid"><label class="wide">家长方案报告链接<input type="text" readonly value="${esc(url)}"></label></div><div class="info-strip">${ico('link')} 链接用于家长查看并确认方案；演示环境不会真实发送。</div>`;
  stuDialog('学校方案链接', body, `${stuBtn('复制链接', 'copy-link', 'primary', `data-url="${esc(url)}"`)}`);
}

/* ---------------- offers ---------------- */
function stuOfferDialog(s, offer) {
  const o = offer || { document_type: 'Offer', deposit_currency: 'AUD', status: 'received' };
  const body = `<form id="stu-form" data-stu-form="offer-save" data-id="${s.id}" data-key="${offer ? offer.id : ''}"><div class="form-grid"><label>学校<input type="text" name="school_name" value="${esc(o.school_name || '')}" required></label><label>发 Offer 时间<input type="text" name="offer_date" value="${esc(o.offer_date || '')}" placeholder="DD/MM/YYYY"></label><label>语言学校<input type="text" name="language_school_name" value="${esc(o.language_school_name || '')}" placeholder="待确认"></label><label>课程开学日期<input type="text" name="course_start_date" value="${esc(o.course_start_date || '')}" placeholder="DD/MM/YYYY"></label><label>有效期<input type="text" name="offer_expiry_date" value="${esc(o.offer_expiry_date || '')}" placeholder="DD/MM/YYYY"></label><label>接收定金<input type="text" name="deposit_amount" value="${esc(o.deposit_amount || '')}"></label><label>币种${stuSelect('deposit_currency', o.deposit_currency || 'AUD', ['AUD', 'CNY', 'USD'].map((x) => [x, x]))}</label><label>状态${stuSelect('status', o.status || 'received', Object.entries(STU_OFFER_STATUS))}</label><label>文件类型${stuSelect('document_type', o.document_type || 'Offer', [['Offer', 'Offer'], ['SignedOffer', 'Signed Offer'], ['OfferAcceptance', 'Offer Acceptance']])}</label><label>Offer 文件名称<input type="text" name="file_name" value="${esc(o.file_name || '')}"></label></div><p class="form-hint">手动新增时需同时确认文件类型与学校名称；保存后可在列表中设为已接受。</p></form>`;
  stuDialog(offer ? '编辑 Offer' : '手动新增 Offer', body, `<button class="btn primary" type="submit" form="stu-form">保存全部修改</button>`, 'Offer 信息与文件记录独立保存；接受前请核对有效期与定金。');
}
function stuOfferWithdrawDialog(s, offer) {
  const body = `<form id="stu-form" data-stu-form="offer-withdraw-save" data-id="${s.id}" data-key="${offer.id}"><div class="form-grid"><label class="wide">撤回原因<textarea name="reason" required placeholder="记录家长撤回接受的原因"></textarea></label></div></form>`;
  stuDialog('撤回 Offer 接受', body, `<button class="btn primary" type="submit" form="stu-form">确认撤回</button>`, '撤回后 Offer 状态变为已取消，付款记录不会自动冲销。');
}

/* ---------------- payments ---------------- */
function stuPaymentDialog(s) {
  const transfer = s.lifecycle === 'transfer';
  const body = `<form id="stu-form" data-stu-form="payment-save" data-id="${s.id}"><div class="form-grid"><label>类别${stuSelect('category', 'Offer Deposit', STU_PAYMENT_CATEGORIES.map((x) => [x, x]))}</label><label>金额<input type="text" name="amount" placeholder="0.00" required></label><label>币种${stuSelect('currency', 'AUD', STU_PAYMENT_CURRENCIES.map((x) => [x, x]))}</label><label>支付方式${stuSelect('method', 'Bank Transfer', STU_PAYMENT_METHODS.map((x) => [x, x]))}</label><label>支付日期<input type="text" name="paid_date" value="${stuToday()}" required></label><label>付款人<input type="text" name="payer_name" value="家长（虚构）" required></label><label>收款人<input type="text" name="receiver_name" value="${esc(s.school === '待确认' ? '待确认' : s.school)}" required></label><label class="wide">付款凭证（可多选）<input type="file" name="proof" multiple></label>${transfer ? `<label class="stu-option"><input type="checkbox" name="transfer_confirmed" checked> 转学付款已确认</label>` : ''}<label class="wide">备注<textarea name="note"></textarea></label></div></form>`;
  stuDialog('新增付款记录', body, `<button class="btn primary" type="submit" form="stu-form">保存付款</button>`, '金额与币种按记录保存；付款凭证支持多个文件。');
}

/* ---------------- COE / OSHC ---------------- */
function stuCoeDialog(s, record) {
  const r = record || { kind: 'COE', file_name: 'COE_' + s.id + '.pdf' };
  const body = `<form id="stu-form" data-stu-form="coe-save" data-id="${s.id}" data-key="${record ? record.id : ''}"><div class="form-grid"><label>文件类型${stuSelect('kind', r.kind, STU_COE_KINDS)}</label><label class="wide">文件名称<input type="text" name="file_name" value="${esc(r.file_name || '')}"></label><label>Provider<input type="text" name="coe_provider" value="${esc(r.coe_provider || '')}"></label><label>Course<input type="text" name="coe_course" value="${esc(r.coe_course || '')}"></label><label>Course Start Date<input type="text" name="coe_start_date" value="${esc(r.coe_start_date || '')}" placeholder="DD/MM/YYYY"></label><label>Course End Date<input type="text" name="coe_end_date" value="${esc(r.coe_end_date || '')}" placeholder="DD/MM/YYYY"></label><label>Nominated Welfare Period Start Date<input type="text" name="caaw_welfare_start_date" value="${esc(r.caaw_welfare_start_date || '')}" placeholder="DD/MM/YYYY"></label><label>Nominated Welfare Period End Date<input type="text" name="caaw_welfare_end_date" value="${esc(r.caaw_welfare_end_date || '')}" placeholder="DD/MM/YYYY"></label><label>OSHC Company Name<input type="text" name="oshc_company_name" value="${esc(r.oshc_company_name || '')}"></label><label>Policy / Membership Number<input type="text" name="oshc_policy_number" value="${esc(r.oshc_policy_number || '')}"></label><label>OSHC Commencement Date<input type="text" name="oshc_commencement_date" value="${esc(r.oshc_commencement_date || '')}" placeholder="DD/MM/YYYY"></label><label>OSHC Expiry Date<input type="text" name="oshc_expiry_date" value="${esc(r.oshc_expiry_date || '')}" placeholder="DD/MM/YYYY"></label><label>Language Course / English Language Centre<input type="text" name="loc_language_course" value="${esc(r.loc_language_course || '')}"></label><label>Language Course Start Date<input type="text" name="loc_language_start" value="${esc(r.loc_language_start || '')}" placeholder="DD/MM/YYYY"></label><label>Language Course End Date<input type="text" name="loc_language_end" value="${esc(r.loc_language_end || '')}" placeholder="DD/MM/YYYY"></label><label>Year Level<input type="text" name="loc_year_level" value="${esc(r.loc_year_level || '')}"></label><label>Main Course / Host School<input type="text" name="loc_main_course" value="${esc(r.loc_main_course || '')}"></label><label>Main Course Start Date<input type="text" name="loc_main_start" value="${esc(r.loc_main_start || '')}" placeholder="DD/MM/YYYY"></label><label>Main Course End Date<input type="text" name="loc_main_end" value="${esc(r.loc_main_end || '')}" placeholder="DD/MM/YYYY"></label></div><p class="form-hint">按文件类型填写对应字段；不适用的字段可留空。</p></form>`;
  stuDialog(record ? '编辑 COE / OSHC 记录' : '录入 COE / OSHC 文件信息', body, `<button class="btn primary" type="submit" form="stu-form">保存</button>`, 'COE、CAAW、OSHC 与 Letter of Confirmation 字段与源系统一致。');
}

/* ---------------- visa ---------------- */
function stuVisaDialog(s, record, purpose) {
  const v = record || { visa_type: 'Student Visa Subclass 500', visa_sector: 'Schools Sector', document_type: 'grant_letter', visa_status: purpose === 'existing_evidence' ? 'active' : 'pending' };
  const body = `<form id="stu-form" data-stu-form="visa-save" data-id="${s.id}" data-key="${record ? record.id : ''}" data-purpose="${esc(purpose || (record && record.existing ? 'existing_evidence' : 'current_application'))}"><div class="form-grid"><fieldset class="stu-radio wide"><legend>录入方式</legend><div class="stu-option-row"><label class="stu-option"><input type="radio" name="visa_record_purpose" value="existing_evidence" ${purpose === 'existing_evidence' ? 'checked' : ''}> 上传已有签证</label><label class="stu-option"><input type="radio" name="visa_record_purpose" value="current_application" ${purpose !== 'existing_evidence' ? 'checked' : ''}> 新增本轮签证记录</label></div></fieldset><label>签证类型<input type="text" name="visa_type" value="${esc(v.visa_type || '')}" required></label><label>Sector${stuSelect('visa_sector', v.visa_sector || 'Schools Sector', STU_VISA_SECTORS.map((x) => [x, x]))}</label><label>文件类型${stuSelect('document_type', v.document_type || 'grant_letter', STU_VISA_DOCUMENT_TYPES)}</label><label>批准日期<input type="text" name="visa_grant_date" value="${esc(v.visa_grant_date || '')}" placeholder="DD/MM/YYYY"></label><label>开始日期<input type="text" name="visa_start_date" value="${esc(v.visa_start_date || '')}" placeholder="DD/MM/YYYY"></label><label>到期日期<input type="text" name="visa_expiry_date" value="${esc(v.visa_expiry_date || '')}" placeholder="DD/MM/YYYY"></label><label>状态${stuSelect('visa_status', v.visa_status || 'pending', STU_VISA_STATUSES.map((x) => [x, STU_VISA_STATUS_LABELS[x]]))}</label><label>Visa 文件名称<input type="text" name="file_name" value="${esc(v.file_name || '')}"></label><label class="wide">签证条件 / 备注<textarea name="visa_conditions">${esc(v.visa_conditions || '')}</textarea></label><label class="stu-option wide"><input type="checkbox" name="staff_confirm" ${v.staff_confirm ? 'checked' : ''}> Staff Confirm official Visa Decision</label></div></form>`;
  stuDialog(record ? '编辑签证记录' : '新增签证记录', body, `<button class="btn primary" type="submit" form="stu-form">保存签证记录</button>`, '上传已有签证用于记录历史证据；新增本轮签证记录用于当前申请。');
}

/* ---------------- homestay ---------------- */
function stuHomestayDialog(s) {
  const body = `<form id="stu-form" data-stu-form="homestay-save" data-id="${s.id}"><div class="form-grid"><label>文件类型${stuSelect('type', 'HomestayApplication', STU_HOMESTAY_TYPES)}</label><label>文件名称<input type="text" name="file_name" value="Homestay_${s.id}.pdf" required></label><label class="wide">上传文件（演示）<input type="file" name="file"></label></div></form>`;
  stuDialog('上传住宿 / 接机文件', body, `<button class="btn primary" type="submit" form="stu-form">上传</button>`, '文件按类型归档到学生住宿与接机记录。');
}

/* ---------------- reminders ---------------- */
function stuNoteAddDialog(s) {
  const body = `<form id="stu-form" data-stu-form="note-add" data-id="${s.id}"><div class="form-grid"><label class="wide">留言内容<textarea name="description" required placeholder="例如：跟进家长补充成绩单"></textarea></label><label>提醒日期<input type="date" name="reminder_date" value="2026-11-08" required></label><label>提醒时间<input type="time" name="reminder_time" value="10:00" required></label><label>提醒接收人${stuSelect('recipient_name', s.owner, [...new Set(DEMO.students.map((x) => x.owner))].map((x) => [x, x]))}</label></div></form>`;
  stuDialog('记录留言与提醒', body, '<button class="btn primary" type="submit" form="stu-form">保存留言</button>', '留言会出现在学生详情与提醒中心。');
}
function stuNoteEditDialog(s, note) {
  const date = String(note.reminder_at).slice(0, 10);
  const time = String(note.reminder_at).slice(11, 16);
  const body = `<form id="stu-form" data-stu-form="note-edit-save" data-id="${s.id}" data-key="${note.id}"><div class="form-grid"><label class="wide">留言内容<textarea name="description" required>${esc(note.description)}</textarea></label><label>提醒日期<input type="date" name="reminder_date" value="${esc(date)}" required></label><label>提醒时间<input type="time" name="reminder_time" value="${esc(time)}" required></label><label>提醒接收人${stuSelect('recipient_name', note.recipient_name, [...new Set(DEMO.students.map((x) => x.owner))].map((x) => [x, x]))}</label></div></form>`;
  stuDialog('编辑留言与提醒', body, `<button class="btn primary" type="submit" form="stu-form">保存修改</button>`);
}
function stuNoteSnoozeDialog(s, note) {
  const body = `<form id="stu-form" data-stu-form="note-snooze-save" data-id="${s.id}" data-key="${note.id}"><div class="form-grid"><label class="wide">稍后提醒${stuSelect('snooze', '30m', [['30m', '30 分钟后'], ['1h', '1 小时后'], ['3h', '3 小时后'], ['tomorrow', '明天']])}</label></div></form>`;
  stuDialog('稍后提醒', body, `<button class="btn primary" type="submit" form="stu-form">确认</button>`);
}

/* ---------------- action dispatcher ---------------- */
function stuAction(action, el) {
  const id = el.dataset.id;
  const s = id ? studentById(id) : null;
  const d = s ? STU_DETAILS[id] : null;
  const key = el.dataset.key;
  const type = el.dataset.type;
  switch (action) {
    case 'close': closeDialog(); return;
    case 'new-student': stuStudentForm(); return;
    case 'edit-student': stuStudentForm(id); return;
    case 'delete-student':
      stuConfirm('删除学生', '将删除 ' + (s ? s.name + '（' + s.id + '）' : '该学生') + '，删除后可在“已删除学生”中恢复。', 'delete-confirm', `data-id="${esc(id)}"`);
      return;
    case 'delete-confirm': {
      const idx = DEMO.students.findIndex((x) => x.id === id);
      if (idx >= 0) {
        const [removed] = DEMO.students.splice(idx, 1);
        stuDeleted().unshift({ student: removed, deleted_at: stuIsoToday() + 'T11:00:00', deleted_by: state.role });
        stuSelected().delete(id);
        audit('删除学生 ' + removed.name, id);
        stuClose('学生已软删除，可在已删除学生中恢复');
      }
      return;
    }
    case 'deleted-students': location.hash = 'students/deleted'; return;
    case 'restore-student': {
      const row = stuDeleted().find((x) => x.student.id === id);
      if (!row) return;
      DEMO.students.unshift(row.student);
      state.stuDeleted = stuDeleted().filter((x) => x.student.id !== id);
      toast('学生已恢复：' + row.student.name);
      render();
      return;
    }
    case 'parent-link': stuParentLinkDialog(); return;
    case 'from-parent': stuFromParentDialog(); return;
    case 'parent-create': {
      const submission = stuParentSubmissions().find((x) => x.key === key);
      if (!submission) return;
      state.stuParentSubmissions = stuParentSubmissions().filter((x) => x.key !== key);
      const newStudent = {
        id: stuNextStudentId(), name: submission.name, english: submission.english, avatar: submission.name[0],
        lifecycle: 'initial', stage: '建档', stage_index: 0, school: '待确认', final_school: '待确认',
        grade: submission.grade, intake: '2027 · 2月入学', owner: submission.owner,
        updated: stuIsoToday(), created_at: stuIsoToday(), city: submission.city,
        email: 'parent.form.' + submission.key.toLowerCase() + '@example.test', phone: '0412 000 ' + (800 + DEMO.students.length),
        parent_form: 'Submitted', type: '中小学申请', offer_course_start: '', visa_grant_date: '', alerts: [],
      };
      const nd = stuBuildDetail(newStudent, DEMO.students.length);
      nd.parent_form_submitted = true;
      nd.materials_checked = false;
      nd.alerts = stuBuildAlerts(newStudent, nd);
      newStudent.alerts = nd.alerts;
      STU_DETAILS[newStudent.id] = nd;
      DEMO.students.unshift(newStudent);
      audit('从家长表单建档 ' + newStudent.name, newStudent.id);
      closeDialog();
      location.hash = 'student/' + newStudent.id + '/profile';
      render();
      toast('已从家长表单建档：' + newStudent.id);
      return;
    }
    case 'excel-template': {
      csv('学生导入模板', ['护照姓（拼音）', '护照名（拼音）', '性别', '出生日期', '在读年级', '申请类型', '计划入读年份', '计划入澳学期', '申请年级', '申请意向城市', '学生手机号', '学生Email'], []);
      toast('Excel 模板已下载（演示）');
      return;
    }
    case 'excel-import': stuExcelImportDialog(); return;
    case 'reset-filters': state.stuFilters = { ...STU_FILTER_DEFAULTS }; state.stuPage = 1; render(); toast('筛选已重置'); return;
    case 'stu-stage': {
      stuCaptureFilters();
      const f = stuFilters();
      f.stage = el.dataset.value || '';
      state.stuPage = 1;
      render();
      return;
    }
    case 'stu-quick': {
      stuCaptureFilters();
      const f = stuFilters();
      f[key] = f[key] === el.dataset.value ? '' : el.dataset.value;
      state.stuPage = 1;
      render();
      return;
    }
    case 'stu-chip': {
      stuCaptureFilters();
      const f = stuFilters();
      f[key] = '';
      state.stuPage = 1;
      render();
      return;
    }
    case 'stu-adv-toggle': {
            stuCaptureFilters();
const f = stuFilters();
      state.stuAdvOpen = !state.stuAdvOpen;
      render();
      return;
    }
    case 'page-prev': state.stuPage = Math.max(1, (state.stuPage || 1) - 1); render(); return;
    case 'page-next': state.stuPage = (state.stuPage || 1) + 1; render(); return;
    case 'bulk-delete': {
      const n = stuSelected().size;
      if (!n) return;
      stuConfirm('批量删除学生', '将软删除已选择的 ' + n + ' 名学生，删除后可在已删除学生中恢复。', 'bulk-delete-confirm');
      return;
    }
    case 'bulk-delete-confirm': {
      const ids = [...stuSelected()];
      ids.forEach((sid) => {
        const idx = DEMO.students.findIndex((x) => x.id === sid);
        if (idx >= 0) {
          const [removed] = DEMO.students.splice(idx, 1);
          stuDeleted().unshift({ student: removed, deleted_at: stuIsoToday() + 'T11:00:00', deleted_by: state.role });
        }
      });
      state.stuSelected = new Set();
      stuClose('已软删除 ' + ids.length + ' 名学生');
      return;
    }
    case 'materials-check': {
      const missing = stuRequiredMaterials(s).filter((t) => !d.documents.some((x) => x.type === t));
      if (missing.length) { toast('仍有必填材料未上传：' + missing.join('、')); return; }
      d.materials_checked = true;
      d.materials_checked_at = stuIsoToday() + 'T16:00:00';
      d.materials_checker_name = state.role;
      d.history.unshift({ id: 'LOG-' + id + '-' + Date.now(), changed_at: d.materials_checked_at, user: state.role, section: '申请材料', field: '材料审核', before: '待审核', after: '已完成' });
      d.alerts = stuBuildAlerts(s, d);
      s.alerts = d.alerts;
      toast('材料审核已完成');
      render();
      return;
    }
    case 'material-upload': stuMaterialDialog(s, type); return;
    case 'material-view': stuDocListDialog(s, type); return;
    case 'doc-review': {
      const doc = d.documents.find((x) => x.id === key);
      if (!doc) return;
      doc.status = '已确认';
      d.history.unshift({ id: 'LOG-' + id + '-' + Date.now(), changed_at: stuIsoToday() + 'T15:00:00', user: state.role, section: '申请材料', field: doc.name, before: '待审核', after: '已确认' });
      toast('材料已确认');
      render();
      return;
    }
    case 'contract-new': stuContractDialog(s); return;
    case 'contract-preview': {
      const c = d.contracts.find((x) => x.id === key);
      if (c) stuFileDialog('合同预览', c.file_name, STU_CONTRACT_TYPES[c.contract_type] + ' · ' + (STU_CONTRACT_STATUS[c.status] || c.status));
      return;
    }
    case 'contract-download': toast('合同下载已开始（演示）'); return;
    case 'contract-delete': {
      const c = d.contracts.find((x) => x.id === key);
      if (c) stuContractDeleteDialog(s, c);
      return;
    }
    case 'new-plan': stuPlanDialog(s); return;
    case 'plan-edit': {
      const p = d.plans.find((x) => x.id === key);
      if (p) stuPlanDialog(s, p);
      return;
    }
    case 'plan-preview': {
      const p = d.plans.find((x) => x.id === key);
      if (!p) return;
      const rows = p.confirmed_schools.length ? p.confirmed_schools.map((x) => `<li>${esc(x.decision_mode === 'ranked' ? '第 ' + x.rank_order + ' 顺位 · ' : '')}${esc(x.school_name)} · ${esc(STU_PLAN_RESULT_LABELS[x.result_status] || x.result_status)}</li>`).join('') : '<li>尚未确认递交学校</li>';
      stuDialog('学校方案预览', `<div class="stu-plan-preview"><h2>学校方案报告 · v${esc(p.version)}</h2><p>${esc(p.city)} · ${esc(STU_PLAN_SECTOR_LABELS[p.sector] || p.sector)}</p><ul>${rows}</ul><p class="muted">更新 ${esc(stuIsoToAu(p.updated_at))} · 状态 ${esc(p.status)}</p></div>`, `${stuBtn('下载报告', 'plan-download', 'primary', `data-id="${s.id}" data-key="${p.id}"`)}`);
      return;
    }
    case 'plan-download': toast('学校方案报告下载已开始（演示）'); return;
    case 'plan-link': {
      const p = d.plans.find((x) => x.id === key);
      if (p) stuPlanLinkDialog(s, p);
      return;
    }
    case 'copy-link': {
      const url = el.dataset.url;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).catch(() => {});
      toast('链接已复制（演示）');
      return;
    }
    case 'plan-result': {
      const p = d.plans.find((x) => x.id === key);
      const school = p && p.confirmed_schools.find((x) => x.id === type);
      if (p && school) stuPlanResultDialog(s, p, school);
      return;
    }
    case 'plan-submit-public': {
      const p = d.plans.find((x) => x.id === key);
      if (!p) return;
      p.confirmed_schools.forEach((x) => { x.submission_status = 'submitted'; x.submitted_at = stuIsoToday(); x.submitted_by_name = state.role; });
      toast('已记录递交全部公校申请');
      render();
      return;
    }
    case 'offer-add': stuOfferDialog(s); return;
    case 'offer-edit': {
      const o = d.offers.find((x) => x.id === key);
      if (o) stuOfferDialog(s, o);
      return;
    }
    case 'offer-accept': {
      const o = d.offers.find((x) => x.id === key);
      if (!o) return;
      o.accepted = true; o.status = 'signed_received';
      d.history.unshift({ id: 'LOG-' + id + '-' + Date.now(), changed_at: stuIsoToday() + 'T14:00:00', user: state.role, section: '录取通知', field: 'Offer 状态', before: '已收到', after: '已接受' });
      stuApplyStudentSummary(s);
      toast('Offer 已设为已接受');
      render();
      return;
    }
    case 'offer-withdraw': {
      const o = d.offers.find((x) => x.id === key);
      if (o) stuOfferWithdrawDialog(s, o);
      return;
    }
    case 'offer-file': {
      const o = d.offers.find((x) => x.id === key);
      if (o) stuFileDialog('Offer 文件', o.file_name, o.school_name);
      return;
    }
    case 'payment-add': stuPaymentDialog(s); return;
    case 'payment-proof': {
      const p = d.payments.find((x) => x.id === key);
      if (p) stuFileDialog('付款凭证', p.proof, p.category + ' · ' + p.currency + ' ' + p.amount);
      return;
    }
    case 'coe-add': stuCoeDialog(s); return;
    case 'coe-edit': {
      const c = d.coe.find((x) => x.id === key);
      if (c) stuCoeDialog(s, c);
      return;
    }
    case 'coe-file': {
      const c = d.coe.find((x) => x.id === key);
      if (c) stuFileDialog('COE / OSHC 文件', c.file_name, c.kind);
      return;
    }
    case 'visa-add': stuVisaDialog(s, null, el.dataset.purpose || 'current_application'); return;
    case 'visa-edit': {
      const v = d.visas.find((x) => x.id === key);
      if (v) stuVisaDialog(s, v, v.existing ? 'existing_evidence' : 'current_application');
      return;
    }
    case 'visa-grant': {
      const v = d.visas.find((x) => x.id === key);
      if (!v) return;
      v.visa_status = 'granted';
      v.visa_grant_date = stuToday();
      v.visa_start_date = stuToday();
      v.visa_expiry_date = '15/03/2030';
      v.document_type = 'grant_letter';
      v.file_name = 'Visa_Grant_' + s.id + '.pdf';
      d.history.unshift({ id: 'LOG-' + id + '-' + Date.now(), changed_at: stuIsoToday() + 'T17:00:00', user: state.role, section: '签证', field: '签证状态', before: '待审批', after: '已获签' });
      stuApplyStudentSummary(s);
      toast('签证已记录为获签');
      render();
      return;
    }
    case 'visa-file': {
      const v = d.visas.find((x) => x.id === key);
      if (v) stuFileDialog('签证文件', v.file_name, v.visa_type + ' · ' + v.visa_sector);
      return;
    }
    case 'homestay-add': stuHomestayDialog(s); return;
    case 'note-add': stuNoteAddDialog(s); return;
    case 'homestay-view': {
      const doc = d.homestay.find((x) => x.id === key);
      if (doc) stuFileDialog('住宿 / 接机文件', doc.name, (STU_HOMESTAY_TYPES.find((x) => x[0] === doc.type) || [doc.type, doc.type])[1]);
      return;
    }
    case 'note-done': {
      const n = d.notes.find((x) => x.id === key);
      if (n) { n.status = 'Completed'; toast('留言已标记完成'); render(); }
      return;
    }
    case 'note-dismiss': {
      const n = d.notes.find((x) => x.id === key);
      if (n) { n.status = 'Dismissed'; toast('留言已忽略'); render(); }
      return;
    }
    case 'note-snooze': {
      const n = d.notes.find((x) => x.id === key);
      if (n) stuNoteSnoozeDialog(s, n);
      return;
    }
    case 'note-edit': {
      const n = d.notes.find((x) => x.id === key);
      if (n) stuNoteEditDialog(s, n);
      return;
    }
    case 'note-delete': {
      const n = d.notes.find((x) => x.id === key);
      if (!n) return;
      stuConfirm('删除留言', '确认删除这条留言与提醒？', 'note-delete-confirm', `data-id="${s.id}" data-key="${n.id}"`);
      return;
    }
    case 'note-delete-confirm': {
      d.notes = d.notes.filter((x) => x.id !== key);
      stuClose('留言已删除');
      return;
    }
    case 'docx-download': toast('StudentInfo.docx 下载已开始（演示）'); return;
    case 'docx-regenerate': {
      d.docx.updated_at = stuIsoToday();
      d.docx.file_name = 'StudentInfo_' + s.id + '.docx';
      toast('StudentInfo.docx 已重新生成');
      render();
      return;
    }
    case 'download-demo': toast('演示文件下载已开始：' + (el.dataset.name || 'demo.pdf')); return;
    default: toast('演示操作：' + action);
  }
}

/* ---------------- submit router ---------------- */
function stuSubmit(kind, form, fd) {
  const id = form.dataset.id;
  const s = id ? studentById(id) : null;
  const d = s ? STU_DETAILS[id] : null;
  switch (kind) {
    case 'filters': {
      const f = stuFilters();
      Object.keys(STU_FILTER_DEFAULTS).forEach((k) => { f[k] = String(fd.get(k) || ''); });
      state.stuPage = 1;
      render();
      toast('筛选已应用');
      return;
    }
    case 'student-save': stuSaveStudent(form, fd); return;
    case 'parent-link': {
      const links = stuParentLinks();
      const sid = String(fd.get('student') || '');
      const link = { id: 'LINK-2026-' + String(links.length + 1).padStart(3, '0'), student: sid, type: String(fd.get('type') || '学生资料'), status: 'Pending', expires: String(fd.get('expires') || ''), visits: 0 };
      links.unshift(link);
      const stu = studentById(sid);
      if (stu) stu.parent_form = 'Pending';
      closeDialog(); render();
      toast('家长表单链接已生成：' + link.id + '（演示）');
      return;
    }
    case 'excel-import': {
      closeDialog();
      toast('已解析演示文件：成功 10 行，2 行待修正；未写入真实数据');
      return;
    }
    case 'material-save': {
      const type = String(fd.get('material_type') || form.dataset.type || 'Others');
      const name = String(fd.get('file_name') || '演示材料.pdf');
      d.documents.unshift({ id: 'DOC-' + s.id + '-' + type + '-' + Date.now(), type, name, version: 'v1', uploaded_at: stuIsoToday(), status: '待审核' });
      d.history.unshift({ id: 'LOG-' + s.id + '-' + Date.now(), changed_at: stuIsoToday() + 'T12:00:00', user: state.role, section: '申请材料', field: name, before: '未上传', after: '待审核' });
      d.alerts = stuBuildAlerts(s, d);
      s.alerts = d.alerts;
      stuClose('材料已上传（演示）');
      return;
    }
    case 'contract-save': {
      const scopes = fd.getAll('scopes');
      if (!scopes.length) { toast('请至少选择一个服务范围'); return; }
      const type = String(fd.get('contract_type'));
      d.contracts.unshift({ id: 'CON-' + s.id + '-' + Date.now(), contract_type: type, status: 'Draft', version: 'v1', service_scopes: scopes, fee: String(fd.get('fee') || '2400.00'), discount: String(fd.get('discount') || '0.00'), payment_method: String(fd.get('payment_method') || '支付宝'), file_name: String(fd.get('file_name') || 'Contract.pdf'), created_at: stuIsoToday(), signed_at: '' });
      stuClose('合同已创建（演示）');
      return;
    }
    case 'contract-delete': {
      const c = d.contracts.find((x) => x.id === form.dataset.key);
      if (c) {
        c.status = 'Deleted';
        c.delete_reason = String(fd.get('reason') || '');
        c.delete_note = String(fd.get('note') || '');
      }
      stuClose('合同已删除（演示）');
      return;
    }
    case 'plan-save': {
      const key = form.dataset.key;
      const schools = String(fd.get('schools') || '').split(/\n+/).map((x) => x.trim()).filter(Boolean);
      let p = key ? d.plans.find((x) => x.id === key) : null;
      if (!p) {
        p = { id: 'PLAN-' + s.id + '-' + Date.now(), city: '', sector: 'private', version: 1, status: 'draft', updated_at: stuIsoToday(), is_current: true, report_title: '学校方案报告', confirmed_schools: [] };
        d.plans.unshift(p);
      }
      p.city = String(fd.get('city') || s.city);
      p.sector = String(fd.get('sector') || 'private');
      p.version = Number(fd.get('version') || p.version);
      p.status = String(fd.get('status') || 'draft');
      p.updated_at = stuIsoToday();
      p.confirmed_schools = schools.map((name, i) => {
        const old = p.confirmed_schools.find((x) => x.school_name === name) || {};
        return { id: old.id || 'PLANSCH-' + s.id + '-' + Date.now() + '-' + i, school_name: name, decision_mode: old.decision_mode || (p.sector === 'public' ? 'ranked' : 'selected'), rank_order: i + 1, submission_status: old.submission_status || (p.status === 'confirmed' ? 'submitted' : 'unsubmitted'), submitted_at: old.submitted_at || (p.status === 'confirmed' ? stuIsoToday() : ''), submitted_by_name: old.submitted_by_name || (p.status === 'confirmed' ? '家长（虚构）' : ''), result_status: old.result_status || 'pending', is_offer_accepted: !!old.is_offer_accepted, is_offer_received: !!old.is_offer_received, is_final_school: !!old.is_final_school, result_note: old.result_note || '', result_at: old.result_at || '', result_by_name: old.result_by_name || '', offer_id: old.offer_id || '' };
      });
      stuClose('学校方案已保存（演示）');
      return;
    }
    case 'plan-result-save': {
      const p = d.plans.find((x) => x.id === form.dataset.key);
      const sch = p && p.confirmed_schools.find((x) => x.id === form.dataset.type);
      if (!p || !sch) return;
      sch.result_status = String(fd.get('result_status') || 'pending');
      sch.offer_id = String(fd.get('offer_id') || '');
      sch.result_note = String(fd.get('result_note') || '');
      sch.is_offer_received = fd.get('is_offer_received') === 'on';
      sch.is_offer_accepted = fd.get('is_offer_accepted') === 'on';
      sch.is_final_school = fd.get('is_final_school') === 'on';
      sch.result_at = stuIsoToday();
      sch.result_by_name = state.role;
      if (sch.is_final_school) p.confirmed_schools.forEach((x) => { if (x.id !== sch.id) x.is_final_school = false; });
      p.updated_at = stuIsoToday();
      stuClose('学校结果已更新（演示）');
      return;
    }
    case 'offer-save': {
      const key = form.dataset.key;
      let o = key ? d.offers.find((x) => x.id === key) : null;
      if (!o) {
        o = { id: 'OFF-' + s.id + '-' + Date.now(), accepted: false, uploaded_at: stuIsoToday() };
        d.offers.unshift(o);
      }
      ['school_name', 'offer_date', 'language_school_name', 'course_start_date', 'offer_expiry_date', 'deposit_amount', 'deposit_currency', 'status', 'document_type', 'file_name'].forEach((k) => { o[k] = String(fd.get(k) || ''); });
      o.accepted = o.status === 'signed_received' || o.status === 'signed';
      d.alerts = stuBuildAlerts(s, d);
      stuApplyStudentSummary(s);
      stuClose('Offer 已保存（演示）');
      return;
    }
    case 'offer-withdraw-save': {
      const o = d.offers.find((x) => x.id === form.dataset.key);
      if (o) { o.accepted = false; o.status = 'cancelled'; o.withdraw_reason = String(fd.get('reason') || ''); }
      stuApplyStudentSummary(s);
      stuClose('Offer 接受已撤回（演示）');
      return;
    }
    case 'payment-save': {
      const category = String(fd.get('category'));
      d.payments.unshift({ id: 'PAY-' + s.id + '-' + Date.now(), category, amount: String(fd.get('amount') || '0.00'), currency: String(fd.get('currency') || 'AUD'), paid_date: String(fd.get('paid_date') || stuToday()), method: String(fd.get('method') || 'Bank Transfer'), payer_name: String(fd.get('payer_name') || ''), receiver_name: String(fd.get('receiver_name') || ''), transfer_confirmed: fd.get('transfer_confirmed') === 'on' ? '已确认' : '', proof: 'Payment_Receipt_' + Date.now() + '.pdf' });
      stuClose('付款记录已保存（演示）');
      return;
    }
    case 'coe-save': {
      const key = form.dataset.key;
      let r = key ? d.coe.find((x) => x.id === key) : null;
      if (!r) { r = { id: 'COE-' + s.id + '-' + Date.now(), uploaded_at: stuIsoToday() }; d.coe.unshift(r); }
      ['kind', 'file_name', 'coe_provider', 'coe_course', 'coe_start_date', 'coe_end_date', 'caaw_welfare_start_date', 'caaw_welfare_end_date', 'oshc_company_name', 'oshc_policy_number', 'oshc_commencement_date', 'oshc_expiry_date', 'loc_language_course', 'loc_language_start', 'loc_language_end', 'loc_year_level', 'loc_main_course', 'loc_main_start', 'loc_main_end'].forEach((k) => { r[k] = String(fd.get(k) || ''); });
      stuClose('COE / OSHC 记录已保存（演示）');
      return;
    }
    case 'visa-save': {
      const key = form.dataset.key;
      let v = key ? d.visas.find((x) => x.id === key) : null;
      if (!v) { v = { id: 'VISA-' + s.id + '-' + Date.now(), created_at: stuIsoToday(), existing: String(fd.get('visa_record_purpose')) === 'existing_evidence' }; d.visas.unshift(v); }
      ['visa_type', 'visa_sector', 'document_type', 'visa_grant_date', 'visa_start_date', 'visa_expiry_date', 'visa_status', 'visa_conditions', 'file_name'].forEach((k) => { v[k] = String(fd.get(k) || ''); });
      v.staff_confirm = fd.get('staff_confirm') === 'on';
      d.alerts = stuBuildAlerts(s, d);
      stuApplyStudentSummary(s);
      stuClose('签证记录已保存（演示）');
      return;
    }
    case 'homestay-save': {
      const type = String(fd.get('type'));
      d.homestay.unshift({ id: 'HOM-' + s.id + '-' + Date.now(), type, name: String(fd.get('file_name') || 'Homestay.pdf'), uploaded_at: stuIsoToday(), status: '待审核' });
      stuClose('住宿 / 接机文件已上传（演示）');
      return;
    }
    case 'note-add': {
      const date = String(fd.get('reminder_date') || stuIsoToday());
      const time = String(fd.get('reminder_time') || '10:00');
      d.notes.unshift({ id: 'NOTE-' + s.id + '-' + Date.now(), description: String(fd.get('description') || ''), reminder_at: date + 'T' + time + ':00', recipient_name: String(fd.get('recipient_name') || s.owner), status: 'Pending', priority: 'Normal', source_type: 'manual', created_by: state.role, creator_name: state.role, created_at: stuIsoToday() });
      closeDialog(); render();
      toast('留言与提醒已添加（演示）');
      return;
    }
    case 'note-snooze-save': {
      const n = d.notes.find((x) => x.id === form.dataset.key);
      if (n) { n.status = 'Snoozed'; n.snoozed_to = String(fd.get('snooze') || '30m'); }
      stuClose('已设置稍后提醒（演示）');
      return;
    }
    case 'note-edit-save': {
      const n = d.notes.find((x) => x.id === form.dataset.key);
      if (n) {
        n.description = String(fd.get('description') || n.description);
        n.reminder_at = String(fd.get('reminder_date') || '') + 'T' + String(fd.get('reminder_time') || '10:00') + ':00';
        n.recipient_name = String(fd.get('recipient_name') || n.recipient_name);
      }
      stuClose('留言已更新（演示）');
      return;
    }
    default: toast('演示表单已提交：' + kind);
  }
}

/* ---------------- event wiring ---------------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-stu]');
  if (!el) return;
  e.preventDefault();
  e.stopPropagation();
  stuAction(el.dataset.stu, el);
}, true);

document.addEventListener('change', (e) => {
  const auto = e.target.closest('[data-stu-auto]');
  if (auto) {
    stuCaptureFilters();
    state.stuPage = 1;
    render();
    return;
  }
  const all = e.target.closest('[data-stu-select-all]');
  if (all) {
    const selected = stuSelected();
    document.querySelectorAll('[data-stu-select]').forEach((x) => {
      x.checked = all.checked;
      if (all.checked) selected.add(x.dataset.stuSelect); else selected.delete(x.dataset.stuSelect);
    });
    render();
    return;
  }
  const one = e.target.closest('[data-stu-select]');
  if (one) {
    const selected = stuSelected();
    if (one.checked) selected.add(one.dataset.stuSelect); else selected.delete(one.dataset.stuSelect);
    render();
  }
}, true);

document.addEventListener('submit', (e) => {
  const f = e.target.closest('form[data-stu-form]');
  if (!f) return;
  e.preventDefault();
  e.stopPropagation();
  if (!f.reportValidity()) return;
  stuSubmit(f.dataset.stuForm, f, new FormData(f));
}, true);

function studentForm(id) { stuStudentForm(id); }

render();
