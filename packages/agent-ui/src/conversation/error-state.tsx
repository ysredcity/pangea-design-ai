import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { AlertCircle, Ban, CircleHelp, Clock, ShieldAlert, XCircle } from 'lucide-react'
import { useState } from 'react'
import type {
  ErrorBlockPayload,
  ErrorRecoveryAction,
  ProductBlockActionHandler,
  ProductBlockActionStatus,
} from './types'

export type ErrorStateProps = ErrorBlockPayload & {
  blockId: string
  onAction: ProductBlockActionHandler
  actionStatus?: ProductBlockActionStatus
  className?: string
}

const scenarioPresentation = {
  unavailable: { icon: XCircle, label: '服务不可用', tone: 'destructive' },
  timeout: { icon: Clock, label: '响应超时', tone: 'warning' },
  failed: { icon: AlertCircle, label: '执行失败', tone: 'destructive' },
  partial: { icon: AlertCircle, label: '部分完成', tone: 'warning' },
  'no-permission': { icon: ShieldAlert, label: '权限不足', tone: 'warning' },
  unsupported: { icon: Ban, label: '暂不支持', tone: 'warning' },
  unknown: { icon: CircleHelp, label: '结果未知', tone: 'warning' },
} as const

export function ErrorState({ blockId, scenario, fact, impact, nextStep, recoveryActions, onAction, actionStatus, className }: ErrorStateProps) {
  const [currentActionId, setCurrentActionId] = useState<string>()
  const presentation = scenarioPresentation[scenario]
  const Icon = presentation.icon

  function dispatch(action: ErrorRecoveryAction) {
    setCurrentActionId(action.id)
    onAction({ type: 'error-recovery', blockId, actionId: action.id, recovery: action.recovery })
  }

  return (
    <section className={`flex w-full max-w-[30rem] flex-col gap-3 rounded-xl border p-4 text-sm ${presentation.tone === 'destructive' ? 'border-destructive/30 bg-destructive-bg' : 'border-warning/40 bg-card'} ${className ?? ''}`} aria-label={presentation.label}>
      <div className="flex items-start gap-2"><Icon className={`mt-0.5 size-5 shrink-0 ${presentation.tone === 'destructive' ? 'text-destructive' : 'text-warning'}`} aria-hidden="true" /><div><p className="font-medium text-foreground">{presentation.label}</p><p className="text-muted-foreground">{fact}</p></div></div>
      <dl className="grid gap-2 rounded-lg bg-background/60 p-3 text-xs"><div className="grid grid-cols-[4rem_1fr] gap-2"><dt className="text-muted-foreground">影响</dt><dd className="text-foreground">{impact}</dd></div><div className="grid grid-cols-[4rem_1fr] gap-2"><dt className="text-muted-foreground">下一步</dt><dd className="text-foreground">{nextStep}</dd></div></dl>
      {recoveryActions.length > 0 ? <div className="flex flex-wrap gap-2">{recoveryActions.map((action, index) => <ButtonPrimitive key={action.id} type="button" onClick={() => dispatch(action)} className={`inline-flex min-h-11 items-center justify-center rounded-lg border px-3 text-sm font-medium outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${action.tone === 'destructive' ? 'border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20' : action.tone === 'primary' && index === recoveryActions.findIndex((candidate) => candidate.tone === 'primary') ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/80' : 'border-border bg-background text-foreground hover:bg-muted'}`}>{action.label}</ButtonPrimitive>)}</div> : null}
      {actionStatus && actionStatus.actionId === currentActionId ? <p role="status" aria-live="polite" className="text-xs text-muted-foreground">{actionStatus.message}</p> : null}
    </section>
  )
}
