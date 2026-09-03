---
name: agent-ux-project-structure
description: "Base UI shared conversation domain, independent immersive and Copilot shells, materialized template distribution and validation."
user-invocable: false
---

# 工程结构与生成层级

固定技术栈是 **Vite 8 + React 19 + TypeScript + Tailwind CSS v4 + shadcn v4（Base UI）+ lucide-react**。两套模板可独立复制和安装，运行时不在形态之间切换。

## 源码边界

| 层 | 事实源 | 责任 |
|---|---|---|
| 共享对话域 | `packages/agent-ui/src/conversation/` | 消息、执行过程、Composer、三张交互卡、交付物入口与中立 `ArtifactRouter` / `ProductBlockAction` |
| 沉浸式适配 | `packages/agent-ui/src/immersive/` + `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/` | 侧栏、对话区、右侧 Tab/图片查看器；本地 panel adapter 进入 `AgentShell` |
| Copilot 适配 | `packages/agent-ui/src/copilot/copilot-app.tsx` | 资源区、工作画布与辅助对话区；通过 `routeArtifact: ArtifactRouter` 把中立产物交给产品页 |
| 产品装配 | immersive 的 `agent-layout/{app-config,conversation-data,panel-data}.ts`；Copilot 的 `templates/copilot-starter/src/pages/ContractReview.tsx` | 场景、产品配置、面板数据或左画布 state 与专属块；不把业务能力吞入 `AppConfig` |

`@agent-ux/agent-ui` 只公开 `.`（共享对话）、`/conversation`、`/immersive`、`/copilot`。共享域绝不 import `PanelView`、`ArtifactPanel` 或 Copilot canvas。`AgentResponseBlock`、`ConversationTurn`、`AssistantContinuation` 仍是实现内部边界。

## 物化与分发

`node scripts/sync-agent-ui.mjs` 把 `conversation/` 及对应的 `immersive/` 或 `copilot/` 源码写入两套模板的 `src/agent-ui/`，并物化零依赖质量脚本到 `scripts/agent-ux/`；`--check` 同时检测两个模板漂移。模板不使用 `workspace:*`，因此可以在仓库外运行 `npm install && npm run gate`。

```bash
npm install
npm run sync:agent-ui
npm run check:agent-ui-types
npm run check:agent-ui-drift
npm run gate
```

根 gate 顺序是包类型检查、双模板漂移检查、沉浸式 gate、Copilot gate。两套 active manifest 均使用 Base UI；旧 Radix 源码仅作为未进入 TypeScript/Vite 入口的历史隔离文件，不能恢复为同步输入。

## 产品扩展

- 沉浸式场景改 `conversation-data.ts`，面板内容改 `panel-data.ts`；同产物重复打开只切换 Tab，切换会话立即清面板。
- Copilot 页面提供 `workspace` 与 `routeArtifact(target)`；交付物仍可从消息点击，产品块 action 也由 `onProductBlockAction` 转为 artifact，**都只能更新左侧工作区，不出现右侧产物面板**。
- `AppConfig` 只承载身份、导航与欢迎页专家/推荐；场景、主题、面板容器与产品块继续以 TypeScript 扩展。
- 产品块的固定插槽在 assistant 正文/附件之后、续流程之前；renderer 接收 `ProductBlockContext.onAction`，未知类型由产品 renderer 记录开发期警告并安全跳过。沉浸式 local renderer 消费本地 `data`/rich context，Copilot/shared renderer 消费 `payload`/shared context；同名 renderer API 不可互换。
