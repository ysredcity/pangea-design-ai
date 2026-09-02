import * as React from 'react'
import { PanelRightClose, PanelRightOpen, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * 沉浸式 Agent 布局外壳。
 * 对应设计文档：references/patterns/immersive-shell.md
 *
 * 结构：左侧对话管理菜单栏（可选）+ 中间对话流（主区域）+ 右侧独立面板（按需打开）。
 *
 * ⚠️ 生成层级铁律：新增场景/内容只在 `children`（对话流）与 `panel`（面板内容）插槽内变化，
 * 不要修改本组件的三栏结构本身（除非用户明确要求）。
 */

export interface ImmersiveShellProps {
  /** 左侧对话管理菜单栏内容。省略则不渲染左侧栏（单一场景/单一智能体产品可省略）。 */
  sidebar?: React.ReactNode
  /** 中间对话流内容（主区域，不可被压缩至不可读）。 */
  children: React.ReactNode
  /** 右侧独立面板内容。由制品卡片点击驱动，非常驻——通过 panelOpen 受控。 */
  panel?: React.ReactNode
  /** 右侧面板是否打开。 */
  panelOpen?: boolean
  /** 关闭右侧面板的回调。 */
  onPanelClose?: () => void
  /** 面板标题（用于面板头部展示）。 */
  panelTitle?: string
  className?: string
}

export function ImmersiveShell({
  sidebar,
  children,
  panel,
  panelOpen = false,
  onPanelClose,
  panelTitle,
  className,
}: ImmersiveShellProps) {
  return (
    <div className={cn('flex h-screen w-screen overflow-hidden bg-background-desktop', className)}>
      {sidebar ? (
        <aside className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar md:flex">
          {sidebar}
        </aside>
      ) : null}

      {/* 中间对话流：主区域，最小宽度 440px（design.md 2.2） */}
      <main className="flex min-w-[440px] flex-1 flex-col overflow-hidden">{children}</main>

      {/* 右侧独立面板：按需打开，非常驻（design.md 3.5 制品卡片） */}
      {panel ? (
        <aside
          className={cn(
            'hidden shrink-0 flex-col overflow-hidden border-l border-border bg-card transition-all duration-200 md:flex',
            panelOpen ? 'w-[420px] min-w-[320px]' : 'w-0',
          )}
        >
          {panelOpen ? (
            <>
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
                <span className="truncate text-sm font-medium text-foreground">{panelTitle ?? '面板'}</span>
                <Button variant="ghost" size="icon-sm" aria-label="关闭面板" onClick={onPanelClose}>
                  <X className="size-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">{panel}</div>
            </>
          ) : null}
        </aside>
      ) : null}
    </div>
  )
}

/** 移动端/窄屏下用于重新打开面板的悬浮触发按钮（第二降级点，面板已收起为覆盖层）。 */
export function PanelToggleButton({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={open ? '收起面板' : '展开面板'}
      onClick={onToggle}
      className="fixed right-4 bottom-20 z-10 shadow-md md:hidden"
    >
      {open ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
    </Button>
  )
}
