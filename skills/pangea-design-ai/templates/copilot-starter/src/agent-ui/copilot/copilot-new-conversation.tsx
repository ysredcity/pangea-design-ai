import { FileSearch, ListChecks, RefreshCcw, Scale, type LucideIcon } from 'lucide-react'

import type { CopilotRecommendation, CopilotWelcome } from './copilot-config'
import { Composer } from '@/components/agent-layout/composer'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const iconByName: Record<CopilotRecommendation['icon'], LucideIcon> = {
  'file-search': FileSearch,
  'list-checks': ListChecks,
  scale: Scale,
}

const fallbackWelcome: CopilotWelcome = {
  greeting: '你好，有什么需要我协助的？',
  recommendationPages: [[
    { id: 'review', label: '审阅当前内容', icon: 'file-search' },
    { id: 'summary', label: '总结核心信息', icon: 'list-checks' },
  ]],
}

type CopilotNewConversationProps = {
  welcome?: CopilotWelcome
  onStartConversation: (message: string) => void
  page: number
  onChangePage: (page: number) => void
}

export function CopilotNewConversation({ welcome = fallbackWelcome, onStartConversation, page, onChangePage }: CopilotNewConversationProps) {
  const pages = welcome.recommendationPages.length > 0 ? welcome.recommendationPages : fallbackWelcome.recommendationPages
  const activePage = page % pages.length
  const recommendations = pages[activePage]
  const canRefresh = pages.length > 1

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 items-center overflow-y-auto px-4">
        <section className="mx-auto w-full max-w-[768px] py-12">
          <h1 className="whitespace-pre-line px-2 text-2xl font-semibold leading-8 tracking-normal">{welcome.greeting}</h1>
          <div className="mt-4 px-2">
            <p className="text-base leading-6 text-muted-foreground">猜你想做</p>
            <div className="mt-2 flex flex-col items-start gap-2" aria-live="polite">
              {recommendations.map((recommendation) => {
                const Icon = iconByName[recommendation.icon]
                return (
                  <Button
                    key={recommendation.id}
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => onStartConversation(recommendation.label)}
                    className="justify-start"
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    {recommendation.label}
                  </Button>
                )
              })}
            </div>
            {canRefresh ? (
              <Tooltip>
                <TooltipTrigger render={<button type="button" onClick={() => onChangePage((activePage + 1) % pages.length)} className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-[10px] px-2 text-sm font-medium leading-5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><RefreshCcw aria-hidden="true" className="size-4" />换一换</button>} />
                <TooltipContent side="bottom">切换推荐指令</TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        </section>
      </div>
      <footer className="shrink-0 px-4 pb-4 pt-3">
        <div className="mx-auto w-full max-w-[768px]">
          <Composer menuSide="below" onSend={(message) => onStartConversation(message)} />
        </div>
      </footer>
    </div>
  )
}
