import * as React from 'react'
import { Bot } from 'lucide-react'

import { ImmersiveShell } from '@/components/layout/ImmersiveShell'
import { ConversationSidebar } from '@/components/layout/ConversationSidebar'
import { Composer, useScriptRuntime, ScriptPlayer, type ScriptDocument } from '@/components/agent-ui'
import { mockConversations, suggestedPrompts } from '@/mock/conversations'
import scenariosData from '@/mock/scenarios.json'

const scenarios = scenariosData as ScriptDocument

/**
 * 沉浸式 Agent 示例场景：合同审核助手。
 * 剧本数据来自 src/mock/scenarios.json，由通用剧本引擎（useScriptRuntime + ScriptPlayer）解释执行，
 * 演示：首屏引导、意图输入、澄清卡片(>2 项)、确认卡片(高风险)、任务过程、后续引导。
 * 对应方案文档：docs/proposals/mock-script-engine.md
 *
 * ⚠️ 本页面是"内容插槽"里的示例，不修改 ImmersiveShell 本身的三栏结构。
 * ⚠️ 剧本内容（对话话术、分支）改动请编辑 scenarios.json，不要在本文件里写死 if/else 分支。
 */
export function ConversationPage() {
  const [input, setInput] = React.useState('')
  const [panelOpen, setPanelOpen] = React.useState(false)
  const [panelTitle, setPanelTitle] = React.useState<string>()
  const { entries, send, advance, reset } = useScriptRuntime(scenarios)

  const hasStarted = entries.length > 0

  function handleSend() {
    if (!input.trim()) return
    send(input)
    setInput('')
  }

  return (
    <ImmersiveShell
      sidebar={
        <ConversationSidebar conversations={mockConversations} onSelect={() => {}} onNew={reset} />
      }
      panel={
        panelTitle ? (
          <div className="flex flex-col gap-2 text-sm text-foreground">
            <p className="text-muted-foreground">这里是「{panelTitle}」的完整内容/编辑区（demo 占位）。</p>
          </div>
        ) : null
      }
      panelOpen={panelOpen}
      panelTitle={panelTitle}
      onPanelClose={() => setPanelOpen(false)}
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {!hasStarted ? (
            <FirstScreenGuidance onPick={(p) => setInput(p)} />
          ) : (
            <div className="mx-auto flex max-w-[800px] flex-col gap-4 px-6 py-6">
              <ScriptPlayer
                entries={entries}
                onAdvance={advance}
                onOpenArtifact={(artifact) => {
                  setPanelTitle(artifact.fileName)
                  setPanelOpen(true)
                }}
                onSelectFollowUp={(s) => setInput(s)}
              />
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-[800px] px-6 pb-6">
          <Composer value={input} onChange={setInput} onSend={handleSend} />
        </div>
      </div>
    </ImmersiveShell>
  )
}

function FirstScreenGuidance({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex h-full max-w-[640px] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Bot className="size-6" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-lg font-semibold text-foreground">你好，我是合同审核助手</h1>
        <p className="text-sm text-muted-foreground">
          我可以帮你审核合同条款、起草协议、总结文档和整理报销记录。
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestedPrompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPick(p)}
            className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
