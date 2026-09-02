---
name: agent-ux-components-index
description: "组件文档体系索引。按四层信息模型（委托/对话/过程/产物）+ 壳层 + 注册表六组管理约 30 个组件，标注公共导出与内部实现，含每份文档的固定结构与写作要求。"
user-invocable: false
---

# 组件文档体系索引

## 分组方式

按 [design.md 0.2 的四层信息模型](../design.md#02-产品心智模型与四层信息分层) 分组，另加壳层与注册表两组基础设施。**不用 `data-display / data-entry / feedback` 这类通用 UI 分类**——四层模型让组件目录与设计方法论同构，agent 走完[第七章决策流程](../design.md#七扩展新能力的决策流程)第 1 问（"它属于哪一层"）后可直接落到对应目录，先看能否复用再决定是否新建。

| 目录 | 信息层 | 职责 | 失职表现 |
|---|---|---|---|
| [delegation/](delegation/) | 委托层 | 让用户低成本说清要什么、带什么上下文、由谁来做 | 用户不知道能带什么进来 |
| [conversation/](conversation/) | 对话层 | 承载语义：我问了什么、它答了什么 | 过程噪音淹没结论 |
| [process/](process/) | 过程层 | 建立可信度：拆解、动作、依据 | 只有 Spinner，无法判断是否可信 |
| [artifact/](artifact/) | 产物层 | 让产出可查看、可带走 | 结论提到了某份资料，但打不开 |
| [shell/](shell/) | —（基础设施） | 布局壳层与导航 | — |
| [registry/](registry/) | —（基础设施） | 注册表与视觉映射 | — |

底层基础件（shadcn v4 / Base UI）**不做逐组件 API 镜像**，只有一份 [base-inventory.md](base-inventory.md)：清单 + 本项目特有约定。理由见 [metadata-schema.md 的差异说明](../overview/metadata-schema.md#与-pangea-design-skill-的两处刻意差异)。

## 公共导出 vs 内部实现

每份文档的 `meta.exported` 字段标注该组件是否为公共导出，这决定 agent 的行为边界：

| `exported` | agent 可以 | agent 不可以 |
|---|---|---|
| `true` | 在自己的页面里直接 import 并组合 | — |
| `false` | 改宿主文件本身（属于修改壳层内部） | 直接 import；**必须在需求文档说明修改理由** |

⚠️ **该字段必须以实际 `grep` 导出结果为准，不能照抄上游交接文档的叙述。** 已实测发现上游文档描述的 `AgentResponseBlock`、`ConversationTurn`、`AssistantContinuation` 三个组件实际是文件内私有实现。

## 每份组件文档的固定结构

```markdown
---
name: agent-ux-<组件名>
description: "..."
user-invocable: false
meta:
  id: execution-action-badge
  kind: component
  layer: process
  title: 动作 Badge ExecutionActionBadge
  exported: true
  whenToUse: [...]
  whenNotToUse: [...]
  variants: [...]
  composeWith: [...]
  composeBoundary: [...]
  pitfalls: [...]
  sizeContract: [高 32px, 最大宽 300px, 全圆角]
  designRules: [design.md#323-有产物的动作才做成可点击资源]
  source: src/components/agent-layout/conversation-flow.tsx
---

# 动作 Badge ExecutionActionBadge

## 选型              ← 何时用 / 别用什么替代
## 结构与视觉契约    ← 已成契约的尺寸与布局规则
## API               ← props / 类型定义（必须核对源码，不能照抄上游文档叙述）
## 状态              ← 对应四种状态语言中的哪些
## 扩展方式          ← 加新类型要改哪里（与 extension-map.md 交叉引用）
## 常见坑            ← 实战记录
```

字段规范见 [metadata-schema.md](../overview/metadata-schema.md)。

## 写作要求

1. **API 一节必须逐个核对源码**。上游交接文档的叙述可能与实际导出不符（已发现三处），只能作为线索，不能作为事实源。
2. **设计规则不在组件文档里重复正文**，只在 `designRules` 里给锚点 + 正文里一句话结论 + 链接。规则正文的唯一事实源是 [design.md](../design.md)。
3. **`pitfalls` 优先收录实战记录**，不要凭推理编造可能的坑。
4. **不写 Figma 节点索引、未提交改动提醒等项目特定内容**——本文档体系的读者是"拿模板生成新产品的 agent"，不是"维护模板的人"。

## 组件清单与进度

> 状态：**骨架已建，正文待写（Phase 3）**。下表的组件名与文件归属基于对上游 `grep -oE "^export (function|const|type|interface)"` 的实测结果。

### delegation/ — 委托层

| 组件 | exported | 源文件 | 文档 |
|---|---|---|---|
| `Composer` 意图输入区 | ✅ | `composer.tsx` | ⬜ |
| `NewConversationPage` 新对话页与推荐区 | ✅ | `new-conversation-page.tsx` | ⬜ |

### conversation/ — 对话层

| 组件 | exported | 源文件 | 文档 |
|---|---|---|---|
| `ConversationFlow` 对话流 | ✅ | `conversation-flow.tsx` | ⬜ |
| `UserMessage` 用户消息 | ✅ | `conversation-flow.tsx` | ⬜ |
| `AgentIdentity` 智能体身份 | ✅ | `conversation-flow.tsx` | ⬜ |
| `AssistantMessage` 智能体回答 | ✅ | `conversation-flow.tsx` | ⬜ |
| `AgentResponseBlock` 回复块 | ❌ 私有 | `conversation-flow.tsx` | ⬜ |
| `ConversationTurn` 单轮容器 | ❌ 私有 | `conversation-flow.tsx` | ⬜ |
| `AssistantContinuation` 续流程回复 | ❌ 私有 | `conversation-flow.tsx` | ⬜ |
| `ClarificationFormCard` 澄清表单卡片 | ✅ | `clarification-form-card.tsx` | ⬜ |
| `CopyAction` / `FeedbackActions` 消息操作 | ✅ | `message-actions.tsx` | ⬜ |
| `MarkdownContent` Markdown 渲染 | ✅ | `markdown-content.tsx` | ⬜ |
| 内联标签契约（`kind: contract`） | ✅ | `inline-tag.ts` | ⬜ |
| 上下文拆分（`kind: contract`） | ✅ | `message-context.ts` | ⬜ |
| **`ConfirmCard` 确认卡片** | 🆕 待建 | — | ⬜ |
| **`ErrorState` 异常状态** | 🆕 待建 | — | ⬜ |
| **`FollowUpSuggestions` 后续引导** | 🆕 待建 | — | ⬜ |

🆕 三项是指南要求但上游未实现的缺口，见 [整合方案第 1 节](../../../../docs/proposals/agent-layout-integration.md#1-背景与结论)。

### process/ — 过程层

| 组件 | exported | 源文件 | 文档 |
|---|---|---|---|
| `ExecutionProcess` L1 状态摘要与过程容器 | ✅ | `conversation-flow.tsx` | ⬜ |
| `FlatExecutionFlow` 扁平执行流 | ✅ | `conversation-flow.tsx` | ⬜ |
| `TaskBlock` L2 规划任务 | ✅ | `conversation-flow.tsx` | ⬜ |
| `ExecutionStep` L3 执行步骤 | ✅ | `conversation-flow.tsx` | ⬜ |
| `ExecutionActionBadge` 动作 Badge | ✅ | `conversation-flow.tsx` | ⬜ |
| `ReasoningPanel` 深度思考面板 | ✅ | `conversation-flow.tsx` | ⬜ |

### artifact/ — 产物层

| 组件 | exported | 源文件 | 文档 |
|---|---|---|---|
| `ArtifactPanel` 面板框架壳 | ✅ | `artifact-panel.tsx` | ⬜ |
| 产物契约（`kind: contract`：`PanelView`/`ImageView`/`ArtifactTarget`/`PanelTab`/`panelViewKey`） | ✅ | `panel-types.ts` | ⬜ |
| 容器注册表（`PanelContainer`/`panelContainers`） | ✅ | `panel-registry.ts` | ⬜ |
| 检索结果容器 | ✅ | `panel-containers.tsx` | ⬜ |
| 浏览器容器 | ✅ | `panel-containers.tsx` | ⬜ |
| 文件预览容器 | ✅ | `panel-containers.tsx` | ⬜ |
| `ImageViewer` 蒙层图片查看器 | ✅ | `image-viewer.tsx` | ⬜ |
| 附件元信息（`kind: contract`） | ✅ | `file-meta.ts` | ⬜ |

### shell/ — 壳层与导航

| 组件 | exported | 源文件 | 文档 |
|---|---|---|---|
| `AgentShell` 应用总壳与状态 | ✅ | `agent-shell.tsx` | ⬜ |
| `ChatWorkspace` 工作区与分栏 | ✅ | `chat-workspace.tsx` | ⬜ |
| `ConversationPage` 对话页壳 | ✅ | `conversation-page.tsx` | ⬜ |
| `AgentSidebar` 侧栏 | ✅ | `sidebar.tsx` | ⬜ |

### registry/ — 注册表与视觉映射

| 组件 | exported | 源文件 | 文档 |
|---|---|---|---|
| 图标注册表（`navigationIcons`/`contextIcons`/`ContextType`） | ✅ | `icon-registry.ts` | ⬜ |
| 资源视觉映射（`LibraryFileIcon`/`ExpertAvatar`/`AgentAvatar`） | ✅ | `resource-visuals.tsx` | ⬜ |
| `IconButton` 通用圆形图标按钮 | ✅ | `icon-button.tsx` | ⬜ |

### 数据模型（不在本目录，单独归属）

`conversation-data.ts` 导出的全部数据模型类型（`ExecutionData` / `ExecutionTaskData` / `ExecutionStepData` / `ExecutionActionData` / `ReasoningData` / `ClarificationFormData` / `ClarificationField` / `MessageAttachment` / `AssistantAttachment` / `ConversationTurnData` / `ConversationScene` 等）属于**剧本数据契约**，文档归 [mock-script-engine 方案](../../../../docs/proposals/mock-script-engine.md)与后续的剧本引擎文档，不重复写进组件文档。
