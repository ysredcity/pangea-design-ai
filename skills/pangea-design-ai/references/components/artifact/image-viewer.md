---
name: agent-ux-image-viewer
description: "沉浸式图片产物的蒙层查看器、缩放与旋转交互。"
user-invocable: false
meta:
  id: image-viewer
  kind: component
  layer: artifact
  title: 图片查看器 ImageViewer
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/image-viewer.tsx
  whenToUse: [专注查看单个 immersive ImageView 图片产物]
  whenNotToUse: [多文档并排查看, 将图片塞进右侧 PanelTab, 处理 shared ArtifactTarget]
  composeWith: [ImageView, AgentShell, IconButton]
  composeBoundary: [ViewerAction 为文件私有, 图片不进入 ArtifactPanel tabs]
  pitfalls: [遗漏 Esc/蒙层关闭, 以为下载会跨壳层路由]
  designRules: [design.md#35-结果呈现与产物容器, design.md#43-动效原则, design.md#53-无障碍与包容性]
---

# 图片查看器 ImageViewer

## 选型
用于单个图片产物的专注查看。`ImageView` 不进入独立面板 Tab；要并排管理的搜索、网页、文件等 `PanelView` 才使用 `ArtifactPanel`。

## 事实源与 API
公开导出：`ImageViewer({ onClose, view })`，其中 `view` 为沉浸式 `ImageView`。`ZOOM_STEPS` 固定为 50%、75%、100%、150%、200%、300%；`ViewerAction` 是文件私有的 Tooltip/IconButton 包装，不可外部 import。

## 结构、状态与无障碍
渲染 `role="dialog"`、`aria-modal="true"` 和以标题命名的蒙层。支持点击蒙层、Escape 关闭，`+`/`=` 放大、`-` 缩小，按钮缩放、重置、90°旋转和下载。图片使用 `alt ?? title`；切换图片时 shell 以 `src` 为 key 重新挂载，恢复默认缩放和旋转。

## 组合边界
`AgentShell.openArtifact()` 将本地 `type: 'image'` adapter 直接设为 `imageView`；不创建 `PanelTab`。shared `ArtifactTarget` 与 Copilot 路由不含本查看器或任何右侧容器行为。

## 扩展方式
新增图片示例改 `panel-data.ts`。更改交互时改该文件，保留 dialog、键盘、蒙层和 reduced-motion 友好过渡；不要复制私有 `ViewerAction`。新增非图片容器遵循 panel types → containers → registry，不借图片查看器承载。

## 常见坑
- 只提供鼠标关闭，遗漏 Escape 与可访问 dialog 语义。
- 将图片按 Tab 打开，或假设 shared target 自动支持缩放/旋转。
