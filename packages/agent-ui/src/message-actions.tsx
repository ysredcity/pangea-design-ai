import * as React from 'react'
import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  RotateCcw,
  Share2,
  Pencil,
  Send,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'

import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { cn } from './lib/utils'

/**
 * 消息操作栏。对应设计文档：references/component-selection/message-actions.md
 *
 * 高频操作直接展示，低频/扩展功能收纳至"更多"菜单。两类消息的操作按归属分别设计。
 */

export type ActionKey =
  | 'copy'
  | 'like'
  | 'dislike'
  | 'read-aloud'
  | 'regenerate'
  | 'share'
  | 'edit'
  | 'resend'
  | 'delete'

export interface MessageAction {
  key: ActionKey
  onTrigger: () => void
  /** 流式中等场景可禁用。 */
  disabled?: boolean
}

const ASSISTANT_ACTION_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  copy: { label: '复制', icon: Copy },
  like: { label: '点赞', icon: ThumbsUp },
  dislike: { label: '点踩', icon: ThumbsDown },
  'read-aloud': { label: '朗读', icon: Volume2 },
  regenerate: { label: '重新生成', icon: RotateCcw },
  share: { label: '分享', icon: Share2 },
}

const USER_ACTION_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  edit: { label: '编辑', icon: Pencil },
  resend: { label: '重新发送', icon: Send },
  copy: { label: '复制', icon: Copy },
  delete: { label: '删除', icon: Trash2 },
}

/** 高频操作直接展示的数量；其余收纳进"更多"菜单。 */
const PRIMARY_COUNT = 3

export function MessageActions({
  role,
  actions,
}: {
  role: 'user' | 'assistant'
  actions: MessageAction[]
}) {
  const meta = role === 'assistant' ? ASSISTANT_ACTION_META : USER_ACTION_META
  const primary = actions.slice(0, PRIMARY_COUNT)
  const overflow = actions.slice(PRIMARY_COUNT)

  return (
    <div className="flex items-center gap-0.5 text-muted-foreground">
      {primary.map((action) => {
        const info = meta[action.key]
        if (!info) return null
        const Icon = info.icon
        return (
          <Button
            key={action.key}
            variant="ghost"
            size="icon-xs"
            aria-label={info.label}
            title={info.label}
            disabled={action.disabled}
            onClick={action.onTrigger}
            className={cn('text-muted-foreground')}
          >
            <Icon className="size-3.5" />
          </Button>
        )
      })}

      {overflow.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs" aria-label="更多操作">
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {overflow.map((action) => {
              const info = meta[action.key]
              if (!info) return null
              const Icon = info.icon
              return (
                <DropdownMenuItem key={action.key} disabled={action.disabled} onSelect={action.onTrigger}>
                  <Icon className="mr-2 size-3.5" />
                  {info.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}
