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
  html: FileText,
  htm: FileText,
  csv: FileSpreadsheet,
  ppt: FileChartColumn,
  pptx: FileChartColumn,
}

const expertVisuals = {
  travel: { icon: BriefcaseBusiness, className: "bg-sky-500 text-white!" },
  office: { icon: BriefcaseBusiness, className: "bg-blue-500 text-white!" },
  document: { icon: FileText, className: "bg-violet-500 text-white!" },
  data: { icon: BarChart3, className: "bg-emerald-500 text-white!" },
  research: { icon: Search, className: "bg-orange-500 text-white!" },
  campus: { icon: Building2, className: "bg-cyan-500 text-white!" },
  ux: { icon: Palette, className: "bg-pink-500 text-white!" },
  industry: { icon: Sparkles, className: "bg-amber-500 text-white!" },
} satisfies Record<string, { icon: LucideIcon; className: string }>

export type ExpertVisualKey = keyof typeof expertVisuals
export type ProductAvatarKey = "bot"

const expertVisualKeys: Record<string, ExpertVisualKey> = {
  差旅助手: "travel",
  日常办公专家: "office",
  文档处理专家: "document",
  数据分析专家: "data",
  市场调研专家: "research",
  园区生活专家: "campus",
  用户体验专家: "ux",
  行业研究专家: "industry",
}

const defaultExpertVisual = { icon: Sparkles, className: "bg-primary text-primary-foreground!" }

export function LibraryFileIcon({ className, fileName }: { className?: string; fileName: string }) {
  const FileIcon = fileIcons[fileName.split(".").pop()?.toLowerCase() ?? ""] ?? File
  return <FileIcon aria-hidden="true" className={cn("size-4 shrink-0", className)} />
}

export function ExpertAvatar({ className, expert, visualKey }: { className?: string; expert?: string; visualKey?: ExpertVisualKey }) {
  const resolvedVisualKey = visualKey ?? (expert ? expertVisualKeys[expert] : undefined)
  const visual = resolvedVisualKey ? expertVisuals[resolvedVisualKey] : defaultExpertVisual
  const ExpertIcon = visual.icon
  return <span data-slot="expert-avatar" aria-hidden="true" className={cn("grid size-6 shrink-0 place-items-center rounded-full shadow-xs ring-1 ring-black/5 transition-none", visual.className, className)}><ExpertIcon className="size-3.5" style={{ stroke: "white" }} /></span>
}

/** 智能体侧头像：指定了专家用专家头像，否则用产品身份头像 */
export function AgentAvatar({ className, expertVisualKey, productAvatar = "bot" }: { className?: string; expertVisualKey?: ExpertVisualKey; productAvatar?: ProductAvatarKey }) {
  if (expertVisualKey) return <ExpertAvatar visualKey={expertVisualKey} className={className} />
  if (productAvatar === "bot") return <span data-slot="agent-avatar" aria-hidden="true" className={cn("grid size-6 shrink-0 place-items-center rounded-full bg-primary shadow-xs ring-1 ring-black/5", className)}><Bot className="size-3.5" style={{ stroke: "white" }} /></span>
  return null
}
