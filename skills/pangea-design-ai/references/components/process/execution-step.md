---
name: agent-ux-execution-step
description: "沉浸式 L3 执行节点的状态、连接线和产物动作。"
user-invocable: false
meta:
  id: execution-step
  kind: component
  layer: process
  title: 执行步骤 ExecutionStep
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx
  whenToUse: [在非 flat 的 L1 过程内展示带状态的 L3 步骤]
  whenNotToUse: [创建 L2 分组, 取代无状态的 flat 详情]
  composeWith: [ExecutionProcess, ExecutionActionBadge, ReasoningPanel]
  composeBoundary: [使用 immersive ExecutionStepData 与 ArtifactRouter, 不接受 shared 同名类型]
  pitfalls: [状态只靠颜色, 非最后节点遗漏 connected 连接线]
  designRules: [design.md#32-执行过程透明, design.md#41-五种状态语言, design.md#323-有产物的动作才做成可点击资源]
---

# 执行步骤 ExecutionStep

## 选型
用于非 flat 执行过程的 L3：需要让用户看到某一步的完成、运行或待处理状态及其相关动作/依据时使用。

## 事实源与 API
公开导出：`ExecutionStep({ step, connected = false, onOpenArtifact })`。`step` 是沉浸式 `ExecutionStepData`；`connected` 控制后续垂直连接线。支持 `completed | running | pending`、可选详情、动作和思考。

## 结构、状态与无障碍
运行中显示 `Spinner`，完成显示勾选圆形，待处理显示低强调圆形；文字状态与图标共同传达而非只靠颜色。非末项传 `connected` 时显示连接线。动作和思考分别委派给 `ExecutionActionBadge`、`ReasoningPanel`。

## 组合边界
它是 L3，不承担 L1 总结或 L2 分组。不要把 shared `ExecutionStep` 直接传入：shared 仅定义浅层执行数据和中立 `ArtifactTarget`。

## 扩展方式
修改步骤内容与目标在 `conversation-data.ts`。增加新状态时必须同时更新数据契约、图标/文字语义和本组件；新增动作类型要同步维护宿主私有 `actionIcons`。

## 常见坑
- 只改图标颜色，遗漏 Spinner/完成/待处理的语义差异。
- “已生成 X”和最终交付附件指向不同产物目标。
