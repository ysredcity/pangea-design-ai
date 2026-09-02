# 项目长期约定

## 部署（workbuddy_sites_deploy）
- 项目：Vite 8 + React 19 + TS，静态 SPA。
- **推荐方式：本地 build + static 静态部署（最稳，绕开沙箱构建坑）**：
  1. `npm run build`（本地构建出 `dist/`）
  2. 复制产物到独立目录：`rm -rf agent-layout-static && mkdir agent-layout-static && cp -R dist/* agent-layout-static/`
  3. 部署 `agent-layout-static` 目录，`language: "static"`，不传 startCmd。
  - 结果 `deployedAs: web-page`，加载的 js/css 哈希与本地 `dist/index.html` 一致即成功。
- 沙箱构建（`npm run build` + preview）的坑（2026-09-01 起持续出现）：
  - 沙箱里 `tsc -b` / `vite build` 退出时触发 Node `ResetStdio()` assertion 崩溃，静默后 preview 服务残留旧 dist，导致线上是旧代码（多次 redeploy hash 不变）。
  - 复用 sandbox 时源码不会可靠刷新，旧 hash 卡死；unpublish 后重 publish 仍可能构建失败。
  - 结论：不要依赖沙箱 build，直接用「本地 build + static 部署」。
- `vite.config.ts` 已加 `server/preview` 的 `host:'0.0.0.0'` + `allowedHosts:true`，勿删（dev/preview 模式仍需）。
- 当前线上链接：https://be982a4f59b744aba053ade680a5df07.app.workbuddy.link
  （旧链接 9a70e2491c254bd3bfd59b42db503110 已下线失效）
