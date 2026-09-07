import { Check, History, MessageSquarePlus, MoreHorizontal, PanelLeftClose, PanelLeftOpen, PanelRight, PictureInPicture2, Settings, Share2, Sparkles, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import type { ProductBlockAction } from '../conversation'
import type { ArtifactTarget, ConversationScene, ImmersiveProductBlockRenderer } from '../immersive/contracts'
import { ConversationSection } from '../immersive/agent-layout/conversation-section'
import { IconButton } from '../immersive/agent-layout/icon-button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../immersive/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '../immersive/ui/tooltip'
import { normalizeAssistantView, type CopilotAssistantView, type CopilotConfig } from './copilot-config'

export type CopilotAppProps = {
  config: CopilotConfig
  scene: ConversationScene
  resourcePanel?: ReactNode
  workspace: ReactNode
  routeArtifact: (target: ArtifactTarget) => void
  renderProductBlock?: ImmersiveProductBlockRenderer
  onProductBlockAction?: (action: ProductBlockAction) => void
  /** Optional host top-navigation slot. When supplied, it replaces the bottom-right fallback trigger. */
  renderTopNavigationAssistantTrigger?: (openAssistant: () => void) => ReactNode
}

export function CopilotApp({ config, scene, resourcePanel, workspace, routeArtifact, renderProductBlock, onProductBlockAction, renderTopNavigationAssistantTrigger }: CopilotAppProps) {
  const [uncontrolledView, setUncontrolledView] = useState<CopilotAssistantView>(() => config.defaultAssistantView ?? normalizeAssistantView(config.assistantMode))
  const [resourceOpen, setResourceOpen] = useState(true)
  const view = config.assistantView ?? uncontrolledView

  const setView = (next: CopilotAssistantView) => {
    if (config.assistantView === undefined) setUncontrolledView(next)
    config.onAssistantViewChange?.(next)
  }

  const assistant = (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <CopilotConversationHeader config={config} view={view} onViewChange={setView} />
      <ConversationSection
        scene={scene}
        identity={{ name: config.identity.name, avatar: 'bot' }}
        experts={[]}
        onOpenArtifact={routeArtifact}
        renderProductBlock={renderProductBlock}
        onProductBlockAction={onProductBlockAction}
      />
    </div>
  )

  const floatingShell = 'fixed inset-0 z-30 bg-card sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[600px] sm:w-[400px] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-border sm:shadow-xl'
  const sidebarShell = 'fixed inset-0 z-30 bg-card sm:static sm:z-auto sm:h-full sm:w-[400px] sm:shrink-0 sm:border-l sm:border-border'

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background-desktop">
      {resourcePanel && resourceOpen ? <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:block">{resourcePanel}</aside> : null}
      <main className="relative min-w-0 flex-1 overflow-hidden">
        {resourcePanel ? (
          <button type="button" aria-label={resourceOpen ? '收起资源区' : '展开资源区'} title={resourceOpen ? '收起资源区' : '展开资源区'} onClick={() => setResourceOpen((value) => !value)} className="absolute left-2 top-2 z-10 rounded-lg p-2 hover:bg-accent">
            {resourceOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
          </button>
        ) : null}
        {workspace}
        {view === 'collapsed' && renderTopNavigationAssistantTrigger ? <div className="absolute right-4 top-1 z-20">{renderTopNavigationAssistantTrigger(() => setView('sidebar'))}</div> : null}
      </main>
      {view === 'sidebar' ? <aside aria-label="AI 对话辅助区" className={sidebarShell}>{assistant}</aside> : null}
      {view === 'floating' ? <aside aria-label="AI 对话辅助区" className={floatingShell}>{assistant}</aside> : null}
      {view === 'collapsed' && !renderTopNavigationAssistantTrigger ? (
        <button type="button" aria-label="展开 AI 对话辅助区" title="展开 AI 对话辅助区" onClick={() => setView('sidebar')} className="fixed bottom-8 right-8 z-20 flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-xl hover:bg-accent">
          <Sparkles className="size-5" />
        </button>
      ) : null}
    </div>
  )
}

function CopilotConversationHeader({ config, onViewChange, view }: { config: CopilotConfig; onViewChange: (view: CopilotAssistantView) => void; view: CopilotAssistantView }) {
  return (
    <header className="flex h-13 shrink-0 items-center gap-4 border-b border-border px-4">
      <h2 className="min-w-0 flex-1 truncate text-base font-medium leading-6">{config.title ?? 'AI 辅助'}</h2>
      <div className="flex shrink-0 items-center gap-1">
        <HeaderAction label="新对话" onClick={() => config.onNewConversation?.()}><MessageSquarePlus /></HeaderAction>
        <HeaderAction label="历史对话" onClick={() => config.onOpenHistory?.()}><History /></HeaderAction>
        <ViewModeMenu view={view} onViewChange={onViewChange} />
        <MoreMenu config={config} />
        <span className="mx-1 h-4 w-px bg-border" />
        <HeaderAction label="关闭" onClick={() => onViewChange('collapsed')}><X /></HeaderAction>
      </div>
    </header>
  )
}

function HeaderAction({ children, label, onClick }: { children: ReactNode; label: string; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<IconButton aria-label={label} className="size-7 [&_svg]:size-4" onClick={onClick}>{children}</IconButton>} />
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

function ViewModeMenu({ onViewChange, view }: { onViewChange: (view: CopilotAssistantView) => void; view: CopilotAssistantView }) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger render={<DropdownMenuTrigger render={<IconButton aria-label="切换对话模式" className="size-7 [&_svg]:size-4">{view === 'floating' ? <PictureInPicture2 /> : <PanelRight />}</IconButton>} />} />
        <TooltipContent side="bottom">切换对话模式</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-40">
        <DropdownMenuItem onClick={() => onViewChange('sidebar')}><PanelRight />侧边栏{view === 'sidebar' ? <Check className="ml-auto" /> : null}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewChange('floating')}><PictureInPicture2 />浮动{view === 'floating' ? <Check className="ml-auto" /> : null}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MoreMenu({ config }: { config: CopilotConfig }) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger render={<DropdownMenuTrigger render={<IconButton aria-label="更多" className="size-7 [&_svg]:size-4"><MoreHorizontal /></IconButton>} />} />
        <TooltipContent side="bottom">更多</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-36">
        <DropdownMenuItem onClick={() => config.onShare?.()}><Share2 />分享</DropdownMenuItem>
        <DropdownMenuItem onClick={() => config.onOpenSettings?.()}><Settings />设置</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
