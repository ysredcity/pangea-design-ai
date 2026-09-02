/** 附件描述文案：Composer 的上传区与消息气泡里的 Attachment 共用，保持一致 */
export function formatFileSize(size: number): string {
  return size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${(size / 1024).toFixed(1)} KB`
}

export function fileTypeLabel(name: string): string {
  return name.split(".").pop()?.toUpperCase() ?? "文件"
}
