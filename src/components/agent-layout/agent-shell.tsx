import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ArtifactPanel } from "./artifact-panel"
import { ChatWorkspace } from "./chat-workspace"
import { AgentSidebar, initialConversations, initialPinnedConversations, type Conversation } from "./sidebar"
import { conversationScenes, createDraftScene } from "./conversation-data"
import { ImageViewer } from "./image-viewer"
import { panelViewKey, type ArtifactTarget, type ImageView, type PanelTab, type PanelView } from "./panel-types"

const SIDEBAR_WIDTH = 240
const PANEL_MIN_WIDTH = 320
const CHAT_MIN_WIDTH = 420

export function AgentShell() {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [pinnedConversations, setPinnedConversations] = useState<Conversation[]>(() => initialPinnedConversations.map((item) => ({ ...item, scene: conversationScenes[item.id] })))
  const [conversations, setConversations] = useState<Conversation[]>(() => initialConversations.map((item) => ({ ...item, scene: conversationScenes[item.id] })))
  const [renamingConversation, setRenamingConversation] = useState<Conversation | null>(null)
  const [renameTitle, setRenameTitle] = useState("")
  const [readConversationIds, setReadConversationIds] = useState<Set<string>>(() => new Set())
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = window.localStorage.getItem("theme")
    if (savedTheme) return savedTheme === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarDrawerOpen, setSidebarDrawerOpen] = useState(false)
  const [panelTabs, setPanelTabs] = useState<PanelTab[]>([])
  const [activePanelTabId, setActivePanelTabId] = useState<string | null>(null)
  const [panelFullscreenRequested, setPanelFullscreenRequested] = useState(false)
  const [imageView, setImageView] = useState<ImageView | null>(null)
  const [panelWidth, setPanelWidth] = useState<number | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)
  const drawerTouchStart = useRef<number | null>(null)

  const below660 = useMediaQuery("(max-width: 659px)")
  const below740 = useMediaQuery("(max-width: 739px)")
  const below980 = useMediaQuery("(max-width: 979px)")
  const panelOpen = panelTabs.length > 0
  const sidebarDocked = sidebarOpen && (panelOpen ? !below980 : !below660)
  const panelFullscreen = panelOpen && (below740 || panelFullscreenRequested)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    window.localStorage.setItem("theme", darkMode ? "dark" : "light")
  }, [darkMode])

  const changePinnedState = (conversation: Conversation, pinned: boolean) => {
    if (pinned) {
      setConversations((items) => items.filter((item) => item.id !== conversation.id))
      setPinnedConversations((items) => [conversation, ...items])
      toast.success("对话已置顶")
    } else {
      setPinnedConversations((items) => items.filter((item) => item.id !== conversation.id))
      setConversations((items) => [conversation, ...items])
      toast.success("已取消置顶")
    }
  }

  const startRenaming = (conversation: Conversation) => {
    setRenamingConversation(conversation)
    setRenameTitle(conversation.title)
  }

  const saveRenamedConversation = () => {
    const title = renameTitle.trim()
    if (!renamingConversation || !title) return
    const rename = (items: Conversation[]) => items.map((item) => item.id === renamingConversation.id ? { ...item, title } : item)
    setPinnedConversations(rename)
    setConversations(rename)
    setActiveConversation((current) => current?.id === renamingConversation.id ? { ...current, title } : current)
    setRenamingConversation(null)
    toast.success("标题已修改")
  }

  const activeConversationPinned = Boolean(activeConversation && pinnedConversations.some((item) => item.id === activeConversation.id))

  /** 执行 Badge 的统一入口：图片走蒙层查看器，其余产物进独立面板容器 */
  const openArtifact = (target: ArtifactTarget) => {
    if (target.type === "image") setImageView(target)
    else openPanel(target)
  }

  /** 打开一个容器：已存在同一容器时只切换 Tab，否则新增 Tab */
  const openPanel = (view: PanelView) => {
    if (!panelOpen) setPanelWidth(null)
    const key = panelViewKey(view)
    const existing = panelTabs.find((tab) => panelViewKey(tab) === key)
    if (existing) {
      setActivePanelTabId(existing.id)
      return
    }
    const tab: PanelTab = { ...view, id: `panel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }
    setPanelTabs((tabs) => [...tabs, tab])
    setActivePanelTabId(tab.id)
  }

  /** 在当前容器内跳转（例如检索结果 → 浏览器），不新开 Tab */
  const navigatePanel = (view: PanelView) => {
    setPanelTabs((tabs) => tabs.map((tab) => tab.id === activePanelTabId ? { ...view, id: tab.id } : tab))
  }

  const closePanelTab = (id: string) => {
    const index = panelTabs.findIndex((tab) => tab.id === id)
    const next = panelTabs.filter((tab) => tab.id !== id)
    setPanelTabs(next)
    if (id === activePanelTabId) setActivePanelTabId(next[Math.min(index, next.length - 1)]?.id ?? null)
  }

  const closePanel = () => {
    setPanelTabs([])
    setActivePanelTabId(null)
    setPanelFullscreenRequested(false)
  }

  const panelProps = {
    tabs: panelTabs,
    activeTabId: activePanelTabId ?? panelTabs[0]?.id ?? "",
    onSelectTab: setActivePanelTabId,
    onCloseTab: closePanelTab,
    onClose: closePanel,
    onNavigate: navigatePanel,
    // 窄屏下面板强制全屏，没有非全屏形态可切，因此不提供切换入口
    onToggleFullscreen: below740 ? undefined : () => setPanelFullscreenRequested((value) => !value),
  }

  const startResizing = useCallback((event: React.PointerEvent) => {
    event.preventDefault()
    setIsResizing(true)

    const resize = (pointerEvent: PointerEvent) => {
      const bounds = shellRef.current?.getBoundingClientRect()
      if (!bounds) return

      const sidebarSpace = sidebarDocked ? SIDEBAR_WIDTH : 0
      const maxWidth = Math.max(
        PANEL_MIN_WIDTH,
        bounds.width - sidebarSpace - CHAT_MIN_WIDTH,
      )
      const nextWidth = bounds.right - pointerEvent.clientX
      setPanelWidth(Math.min(maxWidth, Math.max(PANEL_MIN_WIDTH, nextWidth)))
    }

    const stop = () => {
      setIsResizing(false)
      window.removeEventListener("pointermove", resize)
      window.removeEventListener("pointerup", stop)
    }

    window.addEventListener("pointermove", resize)
    window.addEventListener("pointerup", stop)
  }, [sidebarDocked])

  return (
    <>
    <TooltipProvider delay={150}>
      <SidebarProvider
        className="h-dvh min-h-0 min-w-0 overflow-hidden bg-background-mobile min-[660px]:min-w-[420px] md:bg-sidebar"
        style={{ "--sidebar-width": `${SIDEBAR_WIDTH}px` } as React.CSSProperties}
      >
        <main
          ref={shellRef}
          className={cn(
            "relative flex h-full w-full overflow-hidden",
            isResizing && "cursor-col-resize select-none",
          )}
        >
        {sidebarDocked && (
          <AgentSidebar
            activeConversationId={activeConversation?.id ?? null}
            darkMode={darkMode}
            onCollapse={() => setSidebarOpen(false)}
            onDarkModeChange={setDarkMode}
            onNewChat={() => setActiveConversation(null)}
            onPinnedChange={changePinnedState}
            onRename={startRenaming}
            onSelectConversation={(conversation) => {
              setActiveConversation(conversation)
              setReadConversationIds((ids) => new Set(ids).add(conversation.id))
            }}
            readConversationIds={readConversationIds}
            pinnedConversations={pinnedConversations}
            conversations={conversations}
          />
        )}

        <div
          className={cn(
            "flex min-w-0 flex-1 transition-transform duration-200 ease-out",
            sidebarDrawerOpen && !panelFullscreen && "translate-x-80",
          )}
        >
          <ChatWorkspace
            activeConversation={activeConversation}
            isSidebarDocked={sidebarDocked}
            onNewChat={() => setActiveConversation(null)}
            onPinnedChange={changePinnedState}
            onRename={startRenaming}
            activeConversationPinned={activeConversationPinned}
            onOpenArtifact={openArtifact}
            onOpenSidebar={() => {
              if (panelOpen ? below980 : below660) setSidebarDrawerOpen(true)
              else setSidebarOpen(true)
            }}
            onStartConversation={(message, context) => {
              const title = message || context[0]?.label || "新对话"
              const newConversation: Conversation = {
                id: `draft-${Date.now()}`,
                title: title.slice(0, 36),
                initialMessage: message || `已添加 ${context.map((item) => item.label).join("、")}`,
                contextLabels: context.map((item) => item.label),
                scene: createDraftScene(message || `已添加 ${context.map((item) => item.label).join("、")}`, context.map((item) => item.label)),
              }
              setConversations((items) => [newConversation, ...items])
              setActiveConversation(newConversation)
            }}
            panelOpen={panelOpen}
            panelAtDefaultSplit={panelOpen && panelWidth === null}
          />

          {panelOpen && !panelFullscreen && (
            <div
              className={cn(
                "group relative flex h-full min-w-80 shrink-0",
                panelWidth === null && "flex-1",
              )}
              style={panelWidth === null ? undefined : {
                width: panelWidth,
                maxWidth: `calc(100% - ${CHAT_MIN_WIDTH}px)`,
              }}
            >
              <button
                aria-label="调整独立面板宽度"
                className="absolute -left-1 top-0 z-20 h-full w-2 cursor-col-resize touch-none"
                onPointerDown={startResizing}
              >
                <span
                  className={cn(
                    "absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border transition-all group-hover:w-0.5 group-hover:bg-primary",
                    isResizing && "w-0.5 bg-primary",
                  )}
                />
              </button>
              <ArtifactPanel fullscreen={false} {...panelProps} />
            </div>
          )}
        </div>

        {sidebarDrawerOpen && !panelFullscreen && (
          <div
            className="absolute inset-0 z-40 flex"
            onPointerDown={(event) => {
              drawerTouchStart.current = event.clientX
            }}
            onPointerUp={(event) => {
              if (
                drawerTouchStart.current !== null &&
                event.clientX - drawerTouchStart.current < -48
              ) {
                setSidebarDrawerOpen(false)
              }
              drawerTouchStart.current = null
            }}
          >
            <AgentSidebar
              activeConversationId={activeConversation?.id ?? null}
              darkMode={darkMode}
              drawer
              onClose={() => setSidebarDrawerOpen(false)}
              onCollapse={() => setSidebarDrawerOpen(false)}
              onDarkModeChange={setDarkMode}
              onNewChat={() => {
                setActiveConversation(null)
                setSidebarDrawerOpen(false)
              }}
              onPinnedChange={changePinnedState}
              onRename={startRenaming}
              onSelectConversation={(conversation) => {
                setActiveConversation(conversation)
                setReadConversationIds((ids) => new Set(ids).add(conversation.id))
                setSidebarDrawerOpen(false)
              }}
              readConversationIds={readConversationIds}
              pinnedConversations={pinnedConversations}
              conversations={conversations}
              className="w-80 [--sidebar-width:320px]"
            />
            <button
              aria-label="关闭导航"
              className="flex-1 bg-black/40 backdrop-blur-[1px]"
              onClick={() => setSidebarDrawerOpen(false)}
            />
          </div>
        )}

        {panelFullscreen && (
          <div className="absolute inset-0 z-50 bg-background">
            <ArtifactPanel fullscreen {...panelProps} />
          </div>
        )}

        <Dialog open={Boolean(renamingConversation)} onOpenChange={(open) => { if (!open) setRenamingConversation(null) }}>
          <DialogContent className="w-[400px] gap-5 rounded-2xl bg-card p-5 shadow-xl sm:max-w-[400px]">
            <DialogHeader className="gap-4"><DialogTitle className="text-lg font-semibold">编辑标题</DialogTitle><DialogDescription className="sr-only">修改当前对话的标题</DialogDescription></DialogHeader>
            <form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); saveRenamedConversation() }}>
              <label className="grid gap-2 text-sm text-muted-foreground">请输入新标题<Input autoFocus className="h-9 bg-muted/50 text-foreground" value={renameTitle} onChange={(event) => setRenameTitle(event.target.value)} onFocus={(event) => event.currentTarget.select()} /></label>
              <DialogFooter className="m-0 flex-row justify-end border-0 bg-transparent p-0">
                <DialogClose render={<Button type="button" variant="outline" className="h-9 min-w-18" />}>取消</DialogClose>
                <Button type="submit" className="h-9 min-w-18" disabled={!renameTitle.trim()}>确认</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        {/* 用 src 作为挂载 key，切换图片时自然回到默认缩放 */}
        {imageView && <ImageViewer key={imageView.src} view={imageView} onClose={() => setImageView(null)} />}
        </main>
      </SidebarProvider>
    </TooltipProvider>
    <Toaster theme={darkMode ? "dark" : "light"} position="top-center" />
    </>
  )
}
