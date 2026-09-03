# Phase 3 Component Documentation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 基于已验证的 Base UI 共享对话域与沉浸式模板源码，完成六层组件正文、精确扩展点地图和可重复的文档事实校验，使 agent 能安全定位扩展边界。

**Architecture:** 文档先区分三套边界：中立共享 conversation 域、沉浸式模板的丰富实现、Copilot 壳层。公共契约使用 `packages/agent-ui/src/conversation/` 为事实源；沉浸式专属的 L1/L2/L3、澄清、富 Composer、Panel/Image adapter 使用 `templates/immersive-starter/src/components/agent-layout/` 为事实源；Copilot 只记录壳层与左画布产物路由。每份文档使用既有 metadata schema，私有实现必须标为 `exported: false`，Phase 4 尚未实现的组件只能写规范占位，不能虚构 API。

**Tech Stack:** Markdown + frontmatter、Node.js 质量脚本、Vite 8、React 19、TypeScript、Tailwind CSS v4、shadcn v4（Base UI）。

---

## 不变约束

- 不改产品功能、不引入依赖、不重构现有 Base UI 包；本阶段以文档和文档校验为主。
- 所有组件 API、导出状态、源文件路径必须从当前源码核对，不能复述历史 `HANDOFF.md` 或旧 Radix 文件。
- `packages/agent-ui/src/conversation/` 只承载轻量共享域；禁止把沉浸式 `PanelView`、Tab、图片蒙层、富澄清表单或 L1/L2/L3 完整树描述为共享 API。
- `ArtifactTarget` 存在同名但不同层级的契约：共享域为中立目标，沉浸式 `panel-types.ts` 为展示 adapter。文档必须明确来源与转换点。
- ConfirmCard、ErrorState、FollowUpSuggestions 是 Phase 4 缺口；文档只记录设计规则、预期扩展入口和未实现状态，不写不存在的 import、props 或交互状态机。
- 不自动 commit 或 push；每批完成后由用户决定是否提交。

## 文档统一模板

每份叶子文档使用如下骨架，并根据组件性质删去不适用小节：

```markdown
---
name: agent-ux-<id>
description: "..."
user-invocable: false
meta:
  id: <id>
  kind: component | contract | pattern
  layer: delegation | conversation | process | artifact | shell | registry
  title: <中文名 + 英文名>
  exported: true | false
  source: <实际源码路径>
  whenToUse: [...]
  whenNotToUse: [...]
  composeWith: [...]
  composeBoundary: [...]
  pitfalls: [...]
  designRules: [...]
---

# <标题>

## 选型
## 事实源与 API
## 结构、状态与无障碍
## 组合边界
## 扩展方式
## 常见坑
```

`exported: false` 的文档必须在“组合边界”中明确：不能直接 import；如需改动只能修改宿主文件，并必须在需求文档说明原因。`kind: contract` 文档不虚构渲染 API，应写类型成员、生产者、消费者和禁止跨层传递的字段。

## 批次 A：事实源边界与共享契约

### Task 1: 校正组件索引与 Base UI inventory 边界

**Files:**
- Modify: `skills/agent-ux-react/references/components/README.md`
- Modify: `skills/agent-ux-react/references/components/base-inventory.md`
- Modify: `skills/agent-ux-react/references/overview/extension-map.md`

**Step 1: 更新组件索引的实现来源列**

为组件清单增加“实现层/事实源”说明，至少标注：

- shared：`packages/agent-ui/src/conversation/`
- immersive：`templates/immersive-starter/src/components/agent-layout/`
- copilot：`packages/agent-ui/src/copilot/` 或 Copilot 产品装配页
- planned：Phase 4 设计缺口

明确同名 `Composer`、`ConversationFlow` 具有共享轻量版与沉浸式丰富版，二者不能假定 props 兼容。

**Step 2: 修正 artifact 契约表述**

从旧的 `panel-types.ts` 说明中拆出共享 `ArtifactTarget`，标记后者的真实源为 `packages/agent-ui/src/conversation/types.ts`。沉浸式 `PanelView` / `ImageView` / `PanelTab` 只能作为 adapter 文档出现。

**Step 3: 收窄 extension-map 的共享域声明**

把“消息、执行、Composer、澄清、交付物入口都改共享域”的笼统入口改为：

