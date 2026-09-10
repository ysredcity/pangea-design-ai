import { ChevronRight, Download, IndentIncrease, MoreHorizontal, Pin, PinOff, Share2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PillButton } from '@/components/agent-layout/pill-button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type CopilotBreadcrumbItem = {
  id: string
  label: string
  current?: boolean
}

export type CopilotWorkspaceHeaderProps = {
  breadcrumbs: readonly CopilotBreadcrumbItem[]
  isPinned?: boolean
  onShare?: () => void
  onPinnedChange?: (pinned: boolean) => void
  onExport?: () => void
  navigationCollapsed?: boolean
  onToggleNavigation?: () => void
}

/** Shared content header for report, document and canvas workspaces. */
export function CopilotWorkspaceHeader({ breadcrumbs, isPinned = false, onShare, onPinnedChange, onExport, navigationCollapsed = false, onToggleNavigation }: CopilotWorkspaceHeaderProps) {
  const [pinned, setPinned] = useState(isPinned)
  const visibleBreadcrumbs = compactBreadcrumbs(breadcrumbs)

  const changePinned = () => {
    const next = !pinned
    setPinned(next)
    onPinnedChange?.(next)
  }

  return (
    <header className="flex h-13 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-2 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
        {navigationCollapsed && onToggleNavigation ? <WorkspaceAction label="展开导航" onClick={onToggleNavigation}><IndentIncrease /></WorkspaceAction> : null}
      <nav aria-label="内容层级" className="min-w-0 flex-1 overflow-hidden">
        <ol className="flex min-w-0 items-center gap-1 text-sm">
          {visibleBreadcrumbs.map((item, index) => (
            <li key={item.id} className="flex min-w-0 items-center gap-1">
              {index > 0 ? <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" /> : null}
              {item.id === '__ellipsis__' ? (
                <span className="shrink-0 text-muted-foreground" aria-label="已省略的层级">…</span>
              ) : (
                <span className={cn('truncate', item.current ? 'font-medium text-foreground' : 'text-muted-foreground')} aria-current={item.current ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <WorkspaceAction label="分享" disabled={!onShare} onClick={onShare}><Share2 /></WorkspaceAction>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger render={<DropdownMenuTrigger render={<PillButton aria-label="更多操作" className="size-7 p-0 [&_svg]:size-4"><MoreHorizontal /></PillButton>} />} />
            <TooltipContent side="bottom">更多操作</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-40">
            <DropdownMenuItem onClick={changePinned}>{pinned ? <PinOff /> : <Pin />}{pinned ? '取消置顶' : '置顶'}</DropdownMenuItem>
            <DropdownMenuItem disabled={!onExport} onClick={onExport}><Download />导出</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function WorkspaceAction({ children, disabled, label, onClick }: { children: ReactNode; disabled?: boolean; label: string; onClick?: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<PillButton aria-label={label} disabled={disabled} className="size-7 p-0 [&_svg]:size-4" onClick={onClick}>{children}</PillButton>} />
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

function compactBreadcrumbs(items: readonly CopilotBreadcrumbItem[]) {
  if (items.length <= 4) return items
  return [items[0], { id: '__ellipsis__', label: '…' }, ...items.slice(-2)]
}
