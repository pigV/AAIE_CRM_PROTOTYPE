/* Student management demo data. All records are fictitious.
   Field definitions mirror the CRM parent-form schema (fields.py) exactly. */
'use strict';

const STU_YEAR_LEVELS = Array.from({ length: 12 }, (_, i) => 'Year ' + (i + 1)).concat(['其他']);
const STU_APPLYING_YEAR_LEVELS = Array.from({ length: 12 }, (_, i) => 'Year ' + (i + 1)).concat(['预科+本科', '本科', '研究生', '不确定']);
const STU_CITIES = [
  ['melbourne', '墨尔本'], ['sydney', '悉尼'], ['brisbane', '布里斯班'], ['adelaide', '阿德莱德'],
  ['perth', '珀斯'], ['canberra', '堪培拉'], ['tasmania', '塔斯马尼亚'], ['unsure', '不确定'],
];
const STU_YEAR_OPTION = STU_YEAR_LEVELS;

const STU_SECTIONS = [
  ['basic', '学生基本信息', [
    ['passport_last_name', '护照姓（拼音）', 'text', true, null],
    ['passport_first_name', '护照名（拼音）', 'text', true, null],
    ['english_nickname', '英文昵称', 'text', false, null],
    ['gender', '性别', 'radio', true, ['男', '女']],
    ['date_of_birth', '出生日期', 'date', true, null],
    ['current_year_level', '在读年级', 'select', true, STU_YEAR_OPTION],
    ['application_stream', '申请类型', 'select', true, ['school_education|中小学申请', 'higher_education|高等教育申请']],
    ['preferred_intake_year', '计划入读年份', 'select', true, ['2026', '2027', '2028', '2029', '不确定']],
    ['preferred_intake_term', '计划入澳学期', 'select', true, ['02|2月入学', '04|4月入学', '07|7月入学', '10|10月入学', 'unsure|不确定']],
    ['applying_year_level', '申请年级', 'select', false, STU_APPLYING_YEAR_LEVELS],
    ['higher_education_course_type', '高等教育课程类型', 'select', false, ['Foundation|预科', 'Diploma', 'Bachelor|本科', 'Postgraduate|研究生', 'Package|打包课程']],
    ['higher_education_package_combination', 'Package 组合', 'select', false, ['Foundation + Bachelor', 'Diploma + Bachelor', 'Foundation + Diploma + Bachelor']],
    ['preferred_cities', '申请意向城市', 'checkbox', true, STU_CITIES.map(([v, l]) => v + '|' + l)],
    ['visa_status', '身份状态', 'select', true, ['中国护照', '澳洲PR', '澳洲公民', '其他', '不确定']],
    ['previous_name', '曾用名', 'text', false, null],
  ]],
  ['contact', '联系方式与地址', [
    ['home_address', '家庭住址', 'text', true, null],
    ['home_postcode', '家庭住址邮编', 'text', true, null],
    ['australia_address', '澳洲住址', 'text', false, null],
    ['australia_postcode', '澳洲住址邮编', 'text', false, null],
    ['mobile_phone', '学生手机号', 'tel', true, null],
    ['student_email', '学生Email', 'email', false, null],
  ]],
  ['siblings', '兄弟姐妹信息', [
    ['has_sibling_under_6', '家庭中是否有6岁以下直系兄弟姐妹', 'radio', true, ['是', '否']],
    ['sibling_1_name', '兄弟姐妹1姓名', 'text', false, null],
    ['sibling_1_gender', '兄弟姐妹1性别', 'radio', false, ['男', '女']],
    ['sibling_1_dob', '兄弟姐妹1出生日期', 'date', false, null],
    ['sibling_1_school_company', '兄弟姐妹1学校/公司', 'text', false, null],
    ['sibling_1_year_level', '兄弟姐妹1年级', 'select', false, STU_YEAR_OPTION],
    ['sibling_2_name', '兄弟姐妹2姓名', 'text', false, null],
    ['sibling_2_gender', '兄弟姐妹2性别', 'radio', false, ['男', '女']],
    ['sibling_2_dob', '兄弟姐妹2出生日期', 'date', false, null],
    ['sibling_2_school_company', '兄弟姐妹2学校/公司', 'text', false, null],
    ['sibling_2_year_level', '兄弟姐妹2年级', 'select', false, STU_YEAR_OPTION],
  ]],
  ['accommodation', '陪读与住宿偏好', [
    ['requires_parent_accompaniment', '是否需要陪读', 'radio', true, ['是', '否', '不确定']],
    ['accompanying_person_relationship', '与学生关系', 'select', false, ['父亲', '母亲', '祖父', '祖母', '外祖父', '外祖母', '其他', '不确定']],
    ['accommodation_preference', '申请住宿方式', 'checkbox', true, ['住校', '寄宿家庭', '不确定']],
    ['accept_homestay_with_young_children', '接受住家有8岁以下小孩吗', 'radio', false, ['接受', '不接受', '不确定']],
    ['homestay_style_preference', '偏向于中式或西式住家', 'radio', false, ['中式', '西式', '都可以', '不确定']],
    ['smoke_allergy', '对烟过敏吗', 'radio', true, ['是', '否', '不确定']],
    ['food_allergy', '对某些食物过敏吗', 'radio', true, ['是', '否', '不确定']],
    ['food_allergy_notes', '食物过敏补充说明', 'text', false, null],
    ['pet_allergy', '对宠物过敏吗', 'radio', true, ['是', '否', '不确定']],
    ['pet_allergy_notes', '宠物过敏补充说明', 'text', false, null],
    ['medicine_allergy', '对某些药物过敏吗', 'radio', true, ['是', '否', '不确定']],
    ['medicine_allergy_notes', '药物过敏补充说明', 'text', false, null],
    ['accommodation_notes', '其他需要补充的', 'textarea', false, null],
  ]],
  ['health', '健康、安全与学校声明', [
    ['photo_permission', '是否同意学校为学生照相作宣传用途', 'radio', true, ['同意', '不同意', '需要进一步确认']],
    ['can_swim', '学生是否会游泳', 'radio', true, ['会', '不会', '一般']],
    ['has_medical_or_psychological_history', '有无残疾或心理/身体疾病史', 'radio', true, ['有', '无', '不确定']],
    ['medical_history_notes', '疾病史补充说明', 'textarea', false, null],
    ['requires_long_term_medication', '有无需要长期/持续性使用药物治疗', 'radio', true, ['有', '无', '不确定']],
    ['medication_notes', '药物治疗补充说明', 'textarea', false, null],
    ['has_violent_behavior_history', '过去有无暴力行为史', 'radio', true, ['有', '无', '不确定']],
    ['has_suspension_or_expulsion_history', '曾经有无被学校停学或开除', 'radio', true, ['有', '无', '不确定']],
  ]],
  ['visa', '签证风险信息', [
    ['student_australia_visa_refusal', '学生有无澳洲拒签史', 'radio', true, ['有', '无', '不确定']],
    ['student_visa_refusal_notes', '拒签史补充说明', 'textarea', false, null],
    ['parents_australia_visa_refusal', '父母有无澳洲拒签史', 'radio', true, ['有', '无', '不确定']],
    ['parents_australia_visa_refusal_person', '父母澳洲拒签史对象', 'radio', false, ['父亲', '母亲', '父母都有']],
    ['father_migration_application_status', '父亲是否已经或者正在申请移民', 'radio', true, ['是', '否', '不确定']],
    ['father_migration_notes', '父亲移民补充信息', 'textarea', false, null],
    ['mother_migration_application_status', '母亲是否已经或者正在申请移民', 'radio', true, ['是', '否', '不确定']],
    ['mother_migration_notes', '母亲移民补充信息', 'textarea', false, null],
  ]],
  ['study', '学习经历与语言测试', [
    ['current_school_name', '现在读学校名称', 'text', true, null],
    ['current_school_year_level', '现在就读年级', 'select', true, STU_YEAR_OPTION],
    ['study_history_notes', '学习经历备注', 'textarea', false, null],
    ['has_aeas_or_idat', '是否考过 AEAS 或 IDAT', 'radio', true, ['是', '否', '准备考', '不确定']],
    ['aeas_idat_score', 'AEAS/IDAT 分数', 'text', false, null],
    ['has_ielts_or_toefl', '是否考过雅思或托福', 'radio', true, ['是', '否', '准备考', '不确定']],
    ['language_test_notes', '任何语言测试', 'textarea', false, null],
    ['account_username', '账号用户名', 'text', false, null],
    ['account_password', '账号密码', 'text', false, null],
  ]],
  ['father', '父亲信息', [
    ['father_passport_last_name', '父亲护照姓', 'text', true, null],
    ['father_passport_first_name', '父亲护照名', 'text', true, null],
    ['father_date_of_birth', '父亲出生日期', 'date', true, null],
    ['father_mobile', '父亲手机号', 'tel', true, null],
    ['father_email', '父亲常用 Email', 'email', true, null],
    ['father_employer', '父亲工作单位', 'text', false, null],
    ['father_work_address', '父亲单位地址', 'text', false, null],
    ['father_work_postcode', '父亲单位邮编', 'text', false, null],
    ['father_work_phone', '父亲单位电话', 'tel', false, null],
    ['father_position', '父亲工作职务', 'text', false, null],
    ['father_marital_status', '父亲婚姻状况', 'select', false, ['已婚', '离异', '单身', '丧偶', '其他']],
    ['father_religion', '父亲宗教信仰', 'select', false, ['无', '佛教', '基督教', '天主教', '伊斯兰教', '其他', '不方便透露']],
    ['father_highest_school', '父亲最高学历毕业院校', 'text', false, null],
    ['father_highest_qualification', '父亲所获学历', 'select', false, ['高中', '大专', '本科', '硕士', '博士', '其他']],
  ]],
  ['mother', '母亲信息', [
    ['mother_passport_last_name', '母亲护照姓', 'text', true, null],
    ['mother_passport_first_name', '母亲护照名', 'text', true, null],
    ['mother_date_of_birth', '母亲出生日期', 'date', true, null],
    ['mother_mobile', '母亲手机号', 'tel', true, null],
    ['mother_email', '母亲常用 Email', 'email', true, null],
    ['mother_employer', '母亲工作单位', 'text', false, null],
    ['mother_work_address', '母亲单位地址', 'text', false, null],
    ['mother_work_postcode', '母亲单位邮编', 'text', false, null],
    ['mother_work_phone', '母亲单位电话', 'tel', false, null],
    ['mother_position', '母亲工作职务', 'text', false, null],
    ['mother_marital_status', '母亲婚姻状况', 'select', false, ['已婚', '离异', '单身', '丧偶', '其他']],
    ['mother_religion', '母亲宗教信仰', 'select', false, ['无', '佛教', '基督教', '天主教', '伊斯兰教', '其他', '不方便透露']],
    ['mother_highest_school', '母亲最高学历毕业院校', 'text', false, null],
    ['mother_highest_qualification', '母亲所获学历', 'select', false, ['高中', '大专', '本科', '硕士', '博士', '其他']],
  ]],
  ['emergency', '紧急联系人', [
    ['emergency_contact_name', '紧急联系人姓名', 'text', false, null],
    ['emergency_contact_gender', '紧急联系人性别', 'radio', false, ['男', '女']],
    ['emergency_contact_relationship', '紧急联系人与学生的关系', 'select', false, ['父亲', '母亲', '亲属', '朋友', '其他']],
    ['emergency_contact_mobile', '紧急联系人手机号', 'tel', false, null],
    ['emergency_contact_email', '紧急联系人 Email', 'email', false, null],
    ['emergency_contact_address', '紧急联系人住址及邮编', 'textarea', false, null],
  ]],
  ['notes', '备注', [
    ['general_notes', '备注', 'textarea', false, null],
  ]],
];

