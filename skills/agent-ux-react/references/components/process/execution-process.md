---
name: agent-ux-execution-process
description: "沉浸式 L1 执行过程的状态、折叠和 L2/L3 分流。"
user-invocable: false
meta:
  id: execution-process
  kind: component
  layer: process
  title: 执行过程 ExecutionProcess
  exported: true
  source: skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx
  whenToUse: [展示一轮沉浸式任务的总体状态与可展开执行证据]
  whenNotToUse: [替代共享 ConversationTurn 的浅层 execution, 为简单任务强行增加 L2]
  composeWith: [ReasoningPanel, FlatExecutionFlow, ExecutionStep, TaskBlock]
  composeBoundary: [仅沉浸式 rich flow 使用 ExecutionData, shared 域不含 L1/L2/L3 完整树]
  pitfalls: [完成过程默认展开, 将 L2 当作必需层级]
  designRules: [design.md#32-执行过程透明, design.md#38-一轮对话的结构与间距契约, design.md#41-四种状态语言]
---

# 执行过程 ExecutionProcess

## 选型
用于沉浸式 rich flow 的 L1：给整轮任务一个可查看、可收起的状态与证据入口。简单任务走 L1 → L3；只有“先规划、再分头执行、最后汇总”的长链路才增加 L2 `TaskBlock`。

## 事实源与 API
公开导出在 `conversation-flow.tsx`：`ExecutionProcess({ execution, current, onOpenArtifact })`。`execution` 是沉浸式 `conversation-data.ts` 的 `ExecutionData`，含 `status`（`completed | running | waiting`）、`summary`、可选 `duration`、`showSummary`、`reasoning`、L3 `steps`、可选 L2 `tasks` 与 `flat`。它不是 shared `ConversationTurn.execution` 的替代类型。

## 结构、状态与无障碍
运行中的当前轮初始展开；其余状态默认收起。标题展示“任务进行中… / 等待回复 / 任务耗时”与可选时长；运行中的当前轮带 shimmer。展开内容按顺序渲染可选思考、摘要、flat flow 或直接 L3，再渲染 L2 任务块。`DisclosureContent` 收起时保留过渡内容，但用 `aria-hidden` 和 `inert` 移除隐藏子元素的可访问性与焦点。

## 组合边界
仅在沉浸式 `AgentResponseBlock` 内与身份相邻编排；不能把 `ExecutionData`、`PanelView` 或 Tab 字段加入 shared conversation。Copilot 将中立 `ArtifactTarget` 路由至左侧画布，不采用本右侧面板路径。

## 扩展方式
仅新增示例过程数据时改 `conversation-data.ts`。新增状态或层级前先判断是否仍符合 L1/L2/L3；不要为视觉完整性制造 L2。要改变 rich flow 编排时修改宿主 `conversation-flow.tsx`，并说明为何公开接口不足。

## 常见坑
- 把已完成的过程默认展开，掩盖结论。
- L2 内嵌 L2，或没有可查看 L3。
- 将“等待回复”标成运行中，或只依靠颜色表达状态。
