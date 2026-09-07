import { ArrowDown } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

export type ConversationSurfaceProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  disclaimer?: string | false
  footer: ReactNode
  footerClassName?: string
  scrollKey?: string
}

/**
 * Shared conversation viewport used by immersive and Copilot shells.
 * Product-specific headers, flows, composers, and artifact routing stay outside this neutral surface.
 */
export function ConversationSurface({
  children,
  className = '',
  contentClassName = 'max-w-3xl py-3',
  disclaimer = '以上内容由AI生成',
  footer,
  footerClassName = 'max-w-3xl py-3',
  scrollKey,
}: ConversationSurfaceProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)

  useLayoutEffect(() => {
    const content = contentRef.current
    if (!content) return
    content.scrollTop = content.scrollHeight
    setShowScrollToBottom(false)
  }, [scrollKey])

  const updateScrollButton = () => {
    const content = contentRef.current
    if (content) setShowScrollToBottom(content.scrollHeight - content.scrollTop - content.clientHeight > 48)
  }

  return (
    <div className={`relative flex min-h-0 flex-1 flex-col items-center overflow-hidden ${className}`}>
      <div ref={contentRef} className="no-scrollbar min-h-0 w-full flex-1 overflow-y-auto px-4" onScroll={updateScrollButton}>
        <div className={`mx-auto min-h-full w-full ${contentClassName}`}>{children}</div>
      </div>
      <footer className="relative w-full shrink-0 px-4">
        {showScrollToBottom ? (
          <button
            type="button"
            aria-label="定位到底部"
            title="定位到底部"
            className="absolute bottom-full left-1/2 z-10 mb-3 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-accent"
            onClick={() => contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' })}
          >
            <ArrowDown className="size-5" />
          </button>
        ) : null}
        <div className={`mx-auto w-full ${footerClassName}`}>
          {footer}
          {disclaimer ? <p className="mt-2 text-center text-xs tracking-[0.12px] text-muted-foreground">{disclaimer}</p> : null}
        </div>
      </footer>
    </div>
  )
}
