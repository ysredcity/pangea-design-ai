import { useState } from 'react'
import { Bot, PanelsTopLeft } from 'lucide-react'
import { defaultDocument } from '../data/default-document'
import { resolveDocument } from '../lib/website-document'
import { ImmersivePreview } from './immersive-preview'
import { CopilotPreview } from './copilot-preview'

type TemplateId = 'agent' | 'copilot'

const templates = [
  { id: 'agent' as const, label: '沉浸式 Agent', description: '用户表达目标，智能体组织过程、确认与交付物。', icon: Bot },
  { id: 'copilot' as const, label: '助手式 Copilot', description: '用户持续停留在既有工作面，AI 保持为上下文辅助区。', icon: PanelsTopLeft },
]

const agentDemoScene = resolveDocument(defaultDocument).scenes[0]

export function TemplateDemosView() {
  const [active, setActive] = useState<TemplateId>('agent')
  return <><div className="view-head"><div><p className="eyebrow">Template demos</p><h1>先体验形态，<br />再决定装配。</h1></div><p className="lede">这两个入口使用同一份共享对话基础能力，但分别遵守沉浸式与 Copilot 的工作区边界。</p></div><hr className="rule"/><div className="template-picker" role="tablist" aria-label="模板演示选择">{templates.map((template) => { const Icon = template.icon; const selected = active === template.id; return <button key={template.id} type="button" role="tab" aria-selected={selected} className={selected ? 'active' : ''} onClick={() => setActive(template.id)}><Icon className="size-5" /><span><strong>{template.label}</strong><small>{template.description}</small></span></button> })}</div><div className="template-stage">{active === 'agent' ? <ImmersivePreview name={defaultDocument.app.name} scene={agentDemoScene} /> : <CopilotPreview />}</div></>
}
