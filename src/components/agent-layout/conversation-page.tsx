import { useRef, useState } from "react"
import { ArrowDown, IndentIncrease, Menu, MessageSquarePlus, MoreHorizontal, Pencil, Pin, PinOff, SquarePen, Trash2 } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Composer } from "./composer"
import { IconButton } from "./icon-button"
import type { Conversation } from "./sidebar"
import { ConversationFlow, UserMessage } from "./conversation-flow"
import { createDraftScene, formatTimestamp } from "./conversation-data"
import type { ArtifactTarget } from "./panel-types"

type ConversationPageProps = {
  conversation: Conversation
  isSidebarDocked: boolean
  onNewChat: () => void
  onOpenSidebar: () => void
  onOpenArtifact: (target: ArtifactTarget) => void
  onPinnedChange: (conversation: Conversation, pinned: boolean) => void
  onRename: (conversation: Conversation) => void
  pinned: boolean
}

export function ConversationPage({ conversation, isSidebarDocked, onNewChat, onOpenArtifact, onOpenSidebar, onPinnedChange, onRename, pinned }: ConversationPageProps) {
  const mobile = useMediaQuery("(max-width: 659px)")
  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [titleTruncated, setTitleTruncated] = useState(false)
  const [sentMessages, setSentMessages] = useState<{ content: string; timestamp: string }[]>([])

  const updateScrollButton = () => {
    const content = contentRef.current
    if (content) setShowScrollToBottom(content.scrollHeight - content.scrollTop - content.clientHeight > 48)
  }

  const checkTitleTruncation = () => {
    const title = titleRef.current
    setTitleTruncated(Boolean(title && title.scrollWidth > title.clientWidth))
  }

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
        <div ref={contentRef} className="min-h-0 w-full flex-1 overflow-y-auto px-4" onScroll={updateScrollButton}>
          <div className="mx-auto min-h-full w-full max-w-3xl py-3">
            <ConversationFlow scene={conversation.scene ?? createDraftScene(conversation.initialMessage || conversation.title, conversation.contextLabels)} onOpenArtifact={onOpenArtifact} />
            {sentMessages.length > 0 && <div className="mt-10 space-y-10 text-[15px]">{sentMessages.map((message, index) => <UserMessage key={`${message.content}-${index}`} content={message.content} timestamp={message.timestamp} />)}</div>}
          </div>
        </div>

        {/* 定位到底部按钮挂在 footer 上沿，不用写死 bottom 值，Composer 高度变化时位置自动跟随 */}
        <footer className="relative w-full shrink-0 px-4">
          {showScrollToBottom && <Tooltip><TooltipTrigger render={<IconButton aria-label="定位到底部" className="absolute bottom-full left-1/2 z-10 mb-3 size-9 -translate-x-1/2 border bg-card shadow-md [&_svg]:size-5" onClick={() => contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: "smooth" })}><ArrowDown /></IconButton>} /><TooltipContent side="top">定位到底部</TooltipContent></Tooltip>}
          <div className="mx-auto w-full max-w-3xl py-3"><Composer onSend={(message, context) => setSentMessages((items) => [...items, { content: message || `已添加 ${context.map((item) => item.label).join("、")}`, timestamp: formatTimestamp() }])} /><p className="mt-2 text-center text-xs tracking-[0.12px] text-ring">以上内容由AI生成</p></div>
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
