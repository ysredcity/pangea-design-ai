# 贡献指南（CONTRIBUTING）

设计规则唯一事实源是 `skills/agent-ux-react/references/design.md`。本仓库所有 active 模板使用 **Base UI**；不要引入或恢复 Radix。

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