- 共享域：轻量消息、轻量执行、轻量 Composer、中立 ArtifactRouter、产品块 renderer。
- 沉浸式：富 Composer、内联标签、澄清表单、L1/L2/L3、面板与图片 adapter。
- Copilot：`routeArtifact(target)` 只更新左侧工作区。
- 新面板内容改 `panel-data.ts`；只有新增容器类型才修改 panel types、containers 与 registry。

**Step 4: 标注 inventory 的适用范围**

在 `base-inventory.md` 中说明该清单是沉浸式模板的 Base UI 组件库存，不等同于 `@agent-ux/agent-ui` 的 root public API。

**Step 5: 验证**

Run:

```bash
npm run check:agent-ui-types
npm run check:agent-ui-drift
git diff --check
```

Expected: 类型和物化检查通过；文档改动无空白错误。

### Task 2: 建立共享 conversation 契约文档

**Files:**
- Create: `skills/agent-ux-react/references/components/conversation/conversation-contracts.md`
- Reference: `packages/agent-ui/src/conversation/types.ts`
- Reference: `packages/agent-ui/src/conversation/index.ts`
- Reference: `packages/agent-ui/package.json`

**Step 1: 写 metadata**

使用 `kind: contract`、`layer: conversation`、`exported: true`，source 指向 `packages/agent-ui/src/conversation/types.ts`。

**Step 2: 记录精确公共契约**

逐项描述 `ArtifactTarget`、`ArtifactRouter`、`ProductConversationBlock`、`ProductBlockContext`、`ProductBlockRenderer`、`ConversationScene`、`ConversationTurn`、`AssistantMessage`、`ExecutionStep`；说明 root 与 `/conversation` export 入口。

**Step 3: 写跨形态边界**

明确 shared artifact 不含 `PanelView`、`PanelTab`、Canvas 类型；沉浸式将其适配到右侧容器，Copilot 通过 `routeArtifact(target)` 更新左画布。

**Step 4: 写产品块约束**

记录插槽位于 assistant 正文/附件之后、续流程之前；未知块由产品 renderer 开发期告警并跳过，不能降级为 Markdown。

**Step 5: 验证**

逐项比对 types.ts 和 export map；确认文档所有链接可达。

### Task 3: 写共享/沉浸式双实现入口文档

**Files:**
- Create: `skills/agent-ux-react/references/components/delegation/composer.md`
- Create: `skills/agent-ux-react/references/components/conversation/conversation-flow.md`
- Reference: `packages/agent-ui/src/conversation/composer.tsx`
- Reference: `packages/agent-ui/src/conversation/conversation-flow.tsx`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/composer.tsx`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx`

**Step 1: 文档化 shared Composer**

记录共享组件仅负责 `onSend(value)`、placeholder 与基础输入行为；不可将内联标签、附件、连接器或 trigger 菜单假定为该组件 API。

**Step 2: 文档化 immersive Composer**

将 contentEditable、内联标签、附件、连接器与发送状态列为沉浸式变体；要求新增对象图标走 registry，而不是 JSX 即兴映射。

**Step 3: 文档化 shared ConversationFlow**

记录共享场景/执行/assistant/product blocks 的轻量渲染模型与 `openArtifact` 语义。

**Step 4: 文档化 immersive ConversationFlow**

记录它是独立丰富实现，负责身份开场、L1/L2/L3、附件、澄清、消息动作与产品块；不得以 shared props 直接替换。

**Step 5: 验证**

逐个比对两个文件的 exports 和 props。运行 `npm run check:agent-ui-types`。

## 批次 B：委托层与对话层正文

### Task 4: 完成委托层文档

**Files:**
- Create: `skills/agent-ux-react/references/components/delegation/new-conversation-page.md`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/new-conversation-page.tsx`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/app-config.ts`

**Step 1: 文档化 AppConfig 注入边界**

说明产品身份、导航、欢迎专家与推荐指令可配置；业务场景、主题、面板容器和产品块不可借 AppConfig 偷偷配置化。

**Step 2: 文档化首屏交互约束**

说明专家使用稳定 `id/label/visualKey`，推荐操作 3–5 条，不能使用模糊欢迎语；所有视觉映射走 `resource-visuals.tsx`。

**Step 3: 验证**

核对实际 config 和页面 props；将 source、designRules、pitfalls 填入 metadata。

### Task 5: 完成公共消息与私有回复结构文档

