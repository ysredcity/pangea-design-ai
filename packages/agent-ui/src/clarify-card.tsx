import * as React from 'react'

import { Button } from './ui/button'
import { cn } from './lib/utils'

/**
 * 澄清卡片。对应设计文档：references/component-selection/clarify-card.md
 *
 * 硬约束（G5 机检）：无 Tabs/Menu 深层导航、无内部滚动、字段 ≤10、按钮 ≤3 且主按钮 ≤1、必须提供跳过入口。
 */

export interface ClarifyFieldOption {
  value: string
  label: string
}

export interface ClarifyField {
  key: string
  label: string
  options: ClarifyFieldOption[]
  /** 是否允许"其他"自由输入项（选择优于输入的例外口）。 */
  allowOther?: boolean
  required?: boolean
}

export interface ClarifyCardProps {
  title: string
  fields: ClarifyField[]
  onSubmit: (values: Record<string, string>) => void
  onSkip: () => void
  onReset?: () => void
  submitLabel?: string
  className?: string
}

export function ClarifyCard({
  title,
  fields,
  onSubmit,
  onSkip,
  onReset,
  submitLabel = '提交',
  className,
}: ClarifyCardProps) {
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [otherText, setOtherText] = React.useState<Record<string, string>>({})
  const [submitted, setSubmitted] = React.useState(false)

  if (fields.length > 10) {
    // 开发期提示，不面向用户展示
    console.warn('[ClarifyCard] 字段数超过 10 个，违反 design.md 3.3 硬约束')
  }

  function handleSelect(fieldKey: string, value: string) {
    setValues((prev) => ({ ...prev, [fieldKey]: value }))
  }

  function handleSubmit() {
    const resolved: Record<string, string> = {}
    for (const field of fields) {
      const v = values[field.key]
      resolved[field.key] = v === '__other__' ? otherText[field.key] ?? '' : v ?? ''
    }
    setSubmitted(true)
    onSubmit(resolved)
  }

  const requiredMissing = fields.some((f) => f.required && !values[f.key])

  return (
    <div
      className={cn(
        'flex w-full max-w-[420px] flex-col gap-3 rounded-2xl border border-border bg-card p-4',
        className,
      )}
    >
      <span className="text-sm font-medium text-foreground">{title}</span>

      <div className="flex flex-col gap-3">
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">
              {field.label}
              {field.required ? <span className="text-destructive"> *</span> : null}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {field.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={submitted}
                  aria-pressed={values[field.key] === opt.value}
                  onClick={() => handleSelect(field.key, opt.value)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-60',
                    values[field.key] === opt.value
                      ? 'border-primary bg-primary-bg text-primary'
                      : 'border-border bg-background text-foreground hover:bg-accent',
                  )}
                >
                  {opt.label}
                </button>
              ))}
              {field.allowOther ? (
                <button
                  type="button"
                  disabled={submitted}
                  aria-pressed={values[field.key] === '__other__'}
                  onClick={() => handleSelect(field.key, '__other__')}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-60',
                    values[field.key] === '__other__'
                      ? 'border-primary bg-primary-bg text-primary'
                      : 'border-border bg-background text-foreground hover:bg-accent',
                  )}
                >
                  其他
                </button>
              ) : null}
            </div>
            {field.allowOther && values[field.key] === '__other__' ? (
              <input
                type="text"
                disabled={submitted}
                value={otherText[field.key] ?? ''}
                onChange={(e) => setOtherText((prev) => ({ ...prev, [field.key]: e.target.value }))}
                placeholder="请输入"
                className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* 按钮 ≤3，主按钮 ≤1 */}
      <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
        {onReset ? (
          <Button variant="ghost" size="sm" disabled={submitted} onClick={onReset}>
            重置
          </Button>
        ) : null}
        <Button variant="outline" size="sm" disabled={submitted} onClick={onSkip}>
          跳过
        </Button>
        <Button size="sm" disabled={submitted || requiredMissing} onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
