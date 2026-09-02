import { useEffect, useState } from "react"
import { Download, Minus, Plus, RotateCw, X } from "lucide-react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { IconButton } from "./icon-button"
import type { ImageView } from "./panel-types"

/**
 * 图片查看器：图片类产物不进右侧独立面板，统一用蒙层查看。
 *
 * 标准交互：蒙层点击关闭、Esc 关闭、缩放、旋转、重置、下载。
 * 只处理呈现，图片数据由 `panel-data.ts` 提供。
 */
const ZOOM_STEPS = [0.5, 0.75, 1, 1.5, 2, 3]

export function ImageViewer({ onClose, view }: { onClose: () => void; view: ImageView }) {
  const [zoomIndex, setZoomIndex] = useState(2)
  const [rotation, setRotation] = useState(0)
  const zoom = ZOOM_STEPS[zoomIndex]

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      if (event.key === "+" || event.key === "=") setZoomIndex((index) => Math.min(ZOOM_STEPS.length - 1, index + 1))
      if (event.key === "-") setZoomIndex((index) => Math.max(0, index - 1))
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  return <div role="dialog" aria-modal="true" aria-label={view.title} className="fixed inset-0 z-60 flex flex-col bg-black/80 backdrop-blur-sm">
    <header className="flex h-13 shrink-0 items-center gap-3 px-4 text-white/90">
      <span className="min-w-0 flex-1 truncate text-base font-medium">{view.fileName}</span>
      {view.fileType && <span className="shrink-0 text-xs text-white/50">{view.fileType}</span>}
      <div className="flex shrink-0 items-center gap-1">
        <ViewerAction label="缩小" disabled={zoomIndex === 0} onClick={() => setZoomIndex((index) => Math.max(0, index - 1))}><Minus /></ViewerAction>
        <Tooltip>
          <TooltipTrigger render={<button type="button" aria-label="重置缩放" className="h-7 min-w-14 rounded-full px-2 text-xs tabular-nums text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60" onClick={() => { setZoomIndex(2); setRotation(0) }}>{Math.round(zoom * 100)}%</button>} />
          <TooltipContent side="bottom">重置缩放</TooltipContent>
        </Tooltip>
        <ViewerAction label="放大" disabled={zoomIndex === ZOOM_STEPS.length - 1} onClick={() => setZoomIndex((index) => Math.min(ZOOM_STEPS.length - 1, index + 1))}><Plus /></ViewerAction>
        <ViewerAction label="旋转" onClick={() => setRotation((value) => (value + 90) % 360)}><RotateCw /></ViewerAction>
        <span className="mx-1 h-4 w-px bg-white/25" />
        <ViewerAction label="下载" render={<a href={view.src} download={view.fileName} />}><Download /></ViewerAction>
        <ViewerAction label="关闭" onClick={onClose}><X /></ViewerAction>
      </div>
    </header>
    <button type="button" aria-label="关闭图片查看器" className="min-h-0 flex-1 cursor-zoom-out overflow-auto p-6" onClick={onClose}>
      <span className="flex min-h-full min-w-full items-center justify-center">
        <img
          src={view.src}
          alt={view.alt ?? view.title}
          className={cn("max-h-[calc(100dvh-8rem)] max-w-full origin-center cursor-default rounded-lg bg-white shadow-2xl transition-transform duration-200")}
          style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
          onClick={(event) => event.stopPropagation()}
        />
      </span>
    </button>
    <footer className="shrink-0 px-4 pb-4 text-center text-xs text-white/50">{view.title} · 点击蒙层或按 Esc 关闭</footer>
  </div>
}

function ViewerAction({ children, disabled, label, onClick, render }: { children: React.ReactNode; disabled?: boolean; label: string; onClick?: () => void; render?: React.ReactElement }) {
  return <Tooltip>
    <TooltipTrigger render={<IconButton aria-label={label} disabled={disabled} onClick={onClick} render={render} className="text-white/80 hover:bg-white/15 hover:text-white disabled:opacity-40">{children}</IconButton>} />
    <TooltipContent side="bottom">{label}</TooltipContent>
  </Tooltip>
}
