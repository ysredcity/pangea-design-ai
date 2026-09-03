import type { ConversationScene } from './types'

/** 富场景机检结果；问题仅警告，不阻断示例预览。 */
export interface ParseIssue {
  sceneId: string
  turnId?: string
  message: string
}

export interface ParseResult<TTarget> {
  scenes: ConversationScene<TTarget>[]
  issues: ParseIssue[]
}

const HIGH_RISK_FIELD_KEYS = new Set(['object', 'action', 'impact-scope', 'consequence', 'operator'])

function productBlockHasHighRiskConfirmation(block: unknown): boolean {
  if (!block || typeof block !== 'object' || !('type' in block) || block.type !== 'confirm-card' || !('data' in block)) return false
  const data = block.data
  return Boolean(data && typeof data === 'object' && 'riskLevel' in data && data.riskLevel === 'high')
}

/** 校验已解析 TS 或 JSON 富场景，不耦合具体产品的产物 target 类型。 */
export function parseScript<TTarget>(scenes: readonly ConversationScene<TTarget>[]): ParseResult<TTarget> {
  const issues: ParseIssue[] = []
  const sceneIds = new Set<string>()

  for (const scene of scenes) {
    if (sceneIds.has(scene.id)) issues.push({ sceneId: scene.id, message: 'scene id 重复' })
    sceneIds.add(scene.id)

    const turnIds = new Set<string>()
    for (const turn of scene.turns) {
      const push = (message: string) => issues.push({ sceneId: scene.id, turnId: turn.id, message })
      if (turnIds.has(turn.id)) push('turn id 重复')
      turnIds.add(turn.id)
      if (!turn.execution.steps.length && !turn.execution.tasks?.length) push('execution 必须至少包含一个 L3 step 或一个 L2 task')
      if (turn.assistant?.clarification && turn.assistant.clarification.fields.length > 10) push('clarification 字段数超过 design.md 3.3 硬约束（≤10）')

      const suggestions = turn.productBlock?.type === 'follow-up-suggestions'
        ? (turn.productBlock.data as { suggestions?: unknown[] } | undefined)?.suggestions
        : undefined
      if (suggestions && (suggestions.length < 2 || suggestions.length > 4)) push('follow-up 推荐追问数量应为 2–4 个（design.md 3.7）')

      if (productBlockHasHighRiskConfirmation(turn.productBlock)) {
        const confirmData = turn.productBlock && turn.productBlock.type === 'confirm-card'
          ? turn.productBlock.data as { fields?: { key?: string }[] } | undefined
          : undefined
        const fields = confirmData?.fields ?? []
        const missing = [...HIGH_RISK_FIELD_KEYS].filter((key) => !fields.some((field) => field.key === key))
        if (missing.length) push(`高风险确认卡缺少字段：${missing.join('、')}`)
        if (!turn.awaitingApproval) push('高风险确认卡必须显式设置 awaitingApproval')
        if (!turn.approvalOutcomes?.approved || !turn.approvalOutcomes.rejected) push('高风险确认卡必须提供 approved 与 rejected 的本地结果')
      }
    }
  }

  if (issues.length && typeof console !== 'undefined') {
    for (const issue of issues) console.warn(`[parseScript] ${issue.sceneId}${issue.turnId ? `/${issue.turnId}` : ''}: ${issue.message}`)
  }
  return { scenes: [...scenes], issues }
}
