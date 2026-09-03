import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react"
import { Brain, Check, ChevronRight, Circle, Code2, Database, FileText, Globe2, Hammer, ListTodo, Plug, Puzzle, Search } from "lucide-react"

import { Attachment, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle, AttachmentTrigger } from "@/components/ui/attachment"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { fileTypeLabel, formatFileSize } from "./file-meta"
import { contextIcons, type ContextType } from "./icon-registry"
import { hasInlineTags, INLINE_TAG_CLASS, parseInlineTags } from "./inline-tag"
import { CopyAction, FeedbackActions } from "./message-actions"
import { MarkdownContent } from "./markdown-content"
import { AgentAvatar, LibraryFileIcon } from "./resource-visuals"
import { ClarificationFormCard } from "./clarification-form-card"
import type { ProductBlockAction } from "@/agent-ui/conversation"
import { type AssistantAttachment, type ClarificationFollowUpData, type ClarificationFormData, type ConversationScene, type ConversationTurnData, type ExecutionActionData, type ExecutionData, type ExecutionStepData, type ExecutionTaskData, type ProductConversationBlock, type ReasoningData } from "@/agent-ui/immersive/contracts"
import type { ProductIdentity, WelcomeExpert } from "@/agent-ui/immersive/contracts"
import type { ArtifactTarget } from "@/agent-ui/immersive/contracts"

export type ArtifactRouter = (target: ArtifactTarget) => void
export type ProductBlockActionHandler = (action: ProductBlockAction) => void
export type ProductBlockRenderer = (block: ProductConversationBlock, context: { isLatestTurn: boolean; onOpenArtifact: ArtifactRouter; onProductBlockAction: ProductBlockActionHandler }) => ReactNode
type OpenArtifact = ArtifactRouter
type ProductActionResult = { actionId: string; message: string }

type DisclosureContentProps = {
  children: ReactNode
  className?: string
  open: boolean
}

/** 常驻内容配合 grid 行高实现展开与收起的双向过渡，避免条件卸载截断收起动画。 */
function DisclosureContent({ children, className, open }: DisclosureContentProps) {
  return (
    <div
      aria-hidden={!open}
      inert={!open || undefined}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0",
        className,
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}

type FollowUpPhase = "validating" | "assembling" | "ready"

const FOLLOW_UP_DELAYS: Record<Exclude<FollowUpPhase, "ready">, number> = {
  validating: 1100,
  assembling: 1400,
}

function getNextFollowUpPhase(phase: FollowUpPhase): FollowUpPhase {
  return phase === "validating" ? "assembling" : "ready"
}

function useReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)")
      query.addEventListener("change", onStoreChange)
      return () => query.removeEventListener("change", onStoreChange)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  )
}

function getStreamingExecution(followUp: ClarificationFollowUpData, phase: FollowUpPhase): ExecutionData {
  const [validationStep, assemblyStep] = followUp.execution.steps
  const running = phase !== "ready"
  const steps: ExecutionStepData[] = [
    { ...validationStep, status: phase === "validating" ? "running" : "completed" },
  ]
  if (phase !== "validating") {
    steps.push({ ...assemblyStep, status: phase === "assembling" ? "running" : "completed" })
  }

  return {
    ...followUp.execution,
    status: running ? "running" : "completed",
    summary: phase === "validating"
      ? "正在校验出差日期、目的地与交通安排"
      : phase === "assembling"
        ? "正在整理出差申请单数据"
        : followUp.execution.summary,
    duration: phase === "ready" ? followUp.execution.duration : "刚刚",
    flat: false,
    steps,
  }
}

