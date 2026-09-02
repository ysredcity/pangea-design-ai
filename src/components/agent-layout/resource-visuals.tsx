import { BarChart3, Bot, BriefcaseBusiness, Building2, File, FileChartColumn, FileSpreadsheet, FileText, Palette, Search, Sparkles, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** 文件图标只按类型区分形状，不带彩色前景或背景，跟随所在容器的文字颜色 */
const fileIcons: Record<string, LucideIcon> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  md: FileText,
  txt: FileText,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  ppt: FileChartColumn,
  pptx: FileChartColumn,
}

const expertVisuals: Record<string, { icon: LucideIcon; className: string }> = {
  差旅助手: { icon: BriefcaseBusiness, className: "bg-sky-500 text-white!" },
  日常办公专家: { icon: BriefcaseBusiness, className: "bg-blue-500 text-white!" },
  文档处理专家: { icon: FileText, className: "bg-violet-500 text-white!" },
  数据分析专家: { icon: BarChart3, className: "bg-emerald-500 text-white!" },
  市场调研专家: { icon: Search, className: "bg-orange-500 text-white!" },
  园区生活专家: { icon: Building2, className: "bg-cyan-500 text-white!" },
  用户体验专家: { icon: Palette, className: "bg-pink-500 text-white!" },
  行业研究专家: { icon: Sparkles, className: "bg-amber-500 text-white!" },
}

const defaultExpertVisual = { icon: Sparkles, className: "bg-primary text-primary-foreground!" }

export function LibraryFileIcon({ className, fileName }: { className?: string; fileName: string }) {
  const FileIcon = fileIcons[fileName.split(".").pop()?.toLowerCase() ?? ""] ?? File
  return <FileIcon aria-hidden="true" className={cn("size-4 shrink-0", className)} />
}

export function ExpertAvatar({ className, expert }: { className?: string; expert: string }) {
  const visual = expertVisuals[expert] ?? defaultExpertVisual
  const ExpertIcon = visual.icon
  return <span data-slot="expert-avatar" aria-hidden="true" className={cn("grid size-6 shrink-0 place-items-center rounded-full shadow-xs ring-1 ring-black/5 transition-none", visual.className, className)}><ExpertIcon className="size-3.5" style={{ stroke: "white" }} /></span>
}

/** 智能体侧头像：指定了专家用专家头像，否则用产品身份头像 */
export function AgentAvatar({ className, expert }: { className?: string; expert?: string }) {
  if (expert) return <ExpertAvatar expert={expert} className={className} />
  return <span data-slot="agent-avatar" aria-hidden="true" className={cn("grid size-6 shrink-0 place-items-center rounded-full bg-primary shadow-xs ring-1 ring-black/5", className)}><Bot className="size-3.5" style={{ stroke: "white" }} /></span>
}
