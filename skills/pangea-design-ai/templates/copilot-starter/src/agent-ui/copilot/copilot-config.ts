import type { AgentIdentity } from '../conversation'

export type AssistantMode = 'panel' | 'floating' | 'overlay-drawer' | 'side-drawer'
export type CopilotConfig = { identity: AgentIdentity; title?: string; assistantMode?: AssistantMode }
