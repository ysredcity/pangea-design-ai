import * as React from 'react'

import { matchTrigger } from './match'
import type { AssistantMessageData, ConversationScene, JsonConversationScene, JsonConversationTurnData } from './types'

export type TargetRegistry<TTarget> = Readonly<Record<string, TTarget>>

function resolveTarget<TTarget>(targetId: string, registry: TargetRegistry<TTarget>, path: string): TTarget {
  const target = registry[targetId]
  if (!target) throw new Error(`[resolveTargets] ${path} 引用了不存在的 targetId "${targetId}"`)
  return target
}

function resolveExecution<TTarget>(execution: JsonConversationTurnData['execution'], registry: TargetRegistry<TTarget>, path: string) {
  const resolveSteps = (steps: JsonConversationTurnData['execution']['steps'], stepsPath: string) => steps.map((step, stepIndex) => ({
    ...step,
    actions: step.actions?.map((action, actionIndex) => action.targetId
      ? {
          label: action.label,
          type: action.type,
          target: resolveTarget(action.targetId, registry, `${stepsPath}[${stepIndex}].actions[${actionIndex}]`),
        }
      : { label: action.label, type: action.type }),
  }))

  return {
    ...execution,
    steps: resolveSteps(execution.steps, `${path}.steps`),
    tasks: execution.tasks?.map((task, taskIndex) => ({ ...task, steps: resolveSteps(task.steps, `${path}.tasks[${taskIndex}].steps`) })),
  }
}

function resolveAssistant<TTarget>(assistant: NonNullable<JsonConversationTurnData['assistant']>, registry: TargetRegistry<TTarget>, path: string): AssistantMessageData<TTarget> {
  return {
    ...assistant,
    attachments: assistant.attachments?.map((attachment, index) => ({
      id: attachment.id,
      name: attachment.name,
      size: attachment.size,
      target: resolveTarget(attachment.targetId, registry, `${path}.attachments[${index}]`),
    })),
    clarification: assistant.clarification && {
      ...assistant.clarification,
      followUp: assistant.clarification.followUp && {
        ...assistant.clarification.followUp,
        execution: resolveExecution(assistant.clarification.followUp.execution, registry, `${path}.clarification.followUp.execution`),
        assistant: { ...resolveAssistant(assistant.clarification.followUp.assistant, registry, `${path}.clarification.followUp.assistant`), kind: 'question' },
      },
    },
  }
}

/**
 * 将 JSON 的 targetId 解析为产品自己的目标对象。
 * 该边界只接收注册表，不了解沉浸式 panel、Copilot 画布或具体 renderer。
 */
export function resolveTargets<TTarget>(scenes: readonly JsonConversationScene[], registry: TargetRegistry<TTarget>): ConversationScene<TTarget>[] {
  return scenes.map((scene) => ({
    ...scene,
    turns: scene.turns.map((turn, turnIndex) => ({
      ...turn,
      user: {
        ...turn.user,
        attachments: turn.user.attachments?.map((attachment, attachmentIndex) => attachment.targetId
          ? { id: attachment.id, name: attachment.name, size: attachment.size, target: resolveTarget(attachment.targetId, registry, `scene "${scene.id}".turns[${turnIndex}].user.attachments[${attachmentIndex}]`) }
          : { id: attachment.id, name: attachment.name, size: attachment.size }),
      },
      execution: resolveExecution(turn.execution, registry, `scene "${scene.id}".turns[${turnIndex}].execution`),
      assistant: turn.assistant && resolveAssistant(turn.assistant, registry, `scene "${scene.id}".turns[${turnIndex}].assistant`),
      approvalOutcomes: turn.approvalOutcomes && {
        approved: {
          execution: resolveExecution(turn.approvalOutcomes.approved.execution, registry, `scene "${scene.id}".turns[${turnIndex}].approvalOutcomes.approved.execution`),
          assistant: resolveAssistant(turn.approvalOutcomes.approved.assistant, registry, `scene "${scene.id}".turns[${turnIndex}].approvalOutcomes.approved.assistant`),
        },
        rejected: {
          execution: resolveExecution(turn.approvalOutcomes.rejected.execution, registry, `scene "${scene.id}".turns[${turnIndex}].approvalOutcomes.rejected.execution`),
          assistant: resolveAssistant(turn.approvalOutcomes.rejected.assistant, registry, `scene "${scene.id}".turns[${turnIndex}].approvalOutcomes.rejected.assistant`),
        },
      },
    })),
  }))
}

/** 场景选择运行时：UI 状态属于产品壳层，运行时只处理输入与预写场景匹配。 */
export function useScriptRuntime<TTarget>(scenes: readonly ConversationScene<TTarget>[]) {
  const [activeScene, setActiveScene] = React.useState<ConversationScene<TTarget> | null>(null)
  const send = React.useCallback((input: string) => {
    const matched = matchTrigger(input, scenes)
    setActiveScene(matched)
    return matched
  }, [scenes])
  const reset = React.useCallback(() => setActiveScene(null), [])
  return { activeScene, send, reset }
}
