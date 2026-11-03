# AAIE CRM 业务覆盖清单

依据当前源码静态分析，不代表生产环境已启用全部能力。页面与交互均为设计原型；正式权限、数据和自动化能力需要后续系统实现。

当前 `database.py` 共定义 26 个模块；本原型逐项覆盖，另包含 5 个补充场景。

| 业务功能 | 模块标识 | 原型入口 | 主要代码依据 |
|---|---|---|---|
| 工作台 | `dashboard` | [进入页面](index.html#dashboard) | `ui.py / dashboard_kpi_cards.py` |
| 学生管理 | `students` | [进入页面](index.html#students) | `app.py / fields.py` |
| 家长表单 | `parent_form` | [进入页面](index.html#parent/links) | `parent_form_admin_views.py` |
| 提醒中心 | `reminders` | [进入页面](index.html#reminders) | `reminder_center.py` |
| 学校管理 | `school_library` | [进入页面](index.html#schools/list) | `app.py / higher_education_admin_views.py` |
| 学校方案报告 | `school_plan_reports` | [进入页面](index.html#plans/list) | `school_plan_lifecycle.py` |
| 高等教育申请 | `higher_education` | [进入页面](index.html#higher/plans) | `higher_education_views.py` |
| 内容管理中心 | `content_center` | [进入页面](index.html#content/dashboard) | `app.py content_tabs` |
| Agent Reach | `agent_reach` | [进入页面](index.html#reach/search) | `agent_reach_views.py` |
| 申请材料 | `applications` | [进入页面](index.html#student/D2026001/materials) | `app.py student detail` |
| Offer 管理 | `offer` | [进入页面](index.html#student/D2026001/offers) | `offer_acceptance.py` |
| COE + OSHC | `coe_oshc` | [进入页面](index.html#student/D2026001/coe) | `app.py student detail` |
| 签证 | `visa` | [进入页面](index.html#visa/cases) | `visa_workspace_candidate.py` |
| 付款 | `payments` | [进入页面](index.html#student/D2026001/payments) | `app.py student detail` |
| 学生合同 | `student_contracts` | [进入页面](index.html#student/D2026001/contracts) | `contract_domain.py` |
| 合同管理 | `contract_management_center` | [进入页面](index.html#contracts/list) | `contract_generation_authority.py` |
| 模板管理 | `template_management` | [进入页面](index.html#templates/contracts) | `contract_template_editor.py` |
| 收入与佣金 | `revenue_commission` | [进入页面](index.html#revenue/cases) | `revenue/read_models.py` |
| 数据报表 | `reports` | [进入页面](index.html#reports/overview) | `database.py MODULE_DEFINITIONS` |
| 数据更新中心 | `data_update_centre` | [进入页面](index.html#updates/sources) | `app.py data_update_centre` |
| 文件管理 | `file_manager` | [进入页面](index.html#files/list) | `app.py` |
| 备份与恢复 | `backup_restore` | [进入页面](index.html#system/backup) | `ui.py` |
| SAFEBOX / 恢复记录 | `safebox_centre` | [进入页面](index.html#system/safebox) | `database.py MODULE_DEFINITIONS` |
| 用户管理 | `user_management` | [进入页面](index.html#system/users) | `database.py ROLE_MODULE_PRESETS` |
| 操作日志 | `audit_logs` | [进入页面](index.html#system/audit) | `ui.py` |
| 系统设置 | `system_settings` | [进入页面](index.html#system/settings) | `ui.py` |
| 转学办理 | `extra_transfer` | [进入页面](index.html#transfer/cases) | `transfer_completion_readiness.py` |
| 升学办理 | `extra_progression` | [进入页面](index.html#progression/cases) | `progression_completion_readiness.py` |
| 住宿与接机 | `extra_homestay` | [进入页面](index.html#student/D2026001/services) | `app.py homestay tab` |
| 学生历史与跟进 | `extra_history` | [进入页面](index.html#student/D2026001/history) | `student_followup_notes.py` |
| 家长端预览 | `extra_parent` | [进入页面](index.html#portal/form) | `parent_form_service.py / school_plan_lifecycle.py` |

## 关键业务如何在原型中体现

- 学生：资料、家庭背景、健康、签证风险、学习背景、申请周期、材料与版本、方案、Offer、COE/OSHC、签证、合同、付款、住宿接机、收入佣金、历史、跟进提醒。
- 转学：原校与目标校、申请与 Offer、付款、COE、签证、保险、监护住宿、成绩及学校报告、就读转换、完成条件。
- 升学：路径、多目标学校、最终 Offer、已签 Offer、付款、新 COE、新 OSHC、最新成绩单、必需材料、就读衔接与完成条件。
- 高教：大学目录、路径组合、课程与合作机构、学生方案、申请、Offer、COE；不要求高教服务合同。
- 家长：学生资料/签证表分别暂存，方案逐校选择与留言，合同签署演示，补充材料，身份访问记录。
- 财务：客户基础费/GST/收款、收据与历史发票、直接佣金与申领条件、一级代理匹配、佣金合同、对账异常。
- 内容：增加文案、提取任务、人工审核、Drive 同步、发布数据、分析报告、平台检索、关键词、趋势和任务历史。
- 系统：角色界面预览、用户、日志、配置、健康、备份恢复、SAFEBOX；均无真实服务控制。

## 演示层级

| 层级 | 本原型包含 |
|---|---|
| 可交互流程 | 学生新建编辑、跟进提醒、材料元数据/审核、学校方案增减排序/确认/递交、Offer 接受撤回、COE 信息、付款凭证、转学升学完成条件、模板编辑预览发布、家长表单及签署示例、合资格佣金申领、表格维护/搜索/导出 |
| 数据与状态展示 | 全部模块入口、各分区表格及明细、版本/访问/归档记录、报表、系统检查清单 |
| 后续正式实现 | 服务端权限与持久化、微信/OAuth/令牌、合法签署与证据、正式 PDF/Office 生成、OCR/AI、NAS/Drive、采集调度、财务账务算法与真实对账、备份恢复 |

## 已遵循的业务边界

- 方案确认与正式递交是两个操作。家长未选择的学校不会显示为已确认或已递交。
- 转学升学使用独立记录；完成按钮始终显示，条件未满足时不可点击。此处规则用于展示，后续仍须复用正式后端规则。
- 升学 OSHC 不以“不适用”跳过；原型展示新保险的确认项。
- 预测佣金不能直接申领；一级代理确认演示要求管理员角色。
- 已发布模板修订产生新草稿，保留原发布版本；文档模板与合同模板分开。
- 同一材料在学生页与文件中心的审核状态同步。
- 学生历史按学生过滤；系统操作日志显示全部演示操作。
- 家长表单草稿、提交及签署状态按学生及表单类型隔离。
