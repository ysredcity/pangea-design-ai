import { ConfirmCard } from '@agent-ux/agent-ui/conversation'
import { ImmersiveAgentApp, type ImmersiveProductBlockRenderer } from '@agent-ux/agent-ui/immersive'
import type { ArtifactTarget } from '@agent-ux/agent-ui/conversation'
import type { ConversationScene } from '@agent-ux/agent-ui/script-engine'
import { toImmersiveScene } from '../lib/website-document'

type Props = { name: string; scene: ConversationScene<ArtifactTarget> }
export function ImmersivePreview({ name, scene }: Props) {
  const richScene = toImmersiveScene(scene)
  const renderer: ImmersiveProductBlockRenderer = (block, context) => {
    if (block.type !== 'confirm-card' || !block.data || typeof block.data !== 'object') return null
    return <ConfirmCard blockId={block.id} {...block.data as Omit<Parameters<typeof ConfirmCard>[0], 'blockId' | 'onAction'>} onAction={context.onProductBlockAction} />
  }
  return <section className="preview product-surface"><div className="preview-head"><span>沉浸式播放器 / package runtime</span><span>{scene.title ?? scene.id}</span></div><div className="preview-body"><ImmersiveAgentApp config={{ identity: { name, avatar: 'bot' }, navigation: [{ id: 'new-conversation', label: '新对话', visualKey: 'newConversation' }, { id: 'capability-hub', label: '智能体 · 技能 · 连接器', visualKey: 'capabilityHub' }, { id: 'scheduled-task', label: '定时任务', visualKey: 'scheduledTask' }, { id: 'file-library', label: '文件库', visualKey: 'fileLibrary' }], experts: [{ id: 'office', label: '日常办公专家', visualKey: 'office' }], welcome: { greeting: '有什么需要我协助？', expertIds: ['office'], recommendations: [], expertRecommendations: {} }, renderProductBlock: renderer }} scenes={[richScene]} initialConversations={[{ id: richScene.id, title: richScene.title ?? richScene.id, approvalStatus: richScene.turns.some((turn) => turn.awaitingApproval) ? 'pending' : undefined }]} createDraftScene={(content) => ({ id: `draft-${Date.now()}`, turns: [{ id: 'draft-turn', user: { content }, execution: { status: 'completed', summary: '本地演示草稿', steps: [] }, assistant: { content: '已创建本地演示草稿。', timestamp: '刚刚' } }] })} /></div></section>
}
