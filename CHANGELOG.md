# 变更日志（CHANGELOG）

本文件记录 `agent-ux-react` skill 的重要变更。格式参考 [Keep a Changelog](https://keepachangelog.com/)。

事实源与版本约定见 [CONTRIBUTING.md](./CONTRIBUTING.md)。设计依据：《智能体产品交互设计指南 V1.4》（海信集团）。技术栈：React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui + lucide-react。

> **本文件写给 skill 使用者**，只回答一件事：**这个版本多了什么能力、升级后有什么不一样**。
>
> 过程细节、根因排查、逐项实测记录都在 `PROJECT_CONTEXT.md`（工程台账）。

---

## [Unreleased]

### 计划中

本 skill 正在按 `docs/proposals/agent-layout-integration.md` 分七阶段重构，采纳一个已成型的沉浸式工作台成品作为沉浸式形态的事实源。剩余阶段：

- **Phase 3**：约 30 份组件文档正文 + 扩展点地图的文件级路径回填。
- **Phase 4**：补三个规范缺口组件（确认卡片 / 异常状态 / 后续引导）+ 无障碍补齐。
- **Phase 5**：剧本引擎适配双数据源。
- **Phase 7**：`website/` 文档站 + 组件画廊 + 沉浸式在线编辑器。
- 将完整沉浸式 `AgentApp` 壳层抽取进 package；当前成熟的 panel/image adapter 仍留在模板形态层。
- 补全视觉 token：字体、间距、圆角、阴影（等待设计稿）。
- 需求规格化流程补一节"生成剧本数据的映射规则"。

### Changed（沉浸式 Base UI 脚手架已整合）

- **沉浸式脚手架已切换为完整 Base UI 应用底座**：`templates/immersive-starter/` 由成熟的 `agent-layout` 通过 Git subtree（非 squash）导入，保留上游提交历史；原 Radix 骨架归档为 `archive/immersive-starter-radix/`，不再作为分发模板。
- **模板可独立运行且进入根 workspace 验证**：包名统一为 `immersive-starter`，新增 `npm run gate`（Oxlint + TypeScript + Vite 构建）；根 `npm run gate` 先验证 Base UI 沉浸式，再验证 legacy Copilot。
- **隔离 Base UI 与旧 Radix 同步机制**：`sync-agent-ui.mjs` 现仅同步 Copilot，不能再覆盖沉浸式模板的 Base UI `src/components/ui/`；后续 Phase 2 才会建立新的分层导出与同源机制。
- **清理上游项目专属资料并补充模板说明**：不再分发上游 `AGENTS.md`、`HANDOFF.md` 与工具状态；模板 README 说明独立使用、真实修改入口与纯前端边界。

### Changed（设计规则与文档体系升级）

- **设计规则合并为单一事实源**：`design.md` 重写为七章结构，由《智能体产品交互设计指南 V1.4》（提供骨架与三形态覆盖）与沉浸式工作台实测契约（提供已验证的具体数值与判定规则）合并而成。每节标注来源（〔指南〕/〔沉浸式契约〕/〔通用契约〕），避免把单形态验证过的契约误当三形态通用规则。
- **新增的设计规则**（此前 skill 未覆盖）：四层信息模型（委托/对话/过程/产物，任何新能力必须先归位）、执行过程 L1/L2/L3 的严格判定规则（绝不为完整性硬造 L2）、上下文按能否内联三分、智能体每轮身份开场、交付物一等公民、产物容器"并排比对 vs 专注查看"判定、四种状态语言唯一表达、一轮对话的间距契约、深度思考面板使用边界、模拟执行的时间结构、动效原则、视觉基础（字号阶梯与已成契约的组件尺寸）、扩展新能力的六问决策流程。
- **响应式规则明确分层**：沉浸式采用实测契约（断点 980/740/659，对话区 `clamp(420px,50%,800px)`，产物面板下限 320px，附九档实测尺寸表）；助手式与嵌入式沿用指南下限（断点 1024/768，菜单栏 240 / 对话流 440 / 工作面板 320）。降级顺序铁律不变：先收左侧菜单栏，再降级右侧面板。
- **质量门禁从 G0–G7 扩到 G0–G9 + 反面清单自查**：新增结构与层级、信息归属、产物与交付、状态语言四组检查；检查项主体替换为实战沉淀条目；末尾 11 条反面清单是真实复发过的问题。
- **组件文档体系重构**：按四层信息模型 + 壳层 + 注册表六组管理（替代原先扁平的 `component-selection/`），每份文档标注 `layer`（所属信息层）、`exported`（公共导出 vs 内部实现）、`designRules`（反查设计依据）。新增底层基础件清单，记录 Base UI 特有约定与已踩坑。
- **技术栈变更**：组件基础层从 Radix 改为 **Base UI**（shadcn v4）。两者 API 不兼容，参考 shadcn 代码片段前需确认底层。
- **新增强制判断步骤**：每项能力在需求文档阶段必须显式判定"能否用配置 + 场景数据覆盖"，不能覆盖的必须走扩展点并写明扩展内容，**禁止悄悄降级为"用现有配置近似"**。配套新增扩展点地图（要加新东西时查"改哪个文件、不要碰哪个文件"）。

### Added（Mock 对话剧本引擎）

### Added（Mock 对话剧本引擎）

- **剧本引擎**（`packages/agent-ui` 内新增 `script-engine/` 模块，两套脚手架共享）：把此前写死在页面代码里的对话分支（`if (text.includes(...))`）改造成 JSON 数据驱动。剧本用 `scenarios.json` 描述，由 `useScriptRuntime` + `<ScriptPlayer>` 解释执行渲染。
- **7 种响应块类型**，一一对应已有对话组件：`markdown`（消息气泡）、`taskProgress`（任务过程，状态层/任务层/执行层三级 + 渐进式节奏控制）、`clarifyCard`（澄清卡片）、`confirmCard`（确认卡片，含高风险字段完整性提示）、`artifactCard`（制品卡片）、`errorState`（异常状态）、`followUp`（后续引导）。
- **状态机式剧本结构**：场景（scenario）由关键词/正则触发，内部由节点（node）+ 分支（branch）组成，支持"确认/跳过走向不同后续内容"这类真实交互，而非一问一答的线性列表。
- **变量插值**：`{{fieldKey}}` 语法把澄清卡片提交的字段值回填进后续文本。
- **兜底回复**：未命中任何场景时从 `fallback.pool` 随机挑一句话术，池子为空退回固定 echo。
- **`check-scripts.mjs` 机检**：校验 `scenarios.json` 是否违反设计规则硬约束（字段数、按钮数、高风险字段完整性、分支目标节点存在性），已接入两套脚手架的 `npm run gate`。
- 两套脚手架的示例场景（合同审核助手/合同审阅助手）已迁移为剧本驱动，`src/mock/scenarios.json` 可直接编辑话术与分支，无需改代码。

### Added（两套脚手架可运行）

- **`templates/immersive-starter/`**：沉浸式 Agent 可运行脚手架（React 19 + Vite + TS + Tailwind CSS v4 + shadcn/ui + lucide-react + react-markdown）。含 `ImmersiveShell` 布局外壳组件、9 个 `agent-ui/` 公共对话组件实现、一个"合同审核助手"演示场景（首屏引导、意图输入、澄清卡片、高风险确认卡片、制品卡片、后续引导）。`npm run gate`（token 机检 + 类型检查 + 构建）与 `npm run dev` 均已验证通过。
- **`templates/copilot-starter/`**：助手式 Copilot 可运行脚手架，同技术栈。含 `CopilotShell` 布局外壳组件（支持三栏并列/浮窗/浮层抽屉/侧边抽屉四种子类型）、共享的 9 个 `agent-ui/` 组件、一个"合同审阅助手"演示场景（主工作区文档预览 + 右侧对话辅助区的中风险确认卡片）。`npm run gate` 与 `npm run dev` 均已验证通过。
- **公共对话组件层 `agent-ui/` 全部落地**：`Composer`（意图输入）、`MessageBubble`（消息气泡，支持流式态与 aria-live）、`TaskProgress`（状态层/任务层/执行层三级展示）、`ClarifyCard`（澄清卡片，字段≤10/按钮≤3 运行时提示）、`ConfirmCard`（确认卡片，高风险场景强制展示对象/动作/影响范围/后果字段）、`ArtifactCard`（制品卡片摘要）、`MessageActions`（消息操作栏，高频/低频分层）、`FollowUpSuggestions`（后续引导，2–4 个）、`ErrorState`（七种异常场景）。两套脚手架各自拷贝一份，非共享依赖。
- **质量门禁机检脚本**：`scripts/check-tokens.mjs`（扫描两套脚手架源码中的裸 hex/rgb 颜色值）、`scripts/build-catalog.mjs`（从 `references/patterns/`、`references/component-selection/` 的 frontmatter 生成机读索引 `references/_generated/catalog.json`）。两套脚手架的 `package.json` 已接入 `npm run check:tokens` 与 `npm run gate`。

### Added（骨架搭建）

- 初始化仓库治理骨架：`README.md`、`CONTRIBUTING.md`、`CHANGELOG.md`、`.gitignore`。
- **全局设计规则 `references/design.md`**：把《智能体产品交互设计指南 V1.4》转写为机读规则，覆盖核心原则、能力识别与首屏引导、界面形态选型（沉浸式/助手式/嵌入式）与响应式降级、场景链路七环节（意图输入/任务过程透明/追问澄清/操作确认/结果呈现/消息操作/后续引导）、风险分级与人工接管、异常处理、无障碍。
- **视觉 token 占位 `references/theme/design-tokens.md`**：已收录用户提供的 shadcn + Tailwind v4 语义色变量（品牌色 `--primary` 为青色 `teal-600`、亮/暗色模式、自定义的 `-bg` 浅底变体与桌面/移动端背景变量），字体/间距/圆角等待补充。
- **界面形态决策树与两阶段确认门**：`SKILL.md` 顶部两阶段强制门（需求文档确认后才能动工程），界面形态决策树对应两套独立脚手架。
- **布局外壳文档**：`references/patterns/immersive-shell.md`（沉浸式三栏）、`references/patterns/copilot-shell.md`（助手式三栏 + 浮窗/浮层抽屉/侧边抽屉三种子类型）。
- **公共对话组件选型元数据**（9 个）：意图输入区 Composer、消息气泡 MessageBubble、任务过程 TaskProgress、澄清卡片 ClarifyCard、确认卡片 ConfirmCard、制品卡片 ArtifactCard、消息操作栏 MessageActions、后续引导 FollowUpSuggestions、异常状态 ErrorState。
- **质量门禁 `quality-gates.md`（G0–G7）**：需求确认门禁、编译与类型、Token 规范、界面形态与组件用法、响应式降级、卡片硬约束与风险分级、异常处理、无障碍。
- **需求规格化流程 `requirement-intake.md`**：含界面形态判定、澄清问题清单、需求文档模板、确认闸门。
- **元数据 Schema `metadata-schema.md`**：布局外壳（`layout-shell`）与组件（`component`）两类 frontmatter 规范。
- **PM Demo 自动化预览约定**：明确要求 agent 首次生成后自动 `npm install` + `npm run dev`，每轮修改后自动确认/重启 dev server，不需要用户手动触发预览（与 Pangea 因安全扫描收紧的做法刻意不同）。

### Changed（Phase 2：双形态 Base UI 对话域）

- **共享对话域与双壳层迁移**：`packages/agent-ui` 现在提供 `conversation`、`immersive`、`copilot` 分层入口；所有 active manifest 已移除 Radix 依赖。
- **Copilot 改用 Base UI 对话域**：合同审阅示例由 `CopilotApp` 装配，共享消息/执行/Composer 与中立交付物入口；交付物点击只更新左侧合同工作区，不会出现沉浸式右侧产物面板。
- **同步与验证重建**：同步脚本同时物化两个模板的 Base UI 源码和零依赖质量脚本，并可用 `--check` 验证漂移；根 gate 固定执行 package 类型检查、双模板 drift、沉浸式与 Copilot 验证。复制模板后可独立运行 `npm install && npm run gate`。
- **扩展边界明确**：`AppConfig` 保持身份/导航/欢迎页职责；业务场景、面板容器与产品专属对话块仍走 TypeScript 扩展点。