export function ConversationFlow({ approvalStatus, scene, identity, experts, onOpenArtifact, onProductBlockAction, renderProductBlock }: { approvalStatus?: "pending" | "approved" | "rejected"; scene: ConversationScene; identity: ProductIdentity; experts: readonly WelcomeExpert[]; onOpenArtifact: ArtifactRouter; onProductBlockAction?: ProductBlockActionHandler; renderProductBlock?: ProductBlockRenderer }) {
  const [submittedClarificationIds, setSubmittedClarificationIds] = useState<Set<string>>(() => new Set())
  const [followUpPhases, setFollowUpPhases] = useState<Record<string, FollowUpPhase>>({})
  const [productActionResults, setProductActionResults] = useState<Record<string, ProductActionResult>>({})
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const timers = Object.entries(followUpPhases).flatMap(([formId, phase]) => {
      if (phase === "ready") return []
      const timer = window.setTimeout(() => {
        setFollowUpPhases((current) => current[formId] === phase
          ? { ...current, [formId]: getNextFollowUpPhase(phase) }
          : current)
      }, prefersReducedMotion ? 0 : FOLLOW_UP_DELAYS[phase])
      return [timer]
    })

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [followUpPhases, prefersReducedMotion])

  const submitClarification = (formId: string) => {
    setSubmittedClarificationIds((ids) => ids.has(formId) ? ids : new Set(ids).add(formId))
    setFollowUpPhases((phases) => phases[formId] ? phases : { ...phases, [formId]: "validating" })
  }

  const handleProductBlockAction = (action: ProductBlockAction) => {
    if (action.type === "confirm-decision") {
      onProductBlockAction?.(action)
      return
    }
    if (action.type === "follow-up-select") {
      setProductActionResults((results) => {
        const next = { ...results }
        delete next[action.blockId]
        return next
      })
      onProductBlockAction?.(action)
      return
    }

    const message = `已记录“${action.recovery}”恢复选择；本地演示不会执行真实恢复操作。`
    setProductActionResults((results) => ({ ...results, [action.blockId]: { actionId: action.actionId, message } }))
    onProductBlockAction?.(action)
  }

  return <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-10 py-3">{scene.turns.map((turn, index) => {
    const clarificationId = turn.assistant?.clarification?.id
    return <ConversationTurn
      key={turn.id}
      turn={turn}
      approvalStatus={approvalStatus}
      identity={identity}
      experts={experts}
      renderProductBlock={renderProductBlock}
      productActionResult={turn.productBlock ? productActionResults[turn.productBlock.id] : undefined}
      onProductBlockAction={handleProductBlockAction}
      current={index === scene.turns.length - 1}
      onOpenArtifact={onOpenArtifact}
      onClarificationSubmit={submitClarification}
      clarificationSubmitted={Boolean(clarificationId && submittedClarificationIds.has(clarificationId))}
      followUpPhase={clarificationId ? followUpPhases[clarificationId] : undefined}
    />
  })}</div>
}

function ConversationTurn({ approvalStatus, clarificationSubmitted, current, experts, followUpPhase, identity, onClarificationSubmit, onOpenArtifact, onProductBlockAction, productActionResult, renderProductBlock, turn }: { approvalStatus?: "pending" | "approved" | "rejected"; clarificationSubmitted: boolean; current: boolean; experts: readonly WelcomeExpert[]; followUpPhase?: FollowUpPhase; identity: ProductIdentity; onClarificationSubmit: (formId: string) => void; onOpenArtifact: ArtifactRouter; onProductBlockAction: ProductBlockActionHandler; productActionResult?: ProductActionResult; renderProductBlock?: ProductBlockRenderer; turn: ConversationTurnData }) {
  const continuation = clarificationSubmitted ? turn.assistant?.clarification?.followUp : undefined
  const approvalPending = Boolean(current && turn.awaitingApproval && approvalStatus === "pending")
  const approvalOutcome = current && turn.productBlock && turn.approvalOutcomes && approvalStatus && approvalStatus !== "pending"
    ? turn.approvalOutcomes[approvalStatus]
    : undefined
  return <section className="space-y-5">
    <UserMessage message={turn.user} onOpenArtifact={onOpenArtifact} />
    <AgentResponseBlock
      identity={identity}
      experts={experts}
      productBlock={approvalPending || !turn.awaitingApproval ? turn.productBlock : undefined}
      renderProductBlock={renderProductBlock}
      productActionResult={productActionResult}
      needsApproval={approvalPending}
      onProductBlockAction={onProductBlockAction}
      expert={turn.expert}
      execution={turn.execution}
      current={current}
      onOpenArtifact={onOpenArtifact}
      assistant={turn.assistant}
      clarificationSubmitted={clarificationSubmitted}
      onClarificationSubmit={onClarificationSubmit}
      needsReply={current && turn.assistant?.kind === "question" && !continuation}
    />
    {approvalOutcome && <ApprovalContinuation current={current} execution={approvalOutcome.execution} assistant={approvalOutcome.assistant} identity={identity} experts={experts} expert={turn.expert} onOpenArtifact={onOpenArtifact} />}
    {continuation && <AssistantContinuation identity={identity} experts={experts} expert={turn.expert} followUp={continuation} phase={followUpPhase ?? "ready"} current={current} onOpenArtifact={onOpenArtifact} />}
  </section>
}

