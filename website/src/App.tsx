import { useEffect, useState } from 'react'
import { BookOpen, Boxes, MonitorPlay, PencilRuler } from 'lucide-react'
import { defaultDocument } from './data/default-document'
import { DocsView } from './components/docs-view'
import { EditorView } from './components/editor-view'
import { GalleryView } from './components/gallery-view'
import { TemplateDemosView } from './components/template-demos-view'
import { loadDocument, saveDocument } from './lib/persistence'
import type { WebsiteDocument } from './lib/website-document'

type View = 'docs' | 'templates' | 'gallery' | 'editor'

const navigation: { id: View; label: string; icon: typeof BookOpen }[] = [
  { id: 'docs', label: '规范导览', icon: BookOpen },
  { id: 'templates', label: '模板演示', icon: MonitorPlay },
  { id: 'gallery', label: '组件图谱', icon: Boxes },
  { id: 'editor', label: '剧本编辑器', icon: PencilRuler },
]

export function App() {
  const [view, setView] = useState<View>('docs')
  const [document, setDocument] = useState<WebsiteDocument>(() => loadDocument(defaultDocument))
  useEffect(() => saveDocument(document), [document])
  return <div className="site-shell"><aside className="rail"><div className="wordmark">Agent UX <strong>Field Guide</strong></div><nav className="nav" aria-label="主导航">{navigation.map((item) => { const Icon = item.icon; return <button key={item.id} aria-current={view === item.id ? 'page' : undefined} onClick={() => setView(item.id)}><Icon className="mr-2 inline size-4" />{item.label}</button> })}</nav><p className="rail-foot">纯静态展示与本地剧本试验场。真实产品能力仍由 TypeScript 脚手架和扩展点承载。</p></aside><main className="main">{view === 'docs' && <DocsView />}{view === 'templates' && <TemplateDemosView />}{view === 'gallery' && <GalleryView />}{view === 'editor' && <EditorView document={document} onChange={setDocument} onReset={() => setDocument(defaultDocument)} />}</main></div>
}
