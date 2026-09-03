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

export type ConfirmRiskLevel = 'medium' | 'high'
export type ConfirmDecision = 'confirm' | 'cancel' | 'skip'
export type ConfirmField = {
  key: 'object' | 'action' | 'impact-scope' | 'consequence' | 'operator' | (string & {})
  label: string
  value: string
}
export type ConfirmAction = {
  id: string
  label: string
  decision: ConfirmDecision
  tone: 'primary' | 'secondary' | 'destructive'
}
export type ConfirmBlockPayload = {
  riskLevel: ConfirmRiskLevel
  question: string
  description?: ReactNode
  fields: ConfirmField[]
  actions: ConfirmAction[]
}

export type ErrorScenario = 'unavailable' | 'timeout' | 'failed' | 'partial' | 'no-permission' | 'unsupported' | 'unknown'
export type ErrorRecovery = 'retry' | 'cancel' | 'wait' | 'request-permission' | 'alternative'
export type ErrorRecoveryAction = {
  id: string
  label: string
  recovery: ErrorRecovery
  tone: 'primary' | 'secondary' | 'destructive'
}
export type ErrorBlockPayload = {
  scenario: ErrorScenario
  fact: string
  impact: string
  nextStep: string
  recoveryActions: ErrorRecoveryAction[]
}

export type FollowUpSuggestion = { id: string; label: string; content: string }
export type FollowUpSuggestionsPayload = { suggestions: FollowUpSuggestion[] }

export type ConfirmBlockAction = {
  type: 'confirm-decision'
  blockId: string
  actionId: string
  decision: ConfirmDecision
}
export type ErrorRecoveryBlockAction = {
  type: 'error-recovery'
  blockId: string
  actionId: string
  recovery: ErrorRecovery
}
export type FollowUpSelectionBlockAction = {
  type: 'follow-up-select'
  blockId: string
  actionId: string
  suggestionId: string
  content: string
}
export type ProductBlockAction = ConfirmBlockAction | ErrorRecoveryBlockAction | FollowUpSelectionBlockAction
export type ProductBlockActionHandler = (action: ProductBlockAction) => void
export type ProductBlockActionStatus = { actionId: string; message: string }

export type ProductConversationBlock = {
  id: string
  type: string
  payload: unknown
}

export type ProductBlockContext = {
  turnId: string
  isLatestTurn: boolean
  openArtifact: ArtifactRouter
  onAction: ProductBlockActionHandler
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
