---
name: agent-ux-agent-shell
description: "沉浸式应用壳层：集中管理会话、导航、独立产物面板与本地展示 adapter。"
user-invocable: false
meta:
  id: agent-shell
  kind: component
  layer: shell
  title: 智能体壳层 AgentShell
  exported: true
  source: skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/agent-shell.tsx
  whenToUse: [装配完整沉浸式工作台, 管理会话与独立产物面板状态]
  whenNotToUse: [新增 PanelView 内容, 将沉浸式右侧面板带入 Copilot, 作为共享 conversation API]
  composeWith: [AppConfig, AgentSidebar, ChatWorkspace, ArtifactPanel, ImageViewer]
  composeBoundary: [壳层管理状态和展示 adapter，容器按 panel registry 分派，Copilot 产品页自行 routeArtifact 到左侧画布]
  pitfalls: [切换会话时保留旧 panel tabs, 将 PanelView 分支写回壳层, 混淆 shared 与 immersive 的 ArtifactTarget]
  designRules: [design.md#22-沉浸式-agent-工作台, design.md#35-结果呈现与产物容器, design.md#42-状态语言]
---

# 智能体壳层 AgentShell

## 选型
`AgentShell` 是沉浸式模板的顶层装配与状态归属，不是跨形态公共壳层。需要完整的会话导航、丰富对话区、右侧多 Tab 产物和图片蒙层时使用它；Copilot 使用 `CopilotApp` 与产品页左侧工作区，不复用本壳层。

## 事实源与 API
当前文件仅导出 `AgentShell({ config }: { config: AppConfig })`。`AppConfig` 注入产品身份、导航、欢迎专家/推荐和可选产品块 renderer；业务场景、面板容器和主题不是其配置职责。

壳层拥有活动会话、置顶/普通会话、重命名、已读集合、持久化深色模式、停靠/抽屉侧栏、`panelTabs`、活动 Tab、面板宽度/动画/全屏请求、图片蒙层及拖拽状态。`ChatWorkspace`、`AgentSidebar`、`ArtifactPanel` 只消费回调和所需状态。

产物 router 是沉浸式本地 adapter：`panel-types.ts` 的 `ArtifactTarget = PanelView | ImageView`。`openArtifact()` 将 `image` 交给 `ImageViewer`，其余 `PanelView` 交给 `openPanel()`；`panelViewKey()` 保证同一内容只激活既有 Tab。它不同于 shared conversation 的中立 `ArtifactRouter`，后者没有 panel 或图片字段，须在形态层转换。

## 结构、状态与无障碍
`openConversation()` 是切换会话和回到新对话页的唯一入口：它先更新活动会话，再同步 `closePanel(true)`，清空 tabs、活动 Tab 和全屏请求，防止旧会话产物短暂显示。选中的会话同时标记为已读。图片蒙层状态不属于 panel 清理范围；不能据此声称它会在切换会话时自动关闭。

布局使用 980/740/659 三档：≥980px 面板与停靠侧栏可并列；740–979px 侧栏转 320px 抽屉；<740px 打开的产物面板强制全屏且不提供全屏切换；<660px 主区域取消桌面最小宽度并使用移动侧栏入口。独立面板最小 320px；拖拽还会保留对话区最小 420px。所有纯图标控制都有可访问名，壳层提供 TooltipProvider。

## 组合边界
壳层只编排 `ArtifactPanel` 与其 props，不能出现 `search-results`、`browser`、`file-preview` 等容器分支；新增容器走 panel types → containers → registry。`ChatWorkspace` 选择新对话或对话页，`ConversationPage` 只组合 rich Flow、Composer 与 router。不要把 Copilot 的左侧 canvas 描述成此处右面板或 Tab。

## 扩展方式
- 修改身份、导航、欢迎页专家或推荐，从 `app-config.ts` 的 `AppConfig` 开始。
- 仅替换沉浸式面板内容，改 `panel-data.ts`；新增容器按 [Panel Registry](../artifact/panel-registry.md) 链路扩展。
- 若消费 shared `ArtifactTarget`，在沉浸式产品装配处做显式 adapter，不要把 `PanelView` 字段塞进 shared 数据。

## 常见坑
- 从其他选择会话的入口直接 `setActiveConversation`，绕过旧产物清理。
- 把容器类型判断写进 `AgentShell`，破坏 registry 边界。
- 将本地 `ArtifactTarget` 当作 `packages/agent-ui/src/conversation/types.ts` 的共享类型。