const STU_FIELD_MAP = {};
STU_SECTIONS.forEach(([sectionId, title, fields]) => fields.forEach((f) => {
  STU_FIELD_MAP[f[0]] = { label: f[1], type: f[2], required: f[3], options: f[4], section: sectionId, sectionTitle: title };
}));

const STU_STAGES = ['建档', '签约', '申请材料审核', '制定学校计划', '递交申请', '面试', '下offer', '接受OFFER+缴费', 'COE已出', '签证材料准备', '签证审核', '签证递交', '签证下签或拒签'];
const STU_STAGE_INDEX = Object.fromEntries(STU_STAGES.map((v, i) => [v, i]));

const STU_MATERIALS = [
  ['StudentPassport', '学生护照'], ['FatherPassport', '父亲护照'], ['MotherPassport', '母亲护照'],
  ['GuardianPassport', '监护人护照'], ['BirthCertificate', '出生证明'], ['Transcripts', '成绩单'],
  ['Vaccination', '疫苗接种记录'], ['AEAS', 'AEAS'], ['IDAT', 'IDAT'], ['IELTS', '雅思'],
  ['TOEFL', '托福'], ['Award', '获奖证明'], ['SchoolPlanReport', '学校方案报告'],
  ['FinalConfirmedSchoolPlan', '最终确认方案'], ['ParentSignaturePage', '家长签字页'],
  ['SignedContract', '已签署合同'], ['ContractSignatureConfirmationPage', '合同签署确认页'], ['Others', '其他材料'],
];

