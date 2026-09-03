---
name: agent-ux-conversation-flow
description: "共享轻量 ConversationFlow 与沉浸式富对话流的双实现边界。"
user-invocable: false
meta:
  id: conversation-flow
  kind: component
  layer: conversation
  title: 对话流 ConversationFlow
  exported: true
  source: packages/agent-ui/src/conversation/conversation-flow.tsx; skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx
  whenToUse: [需要共享轻量场景渲染时使用 shared Flow, 需要身份开场 L1/L2/L3 附件澄清和消息操作时使用 immersive Flow]
  whenNotToUse: [将共享场景直接替换沉浸式 rich scene, 直接 import 沉浸式私有回复结构]
  composeWith: [Conversation Contracts, Composer, product block renderer, message-actions]
  composeBoundary: [shared 与 immersive Flow 的 scene identity router renderer props 均不同, 私有回复结构不得被 import]
  pitfalls: [openArtifact 与 onOpenArtifact 不是可互换的 props, shared product block context 与 immersive context 不同]
  designRules: [design.md#02-产品心智模型与四层信息分层, design.md#31-对话流的基本顺序, design.md#323-有产物的动作才做成可点击资源]
---

# 对话流 ConversationFlow

## 选型

同名 `ConversationFlow` 分别服务共享轻量场景和沉浸式富工作台。共享版本适合中立消息、浅层执行、助手回答及产品块；沉浸式版本拥有身份开场、L1/L2/L3、附件、澄清、消息动作及续流程。它们不是同一组件的 props 变体，禁止以任一方 props 替换另一方。

## 事实源与 API

### Shared：中立轻量对话流

事实源：[`packages/agent-ui/src/conversation/conversation-flow.tsx`](../../../../../packages/agent-ui/src/conversation/conversation-flow.tsx)。仅导出 `ConversationFlow`：

```ts
{
  scene: ConversationScene
  identity: AgentIdentity
  openArtifact: ArtifactRouter
  renderProductBlock?: ProductBlockRenderer
}
```

它按 `ConversationScene.turns` 渲染用户消息、身份开场、可选浅层 execution、assistant 正文/产物及多个 `productBlocks`。运行中的 execution 默认展开，其余默认收起；只有 action 带 `target` 时才是调用 `openArtifact` 的按钮。`renderProductBlock` 收到 `{ turnId, isLatestTurn, openArtifact }`；共享文件内 `ConversationTurn` 是私有渲染辅助，不是公共导出。

### Immersive：完整工作台对话流

事实源：[`templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx`](../../../templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx)。其 `ConversationFlow` 接收 rich `ConversationScene`、`ProductIdentity`、`experts`、`onOpenArtifact` 和可选 `renderProductBlock`。它还公开 `ArtifactRouter`、`ProductBlockRenderer` 与 `AgentIdentity`、`UserMessage`、`ExecutionProcess`、`FlatExecutionFlow`、`ExecutionStep`、`ExecutionActionBadge`、`ReasoningPanel`、`TaskBlock`、`AssistantMessage`。

沉浸式 Flow 管理已提交澄清、后续阶段与由壳层持有的会话审批状态；最后一轮的未答问题才显示“需要你的回复”，而显式 `awaitingApproval` 且会话状态为 `pending` 时，在执行过程与回复正文之间显示 destructive 语义的“需要你的批准”。该状态只由产品页/壳层通过确认 action 更新；批准或拒绝后，Flow 隐藏确认卡并渲染场景数据提供的后续执行与结果消息。它负责智能体身份开场、L1 整轮状态、L2 任务块、L3 实际步骤、深度思考、左右对齐附件、澄清表单、复制/反馈操作及产品块。rich `ProductBlockRenderer` 的上下文只有 `{ onOpenArtifact }`，不能假定包含 shared 的 `turnId` 或 `isLatestTurn`。

## 结构、状态与无障碍

共享执行只表达浅层状态与步骤，完成过程默认收起、运行中默认展开。沉浸式按结论优先展示：身份到过程间距 8px、过程到正文 20px；L1/L2/L3 只用于必要的长链路，简单任务保持 L1→L3。沉浸式用户消息为悬停操作栏预留空间且仅切换透明度，避免布局跳动；其隐藏 disclosure 内容保持挂载但通过 `aria-hidden` 与 `inert` 排除焦点。

两种实现中，附件和动作仅在有用户可查看的 target 与 router 时可点击。沉浸式 `AssistantMessage` 处理 Markdown、澄清和消息动作；不要复制第二套回答结构。

## 组合边界

shared 的 `openArtifact`、`AgentIdentity`、`ConversationScene`、浅层 execution 与 product renderer 都属于中立契约；immersive 使用 `onOpenArtifact`、`ProductIdentity`、rich `*Data` 场景模型和自己的 renderer context。名称相近不代表类型兼容。

沉浸式私有 `ConversationTurn`、`AgentResponseBlock`、`AssistantContinuation` 不能直接 import。要修改它们只能编辑 `conversation-flow.tsx` 宿主文件，并在需求文档说明为何公共导出无法满足需求。

## 扩展方式

跨形态的轻量消息或中立产物语义进入 shared `conversation/`。沉浸式的富过程、澄清、附件和面板交互留在模板的 `conversation-flow.tsx` 及其职责组件。新增产品专属对话块只注册产品 renderer；未知 type 在开发期告警并跳过。若目标是沉浸式新面板内容，改 `panel-data.ts`；只有新增容器类型才同时改 panel types、containers 和 registry。

## 常见坑

- 用 shared `ConversationScene` 或 `openArtifact` 替换 rich Flow 的 `ConversationScene` 或 `onOpenArtifact`。
- 将沉浸式 L1/L2/L3、澄清表单或消息操作声明为 shared API。
- 直接 import 私有回复结构，而非在宿主文件内按明确理由修改。
- 把没有 target 的过程动作或内部调用伪装成可点击产物。
