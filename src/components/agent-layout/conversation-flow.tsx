import { useState } from "react"
import { Brain, Check, ChevronRight, Circle, Code2, Database, FileText, Globe2, Hammer, ListTodo, Plug, Puzzle, Search } from "lucide-react"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { CopyAction, FeedbackActions } from "./message-actions"
import { MarkdownContent } from "./markdown-content"
import type { ConversationScene, ConversationTurnData, ExecutionActionData, ExecutionData, ExecutionStepData, ExecutionTaskData, ReasoningData } from "./conversation-data"
import type { ArtifactTarget } from "./panel-types"

type OpenArtifact = (target: ArtifactTarget) => void

export function ConversationFlow({ scene, onOpenArtifact }: { scene: ConversationScene; onOpenArtifact: OpenArtifact }) {
  return <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-10 py-3">{scene.turns.map((turn, index) => <ConversationTurn key={turn.id} turn={turn} current={index === scene.turns.length - 1} onOpenArtifact={onOpenArtifact} />)}</div>
}

function ConversationTurn({ turn, current, onOpenArtifact }: { turn: ConversationTurnData; current: boolean; onOpenArtifact: OpenArtifact }) {
  return <section className="space-y-6">
    <UserMessage content={turn.user.content} contextLabels={turn.user.contextLabels} timestamp={turn.user.timestamp} />
    <ExecutionProcess execution={turn.execution} current={current} onOpenArtifact={onOpenArtifact} />
    {turn.assistant && <AssistantMessage {...turn.assistant} needsReply={current && turn.assistant.kind === "question"} />}
  </section>
}

export function UserMessage({ content, contextLabels, timestamp }: { content: string; contextLabels?: string[]; timestamp?: string }) {
  return <div className="group/message flex flex-col items-end gap-2">
    {contextLabels && contextLabels.length > 0 && <div className="flex max-w-[85%] flex-wrap justify-end gap-1.5">{contextLabels.map((label) => <span key={label} className="rounded-lg border bg-card px-2 py-1 text-xs text-muted-foreground">{label}</span>)}</div>}
    <div className="max-w-[85%] rounded-[10px] bg-primary-bg px-4 py-3"><MarkdownContent>{content}</MarkdownContent></div>
    {/* 位置始终预留（h-7），只切换透明度，避免悬停/移开时下方内容跳动 */}
    <div className="flex h-7 items-center gap-2 text-ring opacity-0 transition-opacity focus-within:opacity-100 group-hover/message:opacity-100">
      {timestamp && <time className="text-sm">{timestamp}</time>}
      {timestamp && <span className="h-4 w-px bg-border" />}
      <CopyAction content={content} />
    </div>
  </div>
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
    {open && <div className="mt-4 space-y-4">
      {execution.reasoning && <ReasoningPanel reasoning={execution.reasoning} />}
      {execution.showSummary !== false && <p>{execution.summary}</p>}
      {execution.steps.length > 0 && (execution.flat
        ? <FlatExecutionFlow steps={execution.steps} onOpenArtifact={onOpenArtifact} />
        : <div>{execution.steps.map((step, index) => <ExecutionStep key={step.id} step={step} connected={index < execution.steps.length - 1} onOpenArtifact={onOpenArtifact} />)}</div>)}
      {execution.tasks?.map((task) => <TaskBlock key={task.id} task={task} onOpenArtifact={onOpenArtifact} />)}
    </div>}
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
    {open && <div className="rounded-lg border bg-secondary p-3 text-muted-foreground"><MarkdownContent className="[--typeset-leading:1.4286] [--typeset-size:14px]">{reasoning.content}</MarkdownContent></div>}
  </div>
}

export function TaskBlock({ task, onOpenArtifact }: { task: ExecutionTaskData; onOpenArtifact: OpenArtifact }) {
  const [open, setOpen] = useState(task.status === "running")
  return <div>
    <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex w-full items-start gap-2 rounded-lg text-left transition-colors hover:text-foreground">
      {task.status === "running" ? <Spinner className="mt-1 size-4 shrink-0" /> : <span className="mt-1 grid size-3.5 shrink-0 place-items-center rounded-full border border-primary text-primary"><Check className="size-2.5" /></span>}
      <span className="flex w-fit min-w-0 max-w-full items-center gap-1 font-medium leading-6"><span className="truncate">{task.title}</span><ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} /></span>
    </button>
    {open && <div className="ml-6 mt-3 space-y-4">
      {task.steps.map((step) => <TaskExecutionStep key={step.id} step={step} onOpenArtifact={onOpenArtifact} />)}
      <p className="leading-6 text-muted-foreground">{task.summary}</p>
    </div>}
  </div>
}

function TaskExecutionStep({ step, onOpenArtifact }: { step: ExecutionStepData; onOpenArtifact: OpenArtifact }) {
  return <div className="space-y-2">
    <p className={cn("leading-6", step.status === "pending" && "text-muted-foreground/70")}>{step.title}{step.detail ? `，${step.detail}` : ""}</p>
    {step.actions && <div className="flex flex-col items-start gap-2">{step.actions.map((action) => <ExecutionActionBadge key={`${action.type}-${action.label}`} action={action} onOpenArtifact={onOpenArtifact} />)}</div>}
    {step.reasoning && <ReasoningPanel reasoning={step.reasoning} />}
  </div>
}

export function AssistantMessage({ content, needsReply = false, timestamp }: { content: string; timestamp: string; kind?: "answer" | "question"; needsReply?: boolean }) {
  return <div className="space-y-3">
    {needsReply && <div className="flex items-center gap-2 text-sm font-medium text-primary"><ListTodo className="size-4" />需要你的回复</div>}
    <MarkdownContent>{content}</MarkdownContent>
    <div className="flex items-center gap-1 text-ring"><CopyAction content={content} /><FeedbackActions /><span className="mx-1 h-4 w-px bg-border" /><time className="text-sm">{timestamp}</time></div>
  </div>
}