const STU_OFFER_STATUS = {
  received: '已收到', sent_to_parent: '已发送给家长', signed: '已签署',
  signed_received: '已收到签署文件', cancelled: '已取消', rejected: '已拒绝', expired: '已过期',
};
const STU_CONTRACT_STATUS = {
  Draft: '草稿', Active: '当前有效', Sent: '已发送', ParentSigned: '家长已签署',
  FullyExecuted: '双方签署完成', Revoked: '已撤销链接', Deleted: '已删除', Voided: '已作废',
  Superseded: '已被新合同替代', Cancelled: '已取消', Expired: '已过期',
};
const STU_CONTRACT_TYPES = {
  NewInternationalStudentContract: '新留学生合同',
  TransferApplicationContract: '转学申请合同',
  LocalStudentApplicationContract: '本地生申请合同',
};
const STU_SERVICE_SCOPES = [
  ['study_planning_consulting', '澳洲留学规划咨询'],
  ['school_transfer_planning_and_application', '转学规划与转学申请协调'],
  ['school_information_and_selection_advice', '学校信息介绍与选校建议'],
  ['document_checklist_guidance_and_document_preparation', '申请材料清单指导与材料整理'],
  ['application_process_guidance_and_coordination', '申请流程说明与沟通协调'],
  ['offer_coe_caaw_oshc_process_assistance', '录取文件 / COE / CAAW / OSHC 相关流程协助'],
  ['offer_coe_oshc_process_assistance', '录取文件 / COE / OSHC 相关流程协助'],
  ['offer_enrolment_confirmation_coordination', '录取与入学确认沟通协调'],
  ['visa_document_checklist_guidance', '签证申请材料清单指导'],
  ['visa_application_form_information_assistance', '签证申请表格信息整理协助'],
  ['student_visa_lodgement', '学生签证递交'],
  ['subclass_590_guardian_visa_lodgement', '590 陪读签证递交'],
  ['gs_study_plan_consulting', 'GS / 学习计划相关咨询'],
  ['subclass_590_guardian_visa_consulting', '590 陪读签证相关咨询'],
  ['accommodation_airport_pickup_insurance_prearrival_consulting', '住宿 / 接机 / 保险 / 入学前准备事项咨询'],
];
const STU_PAYMENT_CATEGORIES = ['Service Fee', 'Application Fee', 'Offer Deposit', 'Tuition Fee', 'OSHC', 'Homestay', 'Airport Pickup', 'Refund', 'Other'];
const STU_PAYMENT_METHODS = ['Bank Transfer', 'Alipay', 'WeChat Pay', 'Cash', 'Company Account', 'Personal Account', 'Other'];
const STU_PAYMENT_CURRENCIES = ['AUD', 'CNY', 'USD'];
const STU_CONTRACT_PAYMENT_METHODS = ['支付宝', '微信', '国内银行', '澳洲私户', '澳洲公户'];
const STU_VISA_SECTORS = ['Schools Sector', 'Higher Education', '590 陪读', 'Other'];
const STU_VISA_STATUSES = ['granted', 'active', 'pending', 'refused', 'cancelled', 'expired'];
const STU_VISA_STATUS_LABELS = { granted: '已获签', active: '当前有效', pending: '待审批', refused: '已拒签', cancelled: '已取消', expired: '已过期' };
const STU_VISA_DOCUMENT_TYPES = [
  ['other', 'Other / 其他'], ['grant_letter', 'Grant Letter / 下签信'],
  ['refusal_letter', 'Refusal Letter / 拒签信'], ['s56_request', 'S56 Request / S56 补料信'],
  ['s56_response', 'S56 Response / S56 补料回复'], ['lodgement_receipt', 'Lodgement Receipt / 签证递交收据'],
  ['immi_acknowledgment', 'IMMI Acknowledgment Letter / IMMI 递交确认信'],
  ['bridging_visa', 'Bridging Visa / 过桥签证'], ['health_examination', 'Health Examination / 体检材料'],
  ['hap_id', 'HAP ID / 体检编号'], ['withdrawal_confirmation', 'Withdrawal Confirmation / 撤签确认'],
];
const STU_COE_KINDS = [['COE', 'COE'], ['CAAW', 'CAAW'], ['OSHC', 'OSHC'], ['OSHCReceipt', 'OSHCReceipt'], ['COE_CAAW', 'COE_CAAW'], ['LetterOfConfirmation', 'Letter of Confirmation']];
const STU_HOMESTAY_TYPES = [
  ['HomestayApplication', '寄宿家庭申请'], ['HomestayPlacement', '寄宿家庭安置'],
  ['HomestayAgreement', '寄宿家庭协议'], ['HomestayInvoice', '寄宿家庭账单'],
  ['HomestayPaymentReceipt', '寄宿家庭付款证明'], ['AirportPickupRequest', '接机申请'],
  ['AirportPickupConfirmation', '接机确认'], ['AirportPickupPaymentReceipt', '接机付款证明'],
  ['FlightItinerary', '航班行程单'], ['OtherHomestayAirport', '其他住宿 / 接机材料'],
];
const STU_REMINDER_STATUS = {
  Pending: '待提醒', Due: '当前提醒', Snoozed: '稍后提醒', Completed: '已完成',
  Dismissed: '已忽略', Cancelled: '已取消', Overdue: '已逾期', open: '待提醒',
};
const STU_REMINDER_PRIORITY = { Low: '低', Normal: '普通', High: '高', Urgent: '紧急' };
const STU_REMINDER_TYPES = {
  contract_sent: '签约提醒', offer_expiry: 'Offer 过期提醒', offer_missing_expiry: 'Offer 信息提醒',
  interview: '面试提醒', phone_follow_up: '电话跟进', email_follow_up: '邮件跟进',
  offer_coe_follow_up: '催 Offer + COE', oshc_expiry: 'OSHC 到期提醒',
  oshc_missing_expiry: 'OSHC 信息提醒', visa_expiry: '签证到期', visa_missing_expiry: '签证信息提醒',
  year_transition: '小学升中学提醒', manual: '自定义提醒', next_action: '下一步事项',
  student_followup: '学生跟进留言',
};

const STU_SCHOOLS = [
  ['Northfield College（虚构）', '墨尔本', 'private'],
  ['Westhaven School（虚构）', '悉尼', 'private'],
  ['Eastwood Academy（虚构）', '布里斯班', 'private'],
  ['Harbourview College（虚构）', '珀斯', 'private'],
  ['Southern Coast University（虚构）', '墨尔本', 'private'],
  ['Canberra Grammar（虚构）', '堪培拉', 'private'],
  ['Adelaide High School（虚构）', '阿德莱德', 'public'],
  ['Melbourne Central College（虚构）', '墨尔本', 'public'],
];

function stuAddDays(iso, days) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function stuAu(iso) {
  if (!iso) return '';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[3] + '/' + m[2] + '/' + m[1] : String(iso);
}
function stuIsoFromAu(value) {
  const m = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? m[3] + '-' + m[2] + '-' + m[1] : '';
}
function stuDateTime(iso) {
  if (!iso) return '—';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  return m ? m[3] + '/' + m[2] + '/' + m[1] + ' ' + m[4] + ':' + m[5] : String(iso);
}

