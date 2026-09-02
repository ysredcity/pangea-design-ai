import * as React from 'react'

import { CopilotShell } from '@/components/layout/CopilotShell'
import { ResourcePanel } from '@/components/layout/ResourcePanel'
import { Composer, MessageBubble, useScriptRuntime, ScriptPlayer, type ScriptDocument } from '@/components/agent-ui'
import scenariosData from '@/mock/scenarios.json'

const scenarios = scenariosData as ScriptDocument

const files = [
  { id: 'f1', name: '供应商合作协议.docx' },
  { id: 'f2', name: '保密协议模板.docx' },
]

/**
 * 助手式 Copilot 示例场景：合同审阅助手。
 * 主工作区承载合同正文（业务详情页/文档预览的占位），右侧对话辅助区承载 AI 逐句审阅建议。
 * 剧本数据来自 src/mock/scenarios.json，由通用剧本引擎（useScriptRuntime + ScriptPlayer）解释执行。
 * 对应方案文档：docs/proposals/mock-script-engine.md
 *
 * ⚠️ 本页面是"内容插槽"里的示例，不修改 CopilotShell 本身的三栏结构。
 * ⚠️ 剧本内容（对话话术、分支）改动请编辑 scenarios.json，不要在本文件里写死 if/else 分支。
 */
export function ContractReviewPage() {
  const [activeFile, setActiveFile] = React.useState('f1')
  const [input, setInput] = React.useState('')
  const { entries, send, advance } = useScriptRuntime(scenarios)

  function handleSend() {
    if (!input.trim()) return
    send(input)
    setInput('')
  }

  return (
    <CopilotShell
      resourcePanel={<ResourcePanel files={files} activeId={activeFile} onSelect={setActiveFile} />}
      assistantMode="panel"
      assistant={
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-3">
              {/* 固定开场白，不属于任何剧本场景，进入页面即展示 */}
              <MessageBubble
                role="assistant"
                content="我已扫描这份合同，发现第 3 条违约金比例明显偏高，是否需要我标注风险点？"
              />
              <ScriptPlayer entries={entries} onAdvance={advance} />
            </div>
          </div>
          <div className="border-t border-border p-3">
            <Composer value={input} onChange={setInput} onSend={handleSend} placeholder="就这份合同提问，或用 @ 引用条款" />
          </div>
        </div>
      }
    >
      {/* 中间主工作区：合同正文预览占位（真实场景接文档编辑器/查看器） */}
      <div className="flex h-full flex-col overflow-y-auto p-8">
        <div className="mx-auto flex max-w-[640px] flex-col gap-4">
          <h1 className="text-lg font-semibold text-foreground">供应商合作协议</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            第一条 合作范围……
            <br />
            第二条 交付与验收……
            <br />
            <mark className="rounded bg-warning/20 px-1 text-foreground">
              第三条 违约金：任一方违约的，应向对方支付合同总金额 30% 的违约金。
            </mark>
            <br />
            第四条 保密义务……
          </p>
        </div>
      </div>
    </CopilotShell>
  )
}
