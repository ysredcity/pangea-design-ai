import { useState } from 'react'
import { FileText, Folder } from 'lucide-react'
import { CopilotApp, type CopilotConfig } from '@agent-ux/agent-ui/copilot'
import { ConfirmCard, type ArtifactTarget, type ConfirmBlockPayload, type ProductBlockAction, type ProductBlockRenderer, type ConversationScene } from '@agent-ux/agent-ui/conversation'

const config: CopilotConfig = { identity: { name: '合同审阅助手' }, title: 'AI 审阅', assistantMode: 'panel' }

const reviewDecision = {
  id: 'contract-risk-decision',
  type: 'confirm-card',
  payload: {
    riskLevel: 'medium',
    question: '是否将第 3 条违约金修订建议写入本地审阅意见？',
    fields: [
      { key: 'object', label: '审阅对象', value: '供应商合作协议第 3 条' },
      { key: 'action', label: '建议内容', value: '调整为实际损失并设置合理上限' },
      { key: 'impact-scope', label: '展示范围', value: '当前左侧审阅画布' },
    ],
    actions: [
      { id: 'open-revision', label: '查看修订建议', decision: 'confirm', tone: 'primary' },
      { id: 'keep-observation', label: '仅保留风险提示', decision: 'skip', tone: 'secondary' },
    ],
  } satisfies ConfirmBlockPayload,
} as const

const scene: ConversationScene = {
  id: 'website-contract-review',
  turns: [{
    id: 'opening',
    user: { content: '请审阅当前供应商合作协议。' },
    execution: { status: 'completed', summary: '已完成合同风险扫描', steps: [{ id: 'scan', title: '识别违约金、保密与终止条款', status: 'completed' }] },
    assistant: { content: '发现第 3 条违约金比例明显偏高。审阅意见已整理为可查看的交付物。', artifacts: [{ id: 'contract-risk-report', type: 'document', title: '合同风险审阅意见', description: '违约金条款与修订建议' }] },
    productBlocks: [reviewDecision],
  }],
}

const renderProductBlock: ProductBlockRenderer = (block, context) => {
  if (block.type !== 'confirm-card') return null
  return <ConfirmCard blockId={block.id} {...(block.payload as ConfirmBlockPayload)} onAction={context.onAction} />
}

function artifactForAction(action: ProductBlockAction): ArtifactTarget {
  return {
    id: `review-${action.actionId}`,
    type: 'document',
    title: action.type === 'confirm-decision' && action.decision === 'confirm' ? '合同条款修订建议（本地演示）' : '合同风险提示（本地演示）',
    description: '仅更新本地审阅画布，不会写入或提交合同。',
  }
}

export function CopilotPreview() {
  const [artifact, setArtifact] = useState<ArtifactTarget | null>(null)
  const workspace = <div className="copilot-workspace"><article><div className="copilot-file"><FileText className="size-4" />供应商合作协议.docx</div><h2>供应商合作协议</h2>{artifact ? <section className="copilot-artifact"><h3>{artifact.title}</h3><p>{artifact.description}</p></section> : <p>第一条 合作范围……<br />第二条 交付与验收……<br /><mark>第三条 违约金：任一方违约的，应向对方支付合同总金额 30% 的违约金。</mark><br />第四条 保密义务……</p>}</article></div>
  const resourcePanel = <div className="copilot-resource"><div><Folder className="size-4" />合同文件</div><p><FileText className="size-4" />供应商合作协议.docx</p></div>
  return <section className="copilot-preview" aria-label="助手式 Copilot 模板演示"><div className="preview-head"><span>助手式 Copilot / 共享工作区</span><span>合同审阅</span></div><div className="copilot-frame product-surface"><CopilotApp config={config} scene={scene} resourcePanel={resourcePanel} workspace={workspace} routeArtifact={setArtifact} renderProductBlock={renderProductBlock} onProductBlockAction={(action) => setArtifact(artifactForAction(action))} /></div></section>
}
