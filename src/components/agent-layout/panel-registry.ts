import type { ComponentType } from "react"
import { FileText, Globe2, Search } from "lucide-react"

import { BrowserBody, BrowserToolbar, FilePreviewBody, FilePreviewToolbar, SearchResultsBody, SearchResultsToolbar } from "./panel-containers"
import type { PanelView } from "./panel-types"

/**
 * 独立面板的容器注册表。
 *
 * 框架壳层（`artifact-panel.tsx`）只负责 aside、Tab 顶栏和全局操作，
 * 每种容器类型的图标、操作栏和内容都由这里注册。
 * 新增一种容器类型：在 `panel-types.ts` 扩展 `PanelView`，在 `panel-containers.tsx` 写实现，再补一条注册即可。
 */
export type PanelContainer<V extends PanelView = PanelView> = {
  /** Tab 使用的类型图标 */
  icon: typeof Search
  /** 容器自己的操作栏：放类型相关操作，不放到顶部 Tab 行 */
  Toolbar?: ComponentType<{ view: V }>
  Body: ComponentType<{ view: V; onNavigate: (view: PanelView) => void }>
}

type PanelContainerRegistry = { [K in PanelView["type"]]: PanelContainer<Extract<PanelView, { type: K }>> }

export const panelContainers: PanelContainerRegistry = {
  "search-results": { icon: Search, Toolbar: SearchResultsToolbar, Body: SearchResultsBody },
  browser: { icon: Globe2, Toolbar: BrowserToolbar, Body: BrowserBody },
  "file-preview": { icon: FileText, Toolbar: FilePreviewToolbar, Body: FilePreviewBody },
}
