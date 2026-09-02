import { FileText, Folder } from 'lucide-react'
import { useState } from 'react'
import { CopilotApp, type CopilotConfig } from '@/agent-ui/copilot'
import type { ArtifactTarget, ConversationScene } from '@/agent-ui/conversation'

const config: CopilotConfig = { identity: { name: '合同审阅助手' }, title: 'AI 审阅', assistantMode: 'panel' }
const scene: ConversationScene = { id: 'contract-review', turns: [{ id: 'opening', user: { content: '请审阅当前供应商合作协议。' }, execution: { status: 'completed', summary: '已完成合同风险扫描', steps: [{ id: 'scan', title: '识别违约金、保密与终止条款', status: 'completed' }] }, assistant: { content: '发现第 3 条违约金比例明显偏高。已将审阅意见整理为可查看的交付物。', artifacts: [{ id: 'contract-risk-report', type: 'document', title: '合同风险审阅意见', description: '违约金条款与修订建议' }] } }] }

export function ContractReviewPage() {
  const [artifact, setArtifact] = useState<ArtifactTarget | null>(null)
  const workspace = <div className="flex h-full flex-col overflow-y-auto p-8"><article className="mx-auto w-full max-w-2xl space-y-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><FileText className="size-4" />供应商合作协议.docx</div><h1 className="text-xl font-semibold">供应商合作协议</h1>{artifact ? <section className="rounded-xl border border-border bg-card p-5"><h2 className="font-medium">{artifact.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">第 3 条约定的违约金为合同总金额的 30%，高于通常风险承受范围。建议改为按实际损失计算，并设置合理上限。</p></section> : <p className="text-sm leading-7 text-muted-foreground">第一条 合作范围……<br />第二条 交付与验收……<br /><mark className="rounded bg-warning/20 px-1 text-foreground">第三条 违约金：任一方违约的，应向对方支付合同总金额 30% 的违约金。</mark><br />第四条 保密义务……</p>}</article></div>
  const resourcePanel = <div className="p-4"><div className="flex items-center gap-2 text-sm font-semibold"><Folder className="size-4" />合同文件</div><div className="mt-3 flex items-center gap-2 rounded-lg bg-sidebar-accent px-2.5 py-2 text-sm"><FileText className="size-4" />供应商合作协议.docx</div></div>
  return <CopilotApp config={config} scene={scene} resourcePanel={resourcePanel} workspace={workspace} routeArtifact={setArtifact} />
}
