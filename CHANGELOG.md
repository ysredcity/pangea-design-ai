# 变更日志（CHANGELOG）

本文件记录 `pangea-design-ai` skill 的重要变更。格式参考 [Keep a Changelog](https://keepachangelog.com/)。

事实源与版本约定见 [CONTRIBUTING.md](./CONTRIBUTING.md)。设计依据：《智能体产品交互设计指南 V1.4》（海信集团）。技术栈：React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui + lucide-react。

> **本文件写给 skill 使用者**，只回答一件事：**这个版本多了什么能力、升级后有什么不一样**。
>
> 过程细节、根因排查、逐项实测记录都在 `PROJECT_CONTEXT.md`（工程台账）。

---

## [Unreleased]

### 后续

- **视觉 token**：补全字体、间距、圆角、阴影与组件级 token，等待设计稿作为事实源。
- **需求规格化**：补充“生成剧本数据映射规则”。
- **构建体积**：沉浸式初始 chunk 超过 500 kB，需要代码分割／按需加载，当前不通过提高告警阈值掩盖。

## [0.3.0] - 2026-09-06

Copilot 助手区按 Pangea AI Components 设计稿完成三态校准，并从“视觉近似共享”升级为直接复用 Agent 中间完整对话 section；两套模板继续保持独立壳层与产物路由。

### Added

- **Copilot 真实三态**：新增 `sidebar | floating | collapsed` 状态契约及受控/非受控 API。侧边栏桌面固定 400px 贴右全高；浮窗为 400×600px、右下 16px、16px 圆角与 xl 阴影；收起后优先使用宿主顶部导航入口，否则显示右下 44×44px Sparkles 按钮。
- **完整对话 Section 跨形态复用**：新增 `ConversationSection`，Agent 与 Copilot 直接共用 rich `ConversationFlow`、rich `Composer`、Markdown、L1/L2/L3、附件、澄清、审批卡片、消息操作、滚动/Footer 与草稿状态，不再为 Copilot 维护轻量近似实现。
- **Copilot Header 完整操作**：按设计稿固定为“新对话、历史对话、切换对话模式、更多、关闭”；模式菜单包含“侧边栏、浮动”，更多菜单包含“分享、设置”，并提供对应配置回调。
- **可分发归档**：新增 `releases/pangea-design-ai-v0.3.0.zip`，保留全部历史归档；排除 `node_modules`、`dist`、`.DS_Store` 与模板本地 `.workbuddy`。

### Changed

- **Copilot 默认使用 rich scene**：合同审阅示例迁移到与 Agent 一致的富场景契约和产品块 renderer；附件、确认卡与执行过程由同一套组件渲染。Copilot 的 `routeArtifact(target)` 仍只更新主画布，不引入沉浸式右侧 Panel。
- **物化管线扩展**：`sync-agent-ui.mjs` 现在把 `ConversationSection` 所需的 canonical Base UI、agent-layout、contracts、hooks、utils 与 theme/typeset 同步到 Copilot 独立模板，避免模板外依赖和双事实源。
- **旧配置兼容**：历史 `assistantMode` 继续映射到新三态，但标记为 deprecated；新工程只使用 `assistantView/defaultAssistantView/onAssistantViewChange`。

### Fixed

- **侧边栏误呈浮窗**：移除 sidebar 对 floating class 的继承；桌面 sidebar 不再在 640–899px 区间错误显示圆角、阴影和右下悬浮定位。
- **移动端 AI 不可达**：打开助手区时改为全屏，不再因断点 `hidden` 丢失对话入口。
- **Copilot 组件视觉漂移**：删除未使用的旧 `CopilotShell.tsx`，并消除 Copilot 自建 Composer、卡片和轻量消息结构导致的 Agent/Copilot 双实现漂移。

## [0.2.0] - 2026-09-06

围绕"实际试用后产出可用但过程冗长"的反馈做了一轮修正：把 skill 更名为 `pangea-design-ai`，修好审批链路的三处失效、把形同死代码的审批校验接回并补齐规则，给场景补上自然语言进入路径，并压缩 agent 的文档阅读负担。

### Added

- **沉浸式场景支持自然语言进入**：`ImmersiveConversationScene` 新增 `trigger`，新对话首句先经 `matchTrigger` 命中已写场景，未命中才回退 `createDraftScene`。此前沉浸式场景只能从侧栏按会话 id 点进去，用户新输入永远拿到草稿，新写的剧本（含审批场景）没有任何自然语言触达路径。命中后首轮用户消息会替换为用户的实际输入与真实附件，后续轮保持剧本。六个示例场景已配 trigger，其中「调研瑞幸」「本周工作进展／生成周报」两条首屏推荐现在能直接进入完整剧本。
- **可分发归档**：`releases/pangea-design-ai-v0.2.0.zip`（285 个文件），含 skill 入口、规则参考、校验脚本与两套脚手架源码；不含 `node_modules`、构建产物或模板本地 `.workbuddy` 记忆。历史归档 `pangea-design-ai-v0.1.0.zip` 与更名前的 `agent-ux-react-v0.1.0.zip` 均保留。

### Changed

- **skill 更名为 `pangea-design-ai`**（原 `agent-ux-react`）：目录、`SKILL.md` frontmatter 的机器标识、根 workspace、同步脚本、组件文档 metadata 与 lockfile 路径均已同步。**升级方式**：重新安装新 ZIP 并删除旧的 `agent-ux-react/` 目录。运行时包名 `@agent-ux/agent-ui` 与既有 imports **保持不变**，不需要改动已生成的工程。
- **`matchTrigger` 改为最长命中优先**：keyword 匹配不再是「按声明顺序首个命中」，而是取匹配到的最长 pattern，长度相同才回到声明顺序。此前把宽泛词写在前面会静默抢占后面更精确的场景，且重排导出顺序就会改变行为；现在结果与声明顺序无关。regex 仅在所有 keyword 均未命中时兜底。函数签名放宽为结构化泛型，沉浸式与 JSON 剧本共用同一份实现。
- **压缩文档阅读负担**：SKILL.md 新增「按任务读取，不要无差别加载」路由表（`references/` 有 50+ 文档、3500+ 行），明确 9 类任务的最小必读集，并说明结论表够用时不必展开 design.md。这是针对"生成过程非常长"反馈的直接措施。

### Fixed

- **审批链路可用性**：`ApprovalOutcomeData` 新增 `productBlock`，审批落地后可在同一轮给出结果卡等产物块；`ApprovalContinuation` 现在透传并渲染它。同时解开「没有 `productBlock` 就不渲染续流程」的隐藏耦合——续流程改由 `awaitingApproval` 判定，此前决策一落地该轮的结构化信息会全部消失，只剩一段文字。
- **审批态改为从场景派生**：末轮 `awaitingApproval` 自动派生为「待批准」（`deriveApprovalStatus`），覆盖初始会话与**新建会话**两条路径。此前新写的审批场景在新对话里完全无表现（不禁用 Composer、无「需要你的批准」、侧栏无标记），且示例依赖在会话 meta 手写 `approvalStatus: 'pending'`；两处手写死数据已移除。
- **审批契约校验此前是死代码**：`check-scripts.mjs` 对沉浸式模板整体短路（有 `scenes.ts` 就 `continue`），而它委托的 `tsc` 查不出这类语义错误。现改为对 TS 场景做括号深度扫描（跳过字符串与注释，避免 `[[file:…]]` 文案干扰），并把审批规则改为双向：`awaitingApproval` **必须在末轮**（写在中间轮会静默失效）、必须配 confirm-card、必须同时有 `approved` 与 `rejected`；孤立的 `approvalOutcomes` 会报错。
- **trigger 歧义机检**：拦截跨场景**重复**（长度相同无法裁决，命中会退化为不确定）或**互为子串**（两个场景的语义边界没划清）的 keyword，并提示改用专属动词短语。规则同时覆盖 TS 场景与 JSON 剧本。
- **产物形态错位（生成质量）**：新增第三道门「交付物只能是可运行的智能体应用」与 G0.5 硬门禁，明确禁止把产物做成规范导览站、组件图谱、落地页、配置/剧本编辑器或需求文档页，并要求首屏可直接发起委托、能走通一轮「委托 → 执行过程 → 结论 → 可点击交付物」。需求文档改为只写在对话回复里，不落盘、不渲染成页面。
- **`project-structure.md` 视角错位**：改为消费者视角优先——产物是复制到**用户工作目录**的独立工程，校验只跑该工程自己的 `npm run gate`；仓库 monorepo 物化管线降级为「仅维护者」小节。此前通篇根级路径与命令会把 agent 的工作目录错误锚回本仓库。
- **`catalog.json` 生成器已失效**：`build-catalog.mjs` 仍在扫描 Phase 3 已移除的 `references/component-selection/`，按 SKILL.md 指示重跑会把机读索引清空。现改为递归扫描 `references/components/`（与 `check-component-docs` 同一套排除规则），索引恢复为 2 个布局外壳 + 40 个组件且路径均有效。
- **门禁与依赖健康**：消除两套模板的 Oxlint warning；移动断点与 Composer 专家选择不再通过 effect 同步派生状态，保留的 shadcn mixed-export API 均使用精确局部抑制。传递依赖 `qs` 已更新至无已知审计漏洞的版本，`npm audit` 结果为 0 vulnerabilities。

## [0.1.0] - 2026-09-03

首个可管理的稳定基线：沉浸式 Agent 与助手式 Copilot 两套独立模板、共享 Base UI 运行时、富场景剧本引擎、组件文档/扩展地图与根级质量门禁均已可用。

### Added（Phase 5：双数据源富场景剧本引擎）

- **富场景成为唯一运行时契约**：共享引擎以 `ConversationScene[]` 为输入，覆盖 L1/L2/L3 执行、澄清、用户/智能体附件、产品块和显式审批结果；不再以一期七块模型渲染第二套消息 UI。
- **TS 与 JSON 两条作者路径均已建立**：沉浸式模板通过 `agent-layout/scenes.ts` 输出经 TypeScript 校验的默认场景；外部 JSON 剧本通过 `resolveTargets()` 在加载边界把 `targetId` 解析为产品注册表中的目标对象，保持共享层不依赖 panel 或 canvas。
- **剧本播放器与质量门禁完成改造**：`ScriptPlayer` 变为委托产品 rich renderer 的中立桥接；`check-scripts.mjs` 会识别 TS 富场景入口，并校验 JSON 富场景的 target ID、澄清/追问约束及高风险审批的五字段、显式 pending 与双结果契约。Copilot 一期 JSON 继续兼容校验。

### Changed（沉浸式 Base UI 脚手架已整合）

- **沉浸式脚手架已切换为完整 Base UI 应用底座**：`templates/immersive-starter/` 由成熟的 `agent-layout` 通过 Git subtree（非 squash）导入，保留上游提交历史；原 Radix 骨架归档为 `archive/immersive-starter-radix/`，不再作为分发模板。
- **模板可独立运行且进入根 workspace 验证**：包名统一为 `immersive-starter`，新增 `npm run gate`（Oxlint + TypeScript + Vite 构建）；根 `npm run gate` 先验证 Base UI 沉浸式，再验证 legacy Copilot。
- **隔离 Base UI 与旧 Radix 同步机制**：`sync-agent-ui.mjs` 现仅同步 Copilot，不能再覆盖沉浸式模板的 Base UI `src/components/ui/`；后续 Phase 2 才会建立新的分层导出与同源机制。
- **清理上游项目专属资料并补充模板说明**：不再分发上游 `AGENTS.md`、`HANDOFF.md` 与工具状态；模板 README 说明独立使用、真实修改入口与纯前端边界。

### Changed（设计规则：操作确认与状态语言扩充）

- **新增"确认卡出现时机"规则**（`design.md` 3.4.1）：只给建议或结论时不出确认卡；用户表达同意后才在真正写入/修改/发送/删除前请求授权，且必须指明具体作用对象。
- **新增"待确认期间阻断新指令"规则**（`design.md` 3.4.2）：高风险确认待决时输入区整体禁用，在执行过程与回复之间给出 destructive 语义的等待提示，会话列表同步标记，批准或拒绝后解除并回写结果；待决判定必须来自显式状态，不能从卡片文案、按钮名或块 ID 推断。
- **状态语言从四种扩为五种**：新增「等待用户批准」（destructive 语义 +「需要你的批准」+ 会话列表「等待批准」），并明确它与「等待用户回复」缺的东西不同、不可互借、同一轮不并存。
- **新增对话默认定位契约**（`design.md` 3.8）：进入或切换任意对话默认停在最新一轮，且需在首次绘制前完成，避免顶部到底部的跳动。
- **质量门禁同步扩充**：G6 覆盖五种状态与 destructive 审批语义，G7 新增确认卡时机、待确认阻断与显式状态判定，G8 新增默认定位检查；扩展点地图新增"待批准阻断"改哪里、不要碰哪里。

### Changed（设计规则与文档体系升级）

- **设计规则合并为单一事实源**：`design.md` 重写为七章结构，由《智能体产品交互设计指南 V1.4》（提供骨架与三形态覆盖）与沉浸式工作台实测契约（提供已验证的具体数值与判定规则）合并而成。每节标注来源（〔指南〕/〔沉浸式契约〕/〔通用契约〕），避免把单形态验证过的契约误当三形态通用规则。
- **新增的设计规则**（此前 skill 未覆盖）：四层信息模型（委托/对话/过程/产物，任何新能力必须先归位）、执行过程 L1/L2/L3 的严格判定规则（绝不为完整性硬造 L2）、上下文按能否内联三分、智能体每轮身份开场、交付物一等公民、产物容器"并排比对 vs 专注查看"判定、四种状态语言唯一表达、一轮对话的间距契约、深度思考面板使用边界、模拟执行的时间结构、动效原则、视觉基础（字号阶梯与已成契约的组件尺寸）、扩展新能力的六问决策流程。
- **响应式规则明确分层**：沉浸式采用实测契约（断点 980/740/659，对话区 `clamp(420px,50%,800px)`，产物面板下限 320px，附九档实测尺寸表）；助手式与嵌入式沿用指南下限（断点 1024/768，菜单栏 240 / 对话流 440 / 工作面板 320）。降级顺序铁律不变：先收左侧菜单栏，再降级右侧面板。
- **质量门禁从 G0–G7 扩到 G0–G9 + 反面清单自查**：新增结构与层级、信息归属、产物与交付、状态语言四组检查；检查项主体替换为实战沉淀条目；末尾 11 条反面清单是真实复发过的问题。
- **组件文档体系完成并具备事实校验**：六层组件正文现覆盖 shared conversation、沉浸式 rich implementation、壳层、注册表与产物 adapter；扩展地图给出 AppConfig、场景、面板、容器与 Copilot 左画布的精确修改路径。新增 `npm run check:component-docs`，在根 gate 的类型/漂移检查之后、模板构建之前验证组件 metadata、事实源路径、层级和设计规则文档路径；交互卡片 API、`onAction` 回写与 renderer 分层边界均已按源码记录。
- **技术栈变更**：组件基础层从 Radix 改为 **Base UI**（shadcn v4）。两者 API 不兼容，参考 shadcn 代码片段前需确认底层。
- **新增强制判断步骤**：每项能力在需求文档阶段必须显式判定"能否用配置 + 场景数据覆盖"，不能覆盖的必须走扩展点并写明扩展内容，**禁止悄悄降级为"用现有配置近似"**。配套新增扩展点地图（要加新东西时查"改哪个文件、不要碰哪个文件"）。

### Added（Phase 4：交互式对话卡与中立事件回写）

- **三张 shared Base UI 对话卡已可复用**：`ConfirmCard`（采用 Pangea AI Components Alert 确认态的标题、说明和右对齐操作；标题固定为 15px/20px，描述为可传入任意 `ReactNode` 的插槽；桌面复用 shadcn `Button` 的 `default` 尺寸，≤659px 以 `lg` 等效的 36px 高度均分满宽操作区；保留高风险五字段、字段≤10、动作≤3 与唯一主操作约束）、`ErrorState`（七种异常场景的事实/影响/下一步）和 `FollowUpSuggestions`（采用与选中专家后推荐列表一致的完整指令纵向行与 `ArrowDownLeft`，2–4 条约束）均由 `@agent-ux/agent-ui/conversation` 导出。
- **事件回写和可访问性边界已建立**：卡片通过中立 `ProductBlockAction` / `ProductBlockContext.onAction` 回传用户选择，不承诺后端成功；跟进建议点击只回填 Composer，用户发送后仅保留最新回复中的建议列表；核心动作支持键盘、44px 触控目标和可控 polite 状态播报。
- **沉浸式报表示例新增高风险审批流**：报表符号建议、调整询问和用户“可以”后的写入前审批构成三轮；`AgentShell` 持有 pending/approved/rejected 状态，统一驱动 destructive 语义的“需要你的批准”提示、Composer 禁用、侧栏 destructive “等待批准”标签和批准/拒绝后的本地演示收尾。活动会话首次进入或切换时默认定位到最新消息。
- **两种产品复用路径明确**：沉浸式以本地 rich adapter 校验并显示本地演示结果；Copilot action 和交付物均通过 `routeArtifact` 只更新左侧画布，不引入右侧 panel/Tab。

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

### Added（Phase 8：真实沉浸式运行时抽取）

- `@agent-ux/agent-ui/immersive` 现公开明确命名的 `ImmersiveAgentApp` 与 rich contracts，并拥有完整 agent-layout、Base UI、hooks、utility 和 canonical theme/typeset。
- immersive 模板通过同步脚本单向物化 runtime，保留产品 config、scenes 和 panel data；Copilot 未接收 immersive 文件。
