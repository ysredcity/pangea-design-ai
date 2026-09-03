---
name: pangea-design-ai
description: "⚠️ 硬约束（最高优先级）：任何「生成/新建智能体产品界面」的需求，必须先输出「界面架构需求文档」并经用户明确确认，确认后的下一轮才写代码；禁止同一轮里既出需求文档又动工程。本 skill 是智能体产品交互设计的 React 前端参考，事实源为《智能体产品交互设计指南V1.4》（海信集团）+ 沉浸式工作台实测契约，技术栈为 Vite 8 + React 19 + TypeScript + Tailwind CSS v4 + shadcn v4（底层 Base UI）+ lucide-react。当用户要求构建智能体产品、AI 助手、Agent、Copilot、对话式界面，或提到沉浸式/助手式/嵌入式界面形态、对话流、执行过程 L1/L2/L3、动作 Badge、深度思考面板、澄清表单、确认卡片、产物面板与容器 Tab、意图输入/Composer、内联标签，或使用 shadcn、Base UI、Tailwind、lucide-react 编写前端代码时使用。覆盖需求规格化、界面形态选型、四层信息模型归位、组件体系、视觉 token、响应式与无障碍、质量门禁。"
---

# Pangea Design AI Skill

智能体产品交互设计的 React 实现说明。

> **当前稳定基线：v0.1.0（2026-09-03）**。该版本已固化两套独立脚手架、共享 Base UI 运行时、富场景剧本引擎、组件文档与根级质量门禁；具体发布记录见 [CHANGELOG.md](../../CHANGELOG.md)。

**设计规则事实源**：[references/design.md](references/design.md)，由两份上游合并而成——《[智能体产品交互设计指南 V1.4](../../docs/智能体产品交互设计指南V1.4.md)》（海信集团，提供骨架与三形态覆盖）+ 沉浸式工作台实测契约（提供已验证的具体数值与判定规则）。正文用〔指南〕/〔沉浸式契约〕/〔通用契约〕标注来源，冲突时以 design.md 为准。

## 🚦 最高优先级：两阶段强制门（先确认需求文档，再写代码）

**任何「生成/新建智能体产品界面」的需求，必须分两个回合完成，禁止在同一轮里既出需求文档又出工程代码。**

| 阶段 | 你要做的 | 你**禁止**做的 |
|---|---|---|
| **阶段一（本轮）** | 有限轮澄清（最多 1–2 轮，一次性打包问）→ 判断界面形态 → **逐项判断能否用配置覆盖**（见下方第二道门）→ 输出**界面架构需求文档** → **明确请用户确认或修改** → **结束本轮回复，停下等待** | ❌ 创建/修改任何工程文件（含脚手架初始化、复制模板、`npm install`、起 dev server、写组件/页面）<br>❌ 在同一条回复里继续进入生成<br>❌ 自问自答"已确认，我继续" |
| **阶段二（用户确认后的下一轮）** | 按已确认文档起脚手架 → 生成 → 类型检查 → 质量门禁 → 交付（**自动启动预览**） | ❌ 偏离已确认文档（要改先说明） |

**判定「已确认」的唯一标准**：用户在**看到需求文档之后**给出明确肯定答复。用户最初那句需求、用户回答澄清问题、你自己推断"应该没问题"都**不算**确认。

**唯一可跳过本门的情形**（从严解释）：① 已确认文档下的增量；② 纯样式/文案/单点微调；③ 用户**显式**要求「不用出文档，直接做」。

完整流程见 [需求规格化](references/overview/requirement-intake.md)。

## 🚦 第二道门：每项能力先判断「能否用配置覆盖」

脚手架起点已经是一个功能完整的成品，改产品名/头像/侧栏菜单/首屏推荐/对话剧本都只需改配置。这带来一个真实风险：**你会倾向于只做配置能覆盖的事，把用户要求的独特能力静默忽略，最后交付一个"换了名字的模板"。**

因此需求文档里**每一项能力**都必须显式判定：

