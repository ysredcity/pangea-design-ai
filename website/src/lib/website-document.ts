import { parseScript, resolveTargets, type ConversationScene, type JsonConversationScene } from '@agent-ux/agent-ui/script-engine'
import type { ArtifactTarget } from '@agent-ux/agent-ui/conversation'
import type { ImmersiveArtifactTarget, ImmersiveConversationScene } from '@agent-ux/agent-ui/immersive'

export type WebsiteDocument = { schemaVersion: '1.0'; app: { name: string; description: string; welcomeMessage: string }; targets: Record<string, ArtifactTarget>; scenes: JsonConversationScene[] }
export type ResolvedDocument = Omit<WebsiteDocument, 'scenes'> & { scenes: ConversationScene<ArtifactTarget>[]; issues: string[] }
export function resolveDocument(document: WebsiteDocument): ResolvedDocument { const scenes = resolveTargets(document.scenes, document.targets); const issues = parseScript(scenes).issues.map((issue) => `${issue.sceneId}${issue.turnId ? ` / ${issue.turnId}` : ''}：${issue.message}`); return { ...document, scenes, issues } }

/** Website-only boundary: neutral authored targets become rich panel/image routes. */
export function toImmersiveTarget(target: ArtifactTarget): ImmersiveArtifactTarget {
  if (target.type === 'image') return { type: 'image', title: target.title, fileName: target.title, src: target.href ?? '', alt: target.description }
  if (target.type === 'web') return { type: 'browser', title: target.title, url: target.href ?? 'about:blank', description: target.description, source: 'Website preview' }
  return { type: 'file-preview', title: target.title, fileName: target.title, content: target.description ?? '该交付物没有提供摘要。', fileType: target.type }
}

/** Total rich-scene adaptation: execution, attachments, clarification follow-ups, and approval outcomes share the same target route. */
export function toImmersiveScene(scene: ConversationScene<ArtifactTarget>): ImmersiveConversationScene {
  const mapAssistant = (assistant: NonNullable<typeof scene.turns[number]['assistant']>): any => ({ ...assistant, attachments: assistant.attachments?.map((attachment) => ({ ...attachment, target: toImmersiveTarget(attachment.target) })), clarification: assistant.clarification && { ...assistant.clarification, followUp: assistant.clarification.followUp && { ...assistant.clarification.followUp, execution: mapExecution(assistant.clarification.followUp.execution), assistant: mapAssistant(assistant.clarification.followUp.assistant) } } })
  const mapExecution = (execution: typeof scene.turns[number]['execution']) => ({ ...execution, steps: execution.steps.map((step) => ({ ...step, actions: step.actions?.map((action) => ({ ...action, target: action.target ? toImmersiveTarget(action.target) : undefined })) })), tasks: execution.tasks?.map((task) => ({ ...task, steps: task.steps.map((step) => ({ ...step, actions: step.actions?.map((action) => ({ ...action, target: action.target ? toImmersiveTarget(action.target) : undefined })) })) })) })
  return { id: scene.id, title: scene.title, turns: scene.turns.map((turn) => ({ ...turn, user: { ...turn.user, attachments: turn.user.attachments?.map((attachment) => ({ ...attachment, target: attachment.target ? toImmersiveTarget(attachment.target) : undefined })) }, execution: mapExecution(turn.execution), assistant: turn.assistant ? mapAssistant(turn.assistant) : undefined, approvalOutcomes: turn.approvalOutcomes && { approved: { ...turn.approvalOutcomes.approved, execution: mapExecution(turn.approvalOutcomes.approved.execution), assistant: mapAssistant(turn.approvalOutcomes.approved.assistant) }, rejected: { ...turn.approvalOutcomes.rejected, execution: mapExecution(turn.approvalOutcomes.rejected.execution), assistant: mapAssistant(turn.approvalOutcomes.rejected.assistant) } } })) as unknown as ImmersiveConversationScene['turns'] }
}