const STU_STUDENTS = [
  { id: 'D2026001', name: '林悦宁', english: 'Nina Lin', avatar: '林', lifecycle: 'initial', stage: '申请材料审核', school: '待确认', grade: 'Year 9', intake: '2027 · 2月入学', owner: '陈顾问', updated: '2026-11-08', created_at: '2026-09-18', city: 'Melbourne', email: 'nina.lin@example.test', phone: '0412 000 101', parent_form: 'Pending' },
  { id: 'D2026002', name: '周子涵', english: 'Ethan Zhou', avatar: '周', lifecycle: 'initial', stage: '下offer', school: 'Northfield College（虚构）', grade: 'Year 10', intake: '2027 · 2月入学', owner: '陈顾问', updated: '2026-11-07', created_at: '2026-09-05', city: 'Melbourne', email: 'ethan.zhou@example.test', phone: '0412 000 102', parent_form: 'Submitted' },
  { id: 'D2026003', name: '许安然', english: 'Anna Xu', avatar: '许', lifecycle: 'transfer', stage: '接受OFFER+缴费', school: 'Westhaven School（虚构）', grade: 'Year 11', intake: '2027 · 2月入学', owner: '王顾问', updated: '2026-11-06', created_at: '2026-08-22', city: 'Sydney', email: 'anna.xu@example.test', phone: '0412 000 103', parent_form: 'Submitted' },
  { id: 'D2026004', name: '沈一诺', english: 'Leo Shen', avatar: '沈', lifecycle: 'initial', stage: '制定学校计划', school: '待确认', grade: '本科', intake: '2027 · 2月入学', owner: '陈顾问', updated: '2026-11-05', created_at: '2026-10-02', city: 'Melbourne', email: 'leo.shen@example.test', phone: '0412 000 104', parent_form: 'Submitted' },
  { id: 'D2026005', name: '顾思远', english: 'Ryan Gu', avatar: '顾', lifecycle: 'progression', stage: 'COE已出', school: 'Eastwood Academy（虚构）', grade: 'Year 11', intake: '2027 · 2月入学', owner: '王顾问', updated: '2026-11-05', created_at: '2026-07-14', city: 'Brisbane', email: 'ryan.gu@example.test', phone: '0412 000 105', parent_form: 'Submitted' },
  { id: 'D2026006', name: '宋可欣', english: 'Chloe Song', avatar: '宋', lifecycle: 'initial', stage: '签证审核', school: 'Northfield College（虚构）', grade: 'Year 8', intake: '2027 · 2月入学', owner: '李签证', updated: '2026-11-04', created_at: '2026-06-30', city: 'Melbourne', email: 'chloe.song@example.test', phone: '0412 000 106', parent_form: 'Submitted' },
  { id: 'D2026007', name: '陈沐阳', english: 'Max Chen', avatar: '陈', lifecycle: 'initial', stage: '签证下签或拒签', school: 'Harbourview College（虚构）', grade: 'Year 9', intake: '2026 · 10月入学', owner: '王顾问', updated: '2026-11-03', created_at: '2026-03-12', city: 'Perth', email: 'max.chen@example.test', phone: '0412 000 107', parent_form: 'Submitted' },
  { id: 'D2026008', name: '叶知夏', english: 'Mia Ye', avatar: '叶', lifecycle: 'initial', stage: '签约', school: '待确认', grade: 'Year 7', intake: '2027 · 2月入学', owner: '陈顾问', updated: '2026-11-02', created_at: '2026-10-28', city: 'Sydney', email: 'mia.ye@example.test', phone: '0412 000 108', parent_form: 'Pending' },
  { id: 'D2026009', name: '韩泽宇', english: 'Kevin Han', avatar: '韩', lifecycle: 'transfer', stage: '递交申请', school: '待确认', grade: 'Year 10', intake: '2027 · 4月入学', owner: '王顾问', updated: '2026-11-01', created_at: '2026-08-06', city: 'Adelaide', email: 'kevin.han@example.test', phone: '0412 000 109', parent_form: 'Submitted' },
  { id: 'D2026010', name: '苏念安', english: 'Grace Su', avatar: '苏', lifecycle: 'initial', stage: '面试', school: '待确认', grade: 'Year 11', intake: '2027 · 2月入学', owner: '陈顾问', updated: '2026-10-31', created_at: '2026-09-10', city: 'Canberra', email: 'grace.su@example.test', phone: '0412 000 110', parent_form: 'Submitted' },
  { id: 'D2026011', name: '梁书瑶', english: 'Yuki Liang', avatar: '梁', lifecycle: 'initial', stage: '建档', school: '待确认', grade: 'Year 8', intake: '2027 · 7月入学', owner: '陈顾问', updated: '2026-10-30', created_at: '2026-10-30', city: 'Melbourne', email: 'yuki.liang@example.test', phone: '0412 000 111', parent_form: 'Pending' },
  { id: 'D2026012', name: '唐睿', english: 'Ray Tang', avatar: '唐', lifecycle: 'initial', stage: '签证材料准备', school: 'Northfield College（虚构）', grade: 'Year 10', intake: '2027 · 2月入学', owner: '李签证', updated: '2026-10-29', created_at: '2026-05-19', city: 'Melbourne', email: 'ray.tang@example.test', phone: '0412 000 112', parent_form: 'Submitted' },
  { id: 'D2026013', name: '方以宁', english: 'Cindy Fang', avatar: '方', lifecycle: 'initial', stage: '签证递交', school: 'Westhaven School（虚构）', grade: 'Year 12', intake: '2027 · 2月入学', owner: '李签证', updated: '2026-10-28', created_at: '2026-04-15', city: 'Sydney', email: 'cindy.fang@example.test', phone: '0412 000 113', parent_form: 'Submitted' },
];

STU_STUDENTS.forEach((s) => {
  s.type = (s.grade === '本科' || s.grade === '研究生' || s.grade === '预科+本科') ? '高等教育' : '中小学申请';
  s.stage_index = STU_STAGE_INDEX[s.stage];
  s.final_school = s.school;
  s.offer_course_start = '';
  s.visa_grant_date = '';
});

function stuCityKey(city) {
  const text = String(city || '').toLowerCase();
  const found = STU_CITIES.find((entry) => entry[0] === text || entry[1] === city);
  return found ? found[0] : 'melbourne';
}

