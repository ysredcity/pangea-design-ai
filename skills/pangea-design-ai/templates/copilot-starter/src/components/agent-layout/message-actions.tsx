import { useEffect, useRef, useState } from "react"
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { IconButton } from "./icon-button"

/**
 * 用户消息和智能体消息共用的操作栏动作：复制、点赞、点踩反馈。
 * 每个动作自带 Tooltip，行为在这里统一实现，避免两处消息组件各写一套状态。
 */

/** 复制成功后维持 3 秒的 check 反馈，不使用 toast */
export function CopyAction({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }, [])

  const copy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopied(false), 3000)
  }

  return <MessageActionButton label={copied ? "已复制" : "复制"} onClick={copy}>
    {copied ? <Check className="text-success" /> : <Copy />}
  </MessageActionButton>
}

const feedbackReasons = ["误解了我的问题", "上下文理解错误", "回答模糊/不具体", "代码有错误", "回答不专业", "代码格式问题", "其他原因"]

/**
 * 点赞 / 点踩组合，二者互斥：点赞会清掉已提交的点踩，提交点踩反馈会清掉点赞。
 * 点踩必须先在对话框里提交才会置为 fill 态，取消或未选择内容不生效。
 */
export function FeedbackActions({ onFeedback }: { onFeedback?: (feedback: { reasons: string[]; note: string }) => void }) {
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [note, setNote] = useState("")

  const toggleLike = () => {
    setLiked((value) => !value)
    setDisliked(false)
  }

  const toggleReason = (reason: string) => {
    setSelectedReasons((items) => items.includes(reason) ? items.filter((item) => item !== reason) : [...items, reason])
  }

  const submitFeedback = () => {
    setDisliked(true)
    setLiked(false)
    onFeedback?.({ reasons: selectedReasons, note })
    setDialogOpen(false)
    setSelectedReasons([])
    setNote("")
  }

  return <>
    <MessageActionButton label={liked ? "取消赞同" : "赞同"} onClick={toggleLike}>
      <ThumbsUp className={cn(liked && "fill-primary text-primary")} />
    </MessageActionButton>
    <MessageActionButton label={disliked ? "取消不赞同" : "不赞同"} onClick={() => setDialogOpen(true)}>
      <ThumbsDown className={cn(disliked && "fill-primary text-primary")} />
    </MessageActionButton>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="w-90 gap-4 rounded-2xl bg-card p-5 shadow-xl sm:max-w-90">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-base font-semibold">请选择不满意的原因</DialogTitle>
          <DialogDescription className="sr-only">选择一个或多个原因，也可以在下方补充说明</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {feedbackReasons.map((reason) => (
            <button
              key={reason}
              type="button"
              aria-pressed={selectedReasons.includes(reason)}
              onClick={() => toggleReason(reason)}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                selectedReasons.includes(reason) ? "border-primary bg-primary-bg text-primary" : "border-border bg-muted/40 text-foreground hover:bg-muted",
              )}
            >
              {reason}
            </button>
          ))}
        </div>
        <textarea
          aria-label="其他意见"
          className="min-h-16 w-full resize-none rounded-lg border bg-muted/40 p-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring"
          placeholder="其他意见（选填）"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <DialogFooter className="m-0 flex-row border-0 bg-transparent p-0">
          <Button type="button" className="h-10 w-full" disabled={selectedReasons.length === 0 && !note.trim()} onClick={submitFeedback}>提交反馈</Button>
        </DialogFooter>
        {/* 关闭按钮沿用 DialogContent 默认右上角 X，与设计稿一致 */}
      </DialogContent>
    </Dialog>
  </>
}

function MessageActionButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return <Tooltip>
    <TooltipTrigger render={<IconButton aria-label={label} onClick={onClick}>{children}</IconButton>} />
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
}
