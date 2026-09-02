# 方案：整合 agent-layout 作为沉浸式事实源

> 状态：**方案已确认，待实现**（2026-08-27 讨论确认）。本文档定方向、组件文档体系与改造顺序，代码尚未开始。
> 关联：[mock-script-engine.md](./mock-script-engine.md) · [website-showcase.md](./website-showcase.md) · [agent-layout/DESIGN.md](/Users/yangshuo/Code/agent-layout/DESIGN.md) · [agent-layout/HANDOFF.md](/Users/yangshuo/Code/agent-layout/HANDOFF.md)

## 1. 背景与结论

`/Users/yangshuo/Code/agent-layout` 是一个已成型的沉浸式智能体工作台前端模板（23 文件 / 3346 行业务代码 / 21 个 shadcn v4 基础组件），并沉淀了三份文档：`AGENTS.md`（铁律）、`DESIGN.md`（设计方法论）、`HANDOFF.md`（工程交接）。

与 skill 现有的 `immersive-starter`（约 1200 行骨架）相比，agent-layout 在沉浸式形态上是"已经踩过坑的成品"：L1/L2/L3 严格判定、8 类动作 Badge、产物多 Tab + 容器注册表 + 蒙层查看器、contentEditable 内联标签 Composer、5 字段澄清表单含提交转只读与续流程、980/740/659 三档响应式 + 420/800/320 宽度契约。

**结论：采纳 agent-layout 作为沉浸式形态的事实源，反向重构 skill。**

但 agent-layout 是**深而窄**，不是 skill 的超集，缺三块：

| 缺口 | 出处 | 处置 |
|---|---|---|
| 风险分级与操作确认（低/中/高，高风险强确认展示对象·动作·影响范围·后果·操作人） | 指南 V1.4 3.4 + 4.1 | 新增 `confirm-card` |
| 异常处理七场景（服务不可用·超时·失败·部分完成·权限不足·能力不支持·结果未知） | 指南 V1.4 4.2 | 新增 `error-state` |
| 后续引导（轮次末尾 2–4 个推荐追问 + 四类禁用场景） | 指南 V1.4 3.7 | 新增 `follow-up-suggestions`（注意与它现有的"新对话首屏推荐指令"不是同一个东西，后者对应 V1.4 1.2 首屏引导） |
| 无障碍层偏薄（缺 WCAG AA 明示、`aria-live` 流式播报、44px 触控、图表 `role=img` 替代说明） | 指南 V1.4 4.4 | 补进 design.md 与质量门禁，逐组件补 |
| 助手式 Copilot 完全没有 | 指南 V1.4 2.1 | 保持 skill 现有轻量骨架，不追平深度 |

## 2. 已确认的决策

| # | 决策 | 结论 |
|---|---|---|
| 1 | 技术栈 | **Base UI**（`@base-ui/react` + `@import "shadcn/tailwind.css"`，shadcn v4）。skill 现有基于 `radix-ui` 的实现作废 |
| 2 | 剧本数据格式 | **引擎接受已解析对象，TS / JSON 双数据源**。见第 8 节 |
| 3 | 仓库整合方式 | **`git subtree add` 搬入**，保留历史；agent-layout 此后不再独立演进 |
| 4 | 包抽取粒度 | **整个应用底座（粒度 3）+ 分层导出 + 配置化改造**。见第 4 节 |
| 5 | 助手式 | 保持现有轻量骨架，仅迁移到 Base UI |

## 3. 优先级原则（新增铁律，需写入 CONTRIBUTING.md）

> **agent 生成能力是主用途，website 在线编辑是次要用途。两者冲突时牺牲 website 的便利性，不牺牲生成能力。**
>
> 具体判据：如果某项能力"配置化之后会让 agent 少一种表达方式"，那就不配置化，让编辑器少一个可编辑项。

这条是为了避免以后每次遇到类似取舍都重新讨论一遍。第 7、8 节的两处收敛都由它推导而来。

## 4. 包结构与抽取粒度

采用粒度 3（整个应用底座进包），但**分层导出**，让助手式不被迫依赖沉浸式壳层：

