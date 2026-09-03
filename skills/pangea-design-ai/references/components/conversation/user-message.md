---
name: agent-ux-user-message
description: "沉浸式用户消息：右对齐气泡、实体附件与不跳动的复制操作栏。"
user-invocable: false
meta:
  id: user-message
  kind: component
  layer: conversation
  title: 用户消息 UserMessage
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx
  whenToUse: [渲染 rich ConversationTurnData 的用户侧消息]
  whenNotToUse: [用用户消息展示智能体交付物, 为无 target 的附件伪造打开入口]
  composeWith: [MarkdownContent, CopyAction, ArtifactRouter]
  composeBoundary: [附件位于气泡前且右对齐, target 与 router 同时存在才可打开]
  pitfalls: [条件渲染操作栏导致布局跳动, 把用户附件约束成必须 target]
  designRules: [design.md#31-对话流的基本顺序, design.md#323-有产物的动作才做成可点击资源, design.md#352-交付物必须是一等公民, design.md#36-消息操作]
---

# 用户消息 UserMessage

## 选型
渲染沉浸式 rich 场景中的用户输入及本地实体附件；它不负责智能体交付物或执行过程。

## 事实源与 API
`UserMessage({ message, onOpenArtifact? })` 使用 `ConversationTurnData["user"]`。消息包含 `content`、可选 `attachments` 和可选 `timestamp`；附件可带可选 `target`。没有 `target` 或没有 router 时附件不生成触发器。

## 结构、状态与无障碍
附件先于气泡并 `align="end"` 右对齐，气泡为主色浅底。无内联标签时内容统一交给 `MarkdownContent`；有标签时转入纯文本分段渲染。时间与 `CopyAction` 处于固定 `h-7` 操作栏，默认透明、hover/focus 可见，避免下方内容跳动。可打开附件带描述性 `aria-label`。

## 组合边界
用户上传附件是实体附件；可内联的文件库、最近对话和技能属于正文标签。不要在这里接入专家或连接器：专家属于智能体身份，连接器属于执行过程。

## 扩展方式
附件预览继续复用 `ArtifactRouter`；新增文件视觉改 `resource-visuals.tsx` / 文件元信息，不在消息 JSX 临时映射。消息操作复用 `message-actions.tsx`。

## 常见坑
- 将用户附件改成左对齐，或把智能体产物放进此组件。
- 因 hover 条件卸载时间/复制栏。
- 无可查看产物时仍把附件卡片做成按钮。
