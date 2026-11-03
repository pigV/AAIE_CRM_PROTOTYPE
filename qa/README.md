# 验收文件

第二版结果以 `purple-results.json`、`purple-routes.json`、`module-coverage.json` 和 `.jpg` 截图为准。

仓库中原有的 `results.json`、`review-results.json`、`release-smoke.json` 与 `.png` 图片是第一版历史证据，不作为第二版验收结果。

`verify.cjs`、`review-checks.cjs` 是可复用回归脚本；默认访问本机9137端口，可用 PROTOTYPE_BASE_URL 更改入口。preview-server.py 是只读原型预览服务器。
