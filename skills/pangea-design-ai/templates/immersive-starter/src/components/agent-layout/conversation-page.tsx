import { useLayoutEffect, useRef, useState } from "react"
import { ArrowDown, IndentIncrease, Menu, MessageSquarePlus, MoreHorizontal, Pencil, Pin, PinOff, SquarePen, Trash2 } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Composer } from "./composer"
import { IconButton } from "./icon-button"
import type { Conversation } from "./sidebar"
import { ConversationFlow, UserMessage } from "./conversation-flow"
import type { ProductBlockAction } from "@/agent-ui/conversation"
import { formatTimestamp, type MessageAttachment } from "@/agent-ui/immersive/contracts"
import { splitSentContext } from "./message-context"
import type { AppConfig } from "@/agent-ui/immersive/contracts"
import type { ArtifactTarget } from "@/agent-ui/immersive/contracts"

type ConversationPageProps = {
  config: AppConfig
  createDraftScene: (content: string, expert?: string, attachments?: MessageAttachment[]) => NonNullable<Conversation["scene"]>
  conversation: Conversation
  isSidebarDocked: boolean
  onNewChat: () => void
  onOpenSidebar: () => void
  onOpenArtifact: (target: ArtifactTarget) => void
  onApprovalStatusChange: (conversation: Conversation, status: "approved" | "rejected") => void
  onPinnedChange: (conversation: Conversation, pinned: boolean) => void
  onRename: (conversation: Conversation) => void
  pinned: boolean
}

