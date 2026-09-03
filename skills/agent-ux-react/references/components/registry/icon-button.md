---
name: agent-ux-icon-button
description: "基于本地 Base UI Button 的沉浸式图标按钮封装。"
user-invocable: false
meta:
  id: icon-button
  kind: component
  layer: registry
  title: 图标按钮 IconButton
  exported: true
  source: skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/icon-button.tsx
  whenToUse: [渲染沉浸式紧凑图标操作, 需要统一 ghost 与圆形基线]
  whenNotToUse: [没有可访问名称的纯图标控制, 以自定义 SVG 替代 Lucide, 将它作为状态表达的唯一方式]
  composeWith: [Button, Tooltip, Lucide icons]
  composeBoundary: [组件统一底层 Button 外观；调用者负责具体图标、aria-label、Tooltip 与触控尺寸]
  pitfalls: [认为组件自动添加 Tooltip, 遗漏 aria-label, 在默认尺寸下用于需要 44px 的触控场景]
  designRules: [design.md#64-图标, design.md#65-无障碍, design.md#66-动效]
---

# 图标按钮 IconButton

## 选型
`IconButton` 是沉浸式壳层的轻量基线：本地 Base UI `Button` 的 ghost、`icon-sm`、圆形变体。使用 Lucide 图标的紧凑操作时复用它，避免每个页面重复 Button 外观。

## 事实源与 API
当前仅导出 `IconButton`。它接收并转发 `ComponentProps<typeof Button>`，固定 `variant="ghost"`、`size="icon-sm"`，以 `rounded-full` 合并调用方 className。它不自行选择图标、设置 `aria-label` 或包裹 Tooltip。

## 结构、状态与无障碍
调用方必须传递描述性 `aria-label`，并在仅图标且需要解释时配套本地 Tooltip；`ConversationPage`、`AgentSidebar` 是现有组合示例。默认 `icon-sm` 适合紧凑桌面密度；移动端或明确触控入口必须用 className 扩至至少 44px 的可点击区域，不能只放大 SVG。

图标只使用 Lucide；危险动作由承载菜单/按钮选择 destructive 语义，不把颜色或图标单独当状态文本。

## 组合边界
该封装不负责对象视觉映射，导航/上下文去 `icon-registry.ts`，文件/专家去 `resource-visuals.tsx`。它也不定义 Tooltip Provider；顶层 `AgentShell` 提供 Provider，调用点按语义添加 Tooltip。

## 扩展方式
需要统一的视觉基线时扩展底层 Button 或本组件的通用约束；不要为单个页面在 JSX 重造图标按钮。需要新对象图标先更新对应 registry。

## 常见坑
- 未传 `aria-label`，误以为图标或 Tooltip 文案会自动成为可访问名。
- 将 Tooltip 责任塞回通用按钮，导致菜单 trigger 组合受限。
- 移动端保留小于 44px 的命中区域。