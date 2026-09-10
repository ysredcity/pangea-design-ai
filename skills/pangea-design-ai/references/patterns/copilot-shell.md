---
name: agent-ux-copilot-shell
description: "助手式 Copilot 界面形态的布局外壳规范：资源区、主工作画布与 sidebar/floating/collapsed 三态 AI 对话辅助区，并支持三种收起入口。"
user-invocable: true
meta:
  id: copilot-shell
  kind: layout-shell
  title: 助手式 Copilot 布局外壳
  status: stable
  whenToUse: [IDE, 设计工具, BI, 合同审阅, 低代码搭建, 围绕画布代码表格设计稿持续操作且AI辅助不想离开主工作区]
  whenNotToUse: [用自然语言表达目标等待结果→沉浸式 Agent, 轻量即时局部增强→嵌入式]
  keyStructure: [左侧资源或项目区, 中间主工作区, AI对话辅助区]
  variants: [侧边栏, 浮动窗口, 收起到顶部导航, 收起到浮动按钮, 收起到 Composer]
  composeWith: [agent-ui/conversation-surface, agent-ui/conversation-flow, agent-ui/composer, agent-ui/confirm-card]
  composeBoundary: [AI是配角不能压缩主工作区到不可用, 产物只更新主画布不引入沉浸式Panel]
  pitfalls: [不要复制第二套对话容器, 不要同时显示顶部与右下两个重开入口, 不要在移动端隐藏AI入口]
  previewRoute: /
  source: packages/agent-ui/src/copilot/copilot-app.tsx
  tags: [布局, 助手式, 侧边栏, 浮窗, 收起]
---

# 助手式 Copilot 布局外壳

