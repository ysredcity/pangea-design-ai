import * as React from 'react'
import { AlertCircle, Clock, XCircle, ShieldAlert, Ban, CircleHelp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * 异常状态。对应设计文档：references/component-selection/error-state.md
 *
 * 硬约束：必须说明"发生了什么/影响了什么/下一步怎么做"；不得在未完成时暗示已成功；
 * 涉及发送/发布/支付/删除的重试前须先确认上次执行结果（本组件只暴露 recoveryActions，
 * 具体的"确认上次结果"逻辑由上层在触发 retry 前完成）。
 */

export type ErrorScenario =
  | 'unavailable'
  | 'timeout'
  | 'failed'
  | 'partial'
  | 'no-permission'
  | 'unsupported'
  | 'unknown'

export type RecoveryAction = 'retry' | 'cancel' | 'wait' | 'request-permission' | 'alternative'

const SCENARIO_META: Record<
  ErrorScenario,
  { icon: React.ComponentType<{ className?: string }>; defaultMessage: string; tone: 'destructive' | 'warning' }
> = {
  unavailable: { icon: XCircle, defaultMessage: '服务暂时无法提供，建议稍后重试。', tone: 'destructive' },
  timeout: { icon: Clock, defaultMessage: '响应超时，你可以继续等待、取消或重试。', tone: 'warning' },
  failed: { icon: AlertCircle, defaultMessage: '执行失败，可重试或尝试替代方案。', tone: 'destructive' },
  partial: { icon: AlertCircle, defaultMessage: '任务只完成了一部分，可仅重试失败的步骤。', tone: 'warning' },
  'no-permission': { icon: ShieldAlert, defaultMessage: '缺少完成此操作所需的权限。', tone: 'warning' },
  unsupported: { icon: Ban, defaultMessage: '当前能力不支持此操作，可尝试替代方案。', tone: 'warning' },
  unknown: { icon: CircleHelp, defaultMessage: '无法确认执行结果，请核验后再操作。', tone: 'warning' },
}

const ACTION_LABEL: Record<RecoveryAction, string> = {
  retry: '重试',
  cancel: '取消',
  wait: '继续等待',
  'request-permission': '申请权限',
  alternative: '查看替代方案',
}

export interface ErrorStateProps {
  scenario: ErrorScenario
  message?: string
  recoveryActions: RecoveryAction[]
  onAction: (action: RecoveryAction) => void
  technicalDetail?: string
  completedSteps?: string[]
  failedSteps?: string[]
  className?: string
}

export function ErrorState({
  scenario,
  message,
  recoveryActions,
  onAction,
  technicalDetail,
  completedSteps,
  failedSteps,
  className,
}: ErrorStateProps) {
  const meta = SCENARIO_META[scenario]
  const Icon = meta.icon

  return (
    <div
      className={cn(
        'flex w-full max-w-[480px] flex-col gap-2.5 rounded-xl border px-3.5 py-3 text-sm',
        meta.tone === 'destructive' ? 'border-destructive/30 bg-destructive-bg' : 'border-warning/30 bg-warning/10',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className={cn('mt-0.5 size-4 shrink-0', meta.tone === 'destructive' ? 'text-destructive' : 'text-warning')} />
        <span className="text-foreground">{message ?? meta.defaultMessage}</span>
      </div>

      {scenario === 'partial' && (completedSteps?.length || failedSteps?.length) ? (
        <div className="flex flex-col gap-1 pl-6 text-xs text-muted-foreground">
          {completedSteps?.map((s) => (
            <span key={s}>✓ {s}（已完成）</span>
          ))}
          {failedSteps?.map((s) => (
            <span key={s}>✗ {s}（未完成）</span>
          ))}
        </div>
      ) : null}

      {recoveryActions.length > 0 ? (
        <div className="flex items-center gap-2 pl-6">
          {recoveryActions.map((action, i) => (
            <Button key={action} size="sm" variant={i === 0 ? 'default' : 'outline'} onClick={() => onAction(action)}>
              {ACTION_LABEL[action]}
            </Button>
          ))}
        </div>
      ) : null}

      {technicalDetail ? (
        <details className="pl-6 text-xs text-muted-foreground/70">
          <summary className="cursor-pointer select-none">技术详情</summary>
          <code className="mt-1 block whitespace-pre-wrap break-all">{technicalDetail}</code>
        </details>
      ) : null}
    </div>
  )
}
