import type { AgentIdentity } from '../conversation'
import type { AppConfig, ArtifactTarget, NavigationItem } from '../immersive/contracts'
import type { CopilotBreadcrumbItem } from './copilot-workspace-header'

export type CopilotAssistantView = 'sidebar' | 'floating' | 'collapsed'

/** Where the assistant remains reachable after its panel is closed. */
export type CopilotCollapsedMode = 'top-navigation' | 'floating-button' | 'composer'

export type CopilotRecommendation = {
  id: string
  label: string
  icon: 'file-search' | 'list-checks' | 'scale'
}

export type CopilotWelcome = {
  greeting: string
  recommendationPages: readonly (readonly CopilotRecommendation[])[]
}

export type CopilotHomeReport = {
  id: string
  title: string
  category: string
  description: string
  metrics: readonly { label: string; value: string }[]
  updatedAt?: string
}

export type CopilotHomeReportTab = {
  id: string
  label: string
  reportIds: readonly string[]
}

/** Business content type; it does not determine which list actions are available. */
export type CopilotContentKind = 'report' | 'document' | 'canvas'

export type CopilotContentItem = {
  id: string
  title: string
  kind: CopilotContentKind
  /** Current list group; pin/unpin is available for every content kind. */
  group: 'pinned' | 'recent'
  target?: ArtifactTarget
}

export type CopilotNavigationConfig = {
  navigation?: readonly NavigationItem[]
  globalItems?: readonly { id: string; label: string; icon: 'home' | 'report' | 'dashboard'; onClick?: () => void }[]
  contentItems?: readonly CopilotContentItem[]
  defaultSection?: 'content' | 'conversation'
  showSearch?: boolean
}

/** @deprecated Use CopilotAssistantView through assistantView/defaultAssistantView. */
export type AssistantMode = 'panel' | 'floating' | 'overlay-drawer' | 'side-drawer'

export type CopilotConfig = {
  identity: AgentIdentity
  title?: string
  /** Whether this Copilot product exposes connector selection in Composer; hidden by default. */
  showConnectorSelect?: boolean
  /** Central home page. It reuses the immersive Agent new-conversation surface. */
  home?: Pick<AppConfig, 'experts' | 'welcome'> & {
    reports?: readonly CopilotHomeReport[]
    reportTabs?: readonly CopilotHomeReportTab[]
  }
  /** New conversations open on a focused welcome surface before any chat history is shown. */
  welcome?: CopilotWelcome
  /** Controlled assistant presentation state. */
  assistantView?: CopilotAssistantView
  /** Initial state when assistantView is uncontrolled. */
  defaultAssistantView?: CopilotAssistantView
  onAssistantViewChange?: (view: CopilotAssistantView) => void
  /** Product-level collapsed entry point. Keep the same value across all pages. */
  collapsedMode?: CopilotCollapsedMode
  /** Left workspace navigation shared by all Copilot pages in the product. */
  navigation?: CopilotNavigationConfig
  /** Standard header for the central report/document/canvas workspace. */
  workspace?: {
    breadcrumbs: readonly CopilotBreadcrumbItem[]
    isPinned?: boolean
    onShare?: () => void
    onPinnedChange?: (pinned: boolean) => void
    onExport?: () => void
    navigationCollapsed?: boolean
    onToggleNavigation?: () => void
  }
  onNewConversation?: () => void
  onOpenHistory?: () => void
  onShare?: () => void
  onOpenSettings?: () => void
  /** @deprecated Use assistantView/defaultAssistantView. */
  assistantMode?: AssistantMode
}

export function normalizeAssistantView(mode?: AssistantMode): Exclude<CopilotAssistantView, 'collapsed'> {
  return mode === 'floating' ? 'floating' : 'sidebar'
}
