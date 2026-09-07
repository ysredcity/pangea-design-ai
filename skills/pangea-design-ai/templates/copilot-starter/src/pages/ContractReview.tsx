import { FileText, Folder } from 'lucide-react'
import { useState } from 'react'

import { CopilotApp, type CopilotConfig } from '@/agent-ui/copilot'
import type { ArtifactTarget, ConversationScene } from '@/agent-ui/immersive/contracts'
import { renderProductBlock } from '@/components/agent-layout/product-block-renderer'

const config: CopilotConfig = {
  identity: { name: '合同审阅助手' },
  title: 'AI 审阅',
  defaultAssistantView: 'sidebar',
}

const scene: ConversationScene = {
  id: 'contract-review',
  title: '供应商合作协议审阅',
  turns: [{
    id: 'opening',
    user: { content: '请审阅当前供应商合作协议。', timestamp: '09月06日 11:42' },
    execution: {
      status: 'completed',
      summary: '已完成合同风险扫描',
      duration: '18秒',
      steps: [{ id: 'scan', title: '识别违约金、保密与终止条款', status: 'completed' }],
    },
    assistant: {
      content: '发现第 3 条违约金比例明显偏高。已将审阅意见整理为可查看的交付物。',
      timestamp: '09月06日 11:43',
      attachments: [{
        id: 'contract-risk-report',
        name: '合同风险审阅意见.docx',
        size: 28672,
        target: {
          type: 'file-preview',
          title: '合同风险审阅意见',
          fileName: '合同风险审阅意见.docx',
          content: '第 3 条约定的违约金为合同总金额的 30%，高于通常风险承受范围。建议改为按实际损失计算，并设置合理上限。',
        },
      }],
    },
    productBlock: {
      id: 'contract-risk-decision',
      type: 'confirm-card',
      data: {
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
      },
    },
  }],
}

type CanvasArtifact = { title: string; description: string }

function artifactToCanvas(target: ArtifactTarget): CanvasArtifact {
  if (target.type === 'file-preview') return { title: target.title, description: target.content }
  if (target.type === 'browser') return { title: target.title, description: target.description ?? target.url }
  if (target.type === 'search-results') return { title: target.title, description: `共找到 ${target.results.length} 条结果。` }
  return { title: target.title, description: target.alt ?? target.fileName }
}

export function ContractReviewPage() {
  const [artifact, setArtifact] = useState<CanvasArtifact | null>(null)
  const workspace = <div className="flex h-full flex-col overflow-y-auto p-8"><article className="mx-auto w-full max-w-2xl space-y-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><FileText className="size-4" />供应商合作协议.docx</div><h1 className="text-xl font-semibold">供应商合作协议</h1>{artifact ? <section className="rounded-xl border border-border bg-card p-5"><h2 className="font-medium">{artifact.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{artifact.description}</p></section> : <p className="text-sm leading-7 text-muted-foreground">第一条 合作范围……<br />第二条 交付与验收……<br /><mark className="rounded bg-warning/20 px-1 text-foreground">第三条 违约金：任一方违约的，应向对方支付合同总金额 30% 的违约金。</mark><br />第四条 保密义务……</p>}</article></div>
  const resourcePanel = <div className="p-4"><div className="flex items-center gap-2 text-sm font-semibold"><Folder className="size-4" />合同文件</div><div className="mt-3 flex items-center gap-2 rounded-lg bg-sidebar-accent px-2.5 py-2 text-sm"><FileText className="size-4" />供应商合作协议.docx</div></div>
  return <CopilotApp config={config} scene={scene} resourcePanel={resourcePanel} workspace={workspace} routeArtifact={(target) => setArtifact(artifactToCanvas(target))} renderProductBlock={renderProductBlock} />
}