| 判定 | 处理 |
|---|---|
| **能**用配置 + 场景数据覆盖 | 填配置，在文档里说明填了什么 |
| **不能**覆盖 | **必须走扩展点**，在文档里写明要扩展哪个注册表 / 新增哪个组件 / 改哪个文件 |

> ⛔ **禁止**把不能覆盖的需求悄悄降级成"用现有配置近似一下"。这是 [质量门禁反面清单](references/overview/quality-gates.md#反面清单自查) 的最后一条。

判定为"不能覆盖"后，依次走：
1. [design.md 第七章的六问决策流程](references/design.md#七扩展新能力的决策流程) —— 决定它属于哪一层、有无产物、是否消息语义、要不要新层级、状态与图标是否已有归属。
2. [extension-map.md](references/overview/extension-map.md) —— 查"改哪个文件、不要碰哪个文件"。

## 定位与适用范围

本 skill 面向**智能体产品**（AI Agent / Copilot / 对话式应用）的前端交互实现。设计判断以五条核心原则为准：**准确、克制、轻量、可信、普适**（见 [design.md 0.1](references/design.md#01-五条核心原则)）。

技术栈固定为 **Vite 8 + React 19 + TypeScript + Tailwind CSS v4 + shadcn v4（底层 Base UI）+ lucide-react**：

- **组件基础层**用 shadcn v4，底层是 **Base UI**（`@base-ui/react`），**不是 Radix**——两者 API 不兼容，参考任何 shadcn 代码片段前先确认底层。可用基础件清单与本项目约定见 [base-inventory.md](references/components/base-inventory.md)。
- **视觉 token** 由工程 `src/index.css` 的 `@theme`/`:root`/`.dark` CSS 变量决定，事实源见 [design-tokens.md](references/theme/design-tokens.md)。
- **图标**统一 `lucide-react`，不混用其它图标库。
- 其它固定依赖：Geist Variable 字体、Sonner（Toast）、react-markdown + remark-gfm、react-day-picker + date-fns（版本需锁定）。

## 核心目的与受众

产出物是一个**可运行的 React 工程**，同时服务两类使用者（差别只在数据来源）：

- **产品经理（PM）**：快速产出**高保真 demo 原型**（mock 剧本数据），用于评审、对齐、演示。
- **开发工程师**：基于 **PRD 直接产出符合交互规范的界面**（对接既有后端接口）。

### 纯前端铁律

产出范围仅限前端（页面/组件/前端状态/mock 或调用既有接口）。**不产出、不涉及任何后端代码或服务**，不引入请求库、状态管理库，不做鉴权与持久化。

## 界面形态决策树（先选型，再动手）

**在需求文档确认后**，先判断界面形态——这是**整个应用容器级**的决策，决定用哪套脚手架起步。依据见 [design.md 2.1](references/design.md#21-界面形态选型)：

```
主要任务是什么？（由任务决定，不由"是否接入 AI"决定）
├─ 用自然语言表达目标、等待结果，需要专注连贯环境
│     → 沉浸式 Agent  例：通用助手、客服、问答
│     → 脚手架 templates/immersive-starter/（完整成品，细则已实测）
│
├─ 围绕画布/代码/表格/设计稿持续操作，AI 辅助但不想离开主工作区
│     → 助手式 Copilot（三栏并列 / 浮窗 / 浮层抽屉 / 侧边抽屉）  例：IDE、设计、BI、合同审阅
│     → 脚手架 templates/copilot-starter/（轻量骨架，细则未实测）
│
└─ 在现有工作流里要轻量即时的 AI（翻译/润色），无需独立对话空间
       → 嵌入式 Embedded（划词工具栏/悬浮卡/右键菜单）  例：文档、表格内嵌
       → 不提供脚手架；按 design.md 2.4 现场设计，仍受 token/组件约束
```

**一句话选型**：AI 是主角还是配角？配角就别抢主工作区。

> 两套脚手架是**独立起始工程**，不是同一工程里切换的 Layout——产品通常在立项时就确定形态。**两者共享同一 Base UI 对话域，但壳层不统一：沉浸式把产物适配到右侧 Tab/图片蒙层，Copilot 把产物适配到左侧画布；共享域只认识中立的 `ArtifactRouter(target)`，不认识任一容器实现。

> ⚑ **动手前先过 G0**，生成或修改后按 [质量门禁 G1–G9 + 反面清单](references/overview/quality-gates.md) 逐项自检再交付。

## 关键约定

- React 19 + TypeScript，函数组件 + Hooks，不用 class 组件。
- **不引入状态管理库**，状态只用 React 内置能力，归属应用壳层或最近的合适组件。
- 组件优先用已有基础件（`src/components/ui/`），需要新的用 `npx shadcn add <component>`，**不自建平行的按钮/输入框等基础控件**。
- 图标统一 `import { XxxIcon } from 'lucide-react'`，不用裸 SVG（除非 lucide 无对应图标，需先向用户确认）。
- 颜色**只用语义 Token**（`background`/`foreground`/`muted`/`accent`/`primary`/`primary-bg`/`sidebar-*`/`success`/`warning`/`info`/`destructive`），**不写裸 hex/rgb**，不直接引用调色板层变量，不绕过 `src/index.css`。
- 样式用 Tailwind utility class + `cn()` 合并条件类名；避免 CSS Module / styled-components。
- **数据与呈现分离**：新增对话场景只改剧本数据，新增面板内容只改面板数据，**不在 JSX 内嵌示例数据**。
- **按职责改文件**，不要把视图逻辑回填进页面壳层。改动前查 [extension-map.md](references/overview/extension-map.md)。
- **上下文与能力图标统一走注册表**，文件类型与专家头像只扩展资源视觉映射文件，**不在组件 JSX 里即兴硬编码图标映射**。
- **不为假设的未来提前抽象**：交互形态未确定时用占位，不硬造业务流程。

### 全局设计规则（正文见 design.md）

跨界面形态/跨场景生效的规则**统一收在 [references/design.md](references/design.md)**，本文件只留结论：

| 规则 | 一句话结论 |
|---|---|
| [核心原则](references/design.md#01-五条核心原则) | 准确、克制、轻量、可信、普适——冲突时回来对照 |
| [四层信息模型](references/design.md#02-产品心智模型与四层信息分层) | 核心是「委托→执行→交付」的可信闭环；任何新能力先归位到委托/对话/过程/产物某一层 |
| [能力识别](references/design.md#11-能力识别) | 功能导向命名、虚拟形象头像，不得让用户误以为在和真人对话 |
| [首屏引导](references/design.md#12-首屏引导) | 欢迎语+核心能力+3–5 个可点击推荐操作，禁止"有什么可以帮你"式模糊引导 |
| [身份开场](references/design.md#13-智能体身份开场) | 每轮智能体侧以头像+名称开场；专家属智能体侧，不进用户消息 |
| [界面形态选型](references/design.md#21-界面形态选型) | AI 是主角还是配角决定沉浸式/助手式/嵌入式，配角别抢主工作区 |
| [响应式](references/design.md#22-响应式与空间分配) | 沉浸式 980/740/659 + 对话区 clamp(420,50%,800)/面板 min320；**降级先收左菜单，再降级右面板** |
| [意图输入](references/design.md#31-意图输入) | 提示词/上下文/能力三要素；上下文按能否内联三分；同一对象图标必须一致 |
| [执行过程](references/design.md#32-执行过程透明) | 结论优先、过程默认收起；L1/L2/L3 反映真实复杂度**绝不硬造 L2**；有产物才可点击；深度思考只三种场合 |
| [追问澄清](references/design.md#33-追问澄清) | ≤2 项自然语言，>2 项表单卡片（字段≤10/按钮≤3/主按钮≤1）；提交后转只读；任何追问可跳过 |
| [操作确认](references/design.md#34-操作确认) | 高风险必须走确认卡片强确认，含对象/动作/影响范围/后果/操作人，结果回写对话流 |
| [结果与产物](references/design.md#35-结果呈现与产物容器) | 交付物是一等公民，结论文字不算交付；过程入口与交付指向同一产物；并排用 Tab、专注用蒙层 |
| [消息操作](references/design.md#36-消息操作) | 悬停操作栏常驻占位+透明度切换（不条件渲染）；复制原地变对勾不弹 Toast |
| [后续引导](references/design.md#37-后续引导) | 2–4 个基于上下文的推荐追问，四类场景禁用 |
| [间距契约](references/design.md#38-一轮对话的结构与间距契约) | 消息块间 20px、身份到执行 8px、执行到正文 20px、用户消息内部 8px |
| [状态语言](references/design.md#41-五种状态语言) | 执行中/等待回复/等待批准/完成未读/已提交，五种唯一表达不互借；"需要你的回复"只在最后一轮，"需要你的批准"用 destructive 语义 |
| [动效](references/design.md#43-动效原则) | 只解释空间与状态；收起态不可聚焦；切换对话立即清理；同一效果只一个实现 |
| [风险分级](references/design.md#51-风险分级与人工接管) | 低（只读直接执行）/中（轻量确认）/高（强确认+完整审计），写操作不得静默执行 |
| [异常处理](references/design.md#52-异常处理) | 说清"发生了什么/影响了什么/下一步怎么做"，不得暗示未完成的任务已成功 |
| [无障碍](references/design.md#53-无障碍与包容性) | WCAG AA、纯图标按钮有 aria-label、触控≥44px、流式用 aria-live；**现有实现覆盖偏薄需主动补齐** |
| [视觉基础](references/design.md#六视觉基础) | 正文 15px/1.6、辅助 14px/20px、次要 12px；Badge 32px、卡片 600px、侧栏 240px 等已成契约 |

## Skill 索引

### 设计规则（先读）

| 主题 | 文件 | 适用场景 |
|---|---|---|
| **全局设计规则** | [design.md](references/design.md) | **唯一事实源**：七章（核心原则与心智模型 / 能力识别与引导 / 界面形态与空间 / 场景链路 / 状态与反馈 / 全局规则 / 视觉基础 / 扩展决策流程） |

### 主题与配置

| 主题 | 文件 | 适用场景 |
|---|---|---|
| 设计 Token | [design-tokens.md](references/theme/design-tokens.md) | 主题变量取值表（**当前仅语义色层完整，字体/间距/圆角待补充**） |
| 需求规格化（生成前第一步） | [requirement-intake.md](references/overview/requirement-intake.md) | 把任意颗粒度输入转成含形态选型与配置/扩展判定的需求文档 |
| 工程结构与生成层级 | [project-structure.md](references/overview/project-structure.md) | 脚手架结构、依赖约定、组件层复用方式、PM demo 自动化预览 |
| **扩展点地图** | [extension-map.md](references/overview/extension-map.md) | **要加新东西时先查这里**：改哪个文件、不要碰哪个文件 |
| 质量门禁 | [quality-gates.md](references/overview/quality-gates.md) | G0（需求确认+配置判定）+ G1–G9 + 反面清单自查 |
| 元数据 Schema | [metadata-schema.md](references/overview/metadata-schema.md) | 组件元数据 frontmatter 规范（含 `layer`/`exported`/`designRules`）+ `catalog.json` 约定 |

### 组件体系

| 主题 | 文件 | 适用场景 |
|---|---|---|
| **组件索引** | [components/README.md](references/components/README.md) | 按四层信息模型 + 壳层 + 注册表六组管理；**含公共导出 vs 内部实现的划线** |
| 底层基础件清单 | [components/base-inventory.md](references/components/base-inventory.md) | 21 个 shadcn v4 / Base UI 基础件 + 本项目约定与已踩坑 |
| 委托层 | [components/delegation/](references/components/delegation/) | 意图输入区、新对话页与推荐区 |
| 对话层 | [components/conversation/](references/components/conversation/) | 对话流、用户消息、身份、澄清表单、消息操作、内联标签 |
| 过程层 | [components/process/](references/components/process/) | L1 状态摘要、L2 规划任务、L3 执行步骤、动作 Badge、深度思考面板 |
| 产物层 | [components/artifact/](references/components/artifact/) | 面板框架、产物契约、容器注册表、三类容器、图片查看器 |
| 壳层与导航 | [components/shell/](references/components/shell/) | 应用总壳、工作区分栏、对话页壳、侧栏 |
| 注册表与视觉映射 | [components/registry/](references/components/registry/) | 图标注册表、资源视觉映射、通用图标按钮 |

### 界面形态骨架

| 主题 | 文件 | 适用场景 |
|---|---|---|
| 沉浸式 Agent | [immersive-shell.md](references/patterns/immersive-shell.md) | 左菜单（可选）+ 中对话流 + 右产物面板 |
| 助手式 Copilot | [copilot-shell.md](references/patterns/copilot-shell.md) | 左资源区 + 中主工作区 + 右对话辅助区（或浮窗/抽屉） |

### 机读索引

`references/_generated/catalog.json`（由 `scripts/build-catalog.mjs` 从各文档 frontmatter 生成，按 `kind` 与 `layer` 归组）。**改元数据后需重跑生成器。**

## PM Demo 模式：自动化预览

**核心要求**：用户不应关注工程编译、启动等事情，**每次改动都自动执行启动**，不需要用户额外说"运行一下"。

| 阶段 | Agent 必须做的事 | PM 需要做的事 |
|---|---|---|
| **首次生成**（仅在需求文档**已确认**后执行） | 1. 从对应形态的脚手架初始化工程<br>2. `npm install`<br>3. 生成后先跑类型检查确认无错<br>4. **自动启动 `npm run dev`（后台）**<br>5. 告知预览地址 | 打开浏览器访问地址 |
| **每轮修改** | 1. 修改代码<br>2. 跑类型检查<br>3. **确认 dev server 仍在运行**，若已停止**自动重启**<br>4. 告知"已更新，刷新浏览器即可" | 刷新浏览器看效果 |
| **页面空白/编译报错** | 定位、自动修复，不把报错抛给用户 | 无需任何操作 |
| **会话结束** | 告知工程位置；`npm run build` 确认可构建 | 保存工程目录即可 |

> 与 pangea-design-skill 的刻意差异：那边因平台安全扫描把"会话开始自动装依赖/起服务"判定为风险而移除；本 skill 按用户明确要求**保留自动启动**。若未来涉及上传第三方平台分发，需重新评估该权衡。

## 当前版本与后续补充

**v0.1.0** 是首个可管理的稳定基线：Phase 0–8 均已完成，包含合并后的设计规则与 G0–G9 门禁、组件文档与扩展地图、三张 shared 交互卡、TS/JSON 双数据源剧本引擎、Base UI 沉浸式/助手式模板，以及 package-owned 的完整 `ImmersiveAgentApp` 运行时。两套模板复制到仓库外后均可独立执行 `npm install && npm run gate`。

当前不阻塞 v0.1.0、但应在后续版本单独处理的事项：

- **视觉 token 全量**：字体、间距、圆角、阴影与组件级 token，等待设计稿作为事实源。
- **需求规格化映射**：补充从确认需求到剧本数据的映射规则。
- **Website / Showcase**：当前功能作为内部展示基线保留；体验、信息架构与演示质量优化暂缓，不应反向影响 skill、模板或共享运行时。
- **嵌入式参考实现**：继续按场景生成，不在当前版本固化第三套模板。

版本升级、变更记录与发布前验证见 [CONTRIBUTING.md](../../CONTRIBUTING.md) 和 [CHANGELOG.md](../../CHANGELOG.md)。
