# 验收文件

第二版结果以 `purple-results.json`、`purple-routes.json`、`module-coverage.json` 和 `.jpg` 截图为准。

仓库中原有的 `results.json`、`review-results.json`、`release-smoke.json` 与 `.png` 图片是第一版历史证据，不作为第二版验收结果。

`verify.cjs`、`review-checks.cjs` 是可复用回归脚本；默认访问本机9137端口，可用 PROTOTYPE_BASE_URL 更改入口。preview-server.py 是只读原型预览服务器。

## 学生管理模块脚本（2026-11-08）

- `field-parity.cjs`：将原型字段与 `source-schema.json`（由 `fields.py` 导出）逐项比对。
- `stu-check.cjs`：学生列表、4 张汇总卡、12 个分区、新建表单与运行时异常。
- `stu-flows.cjs`：筛选、分页、恢复删除、完整新建、材料审核、合同、学校结果、付款、COE、签证、留言、角色权限。
- `stu-layout.cjs`：1440px / 390px 布局与截图。
- `build-standalone.cjs`：把 `index.html` 引用的 CSS/JS 内联为 `crm-redesign-demo.html`。
- `stu-standalone.cjs`：单文件版列表与 12 个分区检查。
- `cdp-eval.cjs`：在预览页执行单条表达式的调试工具。
- `source-schema.json`：`fields.py` 的 11 个分区 / 105 个字段快照。
