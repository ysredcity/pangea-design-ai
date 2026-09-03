---
name: agent-ux-conversation-page
description: "沉浸式活动会话页：组合 rich Flow、Composer 与消息级产物路由。"
user-invocable: false
meta:
  id: conversation-page
  kind: component
  layer: shell
  title: 对话页 ConversationPage
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/conversation-page.tsx
  whenToUse: [展示一条活动沉浸式会话, 装配 rich 对话流与 Composer]
  whenNotToUse: [实现产物容器, 作为共享 ConversationFlow 的替代, 持有全局面板或侧栏状态]
  composeWith: [ChatWorkspace, ConversationFlow, Composer, IconButton, AppConfig]
  composeBoundary: [页面只组合会话内容和向上传递 artifact router，不拥有 PanelTab 或容器实现]
  pitfalls: [遗漏 ConversationFlow key, 在页面加入 PanelView 分支, 将本地 sentMessages 误当为 shell 会话数据]
  designRules: [design.md#31-对话编排与身份, design.md#32-执行过程透明, design.md#33-追问澄清, design.md#64-图标]
---

# 对话页 ConversationPage

## 选型
`ConversationPage` 是沉浸式活动会话的页面级组合器：标题操作、rich `ConversationFlow`、本地补发用户消息和 `Composer`。它接受壳层传入的会话及 router，不承担侧栏、会话列表或独立面板的状态。

## 事实源与 API
当前仅导出 `ConversationPage(props)`。它接收 `AppConfig`、`Conversation`、`pinned`、侧栏停靠状态，以及新建会话、打开侧栏、置顶、重命名、`onOpenArtifact` 和 `onApprovalStatusChange` 回调。页面把 `config.identity`、`config.experts`、`config.renderProductBlock` 及会话审批状态下传 rich Flow，并将 pending 状态传入 rich Composer；确认决定由壳层更新会话状态。

`ConversationFlow` 以 `key={conversation.id}` 挂载，切换会话时重置其内部 rich-flow 状态。页面在会话 ID 改变时通过同一滚动容器同步定位到 `scrollHeight`，因此首次进入或切换任意长会话都默认看到最新消息。页面本地仅拥有滚动到底部按钮、标题截断检测与 `sentMessages`；后者不是会话数据源，也没有因 prop 切换而自动清空，不能把它文档化为跨会话持久消息。

## 结构、状态与无障碍
桌面 header 提供侧栏/新对话入口和会话操作；移动端换为可触达的浮层控制。图标按钮均带 `aria-label` 并由 Tooltip 解释；截断标题在实际溢出时显示 Tooltip。滚动按钮只在内容距底部超过阈值时出现，并滚到同一滚动容器底部。

页面正文复用 [ConversationFlow](../conversation/conversation-flow.md) 和 rich Composer，不复制消息、执行过程或面板结构。发送时解析内联上下文并将用户消息附到本地显示队列；产物可点击性仍取决于是否有可查看 target。

## 组合边界
页面只把 `onOpenArtifact` 向消息和过程入口透传；`AgentShell` 决定图片进蒙层、其他本地 adapter 进独立面板。容器分支存在于 panel registry，不在此页。它也不等于 Copilot 的 `workspace`：后者由产品页展示，并用 `routeArtifact(target)` 更新左画布。

## 扩展方式
- 修改 rich 消息、L1/L2/L3、澄清或附件，进入 `conversation-flow.tsx` 与职责组件。
- 修改输入/上下文，进入 `composer.tsx`、`message-context.ts` 和 registry。
- 修改全局会话或产物生命周期，进入 `AgentShell`，不要增加页面级镜像状态。

## 常见坑
- 去掉 Flow 的会话 key，导致内部过程状态跨会话残留。
- 在此实现 `search-results` 或其他容器视图。
- 假定 `sentMessages` 会随会话切换自动重置。