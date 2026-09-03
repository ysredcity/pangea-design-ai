import { useLayoutEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, IndentIncrease } from "lucide-react"

import { RecommendationList } from "../../conversation"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import type { AppConfig, WelcomeExpert } from "../contracts"
import { Composer, type ContextItem } from "./composer"
import { IconButton } from "./icon-button"
import { AgentAvatar } from "./resource-visuals"

type NewConversationPageProps = {
  config: Pick<AppConfig, "experts" | "welcome">
  isSidebarDocked: boolean
  onOpenSidebar: () => void
  onStartConversation: (message: string, context: ContextItem[]) => void
}

type SuggestionItem = { expert: WelcomeExpert; prompt: string }

export function NewConversationPage({ config, isSidebarDocked, onOpenSidebar, onStartConversation }: NewConversationPageProps) {
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null)
  const [recommendationMode, setRecommendationMode] = useState<"initial" | "expert" | "hidden">("initial")
  const [draft, setDraft] = useState("")
  const [page, setPage] = useState(0)
  const expertsById = new Map(config.experts.map((expert) => [expert.id, expert]))
  const featuredExperts = config.welcome.expertIds.flatMap((id) => {
    const expert = expertsById.get(id)
    return expert ? [expert] : []
  })
  const suggestions = config.welcome.recommendations.flatMap((recommendation) => {
    const expert = expertsById.get(recommendation.expertId)
    return expert ? [{ expert, prompt: recommendation.prompt }] : []
  })
  const suggestionPages = chunkSuggestions(suggestions, 3)
  const selectedExpertConfig = config.experts.find((expert) => expert.label === selectedExpert)

  const chooseExpert = (expert: WelcomeExpert) => {
    setSelectedExpert(expert.label)
    setRecommendationMode("expert")
    setPage(0)
  }

  const chooseSuggestion = (suggestion: SuggestionItem) => {
    setSelectedExpert(suggestion.expert.label)
    setRecommendationMode("hidden")
    setDraft(suggestion.prompt)
  }

  const handleExpertChange = (expert: string | null) => {
    setSelectedExpert(expert)
    setRecommendationMode(expert ? "expert" : "initial")
    if (!expert) setPage(0)
  }

  const expertSuggestions = selectedExpertConfig
    ? (config.welcome.expertRecommendations[selectedExpertConfig.id] ?? genericExpertSuggestions(selectedExpertConfig))
      .map((prompt) => ({ expert: selectedExpertConfig, prompt }))
    : []

  return (
    <>
      <header className="flex h-13 shrink-0 items-center px-4">
        {!isSidebarDocked && (
          <Tooltip>
            <TooltipTrigger render={<IconButton aria-label="展开导航" onClick={onOpenSidebar}><IndentIncrease /></IconButton>} />
            <TooltipContent side="right">展开导航</TooltipContent>
          </Tooltip>
        )}
      </header>
      <div className="flex min-h-0 flex-1 flex-col items-center overflow-hidden px-4">
        <div className="flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-3">
          <div className="w-full translate-y-[-4%]">
            <h1 className="text-center text-2xl font-medium leading-9 tracking-[-0.48px] md:text-3xl md:tracking-[-0.6px]">{config.welcome.greeting}</h1>
            <div className="mt-4"><Composer onSend={onStartConversation} draft={draft} onDraftChange={setDraft} selectedExpert={selectedExpert} onSelectedExpertChange={handleExpertChange} menuSide="below" /></div>
            {recommendationMode === "initial" && (
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {featuredExperts.map((expert) => (
                  <button key={expert.id} onClick={() => chooseExpert(expert)} className="flex h-9 items-center gap-1.5 rounded-full border bg-card px-3 text-sm font-medium transition-colors hover:bg-muted">
                    <AgentAvatar expertVisualKey={expert.visualKey} className="size-4 [&_svg]:size-2.5" />{expert.label.replace(/专家$/, "")}
                  </button>
                ))}
              </div>
            )}
            {recommendationMode === "initial" && <div className="group/recommendations relative mt-3">
              {page > 0 && <PageButton label="上一页" side="left" onClick={() => setPage((value) => value - 1)}><ChevronLeft /></PageButton>}
              <div className="overflow-hidden max-[660px]:overflow-x-auto">
                <div className="flex transition-transform duration-300 ease-out motion-reduce:transition-none max-[660px]:w-max max-[660px]:snap-x max-[660px]:transform-none max-[660px]:gap-3 max-[660px]:pb-1" style={{ transform: `translateX(-${page * 100}%)` }}>
                  {suggestionPages.map((items, pageIndex) => <div key={pageIndex} className="grid min-w-full grid-cols-3 gap-3 max-[660px]:contents">{items.map((suggestion) => <Suggestion key={suggestion.prompt} item={suggestion} onClick={() => chooseSuggestion(suggestion)} />)}</div>)}
                </div>
              </div>
              {page < suggestionPages.length - 1 && <PageButton label="下一页" side="right" onClick={() => setPage((value) => value + 1)}><ChevronRight /></PageButton>}
            </div>}
            {recommendationMode === "expert" && selectedExpertConfig && <ExpertSuggestionList suggestions={expertSuggestions} onSelect={(suggestion) => { setDraft(suggestion.prompt); setRecommendationMode("hidden") }} />}
          </div>
        </div>
      </div>
    </>
  )
}

