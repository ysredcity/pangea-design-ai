/**
 * 独立面板的容器实现层：每种容器类型的操作栏与内容。
 * 注册表在 `panel-registry.ts`，示例数据在 `panel-data.ts`，框架壳层在 `artifact-panel.tsx`。
 */
import type { ReactNode } from "react"
import { ArrowLeft, Download, ExternalLink, FileText, Globe2, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { IconButton } from "./icon-button"
import { MarkdownContent } from "./markdown-content"
import type { PanelView, SearchResult } from "./panel-types"

/** 容器操作栏的一行外壳，统一高度与分割线 */
function ToolbarRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex h-12 shrink-0 items-center gap-2 border-b px-3", className)}>{children}</div>
}

/** 容器操作栏右侧的操作组，末尾统一带「更多操作」 */
function ToolbarActions({ children }: { children?: ReactNode }) {
  return <div className="flex shrink-0 items-center gap-1">{children}<IconButton aria-label="更多操作"><MoreHorizontal /></IconButton></div>
}

export function SearchResultsToolbar({ view }: { view: Extract<PanelView, { type: "search-results" }> }) {
  return <div className="shrink-0 border-b px-5 py-3"><p className="text-sm text-muted-foreground">找到 {view.results.length} 条相关结果</p></div>
}

export function SearchResultsBody({ onNavigate, view }: { onNavigate: (view: PanelView) => void; view: Extract<PanelView, { type: "search-results" }> }) {
  return <div className="min-h-0 flex-1 overflow-y-auto">
    {view.results.map((result) => <SearchResultItem key={result.id} result={result} onClick={() => onNavigate({ type: "browser", title: result.title, url: result.url, description: result.description, source: result.source })} />)}
  </div>
}

function SearchResultItem({ onClick, result }: { onClick: () => void; result: SearchResult }) {
  return <button type="button" className="group flex w-full gap-3 border-b px-5 py-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" onClick={onClick}>
    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border bg-card text-muted-foreground"><Globe2 className="size-3.5" /></span>
    <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-[15px] font-medium text-foreground">{result.title}</span><ExternalLink className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" /></span><span className="mt-1 block line-clamp-2 text-sm leading-5 text-muted-foreground">{result.description}</span><span className="mt-2 block truncate text-xs text-ring">{result.source} · {result.url.replace(/^https?:\/\//, "")}</span></span>
  </button>
}

export function BrowserToolbar({ view }: { view: Extract<PanelView, { type: "browser" }> }) {
  return <ToolbarRow>
    <IconButton aria-label="返回" disabled><ArrowLeft /></IconButton>
    <div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg bg-secondary px-3 text-xs text-muted-foreground"><Globe2 className="size-3.5 shrink-0" /><span className="truncate">{view.url}</span></div>
    <ToolbarActions><IconButton aria-label="在新窗口打开"><ExternalLink /></IconButton></ToolbarActions>
  </ToolbarRow>
}

export function BrowserBody({ view }: { view: Extract<PanelView, { type: "browser" }> }) {
  return <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8"><article className="mx-auto max-w-2xl">
    <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"><span className="grid size-8 place-items-center rounded-full border"><Globe2 className="size-4" /></span><span>{view.source ?? new URL(view.url).hostname}</span></div>
    <h3 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">{view.title}</h3>
    <p className="mt-4 text-[15px] leading-7 text-muted-foreground">{view.description ?? "网页内容已在独立面板中打开。"}</p>
    <div className="mt-8 space-y-4">{["页面摘要", "关键数据与结论", "来源与更新时间"].map((title, index) => <section key={title} className={cn("border-t pt-4", index === 0 && "border-t-0 pt-0")}><h4 className="text-[15px] font-medium">{title}</h4><p className="mt-2 text-sm leading-6 text-muted-foreground">这是浏览器预览模式的内容占位，用于承载网页正文、数据表格和来源信息，并保持与对话上下文并排查看。</p></section>)}</div>
  </article></div>
}

export function FilePreviewToolbar({ view }: { view: Extract<PanelView, { type: "file-preview" }> }) {
  return <ToolbarRow className="bg-background px-4">
    <FileText className="size-4 shrink-0 text-muted-foreground" />
    <span className="min-w-0 flex-1 truncate text-sm">{view.fileName}</span>
    <span className="shrink-0 text-xs text-ring">{view.fileType ?? "文档"}</span>
    <ToolbarActions><IconButton aria-label="下载"><Download /></IconButton><IconButton aria-label="在新窗口打开"><ExternalLink /></IconButton></ToolbarActions>
  </ToolbarRow>
}

export function FilePreviewBody({ view }: { view: Extract<PanelView, { type: "file-preview" }> }) {
  return <div className="min-h-0 flex-1 overflow-y-auto bg-secondary/30 p-4 sm:p-6"><article className="mx-auto min-h-full max-w-2xl rounded-sm border bg-card px-8 py-10 shadow-sm sm:px-12"><MarkdownContent>{view.content}</MarkdownContent></article></div>
}
