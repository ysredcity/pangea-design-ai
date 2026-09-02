import * as React from 'react'
import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * 确认卡片。对应设计文档：references/component-selection/confirm-card.md
 *
 * 硬约束：字段 ≤10 且直接可见（不靠悬停/点击触发）；按钮 ≤3 且主按钮 ≤1；不重复 AI 已用文字表达的信息。
 * 高风险场景（riskLevel="high"）：fields 必须包含对象/动作/影响范围/后果/操作人，且不得用自然语言确认代替本组件。
 */

export interface ConfirmField {
  label: string
  value: string
}

export interface ConfirmCardProps {
  riskLevel: 'medium' | 'high'
  /** 只问决策的问题文案，不重复上文已展示的信息。 */
  question: string
  /** 高风险时必填：对象/动作/影响范围/后果/操作人。 */
  fields?: ConfirmField[]
  onConfirm: () => void | Promise<void>
  onSkip: () => void
  confirmLabel?: string
  skipLabel?: string
  className?: string
}

export function ConfirmCard({
  riskLevel,
  question,
  fields,
  onConfirm,
  onSkip,
  confirmLabel = '确认',
  skipLabel = '跳过',
  className,
}: ConfirmCardProps) {
  const [state, setState] = React.useState<'idle' | 'confirming' | 'confirmed' | 'skipped'>('idle')

  if (riskLevel === 'high' && (!fields || fields.length === 0)) {
    console.warn('[ConfirmCard] 高风险确认缺少字段展示（对象/动作/影响范围/后果/操作人），违反 design.md 3.4/4.1')
  }
  if (fields && fields.length > 10) {
    console.warn('[ConfirmCard] 字段数超过 10 个，违反 design.md 3.4 硬约束')
  }

  async function handleConfirm() {
    setState('confirming')
    await onConfirm()
    setState('confirmed')
  }

  function handleSkip() {
    setState('skipped')
    onSkip()
  }

  return (
    <div
      className={cn(
        'flex w-full max-w-[420px] flex-col gap-3 rounded-2xl border bg-card p-4',
        riskLevel === 'high' ? 'border-warning/40' : 'border-border',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        {riskLevel === 'high' ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" /> : null}
        <span className="text-sm font-medium text-foreground">{question}</span>
      </div>

      {fields && fields.length > 0 ? (
        <dl className="grid grid-cols-1 gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs">
          {fields.map((field) => (
            <div key={field.label} className="flex justify-between gap-3">
              <dt className="shrink-0 text-muted-foreground">{field.label}</dt>
              <dd className="truncate text-right text-foreground">{field.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
        {state === 'confirmed' ? (
          <span className="text-xs text-success">已确认执行</span>
        ) : state === 'skipped' ? (
          <span className="text-xs text-muted-foreground">已跳过，结果已保留</span>
        ) : (
          <>
            <Button variant="outline" size="sm" disabled={state === 'confirming'} onClick={handleSkip}>
              {skipLabel}
            </Button>
            <Button
              size="sm"
              variant={riskLevel === 'high' ? 'destructive' : 'default'}
              disabled={state === 'confirming'}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
