import { Bot, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MockConversation } from '@/mock/conversations'

/** 左侧对话管理菜单栏内容（沉浸式布局外壳的可选插槽）。管理入口/历史会话/新建对话。 */
export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
}: {
  conversations: MockConversation[]
  activeId?: string
  onSelect: (id: string) => void
  onNew: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Bot className="size-4" />
        </div>
        <span className="text-sm font-semibold text-sidebar-foreground">智能助手</span>
      </div>

      <div className="px-3">
        <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={onNew}>
          <Plus className="size-3.5" />
          新建对话
        </Button>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto px-2">
        <span className="px-2 text-xs text-sidebar-foreground/70">历史会话</span>
        <div className="mt-1 flex flex-col gap-0.5">
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                'flex flex-col rounded-lg px-2.5 py-2 text-left transition-colors',
                activeId === c.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60',
              )}
            >
              <span className="truncate text-sm">{c.title}</span>
              <span className="text-xs text-sidebar-foreground/60">{c.updatedAt}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
