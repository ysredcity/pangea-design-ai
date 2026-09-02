import * as React from 'react'

import { interpolate } from './interpolate'
import { matchTrigger, pickFallback } from './match'
import type { MarkdownBlock, Scenario, ScriptBlock, ScriptBranchOn, ScriptDocument, ScriptNode } from './types'

/**
 * 剧本运行时——纯状态机逻辑，不涉及渲染。渲染由 <ScriptPlayer> 消费本 hook 的输出。
 * 对应方案文档 docs/proposals/mock-script-engine.md 第 6 节"引擎的落地形态"。
 */

export interface UserEntry {
  id: string
  role: 'user'
  content: string
}

export interface AssistantEntry {
  id: string
  role: 'assistant'
  /** fallback 命中时没有 scenarioId/nodeId，只有 isFallback。 */
  scenarioId?: string
  nodeId?: string
  isFallback?: boolean
  blocks: ScriptBlock[]
}

export type RuntimeEntry = UserEntry | AssistantEntry

interface RuntimeState {
  entries: RuntimeEntry[]
  /** 累积的已提交字段值，跨节点保留，用于 markdown 块的 {{fieldKey}} 插值。 */
  values: Record<string, string>
}

function interpolateBlock(block: ScriptBlock, values: Record<string, string>): ScriptBlock {
  if (block.type !== 'markdown') return block
  const interpolated: MarkdownBlock = { ...block, content: interpolate(block.content, values) }
  return interpolated
}

function findNode(scenario: Scenario, nodeId: string): ScriptNode | undefined {
  return scenario.nodes.find((n) => n.id === nodeId)
}

let idCounter = 0
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

export function useScriptRuntime(doc: ScriptDocument) {
  const [state, setState] = React.useState<RuntimeState>({ entries: [], values: {} })

  const scenarios = doc.scenarios

  /** 用户发送一条消息：命中 scenario 则进入其 entryNode，否则走 fallback。 */
  const send = React.useCallback(
    (input: string) => {
      const userEntry: UserEntry = { id: nextId('user'), role: 'user', content: input }

      const matched = matchTrigger(input, scenarios)

      setState((prev) => {
        if (!matched) {
          const fallbackContent = pickFallback(doc.fallback?.pool, input)
          const fallbackEntry: AssistantEntry = {
            id: nextId('assistant'),
            role: 'assistant',
            isFallback: true,
            blocks: [{ type: 'markdown', content: fallbackContent }],
          }
          return { ...prev, entries: [...prev.entries, userEntry, fallbackEntry] }
        }

        const entryNode = findNode(matched, matched.entryNodeId)
        if (!entryNode) {
          console.warn(`[useScriptRuntime] scenario "${matched.id}" 的 entryNodeId 无效，未渲染任何内容`)
          return { ...prev, entries: [...prev.entries, userEntry] }
        }

        const assistantEntry: AssistantEntry = {
          id: nextId('assistant'),
          role: 'assistant',
          scenarioId: matched.id,
          nodeId: entryNode.id,
          blocks: entryNode.blocks.map((b) => interpolateBlock(b, prev.values)),
        }
        return { ...prev, entries: [...prev.entries, userEntry, assistantEntry] }
      })
    },
    [scenarios, doc.fallback],
  )

  /**
   * 交互类块（clarifyCard/confirmCard）触发分支跳转。
   * entryId：触发分支的那条 assistant entry；branchOn：用户操作；submittedValues：仅 onSubmit 时携带。
   */
  const advance = React.useCallback(
    (entryId: string, branchOn: ScriptBranchOn, submittedValues?: Record<string, string>) => {
      setState((prev) => {
        const entry = prev.entries.find((e) => e.id === entryId)
        if (!entry || entry.role !== 'assistant' || !entry.scenarioId || !entry.nodeId) return prev

        const scenario = scenarios.find((s) => s.id === entry.scenarioId)
        if (!scenario) return prev

        const currentNode = findNode(scenario, entry.nodeId)
        const interactiveBlock = currentNode?.blocks.find(
          (b) => (b.type === 'clarifyCard' || b.type === 'confirmCard') && b.branches?.some((br) => br.on === branchOn),
        )
        const branch =
          interactiveBlock && (interactiveBlock.type === 'clarifyCard' || interactiveBlock.type === 'confirmCard')
            ? interactiveBlock.branches?.find((br) => br.on === branchOn)
            : undefined

        const nextValues = submittedValues ? { ...prev.values, ...submittedValues } : prev.values

        if (!branch) {
          // 没有对应分支：终止节点，只更新已提交的字段值，不追加新 entry。
          return { ...prev, values: nextValues }
        }

        const nextNode = findNode(scenario, branch.goto)
        if (!nextNode) {
          console.warn(`[useScriptRuntime] 分支目标节点 "${branch.goto}" 不存在于 scenario "${scenario.id}"`)
          return { ...prev, values: nextValues }
        }

        const nextEntry: AssistantEntry = {
          id: nextId('assistant'),
          role: 'assistant',
          scenarioId: scenario.id,
          nodeId: nextNode.id,
          blocks: nextNode.blocks.map((b) => interpolateBlock(b, nextValues)),
        }

        return { entries: [...prev.entries, nextEntry], values: nextValues }
      })
    },
    [scenarios],
  )

  const reset = React.useCallback(() => setState({ entries: [], values: {} }), [])

  return { entries: state.entries, values: state.values, send, advance, reset }
}
