---
name: agent-ux-conversation-turn
description: "沉浸式私有轮次编排：用户消息、主回复与提交澄清后的续流程。"
user-invocable: false
meta:
  id: conversation-turn
  kind: component
  layer: conversation
  title: 对话轮次 ConversationTurn
  exported: false
  source: skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx
  whenToUse: [在 ConversationFlow 宿主内渲染一个 rich turn]
  whenNotToUse: [从外部 import, 在子组件各自判断当前轮与澄清时序]
  composeWith: [UserMessage, AgentResponseBlock, AssistantContinuation]
  composeBoundary: [私有实现不得直接 import, current 仅由 ConversationFlow 的最后一项计算]
  pitfalls: [让历史轮显示等待回复, 忽略澄清提交后才出现 continuation 的条件]
  designRules: [design.md#31-对话流的基本顺序, design.md#33-追问澄清, design.md#36-消息操作]
---

# 对话轮次 ConversationTurn

## 选型
对话流内部按一轮的时间和状态边界组合用户输入、主回复和可选续流程。

## 事实源与 API
`ConversationTurn` 没有公共导出。它接收 rich `ConversationTurnData`、`current`、澄清提交/回调/阶段、身份、专家、artifact router 与产品 renderer；这些是宿主内部连接参数。

## 结构、状态与无障碍
顺序固定为 `UserMessage` → `AgentResponseBlock` → 提交澄清后才出现的 `AssistantContinuation`。`current` 只在 `ConversationFlow` 映射 `scene.turns` 时赋给最后一项。`needsReply` 仅在当前轮为 question 且没有 continuation 时为真；续流程准备完成后单独判断。

## 组合边界
**不能直接 import。** 改动只能落在 `conversation-flow.tsx` 宿主，并在需求文档说明理由。不要把“当前轮”、澄清提交或续流程阶段复制到独立页面状态；它们属于 Flow 的轮次协调。

## 扩展方式
改变轮次顺序或增加响应形态前，先审查产品块与 continuation 的位置、历史轮的状态语义和现有公共组件；不能仅增加外部包装。

## 常见坑
- 用时间戳或消息 kind 推断 current，而不是由末尾 turn 决定。
- 澄清未提交就渲染 follow-up。
- 给历史 question 保留“需要你的回复”。
