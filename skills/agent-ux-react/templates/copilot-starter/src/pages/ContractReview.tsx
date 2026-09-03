import { FileText, Folder } from 'lucide-react'
import { useState } from 'react'
import { CopilotApp, type CopilotConfig } from '@/agent-ui/copilot'
import { ConfirmCard, type ArtifactTarget, type ConfirmBlockPayload, type ProductBlockAction, type ProductBlockRenderer, type ConversationScene } from '@/agent-ui/conversation'

const config: CopilotConfig = { identity: { name: '合同审阅助手' }, title: 'AI 审阅', assistantMode: 'panel' }

const contractDecision = {
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
      { id: 'dismiss-revision', label: '暂不处理', decision: 'cancel', tone: 'secondary' },
    ],
  } satisfies ConfirmBlockPayload,
} as const

const scene: ConversationScene = {
  id: 'contract-review',
  turns: [{
    id: 'opening',
    user: { content: '请审阅当前供应商合作协议。' },
    execution: { status: 'completed', summary: '已完成合同风险扫描', steps: [{ id: 'scan', title: '识别违约金、保密与终止条款', status: 'completed' }] },
    assistant: { content: '发现第 3 条违约金比例明显偏高。已将审阅意见整理为可查看的交付物。', artifacts: [{ id: 'contract-risk-report', type: 'document', title: '合同风险审阅意见', description: '违约金条款与修订建议' }] },
    productBlocks: [contractDecision],
  }],
}

function isConfirmPayload(value: unknown): value is ConfirmBlockPayload {
  return typeof value === 'object' && value !== null
    && 'riskLevel' in value
    && (value.riskLevel === 'medium' || value.riskLevel === 'high')
    && 'question' in value
    && typeof value.question === 'string'
    && 'fields' in value
    && Array.isArray(value.fields)
    && 'actions' in value
    && Array.isArray(value.actions)
}

const renderProductBlock: ProductBlockRenderer = (block, context) => {
  if (block.type !== 'confirm-card' || !isConfirmPayload(block.payload)) return null
  return <ConfirmCard blockId={block.id} {...block.payload} onAction={context.onAction} />
}

function artifactForAction(action: ProductBlockAction): ArtifactTarget {
  const title = action.type === 'confirm-decision' && action.decision === 'confirm'
    ? '合同条款修订建议（本地演示）'
    : action.type === 'confirm-decision' && action.decision === 'skip'
      ? '合同风险提示（本地演示）'
      : '合同审阅决定已记录（本地演示）'
  return {
    id: `contract-review-${action.actionId}`,
    type: 'document',
    title,
    description: '仅更新本地审阅画布，不会写入或提交合同。',
    payload: { action },
  }
}

export function ContractReviewPage() {
  const [artifact, setArtifact] = useState<ArtifactTarget | null>(null)
  const workspace = <div className="flex h-full flex-col overflow-y-auto p-8"><article className="mx-auto w-full max-w-2xl space-y-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><FileText className="size-4" />供应商合作协议.docx</div><h1 className="text-xl font-semibold">供应商合作协议</h1>{artifact ? <section className="rounded-xl border border-border bg-card p-5"><h2 className="font-medium">{artifact.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{artifact.description ?? '第 3 条约定的违约金为合同总金额的 30%，高于通常风险承受范围。建议改为按实际损失计算，并设置合理上限。'}</p></section> : <p className="text-sm leading-7 text-muted-foreground">第一条 合作范围……<br />第二条 交付与验收……<br /><mark className="rounded bg-warning/20 px-1 text-foreground">第三条 违约金：任一方违约的，应向对方支付合同总金额 30% 的违约金。</mark><br />第四条 保密义务……</p>}</article></div>
  const resourcePanel = <div className="p-4"><div className="flex items-center gap-2 text-sm font-semibold"><Folder className="size-4" />合同文件</div><div className="mt-3 flex items-center gap-2 rounded-lg bg-sidebar-accent px-2.5 py-2 text-sm"><FileText className="size-4" />供应商合作协议.docx</div></div>
  return <CopilotApp config={config} scene={scene} resourcePanel={resourcePanel} workspace={workspace} routeArtifact={setArtifact} renderProductBlock={renderProductBlock} onProductBlockAction={(action) => setArtifact(artifactForAction(action))} />
}
