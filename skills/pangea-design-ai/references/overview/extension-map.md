---
name: agent-ux-extension-map
description: "共享 conversation、沉浸式 rich implementation 与 Copilot shell 的精确扩展点地图。"
user-invocable: false
---

# 扩展点地图

先完成 SKILL 的配置/扩展判定。三层的边界是：共享域提供跨形态的轻量对话语义；沉浸式模板实现完整工作台体验；Copilot 壳层只把中立产物路由到左侧工作区。相同的组件名称不表示 props 或数据契约相容。

| 需求 | 改这里 | 不要碰 |
|---|---|---|
| 跨形态完整对话 section（rich Flow、rich Composer、滚动/Footer、草稿） | `packages/agent-ui/src/immersive/agent-layout/conversation-section.tsx`；Agent `ConversationPage` 与 `CopilotApp` 共同消费 | 在 Copilot 新建轻量 Flow/Composer；把 Header、Panel 或 Canvas 状态放入 section |
| 跨形态对话视口、滚动定位、Footer、AI 声明 | `packages/agent-ui/src/conversation/conversation-surface.tsx`，只由 `ConversationSection` 等组合器消费 | 在页面复制滚动容器；把 Panel/Canvas 状态放入 Surface |
| 轻量消息、浅层执行、基础 Composer、中立 `ArtifactRouter`、产品块 renderer | `packages/agent-ui/src/conversation/` | `PanelView`、`PanelTab`、`ImageView`、Copilot canvas、富澄清与 L1/L2/L3 |
| 共享产物语义 | `packages/agent-ui/src/conversation/types.ts` 的 `ArtifactTarget` | 任一形态专属 Panel、图片蒙层或 Canvas 字段 |
| 共享产品专属对话块 | 产品 `renderProductBlock` registry；校验 payload 后用 `ProductBlockContext.onAction` 回写，renderer 缺失或返回空时安全跳过 | 将未知块降级为 Markdown；导入沉浸式私有回复组件；把 local `data` renderer 当作 shared `payload` renderer |
| 富 Composer、内联标签、实体附件、连接器、专家或录音 | `templates/immersive-starter/src/components/agent-layout/composer.tsx` 与其 registry | 共享 `conversation/composer.tsx` 的 props |
| 沉浸式身份开场、L1/L2/L3、澄清、富附件、消息操作与产品块结果 | `templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx`；卡片适配在 `product-block-renderer.tsx`，由 rich Flow 本地拥有 action 结果 | shared `ConversationFlow` 的轻量 scene 与 props；把结果状态放回卡片 |
| 待批准阻断（等待提示、输入禁用、会话标签、批准/拒绝收尾） | 场景轮的 `awaitingApproval` 与 `approvalOutcomes`（`conversation-data.ts`）+ `Conversation.approvalStatus`；状态由 `agent-shell.tsx` 更新，`conversation-page.tsx` 分发给 rich Flow 与 Composer `disabled` | 把审批状态放进 shared `ConfirmCard`；用卡片文案、按钮名或块 ID 推断待决；复用 Composer 的 `recording` 表达业务禁用 |
| 新增一个可被用户说出来触达的对话场景 | `conversation-data.ts` 的 `conversationScenes` 新增条目，**并配 `trigger.patterns`**（专属动词短语；跨场景不得重复或互为子串）；首屏推荐语应命中某个 trigger | 只写场景不配 trigger（只能从侧栏进入）；用「出差」「费用」这类宽泛词；在 `agent-shell.tsx` 里加业务分支做匹配 |
| 已有沉浸式面板的内容 | `templates/immersive-starter/src/components/agent-layout/panel-data.ts` | panel 类型、container 或 registry；除非真的新增容器类型 |
| 新沉浸式面板容器类型 | `panel-types.ts`、`panel-containers.tsx`、`panel-registry.ts` | 仅改 `panel-data.ts` 后假定 renderer 自动存在 |
| 沉浸式产物展示 | `templates/immersive-starter/src/components/agent-layout/{agent-shell,panel-*,image-viewer}.tsx` | 共享对话域中的容器分支 |
| Copilot 产物展示与产品块 action 回写 | `skills/pangea-design-ai/templates/copilot-starter/src/pages/ContractReview.tsx` 的 `artifact` state、`routeArtifact={setArtifact}` 与 `onProductBlockAction`；传给 `packages/agent-ui/src/copilot/copilot-app.tsx` 的 `workspace` | 沉浸式 `ArtifactPanel`、右侧产物 Tab；把 action 结果写入 shared panel/canvas |
| Copilot 辅助区三态与收起入口 | `packages/agent-ui/src/copilot/copilot-app.tsx` 与 `CopilotConfig.assistantView/defaultAssistantView/onAssistantViewChange/collapsedMode`；顶部重开入口用 `renderTopNavigationAssistantTrigger`；Composer 收起入口复用 rich `Composer` | 业务页面复制壳层；继续新增旧 `assistantMode`；同时显示多个收起入口；在 Copilot 引入沉浸式 panel |
| Copilot 左侧工作区导航 | `packages/agent-ui/src/copilot/copilot-navigation.tsx` 与 `CopilotConfig.navigation`；对话维度复用 `ConversationHistoryList`，内容维度使用 `CopilotContentItem` | 在页面中复制第二套对话列表；把内容列表硬编码进 `copilot-app.tsx`；把导航切换做成右侧 Copilot 的模式菜单 |
| Copilot 中央内容区 Header | `packages/agent-ui/src/copilot/copilot-workspace-header.tsx`、`packages/agent-ui/src/immersive/agent-layout/pill-button.tsx` 与 `CopilotConfig.workspace`；页面只提供面包屑和分享/置顶/导出回调 | 在业务页面复制 Header、面包屑或更多菜单；把内容区操作放进右侧对话 Header；另造非 PillButton 的 Header 操作 |
| 产品身份、导航、欢迎专家/推荐 | `skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/app-config.ts` 的 `AppConfig` | 用 AppConfig 代替业务场景、面板容器或产品块扩展 |

## 必守边界

- **shared rich section**：`ConversationSection` 是 Agent/Copilot 的默认完整对话区，直接复用 rich Flow/Composer 与 `ConversationSurface`；两形态只适配 artifact 路由和壳层 Header。
- **shared lightweight compatibility**：`conversation/` 下的轻量 Flow/Composer 只兼容既有独立消费方，不得再作为 Copilot 默认实现。
- **immersive shell**：`ConversationPage` 只保留标题/导航等 Header 和会话 adapter；Panel/ImageViewer 生命周期仍在 AgentShell，不进入共享 section。
- **Copilot shell**：只使用 `sidebar | floating | collapsed` 三态；`collapsed` 通过 `collapsedMode` 互斥选择顶部导航、浮动按钮或 Composer；sidebar 在桌面始终贴边停靠；`routeArtifact(target)` 只更新主画布。

产物是否可点击只由是否存在用户可查看的 `ArtifactTarget` 决定。沉浸式将其适配为 Tab/图片蒙层；Copilot 映射到左侧画布。三者共享语义，不共享容器。
