import { ChevronDown, ChevronRight, FileText, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import type { AgentIdentity, ArtifactRouter, ConversationScene, ProductBlockRenderer } from './types'

export function ConversationFlow({ scene, identity, openArtifact, renderProductBlock }: { scene: ConversationScene; identity: AgentIdentity; openArtifact: ArtifactRouter; renderProductBlock?: ProductBlockRenderer }) {
  return <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 py-4">{scene.turns.map((turn, index) => <ConversationTurn key={turn.id} scene={scene} turnIndex={index} identity={identity} openArtifact={openArtifact} renderProductBlock={renderProductBlock} />)}</div>
}

function ConversationTurn({ scene, turnIndex, identity, openArtifact, renderProductBlock }: { scene: ConversationScene; turnIndex: number; identity: AgentIdentity; openArtifact: ArtifactRouter; renderProductBlock?: ProductBlockRenderer }) {
  const turn = scene.turns[turnIndex]
  const [open, setOpen] = useState(turn.execution?.status === 'running')
  return <section className="space-y-3">
    <div className="ml-auto max-w-[85%] rounded-xl bg-primary-bg px-4 py-3 text-[15px] leading-6 text-foreground">{turn.user.content}</div>
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[15px] font-medium"><span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs">{identity.name.slice(0, 1)}</span>{identity.name}</div>
      {turn.execution ? <div className="rounded-lg border border-border bg-card text-sm"><button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-2 px-3 py-2 text-left"><span className={turn.execution.status === 'running' ? 'text-primary' : 'text-success'}>{turn.execution.status === 'running' ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" /> : <ChevronRight className="size-4" />}</span><span className="flex-1">{turn.execution.summary}</span>{open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</button>{open && <ol className="space-y-2 border-t border-border px-3 py-2 text-muted-foreground">{turn.execution.steps?.map((step) => <li key={step.id}><p>{step.title}</p>{step.detail && <p className="text-xs">{step.detail}</p>}{step.actions?.map((action) => action.target ? <button key={action.id} type="button" className="mt-1 inline-flex text-xs text-primary hover:underline" onClick={() => openArtifact(action.target!)}>{action.label}</button> : <span key={action.id} className="mt-1 inline-flex text-xs">{action.label}</span>)}</li>)}</ol>}</div> : null}
      {turn.assistant ? <div className="space-y-2"><p className="text-[15px] leading-6 text-foreground">{turn.assistant.content}</p>{turn.assistant.artifacts?.map((artifact) => <button key={artifact.id} type="button" onClick={() => openArtifact(artifact)} className="flex w-full items-center gap-2 rounded-lg border border-border bg-card p-3 text-left text-sm hover:bg-accent"><FileText className="size-4 text-primary" /><span>{artifact.title}</span></button>)}</div> : null}
      {turn.productBlocks?.map((block) => renderProductBlock?.(block, { turnId: turn.id, isLatestTurn: turnIndex === scene.turns.length - 1, openArtifact }) ?? null)}
    </div>
  </section>
}