**Files:**
- Create: `skills/agent-ux-react/references/components/conversation/user-message.md`
- Create: `skills/agent-ux-react/references/components/conversation/agent-identity.md`
- Create: `skills/agent-ux-react/references/components/conversation/assistant-message.md`
- Create: `skills/agent-ux-react/references/components/conversation/agent-response-block.md`
- Create: `skills/agent-ux-react/references/components/conversation/conversation-turn.md`
- Create: `skills/agent-ux-react/references/components/conversation/assistant-continuation.md`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx`

**Step 1: 先写三个公共消息组件**

覆盖用户附件右对齐、智能体身份开场、assistant 结论优先、`needsReply` 只限最后一轮未回复追问、artifact 仅在用户可查看时可点。

**Step 2: 再写三个私有组件**

三份 metadata 均为 `exported: false`；标明不能 import。`agent-response-block.md` 必须固定产品块插槽位置；`conversation-turn.md` 覆盖当前轮与状态归属；`assistant-continuation.md` 只描述续流程状态和时序，不暴露稳定 API。

**Step 3: 验证**

用真实 export 声明逐项核对；确认三份私有文档没有 public import 示例。

### Task 6: 完成表单、排版、标签与消息操作文档

**Files:**
- Create: `skills/agent-ux-react/references/components/conversation/clarification-form-card.md`
- Create: `skills/agent-ux-react/references/components/conversation/message-actions.md`
- Create: `skills/agent-ux-react/references/components/conversation/markdown-content.md`
- Create: `skills/agent-ux-react/references/components/conversation/inline-tag.md`
- Create: `skills/agent-ux-react/references/components/conversation/message-context.md`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/clarification-form-card.tsx`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/message-actions.tsx`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/markdown-content.tsx`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/inline-tag.ts`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/message-context.ts`

**Step 1: 澄清表单**

记录字段不超过 10、按钮不超过 3、高风险确认字段约束、提交后的只读态，以及日期必须使用 Popover + Calendar，不退回原生输入。

**Step 2: 消息操作与 Markdown**

记录消息操作必须复用、悬停栏常驻占位不造成布局跳动；Markdown 统一经 MarkdownContent，正文 15px/1.6。

**Step 3: 内联标签与上下文契约**

记录标签序列化/解析以及“能内联的语义上下文 vs 实体附件”的边界；图标必须由 registry 统一提供。

**Step 4: 验证**

核对 source 文件，运行 immersive `npm run gate --workspace=immersive-starter`。

### Task 7: 写 Phase 4 缺口的规范占位文档

**Files:**
- Create: `skills/agent-ux-react/references/components/conversation/confirm-card.md`
- Create: `skills/agent-ux-react/references/components/conversation/error-state.md`
- Create: `skills/agent-ux-react/references/components/conversation/follow-up-suggestions.md`
- Reference: `skills/agent-ux-react/references/design.md`
- Reference: `skills/agent-ux-react/references/overview/quality-gates.md`

**Step 1: 标注真实状态**

将三份文档的 metadata 标注为 `exported: false` 与 `status: planned-phase-4`（若 schema 不支持 status，则在正文首段写明），source 写为 `Phase 4 planned`，不可写不存在的源码路径。

**Step 2: 写不可变设计约束**

- ConfirmCard：高风险对象/动作/影响范围/后果/操作人，确认后回写对话流。
- ErrorState：说明发生了什么、影响什么、下一步怎么做，不暗示失败任务成功。
- FollowUpSuggestions：2–4 条上下文相关建议与禁用情形。

**Step 3: 写 Phase 4 扩展入口**

明确须在 active Base UI source 实现后才能改为 public API，并链接对应 quality gate。

**Step 4: 验证**

搜索 active `packages/agent-ui/src/{conversation,immersive,copilot}` exports，确认文档未承诺不存在 API。

## 批次 C：过程层与产物层正文

### Task 8: 完成执行过程层六份文档

