---
name: agent-ux-flat-execution-flow
description: "沉浸式简单任务的 L1→L3 扁平执行详情。"
user-invocable: false
meta:
  id: flat-execution-flow
  kind: component
  layer: process
  title: 扁平执行流 FlatExecutionFlow
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx
  whenToUse: [简单任务在 L1 下展示动作、依据和可查看产物]
  whenNotToUse: [需要分头协调的长链路, 代替带状态节点的 ExecutionStep]
  composeWith: [ExecutionProcess, ExecutionActionBadge, ReasoningPanel]
  composeBoundary: [仅接收沉浸式 ExecutionStepData, 不等同 shared ExecutionStep]
  pitfalls: [为简单任务增加 TaskBlock, 无 target 的动作伪造成按钮]
  designRules: [design.md#32-执行过程透明, design.md#323-有产物的动作才做成可点击资源]
---

# 扁平执行流 FlatExecutionFlow

## 选型
用于 `execution.flat` 为真时的 L1 → L3 简单任务路径。它直接呈现每个步骤的详情、动作 badge 与可选思考，而不额外生成 L2。

## 事实源与 API
公开导出：`FlatExecutionFlow({ steps, onOpenArtifact })`。`steps` 为沉浸式 `ExecutionStepData[]`；每项可有 `detail`、`actions` 与 `reasoning`。它不渲染状态图标或连接线；需要这些视觉状态时由 `ExecutionStep` 承担。

## 结构、状态与无障碍
逐项输出可选详情、动作 badge 和思考面板。动作只有携带用户可查看 `target` 时才通过 `onOpenArtifact` 打开产物；无目标内容保持说明性质。外层的 L1 disclosure 负责收起与键盘可达性。

## 组合边界
由 `ExecutionProcess` 选择，不在壳层、面板或 Copilot 画布中分支。shared 轻量 `ExecutionStep` 与此处 `ExecutionStepData` 同名但数据范围不同，不能混用。

## 扩展方式
添加场景内容仅更新 `conversation-data.ts` 的步骤数据。若简单任务需要状态节点，切换为 `ExecutionStep` 列表；若确有规划/并行/汇总链路，使用含 L3 的 `TaskBlock`，不要在本组件堆叠伪 L2。

## 常见坑
- 把 `flat` 理解为无过程，而省略可核验的动作或依据。
- 用动作类别决定可点击性；唯一条件是存在可查看目标。