function stuMakeProfile(s, i) {
  const parts = String(s.english).split(' ');
  const first = (parts[0] || 'STUDENT').toUpperCase();
  const last = (parts.slice(1).join(' ') || 'STUDENT').toUpperCase();
  const higher = ['本科', '研究生', '预科+本科'].includes(s.grade);
  const gradeNum = Number((String(s.grade).match(/Year (\d+)/) || [])[1] || (higher ? 12 : 9));
  const birthYear = 2026 - gradeNum - 5;
  const motherLast = ['WANG', 'LI', 'ZHANG', 'LIU'][i % 4];
  const motherFirst = ['MEI', 'JING', 'YAN', 'HONG'][i % 4];
  const fatherFirst = ['WEI', 'JUN', 'MING', 'TAO'][i % 4];
  return {
    basic: {
      passport_last_name: last,
      passport_first_name: first,
      english_nickname: parts[0] || '',
      gender: i % 2 === 0 ? '女' : '男',
      date_of_birth: '15/06/' + birthYear,
      current_year_level: String(s.grade).startsWith('Year') ? s.grade : 'Year 12',
      application_stream: higher ? 'higher_education' : 'school_education',
      preferred_intake_year: '2027',
      preferred_intake_term: s.intake.includes('4月') ? '04' : '02',
      applying_year_level: s.grade,
      higher_education_course_type: higher ? 'Bachelor' : '',
      higher_education_package_combination: '',
      preferred_cities: [stuCityKey(s.city)],
      visa_status: '中国护照',
      previous_name: '',
    },
    contact: {
      home_address: '示例路 ' + (100 + i) + ' 号，示例小区 ' + (i + 1) + ' 栋（虚构地址）',
      home_postcode: '2000' + (i % 10),
      australia_address: '',
      australia_postcode: '',
      mobile_phone: s.phone,
      student_email: s.email,
    },
    siblings: {
      has_sibling_under_6: s.id === 'D2026008' ? '是' : '否',
      sibling_1_name: s.id === 'D2026008' ? '叶知秋（虚构）' : '',
      sibling_1_gender: s.id === 'D2026008' ? '男' : '',
      sibling_1_dob: s.id === 'D2026008' ? '15/03/2022' : '',
      sibling_1_school_company: s.id === 'D2026008' ? '示例幼儿园（虚构）' : '',
      sibling_1_year_level: '',
      sibling_2_name: '',
      sibling_2_gender: '',
      sibling_2_dob: '',
      sibling_2_school_company: '',
      sibling_2_year_level: '',
    },
    accommodation: {
      requires_parent_accompaniment: s.id === 'D2026001' ? '不确定' : '否',
      accompanying_person_relationship: s.id === 'D2026001' ? '母亲' : '',
      accommodation_preference: [higher ? '住校' : '寄宿家庭'],
      accept_homestay_with_young_children: '接受',
      homestay_style_preference: '都可以',
      smoke_allergy: '否',
      food_allergy: s.id === 'D2026003' ? '是' : '否',
      food_allergy_notes: s.id === 'D2026003' ? '对花生过敏，需要避免含花生食品。' : '',
      pet_allergy: '否',
      pet_allergy_notes: '',
      medicine_allergy: '否',
      medicine_allergy_notes: '',
      accommodation_notes: higher ? '优先申请学校宿舍，若无名额再安排寄宿家庭。' : '希望住家距离学校 30 分钟车程以内。',
    },
    health: {
      photo_permission: '同意',
      can_swim: '会',
      has_medical_or_psychological_history: s.id === 'D2026007' ? '有' : '无',
      medical_history_notes: s.id === 'D2026007' ? '轻度哮喘，随身携带处方吸入器。' : '',
      requires_long_term_medication: s.id === 'D2026007' ? '有' : '无',
      medication_notes: s.id === 'D2026007' ? '每日使用控制药物，已附医生说明。' : '',
      has_violent_behavior_history: '无',
      has_suspension_or_expulsion_history: '无',
    },
    visa: {
      student_australia_visa_refusal: '无',
      student_visa_refusal_notes: '',
      parents_australia_visa_refusal: '无',
      parents_australia_visa_refusal_person: '',
      father_migration_application_status: '否',
      father_migration_notes: '',
      mother_migration_application_status: '否',
      mother_migration_notes: '',
    },
    study: {
      current_school_name: '示例' + (higher ? '大学附属中学' : '实验学校') + '（虚构）',
      current_school_year_level: String(s.grade).startsWith('Year') ? s.grade : 'Year 12',
      study_history_notes: '近两年成绩稳定，英语与数学表现较好。',
      has_aeas_or_idat: i % 3 === 0 ? '是' : '否',
      aeas_idat_score: i % 3 === 0 ? 'AEAS 68' : '',
      has_ielts_or_toefl: higher ? '是' : '否',
      language_test_notes: higher ? 'IELTS 6.5（单项不低于 6.0）' : '',
      account_username: s.email.split('@')[0],
      account_password: 'Demo#2026',
    },
    father: {
      father_passport_last_name: last,
      father_passport_first_name: fatherFirst,
      father_date_of_birth: '08/09/1980',
      father_mobile: '139 0000 ' + (2000 + i),
      father_email: 'father.' + s.id.toLowerCase() + '@example.test',
      father_employer: '示例科技有限公司（虚构）',
      father_work_address: '示例大道 ' + (20 + i) + ' 号（虚构）',
      father_work_postcode: '1000' + (i % 10),
      father_work_phone: '010-6000 ' + (3000 + i),
      father_position: '部门经理',
      father_marital_status: '已婚',
      father_religion: '无',
      father_highest_school: '示例大学（虚构）',
      father_highest_qualification: '本科',
    },
    mother: {
      mother_passport_last_name: motherLast,
      mother_passport_first_name: motherFirst,
      mother_date_of_birth: '21/11/1982',
      mother_mobile: '139 0000 ' + (4000 + i),
      mother_email: 'mother.' + s.id.toLowerCase() + '@example.test',
      mother_employer: '示例咨询有限公司（虚构）',
      mother_work_address: '示例中心 ' + (8 + i) + ' 层（虚构）',
      mother_work_postcode: '2000' + (i % 10),
      mother_work_phone: '021-6000 ' + (5000 + i),
      mother_position: '财务主管',
      mother_marital_status: '已婚',
      mother_religion: '无',
      mother_highest_school: '示例师范大学（虚构）',
      mother_highest_qualification: '本科',
    },
    emergency: {
      emergency_contact_name: '林女士（虚构）',
      emergency_contact_gender: '女',
      emergency_contact_relationship: '亲属',
      emergency_contact_mobile: '139 0000 ' + (6000 + i),
      emergency_contact_email: 'emergency.' + s.id.toLowerCase() + '@example.test',
      emergency_contact_address: '示例路 ' + (100 + i) + ' 号（虚构）',
    },
    notes: {
      general_notes: '家长希望定期同步申请进度；所有材料通过家长端补充。',
    },
  };
}

function stuRequiredMaterials(s) {
  const higher = ['预科+本科', '本科', '研究生'].includes(s.grade);
  return higher ? ['StudentPassport', 'Transcripts', 'Vaccination'] : ['StudentPassport', 'BirthCertificate', 'Transcripts', 'Vaccination'];
}

function stuMakeDocuments(s, idx, i) {
  const docs = [];
  const add = (type, name, days, status) => docs.push({
    id: 'DOC-' + s.id + '-' + type,
    type, name, version: 'v1',
    uploaded_at: stuAddDays(s.created_at, days),
    status: status || (idx >= 3 ? '已确认' : '待审核'),
  });
  if (idx >= 1) add('StudentPassport', '学生护照.pdf', 2);
  if (idx >= 2) {
    if (s.grade !== '本科' && s.grade !== '研究生' && s.grade !== '预科+本科') add('BirthCertificate', '出生证明.pdf', 3);
    add('Vaccination', '疫苗接种记录.pdf', 4);
    if (idx > 2) add('Transcripts', '最近两年成绩单.pdf', 5);
  }
  if (idx >= 3) {
    add('FatherPassport', '父亲护照.pdf', 6);
    add('MotherPassport', '母亲护照.pdf', 6);
    if (i % 2 === 0) add('AEAS', 'AEAS 成绩单.pdf', 8);
  }
  if (idx >= 6) add('Award', '获奖证明.pdf', 12);
  return docs;
}

