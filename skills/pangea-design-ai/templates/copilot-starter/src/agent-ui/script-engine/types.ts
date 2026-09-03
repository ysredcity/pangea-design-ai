import type { ReactNode } from 'react'

/**
 * 双数据源剧本引擎的统一富场景契约。
 *
 * TS 作者直接提供 `ConversationScene[]`；JSON 作者提供 `JsonConversationScene[]`，
 * 并在加载边界通过 `resolveTargets()` 将 targetId 还原为产品自己的目标对象。
 * 引擎不依赖面板、画布或任何具体 renderer。
 */
export type SceneTrigger = {
  type: 'keyword' | 'regex'
  patterns: string[]
}

export type ExecutionStatus = 'completed' | 'running' | 'waiting'
export type ExecutionActionType = 'skill' | 'api' | 'query' | 'script' | 'file' | 'connector' | 'knowledge' | 'web'

export type ExecutionActionData<TTarget> = {
  label: string
  type: ExecutionActionType
  target?: TTarget
}

export type ReasoningData = {
  id: string
  content: string
  running?: boolean
}

export type ExecutionStepData<TTarget> = {
  id: string
  title: string
  detail?: string
  status: 'completed' | 'running' | 'pending'
  actions?: ExecutionActionData<TTarget>[]
  reasoning?: ReasoningData
}

export type ExecutionTaskData<TTarget> = {
  id: string
  title: string
  summary: string
  status: 'completed' | 'running'
  steps: ExecutionStepData<TTarget>[]
}

export type ExecutionData<TTarget> = {
  status: ExecutionStatus
  summary: string
  duration?: string
  showSummary?: boolean
  flat?: boolean
  steps: ExecutionStepData<TTarget>[]
  reasoning?: ReasoningData
  tasks?: ExecutionTaskData<TTarget>[]
}

export type MessageAttachment<TTarget> = {
  id: string
  name: string
  size: number
  target?: TTarget
}

export type AssistantAttachment<TTarget> = MessageAttachment<TTarget> & { target: TTarget }

export type ClarificationOption = { label: string; value: string }
export type ClarificationFieldValue = string | string[] | { end: string; start: string }
export type ClarificationField =
  | { id: string; label: string; placeholder?: string; required?: boolean; type: 'text' | 'textarea' }
  | { id: string; label: string; required?: boolean; type: 'date-range' }
  | { id: string; label: string; required?: boolean; type: 'single-select' | 'multi-select'; options: ClarificationOption[] }

export type AssistantMessageData<TTarget> = {
  attachments?: AssistantAttachment<TTarget>[]
  clarification?: ClarificationFormData<TTarget>
  content: string
  timestamp: string
  kind?: 'answer' | 'question'
}

export type ClarificationFollowUpData<TTarget> = {
  assistant: AssistantMessageData<TTarget> & { kind: 'question' }
  execution: ExecutionData<TTarget>
  id: string
}

export type ClarificationFormData<TTarget> = {
  defaultOpen?: boolean
  description?: string
  fields: ClarificationField[]
  followUp?: ClarificationFollowUpData<TTarget>
  id: string
  initialValues?: Record<string, ClarificationFieldValue>
  submitLabel?: string
  title: string
}

export type ProductConversationBlock = {
  id: string
  type: string
  data?: unknown
}

export type ApprovalOutcomeData<TTarget> = {
  execution: ExecutionData<TTarget>
  assistant: AssistantMessageData<TTarget>
}

export type ConversationTurnData<TTarget> = {
  id: string
  awaitingApproval?: boolean
  approvalOutcomes?: {
    approved: ApprovalOutcomeData<TTarget>
    rejected: ApprovalOutcomeData<TTarget>
  }
  expert?: string
  user: {
    content: string
    attachments?: MessageAttachment<TTarget>[]
    timestamp?: string
  }
  execution: ExecutionData<TTarget>
  assistant?: AssistantMessageData<TTarget>
  productBlock?: ProductConversationBlock
}

export type ConversationScene<TTarget> = {
  id: string
  title?: string
  trigger?: SceneTrigger
  turns: ConversationTurnData<TTarget>[]
}

/** JSON 仅存 target ID，防止把产品专属面板/画布对象泄漏进可编辑数据。 */
export type JsonTargetReference = { targetId: string }
export type JsonExecutionActionData = Omit<ExecutionActionData<never>, 'target'> & { targetId?: string }
export type JsonMessageAttachment = Omit<MessageAttachment<never>, 'target'> & { targetId?: string }
export type JsonAssistantAttachment = Omit<AssistantAttachment<never>, 'target'> & JsonTargetReference
export type JsonExecutionStepData = Omit<ExecutionStepData<never>, 'actions'> & { actions?: JsonExecutionActionData[] }
export type JsonExecutionTaskData = Omit<ExecutionTaskData<never>, 'steps'> & { steps: JsonExecutionStepData[] }
export type JsonExecutionData = Omit<ExecutionData<never>, 'steps' | 'tasks'> & { steps: JsonExecutionStepData[]; tasks?: JsonExecutionTaskData[] }
export type JsonAssistantMessageData = Omit<AssistantMessageData<never>, 'attachments' | 'clarification'> & {
  attachments?: JsonAssistantAttachment[]
  clarification?: Omit<ClarificationFormData<never>, 'followUp'> & {
    followUp?: {
      id: string
      execution: JsonExecutionData
      assistant: Omit<JsonAssistantMessageData, 'clarification'> & { kind: 'question' }
    }
  }
}
export type JsonConversationTurnData = Omit<ConversationTurnData<never>, 'execution' | 'assistant' | 'approvalOutcomes' | 'user'> & {
  user: { content: string; attachments?: JsonMessageAttachment[]; timestamp?: string }
  execution: JsonExecutionData
  assistant?: JsonAssistantMessageData
  approvalOutcomes?: {
    approved: { execution: JsonExecutionData; assistant: JsonAssistantMessageData }
    rejected: { execution: JsonExecutionData; assistant: JsonAssistantMessageData }
  }
}
export type JsonConversationScene = Omit<ConversationScene<never>, 'turns'> & { turns: JsonConversationTurnData[] }

export type ScriptPlayerRender<TTarget> = (scene: ConversationScene<TTarget>) => ReactNode
