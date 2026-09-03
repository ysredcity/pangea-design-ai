---
name: agent-ux-container-file-preview
description: "沉浸式 file-preview PanelView 的文件信息与 Markdown 预览容器。"
user-invocable: false
meta:
  id: container-file-preview
  kind: component
  layer: artifact
  title: 文件预览容器 File Preview Container
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/panel-containers.tsx
  whenToUse: [在独立面板中查看可读文件内容和文件元信息]
  whenNotToUse: [声称任意二进制文件已解析, 在消息正文重复完整文件内容]
  composeWith: [FilePreviewToolbar, FilePreviewBody, MarkdownContent, file-meta]
  composeBoundary: [文件操作属于容器 Toolbar, 内容经 MarkdownContent, 元信息工具不负责视觉图标]
  pitfalls: [绕过 MarkdownContent, 将下载/外部打开写到 Tab 全局控制]
  designRules: [design.md#35-结果呈现与产物容器, design.md#62-字号阶梯]
---

# 文件预览容器 File Preview Container

## 选型
用于 `PanelView.type === 'file-preview'`：用户需要在右侧对照对话阅读一份可呈现的文档内容时使用。

## 事实源与 API
公开导出 `FilePreviewToolbar({ view })` 与 `FilePreviewBody({ view })`。它们接收 file-preview 判别分支：Toolbar 显示文件名、可选 `fileType`、下载/外部打开图标；Body 用 `MarkdownContent` 渲染 `content`。

## 结构、状态与无障碍
工具栏截断过长文件名，图标按钮有 `aria-label`；正文在可滚动背景上使用语义文章容器与 Markdown 排版。无 `fileType` 时显示“文档”。真实二进制未被解析时，应使用 `createLocalFilePreview()` 的可信说明而不是伪造内容。

## 组合边界
文件类型/大小格式来自 `file-meta.ts`，附件/专家视觉映射来自 `resource-visuals.tsx`。不能绕过 `MarkdownContent` 在此重复排版规则，不能把文件专属操作放到全局 Tab 顶栏。

## 扩展方式
新增文件内容只改 `panel-data.ts` 或真实服务 adapter。调整预览布局改本容器；增加全新格式容器时按 panel types → containers → registry 扩展。

## 常见坑
- 将本地 Office 文件的元信息预览描述成已解析正文。
- 在对话结论里只写“已生成文件”，却不提供同一 `ArtifactTarget` 打开入口。
