import { cn } from '@/lib/utils'

/**
 * 后续引导。对应设计文档：references/component-selection/follow-up-suggestions.md
 *
 * 规则：2-4 个推荐追问，内容基于上下文生成（非本组件职责，本组件只负责渲染）。
 * 渲染前的"是否展示"判断（用户已结束对话/负面情绪/任务失败/高风险刚完成）由上层完成，本组件不内置场景判断逻辑。
 */

export interface FollowUpSuggestionsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
  className?: string
}

export function FollowUpSuggestions({ suggestions, onSelect, className }: FollowUpSuggestionsProps) {
  if (suggestions.length < 2 || suggestions.length > 4) {
    console.warn('[FollowUpSuggestions] 推荐追问数量应为 2-4 个，当前为', suggestions.length)
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onSelect(s)}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {s}
        </button>
      ))}
    </div>
  )
}
