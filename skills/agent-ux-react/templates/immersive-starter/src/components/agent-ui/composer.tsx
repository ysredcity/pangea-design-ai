import * as React from 'react'
import { ArrowUp, Loader2, Mic, Paperclip, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * 意图输入区 Composer。对应设计文档：references/component-selection/composer.md
 *
 * 提示词/上下文/能力三要素混合编辑。@ 呼出上下文选择器，/ 呼出能力选择器（本组件只暴露
 * onMention/onSlash 回调，具体的选择面板由业务侧实现并通过 contexts/capabilities props 回填）。
 */

export interface ContextItem {
  id: string
  label: string
  kind: 'temporary' | 'persistent'
}

export interface CapabilityItem {
  id: string
  label: string
}

export type AsyncComposerState = 'idle' | 'transcribing' | 'uploading' | 'parsing'

export interface ComposerProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  placeholder?: string
  contexts?: ContextItem[]
  onRemoveContext?: (id: string) => void
  capabilities?: CapabilityItem[]
  onRemoveCapability?: (id: string) => void
  onMention?: () => void
  onSlash?: () => void
  onAttach?: () => void
  onVoice?: () => void
  asyncState?: AsyncComposerState
  disabled?: boolean
  className?: string
}

const ASYNC_LABEL: Record<Exclude<AsyncComposerState, 'idle'>, string> = {
  transcribing: '正在转写语音…',
  uploading: '正在上传…',
  parsing: '正在解析上下文…',
}

export function Composer({
  value,
  onChange,
  onSend,
  placeholder = '输入你的问题，或用 @ 添加上下文、/ 选择能力',
  contexts = [],
  onRemoveContext,
  capabilities = [],
  onRemoveCapability,
  onMention,
  onSlash,
  onAttach,
  onVoice,
  asyncState = 'idle',
  disabled = false,
  className,
}: ComposerProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === '@') onMention?.()
    if (e.key === '/' && value.length === 0) onSlash?.()
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !disabled) onSend()
    }
  }

  const hasTags = contexts.length > 0 || capabilities.length > 0

  return (
    <div className={cn('flex w-full flex-col gap-2 rounded-2xl border border-input bg-card p-2.5', className)}>
      {/* 已选上下文/能力：发送前清晰呈现完整意图构成 */}
      {hasTags ? (
        <div className="flex flex-wrap gap-1.5 px-1">
          {contexts.map((ctx) => (
            <span
              key={ctx.id}
              className="flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {ctx.kind === 'persistent' ? '🧠 ' : '📎 '}
              {ctx.label}
              {onRemoveContext ? (
                <button
                  type="button"
                  aria-label={`移除上下文 ${ctx.label}`}
                  onClick={() => onRemoveContext(ctx.id)}
                  className="ml-0.5 rounded-full hover:bg-muted"
                >
                  <X className="size-3" />
                </button>
              ) : null}
            </span>
          ))}
          {capabilities.map((cap) => (
            <span
              key={cap.id}
              className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary-bg px-2 py-0.5 text-xs text-primary"
            >
              ⚡ {cap.label}
              {onRemoveCapability ? (
                <button
                  type="button"
                  aria-label={`移除能力 ${cap.label}`}
                  onClick={() => onRemoveCapability(cap.id)}
                  className="ml-0.5 rounded-full hover:bg-primary-bg/60"
                >
                  <X className="size-3" />
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || asyncState !== 'idle'}
        rows={1}
        className="max-h-40 min-h-9 w-full resize-none bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
      />

      {asyncState !== 'idle' ? (
        <span className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          {ASYNC_LABEL[asyncState]}
        </span>
      ) : null}

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="添加附件" onClick={onAttach}>
            <Paperclip className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="语音输入" onClick={onVoice}>
            <Mic className="size-4" />
          </Button>
        </div>
        <Button
          size="icon-sm"
          aria-label="发送"
          disabled={disabled || !value.trim() || asyncState !== 'idle'}
          onClick={onSend}
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </div>
  )
}
