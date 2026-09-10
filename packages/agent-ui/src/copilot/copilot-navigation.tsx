import { BarChart3, IndentDecrease, LayoutDashboard, Search, Home, MoreHorizontal, Pin, PinOff, type LucideIcon } from 'lucide-react'
import { useRef, useState, type FocusEvent } from 'react'

import { CollapsibleGroupHeader, ConversationHistoryList, type Conversation } from '../immersive/agent-layout/sidebar'
import { AgentAvatar } from '../immersive/agent-layout/resource-visuals'
import { IconButton } from '../immersive/agent-layout/icon-button'
import { SidebarGroupContent, SidebarMenu, SidebarProvider } from '../immersive/ui/sidebar'
import { Button } from '../immersive/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../immersive/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '../immersive/ui/tooltip'
import { cn } from '../immersive/lib/utils'
import type { CopilotContentItem, CopilotNavigationConfig } from './copilot-config'

const globalIcons: Record<string, LucideIcon> = {
  home: Home,
  report: BarChart3,
  dashboard: LayoutDashboard,
}

export type CopilotNavigationProps = {
  identity: { name: string }
  config?: CopilotNavigationConfig
  activeContentId?: string | null
  activeConversationId?: string | null
  onContentSelect?: (item: CopilotContentItem) => void
  onCollapse: () => void
  conversations: Conversation[]
  pinnedConversations: Conversation[]
  onPinnedChange: (conversation: Conversation, pinned: boolean) => void
  onRename: (conversation: Conversation) => void
  onSelectConversation: (conversation: Conversation) => void
}

export function CopilotNavigation({ identity, config, activeContentId, activeConversationId, onContentSelect, onCollapse, conversations, pinnedConversations, onPinnedChange, onRename, onSelectConversation }: CopilotNavigationProps) {
  const [section, setSection] = useState<'content' | 'conversation'>(config?.defaultSection ?? 'content')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [contentItems, setContentItems] = useState<CopilotContentItem[]>(() => [...(config?.contentItems ?? [])])
  const [pinnedOpen, setPinnedOpen] = useState(true)
  const [recentOpen, setRecentOpen] = useState(true)
  const searchRef = useRef<HTMLDivElement>(null)
  const normalizedQuery = query.trim().toLowerCase()
  const filteredItems = normalizedQuery ? contentItems.filter((item) => item.title.toLowerCase().includes(normalizedQuery)) : contentItems
  const pinned = filteredItems.filter((item) => item.group === 'pinned')
  const recent = filteredItems.filter((item) => item.group === 'recent')

  const closeSearch = () => {
    setSearchOpen(false)
    setQuery('')
  }

  const handleSearchBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeSearch()
  }

  const setContentPinned = (item: CopilotContentItem, pinnedValue: boolean) => {
    setContentItems((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, group: pinnedValue ? 'pinned' : 'recent' } : candidate))
  }

  return (
    <aside aria-label="工作区导航" className="flex h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <header className="flex h-[52px] shrink-0 items-center gap-2 p-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-sidebar-accent-foreground">
          <AgentAvatar productAvatar="bot" className="size-7 [&_svg]:size-4" />
          <span className="truncate text-base font-semibold">{identity.name}</span>
        </div>
        <Tooltip>
          <TooltipTrigger render={<IconButton aria-label="收起导航" className="text-sidebar-accent-foreground hover:bg-sidebar-accent" onClick={onCollapse}><IndentDecrease /></IconButton>} />
          <TooltipContent side="right">收起导航</TooltipContent>
        </Tooltip>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <nav aria-label="全局页面入口" className="flex flex-col gap-0.5 p-2">
          {(config?.globalItems ?? []).map((item) => {
            const Icon = globalIcons[item.icon] ?? LayoutDashboard
            return <Button key={item.id} type="button" variant={item.id === 'home' ? 'outline' : 'ghost'} size="lg" onClick={item.onClick} className="w-full justify-start gap-2 rounded-[10px] px-2 text-left text-sm font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent"><Icon aria-hidden="true" className="size-4" /><span className="px-1.5">{item.label}</span></Button>
          })}
        </nav>

        <div className="px-3 pt-2">
          <div className="flex w-full gap-5 border-b border-sidebar-border" role="tablist" aria-label="导航维度">
            <button type="button" role="tab" aria-selected={section === 'content'} onClick={() => setSection('content')} className={cn('relative flex min-h-9 flex-none items-center justify-center border-b-2 border-transparent px-1 text-sm text-muted-foreground', section === 'content' && 'border-foreground font-medium text-foreground')}>报表</button>
            <button type="button" role="tab" aria-selected={section === 'conversation'} onClick={() => setSection('conversation')} className={cn('relative flex min-h-9 flex-none items-center justify-center border-b-2 border-transparent px-1 text-sm text-muted-foreground', section === 'conversation' && 'border-foreground font-medium text-foreground')}>对话</button>
          </div>
        </div>

        {section === 'content' ? (
          <>
            <ContentGroup label="已置顶" items={pinned} open={pinnedOpen} onOpenChange={setPinnedOpen} activeContentId={activeContentId} onSelect={onContentSelect} onPinnedChange={setContentPinned} />
          </>
        ) : (
          <SidebarProvider className="min-h-0 w-full bg-transparent">
            <ConversationHistoryList activeConversationId={activeConversationId} conversations={conversations} pinnedConversations={pinnedConversations} onPinnedChange={onPinnedChange} onRename={onRename} onSelectConversation={onSelectConversation} />
          </SidebarProvider>
        )}
        {section === 'content' ? (
            <ContentGroup
            label="最近访问"
            items={recent}
            open={recentOpen}
            onOpenChange={setRecentOpen}
            activeContentId={activeContentId}
            onSelect={onContentSelect}
            onPinnedChange={setContentPinned}
            searchable={config?.showSearch !== false}
            searchOpen={searchOpen}
            query={query}
            searchRef={searchRef}
            onSearchOpen={() => { setSearchOpen(true); setRecentOpen(true) }}
            onQueryChange={setQuery}
            onSearchBlur={handleSearchBlur}
          />
        ) : null}
      </div>
    </aside>
  )
}

