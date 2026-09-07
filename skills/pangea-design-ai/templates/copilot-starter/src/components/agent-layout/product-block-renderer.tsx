import {
  ConfirmCard,
  ErrorState,
  FollowUpSuggestions,
  type ConfirmBlockPayload,
  type ErrorBlockPayload,
  type FollowUpSuggestionsPayload,
} from "@/agent-ui/conversation"

import type { ProductBlockRenderer } from "./conversation-flow"

const isDevelopment = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false

function warn(message: string) {
  if (isDevelopment) console.warn(`[ProductBlockRenderer] ${message}`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isConfirmPayload(value: unknown): value is ConfirmBlockPayload {
  return isRecord(value)
    && (value.riskLevel === "medium" || value.riskLevel === "high")
    && typeof value.question === "string"
    && Array.isArray(value.fields)
    && value.fields.every((field) => isRecord(field) && typeof field.key === "string" && typeof field.label === "string" && typeof field.value === "string")
    && Array.isArray(value.actions)
    && value.actions.every((action) => isRecord(action)
      && typeof action.id === "string"
      && typeof action.label === "string"
      && ["confirm", "cancel", "skip"].includes(String(action.decision))
      && ["primary", "secondary", "destructive"].includes(String(action.tone)))
}

function isErrorPayload(value: unknown): value is ErrorBlockPayload {
  return isRecord(value)
    && ["unavailable", "timeout", "failed", "partial", "no-permission", "unsupported", "unknown"].includes(String(value.scenario))
    && typeof value.fact === "string"
    && typeof value.impact === "string"
    && typeof value.nextStep === "string"
    && Array.isArray(value.recoveryActions)
    && value.recoveryActions.every((action) => isRecord(action)
      && typeof action.id === "string"
      && typeof action.label === "string"
      && ["retry", "cancel", "wait", "request-permission", "alternative"].includes(String(action.recovery))
      && ["primary", "secondary", "destructive"].includes(String(action.tone)))
}

function isFollowUpPayload(value: unknown): value is FollowUpSuggestionsPayload {
  return isRecord(value)
    && Array.isArray(value.suggestions)
    && value.suggestions.every((suggestion) => isRecord(suggestion)
      && typeof suggestion.id === "string"
      && typeof suggestion.label === "string"
      && typeof suggestion.content === "string")
}

/** 将 rich flow 的本地 `data` block 适配为 shared Base UI 卡片；不泄漏本地 panel/image 路由。 */
export const renderProductBlock: ProductBlockRenderer = (block, context) => {
  switch (block.type) {
    case "confirm-card":
      if (isConfirmPayload(block.data)) return <ConfirmCard blockId={block.id} {...block.data} onAction={context.onProductBlockAction} />
      break
    case "error-state":
      if (isErrorPayload(block.data)) return <ErrorState blockId={block.id} {...block.data} onAction={context.onProductBlockAction} />
      break
    case "follow-up-suggestions":
      if (isFollowUpPayload(block.data)) return <FollowUpSuggestions blockId={block.id} {...block.data} onAction={context.onProductBlockAction} />
      break
    default:
      warn(`未知产品块类型：${block.type}`)
      return null
  }

  warn(`产品块 ${block.id} 的 ${block.type} payload 无效。`)
  return null
}