**Files:**
- Create: `skills/agent-ux-react/references/components/process/execution-process.md`
- Create: `skills/agent-ux-react/references/components/process/flat-execution-flow.md`
- Create: `skills/agent-ux-react/references/components/process/task-block.md`
- Create: `skills/agent-ux-react/references/components/process/execution-step.md`
- Create: `skills/agent-ux-react/references/components/process/execution-action-badge.md`
- Create: `skills/agent-ux-react/references/components/process/reasoning-panel.md`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx`

**Step 1: L1/L2/L3 文档按依赖落地**

先写 `execution-process.md`（L1），再写 flat flow、task block（L2）、execution step（L3）。明确简单任务只能 L1→L3；L2 仅用于规划/分头/汇总长链路，且必须有可查看 L3，不能嵌套 L2。

**Step 2: 动作 Badge**

记录可点击性只由是否存在用户可查看 ArtifactTarget 决定；执行过程的“已生成 X”与最终附件必须指向同一目标。

**Step 3: Reasoning panel**

记录只在复杂规划、协调执行或自纠错显示；完成过程默认收起；收起内容不得保留可聚焦子元素。

**Step 4: 验证**

对照 source 中的执行数据与状态分支；运行 immersive gate。

### Task 9: 先写沉浸式产物 adapter 契约与注册表文档

**Files:**
- Create: `skills/agent-ux-react/references/components/artifact/panel-types.md`
- Create: `skills/agent-ux-react/references/components/artifact/panel-registry.md`
- Create: `skills/agent-ux-react/references/components/artifact/file-meta.md`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/panel-types.ts`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/panel-registry.ts`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/file-meta.ts`

**Step 1: Panel types 与 shared contract 对照**

将 `PanelView` / `ImageView` / `PanelTab` / `panelViewKey` 明确为沉浸式 adapter；记录它们如何承接中立产物语义，不能成为 shared conversation 的字段。

**Step 2: Registry 扩展流程**

新容器类型的完整链路是 panel types → panel containers → panel registry；壳层不出现容器类型分支。仅换示例内容则只改 `panel-data.ts`。

**Step 3: 文件元信息**

记录文件类型/图标/预览元数据与 `resource-visuals.tsx` 的职责分界。

**Step 4: 验证**

逐一比对 `PanelView['type']` 与 registry entries；不允许遗漏类型。

### Task 10: 完成容器、面板和查看器文档

