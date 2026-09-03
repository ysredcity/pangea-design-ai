
import type { ProductBlockAction } from '../conversation'

export type SearchResult = { id: string; title: string; description: string; url: string; source: string }
export type PanelView =
  | { type: 'search-results'; title: string; query: string; results: SearchResult[] }
  | { type: 'browser'; title: string; url: string; description?: string; source?: string }
  | { type: 'file-preview'; title: string; fileName: string; content: string; fileType?: string }
export type ImageView = { type: 'image'; title: string; fileName: string; src: string; alt?: string; fileType?: string }
export type ImmersiveArtifactTarget = PanelView | ImageView
export type PanelTab = { id: string } & PanelView

export type ExecutionActionData = { label: string; type: 'skill' | 'api' | 'query' | 'script' | 'file' | 'connector' | 'knowledge' | 'web'; target?: ImmersiveArtifactTarget }
export type ReasoningData = { id: string; content: string; running?: boolean }
export type ExecutionStepData = { id: string; title: string; detail?: string; status: 'completed' | 'running' | 'pending'; actions?: ExecutionActionData[]; reasoning?: ReasoningData }
export type ExecutionTaskData = { id: string; title: string; summary: string; status: 'completed' | 'running'; steps: ExecutionStepData[] }
export type ExecutionData = { status: 'completed' | 'running' | 'waiting'; summary: string; duration?: string; showSummary?: boolean; flat?: boolean; steps: ExecutionStepData[]; reasoning?: ReasoningData; tasks?: ExecutionTaskData[] }
export type MessageAttachment = { id: string; name: string; size: number; target?: ImmersiveArtifactTarget }
export type AssistantAttachment = MessageAttachment & { target: ImmersiveArtifactTarget }
export type ClarificationOption = { label: string; value: string }
export type ClarificationFieldValue = string | string[] | { end: string; start: string }
export type ClarificationField =
  | { id: string; label: string; placeholder?: string; required?: boolean; type: 'text' | 'textarea' }
  | { id: string; label: string; required?: boolean; type: 'date-range' }
  | { id: string; label: string; required?: boolean; type: 'single-select' | 'multi-select'; options: ClarificationOption[] }
export type ProductConversationBlock = { id: string; type: string; data?: unknown }
export type AssistantMessageData = { attachments?: AssistantAttachment[]; clarification?: ClarificationFormData; content: string; timestamp: string; kind?: 'answer' | 'question' }
export type ClarificationFollowUpData = { assistant: AssistantMessageData & { kind: 'question' }; execution: ExecutionData; id: string }
export type ClarificationFormData = { defaultOpen?: boolean; description?: string; fields: ClarificationField[]; followUp?: ClarificationFollowUpData; id: string; initialValues?: Record<string, ClarificationFieldValue>; submitLabel?: string; title: string }
export type ApprovalOutcomeData = { execution: ExecutionData; assistant: AssistantMessageData }
export type ImmersiveConversationTurn = { id: string; awaitingApproval?: boolean; approvalOutcomes?: { approved: ApprovalOutcomeData; rejected: ApprovalOutcomeData }; expert?: string; user: { content: string; attachments?: MessageAttachment[]; timestamp?: string }; execution: ExecutionData; assistant?: AssistantMessageData; productBlock?: ProductConversationBlock }
export type ImmersiveConversationScene = { id: string; title?: string; turns: ImmersiveConversationTurn[] }

export type ImmersiveConversationMeta = { id: string; title: string; loading?: boolean; unread?: boolean; waitingForReply?: boolean; approvalStatus?: 'pending' | 'approved' | 'rejected'; initialMessage?: string; expert?: string }
export type ProductIdentity = { name: string; avatar: 'bot' }
export type NavigationItem = { id: 'new-conversation' | 'capability-hub' | 'scheduled-task' | 'file-library'; label: string; visualKey: 'newConversation' | 'capabilityHub' | 'scheduledTask' | 'fileLibrary' }
export type WelcomeExpert = { id: string; label: string; visualKey: 'document' | 'data' | 'travel' | 'office' | 'research' | 'campus' | 'ux' | 'industry' }
export type WelcomeRecommendation = { expertId: string; prompt: string }
export type ImmersiveProductBlockRenderer = (block: ProductConversationBlock, context: { isLatestTurn: boolean; onOpenArtifact: (target: ImmersiveArtifactTarget) => void; onProductBlockAction: (action: ProductBlockAction) => void }) => import('react').ReactNode
export type ImmersiveAppConfig = { identity: ProductIdentity; navigation: readonly NavigationItem[]; experts: readonly WelcomeExpert[]; welcome: { greeting: string; expertIds: readonly string[]; recommendations: readonly WelcomeRecommendation[]; expertRecommendations: Readonly<Record<string, readonly string[]>> }; renderProductBlock?: ImmersiveProductBlockRenderer }
export type ImmersiveDraftSceneFactory = (content: string, expert?: string, attachments?: MessageAttachment[]) => ImmersiveConversationScene
export type ImmersiveAgentAppProps = { config: ImmersiveAppConfig; scenes: readonly ImmersiveConversationScene[]; initialPinnedConversations?: readonly ImmersiveConversationMeta[]; initialConversations?: readonly ImmersiveConversationMeta[]; createDraftScene: ImmersiveDraftSceneFactory }

export type ArtifactTarget = ImmersiveArtifactTarget
export type ConversationScene = ImmersiveConversationScene
export type ConversationTurnData = ImmersiveConversationTurn
export type AppConfig = ImmersiveAppConfig
export function formatTimestamp(date: Date = new Date()): string { const pad = (value: number) => String(value).padStart(2, '0'); return `${pad(date.getMonth() + 1)}月${pad(date.getDate())}日 ${pad(date.getHours())}:${pad(date.getMinutes())}` }
