---
name: agent-ux-assistant-continuation
description: "沉浸式私有续流程：澄清提交后的校验、组装与就绪时序。"
user-invocable: false
meta:
  id: assistant-continuation
  kind: component
  layer: conversation
  title: 智能体续流程 AssistantContinuation
  exported: false
  source: skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx
  whenToUse: [在宿主中显示澄清提交后的跟进执行与最终提问]
  whenNotToUse: [作为独立流式组件 import, 为任意回复伪造状态机]
  composeWith: [AgentResponseBlock, ClarificationFollowUpData]
  composeBoundary: [私有实现不得直接 import, phase 由 ConversationFlow 管理]
  pitfalls: [将 validating 或 assembling 时标为需要回复, 忽略 reduced-motion 的立即推进]
  designRules: [design.md#33-追问澄清, design.md#32-执行过程与可信度, design.md#31-对话流的基本顺序]
---

# 智能体续流程 AssistantContinuation

## 选型
仅用于已提交澄清后的同轮跟进：先展示校验/组装过程，再展示 ready 阶段的 assistant 内容。

## 事实源与 API
`AssistantContinuation` 是 `conversation-flow.tsx` 文件内私有组件。它使用 `ClarificationFollowUpData` 和内部 `FollowUpPhase`（`validating`、`assembling`、`ready`）；这不是稳定 API。

## 结构、状态与无障碍
它用 `getStreamingExecution` 将 follow-up 的前两执行步骤投影为运行/完成状态，并复用 `AgentResponseBlock`。仅 `ready && current` 时给回答传递 `needsReply`。动画尊重 `prefers-reduced-motion`；缩减动效时阶段延迟为 0。

## 组合边界
**不能直接 import。** 需要调整只能修改 `conversation-flow.tsx` 宿主，且必须在需求文档说明理由。续流程必须从已提交澄清卡的 `followUp` 产生，不能独立接管普通消息的状态。

## 扩展方式
需要更多阶段时先评估用户是否能理解新的执行状态，并同时修改 Flow 的阶段管理、清理与 `getStreamingExecution`；不可只改显示文案。

## 常见坑
- 在 validating/assembling 就显示最终 question 或“需要你的回复”。
- 忘记清理 Flow 定时器，或另起一个不尊重 reduced-motion 的动画实现。
