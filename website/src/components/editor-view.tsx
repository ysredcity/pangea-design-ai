import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, RotateCcw, Upload } from 'lucide-react'
import type { WebsiteDocument } from '../lib/website-document'
import { resolveDocument } from '../lib/website-document'
import { downloadDocument } from '../lib/persistence'
import { ImmersivePreview } from './immersive-preview'

type Props = { document: WebsiteDocument; onChange: (value: WebsiteDocument) => void; onReset: () => void }

export function EditorView({ document, onChange, onReset }: Props) {
  const [raw, setRaw] = useState(() => JSON.stringify(document, null, 2))
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const resolved = useMemo(() => { try { return resolveDocument(document) } catch (cause) { return { scenes: [], issues: [cause instanceof Error ? cause.message : '无法解析目标引用'] } } }, [document])
  useEffect(() => setRaw(JSON.stringify(document, null, 2)), [document])
  const apply = () => { try { const value = JSON.parse(raw) as WebsiteDocument; resolveDocument(value); onChange(value); setError(null) } catch (cause) { setError(cause instanceof Error ? cause.message : 'JSON 格式无效') } }
  const importFile = async (file?: File) => { if (!file) return; try { const value = JSON.parse(await file.text()) as WebsiteDocument; resolveDocument(value); onChange(value); setError(null) } catch (cause) { setError(cause instanceof Error ? cause.message : '导入文件不符合剧本契约') } }
  const scene = resolved.scenes[0]
  return <><div className="view-head"><div><p className="eyebrow">Local scene editor</p><h1>修改数据，<br />立即看见约束。</h1></div><p className="lede">浏览器只保存本地草稿。导入/导出的是 JSON 数据，不会读取或修改真实脚手架文件。</p></div><hr className="rule"/><div className="editor-layout"><section className="controls"><label className="field">产品名称<input value={document.app.name} onChange={(event) => onChange({ ...document, app: { ...document.app, name: event.target.value } })}/></label><label className="field">场景 JSON<textarea value={raw} onChange={(event) => setRaw(event.target.value)} spellCheck="false"/></label><div className="actions"><button className="button" onClick={apply}>应用 JSON</button><button className="button secondary" onClick={() => downloadDocument(document)}><Download className="mr-1 inline size-4"/>导出</button><button className="button secondary" onClick={() => fileRef.current?.click()}><Upload className="mr-1 inline size-4"/>导入</button><button className="button danger" onClick={onReset}><RotateCcw className="mr-1 inline size-4"/>重置</button><input ref={fileRef} className="hidden" type="file" accept="application/json" onChange={(event) => importFile(event.target.files?.[0])}/></div>{error && <p className="notice error">{error}</p>}{resolved.issues.map((issue) => <p className="notice error" key={issue}>{issue}</p>)}</section><section>{scene ? <ImmersivePreview name={document.app.name} scene={scene}/> : <p className="notice error">没有可预览的有效场景。</p>}</section></div></>
}
