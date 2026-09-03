---
name: agent-ux-task-block
description: "沉浸式长链路任务的 L2 分组与私有 L3 明细。"
user-invocable: false
meta:
  id: task-block
  kind: component
  layer: process
  title: 任务块 TaskBlock
  exported: true
  source: skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx
  whenToUse: [规划、分头执行和汇总的长链路任务中承载 L2]
  whenNotToUse: [简单任务, 没有可查看 L3 的纯标题分组, L2 嵌套]
  composeWith: [ExecutionProcess, ExecutionActionBadge, ReasoningPanel]
  composeBoundary: [TaskExecutionStep 是宿主私有细节, 不可从外部 import]
  pitfalls: [用 L2 替代 L3, 完成任务默认展开]
  designRules: [design.md#32-执行过程透明, design.md#41-四种状态语言]
---

# 任务块 TaskBlock

## 选型
`TaskBlock` 是沉浸式 L2，仅服务于长链路中的规划、分头执行或汇总。每个 L2 必须包含实际可查看的 L3 `steps`；简单任务仍用扁平 L1 → L3。

## 事实源与 API
公开导出：`TaskBlock({ task, onOpenArtifact })`。`task` 为 `ExecutionTaskData`，当前状态仅为 `completed | running`，并含 `title`、`summary`、L3 `steps`。文件内 `TaskExecutionStep` 不导出，是 L2 内容的私有渲染细节。

## 结构、状态与无障碍
运行中的 L2 初始展开，完成项默认收起；触发按钮报告 `aria-expanded`。标题以 Spinner 或完成勾选表达状态，展开后依次显示 L3、各步 badge/思考和任务摘要。收起内容沿用 `DisclosureContent` 的 `aria-hidden` 与 `inert` 行为。

## 组合边界
不能将 L2 挪入 shared conversation，也不能从别处 import `TaskExecutionStep`。不得嵌套 `TaskBlock`，不得只提供概览而省略 L3。

## 扩展方式
场景层新增任务和步骤改 `conversation-data.ts`。若要支持新的 L2 状态、内容或交互，先评审其是否符合执行状态语言，再同改此宿主和文档；不要在外部复制私有 L3 结构。

## 常见坑
- 为了“层级齐全”给每个任务加 L2。
- 将完成 L2 默认展开，压过结论与当前执行。
- 把摘要当成 L3 明细。