function AssistantContinuation({ current, expert, followUp, identity, experts, onOpenArtifact, phase }: { current: boolean; expert?: string; followUp: ClarificationFollowUpData; identity: ProductIdentity; experts: readonly WelcomeExpert[]; onOpenArtifact: ArtifactRouter; phase: FollowUpPhase }) {
  const execution = getStreamingExecution(followUp, phase)
  return <div className="animate-in fade-in-0 duration-200 motion-reduce:animate-none">
    <AgentResponseBlock
      identity={identity}
      experts={experts}
      expert={expert}
      execution={execution}
      current={current}
      onOpenArtifact={onOpenArtifact}
      assistant={phase === "ready" ? followUp.assistant : undefined}
      needsReply={phase === "ready" && current}
    />
  </div>
}

function ApprovalContinuation({ assistant, current, execution, expert, experts, identity, onOpenArtifact }: { assistant: ConversationTurnData["assistant"]; current: boolean; execution: ExecutionData; expert?: string; experts: readonly WelcomeExpert[]; identity: ProductIdentity; onOpenArtifact: ArtifactRouter }) {
  if (!assistant) return null
  return <div className="animate-in fade-in-0 duration-200 motion-reduce:animate-none">
    <AgentResponseBlock
      identity={identity}
      experts={experts}
      expert={expert}
      execution={execution}
      current={current}
      onOpenArtifact={onOpenArtifact}
      assistant={assistant}
    />
  </div>
}

function AgentResponseBlock({
  assistant,
  clarificationSubmitted = false,
  current,
  execution,
  experts,
  expert,
  identity,
  needsApproval = false,
  needsReply = false,
  onClarificationSubmit,
  onOpenArtifact,
  onProductBlockAction,
  productActionResult,
  productBlock,
  renderProductBlock,
}: {
  assistant?: ConversationTurnData["assistant"]
  clarificationSubmitted?: boolean
  current: boolean
  execution: ExecutionData
  experts: readonly WelcomeExpert[]
  expert?: string
  identity: ProductIdentity
  needsApproval?: boolean
  needsReply?: boolean
  onClarificationSubmit?: (formId: string) => void
  onOpenArtifact: ArtifactRouter
  onProductBlockAction?: ProductBlockActionHandler
  productActionResult?: ProductActionResult
  productBlock?: ProductConversationBlock
  renderProductBlock?: ProductBlockRenderer
}) {
  return <div className="space-y-5">
    <div className="space-y-2">
      <AgentIdentity identity={identity} experts={experts} expert={expert} />
      <ExecutionProcess execution={execution} current={current} onOpenArtifact={onOpenArtifact} />
    </div>
    {assistant && <AssistantMessage {...assistant} clarificationSubmitted={clarificationSubmitted} onClarificationSubmit={onClarificationSubmit} onOpenArtifact={onOpenArtifact} needsApproval={needsApproval} needsReply={needsReply} />}
    {productBlock && renderProductBlock?.(productBlock, { isLatestTurn: current, onOpenArtifact, onProductBlockAction: onProductBlockAction ?? (() => undefined) })}
    {productActionResult && productBlock?.type !== "follow-up-suggestions" && <ProductBlockActionFeedback result={productActionResult} />}
  </div>
}

