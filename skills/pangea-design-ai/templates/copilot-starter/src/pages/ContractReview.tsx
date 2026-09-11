import { BarChart3, FileDown, FileText, Folder, TrendingUp, Users } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { CopilotApp, type CopilotConfig } from '@/agent-ui/copilot'
import type { CopilotContentItem } from '@/agent-ui/copilot'
import type { ArtifactTarget, ConversationScene } from '@/agent-ui/immersive/contracts'
import { renderProductBlock } from '@/components/agent-layout/product-block-renderer'

type ReportDefinition = {
  id: string
  title: string
  category: string
  subtitle: string
  metrics: readonly { label: string; value: string; trend: string }[]
  chartTitle: string
  chartDescription: string
  bars: readonly { label: string; value: number }[]
}

const reports: readonly ReportDefinition[] = [
  { id: 'report-pinned', title: '集团精益人才认证分析', category: '精益人才', subtitle: '2026 年度 · 人力资源分析', metrics: [{ label: '认证人数', value: '1,284', trend: '较上月 +12.8%' }, { label: '通过率', value: '86.4%', trend: '较上月 +4.2%' }, { label: '平均得分', value: '82.7', trend: '较上月 +2.6' }], chartTitle: '各事业部认证通过率', chartDescription: '数据范围：2026 年 1 月—8 月', bars: [{ label: '海信日立', value: 94 }, { label: '海信家电', value: 89 }, { label: '海信视像', value: 84 }, { label: '海信营销', value: 78 }, { label: '海信厨卫', value: 73 }] },
  { id: 'doc-pinned', title: '计划订单数据质量监控平台', category: '供应链分析', subtitle: '订单质量 · 实时监控', metrics: [{ label: '订单总量', value: '28,642', trend: '较昨日 +8.6%' }, { label: '质量通过率', value: '97.8%', trend: '较昨日 +1.4%' }, { label: '异常订单', value: '632', trend: '较昨日 -12.1%' }], chartTitle: '订单质量趋势', chartDescription: '数据范围：近 30 天', bars: [{ label: '华东区域', value: 98 }, { label: '华南区域', value: 96 }, { label: '华北区域', value: 95 }, { label: '西南区域', value: 92 }, { label: '东北区域', value: 89 }] },
  { id: 'canvas-pinned', title: '海信集团共享品类通用化在用物料库', category: '物料管理', subtitle: '共享品类 · 物料效率', metrics: [{ label: '物料总数', value: '8,426', trend: '较上季 +6.2%' }, { label: '通用化率', value: '74.1%', trend: '较上季 +3.8%' }, { label: '节省成本', value: '¥2,840万', trend: '年度累计' }], chartTitle: '品类通用化率', chartDescription: '数据范围：2026 年 1 月—8 月', bars: [{ label: '结构件', value: 88 }, { label: '电子件', value: 81 }, { label: '包装件', value: 76 }, { label: '电机类', value: 69 }, { label: '辅料类', value: 62 }] },
  { id: 'report-recent', title: 'FSSC 财经共享中心运营报告', category: '财经共享', subtitle: '2026 年 8 月 · 运营概览', metrics: [{ label: '处理单据', value: '42,816', trend: '较上月 +15.2%' }, { label: '自动化率', value: '91.6%', trend: '较上月 +2.8%' }, { label: '满意度', value: '96.2%', trend: '较上月 +1.1%' }], chartTitle: '各中心处理效率', chartDescription: '数据范围：2026 年 8 月', bars: [{ label: '青岛中心', value: 96 }, { label: '佛山中心', value: 92 }, { label: '成都中心', value: 88 }, { label: '武汉中心', value: 84 }, { label: '南昌中心', value: 81 }] },
  { id: 'report-recent-2', title: '人数与效率挂钩通报', category: '组织效能', subtitle: '人效分析 · 月度通报', metrics: [{ label: '参与部门', value: '32', trend: '覆盖率 100%' }, { label: '人均产出', value: '¥186万', trend: '较上月 +5.4%' }, { label: '改善部门', value: '18', trend: '较上月 +3' }], chartTitle: '各部门人效指数', chartDescription: '数据范围：2026 年 1 月—8 月', bars: [{ label: '制造事业部', value: 91 }, { label: '家电事业部', value: 86 }, { label: '视像事业部', value: 82 }, { label: '营销中心', value: 77 }, { label: '职能中心', value: 71 }] },
  { id: 'doc-recent', title: '冰冷事业部供货模式明细', category: '供货分析', subtitle: '冰冷事业部 · 供货模式', metrics: [{ label: '供货门店', value: '1,936', trend: '较上月 +4.9%' }, { label: '直供占比', value: '68.5%', trend: '较上月 +6.3%' }, { label: '履约及时率', value: '94.8%', trend: '较上月 +2.1%' }], chartTitle: '区域供货及时率', chartDescription: '数据范围：2026 年 8 月', bars: [{ label: '华东区域', value: 97 }, { label: '华南区域', value: 95 }, { label: '华中区域', value: 93 }, { label: '西北区域', value: 89 }, { label: '东北区域', value: 86 }] },
]

