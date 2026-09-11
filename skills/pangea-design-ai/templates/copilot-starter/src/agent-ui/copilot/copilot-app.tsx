import { ArrowLeft, Check, History, MessageSquarePlus, PanelLeftClose, PanelLeftOpen, PanelRight, PictureInPicture2, Sparkles, X } from 'lucide-react'
import { useId, useRef, useState, type ReactNode } from 'react'

import type { ProductBlockAction } from '../conversation'
import type { AppConfig, ArtifactTarget, ConversationScene, ImmersiveProductBlockRenderer } from '@/agent-ui/immersive/contracts'
import { ConversationSection } from '@/components/agent-layout/conversation-section'
import { ConversationPage } from '@/components/agent-layout/conversation-page'
import { Composer, type ContextItem } from '@/components/agent-layout/composer'
import { ArtifactPanel } from '@/components/agent-layout/artifact-panel'
import { IconButton } from '@/components/agent-layout/icon-button'
import { ImageViewer } from '@/components/agent-layout/image-viewer'
import { splitSentContext } from '@/components/agent-layout/message-context'
import type { ImageView, PanelTab, PanelView } from '@/components/agent-layout/panel-types'
import { ConversationHistoryList, type Conversation } from '@/components/agent-layout/sidebar'
import { smartReportConversations, smartReportPinnedConversations } from './smart-report-conversations'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { normalizeAssistantView, type CopilotAssistantView, type CopilotCollapsedMode, type CopilotConfig } from './copilot-config'
import { CopilotNewConversation } from './copilot-new-conversation'
import { CopilotHomePage } from './copilot-home-page'
import { CopilotNavigation } from './copilot-navigation'
import { CopilotWorkspaceHeader } from './copilot-workspace-header'

export type CopilotAppProps = {
  config: CopilotConfig
  scene: ConversationScene
  resourcePanel?: ReactNode
  /** Optional left workspace navigation. When supplied it replaces the legacy resource panel. */
  navigationPanel?: ReactNode
  workspace: ReactNode
  onContentSelect?: (item: import('./copilot-config').CopilotContentItem) => void
  routeArtifact: (target: ArtifactTarget) => void
  renderProductBlock?: ImmersiveProductBlockRenderer
  onProductBlockAction?: (action: ProductBlockAction) => void
  /** Optional host top-navigation slot. When supplied, it replaces the bottom-right fallback trigger. */
  renderTopNavigationAssistantTrigger?: (openAssistant: () => void) => ReactNode
}

