import type { ContextType } from "./icon-registry"

/**
 * 内联标签的单一事实源。
 *
 * Composer 里用户插入的文件库/最近的对话/技能是 DOM 里的标签节点，
 * 发送后需要在消息气泡中还原成同样的 badge，因此消息文本用 `[[类型:名称]]` 标记承载位置信息。
 * Composer 负责生成标记，对话流负责解析，两端都从这里取格式，不各写一套正则。
 */
const INLINE_TAG_PATTERN = /\[\[([^:\]]+):([^\]]+)\]\]/g

/** 内联标签的基础样式，Composer 命令式创建标签节点时复用 */
export const INLINE_TAG_CLASS = "mx-0.5 inline-flex max-w-60 items-center gap-1 rounded-md bg-primary-bg px-1.5 align-middle text-[15px] leading-6 text-primary"

export function formatInlineTag(type: ContextType, label: string): string {
  return `[[${type}:${label}]]`
}

export type MessageSegment =
  | { kind: "text"; value: string }
  | { kind: "tag"; type: ContextType; label: string }

/** 把含标记的消息文本拆成文本段与标签段；无标记时返回单个文本段 */
export function parseInlineTags(content: string): MessageSegment[] {
  const segments: MessageSegment[] = []
  let lastIndex = 0
  for (const match of content.matchAll(INLINE_TAG_PATTERN)) {
    const [marker, type, label] = match
    if (match.index > lastIndex) segments.push({ kind: "text", value: content.slice(lastIndex, match.index) })
    segments.push({ kind: "tag", type: type as ContextType, label })
    lastIndex = match.index + marker.length
  }
  if (lastIndex < content.length) segments.push({ kind: "text", value: content.slice(lastIndex) })
  return segments
}

export function hasInlineTags(content: string): boolean {
  return new RegExp(INLINE_TAG_PATTERN.source).test(content)
}
