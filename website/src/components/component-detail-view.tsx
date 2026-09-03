import { useState, type ReactNode } from 'react'
import { ArrowLeft, ExternalLink, FileText, LayoutPanelLeft, MessageSquareText } from 'lucide-react'
import { Composer, ConfirmCard, ConversationFlow, ErrorState, FollowUpSuggestions, type ConversationScene } from '@agent-ux/agent-ui/conversation'
import type { ComponentDocument } from '../data/documentation'

const previewScene: ConversationScene = {
  id: 'component-flow',
  turns: [{ id: 'turn-1', user: { content: '请整理本周经营异常。' }, execution: { status: 'completed', summary: '已完成指标比对', steps: [{ id: 'scan', title: '读取收入与费用指标', status: 'completed' }] }, assistant: { content: '已发现华东区域费用率异常，并整理为可查看的分析结论。', artifacts: [{ id: 'weekly-report', type: 'document', title: '经营异常摘要', description: '区域费用率与原因归因' }] } }],
}

/** 无法脱离宿主壳层独立运行的模板内部实现：只说明边界，不伪装为可运行 demo。 */
function TemplateOnlyNotice({ component }: { component: ComponentDocument }) {
  return <div className="template-only"><p className="eyebrow"><LayoutPanelLeft className="mr-2 inline size-4" />模板内部实现</p><p>该实现属于沉浸式模板壳层内部，无法脱离宿主状态独立渲染，因此站内不提供可运行预览。要查看真实运行形态，请启动模板工程：</p><code>cp -R skills/agent-ux-react/templates/immersive-starter my-app &amp;&amp; cd my-app &amp;&amp; npm install &amp;&amp; npm run dev</code><p>真实事实源：<code>{component.source}</code></p></div>
}

function ComponentPreview({ component, variant }: { component: ComponentDocument; variant: string }) {
  const [result, setResult] = useState('')
  let content: ReactNode
  switch (component.id) {
    case 'composer':
      content = <Composer placeholder={variant === '基础输入（仅提示词）' ? '输入你的问题…' : '输入问题；富上下文属于沉浸式模板'} onSend={(value) => setResult(`已捕获本地输入：“${value}”`)} />
      break
    case 'confirm-card':
      content = <ConfirmCard blockId="catalog-confirm" riskLevel={variant.includes('轻量') ? 'medium' : 'high'} question="允许将经营异常结论写入本地草稿吗？" fields={[{ key: 'object', label: '操作对象', value: '本周经营异常摘要' }, { key: 'action', label: '执行动作', value: '写入结论与归因建议' }, { key: 'impact-scope', label: '影响范围', value: '当前本地草稿' }, { key: 'consequence', label: '操作后果', value: '内容可继续编辑或放弃' }, { key: 'operator', label: '操作人', value: '智能助手（演示）' }]} actions={[{ id: 'cancel', label: '拒绝', decision: 'cancel', tone: 'secondary' }, { id: 'confirm', label: '允许', decision: 'confirm', tone: 'primary' }]} onAction={(action) => setResult(action.type === 'confirm-decision' ? `已记录“${action.decision}”决定；未写入真实内容。` : '')} />
      break
    case 'error-state':
      content = <ErrorState blockId="catalog-error" scenario={variant === '响应超时' ? 'timeout' : variant === '部分完成' ? 'partial' : 'failed'} fact="经营分析在读取华东数据时中断。" impact="本周结论缺少该区域的费用归因。" nextStep="检查数据源后再决定是否重试。" recoveryActions={[{ id: 'retry', label: '检查后重试', recovery: 'retry', tone: 'primary' }]} onAction={() => setResult('已记录恢复动作；此演示不会调用服务。')} />
      break
    case 'follow-up-suggestions':
      content = <FollowUpSuggestions blockId="catalog-follow-up" suggestions={[{ id: 'detail', label: '展开明细', content: '展开华东区域费用明细' }, { id: 'compare', label: '对比变化', content: '对比上周变化' }, { id: 'draft', label: '生成摘要', content: '生成管理层摘要' }]} onAction={() => setResult('已选择后续建议；对话不会离开当前演示。')} />
      break
    case 'conversation-flow':
      content = <div className="flow-preview"><ConversationFlow scene={previewScene} identity={{ name: '经营洞察助手' }} openArtifact={(artifact) => setResult(`已选择制品：“${artifact.title}”`)} /></div>
      break
    default:
      return <div className="component-preview"><div className="preview-head"><span>运行边界</span><span>模板工程内可见</span></div><div className="component-preview-body"><TemplateOnlyNotice component={component} /></div></div>
  }
  return <div className="component-preview"><div className="preview-head"><span>真实组件 · 形态展示</span><span>{variant}</span></div><div className="component-preview-body product-surface">{content}{result ? <p className="preview-result" role="status">{result}</p> : null}</div></div>
}

export function ComponentDetailView({ component, onBack }: { component: ComponentDocument; onBack: () => void }) {
  const [variant, setVariant] = useState(component.variants[0])
  return <section className="component-detail"><button type="button" className="back-link" onClick={onBack}><ArrowLeft className="size-4" />返回组件图谱</button><div className="detail-head"><div><div className="meta"><span>{component.layer}</span><span>·</span><span>{component.visibility === 'shared' ? '共享导出' : '模板职责'}</span></div><h2>{component.title}</h2><p>{component.summary}</p></div><a className="doc-link" href={component.docHref} target="_blank" rel="noreferrer"><FileText className="size-4" />阅读规范文档<ExternalLink className="size-3" /></a></div><div className="detail-layout"><div className="detail-content"><ComponentPreview component={component} variant={variant} /><div className="detail-section"><h3>适用边界</h3><div className="two-column"><div><strong>何时使用</strong><ul>{component.whenToUse.map((item) => <li key={item}>{item}</li>)}</ul></div><div><strong>何时不用</strong><ul>{component.whenNotToUse.map((item) => <li key={item}>{item}</li>)}</ul></div></div></div><div className="detail-section"><h3>组合与约束</h3><p><MessageSquareText className="inline size-4" /> 可组合：{component.composeWith.join('、')}</p><ul>{component.composeBoundary.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="detail-section"><h3>常见误区</h3><ul>{component.pitfalls.map((item) => <li key={item}>{item}</li>)}</ul></div></div><aside className="variant-panel"><p className="eyebrow">Variants</p><h3>选择形态</h3>{component.variants.map((item) => <button key={item} type="button" className={variant === item ? 'active' : ''} onClick={() => setVariant(item)}>{variant === item ? '当前 · ' : ''}{item}</button>)}<hr/><p className="eyebrow">Source</p><code>{component.source}</code><div className="tag-list">{component.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></aside></div></section>
}
