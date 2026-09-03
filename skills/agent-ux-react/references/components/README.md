---
name: agent-ux-components-index
description: "组件文档体系索引。按四层信息模型（委托/对话/过程/产物）+ 壳层 + 注册表六组管理组件，明确 shared conversation、immersive rich implementation 与 Copilot shell 的事实源边界。"
user-invocable: false
---

# 组件文档体系索引

## 分组方式

按 [design.md 0.2 的四层信息模型](../design.md#02-产品心智模型与四层信息分层) 分组，另加壳层与注册表两组基础设施。**不用 `data-display / data-entry / feedback` 这类通用 UI 分类**——四层模型让组件目录与设计方法论同构，agent 完成[第七章决策流程](../design.md#七扩展新能力的决策流程)第 1 问后可直接落到对应目录，先复用再新建。

| 目录 | 信息层 | 职责 | 失职表现 |
|---|---|---|---|
| [delegation/](delegation/) | 委托层 | 让用户低成本说清要什么、带什么上下文、由谁来做 | 用户不知道能带什么进来 |
| [conversation/](conversation/) | 对话层 | 承载语义：我问了什么、它答了什么 | 过程噪音淹没结论 |
| [process/](process/) | 过程层 | 建立可信度：拆解、动作、依据 | 只有 Spinner，无法判断是否可信 |
| [artifact/](artifact/) | 产物层 | 让产出可查看、可带走 | 结论提到了某份资料，但打不开 |
| [shell/](shell/) | —（基础设施） | 布局壳层与导航 | — |
| [registry/](registry/) | —（基础设施） | 注册表与视觉映射 | — |

底层基础件（shadcn v4 / Base UI）不做逐组件 API 镜像，只有一份 [base-inventory.md](base-inventory.md)。它只盘点沉浸式模板的基础件，不是 `@agent-ux/agent-ui` 的 public API；理由见 [metadata schema](../overview/metadata-schema.md#与-pangea-design-skill-的两处刻意差异)。

## 实现层与事实源

组件文档先判断事实源，而非凭组件名猜测 API：

| 实现层 | 事实源 | 可承载的内容 | 不可承载的内容 |
|---|---|---|---|
| **shared** | `packages/agent-ui/src/conversation/` | 轻量消息、浅层执行、基础 Composer、中立 `ArtifactTarget` / `ArtifactRouter`、产品块 renderer | Panel/Image adapter、Tab、Canvas、富澄清、L1/L2/L3 |
| **immersive** | `templates/immersive-starter/src/components/agent-layout/` | 富 Composer、内联标签、附件、连接器、L1/L2/L3、澄清、右侧面板/图片 adapter | 强迫 Copilot 采用右侧产物容器 |
| **copilot** | `packages/agent-ui/src/copilot/` 或 Copilot 产品装配页 | Copilot 壳层与 `routeArtifact(target)` 到左侧工作画布 | 沉浸式 Panel Tab 或 ImageViewer |
| **产品块 adapter** | immersive local renderer 或 Copilot 产品页 renderer | 在校验后将形态专属 block 数据适配为 shared 卡片，并消费 `ProductBlockContext.onAction` | 将 local `data` renderer 与 shared `payload` renderer 视为可互换 API |

**同名不等于兼容。** shared 与 immersive 都有 `Composer` 和 `ConversationFlow`：共享版是轻量中立 API，沉浸式版是丰富模板实现；其 props、场景数据、artifact target 和 product-block context 都不能假定可互换。选择实现与扩展入口时先查 [extension-map](../overview/extension-map.md)。

## 公共导出 vs 内部实现

每份文档的 `meta.exported` 标注组件是否为公共导出，这决定 agent 的行为边界：

| `exported` | agent 可以 | agent 不可以 |
|---|---|---|
| `true` | 在自己的页面里直接 import 并组合 | — |
| `false` | 改宿主文件本身（属于修改壳层内部） | 直接 import；**必须在需求文档说明修改理由** |

⚠️ **该字段必须以实际导出结果为准，不能照抄上游交接文档。** `AgentResponseBlock`、`ConversationTurn`、`AssistantContinuation` 是沉浸式 `conversation-flow.tsx` 的文件内私有实现。

## 每份组件文档的固定结构

```markdown
---
name: agent-ux-<组件名>
description: "..."
user-invocable: false
meta:
  id: execution-action-badge
  kind: component | contract | pattern
  layer: process
  title: 动作 Badge ExecutionActionBadge
  exported: true
  source: 实际源码路径
  whenToUse: [...]
  whenNotToUse: [...]
  composeWith: [...]
  composeBoundary: [...]
  pitfalls: [...]
  designRules: [design.md#锚点]
---

# 标题
## 选型
## 事实源与 API
## 结构、状态与无障碍
## 组合边界
## 扩展方式
## 常见坑
```

`kind: contract` 写类型成员、生产者、消费者及禁止跨层字段，不能虚构渲染 API。字段规范见 [metadata-schema.md](../overview/metadata-schema.md)。

## 写作要求

1. **API 必须逐个核对源码**，不能复述历史 `HANDOFF.md` 或旧 Radix 文件。
2. **设计规则不在组件文档重复正文**，只在 `designRules` 给锚点，并在正文给链接结论；唯一事实源是 [design.md](../design.md)。
3. **`pitfalls` 优先收录实测记录**，不要凭推理编造。
4. **不写 Figma 节点索引、未提交改动提醒等项目特定内容**；读者是生成新产品的 agent，不是模板维护者。

## 组件清单与进度

> 状态：**Phase 3 批次 A、B、C、D 已完成。** 正文已基于真实 shared、immersive 与 Copilot 源码覆盖现有组件/契约；每份叶子文档由 `npm run check:component-docs` 验证 metadata、事实源路径和设计规则路径。源文件列均标注实现层，避免同名 API 混淆。

### delegation/ — 委托层

| 组件 | 实现层 / exported | 事实源 | 文档 |
|---|---|---|---|
| `Composer` 意图输入区 | shared + immersive / ✅ | `packages/agent-ui/src/conversation/composer.tsx`；`templates/immersive-starter/.../composer.tsx` | [已完成](delegation/composer.md) |
| `NewConversationPage` 新对话页与推荐区 | immersive / ✅ | `templates/immersive-starter/.../new-conversation-page.tsx` | [已完成](delegation/new-conversation-page.md) |

### conversation/ — 对话层

| 组件或契约 | 实现层 / exported | 事实源 | 文档 |
|---|---|---|---|
| 共享对话契约 | shared / ✅ | `packages/agent-ui/src/conversation/types.ts` | [已完成](conversation/conversation-contracts.md) |
| `ConversationFlow` 对话流 | shared + immersive / ✅ | `packages/agent-ui/src/conversation/conversation-flow.tsx`；`templates/immersive-starter/.../conversation-flow.tsx` | [已完成](conversation/conversation-flow.md) |
| `UserMessage` / `AgentIdentity` / `AssistantMessage` | immersive / ✅ | `templates/immersive-starter/.../conversation-flow.tsx` | [UserMessage](conversation/user-message.md) · [AgentIdentity](conversation/agent-identity.md) · [AssistantMessage](conversation/assistant-message.md) |
| `AgentResponseBlock` / `ConversationTurn` / `AssistantContinuation` | immersive / ❌ 私有 | `templates/immersive-starter/.../conversation-flow.tsx` | [AgentResponseBlock](conversation/agent-response-block.md) · [ConversationTurn](conversation/conversation-turn.md) · [AssistantContinuation](conversation/assistant-continuation.md) |
| `ClarificationFormCard` / 消息操作 / Markdown / 内联标签 | immersive / ✅ | `templates/immersive-starter/src/components/agent-layout/` | [ClarificationFormCard](conversation/clarification-form-card.md) · [Message Actions](conversation/message-actions.md) · [MarkdownContent](conversation/markdown-content.md) · [Inline Tag](conversation/inline-tag.md) · [Message Context](conversation/message-context.md) |
| `ConfirmCard` / `ErrorState` / `FollowUpSuggestions` / `RecommendationList` | shared / ✅ | `packages/agent-ui/src/conversation/{confirm-card,error-state,follow-up-suggestions,recommendation-list}.tsx` | [ConfirmCard](conversation/confirm-card.md) · [ErrorState](conversation/error-state.md) · [FollowUpSuggestions](conversation/follow-up-suggestions.md) · [RecommendationList](conversation/recommendation-list.md) |

### process/ — 过程层

| 组件 | 实现层 / exported | 事实源 | 文档 |
|---|---|---|---|
| `ExecutionProcess` / `FlatExecutionFlow` / `TaskBlock` / `ExecutionStep` / `ExecutionActionBadge` / `ReasoningPanel` | immersive / ✅ | `templates/immersive-starter/.../conversation-flow.tsx` | [ExecutionProcess](process/execution-process.md) · [Flat Flow](process/flat-execution-flow.md) · [TaskBlock](process/task-block.md) · [ExecutionStep](process/execution-step.md) · [Action Badge](process/execution-action-badge.md) · [ReasoningPanel](process/reasoning-panel.md) |

### artifact/ — 产物层

| 组件或契约 | 实现层 / exported | 事实源 | 文档 |
|---|---|---|---|
| 中立 `ArtifactTarget` / `ArtifactRouter` | shared / ✅ | `packages/agent-ui/src/conversation/types.ts` | [共享契约](conversation/conversation-contracts.md) |
| `PanelView` / `ImageView` / `PanelTab` / `panelViewKey` | immersive / ✅ | `templates/immersive-starter/.../panel-types.ts` | [Panel Types](artifact/panel-types.md)（展示 adapter，不是共享契约） |
| 容器 registry、文件元信息 | immersive / ✅ | `templates/immersive-starter/src/components/agent-layout/panel-registry.ts`；`file-meta.ts` | [Panel Registry](artifact/panel-registry.md) · [File Meta](artifact/file-meta.md) |
| `ArtifactPanel`、检索/浏览器/文件预览容器、`ImageViewer` | immersive / ✅ | `templates/immersive-starter/src/components/agent-layout/` | [ArtifactPanel](artifact/artifact-panel.md) · [Search](artifact/container-search-results.md) · [Browser](artifact/container-browser.md) · [File Preview](artifact/container-file-preview.md) · [ImageViewer](artifact/image-viewer.md) |
| 左侧工作画布路由 | copilot / 页面装配 | `templates/copilot-starter/src/pages/ContractReview.tsx` 的 `artifact` state + `routeArtifact={setArtifact}` | [Extension Map](../overview/extension-map.md) |

### shell/ — 壳层与导航

| 组件 | 实现层 / exported | 事实源 | 文档 |
|---|---|---|---|
| `AgentShell` / `ChatWorkspace` / `ConversationPage` / `AgentSidebar` | immersive / ✅ | `templates/immersive-starter/src/components/agent-layout/` | [AgentShell](shell/agent-shell.md) · [ChatWorkspace](shell/chat-workspace.md) · [ConversationPage](shell/conversation-page.md) · [AgentSidebar](shell/agent-sidebar.md) |
| Copilot shell 与辅助区 | copilot / ✅ | `packages/agent-ui/src/copilot/copilot-app.tsx` + 产品装配页 | [Extension Map](../overview/extension-map.md) |

### registry/ — 注册表与视觉映射

| 组件 | 实现层 / exported | 事实源 | 文档 |
|---|---|---|---|
| 图标注册表、资源视觉映射、`IconButton` | immersive / ✅ | `templates/immersive-starter/src/components/agent-layout/` | [Icon Registry](registry/icon-registry.md) · [Resource Visuals](registry/resource-visuals.md) · [IconButton](registry/icon-button.md) |

## 数据模型（不在本目录，单独归属）

沉浸式 `conversation-data.ts` 的 `*Data` 类型属于剧本数据契约，后续归剧本引擎文档；不要与 shared `ConversationScene`、`ConversationTurn`、`AssistantMessage` 或 `ExecutionStep` 混写。

## 共享域边界

shared `ArtifactTarget` 是中立交付物语义；沉浸式将它适配为右侧容器或图片查看器，Copilot 用 `routeArtifact(target)` 更新左侧画布。共享目标没有 `PanelView`、`PanelTab` 或 Canvas 类型。

产品块位于 assistant 正文/附件之后、续流程之前。共享域仅调用可选 renderer：缺失或返回空时安全跳过，并将 `ProductBlockContext.onAction` 传回形态层；产品若需定位未知 type，可在自身 registry 中加入开发期告警。沉浸式本地 renderer 以 `data` 和 rich context 适配，Copilot renderer 以 shared `payload` 和 `onAction` 适配，二者不能互换。Copilot action 经 `routeArtifact` 只更新左侧画布；shared 不含 panel/canvas。沉浸式私有回复结构不能直接组合。
