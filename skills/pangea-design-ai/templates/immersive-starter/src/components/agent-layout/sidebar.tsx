import { useRef, useState, type ComponentType } from "react"
import {
  ChevronRight,
  IndentDecrease,
  Moon,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Sun,
  Trash2,
  X,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { navigationIcons } from "./icon-registry"
import { IconButton } from "./icon-button"
import { AgentAvatar } from "./resource-visuals"
import type { ConversationScene } from "@/agent-ui/immersive/contracts"
import type { AppConfig } from "@/agent-ui/immersive/contracts"

export type Conversation = {
  id: string
  title: string
  loading?: boolean
  unread?: boolean
  waitingForReply?: boolean
  approvalStatus?: "pending" | "approved" | "rejected"
  initialMessage?: string
  expert?: string
  scene?: ConversationScene
}

// 保留示例数据的具名导出，避免改变模板使用者的深层导入 API。
// oxlint-disable-next-line react/only-export-components
export const initialPinnedConversations: Conversation[] = [
  { id: "pinned-1", title: "如果用一个符号元素形容报表，应该用什么最形象", approvalStatus: "pending" },
]

// 保留示例数据的具名导出，避免改变模板使用者的深层导入 API。
// oxlint-disable-next-line react/only-export-components
export const initialConversations: Conversation[] = [
  { id: "chat-1", title: "帮我写个行业调研报告吧" },
  { id: "chat-2", title: "你能读取飞书文档吗？", loading: true },
  {
    id: "chat-3",
    title: "你是一个挑剔且专业的用户体验专家，帮我评审智能家居 App 的核心页面",
    unread: true,
  },
  {
    id: "chat-4",
    title: "整理本周项目进展并生成周报",
    waitingForReply: true,
  },
  {
    id: "chat-5",
    title: "下周去上海出差，帮我发起申请",
    waitingForReply: true,
  },
]

type AgentSidebarProps = {
  config: Pick<AppConfig, "identity" | "navigation">
  activeConversationId: string | null
  className?: string
  darkMode: boolean
  drawer?: boolean
  onClose?: () => void
  onCollapse: () => void
  onDarkModeChange: (darkMode: boolean) => void
  onNewChat: () => void
  onPinnedChange: (conversation: Conversation, pinned: boolean) => void
  onRename: (conversation: Conversation) => void
  onSelectConversation: (conversation: Conversation) => void
  pinnedConversations: Conversation[]
  conversations: Conversation[]
  readConversationIds: Set<string>
}

export function AgentSidebar({
  config,
  activeConversationId,
  className,
  darkMode,
  drawer = false,
  onClose,
  onCollapse,
  onDarkModeChange,
  onNewChat,
  onPinnedChange,
  onRename,
  onSelectConversation,
  pinnedConversations,
  conversations,
  readConversationIds,
}: AgentSidebarProps) {
  const [pinnedOpen, setPinnedOpen] = useState(true)
  const [conversationsOpen, setConversationsOpen] = useState(true)

  return (
    <ShadcnSidebar
      collapsible="none"
      className={cn(
        "h-full shrink-0 border-r border-sidebar-border [--sidebar-width:240px]",
        drawer && "[--sidebar-width:320px] shadow-2xl",
        className,
      )}
    >
      <SidebarHeader
        className={cn(
          "h-13 flex-row items-center gap-2 p-3",
          drawer && "h-14 px-4 pb-2 pt-5",
        )}
      >
        {/* 产品身份与对话流里的智能体身份共用同一头像与名称 */}
        <div className="flex min-w-0 flex-1 items-center gap-2 text-sidebar-accent-foreground">
          <AgentAvatar productAvatar={config.identity.avatar} className="size-7 [&_svg]:size-4" />
          <span className={cn("truncate font-semibold", drawer ? "text-lg tracking-[-0.18px]" : "text-base")}>
            {config.identity.name}
          </span>
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <IconButton
                aria-label={drawer ? "关闭导航" : "收起导航"}
                className={cn(
                  "text-sidebar-accent-foreground hover:bg-sidebar-accent",
                  drawer && "size-10 rounded-[10px] [&_svg]:size-6",
                )}
                onClick={drawer ? onClose : onCollapse}
              >
                {drawer ? <X /> : <IndentDecrease />}
              </IconButton>
            }
          />
          <TooltipContent side="right">{drawer ? "关闭导航" : "收起导航"}</TooltipContent>
        </Tooltip>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className={cn("gap-0.5 p-2", drawer && "gap-2 p-3")}>
          <SidebarMenu>
            {config.navigation.map((item) => (
              <PrimaryMenuItem
                key={item.id}
                drawer={drawer}
                icon={navigationIcons[item.visualKey]}
                label={item.label}
                outline={item.id === "new-conversation"}
                onClick={item.id === "new-conversation" ? onNewChat : undefined}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {pinnedConversations.length > 0 && (
          <ConversationGroup
            drawer={drawer}
            label="已置顶"
            open={pinnedOpen}
            onOpenChange={setPinnedOpen}
            conversations={pinnedConversations}
            onPinnedChange={onPinnedChange}
            onRename={onRename}
            onSelectConversation={onSelectConversation}
            activeConversationId={activeConversationId}
            readConversationIds={readConversationIds}
            pinned
          />
        )}

        {conversations.length > 0 && (
          <ConversationGroup
            drawer={drawer}
            label="对话"
            open={conversationsOpen}
            onOpenChange={setConversationsOpen}
            conversations={conversations}
            onPinnedChange={onPinnedChange}
            onRename={onRename}
            onSelectConversation={onSelectConversation}
            activeConversationId={activeConversationId}
            readConversationIds={readConversationIds}
          />
        )}
      </SidebarContent>

      <SidebarFooter className={cn("flex-row justify-end p-3", drawer && "p-4")}>
        <Tooltip>
          <TooltipTrigger
            render={
              <IconButton
                aria-label={darkMode ? "切换到浅色模式" : "切换到深色模式"}
                className={cn(
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  drawer && "size-10 rounded-[10px] [&_svg]:size-5",
                )}
                onClick={() => onDarkModeChange(!darkMode)}
              >
                {darkMode ? <Sun /> : <Moon />}
              </IconButton>
            }
          />
          <TooltipContent side="top">
            {darkMode ? "浅色模式" : "深色模式"}
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>

    </ShadcnSidebar>
  )
}

function PrimaryMenuItem({
  drawer = false,
  icon: Icon,
  label,
  onClick,
  outline = false,
}: {
  drawer?: boolean
  icon: ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
  outline?: boolean
}) {
  return (
    <SidebarMenuItem className={cn(drawer && "mb-0.5")}>
      <SidebarMenuButton
        className={cn(
          "h-9 rounded-[10px] px-2 text-sm font-medium text-sidebar-accent-foreground data-active:border data-active:border-sidebar-border data-active:bg-card data-active:shadow-xs",
          outline && "border border-sidebar-border bg-card shadow-xs hover:bg-sidebar-accent",
          drawer && "h-10 px-2.5 text-base [&_svg]:size-[18px]",
          drawer && outline && "mb-2 h-12 justify-center rounded-full",
        )}
        onClick={onClick}
      >
        <Icon />
        <span className="px-1.5">{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function ConversationGroup({
  activeConversationId,
  conversations: items,
  drawer,
  label,
  onOpenChange,
  onPinnedChange,
  onRename,
  onSelectConversation,
  readConversationIds,
  open,
  pinned = false,
}: {
  activeConversationId: string | null
  conversations: Conversation[]
  drawer: boolean
  label: string
  onOpenChange: (open: boolean) => void
  onPinnedChange: (conversation: Conversation, pinned: boolean) => void
  onRename: (conversation: Conversation) => void
  onSelectConversation: (conversation: Conversation) => void
  readConversationIds: Set<string>
  open: boolean
  pinned?: boolean
}) {
  return (
    <SidebarGroup className={cn("group/conversation-group gap-0.5 p-2", drawer && "p-3")}>
      <SidebarGroupLabel
        render={<button type="button" />}
        className="group/label h-8 cursor-pointer rounded-[10px] px-2 text-sm font-normal text-sidebar-foreground hover:bg-sidebar-accent"
        onClick={() => onOpenChange(!open)}
      >
        <span>{label}</span>
        <span className="grid size-4 place-items-center opacity-0 transition-opacity group-hover/label:opacity-100 group-focus-visible/label:opacity-100">
          <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} />
        </span>
      </SidebarGroupLabel>
      {open && (
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((conversation) => (
              <ConversationMenuItem
                key={conversation.id}
                conversation={conversation}
                drawer={drawer}
                pinned={pinned}
                onPinnedChange={onPinnedChange}
                onRename={onRename}
                onSelectConversation={onSelectConversation}
                active={conversation.id === activeConversationId}
                unread={Boolean(conversation.unread && !readConversationIds.has(conversation.id))}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  )
}

function ConversationMenuItem({
  active,
  conversation,
  drawer,
  onPinnedChange,
  onRename,
  onSelectConversation,
  pinned,
  unread,
}: {
  active: boolean
  conversation: Conversation
  drawer: boolean
  onPinnedChange: (conversation: Conversation, pinned: boolean) => void
  onRename: (conversation: Conversation) => void
  onSelectConversation: (conversation: Conversation) => void
  pinned: boolean
  unread: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [titleTruncated, setTitleTruncated] = useState(false)
  const titleRef = useRef<HTMLSpanElement>(null)

  const checkTitleTruncation = () => {
    const title = titleRef.current
    setTitleTruncated(Boolean(title && title.scrollWidth > title.clientWidth))
  }

  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger
          render={
            <SidebarMenuButton
              isActive={active}
              className={cn(
                "h-8 rounded-[10px] px-2 pr-7 text-sm font-normal text-foreground hover:text-foreground data-active:bg-sidebar-accent data-active:font-normal data-active:text-foreground",
                (conversation.waitingForReply || conversation.approvalStatus === "pending") && "pr-[76px]",
                drawer && "h-10 px-1 pr-9 text-base",
                drawer && (conversation.waitingForReply || conversation.approvalStatus === "pending") && "pr-[88px]",
              )}
              onFocus={checkTitleTruncation}
              onPointerEnter={checkTitleTruncation}
              onClick={() => onSelectConversation(conversation)}
            >
              <span ref={titleRef} className={cn("truncate px-1", drawer && "px-1.5")}>{conversation.title}</span>
            </SidebarMenuButton>
          }
        />
        {titleTruncated && (
          <TooltipContent side="right" className="max-w-72">
            {conversation.title}
          </TooltipContent>
        )}
      </Tooltip>

      {conversation.loading && (
        <SidebarMenuBadge className={cn("right-2 top-1.5 z-10 transition-[right] group-hover/menu-item:right-8", drawer && "top-2.5 group-hover/menu-item:right-11")}>
          <Spinner className={cn("size-4", drawer && "size-[18px]")} />
        </SidebarMenuBadge>
      )}
      {unread && (
        <SidebarMenuBadge className={cn("right-2 top-2 z-10 transition-opacity group-hover/menu-item:opacity-0", drawer && "top-3")}> 
          <span className="size-2 rounded-full bg-success" />
        </SidebarMenuBadge>
      )}
      {conversation.approvalStatus === "pending" && (
        <SidebarMenuBadge
          className={cn(
            "right-2 top-1.5 h-5 rounded-md bg-destructive-bg px-1.5 text-xs font-normal text-destructive-foreground! transition-opacity group-hover/menu-item:opacity-0",
            drawer && "top-2.5 px-2 text-sm",
          )}
        >
          等待批准
        </SidebarMenuBadge>
      )}
      {conversation.waitingForReply && conversation.approvalStatus !== "pending" && (
        <SidebarMenuBadge
          className={cn(
            "right-2 top-1.5 h-5 rounded-md bg-warning/10 px-1.5 text-xs font-normal text-warning-foreground! transition-opacity group-hover/menu-item:opacity-0",
            drawer && "top-2.5 px-2 text-sm",
          )}
        >
          等待回复
        </SidebarMenuBadge>
      )}

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <Tooltip>
          <TooltipTrigger
            render={
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    aria-label={`${conversation.title}的更多操作`}
                    className={cn(
                      "absolute right-1 top-1.5 z-10 grid size-5 place-items-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground opacity-0 outline-none transition-opacity hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring group-hover/menu-item:opacity-100",
                      menuOpen && "opacity-100",
                      drawer && "right-2 top-2 size-6",
                    )}
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                }
              />
            }
          />
          <TooltipContent side="top">更多选项</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-40">
          <DropdownMenuItem onClick={() => onRename(conversation)}><Pencil />重命名</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPinnedChange(conversation, !pinned)}>
            {pinned ? <PinOff /> : <Pin />}
            {pinned ? "取消置顶" : "置顶"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive"><Trash2 />删除对话</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
