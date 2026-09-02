import * as React from 'react'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * 助手式 Copilot 布局外壳。
 * 对应设计文档：references/patterns/copilot-shell.md
 *
 * 结构：左侧资源/项目区（可选）+ 中间主工作区（主区域，最小宽度优先于对话区）+ 右侧对话辅助区。
 * AI 是配角：与沉浸式相反，响应式收窄时先退让对话辅助区，主工作区始终优先保留可用宽度。
 *
 * ⚠️ 生成层级铁律：新增内容只在 `resourcePanel` / `children`（主工作区）/ `assistant`（对话辅助区）
 * 插槽内变化，不要修改本组件的三栏结构本身（除非用户明确要求）。
 */

export type AssistantMode = 'panel' | 'floating' | 'overlay-drawer' | 'side-drawer'

export interface CopilotShellProps {
  /** 左侧资源/项目区内容。省略则不渲染。 */
  resourcePanel?: React.ReactNode
  /** 中间主工作区内容（主区域，最小宽度 320px，design.md 2.2）。 */
  children: React.ReactNode
  /** 右侧对话辅助区内容。 */
  assistant?: React.ReactNode
  /** 对话辅助区是否展开。 */
  assistantOpen?: boolean
  onAssistantClose?: () => void
  onAssistantOpen?: () => void
  /** 子类型：三栏并列(panel,默认) / 浮窗 / 浮层抽屉 / 侧边抽屉。见 design.md 2.3。 */
  assistantMode?: AssistantMode
  className?: string
}

export function CopilotShell({
  resourcePanel,
  children,
  assistant,
  assistantOpen = true,
  onAssistantClose,
  onAssistantOpen,
  assistantMode = 'panel',
  className,
}: CopilotShellProps) {
  const [resourceCollapsed, setResourceCollapsed] = React.useState(false)

  return (
    <div className={cn('flex h-screen w-screen overflow-hidden bg-background-desktop', className)}>
      {resourcePanel ? (
        <aside
          className={cn(
            'hidden shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar transition-all duration-200 md:flex',
            resourceCollapsed ? 'w-0' : 'w-60 min-w-[240px]',
          )}
        >
          {!resourceCollapsed ? resourcePanel : null}
        </aside>
      ) : null}

      {/* 中间主工作区：主区域，最小宽度 320px，优先级高于对话辅助区（design.md 2.2） */}
      <main className="relative flex min-w-[320px] flex-1 flex-col overflow-hidden">
        {resourcePanel ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={resourceCollapsed ? '展开资源区' : '收起资源区'}
            onClick={() => setResourceCollapsed((v) => !v)}
            className="absolute top-2 left-2 z-10 hidden md:flex"
          >
            {resourceCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </Button>
        ) : null}
        {children}
      </main>

      {/* 右侧对话辅助区：三栏并列时最小宽度 440px，是"退让"的一方（design.md 2.2） */}
      {assistant && assistantMode === 'panel' ? (
        <aside
          className={cn(
            'hidden shrink-0 flex-col overflow-hidden border-l border-border bg-card transition-all duration-200 md:flex',
            assistantOpen ? 'w-[420px] min-w-[380px]' : 'w-0',
          )}
        >
          {assistantOpen ? (
            <>
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
                <span className="text-sm font-medium text-foreground">AI 辅助</span>
                <Button variant="ghost" size="icon-sm" aria-label="收起对话辅助区" onClick={onAssistantClose}>
                  <X className="size-4" />
                </Button>
              </div>
              <div className="flex flex-1 flex-col overflow-hidden">{assistant}</div>
            </>
          ) : null}
        </aside>
      ) : null}

      {/* 浮层抽屉 / 侧边抽屉：压缩主页面空间，与主页面共用顶部导航或左右布局 */}
      {assistant && (assistantMode === 'overlay-drawer' || assistantMode === 'side-drawer') && assistantOpen ? (
        <div
          className={cn(
            'fixed top-0 right-0 z-20 flex h-full w-[420px] min-w-[380px] flex-col border-l border-border bg-card shadow-xl',
          )}
        >
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="text-sm font-medium text-foreground">AI 辅助</span>
            <Button variant="ghost" size="icon-sm" aria-label="关闭" onClick={onAssistantClose}>
              <X className="size-4" />
            </Button>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">{assistant}</div>
        </div>
      ) : null}

      {/* 浮窗：可拖拽尺寸/位置，遮挡原内容（demo 用固定定位简化，不遮挡对照场景不要用浮窗） */}
      {assistant && assistantMode === 'floating' && assistantOpen ? (
        <div className="fixed right-6 bottom-6 z-20 flex h-[520px] w-[380px] flex-col rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="text-sm font-medium text-foreground">AI 辅助</span>
            <Button variant="ghost" size="icon-sm" aria-label="关闭" onClick={onAssistantClose}>
              <X className="size-4" />
            </Button>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">{assistant}</div>
        </div>
      ) : null}

      {!assistantOpen && assistant ? (
        <Button
          variant="outline"
          size="icon"
          aria-label="展开 AI 辅助"
          onClick={onAssistantOpen}
          className="fixed right-4 bottom-6 z-10 shadow-md"
        >
          <PanelLeftOpen className="size-4 rotate-180" />
        </Button>
      ) : null}
    </div>
  )
}