function ContentGroup({ label, items, open, onOpenChange, activeContentId, onSelect, onPinnedChange, searchable = false, searchOpen = false, query = '', searchRef, onSearchOpen, onQueryChange, onSearchBlur }: { label: string; items: CopilotContentItem[]; open: boolean; onOpenChange: (open: boolean) => void; activeContentId?: string | null; onSelect?: (item: CopilotContentItem) => void; onPinnedChange: (item: CopilotContentItem, pinned: boolean) => void; searchable?: boolean; searchOpen?: boolean; query?: string; searchRef?: React.RefObject<HTMLDivElement | null>; onSearchOpen?: () => void; onQueryChange?: (query: string) => void; onSearchBlur?: (event: FocusEvent<HTMLDivElement>) => void }) {
  return (
    <section className="flex flex-col gap-0.5 p-2">
      {searchOpen ? <div ref={searchRef} onBlur={onSearchBlur} className="flex h-8 items-center gap-1 px-1"><input autoFocus value={query} onChange={(event) => onQueryChange?.(event.target.value)} placeholder="搜索内容" aria-label="搜索内容" className="h-8 min-w-0 flex-1 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div> : <CollapsibleGroupHeader label={label} open={open} onOpenChange={onOpenChange} action={searchable ? <button type="button" aria-label="搜索内容" onClick={onSearchOpen} className="mr-1 grid size-7 shrink-0 place-items-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><Search className="size-4" /></button> : null} />}
      {open ? <SidebarGroupContent><SidebarMenu>{items.map((item) => <ContentMenuItem key={item.id} item={item} active={item.id === activeContentId} onSelect={onSelect} onPinnedChange={onPinnedChange} />)}</SidebarMenu>{items.length === 0 ? <p className="px-2 py-3 text-sm text-muted-foreground">暂无内容</p> : null}</SidebarGroupContent> : null}
    </section>
  )
}

function ContentMenuItem({ item, active, onSelect, onPinnedChange }: { item: CopilotContentItem; active: boolean; onSelect?: (item: CopilotContentItem) => void; onPinnedChange: (item: CopilotContentItem, pinned: boolean) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="group/content-item relative">
      <button type="button" onClick={() => onSelect?.(item)} className={cn('flex min-h-8 w-full items-center gap-2 rounded-[10px] px-2 pr-8 text-left text-sm text-foreground hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring', active && 'bg-sidebar-accent font-medium')}>
        <span className="truncate">{item.title}</span>
      </button>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger render={<button type="button" aria-label={`${item.title}的更多操作`} className={cn('absolute right-1 top-1 z-10 grid size-6 place-items-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground opacity-0 outline-none transition-opacity hover:bg-sidebar-accent focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-sidebar-ring group-hover/content-item:opacity-100', menuOpen && 'opacity-100')}><MoreHorizontal className="size-4" /></button>} />
        <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-40">
          <DropdownMenuItem onClick={() => onPinnedChange(item, item.group !== 'pinned')}>{item.group === 'pinned' ? <PinOff /> : <Pin />}{item.group === 'pinned' ? '取消置顶' : '置顶'}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
