---
name: agent-ux-assistant-message
description: "沉浸式智能体正文：结论优先、左侧交付物、澄清与统一消息操作。"
user-invocable: false
meta:
  id: assistant-message
  kind: component
  layer: conversation
  title: 智能体消息 AssistantMessage
  exported: true
  source: skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx
  whenToUse: [渲染 rich assistant 正文、交付物附件与可选澄清]
  whenNotToUse: [渲染用户输入, 以普通文本替代目标导向交付物]
  composeWith: [MarkdownContent, ClarificationFormCard, CopyAction, FeedbackActions, ArtifactRouter]
  composeBoundary: [needsReply 由宿主时序决定, 智能体附件必须有 target, 消息操作统一复用]
  pitfalls: [在历史问题显示需要你的回复, 绕过 MarkdownContent, 将附件改成用户侧右对齐]
  designRules: [design.md#31-对话流的基本顺序, design.md#33-追问澄清, design.md#351-markdown内联响应, design.md#352-交付物必须是一等公民, design.md#36-消息操作]
---

# 智能体消息 AssistantMessage

## 选型
用于智能体正文、结论、交付物与结构化澄清；结论优先，执行过程由上方宿主渲染。

## 事实源与 API
`AssistantMessage` 为公共导出，接收必填 `content`、`timestamp`，可选 `attachments`、`clarification`、`clarificationSubmitted`、`onClarificationSubmit`、`onOpenArtifact`、`kind` 与 `needsReply`。`attachments` 为 `AssistantAttachment[]`，在数据层强制带 `target`。

## 结构、状态与无障碍
顺序固定为：可选“需要你的回复”标记、Markdown 正文、左对齐附件、澄清卡、复制/反馈/时间。`needsReply` 只能由 `ConversationTurn`/续流程在当前最后一轮、且未收到后续用户消息时传入。附件通过 router 打开；表单提交后由 `clarificationSubmitted` 呈现只读记录。

## 组合边界
不要复制一套特殊流程回答结构；普通回答和续流程回答都经该组件。交付物在消息左侧，用户附件在 `UserMessage` 右侧。回复文本不能替代应交付的可打开产物。

## 扩展方式
Markdown 排版改 `MarkdownContent`/`typeset.css`；操作改 `message-actions.tsx`；澄清字段改数据契约和 `ClarificationFormCard`。新产品块插槽属于私有 `AgentResponseBlock`，不在此组件内插入。

## 常见坑
- 将历史 question 或正在流式的续流程标成“需要你的回复”。
- 对智能体附件省略 target 或不给 router。
- 在 JSX 中重新实现复制、点赞/点踩。