function ProductBlockActionFeedback({ result }: { result: ProductActionResult }) {
  return <div role="log" aria-live="polite" aria-relevant="additions" className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">{result.message}</div>
}

export function AgentIdentity({ identity, experts, expert }: { identity: ProductIdentity; experts: readonly WelcomeExpert[]; expert?: string }) {
  const expertConfig = experts.find((item) => item.id === expert || item.label === expert)
  return <div className="flex items-center gap-2 text-[15px] font-medium leading-6">
    <AgentAvatar expertVisualKey={expertConfig?.visualKey} productAvatar={identity.avatar} />
    <span className="truncate">{expertConfig?.label ?? expert ?? identity.name}</span>
  </div>
}

export function UserMessage({ message, onOpenArtifact }: { message: ConversationTurnData["user"]; onOpenArtifact?: OpenArtifact }) {
  const { attachments, content, timestamp } = message
  return <div className="group/message flex flex-col items-end gap-2">
    <MessageAttachmentList attachments={attachments} onOpenArtifact={onOpenArtifact} align="end" />
    <div className="max-w-[85%] rounded-[10px] bg-primary-bg px-4 py-3"><MessageContent content={content} /></div>
    {/* 位置始终预留（h-7），只切换透明度，避免悬停/移开时下方内容跳动 */}
    <div className="flex h-7 items-center gap-2 text-ring opacity-0 transition-opacity focus-within:opacity-100 group-hover/message:opacity-100">
      {timestamp && <time className="text-sm">{timestamp}</time>}
      {timestamp && <span className="h-4 w-px bg-border" />}
      <CopyAction content={content} />
    </div>
  </div>
}

type PreviewAttachment = {
  id: string
  name: string
  size: number
  target?: ArtifactTarget
}

function MessageAttachmentList({
  align,
  attachments,
  onOpenArtifact,
}: {
  align: "end" | "start"
  attachments?: PreviewAttachment[]
  onOpenArtifact?: OpenArtifact
}) {
  if (!attachments?.length) return null

  return <div className={cn("flex max-w-[85%] flex-wrap gap-2", align === "end" ? "justify-end" : "justify-start")}>
    {attachments.map((file) => (
      <Attachment key={file.id} className="w-60">
        <AttachmentMedia><LibraryFileIcon fileName={file.name} /></AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>{file.name}</AttachmentTitle>
          <AttachmentDescription>{fileTypeLabel(file.name)} · {formatFileSize(file.size)}</AttachmentDescription>
        </AttachmentContent>
        {file.target && onOpenArtifact && <AttachmentTrigger aria-label={`预览 ${file.name}`} onClick={() => onOpenArtifact(file.target!)} />}
      </Attachment>
    ))}
  </div>
}

/**
 * 含内联标签的消息按「文本 + badge」逐段渲染；不含标签时走完整 Markdown。
 * 混排时文本段按纯文本处理，因为 Markdown 的块级结构没法和行内 badge 共存。
 */
function MessageContent({ content }: { content: string }) {
  if (!hasInlineTags(content)) return <MarkdownContent>{content}</MarkdownContent>
  return <p className="whitespace-pre-wrap text-[15px] leading-6">
    {parseInlineTags(content).map((segment, index) => segment.kind === "text"
      ? <span key={index}>{segment.value}</span>
      : <InlineTagBadge key={index} label={segment.label} type={segment.type} />)}
  </p>
}

function InlineTagBadge({ label, type }: { label: string; type: ContextType }) {
  const ContextIcon = contextIcons[type]
  return <span className={cn(INLINE_TAG_CLASS, "bg-background/70")}>
    {type === "文件库" ? <LibraryFileIcon fileName={label} className="size-3.5" /> : <ContextIcon className="size-3.5 shrink-0" />}
    <span className="truncate">{label}</span>
  </span>
}

