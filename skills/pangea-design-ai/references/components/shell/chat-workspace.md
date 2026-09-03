---
name: agent-ux-chat-workspace
description: "沉浸式中间工作区：在新对话与对话页之间切换，并落实默认面板分栏尺寸。"
user-invocable: false
meta:
  id: chat-workspace
  kind: component
  layer: shell
  title: 对话工作区 ChatWorkspace
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/chat-workspace.tsx
  whenToUse: [装配沉浸式中间对话区域, 在新对话页与活动会话之间切换]
  whenNotToUse: [拥有会话或面板状态, 实现 PanelView 容器, 复用为 Copilot 工作画布]
  composeWith: [AgentShell, ConversationPage, NewConversationPage]
  composeBoundary: [只选择页面与传递回调，状态和产物展示 adapter 保留在 AgentShell]
  pitfalls: [把 panelOpen 当作容器渲染信号, 忽略默认 split 的对话宽度上限, 将其用作 Copilot 左画布]
  designRules: [design.md#22-沉浸式-agent-工作台, design.md#25-响应式降级, design.md#35-结果呈现与产物容器]
---

# 对话工作区 ChatWorkspace

## 选型
`ChatWorkspace` 是沉浸式的中间区域选择器。它根据 `activeConversation` 渲染 `ConversationPage` 或 `NewConversationPage`，并在独立面板以默认分栏打开时收束对话宽度。它不拥有会话、侧栏或面板状态。

## 事实源与 API
当前仅导出 `ChatWorkspace(props)`。props 接收 `AppConfig`、当前 `Conversation | null`、置顶状态、侧栏停靠状态、面板开关/默认分栏状态，以及新会话、置顶、重命名、打开侧栏、开始会话和 `onOpenArtifact` 回调。`onOpenArtifact` 的类型是沉浸式 `panel-types.ts` 本地 adapter，而非 shared `ArtifactRouter`。

## 结构、状态与无障碍
普通状态下工作区是可收缩的主列。`panelAtDefaultSplit` 为真时，它应用 `clamp(420px,50%,800px)`：420px 保住对话可用性，800px 对应正文阅读上限，额外空间让给网页与文档预览。右侧面板本身由壳层渲染且最小 320px；本组件不渲染面板。

## 组合边界
活动会话进入 `ConversationPage`，无活动会话进入 `NewConversationPage`。会话切换时清理旧产物是 `AgentShell.openConversation()` 的职责，不要在此重复或局部实现。这里也不是 Copilot 的左侧工作画布；Copilot 的产品页显式持有 `workspace` 与 `routeArtifact(target)`。

## 扩展方式
- 修改对话页或新对话页的交互，进入对应页面组件，不在本选择器内堆积 JSX。
- 调整活动会话、面板状态或响应式断点，修改 `AgentShell` 的状态/布局契约并同步设计规则。
- 新面板内容改 `panel-data.ts`；新容器类型走 artifact adapter 注册链路。

## 常见坑
- 为了显示某种产物在本组件添加类型分支。
- 把默认 split 的 50% 当成所有宽度下的强制布局，忽略 420/800 边界。
- 将 `panelOpen` 错当作应由本组件管理的状态。