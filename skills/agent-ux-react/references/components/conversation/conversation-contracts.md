---
name: agent-ux-conversation-contracts
description: "共享 conversation 域的中立类型契约、出口与跨形态边界。"
user-invocable: false
meta:
  id: conversation-contracts
  kind: contract
  layer: conversation
  title: 共享对话契约 Conversation Contracts
  exported: true
  source: packages/agent-ui/src/conversation/types.ts
  whenToUse: [跨形态传递中立对话场景、路由用户可查看的产物、注册产品专属对话块]
  whenNotToUse: [描述沉浸式 PanelView 或 PanelTab、描述 Copilot 左画布实现、声明富澄清或 L1/L2/L3 数据]
  composeWith: [Composer, ConversationFlow, 产品 renderProductBlock registry]
  composeBoundary: [共享契约不得含 PanelView、ImageView、PanelTab 或 Canvas 类型, 形态专属展示由 adapter 或页面路由负责]
  pitfalls: [同名 immersive ArtifactTarget 不是共享类型, 未知产品块不能降级为 Markdown]
  designRules: [design.md#323-有产物的动作才做成可点击资源, design.md#七扩展新能力的决策流程]
---

# 共享对话契约 Conversation Contracts

## 选型

当沉浸式与 Copilot 都需要消费同一份对话语义时，使用 `@agent-ux/agent-ui` 或 `@agent-ux/agent-ui/conversation` 导出的本契约。它只定义轻量、与容器无关的对话数据与回调；需要右侧面板、图片蒙层、左画布、富澄清或 L1/L2/L3 时，转到对应形态的实现，不扩写共享类型。

## 事实源与 API

事实源是 [`packages/agent-ui/src/conversation/types.ts`](../../../../../packages/agent-ui/src/conversation/types.ts)。`packages/agent-ui/src/conversation/index.ts` 导出 `types`、`Composer`、`ConversationFlow`、`ConfirmCard`、`ErrorState` 与 `FollowUpSuggestions`；包根入口也只重导出该共享域。因此 `@agent-ux/agent-ui` 与 `@agent-ux/agent-ui/conversation` 都可取得以下公共类型和卡片组件。

| 契约 | 成员与责任 |
|---|---|
| `ArtifactTarget` | `id`、`type: document \| web \| image \| data \| custom`、`title`，可选 `description`、`href`、`payload`；表达用户可查看的中立产物目标。|
| `ArtifactRouter` | `(target: ArtifactTarget) => void`；由形态层实现展示去向。|
| `ProductConversationBlock` | `id`、`type`、必填 `payload`；表达产品自己的对话块数据。|
| `ProductBlockAction` | 带 `blockId` 的中立判别事件：`confirm-decision`、`error-recovery` 或 `follow-up-select`；只描述用户意图。|
| `ProductBlockActionHandler` | `(action: ProductBlockAction) => void`；由形态层或产品页面拥有实际结果。|
| `ProductBlockActionStatus` | `{ actionId, message }`；消费者可选提供给卡片的结果播报，不表示后端成功。|
| `ProductBlockContext` | `turnId`、`isLatestTurn`、`openArtifact`、`onAction`；产品块 renderer 的上下文。|
| `ProductBlockRenderer` | `(block, context) => ReactNode`；将产品块渲染为产品 UI。|
| `ExecutionStep` | `id`、`title`、可选 `detail`、`status: completed \| running \| pending`、可选带 `target` 的 `actions`。|
| `AssistantMessage` | `content`、可选 `timestamp`、`artifacts` 与 `kind: answer \| question`。|
| `ConversationTurn` | `id`、用户文本，可选浅层 `execution`、`assistant`、多个 `productBlocks`。|
| `ConversationScene` | `id` 与 `turns`；共享 `ConversationFlow` 的场景输入。|

## 结构、状态与无障碍

共享 `ConversationFlow` 在 assistant 正文及附件之后调用 `renderProductBlock`。当前共享实现不识别 `block.type`：没有 renderer 或 renderer 返回 `null` 时会静默跳过。产品可在自己的 renderer 中加入开发期告警，但不能把未知数据作为 Markdown 回退显示；如未来将告警升为共享行为，必须同时更新源码与本契约。

产物只在存在真实 `ArtifactTarget` 且由 `ArtifactRouter` 承接时才可打开。`ExecutionStep.actions` 没有 `target` 时应只是说明，不伪造点击入口。

## 组合边界

共享 `ArtifactTarget` **没有** `PanelView`、`ImageView`、`PanelTab` 或 Canvas 字段。沉浸式把中立目标适配为右侧容器或图片查看器；Copilot 的 `routeArtifact(target)` 只更新左侧工作画布。相同名称的沉浸式 adapter 类型不与这里的 `ArtifactTarget` 兼容，禁止跨层传递或以结构相似推断可替换。

共享 `ConversationTurn.execution` 是浅层状态摘要，不是沉浸式的完整 L1/L2/L3 数据树；共享产品块可为每轮多个，沉浸式的富产品块数据与 renderer 上下文另有自己的契约。

## 扩展方式

新增跨形态的中立产物类型或场景字段时，先修改本文件事实源的类型，再同步检查两种形态的 router 消费方式。新增产品专属块时在产品 `renderProductBlock` registry 注册，保持共享域不知道业务 UI。需要新沉浸式展示容器时，改 `panel-types.ts`、`panel-containers.tsx` 与 `panel-registry.ts`，不要向本契约加入面板字段。

## 常见坑

- 把沉浸式 `PanelView` / `PanelTab` 写入共享 `ArtifactTarget`，会把右侧布局泄漏给 Copilot。
- 假设两个同名 `ArtifactTarget` 可直接赋值；它们所属层级和字段不同。
- 漏传 `ProductConversationBlock.payload`，或把未知块改为 Markdown；当前共享域会在 renderer 缺失或返回空时跳过，产品若需要诊断应在自身 renderer 中显式告警。
- 仅凭动作类型做成链接；可点击的前提始终是用户可查看的 `ArtifactTarget`。