export function ExecutionProcess({ execution, current, onOpenArtifact }: { execution: ExecutionData; current: boolean; onOpenArtifact: OpenArtifact }) {
  const [open, setOpen] = useState(execution.status === "running" && current)
  const running = execution.status === "running"
  const statusLabel = running ? "任务进行中..." : execution.status === "waiting" ? "等待回复" : "任务耗时"
  return <div className="text-[15px] leading-6 text-muted-foreground">
    <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex h-6 items-center gap-1 transition-colors hover:text-foreground">
      <span className={cn(running && current && "shimmer shimmer-color-foreground shimmer-duration-1200 shimmer-spread-8")}>{statusLabel}{execution.duration ? ` ${execution.duration}` : ""}</span>
      <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
    </button>
    <DisclosureContent open={open}>
      <div className="mt-4 space-y-4">
        {execution.reasoning && <ReasoningPanel reasoning={execution.reasoning} />}
        {execution.showSummary !== false && <p>{execution.summary}</p>}
        {execution.steps.length > 0 && (execution.flat
          ? <FlatExecutionFlow steps={execution.steps} onOpenArtifact={onOpenArtifact} />
          : <div>{execution.steps.map((step, index) => <ExecutionStep key={step.id} step={step} connected={index < execution.steps.length - 1} onOpenArtifact={onOpenArtifact} />)}</div>)}
        {execution.tasks?.map((task) => <TaskBlock key={task.id} task={task} onOpenArtifact={onOpenArtifact} />)}
      </div>
    </DisclosureContent>
  </div>
}

export function FlatExecutionFlow({ steps, onOpenArtifact }: { steps: ExecutionStepData[]; onOpenArtifact: OpenArtifact }) {
  return <div className="space-y-4">{steps.map((step) => <div key={step.id} className="space-y-2">
    {step.detail && <p className="leading-6 text-muted-foreground">{step.detail}</p>}
    {step.actions && <div className="flex flex-col items-start gap-2">{step.actions.map((action) => <ExecutionActionBadge key={`${action.type}-${action.label}`} action={action} onOpenArtifact={onOpenArtifact} />)}</div>}
    {step.reasoning && <ReasoningPanel reasoning={step.reasoning} />}
  </div>)}</div>
}

export function ExecutionStep({ step, connected = false, onOpenArtifact }: { step: ExecutionStepData; connected?: boolean; onOpenArtifact: OpenArtifact }) {
  return <div className="flex gap-2">
    <span className="flex w-4 shrink-0 flex-col items-center pt-1">
      <span className="grid size-4 shrink-0 place-items-center">{step.status === "running" ? <Spinner className="size-4" /> : step.status === "completed" ? <span className="grid size-3.5 place-items-center rounded-full border border-primary text-primary"><Check className="size-2.5" /></span> : <Circle className="size-3 text-muted-foreground/50" />}</span>
      {connected && <span className="mt-2 min-h-4 w-px flex-1 bg-border" />}
    </span>
    <div className={cn("min-w-0 flex-1 pb-4", !connected && "pb-0")}>
      <p className={cn("font-medium leading-6", step.status === "pending" && "font-normal text-muted-foreground/70")}>{step.title}</p>
      {step.detail && <p className="mt-2 leading-6 text-muted-foreground">{step.detail}</p>}
      {step.actions && <div className="mt-2 flex flex-col items-start gap-2">{step.actions.map((action) => <ExecutionActionBadge key={`${action.type}-${action.label}`} action={action} onOpenArtifact={onOpenArtifact} />)}</div>}
      {step.reasoning && <div className="mt-3"><ReasoningPanel reasoning={step.reasoning} /></div>}
    </div>
  </div>
}

const actionIcons = {
  skill: Puzzle,
  api: Database,
  query: Search,
  script: Code2,
  file: FileText,
  connector: Plug,
  knowledge: Search,
  web: Globe2,
} satisfies Record<ExecutionActionData["type"], typeof Hammer>

export function ExecutionActionBadge({ action, onOpenArtifact }: { action: ExecutionActionData; onOpenArtifact: OpenArtifact }) {
  const ActionIcon = actionIcons[action.type]
  const content = <><ActionIcon className="size-4 shrink-0 opacity-80" /><span className="truncate">{action.label}</span>{action.target && <ChevronRight className="ml-0.5 size-3.5 shrink-0 opacity-50" />}</>
  const className = "flex h-8 max-w-[300px] items-center gap-1.5 rounded-full bg-secondary px-3 text-sm leading-5 text-foreground transition-colors hover:bg-input"
  return action.target
    ? <button type="button" className={cn(className, "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")} onClick={() => onOpenArtifact(action.target!)}>{content}</button>
    : <span className={className}>{content}</span>
}

