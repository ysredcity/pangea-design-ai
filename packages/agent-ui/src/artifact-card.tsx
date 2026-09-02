import * as React from 'react'
import { FileText, FileSpreadsheet, Image as ImageIcon, Video, Code2, BarChart3 } from 'lucide-react'

import { cn } from './lib/utils'

/**
 * 制品卡片。对应设计文档：references/component-selection/artifact-card.md
 *
 * 硬约束：对话流内只展示摘要（文件名/类型/生成时间），不展示完整产物内容；
 * 点击后在独立面板打开（沉浸式：ImmersiveShell 的 panel 插槽）。
 */

export type ArtifactType = 'document' | 'table' | 'image' | 'video' | 'code' | 'report'

export interface ArtifactSummary {
  id: string
  type: ArtifactType
  fileName: string
  /** 例如 "Document · MD · 生成 08-15 14:35" */
  meta: string
}

const TYPE_ICON: Record<ArtifactType, React.ComponentType<{ className?: string }>> = {
  document: FileText,
  table: FileSpreadsheet,
  image: ImageIcon,
  video: Video,
  code: Code2,
  report: BarChart3,
}

export function ArtifactCard({
  artifact,
  onOpen,
  className,
}: {
  artifact: ArtifactSummary
  onOpen: () => void
  className?: string
}) {
  const Icon = TYPE_ICON[artifact.type]

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'flex w-full max-w-[360px] items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring',
        className,
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-bg text-primary">
        <Icon className="size-4.5" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{artifact.fileName}</span>
        <span className="truncate text-xs text-muted-foreground">{artifact.meta}</span>
      </div>
    </button>
  )
}