const contentItems: readonly CopilotContentItem[] = reports.map((report, index) => ({ id: report.id, title: report.title, kind: 'report', group: index < 3 ? 'pinned' : 'recent' }))

const config: CopilotConfig = {
  identity: { name: 'SmartReport' },
  title: 'AI 审阅',
  showConnectorSelect: false,
  home: {
    experts: [
      { id: 'operations', label: '经营分析专家', visualKey: 'industry' },
      { id: 'finance', label: '财务分析专家', visualKey: 'office' },
      { id: 'efficiency', label: '人才效能专家', visualKey: 'data' },
      { id: 'supply', label: '供应链分析专家', visualKey: 'research' },
      { id: 'quality', label: '数据质量专家', visualKey: 'document' },
    ],
    welcome: {
      greeting: '👋 Hey！有什么需要我搞定的？',
      expertIds: ['operations', 'finance', 'efficiency', 'supply', 'quality'],
      recommendations: [
        { expertId: 'operations', prompt: '汇总本月核心经营指标并生成管理层简报' },
        { expertId: 'finance', prompt: '分析财经共享中心8月运营效率与异常变化' },
        { expertId: 'efficiency', prompt: '对比各部门人效表现并找出重点改善对象' },
        { expertId: 'supply', prompt: '分析冰冷事业部各区域履约表现和差异' },
        { expertId: 'quality', prompt: '检查计划订单数据质量并定位异常指标' },
        { expertId: 'operations', prompt: '从现有报表中识别值得持续关注的指标' },
      ],
      expertRecommendations: {
        operations: ['汇总本月核心经营指标并生成管理层简报', '对比各业务板块的目标完成情况', '从现有报表中识别值得持续关注的指标'],
        finance: ['分析财经共享中心8月运营效率与异常变化', '对比各共享中心的单据处理效率', '生成财经共享运营月报摘要'],
        efficiency: ['对比各部门人效表现并找出重点改善对象', '分析各事业部人才认证通过率', '生成组织效能分析报告'],
        supply: ['分析冰冷事业部各区域履约表现和差异', '找出物料通用化的优先改善品类', '总结供应链关键指标风险'],
        quality: ['检查计划订单数据质量并定位异常指标', '分析异常订单的区域分布', '生成订单质量监控摘要'],
      },
    },
    reports: [
      { id: 'report-recent', title: 'FSSC 财经共享中心运营报告', category: '财经共享', description: '查看共享中心处理效率、自动化率与满意度表现。', metrics: [{ label: '处理单据', value: '42,816' }, { label: '自动化率', value: '91.6%' }, { label: '满意度', value: '96.2%' }] },
      { id: 'report-pinned', title: '集团精益人才认证分析', category: '人才发展', description: '关注各事业部人才认证进度、通过率与能力表现。', metrics: [{ label: '认证人数', value: '1,284' }, { label: '通过率', value: '86.4%' }, { label: '平均得分', value: '82.7' }] },
      { id: 'report-recent-2', title: '人数与效率挂钩通报', category: '组织效能', description: '对比部门人效指数，识别效率差异与改善机会。', metrics: [{ label: '参与部门', value: '32' }, { label: '人均产出', value: '¥186万' }, { label: '改善部门', value: '18' }] },
      { id: 'doc-pinned', title: '计划订单数据质量监控平台', category: '供应链', description: '监控订单质量趋势、异常规模和区域质量表现。', metrics: [{ label: '订单总量', value: '28,642' }, { label: '通过率', value: '97.8%' }, { label: '异常订单', value: '632' }] },
      { id: 'canvas-pinned', title: '海信集团共享品类通用化在用物料库', category: '物料管理', description: '分析共享品类通用化水平和成本节省空间。', metrics: [{ label: '物料总数', value: '8,426' }, { label: '通用化率', value: '74.1%' }, { label: '节省成本', value: '¥2,840万' }] },
      { id: 'doc-recent', title: '冰冷事业部供货模式明细', category: '供货分析', description: '查看区域供货及时率、直供占比和履约表现。', metrics: [{ label: '供货门店', value: '1,936' }, { label: '直供占比', value: '68.5%' }, { label: '及时率', value: '94.8%' }] },
    ],
    reportTabs: [
      { id: 'recommended', label: '为你推荐', reportIds: ['report-recent', 'report-pinned', 'doc-pinned', 'report-recent-2', 'canvas-pinned', 'doc-recent'] },
      { id: 'operations', label: '经营分析', reportIds: ['report-recent', 'report-recent-2', 'doc-recent'] },
      { id: 'talent', label: '人才与效能', reportIds: ['report-pinned', 'report-recent-2'] },
      { id: 'supply', label: '供应链', reportIds: ['doc-pinned', 'canvas-pinned', 'doc-recent'] },
    ],
  },
  defaultAssistantView: 'sidebar',
  // 产品级固定收起入口：所有页面统一使用，不在运行时模式菜单中切换。
  collapsedMode: 'floating-button',
  navigation: {
    defaultSection: 'content',
    showSearch: true,
    globalItems: [
      { id: 'home', label: '主页', icon: 'home' },
      { id: 'reports', label: '报表中心', icon: 'report' },
      { id: 'dashboard', label: '战略驾驶舱', icon: 'dashboard' },
    ],
    contentItems,
  },
  welcome: {
    greeting: '👋 Hey\n有什么需要我搞定的？',
    recommendationPages: [
      [
        { id: 'review', label: '审阅当前合同', icon: 'file-search' },
        { id: 'summary', label: '总结合同要点', icon: 'list-checks' },
        { id: 'risk', label: '检查潜在风险', icon: 'scale' },
      ],
      [
        { id: 'clause', label: '定位关键条款', icon: 'file-search' },
        { id: 'compare', label: '对比合同版本', icon: 'list-checks' },
        { id: 'suggest', label: '给出修改建议', icon: 'scale' },
      ],
    ],
  },
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
  const [notice, setNotice] = useState<string | null>(null)
  const [selectedReportId, setSelectedReportId] = useState('report-pinned')
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0]
  const workspace = <ReportWorkspace report={selectedReport} notice={notice} artifact={artifact} onDownload={() => setNotice('明细下载已开始')} />
  const resourcePanel = <div className="p-4"><div className="flex items-center gap-2 text-sm font-semibold"><Folder className="size-4" />合同文件</div><div className="mt-3 flex items-center gap-2 rounded-lg bg-sidebar-accent px-2.5 py-2 text-sm"><FileText className="size-4" />供应商合作协议.docx</div></div>
  const pageConfig: CopilotConfig = { ...config, workspace: { breadcrumbs: [{ id: 'home', label: '报表中心' }, { id: 'category', label: selectedReport.category }, { id: 'current', label: selectedReport.title, current: true }], onShare: () => setNotice('分享链接已复制'), onPinnedChange: (pinned) => setNotice(pinned ? '报表已置顶' : '已取消置顶'), onExport: () => setNotice('报表导出任务已创建') } }
  return <CopilotApp config={pageConfig} scene={scene} resourcePanel={resourcePanel} workspace={workspace} onContentSelect={(item) => setSelectedReportId(item.id)} routeArtifact={(target) => setArtifact(artifactToCanvas(target))} renderProductBlock={renderProductBlock} />
}