function stuMakeOffer(s, idx, i) {
  if (idx < 6) return [];
  const accepted = idx >= 7;
  const school = s.school === '待确认' ? 'Northfield College（虚构）' : s.school;
  const expiry = s.id === 'D2026002' ? '18/11/2026' : s.id === 'D2026013' ? '12/11/2026' : '20/12/2026';
  const offer = {
    id: 'OFF-' + s.id + '-1', school_name: school,
    language_school_name: idx >= 8 ? '' : 'Northfield English Centre（虚构）',
    document_type: 'Offer', offer_date: stuAu(stuAddDays(s.created_at, 40 + i)),
    course_start_date: '28/01/2027', offer_expiry_date: expiry,
    deposit_amount: idx >= 7 ? '5000.00' : '', deposit_currency: 'AUD',
    status: idx === 6 ? 'received' : 'signed_received',
    accepted, file_name: 'Offer_' + school.replace(/[（）]/g, '') + '.pdf',
    uploaded_at: stuAddDays(s.created_at, 41 + i),
  };
  const offers = [offer];
  if (s.id === 'D2026003') {
    offers.push({
      id: 'OFF-' + s.id + '-2', school_name: 'Northfield College（虚构）', language_school_name: '',
      document_type: 'Offer', offer_date: '05/10/2026', course_start_date: '28/01/2027',
      offer_expiry_date: '10/11/2026', deposit_amount: '5000.00', deposit_currency: 'AUD',
      status: 'rejected', accepted: false, file_name: 'Offer_Northfield_Rejected.pdf', uploaded_at: '2026-10-05',
    });
  }
  return offers;
}

function stuMakeCoe(s, idx, i) {
  if (idx < 8) return [];
  const school = s.school === '待确认' ? 'Northfield College（虚构）' : s.school;
  const higher = ['本科', '研究生', '预科+本科'].includes(s.grade);
  const records = [{
    id: 'COE-' + s.id + '-1', kind: 'COE', coe_provider: school,
    coe_course: higher ? 'Bachelor of Business' : 'Secondary School Program',
    coe_start_date: '28/01/2027', coe_end_date: higher ? '15/12/2029' : '15/12/2027',
    file_name: 'COE_' + s.id + '.pdf', uploaded_at: stuAddDays(s.created_at, 80),
  }, {
    id: 'COE-' + s.id + '-2', kind: 'OSHC', oshc_company_name: 'Medibank（虚构）',
    oshc_policy_number: 'OSHC-' + s.id + '-' + (1000 + i),
    oshc_commencement_date: '20/01/2027', oshc_expiry_date: higher ? '15/03/2030' : '15/03/2028',
    file_name: 'OSHC_' + s.id + '.pdf', uploaded_at: stuAddDays(s.created_at, 81),
  }];
  if (!higher) records.push({
    id: 'COE-' + s.id + '-3', kind: 'CAAW', coe_provider: school,
    caaw_welfare_start_date: '20/01/2027', caaw_welfare_end_date: '15/12/2027',
    file_name: 'CAAW_' + s.id + '.pdf', uploaded_at: stuAddDays(s.created_at, 82),
  });
  return records;
}

function stuMakeVisas(s, idx, i) {
  const visas = [];
  if (s.lifecycle === 'transfer') {
    visas.push({
      id: 'VISA-' + s.id + '-existing', visa_type: 'Student Visa Subclass 500', visa_sector: 'Schools Sector',
      document_type: 'grant_letter', visa_grant_date: '10/02/2024', visa_start_date: '15/02/2024',
      visa_expiry_date: '20/01/2027', visa_status: 'active', visa_conditions: '沿用现有签证，转学后需更新学校与 COE。',
      file_name: 'Existing_Visa_' + s.id + '.pdf', existing: true, created_at: '2026-08-22',
    });
  }
  if (idx >= 10 && idx < 12) {
    visas.push({
      id: 'VISA-' + s.id + '-current', visa_type: 'Student Visa Subclass 500', visa_sector: 'Schools Sector',
      document_type: idx === 10 ? 's56_request' : 'lodgement_receipt',
      visa_grant_date: '', visa_start_date: '', visa_expiry_date: '', visa_status: 'pending',
      visa_conditions: idx === 10 ? '收到 S56 补件要求：需补充资金证明与 GS 说明。' : '签证已递交，等待移民局审理。',
      file_name: (idx === 10 ? 'S56_Request_' : 'Visa_Lodgement_') + s.id + '.pdf',
      existing: false, created_at: stuAddDays(s.created_at, 95),
    });
  }
  if (idx >= 12) {
    visas.push({
      id: 'VISA-' + s.id + '-current', visa_type: 'Student Visa Subclass 500', visa_sector: 'Schools Sector',
      document_type: 'grant_letter', visa_grant_date: '28/10/2026', visa_start_date: '01/11/2026',
      visa_expiry_date: '15/03/2030', visa_status: 'granted', visa_conditions: '8202 学习进度要求；8533 保持入学注册。',
      file_name: 'Visa_Grant_' + s.id + '.pdf', existing: false, created_at: '2026-10-28',
    });
  }
  return visas;
}

function stuMakePayments(s, idx, i) {
  const rows = [];
  if (idx >= 7) rows.push({
    id: 'PAY-' + s.id + '-1', category: 'Offer Deposit', amount: '5000.00', currency: 'AUD',
    paid_date: stuAu(stuAddDays(s.created_at, 55 + i)), method: 'Bank Transfer',
    payer_name: '家长（虚构）', receiver_name: s.school === '待确认' ? 'Northfield College（虚构）' : s.school,
    transfer_confirmed: s.lifecycle === 'transfer' ? '已确认' : '', proof: 'Offer_Deposit_Receipt.pdf',
  });
  if (idx >= 8) rows.push({
    id: 'PAY-' + s.id + '-2', category: 'OSHC', amount: '680.00', currency: 'AUD',
    paid_date: stuAu(stuAddDays(s.created_at, 70 + i)), method: 'Company Account',
    payer_name: 'AAIE（虚构）', receiver_name: 'Medibank（虚构）',
    transfer_confirmed: '', proof: 'OSHC_Receipt.pdf',
  });
  if (idx >= 9) rows.push({
    id: 'PAY-' + s.id + '-3', category: 'Service Fee', amount: '2400.00', currency: 'CNY',
    paid_date: stuAu(stuAddDays(s.created_at, 20 + i)), method: 'Alipay',
    payer_name: '家长（虚构）', receiver_name: 'AAIE（虚构）', transfer_confirmed: '', proof: 'Service_Fee_Receipt.pdf',
  });
  if (idx >= 12) rows.push({
    id: 'PAY-' + s.id + '-4', category: 'Tuition Fee', amount: '18500.00', currency: 'AUD',
    paid_date: '25/10/2026', method: 'Bank Transfer', payer_name: '家长（虚构）',
    receiver_name: s.school, transfer_confirmed: '', proof: 'Tuition_Receipt.pdf',
  });
  return rows;
}

function stuMakeContracts(s, idx, i) {
  if (idx < 1) return [];
  const type = s.lifecycle === 'transfer' ? 'TransferApplicationContract' : s.lifecycle === 'progression' ? 'LocalStudentApplicationContract' : 'NewInternationalStudentContract';
  const status = idx === 1 ? 'Sent' : 'FullyExecuted';
  return [{
    id: 'CON-' + s.id + '-1', contract_type: type, status, version: 'v1',
    service_scopes: s.lifecycle === 'transfer'
      ? ['school_transfer_planning_and_application', 'school_information_and_selection_advice', 'document_checklist_guidance_and_document_preparation', 'application_process_guidance_and_coordination', 'offer_coe_caaw_oshc_process_assistance']
      : ['study_planning_consulting', 'school_information_and_selection_advice', 'document_checklist_guidance_and_document_preparation', 'application_process_guidance_and_coordination', 'student_visa_lodgement'],
    fee: '2400.00', discount: '0.00', payment_method: i % 2 === 0 ? '支付宝' : '微信',
    file_name: (type === 'TransferApplicationContract' ? 'Transfer' : type === 'LocalStudentApplicationContract' ? 'Local' : 'Study') + '_Contract_' + s.id + '.pdf',
    created_at: stuAddDays(s.created_at, 6), signed_at: idx >= 2 ? stuAddDays(s.created_at, 10) : '',
  }];
}

