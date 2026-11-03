/* All records are fictitious. Nothing in this prototype connects to CRM. */
'use strict';
const DEMO = {
 students: [
  {id:'D2026001',name:'林悦宁',english:'Nina Lin',avatar:'林',type:'中小学申请',stage:'材料准备',school:'待确认',grade:'Year 9',intake:'2027 · Term 1',owner:'陈顾问',updated:'04/11/2026',city:'Melbourne',email:'nina@example.test'},
  {id:'D2026002',name:'周子涵',english:'Ethan Zhou',avatar:'周',type:'中小学申请',stage:'等待 Offer',school:'Northfield College（虚构）',grade:'Year 10',intake:'2027 · Term 1',owner:'陈顾问',updated:'04/11/2026',city:'Melbourne',email:'ethan@example.test'},
  {id:'D2026003',name:'许安然',english:'Anna Xu',avatar:'许',type:'转学',stage:'Offer 待确认',school:'Westhaven School（虚构）',grade:'Year 11',intake:'2027 · Term 1',owner:'王顾问',updated:'03/11/2026',city:'Sydney',email:'anna@example.test'},
  {id:'D2026004',name:'沈一诺',english:'Leo Shen',avatar:'沈',type:'高等教育',stage:'方案待确认',school:'Southern Coast University（虚构）',grade:'本科',intake:'2027 · Semester 1',owner:'陈顾问',updated:'03/11/2026',city:'Melbourne',email:'leo@example.test'},
  {id:'D2026005',name:'顾思远',english:'Ryan Gu',avatar:'顾',type:'升学',stage:'等待 COE',school:'Eastwood Academy（虚构）',grade:'Year 11',intake:'2027 · Term 1',owner:'王顾问',updated:'02/11/2026',city:'Brisbane',email:'ryan@example.test'},
  {id:'D2026006',name:'宋可欣',english:'Chloe Song',avatar:'宋',type:'中小学申请',stage:'签证办理',school:'Northfield College（虚构）',grade:'Year 8',intake:'2027 · Term 1',owner:'李签证',updated:'02/11/2026',city:'Melbourne',email:'chloe@example.test'},
  {id:'D2026007',name:'陈沐阳',english:'Max Chen',avatar:'陈',type:'中小学申请',stage:'已完成',school:'Harbourview College（虚构）',grade:'Year 9',intake:'2026 · Term 4',owner:'王顾问',updated:'01/11/2026',city:'Perth',email:'max@example.test'},
  {id:'D2026008',name:'叶知夏',english:'Mia Ye',avatar:'叶',type:'中小学申请',stage:'合同待签',school:'待确认',grade:'Year 7',intake:'2027 · Term 1',owner:'陈顾问',updated:'01/11/2026',city:'Sydney',email:'mia@example.test'}
 ],
 tasks:[
  {id:'T1',title:'审核林悦宁的成绩单',student:'林悦宁',type:'材料审核',due:'已逾期 1 天',priority:'逾期',href:'student/D2026001/materials',done:false},
  {id:'T2',title:'确认许安然的 Offer 与付款要求',student:'许安然',type:'Offer 确认',due:'今天 · 14:00',priority:'今日',href:'student/D2026003/offers',done:false},
  {id:'T3',title:'跟进宋可欣的 S56 补件',student:'宋可欣',type:'签证补件',due:'今天 · 17:00',priority:'今日',href:'visa/s56',done:false},
  {id:'T4',title:'联系家长确认升学方案',student:'顾思远',type:'家长协作',due:'明天 · 10:00',priority:'即将到期',href:'student/D2026005/plans',done:false},
  {id:'T5',title:'核对本期佣金申领证据',student:'周子涵',type:'财务审核',due:'06/11/2026',priority:'即将到期',href:'revenue/direct',done:false}
 ],
 documents: [
  {id:'DOC1',student:'D2026001',name:'护照.pdf',type:'护照',required:'必需',status:'已确认',date:'02/11/2026',version:'v1'},
  {id:'DOC2',student:'D2026001',name:'最近两年成绩单.pdf',type:'成绩单',required:'必需',status:'待审核',date:'03/11/2026',version:'v2'},
  {id:'DOC3',student:'D2026001',name:'在读证明',type:'在读证明',required:'必需',status:'待补充',date:'—',version:'—'}
 ],
 timeline:[{title:'家长补充了成绩单',detail:'林悦宁 · 材料等待审核',time:'今天 09:42'},{title:'已生成学校方案第 2 版',detail:'顾思远 · 等待家长确认',time:'今天 09:10'},{title:'记录新的签证补件要求',detail:'宋可欣 · 截止 06/11/2026',time:'昨天 16:30'}],
 notes:[], audit:[]
};
const NAV = [
 {label:'日常工作',items:[['dashboard','工作台','grid'],['students','学生管理','users'],['reminders','提醒中心','bell']]},
 {label:'学生与申请',items:[['transfer','转学办理','shuffle'],['progression','升学办理','trend'],['higher','高等教育','cap'],['visa','签证管理','passport'],['parent','家长协作','link']]},
 {label:'资源与财务',items:[['schools','学校资源','school'],['plans','学校方案报告','file'],['contracts','合同管理','pen'],['templates','模板管理','layers'],['revenue','收入与佣金','wallet']]},
 {label:'运营与管理',items:[['content','内容运营','edit'],['reach','Agent Reach','radar'],['files','文件管理','folder'],['updates','数据更新','refresh'],['reports','数据报表','chart'],['system','系统管理','settings']]}
];
function table(title,description,columns,rows,action='新建记录',fields=null) {
 return {title,description,columns,rows:rows.map((r,i)=>({id:'R'+(i+1),...Object.fromEntries(columns.map((c,j)=>[c,r[j]??'—']))})),action,fields:fields||columns.filter(c=>!['最近更新','操作','版本','访问次数'].includes(c))};
}
const PAGES = {
 transfer:{title:'转学办理',desc:'当前学校、目标学校与办理条件，在同一个工作区衔接。',tabs:{
  cases:table('转学记录','每次转学独立记录，保留原学校与历史申请。',['学生','原学校','目标学校','当前阶段','负责人','状态'],[['许安然','Harbourview College（虚构）','Westhaven School（虚构）','Offer 与付款','王顾问','进行中'],['陈沐阳','Northfield College（虚构）','待选择','准备材料','陈顾问','草稿']],'新建转学'),
  arrangements:table('转学安排','分别核对签证、保险、监护、住宿和学校转换日期。',['学生','安排事项','要求','证据','状态'],[['许安然','签证','更新学校与 COE','待补充','待处理'],['许安然','OSHC','校验现有保单与有效期','保单待审核','待审核'],['许安然','监护与住宿','确认目标学校安排','住宿安排.pdf','已确认']],'添加安排'),
  history:table('转学历史','保留已结束记录及关闭原因。',['学生','业务编号','原学校','目标学校','生效日期','状态'],[['陈沐阳','TR-DEMO-01','Eastwood Academy（虚构）','Harbourview College（虚构）','12/10/2026','已完成']],null)
 }},
 progression:{title:'升学办理',desc:'围绕最终学校、升学材料和入学衔接，逐项核对完成条件。',tabs:{
  cases:table('升学记录','选择记录可查看办理步骤与完成条件。',['学生','当前年级','目标阶段','最终学校','当前阶段','状态'],[['顾思远','Year 10','Year 11','Eastwood Academy（虚构）','COE 与保险','进行中']],'新建升学'),
  paths:table('升学路径','多目标申请可以并行，最终目标与阶段明确区分。',['学生','路径阶段','目标学校','最终目标','Offer','状态'],[['顾思远','高中','Eastwood Academy（虚构）','是','已接受','进行中'],['沈一诺','预科 → 本科','Southern Coast University（虚构）','待确认','未收到','准备中']],'添加路径'),
  history:table('升学历史','保存原就读学校、完成与关闭记录。',['学生','业务编号','目标阶段','生效日期','状态'],[['陈沐阳','PR-DEMO-01','Year 9','12/10/2026','已归档']],null)
 }},
 higher:{title:'高等教育申请',desc:'按学生申请周期管理大学、路径、课程、Offer 和 COE。',tabs:{
  plans:table('高等教育方案','大学与课程可使用不同路径；高教流程不强制要求服务合同。',['学生','大学','升学路径','课程','入学期','状态'],[['沈一诺','Southern Coast University（虚构）','预科 → 本科','Bachelor of Business','2027 · Semester 1','待确认']],'新建高教方案'),
  applications:table('大学申请','家长确认方案后，单独记录正式申请递交。',['学生','大学','课程','递交日期','负责人','状态'],[['沈一诺','Southern Coast University（虚构）','Bachelor of Business','—','陈顾问','待递交']],'记录申请'),
  offers:table('高教 Offer 与 COE','记录有条件录取、接受状态和课程分段的 COE。',['学生','大学','课程阶段','Offer','COE','状态'],[['沈一诺','Southern Coast University（虚构）','预科','待收到','待补充','准备中']],'记录 Offer')
 }},
 schools:{title:'学校资源',desc:'统一查找中小学与大学，为方案提供清晰的学校和课程资料。',tabs:{
  list:table('中小学学校库','支持城市、学校性质、排名、特色、费用和招生资料检索。',['学校名称','城市','性质','年级范围','特色','状态'],[['Northfield College（虚构）','Melbourne','私立','Year 7–12','STEM · 音乐','有效'],['Westhaven School（虚构）','Sydney','公立','Year 7–12','体育 · 语言支持','有效'],['Eastwood Academy（虚构）','Brisbane','私立','Year 5–12','艺术 · 科学','有效'],['Harbourview College（虚构）','Perth','私立','Year 7–12','国际教育','有效']],'新增学校'),
  universities:table('大学目录','院校、路径组合、课程库与合作机构分别维护。',['大学名称','州','城市','路径','课程','状态'],[['Southern Coast University（虚构）','VIC','Melbourne','预科 → 本科','Business · Science','有效'],['Western Bay University（虚构）','WA','Perth','直入本科','Arts · Engineering','有效']],'新增大学'),
  courses:table('课程与路径','维护不同课程层级、衔接段和课程专业资料。',['大学','路径名称','课程名称','课程层级','合作机构','状态'],[['Southern Coast University（虚构）','预科 → 本科','Bachelor of Business','本科','Southern Pathway College（虚构）','有效']],'添加课程'),
  map:table('学校位置','离线原型使用示意图；真实地图与坐标加载需正式服务。',['学校名称','城市','区域','通勤说明','状态'],[['Northfield College（虚构）','Melbourne','Eastern suburbs','以实际地址核验为准','待核验'],['Westhaven School（虚构）','Sydney','North district','以实际地址核验为准','待核验']],null)
 }},
 plans:{title:'学校方案报告',desc:'从学校选择到家长确认、正式递交与版本归档，每一步都有记录。',tabs:{
  list:table('方案报告','家长确认仅代表选择方案，正式递交单独执行。',['学生','方案名称','版本','学校数量','家长确认','状态'],[['林悦宁','2027 墨尔本中学方案','v2','3','待确认','已发送'],['顾思远','2027 高中升学方案','v2','2','已确认','待递交']],'制作学校方案'),
  submissions:table('递交跟踪','区分公立申请组与私立学校的递交记录。',['学生','学校 / 申请组','学校性质','递交日期','结果','状态'],[['周子涵','Northfield College（虚构）','私立','28/10/2026','待回复','已递交'],['林悦宁','VIC 公立申请组（示例）','公立','—','待递交','准备中']],'记录递交'),
  versions:table('报告版本与访问','保留历史 A4 报告、替换关系及家长访问记录。',['学生','版本','替换关系','访问次数','家长确认','状态'],[['林悦宁','v1','已由 v2 替换','2','未确认','已归档'],['林悦宁','v2','当前版本','1','待确认','有效']],null)
 }},
 visa:{title:'签证管理',desc:'案件、申请人、信息采集和补件期限集中跟进。',tabs:{
  cases:table('签证案件','500 学生签证与 590 监护人签证分开建案。',['学生','签证类别','申请人','目标递交','负责人','状态'],[['宋可欣','500 学生签证','宋可欣','06/11/2026','李签证','补件中'],['林悦宁','590 监护人签证','家长（示例）','20/11/2026','李签证','准备中']],'建立签证案件'),
  collection:table('信息采集与表格','明确填写人、表格进度与审核状态。',['学生','填写人','表格','完成度','负责人','状态'],[['宋可欣','学生本人','学生签证信息表','100%','李签证','已提交'],['林悦宁','母亲（示例）','监护人信息表','45%','李签证','填写中']],'发起信息采集'),
  evidence:table('材料与资金证据','关联案件材料、证据说明和审核结论。',['学生','材料类型','文件','要求','说明','状态'],[['宋可欣','资金证明','银行存款证明.pdf','必需','来源说明待完善','待审核'],['宋可欣','COE','COE.pdf','必需','已关联当前案件','已确认']],'关联材料'),
  s56:table('S56 补件与期限','期限集中展示，保留递交与结果记录。',['学生','补件事项','截止日期','负责人','递交日期','状态'],[['宋可欣','补充资金来源说明','06/11/2026','李签证','—','待处理']],'添加补件要求'),
  decisions:table('签证结果','录入获签、拒签和有效期，保留原始结果证据。',['学生','签证类别','结果日期','到期日期','结果文件','状态'],[['陈沐阳','500 学生签证','15/09/2026','15/03/2030','Grant notice.pdf','已获签']],'记录签证结果')
 }},
 contracts:{title:'合同管理',desc:'按学生和申请周期管理合同草稿、签署证据及不可变历史。',tabs:{
  list:table('学生服务合同','创建前选择学生与服务范围，正式生成使用已发布模板。',['学生','合同编号','合同类型','服务费','签署进度','状态'],[['叶知夏','CT-DEMO-008','学校申请服务','AUD 2,200','待家长签署','待签署'],['许安然','CT-DEMO-003','转学服务','AUD 1,200','双方已签署','已完成'],['林悦宁','CT-DEMO-001','学校申请服务','AUD 2,200','草稿','草稿']],'创建合同'),
  signing:table('签署与归档','家长签署、公司签章、最终 PDF 和附件归档分开显示。',['学生','合同编号','家长签署','公司签章','最终 PDF','状态'],[['叶知夏','CT-DEMO-008','待签署','待处理','未生成','待处理'],['许安然','CT-DEMO-003','已签署','已完成','已归档','已完成']],null),
  history:table('合同历史与修订','修订产生新版本，保留旧签署证据。',['学生','合同编号','版本','变更原因','状态'],[['许安然','CT-DEMO-003','v1','首次签署','已归档']],null)
 }},
 templates:{title:'模板管理',desc:'区分可编辑草稿、已发布版本与历史，避免覆盖已使用模板。',tabs:{
  contracts:table('合同模板','模板编辑、字段绑定、预览和发布分别操作。',['模板名称','适用业务','版本','最近更新','状态'],[['学校申请服务协议','中小学申请','v3','02/11/2026','已发布'],['转学服务协议','转学','v2','01/11/2026','草稿']],'新增模板'),
  reports:table('报告与文档模板','维护报告版式、学校资料绑定与输出预览。',['模板名称','适用业务','版本','说明','状态'],[['A4 学校方案','学校方案报告','v2','学校资料与排序','已发布']],'新增文档模板')
 }},
 revenue:{title:'收入与佣金',desc:'以学生业务周期为线索，连接收费、入学事实、佣金、收款与对账。',tabs:{
  cases:table('收费与佣金档案','客户收费与学校佣金分别展示，不混合计算。',['学生','业务类型','学校','客户应收','佣金状态','状态'],[['许安然','转学','Westhaven School（虚构）','AUD 0','待确认入学','进行中'],['周子涵','中小学申请','Northfield College（虚构）','AUD 1,100','可申领','进行中']],'建立收费档案'),
  billing:table('客户收费','明确基础费、折扣、GST、已收和未收款。',['学生','收费项目','基础费','GST','已收款','状态'],[['周子涵','学校申请服务','AUD 2,000','AUD 200','AUD 1,100','待收款'],['许安然','转学服务','AUD 1,090.91','AUD 109.09','AUD 1,200','已收清']],'记录客户收款'),
  direct:table('直接佣金','申领前确认实际入学、学费及有效佣金规则；支持调整和追回。',['学生','院校','佣金金额','实际入学','学费证据','状态'],[['周子涵','Northfield College（虚构）','AUD 2,400','已确认','已确认','可申领'],['许安然','Westhaven School（虚构）','AUD 1,800','待确认','待补充','预测中']],'登记佣金'),
  master:table('一级代理','保留对账单、匹配建议、管理员确认和争议。',['对账单','学生','总佣金','AAIE 分成','匹配说明','状态'],[['STMT-DEMO-11','周子涵','AUD 3,000','AUD 2,400','按学生与课程匹配','待审核']],'导入对账单'),
  rules:table('佣金合同与规则','合同版本、生效日期及学校/机构规则分别可追溯。',['合作方','合同类型','版本','生效日期','佣金规则','状态'],[['Northfield College（虚构）','直接合作','v2','01/01/2026','按合同及学费事实计算','有效']],'登记佣金合同'),
  reconciliation:table('对账与异常','跟进未匹配流水、未分配收款、争议和异常。',['事项','参考编号','学生','金额','说明','状态'],[['未匹配流水','TX-DEMO-11','待识别','AUD 600','需核对付款参考','待处理']],'添加对账事项'),
  receipts:table('收款、收据与历史发票','付款证据与收据关联；历史发票保留查询。',['学生','单据编号','单据类型','金额','付款方式','状态'],[['许安然','RC-DEMO-003','收据','AUD 1,200','银行转账','已签发'],['周子涵','INV-DEMO-002','历史发票','AUD 2,200','—','历史']],'登记收款凭证')
 }},
 parent:{title:'家长协作',desc:'表单、方案确认与合同签署各自保留独立链接、身份和记录。',tabs:{
  links:table('家长表单','生成邀请、跟进填写、核对提交；提交表单后建立学生档案。',['家长 / 学生','表单类型','微信绑定','到期日期','访问次数','状态'],[['林悦宁家长','学生资料','已绑定','15/11/2026','3','已提交'],['叶知夏家长','学生资料','未绑定','15/11/2026','1','填写中']],'生成表单邀请'),
  decisions:table('方案与签署协作','分别跟进学校方案确认和合同签署。',['家长 / 学生','协作事项','版本','最近访问','截止日期','状态'],[['顾思远家长','学校方案确认','v2','04/11/2026','08/11/2026','待确认'],['叶知夏家长','合同签署','v1','03/11/2026','10/11/2026','待签署']],null),
  access:table('访问与身份记录','展示脱敏微信身份、打开及认证事件。',['家长 / 学生','事件','身份','时间','状态'],[['林悦宁家长','微信认证','微信用户 · ****DEMO','04/11/2026 09:40','成功'],['叶知夏家长','打开链接','尚未绑定','03/11/2026 15:20','待认证']],null)
 }},
 content:{title:'内容运营',desc:'从文案采集、提取到发布与效果追踪，统一查看进度。',tabs:{
  dashboard:table('内容总览','管理内容主题、负责人和当前进度。',['标题','主题','负责人','平台','状态'],[['2027 澳洲中学申请准备清单','中小学申请','内容同事','小红书','草稿'],['转学前需要确认的五件事','学生服务','内容同事','小红书','已发布']],'增加文案'),
  extract:table('小红书文案提取','提交链接或本地文件；结果必须经过人工审核。',['任务名称','来源','提取方式','人工审核','状态'],[['中学申请视频（示例）','本地示例','V1 提取','待审核','已完成']],'创建提取任务'),
  sync:table('Google Drive 更新','预览同步变更并处理失败项。',['文件 / 批次','来源目录','变更','最近同步','状态'],[['11 月素材（示例）','内容素材','新增 3 · 更新 1','03/11/2026','待确认']],'预览同步'),
  tracking:table('发布数据追踪','记录发布链接、浏览、互动与跟进。',['标题','平台','发布日期','浏览','互动','状态'],[['转学前需要确认的五件事','小红书','01/11/2026','1,280','86','已发布']],'记录发布数据'),
  analysis:table('内容分析报告','查看内容表现、结论和下一步选题。',['报告','周期','重点主题','建议','状态'],[['11 月内容周报（示例）','01–04/11/2026','中学申请','补充申请材料类内容','草稿']],'新建分析报告')
 }},
 reach:{title:'Agent Reach',desc:'平台检索、关键词监测、趋势结果与任务历史。',tabs:{
  search:table('平台搜索','此原型不调用平台；示例结果用于展示检索与收录。',['标题','平台','作者','关键词','参考热度','状态'],[['中学申请经验（虚构内容）','小红书','示例作者','澳洲中学','86','待收录']],'添加搜索任务'),
  keywords:table('关键词监测','区分手动执行与自动计划；执行状态独立显示。',['关键词','平台','计划','上次执行','状态'],[['澳洲中学','小红书','未启用自动计划','03/11/2026','暂停']],'新增关键词'),
  trends:table('趋势发现','小红书、微博、知乎来源分别保留。',['主题','平台','时间','参考说明','状态'],[['留学申请季（示例）','小红书','04/11/2026','演示趋势','待评估'],['家庭教育（示例）','知乎','04/11/2026','演示趋势','待评估']],'添加趋势记录'),
  history:table('任务历史','任务来源、完成时间和失败原因可查看。',['任务','触发方式','开始时间','结果','状态'],[['示例搜索任务','手动','03/11/2026 10:00','3 条示例结果','已完成']],null)
 }},
 files:{title:'文件管理',desc:'按学生与业务分类查找文件，保留版本、审核和变更标记。',tabs:{
  list:table('学生文件','原型仅读取选中文件的名称与大小，不上传内容。',['文件名称','学生','分类','版本','存储位置','状态'],[['护照.pdf','林悦宁','申请材料','v1','NAS（示意）','已确认'],['最近两年成绩单.pdf','林悦宁','申请材料','v2','NAS（示意）','待审核']],'选择文件'),
  review:table('上传待审核','确认分类和目标后再归档，支持取消。',['文件名称','学生','识别类型','目标分类','状态'],[['最近两年成绩单.pdf','林悦宁','成绩单','申请材料','待审核']],'添加待审核文件'),
  markers:table('文件变更标记','移动、重命名和删除标记保留申请与处理状态。',['文件名称','标记类型','原因','申请人','状态'],[['旧成绩单.pdf','归档标记','已上传新版','陈顾问','待处理']],'添加变更标记')
 }},
 updates:{title:'数据更新中心',desc:'先预览差异，再确认更新；失败、回滚与同步日志可追溯。',tabs:{
  sources:table('数据源与任务','集中查看学校排名、特色、坐标和来源状态。',['数据源','更新内容','最近检查','负责人','状态'],[['学校排名来源','排名与学校名称','03/11/2026','管理员','待预览'],['学校官网','学校特色与资料','02/11/2026','管理员','有效']],'创建更新预览'),
  preview:table('变更预览','对照旧值、新值与来源证据后确认。',['对象','字段','旧值','新值','来源','状态'],[['Northfield College（虚构）','学校特色','音乐','音乐 · STEM','示例来源','待确认']],null),
  logs:table('同步与回滚记录','此处展示记录；静态原型不运行采集或回滚。',['任务','结果','影响范围','时间','状态'],[['学校资料更新（示例）','2 项更新','学校库','02/11/2026','已完成']],null)
 }},
 reports:{title:'数据报表',desc:'按业务阶段、机构与负责人查看示例数据。',tabs:{
  overview:table('业务报表','演示数据仅来自本原型，不代表真实业务统计。',['报表','维度','周期','记录数','状态'],[['申请阶段分布','业务阶段','2026 年 11 月','8','可查看'],['顾问办理分布','负责人','2026 年 11 月','8','可查看'],['学校与机构分布','目标学校','2026 年 11 月','6','可查看']],'生成报表')
 }},
 system:{title:'系统管理',desc:'权限、健康状态、审计与恢复分区管理。所有状态均为演示。',tabs:{
  settings:table('系统设置','展示运行模式、存储和通知设置；不读写真实配置。',['设置项','示例值','说明','状态'],[['运行环境','原型演示','未连接 CRM 服务','演示'],['学生文件','NAS（示意）','不检测或访问存储','演示'],['通知渠道','微信 / 站内提醒','不发送真实通知','演示']],'添加设置'),
  users:table('用户与权限','角色、模块访问和操作权限分别设置；角色切换仅为界面预览。',['显示名称','账号','角色','模块范围','状态'],[['陈顾问','consultant.demo','顾问','学生与申请','有效'],['李签证','visa.demo','签证专员','签证与材料','有效'],['财务同事','finance.demo','财务','收入与佣金','有效']],'新增用户'),
  audit:table('操作日志','关键操作保留人员、业务对象和时间。',['操作者','操作','业务对象','时间','状态'],[['陈顾问','审核申请材料','D2026001','04/11/2026 09:50','成功'] ],null),
  backup:table('备份与恢复','仅演示检查清单，不执行备份或恢复。',['备份名称','范围','完整性','创建时间','状态'],[['DEMO-backup-20261103','演示范围','校验通过（示例）','03/11/2026','可查看']],null),
  safebox:table('SAFEBOX / 恢复记录','展示操作范围、还原点和验收记录。',['记录','任务范围','还原点','验收结果','状态'],[['SAFE-DEMO-01','示例学校资料更新','示例快照','示例检查通过','已完成']],null),
  health:table('系统健康','实际运行状态需从正式服务获取，此页全部为示意。',['服务','模式','连接状态','检查时间','状态'],[['CRM 管理端','原型','未连接','未检查','演示'],['家长端','原型','未连接','未检查','演示'],['NAS 存储','原型','未连接','未检查','演示']],null)
 }}
};
const COVERAGE = [
 ['dashboard','工作台','dashboard','ui.py / dashboard_kpi_cards.py'],['students','学生管理','students','app.py / fields.py'],['parent_form','家长表单','parent/links','parent_form_admin_views.py'],['reminders','提醒中心','reminders','reminder_center.py'],['school_library','学校管理','schools/list','app.py / higher_education_admin_views.py'],['school_plan_reports','学校方案报告','plans/list','school_plan_lifecycle.py'],['higher_education','高等教育申请','higher/plans','higher_education_views.py'],['content_center','内容管理中心','content/dashboard','app.py content_tabs'],['agent_reach','Agent Reach','reach/search','agent_reach_views.py'],['applications','申请材料','student/D2026001/materials','app.py student detail'],['offer','Offer 管理','student/D2026001/offers','offer_acceptance.py'],['coe_oshc','COE + OSHC','student/D2026001/coe','app.py student detail'],['visa','签证','visa/cases','visa_workspace_candidate.py'],['payments','付款','student/D2026001/payments','app.py student detail'],['student_contracts','学生合同','student/D2026001/contracts','contract_domain.py'],['contract_management_center','合同管理','contracts/list','contract_generation_authority.py'],['template_management','模板管理','templates/contracts','contract_template_editor.py'],['revenue_commission','收入与佣金','revenue/cases','revenue/read_models.py'],['reports','数据报表','reports/overview','database.py MODULE_DEFINITIONS'],['data_update_centre','数据更新中心','updates/sources','app.py data_update_centre'],['file_manager','文件管理','files/list','app.py'],['backup_restore','备份与恢复','system/backup','ui.py'],['safebox_centre','SAFEBOX / 恢复记录','system/safebox','database.py MODULE_DEFINITIONS'],['user_management','用户管理','system/users','database.py ROLE_MODULE_PRESETS'],['audit_logs','操作日志','system/audit','ui.py'],['system_settings','系统设置','system/settings','ui.py'],
 ['extra_transfer','转学办理','transfer/cases','transfer_completion_readiness.py'],['extra_progression','升学办理','progression/cases','progression_completion_readiness.py'],['extra_homestay','住宿与接机','student/D2026001/services','app.py homestay tab'],['extra_history','学生历史与跟进','student/D2026001/history','student_followup_notes.py'],['extra_parent','家长端预览','portal/form','parent_form_service.py / school_plan_lifecycle.py']
];
