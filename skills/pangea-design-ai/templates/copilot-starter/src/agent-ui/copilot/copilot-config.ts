import type { AgentIdentity } from '../conversation'

export type CopilotAssistantView = 'sidebar' | 'floating' | 'collapsed'

/** @deprecated Use CopilotAssistantView through assistantView/defaultAssistantView. */
export type AssistantMode = 'panel' | 'floating' | 'overlay-drawer' | 'side-drawer'

export type CopilotConfig = {
  identity: AgentIdentity
  title?: string
  /** Controlled assistant presentation state. */
  assistantView?: CopilotAssistantView
  /** Initial state when assistantView is uncontrolled. */
  defaultAssistantView?: CopilotAssistantView
  onAssistantViewChange?: (view: CopilotAssistantView) => void
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
