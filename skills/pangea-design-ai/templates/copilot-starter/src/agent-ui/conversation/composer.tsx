import { ArrowUp } from 'lucide-react'
import { useState } from 'react'

export type ComposerProps = {
  defaultValue?: string
  onSend: (value: string) => void
  onValueChange?: (value: string) => void
  placeholder?: string
  value?: string
}

export function Composer({ defaultValue = '', onSend, onValueChange, placeholder = '输入你的问题…', value }: ComposerProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const currentValue = value ?? uncontrolledValue
  const setValue = (next: string) => {
    if (value === undefined) setUncontrolledValue(next)
    onValueChange?.(next)
  }
  const submit = () => {
    const next = currentValue.trim()
    if (!next) return
    onSend(next)
    setValue('')
  }

  return (
    <div className="flex min-h-12 items-end gap-2 rounded-3xl border border-border bg-background p-2 shadow-sm">
      <textarea
        aria-label="消息内容"
        value={currentValue}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            submit()
          }
        }}
        placeholder={placeholder}
        className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] leading-6 outline-none placeholder:text-muted-foreground"
      />
      <button type="button" aria-label="发送消息" title="发送消息" disabled={!currentValue.trim()} onClick={submit} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground">
        <ArrowUp className="size-4" />
      </button>
    </div>
  )
}
