---
name: agent-ux-artifact-panel
description: "沉浸式右侧独立面板的 Tab 框架与全局控制。"
user-invocable: false
meta:
  id: artifact-panel
  kind: component
  layer: artifact
  title: 独立面板 ArtifactPanel
  exported: true
  source: skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/artifact-panel.tsx
  whenToUse: [需要并排查看多个非图片产物的沉浸式右侧容器]
  whenNotToUse: [单张图片专注查看, Copilot 左侧画布, 承载类型专属容器逻辑]
  composeWith: [panelContainers, PanelTab, PanelView, AgentShell]
  composeBoundary: [壳层只管理 Tab/全局操作/layout, Toolbar 与 Body 来自 registry]
  pitfalls: [按 view.type 在壳层分支, 窄屏仍显示无效全屏切换]
  designRules: [design.md#22-响应式与空间分配, design.md#35-结果呈现与产物容器, design.md#53-无障碍与包容性]
---

# 独立面板 ArtifactPanel

## 选型
当多个可并排比较的沉浸式非图片产物需要在右侧同时保留时使用 Tab 面板。重复打开同一产物应切换既有 Tab；图片应改用 `ImageViewer`。

## 事实源与 API
公开导出：`ArtifactPanel({ fullscreen, tabs, activeTabId, onSelectTab, onCloseTab, onClose, onNavigate, onToggleFullscreen? })`。`PanelHeader`、`PanelHeaderAction`、`PanelTabItem` 是文件私有。组件从 `panelContainers[view.type]` 解析 `Toolbar`/`Body`；不存在 view 时返回 `null`。

## 结构、状态与无障碍
外层是 `aside aria-label="独立面板"`，顶部 `role="tablist"` 及具备 `role="tab"`、`aria-selected` 的 Tab。仅当 Tab 超过一个时可关闭单个 Tab。全屏、关闭是全局操作并带 Tooltip；未传 `onToggleFullscreen` 时不渲染全屏按钮，匹配窄屏强制全屏。

## 组合边界
它不含容器类型的业务分支，也不决定产物去向或 Tab 生命周期；这些分别由 registry 和 `AgentShell` 负责。Copilot 不使用本组件，其中立产物路由至左侧工作画布。

## 扩展方式
仅增加内容改 `panel-data.ts`。增加容器类型先更新 `PanelView`、容器实现和 registry，面板会自动调度。修改 Tab/关闭/全屏行为时改该文件与 shell 状态，保留“重复选择已有 Tab、最后一个关闭后清理”的既有生命周期。

## 常见坑
- 在此组件判断搜索/网页/文件类型并渲染，破坏 registry 边界。
- 在 <740px 强制全屏时保留无实际作用的切换按钮。