```
@agent-ux/agent-ui              → 叶子组件层（copilot-starter 用这层）
@agent-ux/agent-ui/immersive     → 沉浸式应用底座（immersive-starter + website 播放器用这层）
```

### 4.1 为什么粒度 3 不会压缩 agent 的表达空间

关键在于 `sync-agent-ui.mjs` 是**物化拷贝**而非 npm 依赖，两种身份看到的东西不同：

| 身份 | 看到什么 | 能改什么 |
|---|---|---|
| 仓库内维护者 | `packages/agent-ui` 是唯一源码 | 改包 → 跑同步；漂移检测拦住手改拷贝 |
| **agent 生成产品时** | `cp -R templates/immersive-starter` 得到**完整源码** | **任意改**，该工程已脱离仓库，不受同源约束 |

所以粒度 3 只是把起点从"骨架"抬高到"完整成品"，不存在"包锁住 agent"。真实风险是 agent 面对 3350 行**不知道该改哪里**——这是文档问题，由第 5、6 节解决。

### 4.2 配置化改造范围

把散在各处的硬编码提成 `AppConfig`，使 `<AgentApp config={...} scenes={...} />` 成为 immersive-starter 与 website 播放器共用的唯一入口：

- `conversation-data.ts` 的 `DEFAULT_AGENT_NAME`
- `resource-visuals.tsx` 的 `AgentAvatar`（产品身份头像）
- `sidebar.tsx` 的主菜单三项（智能体·技能·连接器 / 定时任务 / 文件库）
- `new-conversation-page.tsx` 的专家推荐与指令推荐
- `conversationScenes` / `panel-data` 由模块常量改为 props 注入

**边界（由第 3 节原则推导）**：只配置化"高频且已知"的变化。凡是配置化会压缩 agent 表达力的，保留为改代码 + 走扩展点。

## 5. 组件文档体系（本方案的核心）

agent-layout 已经做了充分的组件化解构，尤其中间对话区域与右侧面板的容器分层。因此虽然存在一个总壳层，**叶子仍需体系化管理**，参照 pangea-design-skill 引用 arco 的做法建立文档体系。

### 5.1 与 pangea 的结构对照与两处刻意差异

pangea 的做法是两层：`components/<分类>/<名>.md` 放 arco 官方 API 零漂移镜像，`component-selection/<名>.md` 放薄选型元数据（frontmatter `meta` + 何时用/别用/变体/组合边界/坑 + 链回完整 API）。

本项目做两处调整：

**差异 1：不拆分"完整 API 文档"与"选型元数据"，合并为一份。**
pangea 必须拆，因为 `components/` 是外部依赖的**逐字镜像**，不能往里注入判断；选型意见只能另立一份。本项目的对话域组件是**自研**，文档本身就是事实源，可以在同一份文档里同时承载 `meta` frontmatter（供 `catalog.json`）与选型/结构/API/状态/坑。拆开只会制造同步负担。

**差异 2：底层基础件不做 21 份 API 镜像，只做一份清单 + 本项目约定。**
arco 是 npm 包、API 不可见，所以值得镜像；shadcn 是**拷贝源码**模式，21 个组件的源码就在 `src/components/ui/` 里，agent 读源码比读二手文档更准。因此这层只需要 `components/base-inventory.md`：可用组件清单 + 本项目特有约定（例如 Base UI DropdownMenu 的 `focus:**:text-accent-foreground` 会递归覆盖后代颜色，专家头像必须用显式 SVG `stroke` 规避——见 HANDOFF 8.1）。

### 5.2 分组方式：按 DESIGN.md 的四层信息模型

不用 arco 式的 `data-display / data-entry / feedback` 分类，改用 `DESIGN.md` 第 1 节的**四层信息模型**分组，再加壳层与基础设施两组。这样组件目录与设计方法论直接同构，agent 在"新增能力先归位到哪一层"（DESIGN.md 第 8 节决策流程第 1 问）之后，能直接落到对应目录。

