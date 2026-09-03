import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import type {
  ConfirmBlockAction,
  ConfirmBlockPayload,
  ProductBlockActionHandler,
  ProductBlockActionStatus,
} from './types'

export type ConfirmCardProps = ConfirmBlockPayload & {
  blockId: string
  onAction: ProductBlockActionHandler
  actionStatus?: ProductBlockActionStatus
  className?: string
}

const requiredHighRiskFields = new Set(['object', 'action', 'impact-scope', 'consequence', 'operator'])
const isDevelopment = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false

function warn(message: string) {
  if (isDevelopment) console.warn(`[ConfirmCard] ${message}`)
}

export function ConfirmCard({ blockId, riskLevel, question, description, fields, actions, onAction, actionStatus, className }: ConfirmCardProps) {
  const [currentActionId, setCurrentActionId] = useState<string>()
  const visibleFields = fields.slice(0, 10)
  const visibleActions = actions.slice(0, 3)
  const missingHighRiskFields = riskLevel === 'high'
    ? [...requiredHighRiskFields].filter((key) => !fields.some((field) => field.key === key))
    : []
  const confirmationBlocked = missingHighRiskFields.length > 0
  const primaryCount = actions.filter((action) => action.tone === 'primary').length
  const descriptionContent: ReactNode = description === undefined
    ? riskLevel === 'high' ? '请核对以下高风险操作信息后再决定。' : '是否允许？'
    : description

  if (fields.length > 10) warn(`字段数超过 10 个，当前为 ${fields.length}。`)
  if (actions.length > 3) warn(`操作数超过 3 个，当前为 ${actions.length}。`)
  if (primaryCount > 1) warn(`primary 操作超过一个，当前为 ${primaryCount}。`)
  if (confirmationBlocked) warn(`高风险确认缺少字段：${missingHighRiskFields.join('、')}。确认路径已禁用。`)

  function dispatch(action: ConfirmBlockAction) {
    setCurrentActionId(action.actionId)
    onAction(action)
  }

  return (
    <section className={`w-full max-w-[40rem] rounded-[10px] border border-border bg-card px-3.5 py-3 text-sm ${className ?? ''}`} aria-label={`${riskLevel === 'high' ? '高风险' : '中风险'}确认`}>
      <div className="space-y-1">
        <p className="break-words text-[15px] font-medium leading-5 text-card-foreground">{question}</p>
        {descriptionContent !== null && <div className="leading-5 text-muted-foreground">{descriptionContent}</div>}
      </div>
      {visibleFields.length > 0 && (
        <dl className="mt-3 grid gap-1.5 border-t border-border pt-3 text-sm leading-5">
          {visibleFields.map((field) => <div key={field.key} className="grid grid-cols-[minmax(0,8rem)_1fr] gap-3"><dt className="text-muted-foreground">{field.label}</dt><dd className="break-words text-card-foreground">{field.value}</dd></div>)}
        </dl>
      )}
      {confirmationBlocked ? <p className="mt-3 text-sm leading-5 text-destructive">高风险操作信息不完整，暂不能确认。请补充对象、动作、影响范围、后果和操作人。</p> : null}
      <div className="mt-3 flex flex-wrap justify-end gap-2 max-[659px]:flex-nowrap max-[659px]:justify-stretch">
        {visibleActions.map((action, index) => {
          const primary = action.tone === 'primary' && index === visibleActions.findIndex((candidate) => candidate.tone === 'primary')
          const variant = action.tone === 'destructive' ? 'destructive' : primary ? 'default' : 'ghost'
          const disabled = action.decision === 'confirm' && confirmationBlocked
          return <Button key={action.id} type="button" variant={variant} size="default" disabled={disabled} onClick={() => dispatch({ type: 'confirm-decision', blockId, actionId: action.id, decision: action.decision })} className="max-[659px]:h-9 max-[659px]:flex-1 max-[659px]:px-2.5">{action.label}</Button>
        })}
      </div>
      {actionStatus && actionStatus.actionId === currentActionId ? <p role="status" aria-live="polite" className="mt-2 text-xs text-muted-foreground">{actionStatus.message}</p> : null}
    </section>
  )
}