对应 [design.md 2.1](../design.md#21-界面形态选型) 与 [2.3](../design.md#23-助手式布局子类型选择)。AI 是辅助角色，主工作画布和业务对象始终拥有更高空间优先级。

## 左侧工作区导航

Copilot 左侧导航可同时承载全局页面入口与两类工作数据：报表（可包含报表、文档、画布）和对话。使用 `CopilotNavigation`，报表/对话通过分段 Tab 切换；对话列表直接复用 Agent 的 `ConversationHistoryList`，内容列表使用配置化的 `CopilotContentItem`。`kind` 只描述内容业务类型，不限制列表能力；所有内容项均支持置顶/取消置顶。全局“主页、报表中心、战略驾驶舱”三个入口统一使用 shadcn `Button` 的 `large`（项目 API 为 `size="lg"`）尺寸，其中“主页”使用 `outline` 变体，其余入口按默认导航样式呈现。左侧导航默认 240px，收起后主工作区扩展，不影响右侧 Copilot 状态。

## 中央内容工作区 Header

中央工作区必须由壳层统一渲染 `CopilotWorkspaceHeader`，位于左侧导航与右侧 Copilot 之间，不覆盖任一侧栏。Header 高度 52px，底部使用语义边框，左右内边距 16px。左侧优先使用多级面包屑（层级超过 4 级时中间层折叠为省略号），当前层级使用 foreground，其余层级使用 muted；右侧操作栏固定为「分享、更多」，更多菜单仅提供「置顶/取消置顶、导出」。置顶能力与内容类型解耦，分享/置顶/导出均通过产品配置回调执行。

```tsx
<CopilotApp
  config={{
    ...config,
    workspace: {
      breadcrumbs: [
        { id: 'reports', label: '报表中心' },
        { id: 'current', label: '集团精益人才认证分析', current: true },
      ],
      onShare: () => {},
      onPinnedChange: (pinned) => {},
      onExport: () => {},
    },
  }}
  workspace={<ReportWorkspace />}
/>
```

Header 的纯图标按钮必须提供 `aria-label` 与 Tooltip；统一使用 `PillButton`（基于 shadcn `Button` 的 `ghost + sm`，28px 紧凑胶囊按钮）。移动端触控目标再按无障碍规范扩展至至少 44px。工作区正文自行负责报表、文档或画布的 GUI 交互，产物路由只更新正文，不引入沉浸式右侧产物面板。

## 结构与三态

```text
┌───────────┬─────────────────────────┬──────────────┐
│ 工作区导航  │        主工作画布          │ AI 对话辅助区 │
│ 240px      │       min-width: 0      │ sidebar 400 │
└───────────┴─────────────────────────┴──────────────┘
```

`CopilotAssistantView` 只有三个真实状态：

| 状态 | 规格 | 行为 |
|---|---|---|
| `sidebar` | 桌面右侧固定 400px、全高、左边框；Header 52px | 与画布并排，桌面宽度下始终贴边停靠，不呈现圆角或阴影 |
| `floating` | 400×600px，距右/下 16px，16px 圆角，语义边框与 xl 阴影 | 覆盖画布但不改变画布布局 |
| `collapsed` | 对话区不显示 | 由 `collapsedMode` 决定唯一重开入口：顶部导航、右下 44×44px 浮动按钮，或主工作区底部 Composer |

Header 操作固定按「新对话、历史对话、切换对话模式、关闭」排列。切换模式下拉菜单只包含“侧边栏、浮动”；三种收起入口不是运行时选项，而是产品级配置。关闭进入 `collapsed`。全部图标操作必须有可访问名称与 Tooltip。收起态只显示当前配置的一种入口。

## 状态 API

事实源是 `packages/agent-ui/src/copilot/copilot-config.ts` 与 `copilot-app.tsx`：

```ts
type CopilotAssistantView = 'sidebar' | 'floating' | 'collapsed'
type CopilotCollapsedMode = 'top-navigation' | 'floating-button' | 'composer'

type CopilotConfig = {
  assistantView?: CopilotAssistantView
  defaultAssistantView?: CopilotAssistantView
  onAssistantViewChange?: (view: CopilotAssistantView) => void
  collapsedMode?: CopilotCollapsedMode
  onNewConversation?: () => void
  onOpenHistory?: () => void
  onShare?: () => void
  onOpenSettings?: () => void
}
```

- `assistantView` 存在时为受控模式；否则由 `defaultAssistantView` 初始化内部状态。
- Header 的新对话、历史、分享、设置分别调用同名配置回调；壳层不伪造业务数据。
- `collapsedMode` 决定收起后的唯一入口：`top-navigation` 优先调用 `renderTopNavigationAssistantTrigger`（未提供时使用内置顶部按钮）；`floating-button` 显示右下浮动按钮；`composer` 在主工作区底部复用 rich `Composer`，发送后打开对话并保留草稿。
- `collapsedMode` 应在产品配置入口固定一次；同一产品的所有页面使用同一值，不能暴露为用户运行时的模式切换项。
- 旧 `assistantMode: panel | floating | overlay-drawer | side-drawer` 仅用于 v0.2.0 生成工程兼容：`floating → floating`，其余 → `sidebar`。新工程不得继续写旧值。
- 草稿与发送后的本地消息由共享 `ConversationSection` 持有，侧边栏/浮动切换不创建第二套 Flow 或 Composer。

## 共享完整对话 Section

Copilot 和沉浸式共同消费 `packages/agent-ui/src/immersive/agent-layout/conversation-section.tsx`。它直接组合 Agent 中间区域的 rich `ConversationFlow`、rich `Composer` 和 shared `ConversationSurface`，统一：

- Markdown、身份、L1/L2/L3、澄清、审批、附件和消息操作；
- 文件/上下文/专家/连接器/录音能力的 rich Composer；
- 可滚动内容视口、定位到底部、Footer 与“以上内容由AI生成”；
- 草稿与当前 section 内补发的用户消息。

两种形态只保留壳层 adapter：沉浸式把 artifact 路由到 Panel/ImageViewer，Copilot 把同一 target 更新到主画布。不得在 Copilot 新建轻量 Flow/Composer，也不得把完整 `AgentShell` 或 Panel Tab 搬入 Copilot。

## 响应式降级

- 宽桌面：`sidebar` 始终按 400px 贴右停靠；`floating` 和 `collapsed` 按各自设计规格呈现。
- 640px 以下移动端：打开对话时占满动态视口；不得使用 `hidden` 让 AI 不可达。
- 不把 `sidebar` 在窄桌面偷偷改成 `floating`；模式改变只能来自用户选择或受控状态。
- 收起态始终保留且只保留一个明显重开入口；三种入口由 `collapsedMode` 互斥选择。

## 产物边界

`routeArtifact(target)` 与产品块 action 只更新中间主画布。Copilot 不使用沉浸式右侧产物 Panel；共享 conversation 域也不包含 Canvas、Panel 或 Tab 字段。

## 与脚手架对应

实际入口是物化后的 `src/agent-ui/copilot/copilot-app.tsx`。产品页提供 `workspace`、`routeArtifact`、场景及可选产品块 renderer。旧 `src/components/layout/CopilotShell.tsx` 已删除，避免形成第二套壳层事实源。
