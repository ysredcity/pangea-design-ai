import ReactMarkdown from 'react-markdown'

import { cn } from '@/lib/utils'
import { TaskProgress, type TaskProgressData } from './task-progress'
import { ArtifactCard, type ArtifactSummary } from './artifact-card'
import { MessageActions, type MessageAction } from './message-actions'

/**
 * 消息气泡。对应设计文档：references/component-selection/message-bubble.md
 *
 * 硬约束：不渲染模型内部原始思维链/系统提示词；不渲染原始 HTML（安全边界，ReactMarkdown 默认不解析 HTML）。
 */

export interface MessageBubbleProps {
  role: 'user' | 'assistant'
  /** Markdown 内容。 */
  content: string
  status?: 'streaming' | 'done' | 'error'
  taskProgress?: TaskProgressData
  artifacts?: ArtifactSummary[]
  onOpenArtifact?: (artifact: ArtifactSummary) => void
  actions?: MessageAction[]
  className?: string
}

export function MessageBubble({
  role,
  content,
  status = 'done',
  taskProgress,
  artifacts,
  onOpenArtifact,
  actions,
  className,
}: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={cn('flex w-full gap-3', isUser ? 'justify-end' : 'justify-start', className)}>
      <div className={cn('flex max-w-[720px] flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
        {taskProgress ? <TaskProgress {...taskProgress} /> : null}

        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
          )}
          // 流式输出：避免整段重新挂载打断屏幕阅读器播报节奏，用 aria-live 承载增量内容
          {...(!isUser && status === 'streaming'
            ? { role: 'log' as const, 'aria-live': 'polite' as const }
            : {})}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          {status === 'streaming' ? (
            <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-current align-middle" aria-hidden />
          ) : null}
        </div>

        {artifacts && artifacts.length > 0 ? (
          <div className="flex w-full flex-col gap-2">
            {artifacts.map((artifact) => (
              <ArtifactCard key={artifact.id} artifact={artifact} onOpen={() => onOpenArtifact?.(artifact)} />
            ))}
          </div>
        ) : null}

        {!isUser && actions && actions.length > 0 && status !== 'streaming' ? (
          <MessageActions role={role} actions={actions} />
        ) : null}
      </div>
    </div>
  )
}