function Suggestion({ item, onClick }: { item: SuggestionItem; onClick: () => void }) {
  const textRef = useRef<HTMLSpanElement>(null)
  const [truncated, setTruncated] = useState(false)
  useLayoutEffect(() => {
    const text = textRef.current
    if (!text) return
    const check = () => setTruncated(text.scrollHeight > text.clientHeight + 1)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(text)
    return () => observer.disconnect()
  }, [item.prompt])
  return <button onClick={onClick} className="h-[94px] min-w-0 snap-start overflow-hidden rounded-[10px] border bg-background p-4 text-left align-top transition-colors hover:bg-accent max-[659px]:min-w-56"><span className="block h-4 truncate text-xs leading-4 tracking-[0.12px] text-muted-foreground">{item.expert.label.replace(/专家$/, "")}</span><Tooltip><TooltipTrigger render={<span ref={textRef} className="mt-2 line-clamp-2 block h-10 text-sm leading-5">{item.prompt}</span>} />{truncated && <TooltipContent side="top" className="max-w-80 text-left leading-5">{item.prompt}</TooltipContent>}</Tooltip></button>
}

function ExpertSuggestionList({ suggestions, onSelect }: { suggestions: SuggestionItem[]; onSelect: (item: SuggestionItem) => void }) {
  return <RecommendationList className="mt-10" items={suggestions.map((item) => ({ id: item.prompt, content: item.prompt }))} arrowDirection="up-left" onSelect={(suggestion) => {
    const item = suggestions.find((candidate) => candidate.prompt === suggestion.id)
    if (item) onSelect(item)
  }} />
}

function genericExpertSuggestions(expert: WelcomeExpert): string[] {
  return ["帮我快速梳理当前问题并给出行动建议", "基于现有资料生成一份专业方案", "从专业视角检查内容并提出优化建议"].map((prompt) => `${expert.label}：${prompt}`)
}

function chunkSuggestions(items: SuggestionItem[], size: number): SuggestionItem[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size))
}

function PageButton({ label, side, onClick, children }: { label: string; side: "left" | "right"; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} onClick={onClick} className={`absolute ${side === "left" ? "-left-4" : "-right-4"} top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-foreground opacity-0 shadow-sm transition-[color,background-color,opacity] group-hover/recommendations:opacity-100 focus-visible:opacity-100 hover:border-foreground hover:bg-foreground hover:text-background max-[660px]:hidden [&_svg]:size-4`}>{children}</button>
}
