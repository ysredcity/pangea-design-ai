---
name: agent-ux-icon-registry
description: "沉浸式导航与上下文对象到 Lucide 图标的统一注册表。"
user-invocable: false
meta:
  id: icon-registry
  kind: contract
  layer: registry
  title: 图标注册表 Icon Registry
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/icon-registry.ts
  whenToUse: [新增或复用导航与上下文对象图标, 保持跨区域视觉一致]
  whenNotToUse: [在组件 JSX 中临时映射对象图标, 使用非 Lucide 图标]
  composeWith: [AgentSidebar, Composer, MessageContext]
  composeBoundary: [注册表只映射对象到图标，Tooltip 与 aria-label 由实际交互控件提供]
  pitfalls: [用展示文案替代稳定 key, 侧栏和 Composer 为同对象使用不同图标, JSX 内硬编码映射]
  designRules: [design.md#23-上下文与能力对象, design.md#64-图标, design.md#65-无障碍]
---

# 图标注册表 Icon Registry

## 选型
对象跨侧栏、Composer、菜单与消息出现时，图标只能从此注册表取得，确保同一对象始终保持同一视觉语言。该文件使用 Lucide，不是组件内临时 `switch` 或文字映射的位置。

## 事实源与 API
公开导出 `ContextType`、`navigationIcons` 与 `contextIcons`。`ContextType` 当前为 `upload`、文件库、最近的对话、专家、技能、连接器；`contextIcons` 是该联合到 `LucideIcon` 的完整映射。`navigationIcons` 以稳定导航 visual key 映射当前 `newConversation`、`capabilityHub`、`scheduledTask`、`fileLibrary`。

## 结构、状态与无障碍
注册值是 Lucide 组件而非已渲染节点，消费者可在语义容器内控制尺寸。只含图标的按钮仍必须由消费者提供 `aria-label` 和 Tooltip；图标本身不承担状态含义，运行中、未读或等待回复还需 Spinner、文字或形状。

## 组合边界
`AgentSidebar` 读取 `navigationIcons[item.visualKey]`；Composer/消息上下文使用 `ContextType` 选择 `contextIcons`。文件扩展名和专家/产品头像不归本表，见 [Resource Visuals](resource-visuals.md)。不要让侧栏、Composer、菜单、消息各自写一个对象→图标映射。

## 扩展方式
新增可见对象时先定义稳定 key/联合成员，再在此一次性注册 Lucide 图标，并让所有消费者复用该 key。若对象是文件类型或专家，改 `resource-visuals.tsx` 的专属映射。

## 常见坑
- 用可翻译 label 作为持久 key。
- 在 JSX 根据对象名称条件选择图标。
- 只替换某一区域的图标，造成同对象跨区域不一致。