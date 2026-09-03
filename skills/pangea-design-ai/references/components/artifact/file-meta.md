---
name: agent-ux-file-meta
description: "附件大小、文件类型标签与本地文件预览 adapter 的纯数据工具。"
user-invocable: false
meta:
  id: file-meta
  kind: contract
  layer: artifact
  title: 文件元信息 File Meta
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/file-meta.ts
  whenToUse: [为 Composer 与消息附件生成一致文件类型、大小和本地预览信息]
  whenNotToUse: [伪装 Office 二进制已被解析, 在此维护文件图标或专家头像]
  composeWith: [MessageAttachmentList, LibraryFileIcon, FilePreviewBody, PanelView]
  composeBoundary: [元信息与预览 adapter 在此, 文件/专家视觉映射在 resource-visuals.tsx]
  pitfalls: [将本地文件当持久化内容, 复制格式化逻辑]
  designRules: [design.md#35-结果呈现与产物容器, design.md#64-图标]
---

# 文件元信息 File Meta

## 选型
用于 Composer 上传区和消息附件中一致地显示大小、文件扩展名标签，并为纯前端本地上传生成可信的文件预览 adapter。

## 事实源与 API
`file-meta.ts` 公开导出：`formatFileSize(size)`（MB 或 KB 一位小数）、`fileTypeLabel(name)`（取扩展名的大写，缺失时为“文件”）、`createLocalFilePreview(name, size)`（返回 `Extract<PanelView, { type: 'file-preview' }>`）。后者生成文件名、类型/大小和说明性 Markdown，不解析二进制正文。

## 结构、状态与无障碍
本地预览明确说明“纯前端演示不会解析二进制正文”，只展示可信元信息；用户通过真实 file-preview target 才可打开。视觉图标不在本文件决定：附件图标由 `resource-visuals.tsx` 的 `LibraryFileIcon` 负责。

## 组合边界
不要把文件扩展名映射、专家头像或通用上下文图标加到这里；它们分别属于 `resource-visuals.tsx` 与 `icon-registry.ts`。该函数返回沉浸式 `PanelView` adapter，不能写入 shared `ArtifactTarget`。

## 扩展方式
调整大小格式或本地预览说明时改本文件。增加新的可视图标走 `resource-visuals.tsx`；新增文件容器类型走 panel types → containers → registry。接入真实上传/解析服务后以真实内容替换占位，不能声称未解析的 Office 文件已有正文。

## 常见坑
- 将浏览器 `File` 当作已持久化到消息数据。
- 在多个消息/Composer 组件各自格式化 KB/MB，造成不一致。
