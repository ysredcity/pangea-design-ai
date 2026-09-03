import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Composer, ConversationFlow, type ArtifactRouter, type ConversationScene, type ProductBlockActionHandler, type ProductBlockRenderer } from '../conversation'
import type { AssistantMode, CopilotConfig } from './copilot-config'

export function CopilotApp({ config, scene, resourcePanel, workspace, routeArtifact, renderProductBlock, onProductBlockAction }: { config: CopilotConfig; scene: ConversationScene; resourcePanel?: ReactNode; workspace: ReactNode; routeArtifact: ArtifactRouter; renderProductBlock?: ProductBlockRenderer; onProductBlockAction?: ProductBlockActionHandler }) {
  const [assistantOpen, setAssistantOpen] = useState(true)
  const [resourceOpen, setResourceOpen] = useState(true)
  const mode: AssistantMode = config.assistantMode ?? 'panel'
  const assistant = <div className="flex h-full flex-col"><div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4"><span className="text-sm font-medium">{config.title ?? 'AI 辅助'}</span><button type="button" aria-label="收起对话辅助区" onClick={() => setAssistantOpen(false)} className="rounded p-1 hover:bg-accent"><X className="size-4" /></button></div><div className="min-h-0 flex-1 overflow-y-auto px-4"><ConversationFlow scene={scene} identity={config.identity} openArtifact={routeArtifact} renderProductBlock={renderProductBlock} onProductBlockAction={onProductBlockAction} /></div><div className="border-t border-border p-3"><Composer onSend={() => undefined} placeholder="就当前工作区提问" /></div></div>
  const overlay = mode === 'floating' ? 'fixed bottom-6 right-6 z-20 h-[520px] w-[380px] rounded-2xl border shadow-2xl' : 'fixed right-0 top-0 z-20 h-dvh w-[420px] border-l shadow-xl'
  return <div className="flex h-dvh w-full overflow-hidden bg-background-desktop">
    {resourcePanel && resourceOpen ? <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:block">{resourcePanel}</aside> : null}
    <main className="relative min-w-0 flex-1 overflow-hidden">{resourcePanel ? <button type="button" aria-label={resourceOpen ? '收起资源区' : '展开资源区'} onClick={() => setResourceOpen((value) => !value)} className="absolute left-2 top-2 z-10 rounded p-2 hover:bg-accent">{resourceOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}</button> : null}{workspace}</main>
    {assistantOpen && mode === 'panel' ? <aside className="hidden w-[420px] min-w-[380px] border-l border-border bg-card md:block">{assistant}</aside> : null}
    {assistantOpen && mode !== 'panel' ? <aside className={`${overlay} bg-card`}>{assistant}</aside> : null}
    {!assistantOpen ? <button type="button" aria-label="展开 AI 辅助" onClick={() => setAssistantOpen(true)} className="fixed bottom-6 right-4 z-10 rounded-lg border border-border bg-card p-2 shadow-md"><PanelLeftOpen className="size-4 rotate-180" /></button> : null}
  </div>
}
