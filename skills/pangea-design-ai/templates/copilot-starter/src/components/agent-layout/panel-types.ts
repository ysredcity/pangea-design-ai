export type SearchResult = {
  id: string
  title: string
  description: string
  url: string
  source: string
}

/** 独立面板的一个容器视图 */
export type PanelView =
  | {
      type: "search-results"
      title: string
      query: string
      results: SearchResult[]
    }
  | {
      type: "browser"
      title: string
      url: string
      description?: string
      source?: string
    }
  | {
      type: "file-preview"
      title: string
      fileName: string
      content: string
      fileType?: string
    }

/** 图片不进独立面板，改为蒙层图片查看器 */
export type ImageView = {
  type: "image"
  title: string
  fileName: string
  src: string
  alt?: string
  fileType?: string
}

/**
 * 执行 Badge 可以打开的产物：
 * - `PanelView` 进右侧独立面板的容器 Tab；
 * - `ImageView` 走蒙层图片查看器。
 */
export type ArtifactTarget = PanelView | ImageView

/** 独立面板顶部 Tab 中的一个容器实例 */
export type PanelTab = { id: string } & PanelView

/** 用于判断某个容器是否已经在 Tab 中打开，避免重复开同一个容器 */
export function panelViewKey(view: PanelView): string {
  if (view.type === "search-results") return `search-results:${view.query}`
  if (view.type === "browser") return `browser:${view.url}`
  return `file-preview:${view.fileName}`
}
