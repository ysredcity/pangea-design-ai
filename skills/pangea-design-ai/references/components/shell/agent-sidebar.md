---
name: agent-ux-agent-sidebar
description: "沉浸式导航与会话侧栏：消费 AppConfig 导航并管理会话组的局部展开状态。"
user-invocable: false
meta:
  id: agent-sidebar
  kind: component
  layer: shell
  title: 智能体侧栏 AgentSidebar
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/sidebar.tsx
  whenToUse: [显示沉浸式产品导航和会话列表, 以停靠或抽屉方式呈现侧栏]
  whenNotToUse: [拥有会话数据, 用普通导航配置替代新对话动作, 在 JSX 硬编码对象图标]
  composeWith: [AgentShell, AppConfig, iconRegistry, AgentAvatar, IconButton]
  composeBoundary: [会话列表与选择状态由 AgentShell 控制，侧栏只保存分组展开和单项菜单局部状态]
  pitfalls: [把新对话作为普通可配置导航项, 使用展示文案查图标, 未读/等待/运行中只用颜色表达]
  designRules: [design.md#12-首屏与能力识别, design.md#42-状态语言, design.md#64-图标, design.md#65-无障碍]
---

# 智能体侧栏 AgentSidebar

## 选型
`AgentSidebar` 提供沉浸式产品身份、主导航、置顶/普通会话分组和主题控制。它既可停靠也可作为抽屉展示，但不拥有会话集合与活动会话。

## 事实源与 API
文件公开导出 `Conversation`、`initialPinnedConversations`、`initialConversations` 与 `AgentSidebar`。组件接收 `Pick<AppConfig, "identity" | "navigation">`、受控会话数组、活动/已读状态及选择、置顶、重命名、折叠、关闭、主题和新对话回调。内部状态只包含置顶/普通分组的展开状态；每个会话项还局部管理菜单打开与标题截断检测。

`config.navigation` 使用稳定 `id`、`label`、`visualKey`；图标经 [Icon Registry](../registry/icon-registry.md) 的 `navigationIcons[item.visualKey]` 获取。产品身份头像经 `AgentAvatar` 解析，保持侧栏与对话流身份一致。

## 结构、状态与无障碍
`drawer` 会把侧栏从 240px 停靠形态提升为 320px 抽屉，并显示关闭动作；响应式切换由 `AgentShell` 决定。新对话是壳层固定行为：当导航条目 `id === "new-conversation"` 时绑定 `onNewChat`，不要把它降级为任意导航链接。

会话状态有非色彩表达：运行中使用 Spinner，未读是绿点，等待回复显示文字 Badge；`approvalStatus: 'pending'` 显示 destructive 语义的“等待批准”文字 Badge，优先于等待回复。菜单按钮有可访问名和 Tooltip；截断标题仅在溢出时显示完整文本。危险删除项使用 destructive 语义。

## 组合边界
会话选择必须回到 `AgentShell.openConversation()`，以保证清理旧 panel tabs。侧栏不直接路由产物、不渲染对话页，也不管理独立面板。若需扩展视觉，更新 registry 或 resource visuals，禁止在导航/消息 JSX 中复制映射。

## 扩展方式
- 产品身份和导航改 `app-config.ts`，使用稳定 `visualKey`。
- 新增导航图标改 `icon-registry.ts` 并复用同一 key。
- 改会话数据或切换副作用改 `AgentShell`，不要向 `ConversationGroup` 注入全局状态。

## 常见坑
- 用中文 label 作为图标映射键，导致改文案时视觉漂移。
- 从侧栏绕开壳层直接改活动会话。
- 以颜色独自传达未读、运行中或等待回复。