```
references/components/
├── base-inventory.md              # 21 个 shadcn v4 / Base UI 基础件清单 + 本项目约定
├── delegation/                     # 委托层
│   ├── composer.md
│   └── new-conversation-page.md
├── conversation/                   # 对话层
│   ├── conversation-flow.md
│   ├── user-message.md
│   ├── agent-identity.md
│   ├── assistant-message.md
│   ├── clarification-form-card.md
│   ├── message-actions.md
│   ├── markdown-content.md
│   ├── inline-tag.md
│   └── message-context.md
├── process/                        # 过程层
│   ├── execution-process.md        # L1
│   ├── flat-execution-flow.md      # 扁平模式
│   ├── task-block.md               # L2
│   ├── execution-step.md           # L3
│   ├── execution-action-badge.md
│   └── reasoning-panel.md
├── artifact/                       # 产物层
│   ├── artifact-panel.md           # 框架壳
│   ├── panel-types.md              # 契约：PanelView / ImageView / ArtifactTarget / PanelTab / panelViewKey
│   ├── panel-registry.md           # 容器注册表
│   ├── container-search-results.md
│   ├── container-browser.md
│   ├── container-file-preview.md
│   ├── image-viewer.md
│   └── file-meta.md
├── shell/                          # 壳层与导航
│   ├── agent-shell.md
│   ├── chat-workspace.md
│   ├── conversation-page.md
│   └── agent-sidebar.md
└── registry/                       # 注册表与视觉映射
    ├── icon-registry.md
    ├── resource-visuals.md
    └── icon-button.md
```

新增的三个 V1.4 缺口组件按层归位：`confirm-card` → `conversation/`（它是消息流内的决策卡片）、`error-state` → `conversation/`、`follow-up-suggestions` → `conversation/`。

### 5.3 每份组件文档的固定结构

```markdown
---
name: agent-ux-<组件名>
description: "..."
user-invocable: false
meta:
  id: execution-action-badge
  kind: component
  layer: process                    # 新增字段：所属信息层
  title: 动作 Badge ExecutionActionBadge
  exported: true                    # 新增字段：是否为公共导出（见 5.4）
  whenToUse: [...]
  whenNotToUse: [...]
  variants: [...]
  composeWith: [...]
  composeBoundary: [...]
  pitfalls: [...]
  source: src/components/agent-layout/conversation-flow.tsx
  designRules: [design.md#原则3-有产物的动作才做成可点击资源]   # 新增字段：反查设计依据
---

# 动作 Badge ExecutionActionBadge

## 选型                  ← 何时用 / 别用什么替代
## 结构与视觉契约        ← 已成契约的尺寸（32px 高、300px 最大宽、纵向排列等）
## API                   ← props / 类型定义
## 状态                  ← 对应四种状态语言中的哪些
## 扩展方式              ← 加新动作类型要改哪里（与扩展点地图交叉引用）
## 常见坑                ← 来自 HANDOFF 的实战记录
```

新增三个 `meta` 字段的用途：
- `layer` — 支撑按信息层检索，也让 `catalog.json` 能按层分组
- `exported` — 见 5.4
- `designRules` — 从组件反查设计依据，避免"改了组件但违反了某条原则"

### 5.4 必须显式区分公共导出与内部实现

核对 `agent-layout` 的实际导出发现一个必须写进文档的事实：`HANDOFF.md` 第 9 节描述的 **`AgentResponseBlock`、`ConversationTurn`、`AssistantContinuation` 并不在导出列表中**，是 `conversation-flow.tsx` 的文件内私有组件。

这直接影响 agent 的行为边界：
- **公共导出**（`meta.exported: true`）→ agent 可以在自己的页面里直接组合使用
- **内部实现**（`meta.exported: false`）→ agent 要改它必须改 `conversation-flow.tsx` 本身，属于"修改壳层内部"，需要在需求文档里说明理由

不标清楚的后果是 agent 试图 `import { AgentResponseBlock }` 然后失败，或者反过来不敢碰任何东西。

准确的导出清单（`grep` 实测，非文档转述）：

