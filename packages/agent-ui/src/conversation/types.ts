import type { ReactNode } from 'react'

export type ArtifactTarget = {
  id: string
  type: 'document' | 'web' | 'image' | 'data' | 'custom'
  title: string
  description?: string
  href?: string
  payload?: unknown
}

export type ArtifactRouter = (target: ArtifactTarget) => void

export type ProductConversationBlock = {
  id: string
  type: string
  payload: unknown
}

export type ProductBlockContext = {
  turnId: string
  isLatestTurn: boolean
  openArtifact: ArtifactRouter
}

export type ProductBlockRenderer = (block: ProductConversationBlock, context: ProductBlockContext) => ReactNode

export type ExecutionAction = { id: string; label: string; target?: ArtifactTarget }
export type ExecutionStep = { id: string; title: string; detail?: string; status: 'completed' | 'running' | 'pending'; actions?: ExecutionAction[] }
export type AssistantMessage = { content: string; timestamp?: string; artifacts?: ArtifactTarget[]; kind?: 'answer' | 'question' }
export type ConversationTurn = {
  id: string
  user: { content: string; timestamp?: string }
  execution?: { summary: string; status: 'completed' | 'running' | 'waiting'; steps?: ExecutionStep[] }
  assistant?: AssistantMessage
  productBlocks?: ProductConversationBlock[]
}
export type ConversationScene = { id: string; turns: ConversationTurn[] }
export type AgentIdentity = { name: string; avatar?: ReactNode }
