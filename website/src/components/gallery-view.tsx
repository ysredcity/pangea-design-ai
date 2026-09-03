import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { componentCatalog, type ComponentDocument } from '../data/documentation'
import { ComponentDetailView } from './component-detail-view'

export function GalleryView() {
  const [selected, setSelected] = useState<ComponentDocument | null>(null)
  if (selected) return <ComponentDetailView component={selected} onBack={() => setSelected(null)} />
  return <><div className="view-head"><div><p className="eyebrow">Component atlas</p><h1>组件不是清单，<br />而是边界。</h1></div><p className="lede">选择一个组件，查看它的单独说明、可组合边界、形态切换与对应的规范文档。共享导出可在产品层组合；模板职责仅应在对应壳层内演进。</p></div><hr className="rule" /><div className="atlas-summary"><span>{componentCatalog.filter((component) => component.visibility === 'shared').length} 个共享组件</span><span>{componentCatalog.filter((component) => component.visibility === 'template').length} 个模板职责</span><span>{componentCatalog.length} 份可浏览说明</span></div><div className="component-grid">{componentCatalog.map((component) => <button type="button" className="component" key={component.id} onClick={() => setSelected(component)}><div><div className="meta"><span>{component.layer}</span><span>·</span><span>{component.visibility === 'shared' ? '共享导出' : '模板职责'}</span></div><h3>{component.title}</h3><p>{component.summary}</p></div><span className="tag">查看组件说明 <ArrowUpRight className="size-3" /></span></button>)}</div></>
}
