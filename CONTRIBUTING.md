# 贡献指南（CONTRIBUTING）

设计规则唯一事实源是 `skills/pangea-design-ai/references/design.md`。本仓库所有 active 模板使用 **Base UI**；不要引入或恢复 Radix。

## 版本管理

- 当前稳定基线为 **v0.1.0**，仓库根、`@agent-ux/agent-ui`、两套 active 模板与 `website` 的 `package.json` 必须保持同一版本；更新根版本时同步更新 `package-lock.json`。
- 采用 [Semantic Versioning](https://semver.org/lang/zh-CN/)：修复或文档勘误升 PATCH，向后兼容的新能力升 MINOR，破坏既有 skill 契约、模板扩展点或数据格式才升 MAJOR。
- 每次发布在 `CHANGELOG.md` 从 `[Unreleased]` 移入带日期的版本段；同时更新 README、SKILL.md 与 PROJECT_CONTEXT 中影响使用者的版本状态。
- `website/` 属于仓库内部 showcase，不随 skill 复制发布；其体验优化可以独立排期，不阻塞 skill 版本发布。

## 源码与同步

- `packages/agent-ui/src/conversation/` 是唯一共享对话域：消息、执行过程、Composer、交付物入口和中立 `ArtifactRouter`。
- `packages/agent-ui/src/immersive/` 与 `/copilot/` 是形态层出口。共享域不能 import 面板、Tab、Canvas 或任意壳层类型。
- `scripts/sync-agent-ui.mjs` 将 shared source 与匹配壳层物化到两个独立模板；先改 package，再跑 `npm run sync:agent-ui`，最后运行 `npm run check:agent-ui-drift`。
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

根 gate 顺序是 package 类型检查、双模板 drift、沉浸式 gate、Copilot gate。分发前复制各模板到仓库外，执行 `npm install && npm run build`。不要自动 commit 或 push。