export function ReasoningPanel({ reasoning }: { reasoning: ReasoningData }) {
  const [open, setOpen] = useState(Boolean(reasoning.running))
  return <div className="space-y-3">
    <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex h-6 items-center gap-2 transition-colors hover:text-foreground">
      <Brain className="size-4" /><span>思考过程</span><ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
    </button>
    <DisclosureContent open={open}>
      <div className="pt-3">
        <div className="rounded-lg border bg-secondary p-3 text-muted-foreground"><MarkdownContent className="[--typeset-leading:1.4286] [--typeset-size:14px]">{reasoning.content}</MarkdownContent></div>
      </div>
    </DisclosureContent>
  </div>
}

export function TaskBlock({ task, onOpenArtifact }: { task: ExecutionTaskData; onOpenArtifact: OpenArtifact }) {
  const [open, setOpen] = useState(task.status === "running")
  return <div>
    <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex w-full items-start gap-2 rounded-lg text-left transition-colors hover:text-foreground">
      {task.status === "running" ? <Spinner className="mt-1 size-4 shrink-0" /> : <span className="mt-1 grid size-3.5 shrink-0 place-items-center rounded-full border border-primary text-primary"><Check className="size-2.5" /></span>}
      <span className="flex w-fit min-w-0 max-w-full items-center gap-1 font-medium leading-6"><span className="truncate">{task.title}</span><ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} /></span>
    </button>
    <DisclosureContent open={open}>
      <div className="ml-6 mt-3 space-y-4">
        {task.steps.map((step) => <TaskExecutionStep key={step.id} step={step} onOpenArtifact={onOpenArtifact} />)}
        <p className="leading-6 text-muted-foreground">{task.summary}</p>
      </div>
    </DisclosureContent>
  </div>
}

function TaskExecutionStep({ step, onOpenArtifact }: { step: ExecutionStepData; onOpenArtifact: OpenArtifact }) {
  return <div className="space-y-2">
    <p className={cn("leading-6", step.status === "pending" && "text-muted-foreground/70")}>{step.title}{step.detail ? `，${step.detail}` : ""}</p>
    {step.actions && <div className="flex flex-col items-start gap-2">{step.actions.map((action) => <ExecutionActionBadge key={`${action.type}-${action.label}`} action={action} onOpenArtifact={onOpenArtifact} />)}</div>}
    {step.reasoning && <ReasoningPanel reasoning={step.reasoning} />}
  </div>
}

export function AssistantMessage({ attachments, clarification, clarificationSubmitted = false, content, needsApproval = false, needsReply = false, onClarificationSubmit, onOpenArtifact, timestamp }: { attachments?: AssistantAttachment[]; clarification?: ClarificationFormData; clarificationSubmitted?: boolean; content: string; timestamp: string; kind?: "answer" | "question"; needsApproval?: boolean; needsReply?: boolean; onClarificationSubmit?: (formId: string) => void; onOpenArtifact?: OpenArtifact }) {
  return <div className="space-y-3">
    {(needsApproval || needsReply) && <div className={cn("flex items-center gap-2 text-sm font-medium", needsApproval ? "text-destructive-foreground" : "text-primary")}><ListTodo className="size-4" />{needsApproval ? "需要你的批准" : "需要你的回复"}</div>}
    <MarkdownContent>{content}</MarkdownContent>
    <MessageAttachmentList attachments={attachments} onOpenArtifact={onOpenArtifact} align="start" />
    {clarification && <ClarificationFormCard form={clarification} submitted={clarificationSubmitted} onSubmit={onClarificationSubmit} />}
    <div className="flex items-center gap-1 text-ring"><CopyAction content={content} /><FeedbackActions /><span className="mx-1 h-4 w-px bg-border" /><time className="text-sm">{timestamp}</time></div>
  </div>
}
