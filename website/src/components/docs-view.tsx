import { ArrowUpRight } from 'lucide-react'
import { documentation } from '../data/documentation'

export function DocsView() {
  return <><p className="eyebrow">Agent UX React / Field Guide</p><h1>不是聊天界面，<br />是可交付的协作系统。</h1><p className="lede">这里把智能体产品的交互约束、组件边界和可运行的剧本数据集中在同一个可浏览入口。规范仍以仓库 Markdown 为唯一事实源。</p><hr className="rule"/><div className="grid">{documentation.map((item) => <article className="module" key={item.id}><span className="tag">{item.eyebrow}</span><h2>{item.title}</h2><p>{item.body}</p><a href={item.href} target="_blank" rel="noreferrer">查看规范 <ArrowUpRight className="inline size-3" /></a></article>)}</div></>
}
