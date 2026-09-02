# Base UI Shared Agent and Copilot Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**状态（2026-09-03）：** Phase 2 与 Copilot Base UI 迁移已完成并通过根 gate；后续仅保留完整沉浸式 `AgentApp` 壳层抽取与其它路线图阶段。\n\n**Goal:** 将沉浸式 Agent 与助手式 Copilot 一并迁移到 Base UI，以单一共享对话域、两套独立壳层和中立产物路由支撑可独立分发的 React 脚手架。

**Architecture:** `packages/agent-ui` 成为 Base UI 的唯一开发态源码，按 `conversation/`、`immersive/`、`copilot/`、`ui/` 分层；共享对话域只表达消息、执行、澄清和 `ArtifactRouter` 语义，不知道右侧面板或画布。`AgentApp` 将交付物路由到沉浸式右侧面板，`CopilotApp` 将其路由到左侧画布。两套模板仅保存物化源码，复制后不依赖 monorepo。

**Tech Stack:** Vite 8、React 19、TypeScript、Tailwind CSS v4、shadcn v4（Base UI）、lucide-react、Oxlint、npm workspaces。

---

## Confirmed design constraints

- 两套形态**本轮同时迁移到 Base UI**；不保留 Radix 兼容层或 legacy package。
- 对话域完全同源：消息、执行过程、Composer、澄清、确认、消息操作、交付物入口与可访问性只实现一份。
- 壳层不强行统一：沉浸式保留侧栏/对话主区/右侧交付物面板；Copilot 保留资源区/画布主区/对话辅助区。
- 产物交互只共享 `ArtifactRouter(target)` 语义：沉浸式映射到右侧 Tab 或图片蒙层，Copilot 映射到左侧画布/工作区；共享域不得 import `ArtifactPanel` 或 Canvas。
- `AppConfig` 仅覆盖稳定产品差异：身份、导航、首屏专家与推荐。场景、主题、面板容器、产品专属块保留 TypeScript 源码扩展能力。
- 专家数据使用稳定 `id`、`label`、`visualKey`；不得再以中文展示文本兼作视觉注册键。
- 产品专属块只提供 assistant 正文后、续流程前的固定插槽；未知块安全跳过并开发期警告；不导出私有 `AgentResponseBlock` / `ConversationTurn` / `AssistantContinuation`。
- 不自动创建 Git commit 或 push；提交由用户手动完成。

## Task 1: 建立 Base UI 包目录与依赖边界

**Files:**
- Modify: `packages/agent-ui/package.json`
- Create: `packages/agent-ui/src/conversation/`
- Create: `packages/agent-ui/src/immersive/`
- Create: `packages/agent-ui/src/copilot/`
- Create: `packages/agent-ui/src/ui/`
- Modify: `packages/agent-ui/tsconfig.json`
- Modify: root `package.json`

**Step 1: 写入新的 package export map**

将 package 的子路径稳定为：

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./conversation": "./src/conversation/index.ts",
    "./immersive": "./src/immersive/index.ts",
    "./copilot": "./src/copilot/index.ts"
  }
}
```

根入口仅导出共享对话契约；`immersive` 与 `copilot` 分别导出 `AgentApp` / `CopilotApp` 和其受控壳层 API。

**Step 2: 切换 Base UI 依赖**

移除仅由旧 Radix 源码使用的 `radix-ui` 与 `@radix-ui/react-slot` 依赖；加入从 Base UI 模板实际使用的 `@base-ui/react`、`date-fns`、`react-day-picker`、`next-themes`、`sonner`、`react-markdown`、`remark-gfm`、Geist、Tailwind 相关依赖。版本必须从已验证的 `immersive-starter/package.json` 复制，不使用宽泛的临时版本。

**Step 3: 移植基础 UI 与共用工具**

从沉浸式模板移入实际被共享对话组件依赖的 `src/components/ui/` 文件、`cn()` 和全局类型声明；保留 Base UI import 路径与 CSS variables。不要将所有 21 个基础件盲目转移：只转移共享域和两个壳层当前 import 的文件，并在类型错误时补齐。

**Step 4: 验证基础包可解析**

运行：`npm install && npm run check --workspace=@agent-ux/agent-ui`。

预期：无 Radix 模块解析错误，尚未迁入的旧源码不再进入 tsconfig include。

## Task 2: 抽取共享对话域与中立产物路由

**Files:**
- Create: `packages/agent-ui/src/conversation/types.ts`
- Create: `packages/agent-ui/src/conversation/artifact-router.ts`
- Create: `packages/agent-ui/src/conversation/conversation-flow.tsx`
- Create: `packages/agent-ui/src/conversation/composer.tsx`
- Create: `packages/agent-ui/src/conversation/clarification-form-card.tsx`
- Create: `packages/agent-ui/src/conversation/message-actions.tsx`
- Create: `packages/agent-ui/src/conversation/markdown-content.tsx`
- Create: `packages/agent-ui/src/conversation/index.ts`
- Modify or migrate: shared data/visual modules from `templates/immersive-starter/src/components/agent-layout/`

**Step 1: 定义共享语义契约**

在 `types.ts` 定义或迁出 `ConversationScene`、turn/message 数据类型、`ArtifactTarget` 与以下中立路由类型：

```ts
export type ArtifactRouter = (target: ArtifactTarget) => void