| 文件 | 公共导出 |
|---|---|
| `conversation-flow.tsx` | `ConversationFlow` `AgentIdentity` `UserMessage` `ExecutionProcess` `FlatExecutionFlow` `ExecutionStep` `ExecutionActionBadge` `ReasoningPanel` `TaskBlock` `AssistantMessage` |
| `composer.tsx` | `Composer` + 类型 `ContextItem` `MenuSide` |
| `message-actions.tsx` | `CopyAction` `FeedbackActions` |
| `panel-containers.tsx` | `SearchResultsToolbar/Body` `BrowserToolbar/Body` `FilePreviewToolbar/Body` |
| `resource-visuals.tsx` | `LibraryFileIcon` `ExpertAvatar` `AgentAvatar` |
| `panel-types.ts` | `SearchResult` `PanelView` `ImageView` `ArtifactTarget` `PanelTab` `panelViewKey` |
| `panel-registry.ts` | `PanelContainer` `panelContainers` |
| `inline-tag.ts` | `INLINE_TAG_CLASS` `formatInlineTag` `MessageSegment` `parseInlineTags` `hasInlineTags` |
| `file-meta.ts` | `formatFileSize` `fileTypeLabel` `createLocalFilePreview` |
| `icon-registry.ts` | `ContextType` `navigationIcons` `contextIcons` |
| `message-context.ts` | `splitSentContext` |
| 其余单组件文件 | `AgentShell` `ArtifactPanel` `ChatWorkspace` `ClarificationFormCard` `ConversationPage` `IconButton` `ImageViewer` `MarkdownContent` `NewConversationPage` `AgentSidebar` |
| `conversation-data.ts` | 全部数据模型类型 + `DEFAULT_AGENT_NAME` `formatTimestamp` `conversationScenes` `createDraftScene` |

> 说明：以上基于 `grep -oE "^export (function|const|type|interface)"` 实测。**尚未逐行阅读 3346 行实现**，各组件的 props 细节需要在写文档时逐个核对源码，不能照抄 HANDOFF 的叙述。

## 6. 扩展点地图（新增文档，优先级高于 website）

风险最大的一条不是架构而是导航：agent 面对 3350 行源码 + 21 个基础件读不完，定位不准就会犯 `AGENTS.md` 第 2 节已点名禁止的错（把视图逻辑塞回 `conversation-page.tsx`、绕过 `panel-registry` 硬写容器分支、在 `composer.tsx` 的 JSX 里硬编码图标映射）。

好消息是 agent-layout **已内建扩展点模式，不需要新造抽象**，只需要把它文档化为查表：

新增 `references/overview/extension-map.md`，形式是「你要加 X → 改哪个文件 → 不要碰哪个文件」：

| 要加的东西 | 改这里 | 不要碰 | 出处 |
|---|---|---|---|
| 新对话场景 | 场景数据文件 | 任何视图组件 | AGENTS 第 2 节 |
| 新面板内容 | `panel-data.ts` | 容器实现 | HANDOFF 第 3 节 |
| 新产物容器类型 | 扩展 `PanelView` + 写容器实现 + 补一条 `panelContainers` 注册 | `artifact-panel.tsx` 壳层 | HANDOFF 13.1 |
| 新动作 Badge 类型 | `ExecutionActionData` + `actionIcons` | `ExecutionActionBadge` 渲染逻辑 | HANDOFF 12.3 |
| 新上下文 / 能力图标 | `icon-registry.ts` | 各处 JSX | AGENTS 第 2 节 |
| 新文件类型 / 专家头像 | `resource-visuals.tsx` | `composer.tsx` 菜单 JSX | HANDOFF 8.1 |
| 改产品名 / 头像 | `AppConfig`（配置化后） | 组件内部 | 本方案 4.2 |
| 对话流插入自定义块 | 待设计：需要给 `AgentResponseBlock` 增加插槽或注册表 | — | **本方案新增待办** |

最后一行是个真实缺口：目前对话流内**没有**"插入产品专属自定义块"的扩展点（`AgentResponseBlock` 还是私有组件）。这是 agent 生成差异化产品时最可能需要的扩展方式，需要在 Phase 2 补设计。

### 6.1 防止 agent 偷懒只填配置

