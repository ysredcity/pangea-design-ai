import { CheckCircle2, CircleDashed, Loader2, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * 任务过程展示。对应设计文档：references/component-selection/task-progress.md
 *
 * 三层结构：状态层（必需）/ 任务层（非必须，长链路任务）/ 执行层（渐进式 append）。
 * 硬约束：不展示模型内部原始思维链或系统提示词；工具调用要转成用户可理解的描述。
 */

export interface TaskProgressData {
  status: 'thinking' | 'calling-tool' | 'done' | 'error'
  elapsedMs?: number
  tasks?: { name: string; status: 'pending' | 'running' | 'done' | 'error' }[]
  steps?: { label: string; detail?: string }[]
}

const STATUS_LABEL: Record<TaskProgressData['status'], string> = {
  thinking: '思考中',
  'calling-tool': '正在调用工具',
  done: '已完成',
  error: '出错了',
}

function formatElapsed(ms?: number) {
  if (!ms) return null
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

function TaskStatusIcon({ status }: { status: 'pending' | 'running' | 'done' | 'error' }) {
  if (status === 'done') return <CheckCircle2 className="size-3.5 text-success" />
  if (status === 'error') return <XCircle className="size-3.5 text-destructive" />
  if (status === 'running') return <Loader2 className="size-3.5 animate-spin text-primary" />
  return <CircleDashed className="size-3.5 text-muted-foreground" />
}

export function TaskProgress({ status, elapsedMs, tasks, steps }: TaskProgressData) {
  const elapsed = formatElapsed(elapsedMs)

  return (
    <div className="flex w-full max-w-[560px] flex-col gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-xs">
      {/* 状态层 */}
      <div className="flex items-center gap-2 text-muted-foreground">
        {status === 'done' ? (
          <CheckCircle2 className="size-3.5 text-success" />
        ) : status === 'error' ? (
          <XCircle className="size-3.5 text-destructive" />
        ) : (
          <Loader2 className="size-3.5 animate-spin text-primary" />
        )}
        <span>{STATUS_LABEL[status]}</span>
        {elapsed ? <span className="text-muted-foreground/70">· {elapsed}</span> : null}
      </div>

      {/* 任务层（非必须） */}
      {tasks && tasks.length > 0 ? (
        <ol className="flex flex-col gap-1 border-t border-border pt-2">
          {tasks.map((task) => (
            <li key={task.name} className="flex items-center gap-2">
              <TaskStatusIcon status={task.status} />
              <span className={cn('text-foreground', task.status === 'pending' && 'text-muted-foreground')}>
                {task.name}
              </span>
            </li>
          ))}
        </ol>
      ) : null}

      {/* 执行层：渐进式展示，逐条 append */}
      {steps && steps.length > 0 ? (
        <ul className="flex flex-col gap-1 border-t border-border pt-2 text-muted-foreground">
          {steps.map((step, i) => (
            <li key={`${step.label}-${i}`}>
              <span className="text-foreground">{step.label}</span>
              {step.detail ? <span className="text-muted-foreground"> · {step.detail}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** 把接口名/工具名转成用户可理解的描述。禁止直接展示原始接口名。 */
export function toolCallLabel(rawToolName: string, fallback = '正在处理'): string {
  const map: Record<string, string> = {
    search_docs: '正在读取文档',
    web_search: '正在搜索网络',
    read_file: '正在读取文件',
    write_file: '正在写入文件',
  }
  return map[rawToolName] ?? fallback
}
