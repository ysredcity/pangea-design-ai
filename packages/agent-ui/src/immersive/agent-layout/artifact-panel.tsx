import { Minimize2, MoveDiagonal, X } from "lucide-react"

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { cn } from "../lib/utils"
import { IconButton } from "./icon-button"
import { panelContainers, type PanelContainer } from "./panel-registry"
import type { PanelTab, PanelView } from "./panel-types"

/**
 * 独立面板的框架壳层：只负责容器 Tab、全局操作和布局，
 * 各类型容器的操作栏与内容来自 `panel-registry.ts` 注册的 `panel-containers.tsx`，示例数据来自 `panel-data.ts`。
 */
type ArtifactPanelProps = {
  fullscreen: boolean
  tabs: PanelTab[]
  activeTabId: string
  onSelectTab: (id: string) => void
  onCloseTab: (id: string) => void
  onClose: () => void
  onNavigate: (view: PanelView) => void
  /** 未提供时不显示全屏切换入口（窄屏强制全屏） */
  onToggleFullscreen?: () => void
}

export function ArtifactPanel({ activeTabId, fullscreen, onClose, onCloseTab, onNavigate, onSelectTab, onToggleFullscreen, tabs }: ArtifactPanelProps) {
  const view = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]
  if (!view) return null
  const { Body, Toolbar } = panelContainers[view.type] as PanelContainer
  return <aside aria-label="独立面板" className="flex h-full min-w-80 flex-1 flex-col border-l bg-background">
    <PanelHeader activeTabId={view.id} fullscreen={fullscreen} onClose={onClose} onCloseTab={onCloseTab} onSelectTab={onSelectTab} onToggleFullscreen={onToggleFullscreen} tabs={tabs} />
    {Toolbar && <Toolbar view={view} />}
    <Body view={view} onNavigate={onNavigate} />
  </aside>
}

function PanelHeader({ activeTabId, fullscreen, onClose, onCloseTab, onSelectTab, onToggleFullscreen, tabs }: { activeTabId: string; fullscreen: boolean; onClose: () => void; onCloseTab: (id: string) => void; onSelectTab: (id: string) => void; onToggleFullscreen?: () => void; tabs: PanelTab[] }) {
  return <header className="flex h-13 shrink-0 items-center gap-2 border-b pl-2 pr-4">
    <div role="tablist" aria-label="独立面板容器" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => <PanelTabItem key={tab.id} active={tab.id === activeTabId} closable={tabs.length > 1} onClose={() => onCloseTab(tab.id)} onSelect={() => onSelectTab(tab.id)} tab={tab} />)}
    </div>
    <div className="flex shrink-0 items-center gap-1">
      {onToggleFullscreen && <PanelHeaderAction label={fullscreen ? "退出全屏" : "全屏"} onClick={onToggleFullscreen}>{fullscreen ? <Minimize2 /> : <MoveDiagonal />}</PanelHeaderAction>}
      <PanelHeaderAction label="关闭" onClick={onClose}><X /></PanelHeaderAction>
    </div>
  </header>
}

/** 顶部导航右侧的全局操作，统一带 Tooltip */
function PanelHeaderAction({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return <Tooltip>
    <TooltipTrigger render={<IconButton aria-label={label} onClick={onClick}>{children}</IconButton>} />
    <TooltipContent side="bottom">{label}</TooltipContent>
  </Tooltip>
}

function PanelTabItem({ active, closable, onClose, onSelect, tab }: { active: boolean; closable: boolean; onClose: () => void; onSelect: () => void; tab: PanelTab }) {
  const TabIcon = panelContainers[tab.type].icon
  return <div
    className={cn(
      "group flex h-9 min-w-0 max-w-50 shrink-0 items-center gap-1.5 rounded-lg pl-2.5 pr-1.5 text-sm transition-colors",
      active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
    )}
  >
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className="flex min-w-0 flex-1 items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm"
      onClick={onSelect}
      title={tab.title}
    >
      <TabIcon className="size-4 shrink-0 opacity-80" />
      <span className="min-w-0 truncate font-medium">{tab.title}</span>
    </button>
    {closable && <button
      type="button"
      aria-label={`关闭 ${tab.title}`}
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-opacity hover:bg-background hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
      )}
      onClick={onClose}
    >
      <X className="size-3.5" />
    </button>}
  </div>
}
