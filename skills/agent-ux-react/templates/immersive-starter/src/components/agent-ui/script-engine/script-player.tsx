import * as React from 'react'

import { ArtifactCard } from '../artifact-card'
import { ClarifyCard } from '../clarify-card'
import { ConfirmCard } from '../confirm-card'
import { ErrorState } from '../error-state'
import { FollowUpSuggestions } from '../follow-up-suggestions'
import { MessageBubble } from '../message-bubble'
import { TaskProgress } from '../task-progress'
import type { AssistantEntry, RuntimeEntry } from './runtime'
import type { ScriptBlock } from './types'

/**
 * 剧本播放器——把 useScriptRuntime 的 entries 渲染成 agent-ui 组件树。
 * 对应方案文档 docs/proposals/mock-script-engine.md 第 6 节。
 *
 * 渐进式播放：一个 assistant entry 里的多个 block 按各自 delayMs 依次显现（不是一次性全部渲染），
 * 对齐 TaskProgress "执行层要渐进式展示" 与 design.md 3.2 的过程可见原则。
 */

export interface ScriptPlayerProps {
  entries: RuntimeEntry[]
  onAdvance: (entryId: string, branchOn: 'onSubmit' | 'onSkip' | 'onConfirm' | 'onReset', values?: Record<string, string>) => void
  onOpenArtifact?: (artifact: { id: string; type: string; fileName: string; meta: string }) => void
  onSelectFollowUp?: (suggestion: string) => void
  className?: string
}

export function ScriptPlayer({ entries, onAdvance, onOpenArtifact, onSelectFollowUp, className }: ScriptPlayerProps) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {entries.map((entry) =>
        entry.role === 'user' ? (
          <MessageBubble key={entry.id} role="user" content={entry.content} />
        ) : (
          <AssistantEntryView
            key={entry.id}
            entry={entry}
            onAdvance={onAdvance}
            onOpenArtifact={onOpenArtifact}
            onSelectFollowUp={onSelectFollowUp}
          />
        ),
      )}
    </div>
  )
}

function AssistantEntryView({
  entry,
  onAdvance,
  onOpenArtifact,
  onSelectFollowUp,
}: {
  entry: AssistantEntry
  onAdvance: ScriptPlayerProps['onAdvance']
  onOpenArtifact: ScriptPlayerProps['onOpenArtifact']
  onSelectFollowUp: ScriptPlayerProps['onSelectFollowUp']
}) {
  const visibleCount = useProgressiveReveal(entry.blocks)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {entry.blocks.slice(0, visibleCount).map((block, i) => (
        <BlockView
          key={i}
          block={block}
          entryId={entry.id}
          onAdvance={onAdvance}
          onOpenArtifact={onOpenArtifact}
          onSelectFollowUp={onSelectFollowUp}
        />
      ))}
    </div>
  )
}

/** 按 block.delayMs 依次揭示 block，返回当前应展示的 block 数量。 */
function useProgressiveReveal(blocks: ScriptBlock[]): number {
  const [visibleCount, setVisibleCount] = React.useState(blocks.length > 0 ? 1 : 0)

  React.useEffect(() => {
    setVisibleCount(blocks.length > 0 ? 1 : 0)
    if (blocks.length <= 1) return

    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 1; i < blocks.length; i++) {
      const delay = blocks[i].delayMs ?? 0
      timers.push(
        setTimeout(() => {
          setVisibleCount((v) => Math.max(v, i + 1))
        }, delay),
      )
    }
    return () => timers.forEach(clearTimeout)
    // blocks 引用在每次 entry 生成时都是新对象，用 length 做浅层依赖足够触发重新调度。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks.length])

  return visibleCount
}

function BlockView({
  block,
  entryId,
  onAdvance,
  onOpenArtifact,
  onSelectFollowUp,
}: {
  block: ScriptBlock
  entryId: string
  onAdvance: ScriptPlayerProps['onAdvance']
  onOpenArtifact: ScriptPlayerProps['onOpenArtifact']
  onSelectFollowUp: ScriptPlayerProps['onSelectFollowUp']
}) {
  switch (block.type) {
    case 'markdown':
      return <MessageBubble role="assistant" content={block.content} />

    case 'taskProgress':
      return (
        <TaskProgress
          status={block.status}
          elapsedMs={block.elapsedMs}
          tasks={block.tasks}
          steps={block.steps}
        />
      )

    case 'clarifyCard':
      return (
        <ClarifyCard
          title={block.title}
          fields={block.fields}
          onSubmit={(values) => onAdvance(entryId, 'onSubmit', values)}
          onSkip={() => onAdvance(entryId, 'onSkip')}
        />
      )

    case 'confirmCard':
      return (
        <ConfirmCard
          riskLevel={block.riskLevel}
          question={block.question}
          fields={block.fields}
          onConfirm={() => onAdvance(entryId, 'onConfirm')}
          onSkip={() => onAdvance(entryId, 'onSkip')}
        />
      )

    case 'artifactCard':
      return <ArtifactCard artifact={block.artifact} onOpen={() => onOpenArtifact?.(block.artifact)} />

    case 'errorState':
      return (
        <ErrorState
          scenario={block.scenario}
          message={block.message}
          recoveryActions={block.recoveryActions}
          onAction={() => {}}
          technicalDetail={block.technicalDetail}
          completedSteps={block.completedSteps}
          failedSteps={block.failedSteps}
        />
      )

    case 'followUp':
      return (
        <FollowUpSuggestions suggestions={block.suggestions} onSelect={(s) => onSelectFollowUp?.(s)} />
      )

    default:
      return null
  }
}