export type ProductConversationBlock = {
  id: string
  type: string
  payload: unknown
}

export type ProductBlockContext = {
  turnId: string
  isLatestTurn: boolean
  openArtifact: ArtifactRouter
}

export type ProductBlockRenderer = (
  block: ProductConversationBlock,
  context: ProductBlockContext,
) => React.ReactNode
```

`ArtifactTarget` 不能包含 `PanelView`、`PanelTab` 或画布实现细节；形态特有的展示映射留在对应壳层。

**Step 2: 迁移 ConversationFlow，保留内部边界**

把已有 `ConversationFlow`、执行过程、身份、Markdown、附件、澄清和消息操作迁入共享域。公开 `ConversationFlow` 与独立叶子组件；保持 `ConversationTurn`、`AgentResponseBlock`、`AssistantContinuation` 私有。

在私有 `AgentResponseBlock` 中在 assistant 正文/附件之后、`AssistantContinuation` 之前渲染：

```tsx
{message.productBlocks?.map((block) =>
  renderProductBlock?.(block, { turnId: turn.id, isLatestTurn, openArtifact }) ?? null,
)}
```

未知 type 的警告应由上层 registry/renderer 产生；共享域不能将其降级为 Markdown。

**Step 3: 替换所有 `onOpenArtifact` 的面板语义**

共享组件 prop 统一使用 `openArtifact: ArtifactRouter`。沉浸式与 Copilot 各自提供 adapter；不得让共享域 import `panel-types.ts`、`ArtifactPanel` 或 Copilot Canvas。

**Step 4: 写最小契约测试或类型样例**

若现有 Vitest 配置不存在，创建 `packages/agent-ui/src/conversation/types.test.ts` 只测试纯函数/类型守卫；React 渲染行为通过模板 smoke test 验证。不要为了本任务新增重量级测试框架。

**Step 5: 验证**

运行：`npm run check --workspace=@agent-ux/agent-ui`。

预期：共享域不再含 Radix import，且不引用 immersive/canvas 专属模块。

## Task 3: 以 AppConfig 建立沉浸式 AgentApp

**Files:**
- Create: `packages/agent-ui/src/immersive/app-config.ts`
- Create: `packages/agent-ui/src/immersive/agent-app.tsx`
- Migrate: `agent-shell.tsx`、`sidebar.tsx`、`conversation-page.tsx`、`new-conversation-page.tsx`
- Migrate: `panel-types.ts`、`panel-data.ts`、`panel-registry.ts`、`panel-containers.tsx`、`artifact-panel.tsx`、`image-viewer.tsx`
- Migrate: `icon-registry.ts`、`resource-visuals.tsx`
- Create: `packages/agent-ui/src/immersive/index.ts`

**Step 1: 定义 AppConfig 与默认值**

```ts
export type AppConfig = {
  identity: { name: string; avatar?: React.ReactNode }
  navigation: { items: NavigationItem[] }
  welcome: {
    greeting: string
    experts: WelcomeExpert[]
    defaultSuggestions: SuggestionItem[]
    expertSuggestions: Record<string, SuggestionItem[]>
  }
}

export type WelcomeExpert = {
  id: string
  label: string
  visualKey: string
  icon: NavigationIconId
}
```

“新对话”继续是 `AgentShell` 的固定行为，不进入普通导航配置。配置只传 icon id；真实 Lucide 图标仍由 `icon-registry.ts` 解析。

**Step 2: 注入身份、导航和欢迎页配置**

移除 `DEFAULT_AGENT_NAME`、`AgentSidebar` 固定菜单、`new-conversation-page.tsx` 文件内 experts/default suggestions。`AgentApp` 归一化配置后将同一 identity 传给 Sidebar、ConversationFlow 和 resource visual fallback，确保所有位置一致。

**Step 3: 场景与产物 adapter 注入**

`AgentApp` 接收 scenes 和默认新建场景工厂；`AgentShell` 不再直接 import 模板示例数据。沉浸式 `ArtifactRouter` 在内部把通用 target 转为 `PanelView` / image viewer 行为，保留已有同 target Tab 去重与换会话清面板规则。

**Step 4: 建立模板装配层**

修改 `templates/immersive-starter/src/App.tsx` 为：

```tsx
<AgentApp config={appConfig} scenes={conversationScenes} />
```

模板内保留 `src/app-config.ts`、`src/mock/` 和产品专属 `renderProductBlock` 示例；不得让模板依赖 runtime workspace。

**Step 5: 验证**

运行：`npm run gate --workspace=immersive-starter`。

手动烟测：侧栏和 assistant 身份名称一致；每位专家有头像和推荐；同产物重复打开只切 Tab；切换会话立即清面板。

## Task 4: 以 CopilotApp 迁移 Base UI 壳层与画布路由

**Files:**
- Create: `packages/agent-ui/src/copilot/copilot-app.tsx`
- Create: `packages/agent-ui/src/copilot/copilot-config.ts`
- Migrate/rewrite: `templates/copilot-starter/src/components/layout/CopilotShell.tsx`
- Migrate/rewrite: `templates/copilot-starter/src/components/layout/ResourcePanel.tsx`
- Create: `packages/agent-ui/src/copilot/index.ts`
- Modify: `templates/copilot-starter/src/App.tsx`
- Modify: `templates/copilot-starter/src/pages/ContractReview.tsx`

**Step 1: 定义 Copilot 壳层接口**

```tsx
<CopilotApp
  config={copilotConfig}
  scenes={scenes}
  workspace={workspaceNode}
  routeArtifact={routeArtifact}