配置化让"改名字/头像/菜单"变得极简单，副作用是 agent 倾向于只做配置能覆盖的事，PM 要求的独特能力被静默忽略，生成结果全是"换了名字的 agent-layout"。

**对策**：在 SKILL.md 决策流程里加一步强制判断，性质等同现有的两阶段确认门：

> 需求里的每项能力，先判断能否用 `AppConfig` + 场景数据覆盖。
> - 能 → 填配置，说明填了什么
> - 不能 → **必须走扩展点**，在需求文档里写明要扩展哪个注册表 / 新增哪个组件
> - **禁止**把不能覆盖的需求悄悄降级成"用现有配置近似一下"

这一步之后接 `DESIGN.md` 第 8 节的六问决策流程（属于哪一层 / 有无产物 / 是否消息语义 / 要不要新层级 / 状态是否已有 / 图标是否已有归属）。

## 7. 设计规则合并

两份文档同一血统，不是竞争关系。最强证据：指南 V1.4 3.2 的"状态层 / 任务层（非必须）/ 执行层"与 `DESIGN.md` 的 L1 / L2 / L3 是**同一个三层模型**，后者只是补上了严格判定规则。

**合并方式：V1.4 做骨架，DESIGN.md 的沉浸式细则填进对应章节。**

| 只在 V1.4 里（保留为骨架） | 只在 DESIGN.md 里（填入细则） |
|---|---|
| 界面形态三分类 + 选型决策树 | 四层信息模型（委托/对话/过程/产物） |
| 能力识别（命名·头像·描述·语气禁止项） | 上下文三分（内联 / 附件 / 不进消息流） |
| 首屏引导 3–5 推荐 | 每轮智能体身份开场 |
| 追问 ≤2 自然语言 / >2 澄清卡片 | 交付物一等公民 + 过程入口与交付指向同一产物 |
| 操作确认 + 风险分级三档 | 容器区分并排（Tab）/ 专注（蒙层） |
| 异常处理七场景 | 四种状态语言唯一表达 |
| 无障碍 WCAG AA + aria 片段 | 深度思考使用边界（只三种场合） |
| 后续引导 2–4 + 禁用场景 | 间距契约 20/8、宽度契约 420/800/320、断点 980/740/659 |
| — | 反面清单（10 条真实复发问题） |

`DESIGN.md` 第 9 节「设计评审清单」与第 10 节「反面清单」**直接升级为 `quality-gates.md` 的检查项**——那两份是实战沉淀，含金量高于现有 G0–G7 里靠推理写的条目。

过滤原则：`HANDOFF.md` 的读者是"维护这个模板的人"，skill 的读者是"拿模板生成新产品的 agent"。**Figma 节点索引（第 10 节）、`.workbuddy` 提醒、"当前工作树有未提交改动"这类项目特定内容不进 skill。**

## 8. 剧本数据：双数据源

原 `mock-script-engine.md` 的 JSON 化方案对**终端用户**无感知（解析在加载边界做一次，下游组件与 6 层 `onOpenArtifact` prop 链完全不动），但对 **agent** 明确更差：失去 `tsc` 字段校验、失去产物引用的编译期检查、失去 IDE 补全、helper 简写要全部展开。

按第 3 节原则（不牺牲生成能力），收敛为**双数据源**：

```
引擎签名：ConversationScene[]        ← 只认这个类型，不关心来源

TS 路径（agent 生成时默认）
  scenes.ts   export const scenes: ConversationScene[] = [...]      ← 完整类型检查

JSON 路径（website 编辑器产出 / 消费）
  scenarios.json + resolveTargets()  →  ConversationScene[]         ← id 字符串换成对象
```

不需要写 TS↔JSON 转换器，只需要引擎支持"传对象进来"，加上 JSON 路径的 `resolveTargets()`。编辑器导出的 JSON 也能被脚手架直接 import。

有利事实：agent-layout **已经在用字符串引用**（`expert: "差旅助手"` 由 `resource-visuals.tsx` 解析，`icon-registry.ts` 同理），所以"字符串 id + 注册表解析"是既定模式，产物 target 改成同一写法反而更一致。