function ReportWorkspace({ report, notice, artifact, onDownload }: { report: ReportDefinition; notice: string | null; artifact: CanvasArtifact | null; onDownload: () => void }) {
  return <div className="flex h-full flex-col overflow-y-auto bg-background p-4 sm:p-6"><article className="mx-auto w-full max-w-5xl space-y-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm text-muted-foreground">{report.subtitle}</p><h1 className="mt-1 text-xl font-semibold tracking-tight">{report.title}</h1></div><span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success-foreground">已更新 · 10 分钟前</span></div><section className="grid gap-3 sm:grid-cols-3">{report.metrics.map((metric, index) => <MetricCard key={metric.label} icon={index === 0 ? <Users /> : index === 1 ? <BarChart3 /> : <TrendingUp />} {...metric} />)}</section><section className="rounded-xl border border-border bg-card p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="font-medium">{report.chartTitle}</h2><p className="mt-1 text-sm text-muted-foreground">{report.chartDescription}</p></div><button type="button" onClick={onDownload} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm font-medium hover:bg-muted"><FileDown className="size-4" />下载明细</button></div><div className="mt-6 space-y-4" role="img" aria-label={`${report.chartTitle}横向柱状图`}>{report.bars.map((bar) => <ReportBar key={bar.label} {...bar} />)}</div></section>{notice ? <p role="status" className="rounded-lg bg-primary-bg px-3 py-2 text-sm text-foreground">{notice}</p> : null}{artifact ? <section className="rounded-xl border border-border bg-card p-5"><h2 className="font-medium">{artifact.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{artifact.description}</p></section> : null}</article></div>
}

function MetricCard({ icon, label, value, trend }: { icon: ReactNode; label: string; value: string; trend: string }) {
  return <div className="rounded-xl border border-border bg-card p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}<span>{label}</span></div><div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div><div className="mt-1 text-xs text-success-foreground">{trend}</div></div>
}

function ReportBar({ label, value }: { label: string; value: number }) {
  return <div className="grid grid-cols-[5rem_1fr_3rem] items-center gap-3 text-sm"><span className="truncate text-muted-foreground">{label}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} /></div><span className="text-right font-medium tabular-nums">{value}%</span></div>
}
