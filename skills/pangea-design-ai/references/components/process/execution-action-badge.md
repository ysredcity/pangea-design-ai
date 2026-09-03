---
name: agent-ux-execution-action-badge
description: "沉浸式执行动作的可点击产物入口与说明 badge。"
user-invocable: false
meta:
  id: execution-action-badge
  kind: component
  layer: process
  title: 执行动作徽标 ExecutionActionBadge
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx
  whenToUse: [展示某一执行动作及其可查看产物]
  whenNotToUse: [为内部 API、脚本或无产物动作伪造链接, 复用为共享 ArtifactTarget API]
  composeWith: [ExecutionStep, FlatExecutionFlow, TaskBlock, ArtifactRouter]
  composeBoundary: [actionIcons 是 conversation-flow 私有映射, immersive target 由 AgentShell 适配]
  pitfalls: [按动作类型而非 target 决定可点击性, JSX 内重建图标映射]
  designRules: [design.md#323-有产物的动作才做成可点击资源, design.md#64-图标]
---

# 执行动作徽标 ExecutionActionBadge

## 选型
用一个紧凑 badge 说明执行了什么；仅在该动作拥有用户可查看的产物时提供打开入口。内部调用、技能、脚本或接口本身不是可点击理由。

## 事实源与 API
公开导出：`ExecutionActionBadge({ action, onOpenArtifact })`。`action` 是沉浸式 `ExecutionActionData`，当前 `type` 为 `skill | api | query | script | file | connector | knowledge | web`，并有 `label` 与可选 `target`。`onOpenArtifact` 接收本地 `panel-types.ts` 的 adapter target。

## 结构、状态与无障碍
有 `target` 时渲染可聚焦的 `button` 与 Chevron；否则为非交互 `span`。图标来自同一宿主文件私有 `actionIcons` 映射；标签截断且最大宽度 300px。若“已生成 X”对应最终交付附件，两处必须引用同一目标。

## 组合边界
`actionIcons` 不是公共注册表，不能从外部导入，也不要在任意 JSX 复制映射。shared `ArtifactTarget` 是中立语义，Copilot 走左侧画布；此 badge 使用的是沉浸式 adapter 路由。

## 扩展方式
新增示例动作改 `conversation-data.ts`。新增 `ExecutionActionData.type` 时同步更新类型、该私有映射与相应文档；添加新可查看容器时遵循 panel types → containers → registry，不能把容器分支加入壳层。

## 常见坑
- 为没有 `target` 的动作包一层空 button。
- 只因类型是 `web` 或 `file` 就可点，而未提供用户可查看产物。
