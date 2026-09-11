import { useState } from 'react'
import { ArrowUpRight, BarChart3 } from 'lucide-react'
import type { AppConfig } from '../immersive/contracts'
import type { ContextItem } from '../immersive/agent-layout/composer'
import { NewConversationPage } from '../immersive/agent-layout/new-conversation-page'
import { cn } from '../immersive/lib/utils'
import type { CopilotHomeReport, CopilotHomeReportTab } from './copilot-config'

export type CopilotHomePageProps = {
  config: Pick<AppConfig, 'experts' | 'welcome'> & {
    composerExpertOptions?: readonly string[]
    composerExpertVisualKeys?: Readonly<Record<string, AppConfig['experts'][number]['visualKey']>>
    showConnectorSelect?: boolean
    reports?: readonly CopilotHomeReport[]
    reportTabs?: readonly CopilotHomeReportTab[]
  }
  isNavigationDocked: boolean
  onOpenNavigation: () => void
  onStartConversation: (message: string, context: ContextItem[]) => void
  onSelectReport?: (report: CopilotHomeReport) => void
}

/**
 * Copilot 产品主页的首个内容区。
 * 当前完整复用 Agent 新对话页；后续主页模块应在此容器扩展，避免污染通用委托组件。
 */
export function CopilotHomePage({ config, isNavigationDocked, onOpenNavigation, onStartConversation, onSelectReport }: CopilotHomePageProps) {
  const [activeTab, setActiveTab] = useState(config.reportTabs?.[0]?.id ?? 'all')
  const reports = config.reports ?? []
  const tabs = config.reportTabs ?? [{ id: 'all', label: '全部推荐', reportIds: reports.map((report) => report.id) }]
  const selectedTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0]
  const visibleReports = selectedTab ? selectedTab.reportIds.map((id) => reports.find((report) => report.id === id)).filter((report): report is CopilotHomeReport => Boolean(report)) : reports
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background-desktop">
      <NewConversationPage
        config={config}
        isSidebarDocked={isNavigationDocked}
        onOpenSidebar={onOpenNavigation}
        onStartConversation={onStartConversation}
        compact
      />
      {reports.length > 0 ? <RecommendedReports tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} reports={visibleReports} onSelectReport={onSelectReport} /> : null}
    </section>
  )
}

function RecommendedReports({ tabs, activeTab, onTabChange, reports, onSelectReport }: { tabs: readonly CopilotHomeReportTab[]; activeTab: string; onTabChange: (id: string) => void; reports: readonly CopilotHomeReport[]; onSelectReport?: (report: CopilotHomeReport) => void }) {
  return <section className="mx-auto w-full max-w-5xl px-4 pb-10 pt-20 sm:px-6" aria-label="推荐报表">
    <div className="flex gap-6 overflow-x-auto border-b border-border" role="tablist" aria-label="推荐报表分类">
      {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => onTabChange(tab.id)} className={cn('relative shrink-0 pb-3 text-sm text-muted-foreground transition-colors', activeTab === tab.id && 'font-medium text-foreground after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-foreground')}>{tab.label}</button>)}
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => <button key={report.id} type="button" onClick={() => onSelectReport?.(report)} className="group flex min-h-44 flex-col rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-foreground/30 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-bg text-primary"><BarChart3 className="size-4" /></span><span className="truncate text-sm font-medium">{report.category}</span></div><ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" /></div>
        <h3 className="mt-4 line-clamp-2 text-base font-medium leading-6">{report.title}</h3><p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{report.description}</p>
        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-3">{report.metrics.slice(0, 3).map((metric) => <div key={metric.label} className="min-w-0"><p className="truncate text-xs text-muted-foreground">{metric.label}</p><p className="mt-1 truncate text-sm font-semibold tabular-nums">{metric.value}</p></div>)}</div>
      </button>)}
    </div>
  </section>
}
