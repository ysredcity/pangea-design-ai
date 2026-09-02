import {
  Blocks,
  Bot,
  CalendarClock,
  FileText,
  FolderOpen,
  MessageSquarePlus,
  MessageSquareText,
  Plug,
  Puzzle,
  type LucideIcon,
} from "lucide-react"

export type ContextType =
  | "upload"
  | "文件库"
  | "最近的对话"
  | "专家"
  | "技能"
  | "连接器"

export const navigationIcons = {
  newConversation: MessageSquarePlus,
  capabilityHub: Blocks,
  scheduledTask: CalendarClock,
  fileLibrary: FolderOpen,
} satisfies Record<string, LucideIcon>

export const contextIcons: Record<ContextType, LucideIcon> = {
  upload: FileText,
  文件库: FolderOpen,
  最近的对话: MessageSquareText,
  专家: Bot,
  技能: Puzzle,
  连接器: Plug,
}
