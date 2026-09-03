import { ImmersiveAgentApp } from "@/agent-ui/immersive/agent-app"
import { appConfig } from "@/components/agent-layout/app-config"
import { createDraftScene } from "@/components/agent-layout/conversation-data"
import { scenes } from "@/components/agent-layout/scenes"

const initialPinnedConversations = [
  { id: "pinned-1", title: "如果用一个符号元素形容报表，应该用什么最形象", approvalStatus: "pending" as const },
]
const initialConversations = [
  { id: "chat-1", title: "帮我写个行业调研报告吧" },
  { id: "chat-2", title: "你能读取飞书文档吗？", loading: true },
  { id: "chat-3", title: "你是一个挑剔且专业的用户体验专家，帮我评审智能家居 App 的核心页面", unread: true },
  { id: "chat-4", title: "整理本周项目进展并生成周报", waitingForReply: true },
  { id: "chat-5", title: "下周去上海出差，帮我发起申请", waitingForReply: true },
]

/** Product configuration and seed scenes stay in the standalone template. */
export default function App() {
  return <ImmersiveAgentApp config={appConfig} scenes={scenes} initialPinnedConversations={initialPinnedConversations} initialConversations={initialConversations} createDraftScene={(content, expert, attachments) => ({ id: `draft-${Date.now()}`, ...createDraftScene(content, expert, attachments) })} />
}