**Files:**
- Create: `skills/agent-ux-react/references/components/artifact/container-search-results.md`
- Create: `skills/agent-ux-react/references/components/artifact/container-browser.md`
- Create: `skills/agent-ux-react/references/components/artifact/container-file-preview.md`
- Create: `skills/agent-ux-react/references/components/artifact/artifact-panel.md`
- Create: `skills/agent-ux-react/references/components/artifact/image-viewer.md`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/panel-containers.tsx`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/artifact-panel.tsx`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/image-viewer.tsx`

**Step 1: 三类容器**

分别记录检索、网页浏览、文件预览的职责；网页内导航保持当前容器，不能每次导航创建 Tab。

**Step 2: Panel 与 Image Viewer**

记录多产物并排使用 Tab、同一产物去重切换已有 Tab、专注图片使用蒙层；窄桌面/移动端的全屏约束。

**Step 3: 验证**

手工从三个目标追踪打开链路：search/file/browser 进入已有或新 Tab；image 进入 viewer；无产物动作不可点。

## 批次 D：壳层、注册表、可发现性与总验收

### Task 11: 完成沉浸式壳层文档

**Files:**
- Create: `skills/agent-ux-react/references/components/shell/agent-shell.md`
- Create: `skills/agent-ux-react/references/components/shell/chat-workspace.md`
- Create: `skills/agent-ux-react/references/components/shell/conversation-page.md`
- Create: `skills/agent-ux-react/references/components/shell/agent-sidebar.md`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/agent-shell.tsx`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/chat-workspace.tsx`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/conversation-page.tsx`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/sidebar.tsx`

**Step 1: AgentShell 状态归属**

记录对话切换清空旧产物、侧栏/抽屉/独立面板状态归属、ArtifactRouter 适配、AppConfig 注入；不得把 panel 内容分支写回壳层。

**Step 2: Workspace 与 ConversationPage**

记录空间优先级、对话区 clamp(420px,50%,800px)、面板下限 320px、响应式 980/740/659 规则；页面只组合 rich Flow、Composer 和 panel router，不承载容器实现。

**Step 3: Sidebar**

记录导航/会话管理和 AppConfig 的职责；新对话是固定行为，不进入普通导航配置。

**Step 4: 验证**

对照实际 state 与 props；运行 immersive gate。

### Task 12: 完成注册表与视觉映射文档

**Files:**
- Create: `skills/agent-ux-react/references/components/registry/icon-registry.md`
- Create: `skills/agent-ux-react/references/components/registry/resource-visuals.md`
- Create: `skills/agent-ux-react/references/components/registry/icon-button.md`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/icon-registry.ts`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/resource-visuals.tsx`
- Reference: `skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/icon-button.tsx`

**Step 1: icon registry**

说明导航、上下文、能力图标的统一注册规则；同一对象在侧栏、Composer、菜单与消息中必须保持同一图标。

**Step 2: resource visuals**

说明文件类型和专家头像映射；专家稳定使用 id/label/visualKey，不以中文展示文本充当映射键。

**Step 3: IconButton**

记录 Lucide-only、aria-label、Tooltip 和 44px 触控约束。

**Step 4: 验证**

检查文档引用的注册键与源码匹配；禁止文档建议 JSX 内硬编码映射。

### Task 13: 回填 Copilot 与产品扩展定位

**Files:**
- Modify: `skills/agent-ux-react/references/overview/extension-map.md`
- Modify: `skills/agent-ux-react/references/overview/project-structure.md`
- Modify: `skills/agent-ux-react/references/components/README.md`
- Reference: `packages/agent-ui/src/copilot/copilot-app.tsx`
- Reference: `skills/agent-ux-react/templates/copilot-starter/src/pages/ContractReview.tsx`

**Step 1: 写 Copilot 壳层边界**

明确 `CopilotApp` 负责资源区/工作区/对话辅助区模式；产品页负责 workspace 与 `routeArtifact`；产物永远更新左画布，不得出现沉浸式右侧 Tab。

**Step 2: 回填扩展地图精确路径**

补充产品块 renderer、AppConfig、场景数据、panel data、容器类型、Copilot canvas router 的实际源路径；逐行提供“改这里 / 不要碰”。

**Step 3: 验证**

从地图每行反查真实 import 和 source，确保链接路径存在。

### Task 14: 建立文档事实检查并完成总验证

**Files:**
- Modify: `skills/agent-ux-react/scripts/build-catalog.mjs` 或 create `skills/agent-ux-react/scripts/check-component-docs.mjs`
- Modify: root `package.json`（仅在新检查器接入时）
- Modify: `skills/agent-ux-react/references/_generated/catalog.json`（生成物）
- Modify: `PROJECT_CONTEXT.md`
- Modify: `CHANGELOG.md`

**Step 1: 选择最小校验器**

优先新增零依赖 `check-component-docs.mjs`，不要扩大 `build-catalog.mjs` 的职责。校验器应：

- 遍历 `references/components/**/*.md`（忽略 README/base-inventory）；
- 验证 frontmatter 必填 `meta.id/kind/layer/title/exported/source/designRules`；
- 验证 `layer` 是六个合法值；
- 对 source 为实际相对路径的文档验证文件存在；允许 `Phase 4 planned` 占位，但必须同时 `exported: false`；
- 验证 `designRules` 的文档锚点文件存在；
- 发现问题时非零退出，并显示文件/字段。

**Step 2: 生成或校验 catalog**

在已有 catalog 生成器支持的前提下，更新生成产物；若其不适用于新 schema，不修改它的输出语义，只让新检查器独立验收。

**Step 3: 接入根门禁**

把文档检查放在根 gate 的类型/漂移检查之后、模板 gates 之前；不重复在两个模板 package 中执行。

**Step 4: 最终验证**

Run:

```bash
npm install
npm run check:agent-ui-types
npm run check:agent-ui-drift
npm run check:component-docs
npm run gate
git diff --check
git status -sb
```

Expected: 所有命令成功；沉浸式维持 7 条既有 Oxlint warning 与 bundle 体积提示，Copilot 维持 4 条既有 Fast Refresh warning；不新增 warning。

**Step 5: 更新治理记录**

用 `date +%F` 刷新 `PROJECT_CONTEXT.md` 顶部日期，在当前状态、文件地图、待办和变更日志中记录 Phase 3 完成与文档校验器；在 `CHANGELOG.md` 增加使用者可感知的组件文档体系与扩展地图能力。不要自动 commit 或 push。

## 完成定义

- 六层目录中所有现有可用组件/契约都有正文，且 metadata 与源码、导出边界一致。
- 三个 Phase 4 缺口具有明确规范占位，但不被描述为可用 API。
- `components/README.md` 和 `extension-map.md` 不再混淆 shared conversation、immersive adapter、Copilot canvas。
- 新增文档校验器能发现缺字段、非法层级、失效 source 和错误 planned API 边界。
- 根 gate、差异检查通过，既有 warning 数量不增加。