**超出范围、需单独决定**：`chat-5` 澄清表单提交后的续流程时序（1.1 秒 → 插入步骤 → 1.4 秒 → 最终确认）写在 `conversation-flow.tsx` 里，是**代码不是数据**。若希望 PM 在编辑器里编排分阶段推进，需把时序也提成数据（对应剧本引擎的 `steps[].delayMs`）。

## 9. 改造顺序

| Phase | 内容 | 产出 |
|---|---|---|
| **0** | 合并 `design.md`（V1.4 骨架 + DESIGN.md 细则）；评审清单/反面清单升级进 `quality-gates.md`；建组件文档体系骨架 | 纯文档，风险最低，先做以校准后续所有实现 |
| **1** | `git subtree add` 搬入 agent-layout → `templates/immersive-starter/`；接进 workspaces；根 `npm run gate` 跑通 | 仓库整合完成 |
| **2** | `packages/agent-ui` 分层导出（叶子层 / immersive 层）；`AppConfig` 配置化改造；补"对话流自定义块"扩展点 | `<AgentApp config scenes />` 入口成立 |
| **3** | 写组件文档（按 5.2 的目录，逐个核对源码而非照抄 HANDOFF）+ `extension-map.md` | **skill 生成质量的决定性一步**，优先于 website |
| **4** | 补三个 V1.4 缺口组件（`confirm-card` / `error-state` / `follow-up-suggestions`）+ 无障碍层 | V1.4 覆盖完整 |
| **5** | 剧本引擎适配双数据源（`resolveTargets` + `check-scripts.mjs` 适配新数据模型） | 编辑器数据链路就绪 |
| **6** | `copilot-starter` 迁移到 Base UI，复用叶子层 | 助手式保持轻量但技术栈统一 |
| **7** | `website/`（文档站 + 组件画廊 + 播放器 + 在线编辑器） | 最后做 |

## 10. 废弃物清单

诚实列出本次整合会作废的既有成果：

| 内容 | 处置 |
|---|---|
| `packages/agent-ui/src/*.tsx` 9 个 Radix 组件 | **作废**。其中 `confirm-card` / `error-state` / `follow-up-suggestions` 的**设计意图保留**，在 Base UI 上重写并纳入新文档体系 |
| `packages/agent-ui/src/layout/immersive-shell.tsx` | **作废**，被 agent-layout 的 `agent-shell` + `chat-workspace` + `conversation-page` 替换 |
| `packages/agent-ui/src/layout/copilot-shell.tsx` | **保留但需迁移**到 Base UI |
| `packages/agent-ui/src/ui/{button,dropdown-menu}.tsx` | **作废**，改用 agent-layout 的 21 个 Base UI 组件 |
| `templates/immersive-starter/` 整个 | **被替换**为 agent-layout |
| `script-engine/{match,interpolate,parse}.ts` | **大部分保留**（触发匹配、变量插值、校验规则与渲染无关） |
| `script-engine/script-player.tsx` | **重写**，渲染目标从原 7 个组件变为 agent-layout 的组件树 |
| `script-engine/runtime.ts` | **需重构**，与 agent-layout 的"预写场景 + 运行时续流程"模型对齐 |
| `references/component-selection/` 9 份文档 | **内容作废，文档形态保留**（合并进新的单文档结构，见 5.3） |
| `references/patterns/immersive-shell.md` | **重写**，依据 agent-layout 实际结构 |
| `scripts/sync-agent-ui.mjs` | **保留**，需扩展以覆盖更深的目录层级 |
| `scripts/check-scripts.mjs` | **需适配**新数据模型 |
| `references/design.md` | **重写为合并版**，V1.4 转写部分大量保留 |
| `docs/proposals/mock-script-engine.md` | 已按第 8 节更新 |
| `docs/proposals/website-showcase.md` | 已按第 4 节更新 |

`immersive-starter` 那批组件本来就是"等设计稿之前的占位实现"，而 agent-layout 就是那份设计稿的成品形态——作废是预期内的，不是返工。