export function ConversationPage({ config, conversation, createDraftScene, isSidebarDocked, onApprovalStatusChange, onNewChat, onOpenArtifact, onOpenSidebar, onPinnedChange, onRename, pinned }: ConversationPageProps) {
  const mobile = useMediaQuery("(max-width: 659px)")
  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [titleTruncated, setTitleTruncated] = useState(false)
  const [composerDraft, setComposerDraft] = useState("")
  const [sentMessages, setSentMessages] = useState<{ content: string; timestamp: string; attachments: MessageAttachment[] }[]>([])
  const awaitingApproval = conversation.approvalStatus === "pending"

  // 会话切换时在首次绘制前定位到最新消息，避免长对话从顶部开始阅读。
  useLayoutEffect(() => {
    const content = contentRef.current
    if (!content) return
    content.scrollTop = content.scrollHeight
    setShowScrollToBottom(false)
  }, [conversation.id])

  const updateScrollButton = () => {
    const content = contentRef.current
    if (content) setShowScrollToBottom(content.scrollHeight - content.scrollTop - content.clientHeight > 48)
  }

  const checkTitleTruncation = () => {
    const title = titleRef.current
    setTitleTruncated(Boolean(title && title.scrollWidth > title.clientWidth))
  }

  const handleProductBlockAction = (action: ProductBlockAction) => {
    if (action.type === "follow-up-select") {
      setComposerDraft(action.content)
      return
    }
    if (action.type === "confirm-decision" && awaitingApproval) {
      if (action.decision === "confirm") onApprovalStatusChange(conversation, "approved")
      if (action.decision === "cancel") onApprovalStatusChange(conversation, "rejected")
    }
  }

  const renderProductBlock = config.renderProductBlock
    ? (block: Parameters<NonNullable<AppConfig["renderProductBlock"]>>[0], context: Parameters<NonNullable<AppConfig["renderProductBlock"]>>[1]) => {
        if (block.type === "follow-up-suggestions" && (!context.isLatestTurn || sentMessages.length > 0)) return null
        return config.renderProductBlock?.(block, context)
      }
    : undefined

  return (
    <>
      <header className="flex h-13 shrink-0 items-center gap-4 border-b px-4 max-[659px]:border-b-0">
        <div className="flex min-w-0 flex-1 items-center gap-1 max-[659px]:gap-3">
          {!isSidebarDocked && !mobile && <HeaderAction label="展开导航" onClick={onOpenSidebar}><IndentIncrease /></HeaderAction>}
          {!isSidebarDocked && !mobile && <HeaderAction label="新对话" onClick={onNewChat}><SquarePen /></HeaderAction>}
          {mobile && (
            <HeaderAction
              label="展开导航"
              onClick={onOpenSidebar}
              className="size-10 border border-white/80 bg-background/65 shadow-[0_4px_12px_rgba(0,0,0,0.10)] backdrop-blur-2xl dark:border-white/10 [&_svg]:size-5"
            >
              <Menu />
            </HeaderAction>
          )}
          <Tooltip>
            <TooltipTrigger render={<h1 ref={titleRef} className="ml-1 truncate text-base font-medium max-[659px]:ml-0" onPointerEnter={checkTitleTruncation}>{conversation.title}</h1>} />
            {titleTruncated && <TooltipContent side="bottom" className="max-w-72">{conversation.title}</TooltipContent>}
          </Tooltip>
        </div>
        {mobile ? (
          <div className="flex h-10 shrink-0 items-center rounded-full border border-white/80 bg-background/65 px-1 shadow-[0_4px_12px_rgba(0,0,0,0.10)] backdrop-blur-2xl dark:border-white/10">
            <IconButton aria-label="新对话" className="size-9 [&_svg]:size-5" onClick={onNewChat}><MessageSquarePlus /></IconButton>
            <span className="h-[18px] w-px bg-border" />
            <ConversationMoreMenu conversation={conversation} pinned={pinned} onPinnedChange={onPinnedChange} onRename={onRename} buttonClassName="size-9 [&_svg]:size-5" />
          </div>
        ) : (
          <ConversationMoreMenu conversation={conversation} pinned={pinned} onPinnedChange={onPinnedChange} onRename={onRename} />
        )}
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col items-center overflow-hidden">
        {/* 隐藏滚动条：滚动能力保留，靠内容截断和「定位到底部」按钮提示可滚动 */}
        <div ref={contentRef} className="no-scrollbar min-h-0 w-full flex-1 overflow-y-auto px-4" onScroll={updateScrollButton}>
          <div className="mx-auto min-h-full w-full max-w-3xl py-3">
            <ConversationFlow key={conversation.id} approvalStatus={conversation.approvalStatus} scene={conversation.scene ?? createDraftScene(conversation.initialMessage || conversation.title, conversation.expert)} identity={config.identity} experts={config.experts} renderProductBlock={renderProductBlock} onProductBlockAction={handleProductBlockAction} onOpenArtifact={onOpenArtifact} />
            {sentMessages.length > 0 && <div className="mt-10 space-y-10 text-[15px]">{sentMessages.map((message, index) => <UserMessage key={`${message.content}-${index}`} message={message} onOpenArtifact={onOpenArtifact} />)}</div>}
          </div>
        </div>

        {/* 定位到底部按钮挂在 footer 上沿，不用写死 bottom 值，Composer 高度变化时位置自动跟随 */}
        <footer className="relative w-full shrink-0 px-4">
          {showScrollToBottom && <Tooltip><TooltipTrigger render={<IconButton aria-label="定位到底部" className="absolute bottom-full left-1/2 z-10 mb-3 size-9 -translate-x-1/2 border bg-card shadow-md hover:bg-sidebar dark:hover:bg-sidebar [&_svg]:size-5" onClick={() => contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: "smooth" })}><ArrowDown /></IconButton>} /><TooltipContent side="top">定位到底部</TooltipContent></Tooltip>}
          <div className="mx-auto w-full max-w-3xl py-3"><Composer disabled={awaitingApproval} draft={composerDraft} onDraftChange={setComposerDraft} onSend={(message, context) => { setSentMessages((items) => [...items, { ...splitSentContext(message, context), timestamp: formatTimestamp() }]); setComposerDraft("") }} /><p className="mt-2 text-center text-xs tracking-[0.12px] text-ring">以上内容由AI生成</p></div>
        </footer>
      </div>
    </>
  )
}

function HeaderAction({ children, className, label, onClick }: { children: React.ReactNode; className?: string; label: string; onClick: () => void }) {
  return <Tooltip><TooltipTrigger render={<IconButton aria-label={label} className={className} onClick={onClick}>{children}</IconButton>} /><TooltipContent side="bottom">{label}</TooltipContent></Tooltip>
}

function ConversationMoreMenu({ buttonClassName, conversation, onPinnedChange, onRename, pinned }: {
  buttonClassName?: string
  conversation: Conversation
  onPinnedChange: (conversation: Conversation, pinned: boolean) => void
  onRename: (conversation: Conversation) => void
  pinned: boolean
}) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger render={<DropdownMenuTrigger render={<IconButton aria-label="更多操作" className={buttonClassName}><MoreHorizontal /></IconButton>} />} />
        <TooltipContent side="bottom">更多操作</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-40">
        <DropdownMenuItem onClick={() => onRename(conversation)}><Pencil />重命名</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPinnedChange(conversation, !pinned)}>{pinned ? <PinOff /> : <Pin />}{pinned ? "取消置顶" : "置顶"}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive"><Trash2 />删除对话</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
