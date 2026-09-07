# 贡献指南（CONTRIBUTING）

设计规则唯一事实源是 `skills/pangea-design-ai/references/design.md`。本仓库所有 active 模板使用 **Base UI**；不要引入或恢复 Radix。

## 版本与发布

- 当前稳定基线为 **v0.3.0**。仓库根、`@agent-ux/agent-ui` 与两套 active 模板的 `package.json` 保持同一版本；更新后用 `npm install --package-lock-only` 重算根锁文件，不手改 lockfile。
- 发布产物放在 `releases/pangea-design-ai-v<版本>.zip`，从 `skills/pangea-design-ai/` 打包，排除 `node_modules`、`dist`、`.DS_Store` 与模板本地 `.workbuddy`。历史归档保留，不覆盖或改名复用。
- 采用 [Semantic Versioning](https://semver.org/lang/zh-CN/)：修复升 PATCH，向后兼容的新能力升 MINOR，破坏 skill 契约、模板扩展点或数据格式才升 MAJOR。
- 每次发布把 `CHANGELOG.md` 的 `[Unreleased]` 内容移入带日期的版本段，同时更新 README、SKILL.md 与 PROJECT_CONTEXT 中影响使用者的版本状态。
- `website/` 当前只保留 README 占位，不是 workspace、门禁或版本同步成员，也不随 skill 发布。

## 源码与同步

- `packages/agent-ui/src/conversation/` 是共享对话域；消息、执行过程、Composer、交付物入口和中立 `ArtifactRouter` 以此为事实源。
- `packages/agent-ui/src/immersive/` 与 `/copilot/` 是形态层出口。共享域不能 import 面板、Tab、Canvas 或任意壳层类型。
- `scripts/sync-agent-ui.mjs` 将共享源码与匹配壳层物化到两个独立模板。先改 package，再运行 `npm run sync:agent-ui`，最后运行 `npm run check:agent-ui-drift`。
- 沉浸式产物进入右侧面板或图片查看器；Copilot 产物只能通过 `routeArtifact(target)` 更新左侧工作区。不得给 Copilot 增加沉浸式右侧产物面板。
- `AppConfig` 只描述身份、导航及欢迎页专家/推荐。场景、主题、面板容器和产品块保留 TypeScript 扩展能力。

## 验证

```bash
npm install
npm run sync:agent-ui
npm run gate
npm run check:agent-ui-drift
git diff --check
```

根 gate 顺序为：package 类型检查 → 双模板漂移检查 → 组件文档检查 → 沉浸式 gate → Copilot gate。分发前将模板复制到仓库外，分别执行 `npm install && npm run gate`。

不要自动 `git commit` 或 `git push`；提交与推送由用户手动完成。
