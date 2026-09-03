import { useState } from 'react'
import { RecommendationList } from './recommendation-list'
import type {
  FollowUpSuggestionsPayload,
  ProductBlockActionHandler,
  ProductBlockActionStatus,
} from './types'

export type FollowUpSuggestionsProps = FollowUpSuggestionsPayload & {
  blockId: string
  onAction: ProductBlockActionHandler
  actionStatus?: ProductBlockActionStatus
  className?: string
}

const isDevelopment = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false

export function FollowUpSuggestions({ blockId, suggestions, onAction, actionStatus, className }: FollowUpSuggestionsProps) {
  const [currentActionId, setCurrentActionId] = useState<string>()
  const validCount = suggestions.length >= 2 && suggestions.length <= 4
  if (!validCount) {
    if (isDevelopment) console.warn(`[FollowUpSuggestions] 建议数量必须为 2–4 条，当前为 ${suggestions.length}。`)
    return null
  }

  return (
    <section className={className} aria-label="后续建议">
      <RecommendationList
        items={suggestions.map(({ id, content }) => ({ id, content }))}
        arrowDirection="down-left"
        onSelect={(suggestion) => {
          setCurrentActionId(suggestion.id)
          onAction({ type: 'follow-up-select', blockId, actionId: suggestion.id, suggestionId: suggestion.id, content: suggestion.content })
        }}
      />
      {actionStatus && actionStatus.actionId === currentActionId ? <p role="status" aria-live="polite" className="px-3 pt-2 text-xs text-muted-foreground">{actionStatus.message}</p> : null}
    </section>
  )
}
