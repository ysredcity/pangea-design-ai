import type { ContextItem } from "./composer"
import type { MessageAttachment } from "@/agent-ui/immersive/contracts"

/**
 * 把 Composer 发送出来的上下文拆成用户消息需要的部分，供对话页与新对话页共用：
 *
 * - 本地上传文件 → `attachments`，渲染为独立 Attachment。
 * - 文件库 / 最近的对话 / 技能 → 已经作为 `[[类型:名称]]` 标记写在消息文本里，这里不再重复。
 * - 专家 → `expert`，等于指定了执行这条指令的子智能体，显示在智能体消息开头而不是用户消息里。
 *   Composer 同时只能选一个专家，所以是单值。
 * - 连接器 → **不进消息流**。它是发送时的即时调用行为，只影响这一次请求怎么执行，
 *   不是用户消息的内容；执行过程里的「调用连接器 x」Badge 已经体现了它。
 */
export function splitSentContext(message: string, context: ContextItem[]): {
  content: string
  attachments: MessageAttachment[]
  expert?: string
} {
  const attachments = context
    .filter((item) => item.type === "upload")
    .map((item) => ({ id: item.id, name: item.label, size: item.size ?? 0, target: item.target }))
  const expert = context.find((item) => item.type === "专家")?.label
  const fallback = attachments.length > 0 ? "" : `已添加 ${context.map((item) => item.label).join("、")}`
  return { content: message || fallback, attachments, expert }
}
