---
name: agent-ux-reasoning-panel
description: "沉浸式复杂规划、协调与自纠错的可折叠思考依据。"
user-invocable: false
meta:
  id: reasoning-panel
  kind: component
  layer: process
  title: 思考面板 ReasoningPanel
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx
  whenToUse: [复杂规划、协调执行或自纠错需要展示依据时]
  whenNotToUse: [每轮执行默认追加一层思考, 用作结论正文]
  composeWith: [ExecutionProcess, ExecutionStep, FlatExecutionFlow, TaskBlock, MarkdownContent]
  composeBoundary: [使用 immersive ReasoningData, disclosure 逻辑是 conversation-flow 私有实现]
  pitfalls: [完成后默认展开, 收起内容仍可聚焦]
  designRules: [design.md#32-执行过程透明, design.md#38-一轮对话的结构与间距契约]
---

# 思考面板 ReasoningPanel

## 选型
仅在复杂规划、跨任务协调或自纠错确实需要用户理解依据时使用。它不是每轮执行的固定层级，也不能替代结论或交付物。

## 事实源与 API
公开导出：`ReasoningPanel({ reasoning })`。`reasoning` 为沉浸式 `ReasoningData`，包含 Markdown `content` 与运行状态。初始展开状态由 `reasoning.running` 决定。

## 结构、状态与无障碍
标题使用 Brain 图标、文字与 `aria-expanded` 的按钮。正文经 `MarkdownContent` 以 14px 的辅助信息排版输出；运行时初始展开，完成时默认收起。私有 `DisclosureContent` 保留动画内容，但关闭时设 `aria-hidden` 与 `inert`，避免隐藏链接/控件仍被聚焦。

## 组合边界
思考属于沉浸式 rich flow 数据，不进入 shared conversation 类型，也不形成 Copilot 的右侧容器。不可绕过 `MarkdownContent` 自行散落 Markdown 样式。

## 扩展方式
仅补充场景内容时改 `conversation-data.ts`。若改变展示时机或 disclosure 行为，修改 `conversation-flow.tsx` 的宿主实现，并检查 reduced-motion 与焦点行为；不要复制一个第二套折叠实现。

## 常见坑
- 把常规执行日志包装成“思考过程”。
- 收起时只视觉隐藏，仍让其中内容可 Tab 聚焦。