export function CopilotApp({ config, scene, resourcePanel, navigationPanel, workspace, onContentSelect, routeArtifact, renderProductBlock, onProductBlockAction, renderTopNavigationAssistantTrigger }: CopilotAppProps) {
  // 保留旧版路由参数以兼容已有 Copilot 页面；制品现在统一由本组件的模态容器承载。
  void routeArtifact
  const [uncontrolledView, setUncontrolledView] = useState<CopilotAssistantView>(() => config.defaultAssistantView ?? normalizeAssistantView(config.assistantMode))
  const [resourceOpen, setResourceOpen] = useState(true)
  const [isNewConversation, setIsNewConversation] = useState(true)
  const [recommendationPage, setRecommendationPage] = useState(0)
  const [conversationDraft, setConversationDraft] = useState('')
  const [collapsedComposerDraft, setCollapsedComposerDraft] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyPinned, setHistoryPinned] = useState<Conversation[]>(smartReportPinnedConversations)
  const [historyConversations, setHistoryConversations] = useState<Conversation[]>(smartReportConversations)
  const [activeContentId, setActiveContentId] = useState<string | null>(() => {
    // Copilot starter 默认从产品主页进入；若宿主未配置主页则回退到首个内容。
    if (config.navigation?.globalItems?.some((item) => item.id === 'home')) return 'home'
    return config.navigation?.contentItems?.[0]?.id ?? null
  })
  const [centralConversation, setCentralConversation] = useState<Conversation | null>(null)
  const [artifactTabs, setArtifactTabs] = useState<PanelTab[]>([])
  const [activeArtifactTabId, setActiveArtifactTabId] = useState<string | null>(null)
  const [artifactFullscreen, setArtifactFullscreen] = useState(false)
  const [imageArtifact, setImageArtifact] = useState<ImageView | null>(null)
  const generatedIdPrefix = useId().replaceAll(':', '')
  const generatedIdCounter = useRef(0)
  const nextGeneratedId = (scope: string) => {
    generatedIdCounter.current += 1
    return `${scope}-${generatedIdPrefix}-${generatedIdCounter.current}`
  }
  const view = config.assistantView ?? uncontrolledView
  const collapsedMode: CopilotCollapsedMode = config.collapsedMode ?? 'floating-button'
  const homeOpen = activeContentId === 'home' && !centralConversation
  const copilotExperts = config.home
    ? config.home.welcome.expertIds.flatMap((id) => config.home?.experts.find((expert) => expert.id === id) ?? [])
    : []
  const copilotExpertOptions = copilotExperts.map((expert) => expert.label)
  const copilotExpertVisualKeys = Object.fromEntries(copilotExperts.map((expert) => [expert.label, expert.visualKey]))
  const showConnectorSelect = config.showConnectorSelect ?? false

  const setView = (next: CopilotAssistantView) => {
    if (config.assistantView === undefined) setUncontrolledView(next)
    config.onAssistantViewChange?.(next)
  }

  const openNewAssistantConversation = () => {
    closeArtifact()
    setHistoryOpen(false)
    setRecommendationPage(0)
    setConversationDraft('')
    setIsNewConversation(true)
    setView('sidebar')
  }

  const conversationPageConfig: AppConfig = {
    identity: { name: config.identity.name, avatar: 'bot' },
    navigation: [],
    experts: copilotExperts,
    welcome: { greeting: '', expertIds: [], recommendations: [], expertRecommendations: {} },
    composerExpertOptions: copilotExpertOptions,
    composerExpertVisualKeys: copilotExpertVisualKeys,
    showConnectorSelect,
    renderProductBlock,
  }

  const createConversationScene = (content: string): ConversationScene => ({
    ...scene,
    id: nextGeneratedId('copilot'),
    turns: scene.turns.length > 0
      ? scene.turns.map((turn, index) => index === 0 ? { ...turn, user: { ...turn.user, content } } : turn)
      : [],
  })

  const closeArtifact = () => {
    setArtifactTabs([])
    setActiveArtifactTabId(null)
    setArtifactFullscreen(false)
  }

  const openArtifact = (target: ArtifactTarget) => {
    if (target.type === 'image') {
      setImageArtifact(target)
      return
    }
    const tab: PanelTab = { ...target, id: nextGeneratedId('copilot-panel') }
    // Copilot 不提供 Tab 切换：新制品直接替换当前模态容器内容。
    setArtifactTabs([tab])
    setActiveArtifactTabId(tab.id)
  }

  const closeArtifactTab = (id: string) => {
    const index = artifactTabs.findIndex((tab) => tab.id === id)
    const next = artifactTabs.filter((tab) => tab.id !== id)
    if (next.length === 0) {
      closeArtifact()
      return
    }
    setArtifactTabs(next)
    if (id === activeArtifactTabId) setActiveArtifactTabId(next[Math.min(index, next.length - 1)]?.id ?? null)
  }

  const navigateArtifact = (view: PanelView) => {
    setArtifactTabs((tabs) => tabs.map((tab) => tab.id === activeArtifactTabId ? { ...view, id: tab.id } : tab))
  }

  const artifactPanelProps = {
    tabs: artifactTabs,
    activeTabId: activeArtifactTabId ?? artifactTabs[0]?.id ?? '',
    onSelectTab: setActiveArtifactTabId,
    onCloseTab: closeArtifactTab,
    onClose: closeArtifact,
    onNavigate: navigateArtifact,
    onToggleFullscreen: () => setArtifactFullscreen((value) => !value),
  }

  const updateConversationPinned = (conversation: Conversation, pinned: boolean) => {
    if (pinned) {
      setHistoryConversations((items) => items.filter((item) => item.id !== conversation.id))
      setHistoryPinned((items) => [conversation, ...items])
    } else {
      setHistoryPinned((items) => items.filter((item) => item.id !== conversation.id))
      setHistoryConversations((items) => [conversation, ...items])
    }
  }

  const updateConversationApproval = (conversation: Conversation, approvalStatus: "approved" | "rejected") => {
    const update = (items: Conversation[]) => items.map((item) => item.id === conversation.id ? { ...item, approvalStatus } : item)
    setHistoryPinned(update)
    setHistoryConversations(update)
    setCentralConversation((current) => current?.id === conversation.id ? { ...current, approvalStatus } : current)
  }

  const openCentralConversation = (conversation: Conversation) => {
    const central = { ...conversation, scene: conversation.scene ?? createConversationScene(conversation.initialMessage ?? conversation.title) }
    closeArtifact()
    setCentralConversation(central)
    setHistoryPinned((items) => items.map((item) => item.id === central.id ? central : item))
    setHistoryConversations((items) => items.map((item) => item.id === central.id ? central : item))
    setHistoryOpen(false)
    setView('collapsed')
  }

  const startCentralConversation = (message: string, context: ContextItem[]) => {
    const { attachments, content, expert } = splitSentContext(message, context)
    const title = content.replace(/\[\[[^:\]]+:([^\]]+)\]\]/g, '$1').trim() || attachments[0]?.name || context[0]?.label || '新对话'
    const conversation: Conversation = {
      id: nextGeneratedId('draft'),
      title: title.slice(0, 36),
      initialMessage: content,
      expert,
      scene: createConversationScene(content),
    }
    setHistoryConversations((items) => [conversation, ...items])
    openCentralConversation(conversation)
  }

  const assistant = (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <CopilotConversationHeader
        config={config}
        historyOpen={historyOpen}
        isNewConversation={isNewConversation}
        view={view}
        onBackFromHistory={() => setHistoryOpen(false)}
        onNewConversation={() => { closeArtifact(); setHistoryOpen(false); setRecommendationPage(0); setConversationDraft(''); setIsNewConversation(true); config.onNewConversation?.() }}
        onOpenHistory={() => setHistoryOpen(true)}
        onViewChange={setView}
      />
      {historyOpen ? (
        <div className="min-h-0 flex-1 overflow-y-auto bg-card px-2 py-3">
          <SidebarProvider className="min-h-0 w-full bg-transparent">
            <ConversationHistoryList
              conversations={historyConversations}
              onPinnedChange={updateConversationPinned}
              onSelectConversation={openCentralConversation}
              pinnedConversations={historyPinned}
            />
          </SidebarProvider>
        </div>
      ) : isNewConversation ? (
        <CopilotNewConversation
          welcome={config.welcome}
          expertOptions={copilotExpertOptions}
          expertVisualKeys={copilotExpertVisualKeys}
          showConnectorSelect={showConnectorSelect}
          page={recommendationPage}
          onChangePage={setRecommendationPage}
          onStartConversation={(message) => { setConversationDraft(message); setIsNewConversation(false) }}
        />
      ) : (
        <ConversationSection
          scene={scene}
          initialDraft={conversationDraft}
          identity={{ name: config.identity.name, avatar: 'bot' }}
          composerExpertOptions={copilotExpertOptions}
          composerExpertVisualKeys={copilotExpertVisualKeys}
          experts={copilotExperts}
          showConnectorSelect={showConnectorSelect}
          onOpenArtifact={openArtifact}
          renderProductBlock={renderProductBlock}
          onProductBlockAction={onProductBlockAction}
        />
      )}
    </div>
  )

  const floatingShell = 'fixed inset-0 z-30 bg-card sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[600px] sm:w-[400px] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-border sm:shadow-xl'
  const sidebarShell = 'fixed inset-0 z-30 bg-card sm:static sm:z-auto sm:h-full sm:w-[400px] sm:shrink-0 sm:border-l sm:border-border'

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background-desktop">
      {resourceOpen ? navigationPanel ?? (config.navigation ? <CopilotNavigation
        identity={config.identity}
        config={{ ...config.navigation, globalItems: config.navigation.globalItems?.map((item) => ({ ...item, onClick: () => { if (item.id === 'home') { closeArtifact(); setCentralConversation(null); setActiveContentId('home'); setConversationDraft(''); setIsNewConversation(true); setView('collapsed') } item.onClick?.() } })) }}
        activeContentId={activeContentId}
        activeConversationId={centralConversation?.id}
        onContentSelect={(item) => { closeArtifact(); setCentralConversation(null); setActiveContentId(item.id); setConversationDraft(''); setIsNewConversation(true); setView('collapsed'); onContentSelect?.(item); if (item.target) routeArtifact(item.target) }}
        onCollapse={() => setResourceOpen(false)}
        conversations={historyConversations}
        pinnedConversations={historyPinned}
        onPinnedChange={updateConversationPinned}
        onRename={() => undefined}
        onSelectConversation={openCentralConversation}
      /> : resourcePanel ? <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:block">{resourcePanel}</aside> : null) : null}
      <main className="relative min-w-0 flex-1 overflow-hidden">
        {!config.workspace && resourcePanel && !navigationPanel && !config.navigation ? (
          <button type="button" aria-label={resourceOpen ? '收起资源区' : '展开资源区'} title={resourceOpen ? '收起资源区' : '展开资源区'} onClick={() => setResourceOpen((value) => !value)} className="absolute left-2 top-2 z-10 rounded-lg p-2 hover:bg-accent">
            {resourceOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
          </button>
        ) : null}
        <div className="flex h-full min-w-0 flex-col">
          {centralConversation ? (
            <ConversationPage
              config={conversationPageConfig}
              createDraftScene={createConversationScene}
              conversation={centralConversation}
              isSidebarDocked={resourceOpen}
              onNewChat={() => { closeArtifact(); setCentralConversation(null) }}
              onOpenSidebar={() => setResourceOpen(true)}
              onOpenArtifact={openArtifact}
              onApprovalStatusChange={updateConversationApproval}
              onPinnedChange={updateConversationPinned}
              onRename={(conversation) => {
                const title = window.prompt('请输入新标题', conversation.title)?.trim()
                if (!title) return
                const renamed = { ...conversation, title }
                setCentralConversation(renamed)
                setHistoryPinned((items) => items.map((item) => item.id === conversation.id ? renamed : item))
                setHistoryConversations((items) => items.map((item) => item.id === conversation.id ? renamed : item))
              }}
              pinned={historyPinned.some((item) => item.id === centralConversation.id)}
            />
          ) : (
            homeOpen && config.home ? (
              <CopilotHomePage
                config={{ ...config.home, composerExpertOptions: copilotExpertOptions, composerExpertVisualKeys: copilotExpertVisualKeys, showConnectorSelect }}
                isNavigationDocked={resourceOpen}
                onOpenNavigation={() => setResourceOpen(true)}
                onStartConversation={startCentralConversation}
                onSelectReport={(report) => {
                  const item = config.navigation?.contentItems?.find((candidate) => candidate.id === report.id)
                  if (item) {
                    closeArtifact()
                    setActiveContentId(item.id)
                    onContentSelect?.(item)
                  }
                }}
              />
            ) : (
              <>
                {config.workspace ? <CopilotWorkspaceHeader {...config.workspace} navigationCollapsed={!resourceOpen} onToggleNavigation={() => setResourceOpen(true)} /> : null}
                <div className="min-h-0 min-w-0 flex-1">{workspace}</div>
              </>
            )
          )}
        </div>
        {view === 'collapsed' && !centralConversation && !homeOpen && collapsedMode === 'top-navigation' ? (
          <div className="absolute right-4 top-1 z-20">
            {renderTopNavigationAssistantTrigger?.(openNewAssistantConversation) ?? <button type="button" aria-label="打开 AI 对话辅助区" title="打开 AI 对话辅助区" onClick={openNewAssistantConversation} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><PanelRight className="size-4" />对话</button>}
          </div>
        ) : null}
        {view === 'collapsed' && !centralConversation && !homeOpen && collapsedMode === 'floating-button' ? (
          <button type="button" aria-label="展开 AI 对话辅助区" title="展开 AI 对话辅助区" onClick={openNewAssistantConversation} className="fixed bottom-8 right-8 z-20 flex size-11 items-center justify-center rounded-full border border-foreground bg-foreground text-background shadow-xl hover:bg-foreground/90">
            <Sparkles className="size-5" />
          </button>
        ) : null}
        {view === 'collapsed' && !centralConversation && !homeOpen && collapsedMode === 'composer' ? (
          <div className="absolute inset-x-4 bottom-4 z-20 mx-auto max-w-3xl">
            <CollapsedComposer draft={collapsedComposerDraft} onDraftChange={setCollapsedComposerDraft} onSend={(message) => { setConversationDraft(message); setCollapsedComposerDraft(''); setIsNewConversation(false); setView('sidebar') }} />
          </div>
        ) : null}
      </main>
      {!centralConversation && !homeOpen && view === 'sidebar' ? <aside aria-label="AI 对话辅助区" className={sidebarShell}>{assistant}</aside> : null}
      {!centralConversation && !homeOpen && view === 'floating' ? <aside aria-label="AI 对话辅助区" className={floatingShell}>{assistant}</aside> : null}
      <Dialog open={artifactTabs.length > 0} onOpenChange={(open) => { if (!open) closeArtifact() }}>
        <DialogContent
          showCloseButton={false}
          aria-label="独立面板"
            className={artifactFullscreen
            ? '!h-dvh !w-screen !max-w-none rounded-none p-0'
            : 'h-[min(88dvh,900px)] !w-[92vw] !max-w-[1280px] overflow-hidden rounded-2xl p-0 shadow-2xl'}
        >
          <ArtifactPanel fullscreen={artifactFullscreen} hideTabs {...artifactPanelProps} />
        </DialogContent>
      </Dialog>
      {imageArtifact ? <ImageViewer view={imageArtifact} onClose={() => setImageArtifact(null)} /> : null}
    </div>
  )
}

function CopilotConversationHeader({ config, historyOpen, isNewConversation, onBackFromHistory, onNewConversation, onOpenHistory, onViewChange, view }: { config: CopilotConfig; historyOpen: boolean; isNewConversation: boolean; onBackFromHistory: () => void; onNewConversation: () => void; onOpenHistory: () => void; onViewChange: (view: CopilotAssistantView) => void; view: CopilotAssistantView }) {
  return (
    <header className="flex h-13 shrink-0 items-center gap-4 border-b border-border px-4">
      {historyOpen ? (
        <>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <HeaderAction label="返回" onClick={onBackFromHistory}><ArrowLeft /></HeaderAction>
            <h2 className="truncate text-base font-medium leading-6">历史对话</h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <HeaderAction label="新对话" onClick={onNewConversation}><MessageSquarePlus /></HeaderAction>
            <HeaderAction label="关闭" onClick={() => onViewChange('collapsed')}><X /></HeaderAction>
          </div>
        </>
      ) : (
        <>
          <h2 className="min-w-0 flex-1 truncate text-base font-medium leading-6">{isNewConversation ? '新对话' : config.title ?? 'AI 辅助'}</h2>
          <div className="flex shrink-0 items-center gap-1">
            <HeaderAction label="新对话" onClick={onNewConversation}><MessageSquarePlus /></HeaderAction>
            <HeaderAction label="历史对话" onClick={onOpenHistory}><History /></HeaderAction>
            <ViewModeMenu view={view} onViewChange={onViewChange} />
            <span className="mx-1 h-4 w-px bg-border" />
            <HeaderAction label="关闭" onClick={() => onViewChange('collapsed')}><X /></HeaderAction>
          </div>
        </>
      )}
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

function CollapsedComposer({ draft, onDraftChange, onSend }: { draft: string; onDraftChange: (value: string) => void; onSend: (message: string) => void }) {
  return (
    <Composer draft={draft} onDraftChange={onDraftChange} onSend={(message) => onSend(message)} />
  )
}