/>
```

`workspace` 是左侧主工作区；Copilot 自己管理分栏、浮窗、浮层抽屉与侧边抽屉模式。它复用共享 ConversationFlow/Composer，但不使用沉浸式 `ArtifactPanel`。

**Step 2: 实现画布产物 adapter**

Copilot 的 `routeArtifact(target)` 将 target 映射为左侧画布/文档预览当前内容或工作区 Tab。交付物在对话中仍可点击，但展示结果只进入画布，绝不新建右侧产物面板。

**Step 3: 替换旧 Radix Copilot UI**

用 Base UI 版本的 shell、分割布局、tabs、dialog/sheet、tooltip 和共享对话组件替换旧物化组件。移除模板对 `src/components/agent-ui/` 和旧 `src/components/ui/` Radix 基础件的依赖。

**Step 4: 建立模板装配层**

`copilot-starter/src/App.tsx` 使用 `CopilotApp`；`ContractReview.tsx` 只提供工作区内容、示例 scenes、产品配置及 artifact routing，不承担壳层状态。

**Step 5: 验证**

运行：`npm run gate --workspace=copilot-starter`。

手动烟测：四种 Copilot 辅助区模式能切换；产物点击更新左画布；不会出现沉浸式右侧 Tab；对话组件视觉与沉浸式一致。

## Task 5: 重建物化同步、独立模板与 gate

**Files:**
- Rewrite: `scripts/sync-agent-ui.mjs`
- Modify: root `package.json`
- Modify: `skills/agent-ux-react/templates/immersive-starter/package.json`
- Modify: `skills/agent-ux-react/templates/copilot-starter/package.json`
- Delete: 旧 Radix `packages/agent-ui/src/` 文件与不再需要的模板物化目录

**Step 1: 生成两套模板的物化源码**

同步脚本应从 Base UI package 的 `conversation/` + `immersive/` 或 `copilot/` 输出生成两套模板内的本地源码，并把内部路径改写为模板 `@/` alias。共享域输出到两个模板；形态壳层只输出给对应模板。

**Step 2: 添加双向漂移检测**

`--check` 必须同时验证两个模板。检查结果应分别报告 `immersive-starter` 与 `copilot-starter`，不能再使用 `legacy` 字样。

**Step 3: 更新根 gate**

根 `gate` 顺序：Base UI package 类型检查 → 同步漂移检测 → immersive gate → copilot gate。删除旧 `legacy-copilot` 命令与 Radix 兼容 aliases。

**Step 4: 证明独立分发**

在仓库外创建两个临时目录，分别复制模板并运行：

```bash
npm install
npm run build
```

预期：两者均不依赖根 `node_modules`、workspace 协议或 `packages/agent-ui`。

## Task 6: 同步文档、质量门禁和台账

**Files:**
- Modify: `skills/agent-ux-react/SKILL.md`
- Modify: `skills/agent-ux-react/references/overview/project-structure.md`
- Modify: `skills/agent-ux-react/references/overview/extension-map.md`
- Modify: `skills/agent-ux-react/references/components/README.md`
- Modify: `CONTRIBUTING.md`
- Modify: `docs/proposals/agent-layout-integration.md`
- Modify: `CHANGELOG.md`
- Modify: `PROJECT_CONTEXT.md`

**Step 1: 删除已失效的 legacy/Radix 描述**

将技术栈统一为 Base UI；将 Phase 6 从路线图移除；写明共享对话域、双壳层和 `ArtifactRouter` 的形态差异。

**Step 2: 回填组件和扩展点边界**

组件索引明确：共享域的公共出口、沉浸式专属 PanelView/registry、Copilot 专属 canvas router；私有 `AgentResponseBlock` 等不导出。扩展点地图写明 Copilot 产物必须路由到画布。

**Step 3: 最终验证**

运行：

```bash
npm run gate
git diff --check
```

记录每个 gate、现存 warning 与未执行的手动烟测。更新 `PROJECT_CONTEXT.md` 顶部日期、当前状态、文件地图、待办和变更日志；在 `CHANGELOG.md` 标注双形态 Base UI 迁移。
