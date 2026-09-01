import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowUp, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Mic, Plus, Upload, X } from "lucide-react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle } from "@/components/ui/attachment"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { contextIcons, type ContextType } from "./icon-registry"
import { IconButton } from "./icon-button"
import { ExpertAvatar, LibraryFileIcon } from "./resource-visuals"

export type ContextItem = { id: string; label: string; type: ContextType }

type UploadItem = { id: string; name: string; size: number }

/** 会以内联标签形式插入输入框的上下文类型；专家仍显示在底部操作行 */
const inlineContextTypes = ["文件库", "最近的对话", "技能"] as const
type InlineContextType = (typeof inlineContextTypes)[number]

const contextMenus: Array<{ label: Exclude<ContextType, "upload" | "连接器">; items: string[] }> = [
  { label: "文件库", items: ["智能体产品交互设计指南.pdf", "行业调研资料汇总.docx", "项目周报模板.xlsx"] },
  { label: "最近的对话", items: ["杭州出差安排", "整理本周项目进展", "瑞幸行业调研"] },
  { label: "专家", items: ["日常办公专家", "文档处理专家", "数据分析专家", "市场调研专家", "园区生活专家", "用户体验专家", "行业研究专家"] },
  { label: "技能", items: ["深度研究", "文档总结", "数据可视化"] },
]

const inlineMenus = contextMenus.filter((menu): menu is { label: InlineContextType; items: string[] } => inlineContextTypes.includes(menu.label as InlineContextType))

const connectorOptions = [
  { label: "飞书云文档", initials: "飞", className: "bg-blue-500 text-white!" },
  { label: "企业知识库", initials: "知", className: "bg-violet-500 text-white!" },
  { label: "网页搜索", initials: "网", className: "bg-cyan-500 text-white!" },
  { label: "GitHub", initials: "GH", className: "bg-neutral-900 text-white! dark:bg-neutral-100 dark:text-neutral-900!" },
  { label: "Notion", initials: "N", className: "border border-foreground/20 bg-background text-foreground!" },
]

type ComposerProps = {
  onSend?: (message: string, context: ContextItem[]) => void
  draft?: string
  onDraftChange?: (value: string) => void
  selectedExpert?: string | null
  onSelectedExpertChange?: (expert: string | null) => void
}