function stuMakePlans(s, idx, i) {
  if (idx < 3) return [];
  const school = s.school === '待确认' ? 'Northfield College（虚构）' : s.school;
  const publicPlan = s.id === 'D2026002';
  const sector = publicPlan ? 'public' : 'private';
  const second = publicPlan ? 'Melbourne Central College（虚构）' : (school === 'Westhaven School（虚构）' ? 'Northfield College（虚构）' : 'Westhaven School（虚构）');
  const confirmed = idx >= 4;
  const report = {
    id: 'PLAN-' + s.id + '-1', city: s.city, sector, version: idx >= 5 ? 2 : 1,
    status: confirmed ? 'confirmed' : 'draft', updated_at: stuAddDays(s.created_at, 30 + i),
    is_current: true, report_title: '学校方案报告',
    confirmed_schools: confirmed ? [{
      id: 'PLANSCH-' + s.id + '-1', school_name: school,
      decision_mode: publicPlan ? 'ranked' : 'selected', rank_order: 1,
      submission_status: 'submitted', submitted_at: stuAddDays(s.created_at, 36 + i), submitted_by_name: '家长（虚构）',
      result_status: idx >= 6 ? 'offer_received' : 'pending', is_offer_accepted: idx >= 7,
      is_offer_received: idx >= 6, is_final_school: idx >= 7 || school === 'Harbourview College（虚构）',
      result_note: '', result_at: idx >= 6 ? stuAddDays(s.created_at, 45 + i) : '', result_by_name: idx >= 6 ? '陈顾问' : '',
    }, {
      id: 'PLANSCH-' + s.id + '-2', school_name: second,
      decision_mode: publicPlan ? 'ranked' : 'selected', rank_order: 2,
      submission_status: idx >= 4 ? 'submitted' : 'unsubmitted', submitted_at: idx >= 4 ? stuAddDays(s.created_at, 36 + i) : '', submitted_by_name: idx >= 4 ? '家长（虚构）' : '',
      result_status: 'pending', is_offer_accepted: false, is_offer_received: false,
      is_final_school: false, result_note: '', result_at: '', result_by_name: '',
    }] : [],
  };
  const plans = [report];
  if (s.id === 'D2026003' || s.id === 'D2026007') {
    plans.push({
      id: 'PLAN-' + s.id + '-0', city: s.city, sector, version: 1, status: 'superseded',
      updated_at: stuAddDays(s.created_at, 12), is_current: false, report_title: '学校方案报告',
      confirmed_schools: [],
    });
  }
  return plans;
}

function stuMakeHomestay(s, idx, i) {
  const docs = [];
  const add = (type, days) => docs.push({
    id: 'HOM-' + s.id + '-' + type, type,
    name: (STU_HOMESTAY_TYPES.find((x) => x[0] === type) || [type, type])[1] + '_' + s.id + '.pdf',
    uploaded_at: stuAddDays(s.created_at, days), status: idx >= 6 ? '已确认' : '待审核',
  });
  if (idx >= 4) add('HomestayApplication', 25);
  if (idx >= 6) add('HomestayPlacement', 50);
  if (idx >= 7) add('HomestayAgreement', 55);
  if (idx >= 8) add('FlightItinerary', 75);
  if (idx >= 9) add('AirportPickupConfirmation', 80);
  if (s.lifecycle === 'transfer' && idx >= 7) add('AirportPickupRequest', 60);
  return docs;
}

function stuMakeHistory(s, idx) {
  const rows = [];
  const push = (days, section, field, before, after, user) => rows.push({
    id: 'LOG-' + s.id + '-' + rows.length, changed_at: stuAddDays(s.created_at, days) + 'T09:30:00',
    user: user || s.owner, section, field, before, after,
  });
  push(0, '学生基本信息', '建档', '', s.name + ' · ' + s.id);
  if (idx >= 1) push(7, '合同', '合同状态', '草稿', '已发送');
  if (idx >= 2) push(14, '申请材料', '学生护照', '未上传', '已上传');
  if (idx >= 2) push(18, '联系方式与地址', '学生手机号', '未记录', s.phone);
  if (idx >= 3) push(30, '申请材料', '材料审核', '待审核', '已完成', '陈顾问');
  if (idx >= 3) push(32, '学校方案', '方案版本', '—', 'v1');
  if (idx >= 4) push(38, '学校方案', '递交状态', '未递交', '已递交');
  if (idx >= 6) push(45, '录取通知', 'Offer 状态', '—', '已收到');
  if (idx >= 7) push(55, '付款', 'Offer 定金', '—', 'AUD 5,000.00');
  if (idx >= 8) push(80, '入学确认与学生保险', 'COE', '未上传', '已确认');
  if (idx >= 10) push(95, '签证', '签证状态', '未建立', '待审批');
  if (idx >= 12) push(110, '签证', '签证状态', '待审批', '已获签');
  return rows.sort((a, b) => b.changed_at.localeCompare(a.changed_at));
}

function stuMakeReminders(s, idx, i) {
  const due = stuAddDays('2026-11-08', -(idx % 3)) + 'T' + (10 + (i % 6)).toString().padStart(2, '0') + ':00:00';
  const notes = [{
    id: 'NOTE-' + s.id + '-1',
    description: idx >= 8 ? '跟进签证结果并核对下签日期。' : idx >= 6 ? '联系家长确认 Offer 接受与押金安排。' : '跟进家长补充申请材料。',
    reminder_at: due,
    recipient_name: s.owner,
    status: idx <= 2 ? 'Overdue' : 'Pending',
    priority: idx <= 2 ? 'High' : 'Normal',
    source_type: 'manual',
    created_by: s.owner,
    creator_name: s.owner,
    created_at: stuAddDays(s.created_at, 20),
  }];
  notes.push({
    id: 'NOTE-' + s.id + '-2',
    description: '已向家长说明当前申请进度与下一步安排。',
    reminder_at: stuAddDays(s.created_at, 15) + 'T15:00:00',
    recipient_name: s.owner, status: 'Completed', priority: 'Normal',
    source_type: 'student_followup', created_by: s.owner, creator_name: s.owner,
    created_at: stuAddDays(s.created_at, 15),
  });
  const other = [];
  if (idx >= 1) other.push({
    id: 'REM-' + s.id + '-1', type: 'contract_sent', type_label: STU_REMINDER_TYPES.contract_sent,
    reminder_at: stuAddDays(s.created_at, 10) + 'T09:00:00', status: idx >= 2 ? 'Completed' : 'Pending',
    priority: 'Normal', owner: s.owner,
  });
  if (idx >= 6) other.push({
    id: 'REM-' + s.id + '-2', type: 'offer_expiry', type_label: STU_REMINDER_TYPES.offer_expiry,
    reminder_at: '2026-11-15T09:00:00', status: idx >= 7 ? 'Completed' : 'Pending',
    priority: idx >= 7 ? 'Normal' : 'High', owner: s.owner,
  });
  if (idx >= 9) other.push({
    id: 'REM-' + s.id + '-3', type: 'visa_expiry', type_label: STU_REMINDER_TYPES.visa_expiry,
    reminder_at: '2029-12-01T09:00:00', status: 'Pending', priority: 'Low', owner: s.owner,
  });
  return { notes, other };
}

