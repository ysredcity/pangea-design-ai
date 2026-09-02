import { FileText, Folder } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface ResourceFile {
  id: string
  name: string
}

/** 左侧资源/项目区内容（助手式布局外壳的可选插槽）。文件/图层/数据源/业务对象列表。 */
export function ResourcePanel({
  files,
  activeId,
  onSelect,
}: {
  files: ResourceFile[]
  activeId?: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex h-full flex-col pt-3">
      <div className="flex items-center gap-2 px-4 pb-3">
        <Folder className="size-4 text-sidebar-foreground" />
        <span className="text-sm font-semibold text-sidebar-foreground">合同文件</span>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {files.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelect(f.id)}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
              activeId === f.id
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/60',
            )}
          >
            <FileText className="size-3.5 shrink-0" />
            <span className="truncate">{f.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
