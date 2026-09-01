import { ConversationPage } from "./conversation-page"
import { NewConversationPage } from "./new-conversation-page"
import type { Conversation } from "./sidebar"
import type { ContextItem } from "./composer"
import type { ArtifactTarget } from "./panel-types"
import { cn } from "@/lib/utils"

type ChatWorkspaceProps = {
  activeConversation: Conversation | null
  activeConversationPinned: boolean
  isSidebarDocked: boolean
  onNewChat: () => void
  onPinnedChange: (conversation: Conversation, pinned: boolean) => void
  onRename: (conversation: Conversation) => void
  onOpenArtifact: (target: ArtifactTarget) => void
  onOpenSidebar: () => void
  onStartConversation: (message: string, context: ContextItem[]) => void
  panelOpen: boolean
  panelAtDefaultSplit: boolean
}

export function ChatWorkspace({
  activeConversation,
  activeConversationPinned,
  isSidebarDocked,
  onNewChat,
  onPinnedChange,
  onRename,
  onOpenArtifact,
  onOpenSidebar,
  onStartConversation,
  panelAtDefaultSplit,
}: ChatWorkspaceProps) {
  return (
    <section className={cn(
      "flex min-w-0 flex-1 flex-col bg-background-desktop min-[660px]:min-w-[420px]",
      panelAtDefaultSplit && "w-[420px] flex-none",
    )}>
      {activeConversation ? (
        <ConversationPage
          conversation={activeConversation}
          pinned={activeConversationPinned}
          isSidebarDocked={isSidebarDocked}
          onNewChat={onNewChat}
          onOpenSidebar={onOpenSidebar}
          onOpenArtifact={onOpenArtifact}
          onPinnedChange={onPinnedChange}
          onRename={onRename}
        />
      ) : (
        <NewConversationPage
          isSidebarDocked={isSidebarDocked}
          onOpenSidebar={onOpenSidebar}
          onStartConversation={onStartConversation}
        />
      )}
    </section>
  )
}
