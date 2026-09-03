import type { PanelView } from "./panel-types"

/** 附件描述文案：Composer 的上传区与消息气泡里的 Attachment 共用，保持一致 */
export function formatFileSize(size: number): string {
  return size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${(size / 1024).toFixed(1)} KB`
}

export function fileTypeLabel(name: string): string {
  return name.split(".").pop()?.toUpperCase() ?? "文件"
}

/**
 * 纯前端演示中，浏览器 File 不会被持久化到消息数据；为实时上传文件生成可复用的右侧预览视图。
 * 不把 Office 二进制伪装为已解析内容，仅展示可信的文件元信息。
 */
export function createLocalFilePreview(name: string, size: number): Extract<PanelView, { type: "file-preview" }> {
  const fileType = fileTypeLabel(name)
  const readableSize = formatFileSize(size)
  const title = name.replace(/\.[^.]+$/, "") || name

  return {
    type: "file-preview",
    title,
    fileName: name,
    fileType: `${fileType} · ${readableSize}`,
    content: `# ${name}\n\n## 本地文件预览\n\n已在右侧面板打开本地上传文件。当前纯前端演示不会解析 **${fileType}** 的二进制正文，但会保留文件名称、类型与大小，便于在真实接入上传服务后替换为实际预览内容。\n\n- 文件类型：${fileType}\n- 文件大小：${readableSize}`,
  }
}
