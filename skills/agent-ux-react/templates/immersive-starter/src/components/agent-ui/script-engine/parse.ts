import type { Scenario, ScriptBlock, ScriptDocument, ScriptNode } from './types'

/**
 * 剧本校验 + 归一化。
 * 对应方案文档 docs/proposals/mock-script-engine.md 第 2 节设计原则：
 * "剧本是 design.md 规则的实例，不是绕过规则的后门" —— 校验规则直接对齐质量门禁 G5/G6：
 *   - clarifyCard/confirmCard 字段数 ≤10
 *   - confirmCard riskLevel="high" 时必须给出对象/动作/影响范围/后果/操作人字段（用字段数量兜底校验，
 *     不做语义级"是否真的包含这五类信息"的校验——那超出机器可判断范围，交给人工评审）
 *   - followUp 推荐追问数量 2-4 个
 * 机检未过的剧本不阻断渲染（因为 mock 场景允许"先跑起来再修"），而是 console.warn 提示，
 * 与 ClarifyCard/ConfirmCard 组件本身的运行时兜底手法保持一致。
 */

export interface ParseIssue {
  scenarioId: string
  nodeId: string
  blockIndex: number
  message: string
}

export interface ParseResult {
  scenarios: Scenario[]
  fallback: ScriptDocument['fallback']
  issues: ParseIssue[]
}

function validateBlock(scenarioId: string, node: ScriptNode, block: ScriptBlock, blockIndex: number, issues: ParseIssue[]) {
  const push = (message: string) => issues.push({ scenarioId, nodeId: node.id, blockIndex, message })

  if (block.type === 'clarifyCard') {
    if (block.fields.length > 10) {
      push(`clarifyCard 字段数为 ${block.fields.length}，超过 design.md 3.3 硬约束（≤10）`)
    }
    if (!block.branches || block.branches.length === 0) {
      push('clarifyCard 未定义 branches，交互后无法跳转到下一节点（建议至少提供 onSubmit）')
    }
  }

  if (block.type === 'confirmCard') {
    if (block.fields && block.fields.length > 10) {
      push(`confirmCard 字段数为 ${block.fields.length}，超过 design.md 3.4 硬约束（≤10）`)
    }
    if (block.riskLevel === 'high' && (!block.fields || block.fields.length === 0)) {
      push('confirmCard riskLevel=high 但未提供 fields（应包含对象/动作/影响范围/后果/操作人），违反 design.md 3.4/4.1')
    }
    if (!block.branches || block.branches.length === 0) {
      push('confirmCard 未定义 branches，交互后无法跳转到下一节点（建议至少提供 onConfirm）')
    }
  }

  if (block.type === 'followUp') {
    if (block.suggestions.length < 2 || block.suggestions.length > 4) {
      push(`followUp 推荐追问数量为 ${block.suggestions.length}，应为 2-4 个（design.md 3.7）`)
    }
  }
}

/**
 * 解析并校验一份剧本文档。
 * 不抛异常——校验失败只记录 issue 并 console.warn，剧本仍会被返回供播放（与组件层 console.warn 的
 * 兜底哲学一致：mock 场景里"能跑起来但提示有问题"比"直接崩掉"更实用）。
 */
export function parseScript(doc: ScriptDocument): ParseResult {
  const issues: ParseIssue[] = []

  for (const scenario of doc.scenarios) {
    const nodeIds = new Set(scenario.nodes.map((n) => n.id))

    if (!nodeIds.has(scenario.entryNodeId)) {
      issues.push({
        scenarioId: scenario.id,
        nodeId: scenario.entryNodeId,
        blockIndex: -1,
        message: `entryNodeId "${scenario.entryNodeId}" 在 nodes 中不存在`,
      })
    }

    for (const node of scenario.nodes) {
      node.blocks.forEach((block, i) => {
        validateBlock(scenario.id, node, block, i, issues)

        if ((block.type === 'clarifyCard' || block.type === 'confirmCard') && block.branches) {
          for (const branch of block.branches) {
            if (!nodeIds.has(branch.goto)) {
              issues.push({
                scenarioId: scenario.id,
                nodeId: node.id,
                blockIndex: i,
                message: `分支 "${branch.on}" 的 goto 目标节点 "${branch.goto}" 在该 scenario 中不存在`,
              })
            }
          }
        }
      })
    }
  }

  if (doc.fallback && doc.fallback.pool.length === 0) {
    issues.push({ scenarioId: '(fallback)', nodeId: '(fallback)', blockIndex: -1, message: 'fallback.pool 为空数组' })
  }

  if (issues.length > 0 && typeof console !== 'undefined') {
    for (const issue of issues) {
      console.warn(`[parseScript] ${issue.scenarioId}/${issue.nodeId}#${issue.blockIndex}: ${issue.message}`)
    }
  }

  return { scenarios: doc.scenarios, fallback: doc.fallback, issues }
}