const formatFileSize = (size: number) => size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${(size / 1024).toFixed(1)} KB`
const fileTypeLabel = (name: string) => name.split(".").pop()?.toUpperCase() ?? "文件"

export function Composer({ onSend, draft, onDraftChange, selectedExpert, onSelectedExpertChange }: ComposerProps) {
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [experts, setExperts] = useState<ContextItem[]>([])
  const [recording, setRecording] = useState(false)
  const [hasContent, setHasContent] = useState(false)
  const [enabledConnectors, setEnabledConnectors] = useState<Set<string>>(() => new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const iconTemplatesRef = useRef<HTMLDivElement>(null)
  const savedRangeRef = useRef<Range | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  // 受控草稿（新对话页的推荐指令）直接参与判断，这样外部写入草稿时不必在 effect 里再 setState
  const hasText = hasContent || Boolean(draft?.trim())
  const canSend = hasText || uploads.length > 0 || experts.length > 0 || enabledConnectors.size > 0

  /** 读取可编辑区：文本按原样拼接，内联标签取其 label */
  const readEditor = () => {
    const editor = editorRef.current
    if (!editor) return { text: "", tags: [] as ContextItem[] }
    const tags: ContextItem[] = []
    let text = ""
    editor.childNodes.forEach((node) => {
      if (node instanceof HTMLElement && node.dataset.tagLabel) {
        tags.push({ id: `${node.dataset.tagType}-${node.dataset.tagLabel}`, label: node.dataset.tagLabel, type: node.dataset.tagType as ContextType })
        text += node.dataset.tagLabel
        return
      }
      text += node.textContent ?? ""
    })
    return { text, tags }
  }

  const syncEditorState = () => {
    const { text, tags } = readEditor()
    setHasContent(Boolean(text.trim() || tags.length))
    onDraftChange?.(text)
  }

  // 外部写入草稿（例如点击推荐指令）时替换可编辑区内容
  useEffect(() => {
    const editor = editorRef.current
    if (draft === undefined || !editor) return
    if (readEditor().text === draft) return
    editor.textContent = draft
  }, [draft])

  useEffect(() => {
    if (selectedExpert === undefined) return
    setExperts(selectedExpert ? [{ id: `专家-${selectedExpert}`, label: selectedExpert, type: "专家" }] : [])
  }, [selectedExpert])

  /** 在最后的光标位置插入内联标签，插入后补一个空格便于继续输入 */
  const insertInlineTag = (label: string, type: InlineContextType) => {
    const editor = editorRef.current
    if (!editor) return

    const tag = document.createElement("span")
    tag.contentEditable = "false"
    tag.dataset.tagLabel = label
    tag.dataset.tagType = type
    tag.className = "mx-0.5 inline-flex max-w-60 items-center gap-1 rounded-md bg-primary-bg px-1.5 align-middle text-[15px] leading-6 text-primary"

    const iconTemplate = iconTemplatesRef.current?.querySelector(`[data-icon-template="${type}:${CSS.escape(label)}"] svg`)
    if (iconTemplate) tag.append(iconTemplate.cloneNode(true))
    const text = document.createElement("span")
    text.className = "truncate"
    text.textContent = label
    tag.append(text)

    const spacer = document.createTextNode("\u00A0")
    const range = savedRangeRef.current && editor.contains(savedRangeRef.current.commonAncestorContainer)
      ? savedRangeRef.current
      : (() => {
        const end = document.createRange()
        end.selectNodeContents(editor)
        end.collapse(false)
        return end
      })()

    range.deleteContents()
    range.insertNode(spacer)
    range.insertNode(tag)

    const after = document.createRange()
    after.setStartAfter(spacer)
    after.collapse(true)
    savedRangeRef.current = after.cloneRange()
    editor.focus()
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(after)
    syncEditorState()
  }

  const addContext = (label: string, type: ContextType) => {
    if (type === "专家") {
      onSelectedExpertChange?.(label)
      setExperts([{ id: `${type}-${label}`, label, type }])
      return
    }
    if (inlineContextTypes.includes(type as InlineContextType)) insertInlineTag(label, type as InlineContextType)
  }

  const saveSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    if (editorRef.current?.contains(range.commonAncestorContainer)) savedRangeRef.current = range.cloneRange()
  }

  const toggleRecording = async () => {
    if (recording) {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
      setRecording(false)
      return
    }
    try {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      setRecording(true)
    } catch {
      toast.error("无法使用麦克风，请检查浏览器权限")
    }
  }

  const send = () => {
    if (!canSend) return
    const { text, tags } = readEditor()
    const uploadContext: ContextItem[] = uploads.map((file) => ({ id: file.id, label: file.name, type: "upload" }))
    const connectorContext: ContextItem[] = Array.from(enabledConnectors).map((label) => ({ id: `连接器-${label}`, label, type: "连接器" }))
    onSend?.(text.trim(), [...uploadContext, ...tags, ...experts, ...connectorContext])
    if (editorRef.current) editorRef.current.textContent = ""
    savedRangeRef.current = null
    setHasContent(false)
    setUploads([])
    setEnabledConnectors(new Set())
    onDraftChange?.("")
  }

  return (
    <div className="flex max-h-52 w-full flex-col overflow-hidden rounded-3xl border bg-background shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] focus-within:border-input min-[660px]:max-h-60">
      {/* 内联标签图标模板：插入标签时克隆这里的 SVG，保证与菜单图标一致 */}
      <div ref={iconTemplatesRef} className="hidden" aria-hidden="true">
        {inlineMenus.flatMap(({ items, label: type }) => items.map((item) => {
          const ContextIcon = contextIcons[type]
          return <span key={`${type}:${item}`} data-icon-template={`${type}:${item}`}>
            {type === "文件库" ? <LibraryFileIcon fileName={item} className="size-3.5" /> : <ContextIcon className="size-3.5 shrink-0" />}
          </span>
        }))}
      </div>

      <div className="min-h-0 overflow-y-auto">
        {uploads.length > 0 && <UploadRow uploads={uploads} onRemove={(id) => setUploads((items) => items.filter((item) => item.id !== id))} />}
        <div className="relative px-5 pt-4">
          <div
            ref={editorRef}
            role="textbox"
            aria-multiline="true"
            aria-label="消息内容"
            contentEditable={!recording}
            suppressContentEditableWarning
            className={cn("min-h-12 w-full whitespace-pre-wrap break-words text-base leading-6 outline-none", recording && "invisible")}
            onInput={syncEditorState}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onBlur={saveSelection}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                send()
              }
            }}
          />
          {(recording || !hasText) && (
            <span aria-hidden="true" className="pointer-events-none absolute left-5 top-4 text-base leading-6 text-muted-foreground">
              {recording ? "语音录入中..." : "发送消息给我"}
            </span>
          )}
        </div>
      </div>
      <div className="flex min-h-14 items-center justify-between gap-2 p-2.5">
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(event) => {
          const files = Array.from(event.target.files ?? []).map((file) => ({ id: `upload-${file.name}-${file.lastModified}`, name: file.name, size: file.size }))
          setUploads((items) => [...items, ...files.filter((file) => !items.some((item) => item.id === file.id))])
          event.currentTarget.value = ""
        }} />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <AddContextMenu disabled={recording} onLocalUpload={() => fileInputRef.current?.click()} onSelect={addContext} />
          <div className="flex min-w-0 items-center gap-2 overflow-x-auto px-1">
            <ConnectorMenu enabled={enabledConnectors} onEnabledChange={setEnabledConnectors} />
            {experts.map((expert) => (
              <span key={expert.id} className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-primary-bg px-2 text-sm font-medium text-primary">
                <ExpertAvatar expert={expert.label} className="size-5 [&_svg]:size-3" /><span className="px-0.5">{expert.label}</span>
                <button type="button" aria-label={`移除${expert.label}`} className="rounded-full hover:bg-primary/10" onClick={() => { setExperts([]); onSelectedExpertChange?.(null) }}><X className="size-4" /></button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger render={<IconButton aria-label={recording ? "结束录音" : "语音输入"} className={cn("group/recording size-9", recording && "bg-destructive/10 text-destructive hover:bg-destructive/10 hover:text-destructive")} onClick={toggleRecording}>{recording ? <><VoiceWave /><X className="hidden size-5 group-hover/recording:block" /></> : <Mic className="size-5" />}</IconButton>} />
            <TooltipContent>{recording ? "结束录音" : "语音输入"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<IconButton aria-label="发送" disabled={!canSend || recording} className="size-9 bg-foreground text-background hover:bg-foreground hover:text-background enabled:opacity-100 disabled:opacity-40" onClick={send}><ArrowUp className="size-5" /></IconButton>} />
            <TooltipContent>发送</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

/**
 * 本地上传文件横向排列，单卡固定 240px；超出宽度时在两侧显示滚动按钮。
 * 滚动状态用 ResizeObserver + scroll 事件在回调里更新，不放进 effect。
 */
function UploadRow({ onRemove, uploads }: { onRemove: (id: string) => void; uploads: UploadItem[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [scrollable, setScrollable] = useState({ start: false, end: false })

  // 必须做等值判断后再 setState：ref callback 会在重挂载时重新计算，
  // 每次都返回新对象会导致「渲染 → 重挂载 → setState」无限循环。
  const updateScrollable = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const start = scroller.scrollLeft > 1
    const end = scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1
    setScrollable((current) => current.start === start && current.end === end ? current : { start, end })
  }, [])

  const attachScroller = useCallback((node: HTMLDivElement | null) => {
    scrollerRef.current = node
    if (!node) return
    updateScrollable()
    // 容器尺寸变化用 ResizeObserver；增删附件不改变容器尺寸，需要 MutationObserver 兜住
    const resizeObserver = new ResizeObserver(updateScrollable)
    resizeObserver.observe(node)
    const mutationObserver = new MutationObserver(updateScrollable)
    mutationObserver.observe(node, { childList: true })
    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [updateScrollable])

  const scrollBy = (direction: -1 | 1) => {
    scrollerRef.current?.scrollBy({ left: direction * 252, behavior: "smooth" })
  }

  return (
    <div className="group/uploads relative px-3 pt-3">
      {scrollable.start && <ScrollButton label="向前滚动" side="left" onClick={() => scrollBy(-1)}><ChevronLeft /></ScrollButton>}
      <AttachmentGroup ref={attachScroller} className="py-0" onScroll={updateScrollable}>
        {uploads.map((file) => (
          <Attachment key={file.id} className="w-60">
            <AttachmentMedia><LibraryFileIcon fileName={file.name} /></AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{file.name}</AttachmentTitle>
              <AttachmentDescription>{fileTypeLabel(file.name)} · {formatFileSize(file.size)}</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction aria-label={`移除${file.name}`} onClick={() => onRemove(file.id)}><X /></AttachmentAction>
            </AttachmentActions>
          </Attachment>
        ))}
      </AttachmentGroup>
      {scrollable.end && <ScrollButton label="向后滚动" side="right" onClick={() => scrollBy(1)}><ChevronRight /></ScrollButton>}
    </div>
  )
}

function ScrollButton({ children, label, onClick, side }: { children: React.ReactNode; label: string; onClick: () => void; side: "left" | "right" }) {
  return <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className={cn(
      "absolute top-1/2 z-10 grid size-7 -translate-y-1/2 place-items-center rounded-full border bg-background text-foreground opacity-0 shadow-sm transition-[color,background-color,opacity] hover:border-foreground hover:bg-foreground hover:text-background focus-visible:opacity-100 group-hover/uploads:opacity-100 [&_svg]:size-4",
      side === "left" ? "left-1" : "right-1",
    )}
  >{children}</button>
}

function ConnectorMenu({ enabled, onEnabledChange }: { enabled: Set<string>; onEnabledChange: (value: Set<string>) => void }) {
  const ConnectorIcon = contextIcons.连接器
  const enabledOptions = connectorOptions.filter(({ label }) => enabled.has(label))
  const visibleOptions = enabledOptions.slice(0, 3)
  const overflowCount = Math.max(0, enabledOptions.length - visibleOptions.length)
  const toggle = (label: string, checked: boolean) => {
    const next = new Set(enabled)
    if (checked) next.add(label)
    else next.delete(label)
    onEnabledChange(next)
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger render={<DropdownMenuTrigger render={<button type="button" className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-transparent px-2 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50">
          {enabledOptions.length > 0 ? (
            <span className="flex items-center pl-0.5" aria-label={`已开启 ${enabledOptions.map(({ label }) => label).join("、")}`}>
              {visibleOptions.map((connector, index) => <ConnectorAvatar key={connector.label} connector={connector} className={cn(index > 0 && "-ml-1.5")} />)}
              {overflowCount > 0 && <span className="-ml-1 flex size-5 items-center justify-center rounded-full border-2 border-primary-bg bg-muted text-[10px] font-semibold text-foreground">+{overflowCount}</span>}
            </span>
          ) : <ConnectorIcon className="size-4" />}
          <span className="px-0.5">连接器</span><ChevronDown className="size-4" />
        </button>} />} />
        <TooltipContent>配置连接器</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" side="top" sideOffset={8} className="w-64">
        {connectorOptions.map((connector) => (
          <DropdownMenuItem key={connector.label} closeOnClick={false} onClick={(event) => event.preventDefault()}>
            <ConnectorAvatar connector={connector} />{connector.label}<Switch className="ml-auto" checked={enabled.has(connector.label)} onCheckedChange={(checked) => toggle(connector.label, checked)} />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem><Plus />添加连接器<ExternalLink className="ml-auto size-3.5" /></DropdownMenuItem>
        <DropdownMenuItem><ConnectorIcon />管理连接器<ExternalLink className="ml-auto size-3.5" /></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ConnectorAvatar({ connector, className }: {
  connector: (typeof connectorOptions)[number]
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold leading-none ring-1 ring-black/5",
        connector.className,
        className,
      )}
    >
      {connector.initials}
    </span>
  )
}

function VoiceWave() {
  return (
    <span className="flex size-5 items-center justify-center gap-0.5 group-hover/recording:hidden" aria-hidden="true">
      {[0, 1, 2, 3].map((bar) => (
        <span
          key={bar}
          className="h-1.5 w-0.5 rounded-[999px] bg-current animate-[voice-wave_900ms_ease-in-out_infinite]"
          style={{ animationDelay: `${bar * 120}ms` }}
        />
      ))}
    </span>
  )
}

function AddContextMenu({ disabled, onLocalUpload, onSelect }: { disabled?: boolean; onLocalUpload: () => void; onSelect: (label: string, type: ContextType) => void }) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger render={<DropdownMenuTrigger disabled={disabled} render={<IconButton aria-label="添加文件和更多内容" disabled={disabled} className="size-9"><Plus className="size-5" /></IconButton>} />} />
        <TooltipContent>添加文件和更多内容</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" side="top" sideOffset={8} className="w-52">
        <DropdownMenuItem onClick={onLocalUpload}><Upload />本地上传</DropdownMenuItem>
        {contextMenus.map(({ items, label }) => {
          const ContextIcon = contextIcons[label]
          return (
          <DropdownMenuSub key={label}>
            <DropdownMenuSubTrigger><ContextIcon />{label}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-60">
              {items.map((item) => <DropdownMenuItem key={item} onClick={() => onSelect(item, label)}>
                {label === "文件库" ? <LibraryFileIcon fileName={item} /> : label === "专家" ? <ExpertAvatar expert={item} /> : <ContextIcon />}
                <span className="min-w-0 truncate">{item}</span>
              </DropdownMenuItem>)}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
