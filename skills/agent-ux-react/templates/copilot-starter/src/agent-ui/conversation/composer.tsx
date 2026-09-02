import { Send } from 'lucide-react'
import { useState } from 'react'

export function Composer({ onSend, placeholder = '输入你的问题…' }: { onSend: (value: string) => void; placeholder?: string }) {
  const [value, setValue] = useState('')
  const submit = () => { const next = value.trim(); if (!next) return; onSend(next); setValue('') }
  return <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2">
    <textarea aria-label="消息内容" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }} placeholder={placeholder} className="min-h-10 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none" />
    <button type="button" aria-label="发送消息" onClick={submit} className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"><Send className="size-4" /></button>
  </div>
}
