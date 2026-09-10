import { useState } from "react"

import { ConversationSurface, type ProductBlockAction } from "../../conversation"
import { formatTimestamp, type AppConfig, type ArtifactTarget, type ConversationScene, type MessageAttachment, type ProductIdentity, type WelcomeExpert } from "../contracts"
import { Composer } from "./composer"
import { ConversationFlow, UserMessage, type ProductBlockRenderer } from "./conversation-flow"
import { splitSentContext } from "./message-context"

type ConversationSectionProps = {
  approvalStatus?: "pending" | "approved" | "rejected"
  experts: readonly WelcomeExpert[]
  identity: ProductIdentity
  initialDraft?: string
  onApprovalDecision?: (status: "approved" | "rejected") => void
  onOpenArtifact: (target: ArtifactTarget) => void
  onProductBlockAction?: (action: ProductBlockAction) => void
  renderProductBlock?: ProductBlockRenderer
  scene: ConversationScene
}

/**
 * Agent 与 Copilot 共同使用的完整对话 section。
 * 它统一 rich Flow、rich Composer、消息追加、滚动与 footer；形态壳层只负责 Header、容器和 artifact adapter。
 */
export function ConversationSection({
  approvalStatus,
  experts,
  identity,
  initialDraft = "",
  onApprovalDecision,
  onOpenArtifact,
  onProductBlockAction,
  renderProductBlock,
  scene,
}: ConversationSectionProps) {
  const [composerDraft, setComposerDraft] = useState(initialDraft)
  const [sentMessages, setSentMessages] = useState<{ content: string; timestamp: string; attachments: MessageAttachment[] }[]>([])
  const awaitingApproval = approvalStatus === "pending"

  const handleProductBlockAction = (action: ProductBlockAction) => {
    if (action.type === "follow-up-select") setComposerDraft(action.content)
    if (action.type === "confirm-decision" && awaitingApproval) {
      if (action.decision === "confirm") onApprovalDecision?.("approved")
      if (action.decision === "cancel") onApprovalDecision?.("rejected")
    }
    onProductBlockAction?.(action)
  }

  const guardedRenderer = renderProductBlock
    ? ((block: Parameters<NonNullable<AppConfig["renderProductBlock"]>>[0], context: Parameters<NonNullable<AppConfig["renderProductBlock"]>>[1]) => {
        if (block.type === "follow-up-suggestions" && (!context.isLatestTurn || sentMessages.length > 0)) return null
        return renderProductBlock(block, context)
      })
    : undefined

  return (
    <ConversationSurface
      scrollKey={scene.id}
      footer={
        <Composer
          disabled={awaitingApproval}
          draft={composerDraft}
          onDraftChange={setComposerDraft}
          onSend={(message, context) => {
            setSentMessages((items) => [...items, { ...splitSentContext(message, context), timestamp: formatTimestamp() }])
            setComposerDraft("")
          }}
        />
      }
    >
      <ConversationFlow
        key={scene.id}
        approvalStatus={approvalStatus}
        scene={scene}
        identity={identity}
        experts={experts}
        renderProductBlock={guardedRenderer}
        onProductBlockAction={handleProductBlockAction}
        onOpenArtifact={onOpenArtifact}
      />
      {sentMessages.length > 0 && (
        <div className="mt-10 space-y-10 text-[15px]">
          {sentMessages.map((message, index) => <UserMessage key={`${message.content}-${index}`} message={message} onOpenArtifact={onOpenArtifact} />)}
        </div>
      )}
    </ConversationSurface>
  )
}