function stuMakeRevenue(s, i) {
  const rows = [];
  const stream = ['本科', '研究生', '预科+本科'].includes(s.grade) ? 'higher_education' : 'school_education';
  if (s.lifecycle === 'transfer' || s.lifecycle === 'progression') {
    rows.push({
      case_uid: 'REV-2024-' + String(200 + i), application_cycle_id: 80 + i,
      cycle_type: 'initial', education_stream: stream, cycle_status: 'completed',
      case_status: '已关闭', updated_at: '2025-12-10T10:00:00', href: '#revenue/cases',
    });
  }
  rows.push({
    case_uid: 'REV-2026-' + String(300 + i), application_cycle_id: 100 + i,
    cycle_type: s.lifecycle, education_stream: stream, cycle_status: 'active',
    case_status: '进行中', updated_at: s.updated + 'T16:20:00', href: '#revenue/cases',
  });
  return rows;
}

function stuDayDiff(fromIso, toIso) {
  return Math.round((new Date(toIso + 'T00:00:00') - new Date(fromIso + 'T00:00:00')) / 86400000);
}

function stuBuildAlerts(s, detail) {
  const idx = s.stage_index;
  const alerts = [];
  const required = stuRequiredMaterials(s);
  const counts = {};
  detail.documents.forEach((d) => { counts[d.type] = (counts[d.type] || 0) + 1; });
  const missing = required.filter((type) => !counts[type]);
  if (!detail.parent_form_submitted) alerts.push({ key: 'waiting', label: '等待家长', level: 'waiting', tab: 'applications' });
  if (missing.length && idx >= 2) alerts.push({ key: 'missing_docs', label: '缺材料', level: 'risk', tab: 'applications' });
  if (detail.parent_form_submitted && !detail.materials_checked) alerts.push({ key: 'materials_pending', label: '材料待审核', level: 'risk', tab: 'applications' });
  if (idx >= 2 && !detail.plans.length) alerts.push({ key: 'missing_school_plan', label: '未制作学校方案', level: 'waiting', tab: 'school_plans' });
  const offer = detail.offers.find((o) => !o.accepted && o.status !== 'rejected' && o.status !== 'cancelled');
  if (offer && offer.offer_expiry_date) {
    const expiry = stuIsoFromAu(offer.offer_expiry_date);
    if (expiry && stuDayDiff('2026-11-08', expiry) >= 0 && stuDayDiff('2026-11-08', expiry) <= 30) {
      alerts.push({ key: 'offer_expiring', label: 'Offer即将过期', level: 'risk', tab: 'offer' });
    }
  }
  const visa = detail.visas.find((v) => ['active', 'granted'].includes(v.visa_status) && v.visa_expiry_date);
  if (visa) {
    const expiry = stuIsoFromAu(visa.visa_expiry_date);
    if (expiry && stuDayDiff('2026-11-08', expiry) <= 90) {
      alerts.push({ key: 'visa_expiring', label: '签证即将到期', level: 'risk', tab: 'visa' });
    }
  }
  return alerts;
}

function stuBuildDetail(s, i) {
  const idx = s.stage_index;
  const profile = stuMakeProfile(s, i);
  const documents = stuMakeDocuments(s, idx, i);
  const offers = stuMakeOffer(s, idx, i);
  const coe = stuMakeCoe(s, idx, i);
  const visas = stuMakeVisas(s, idx, i);
  const payments = stuMakePayments(s, idx, i);
  const contracts = stuMakeContracts(s, idx, i);
  const plans = stuMakePlans(s, idx, i);
  const homestay = stuMakeHomestay(s, idx, i);
  const history = stuMakeHistory(s, idx);
  const reminderData = stuMakeReminders(s, idx, i);
  const revenue = stuMakeRevenue(s, i);
  const detail = {
    student_id: s.id,
    profile,
    documents,
    parent_form_submitted: s.parent_form !== 'Pending',
    materials_checked: idx >= 3,
    materials_checked_at: idx >= 3 ? stuAddDays(s.created_at, 30) + 'T16:00:00' : '',
    materials_checker_name: idx >= 3 ? '陈顾问' : '',
    offers,
    coe,
    visas,
    payments,
    contracts,
    plans,
    homestay,
    history,
    notes: reminderData.notes,
    other_reminders: reminderData.other,
    revenue,
    docx: {
      file_name: 'StudentInfo_' + s.id + '.docx',
      updated_at: stuAddDays(s.created_at, 1),
      option: 'keep',
    },
    storage_status: i % 5 === 0 ? '部分文件待归档' : '正常',
  };
  detail.alerts = stuBuildAlerts(s, detail);
  s.alerts = detail.alerts;
  s.offer_course_start = offers[0] ? offers[0].course_start_date : '';
  s.visa_grant_date = (visas.find((v) => v.visa_status === 'granted') || {}).visa_grant_date || '';
  s.final_school = plans.flatMap((p) => p.confirmed_schools).find((x) => x.is_final_school)?.school_name || (contracts.length ? '' : '') || '待确认';
  if (s.final_school === '待确认' && s.school !== '待确认') s.final_school = s.school;
  return detail;
}

const STU_DETAILS = {};
STU_STUDENTS.forEach((s, i) => { STU_DETAILS[s.id] = stuBuildDetail(s, i); });
STU_STUDENTS.forEach((s) => {
  s.school = s.stage_index >= 7 ? s.final_school : (s.final_school === '待确认' ? '待确认' : s.final_school);
  if (s.stage_index < 7) s.school = s.final_school === '待确认' ? '待确认' : s.final_school;
  if (s.final_school === '待确认') s.school = '待确认';
});

DEMO.students = STU_STUDENTS;

const STU_PARENT_LINKS_SEED = [
  { id: 'LINK-2026-001', student: 'D2026001', type: '学生资料', status: 'Pending', expires: '2026-11-20', visits: 0 },
  { id: 'LINK-2026-002', student: 'D2026008', type: '学生资料', status: 'Pending', expires: '2026-11-18', visits: 1 },
  { id: 'LINK-2026-003', student: 'D2026011', type: '学生资料', status: 'Pending', expires: '2026-11-25', visits: 0 },
];
const STU_DELETED_SEED = [{
  student: {
    id: 'D2025099', name: '样例学生（已删除）', english: 'Sample Student', avatar: '样',
    lifecycle: 'initial', stage: '建档', school: '待确认', grade: 'Year 9', intake: '2027 · 2月入学',
    owner: '陈顾问', updated: '2025-12-01', created_at: '2025-11-20', city: 'Melbourne',
    email: 'deleted.sample@example.test', phone: '0412 000 099', type: '中小学申请', stage_index: 0,
    final_school: '待确认', offer_course_start: '', visa_grant_date: '', alerts: [],
  },
  deleted_at: '2025-12-02T10:15:00', deleted_by: '管理员',
}];
