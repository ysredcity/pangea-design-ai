export { AgentApp } from './agent-app'
export type { ArtifactRouter, ConversationScene, ProductBlockRenderer } from '../conversation'

export type AgentAppProps = { scenes: Record<string, import('../conversation').ConversationScene> }
