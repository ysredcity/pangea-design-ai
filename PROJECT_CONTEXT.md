# 项目上下文台账（PROJECT_CONTEXT）

> **这是本项目的单一事实源（Single Source of Truth）。** 每次新会话开始时先读它；完成里程碑、做出重要决策、或新增/移动文件后**及时更新它**。最后更新：2026-09-03（已用 `date` 命令核实，不用会话上下文里可能过期的注入日期——见 pangea 台账的教训）。

---

## 1. 项目是什么

`pangea-design-ai`：**智能体产品交互设计的 React skill**——给 AI agent 消费的知识库，让 agent 产出「交互符合《智能体产品交互设计指南》+ 视觉符合 shadcn 主题」的前端代码。

设计依据：`docs/智能体产品交互设计指南V1.4.md`（海信集团，人读原文）。技术栈：**React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui + lucide-react**。

产出物是**可运行的 React 工程**，服务两类使用者：PM（mock 数据出高保真 demo）、开发（真实接口出交付代码）。

## 2. 与 pangea-design-skill 的关系（参照但不同）

本项目参照 `/Users/yangshuo/Code/pangea-design-skill` 的**治理骨架**（README/CONTRIBUTING/CHANGELOG/PROJECT_CONTEXT 四件套分工、design.md 唯一设计规则事实源、frontmatter meta + catalog.json 机读索引、quality-gates 分级门禁、两阶段确认门），但**内容与技术栈完全不同**：

| 维度 | pangea-design-skill | pangea-design-ai（本项目） |
|---|---|---|
| 领域 | 海信 B 端/中后台管理系统 | 智能体产品（AI Agent/Copilot） |
| 技术栈 | Vue 3 + Arco Design Vue + 定制主题包 | React 19 + shadcn/ui + Tailwind v4 |
| 选型决策粒度 | 页面级（9 个页面模板：列表/表单/详情...） | **应用容器级**（界面形态：沉浸式/助手式/嵌入式）+ 对话流组件级 |
| 脚手架数量 | 1 个（Layout 内切页面路由，单/多模块开关） | **2 个独立脚手架**（沉浸式/助手式，不做运行时切换，因为产品立项时形态已定；⚠️ 2026-08-27 起两者共享 `packages/agent-ui` 单一组件源码，见第 3/4 节） |
| PM Demo 自动化 | 因平台安全扫描移除"会话开始自动执行"，改为"用户要求预览时才执行" | **用户明确要求保留自动启动**——每次改动都自动执行预览，这是本项目与 pangea 的刻意差异点，未来若涉及分发到第三方平台需重新评估 |

## 3. 当前状态（Status）

- ✅ **仓库治理骨架已建**：`README.md`、`CONTRIBUTING.md`、`CHANGELOG.md`、`PROJECT_CONTEXT.md`（本文件）、`.gitignore`。
- ✅ **skill 主体已建**：`skills/pangea-design-ai/`。
  - `SKILL.md`：两阶段确认门 + 定位/技术栈 + 界面形态决策树 + 关键约定 + 全局设计规则结论表 + 完整索引 + PM Demo 自动化预览约定。
  - `references/design.md`：《智能体产品交互设计指南 V1.4》的**完整机读转写**，四大分组（核心原则/能力识别引导/界面形态/场景链路/全局规则，实际编号为零~四共 5 组），含速查目录、锚点、机检提示。
  - `references/theme/design-tokens.md`：**只有语义色 token 完整**（用户已提供的 shadcn+Tailwind v4 `:root`/`.dark` 变量表，含亮暗色对照与自定义变量的特别说明），字体/间距/圆角/阴影/组件级 token **明确标注为待补充**，文件内有清单式 TODO。
  - `references/patterns/`：两个布局外壳文档（`immersive-shell.md`、`copilot-shell.md`），各含 ASCII 结构图、区块职责表、响应式降级细则、与脚手架的对应关系（脚手架代码尚未写）。
  - `references/component-selection/`：9 个公共对话组件的选型元数据文档（Composer/MessageBubble/TaskProgress/ClarifyCard/ConfirmCard/ArtifactCard/MessageActions/FollowUpSuggestions/ErrorState），每个含结构模板、硬约束、API 要点、常见坑，均带 frontmatter `meta`。
  - `references/overview/`：`requirement-intake.md`（需求规格化流程+文档模板）、`quality-gates.md`（G0–G7）、`metadata-schema.md`（layout-shell/component 两类 schema）、`project-structure.md`（工程结构、两套脚手架关系、依赖约定、PM Demo 自动化预览的详细版本）。
- ✅ **两套脚手架已可运行**：`templates/immersive-starter/`（沉浸式，示例场景"合同审核助手"）、`templates/copilot-starter/`（助手式，示例场景"合同审阅助手"）。均为 Vite + React 19 + TS + Tailwind v4 + shadcn/ui（new-york 风格，neutral 基色）+ lucide-react + react-markdown。`npm run gate`（= `check:tokens` + `tsc -b` + `vite build`）在两套脚手架均通过；`npm run dev` 已实测起服务并 `curl` 验证 200。
  - `ImmersiveShell.tsx` / `CopilotShell.tsx`：布局外壳组件，按 `patterns/*.md` 的插槽 API 实现（沉浸式：`sidebar`/`children`/`panel`；助手式：`resourcePanel`/`children`/`assistant` + `assistantMode` 四态）。
  - `src/components/agent-ui/` 9 个组件全部落地。
- ✅ **`packages/agent-ui` workspaces 重构已完成（2026-08-27，第四轮）**：详见第 3.1 节，`docs/proposals/website-showcase.md` 第 4 节方案已落地实现，**取代**了本节此前记录的"两份拷贝，不做共享 workspace"的做法。
  - `scripts/build-catalog.mjs`（零依赖 frontmatter 解析器，已生成 `references/_generated/catalog.json`：2 个布局外壳 + 9 个组件）与 `scripts/check-tokens.mjs`（扫描 `.tsx`/`.css` 裸 hex/rgb，两套脚手架均"通过：未发现裸色值"）均已实现并接入两套脚手架的 `npm run gate`。
- ✅ **Phase 3 组件文档与扩展地图已完成（2026-09-03，Batch A–D）**：六层组件目录现覆盖 shared conversation、immersive rich implementation、Copilot 左画布边界及 Phase 4 规范占位；根 `check:component-docs` 零依赖校验 metadata、源码事实源、六层 layer 与设计规则文档路径，并在模板 gate 前运行。
- ✅ **v0.1.0 稳定基线已定义（2026-09-03）**：以语义化版本管理仓库根、`@agent-ux/agent-ui`、两套 active 模板与 website workspace；当前版本冻结已完成的 Phase 0–8 能力。`website/` 保留为内部 showcase，但其体验优化已暂缓，不阻塞 skill 发布。
- ✅ **Phase 7 与 Phase 8 Website / Showcase 已完成（2026-09-03）**：根 `website/` workspace 提供设计规则导览、沉浸式 Agent 与助手式 Copilot 的明确演示入口、按 catalog 划分的组件图谱及单组件详情、`targetId` → 注册表 → `ConversationScene[]` 的本地 JSON 编辑与预览、localStorage 自动保存和 JSON 导入导出。沉浸式演示直接使用 `@agent-ux/agent-ui/immersive` 的真实 `ImmersiveAgentApp`；模板由同步脚本物化同一运行时，website 只在 target adapter 边界做中立 JSON → panel/image 映射。
- ✅ **Phase 5 双数据源剧本引擎已完成（2026-09-03）**：共享引擎现在只消费富 `ConversationScene[]`；沉浸式由 `agent-layout/scenes.ts` 提供 TypeScript 场景，JSON 编辑器数据用 `resolveTargets()` 在加载边界解析 `targetId`。`ScriptPlayer` 不再渲染一期七块，而委托 rich renderer；`check-scripts.mjs` 同时支持 TS 场景入口、JSON 富场景与 Copilot 既有 JSON 兼容校验。`chat-5` 的分阶段续流程时序未在本 Phase 数据化。
- ✅ **Phase 4 交互式对话卡与治理回填已完成（2026-09-03，Batch A–C）**：shared `ConfirmCard`、`ErrorState`、`FollowUpSuggestions` 已公开导出；`ProductBlockAction` 经 `ProductBlockContext.onAction` 回写。immersive rich adapter 保持 local `data`/结果状态，Copilot action 经 `routeArtifact` 只更新左侧画布；共享域不含 panel/canvas。置顶报表示例已进一步实现三轮高风险审批：pending 会话状态统一驱动审批提示、Composer 禁用和侧栏“等待批准”，批准/拒绝显示本地演示收尾。

### 3.1 `packages/agent-ui` workspaces 重构（第四轮，已完成）

对应 `docs/proposals/website-showcase.md` 第 4 节推荐方案，用户已拍板确认后落地实现：

- **根目录新增 `package.json`**（`agent-ux-guide`），声明 `workspaces: ["packages/*", "skills/pangea-design-ai/templates/*"]`。`npm install` 已在根目录跑过一次，统一安装并 hoist 依赖（845 个包，含两套脚手架 + 新包）。
- **新增 `packages/agent-ui/`**（workspace 包 `@agent-ux/agent-ui`，`private: true`，不发布 npm）：唯一源码所在地。
  - `src/*.tsx`（9 个）：`composer.tsx`、`message-bubble.tsx`、`task-progress.tsx`、`clarify-card.tsx`、`confirm-card.tsx`、`artifact-card.tsx`、`message-actions.tsx`、`follow-up-suggestions.tsx`、`error-state.tsx`——内容与此前脚手架里的版本逐字节相同，只是把 `@/lib/utils`、`@/components/ui/button`、`@/components/ui/dropdown-menu` 这类脚手架专属别名改成了包内相对路径（`./lib/utils`、`./ui/button`、`./ui/dropdown-menu`）。
  - `src/layout/immersive-shell.tsx`、`src/layout/copilot-shell.tsx`：两个布局外壳组件源码（kebab-case 文件名，区别于脚手架里历史遗留的 PascalCase `ImmersiveShell.tsx`/`CopilotShell.tsx`，同步脚本负责改名映射）。
  - `src/ui/button.tsx`、`src/ui/dropdown-menu.tsx`：`agent-ui` 组件依赖的两个 shadcn 基础组件，**包内也放一份**，让包完全自包含、不要求消费方预先有 `@/components/ui/button`。
  - `src/lib/utils.ts`：`cn()` 工具函数。
  - `src/index.ts`：barrel export，包含 9 个组件 + `layout/immersive-shell` + `layout/copilot-shell`（`website/` 将来会用到布局导出，脚手架不需要，同步时会剔除）。
- **新增 `scripts/sync-agent-ui.mjs`**（仓库根目录 `scripts/`，注意区别于 `skills/pangea-design-ai/scripts/` 下的脚本）：
  - 把 `packages/agent-ui/src/*` 物化拷贝进两套脚手架对应位置，同时用正则把相对路径导入改写成 `@/` 别名（`from './lib/utils'` → `from '@/lib/utils'` 等，兼容单/双引号）。
  - **每个脚手架只拿自己的布局外壳**：`immersive-starter` 只同步 `immersive-shell.tsx`（落地为 `ImmersiveShell.tsx`），`copilot-starter` 只同步 `copilot-shell.tsx`（落地为 `CopilotShell.tsx`）——最初实现漏了这一点，两个脚手架都会拿到对方的布局外壳，已修正为按脚手架名查表决定同步哪个。
  - **`index.ts` 同步例外**：剔除 `from './layout/...'` 的 export 行（脚手架没有对应扁平路径），只保留 9 个组件的 barrel export。
  - `--check` 模式：只比对不写入，发现漂移非零退出，用于 CI/`npm run gate` 的漂移检测。
  - 同步范围也覆盖了 `src/components/ui/button.tsx`、`src/components/ui/dropdown-menu.tsx`、`src/lib/utils.ts`——这三个文件此前是 shadcn CLI 直接生成在脚手架里的，现在改为从 `packages/agent-ui` 同步（保证 `agent-ui` 组件与脚手架业务代码用的是同一份 `Button`/`cn()` 实现）。
- **两套脚手架的旧文件已被同步产物覆盖**：`src/components/agent-ui/*`、`src/components/ui/button.tsx`、`src/components/ui/dropdown-menu.tsx`、`src/lib/utils.ts` 现在都是 `sync-agent-ui.mjs` 的输出，**不再是手写/shadcn CLI 直接产物**，不应手改。
- **根 `package.json` 新增 `npm run gate`**：编排顺序为 `check:agent-ui-drift`（同步脚本 --check）→ `check:agent-ui-types`（`packages/agent-ui` 的 `tsc --noEmit`）→ `immersive-starter` 的 `gate` → `copilot-starter` 的 `gate`。已实测全流程通过。
- **回归验证**：两套脚手架各自的 `npm run gate` 单独跑、根目录 `npm run gate` 整体跑，均通过；重构前后 `vite build` 产物大小几乎不变（如 `immersive-starter` JS bundle 446.58 kB → 446.67 kB，属于内容改写导致的正常微小差异）；两个此前已在后台运行的 `npm run dev`（端口 5301/5302）在文件被同步脚本覆盖后，Vite HMR/rebuild 自动生效，`curl` 复测仍返回 200，未重启进程也验证通过。
- **CONTRIBUTING.md 已同步修订**：目录结构图新增 `packages/agent-ui/`、`website/`（占位）、根 `scripts/`；「核心原则」第 8 条改写为"唯一源码 + 同步"而非"两份拷贝各自维护"；「常见改动操作规范」新增 F 节说明同源机制与常用命令；C 节（新增组件流程）改为"先改 `packages/agent-ui`，再跑同步脚本"。
- ❌ **尚未开始**：
  - 视觉 token 全量（字体/间距/圆角/阴影/组件级 token）与基础布局/组件设计稿——等待用户提供，当前圆角暂用 shadcn 默认 `--radius: 0.5rem` 占位。
  - 首屏引导、能力识别的具体产品案例——目前 design.md 只有通用规则，两套脚手架各自的示例场景（合同审核助手/合同审阅助手）是为演示组件用法虚构的，非真实产品需求。
  - 嵌入式 Embedded 参考实现（按约定本轮不做）。
  - `@`/`/` 呼出的选择器面板（mention/slash popover）：`composer.tsx` 目前只暴露 `onMention`/`onSlash` 回调，未实现下拉选择 UI——业务侧需自行接入或后续补充参考实现。
  - PM Demo"自动化预览"的机制尚未固化为可复用工具（当前是纯靠 agent 每轮主动执行 `npm install`/`npm run dev`，无 hook 保障）。

## 4. 关键结论与决策（不要重复踩坑）

- **design.md 与人读原文的关系**：`references/design.md` 是《智能体产品交互设计指南 V1.4》的**结构化/可执行版本**，转写时做了以下加工（非逐字复制）：① 拆分出速查目录与锚点；② 补充"机检"提示（指向尚未编写的 `quality-gates.md` 各 G 项）；③ 补充与其它规则的交叉引用（如 3.4 操作确认链到 4.1 风险分级）；④ 结构从原文的"一、二、三、四"四章重新编号为"零(核心原则)、一(能力识别引导)、二(界面形态)、三(场景链路)、四(全局规则)"五组，让"界面形态"独立成一组（原文里界面形态是"二、用户感知"下的子节 2.2，但它的决策权重接近 pangea 里"页面模板选型"的地位，值得单独提升为一组）。**冲突时以 design.md 为准**（已在文件头部写明），原文仅作为人读参照，后续指南升级版本应先改 design.md 再考虑是否替换原文件。
- **界面形态是应用容器级决策，不是页面级决策**：这是本项目与 pangea 最大的结构性差异。pangea 的决策树在"已确定用 Vue+Arco 中后台"的前提下逐页选模板；本项目的决策树先决定"整个应用是沉浸式还是助手式"（决定用哪个脚手架），选完之后才进入"该形态内部的场景/内容生成"。因此 `SKILL.md` 的决策树在措辞上强调了"这是容器级、选错要重新起步"，避免 agent 把它和 pangea 式的"页面级模板匹配"混淆。
- **两套脚手架独立、不做运行时切换**：用户已明确决策（"按你推荐的做2个独立脚手架"）。原因：沉浸式（中间对话流是主区域，最小宽度 440px 优先）与助手式（中间主工作区优先，对话区退让）的响应式降级方向是**相反的**（见 design.md 2.2 vs copilot-shell.md 的"优先保障主工作区"），做成一套配置切换会让响应式逻辑复杂化且实际使用场景中几乎不会发生产品运行时切换形态的需求。
- **公共对话组件层的复用策略：⚠️ 2026-08-27 起已从"两份拷贝，不做共享 workspace"改为"单一源码 + 同步脚本物化"**（详见第 3.1 节）。原策略是与 shadcn"CLI 拷贝源码而非 npm 依赖"的哲学一致、且当时只有两个脚手架消费组件；但引入 `website/` 后需要第三个消费方直接实时引用最新代码，"人工同步两处"的老策略会变成"人工同步三处"，机械化风险更高，所以改为 `packages/agent-ui` 单一源头。发布给用户的脚手架仍然是"拷贝进去的独立文件、不依赖 workspace"，只是这份拷贝现在由脚本生成而不是手工维护两份。
- **PM Demo 自动化预览是本项目与 pangea 的刻意差异**：pangea 因为"会话开始即自动装依赖+起服务"被第三方平台安全扫描判定为 P0「指令覆盖」风险而移除了该自动化，改成"用户要求预览时才执行"。本项目用户在需求澄清阶段明确说"我希望用户不要关注工程编译、启动等事情，每次改动都自动执行启动"——这是**用户的主动选择、已被告知与 pangea 的差异**，按用户要求保留自动化。**如果本 skill 未来也要上传到类似飞书 aily/妙搭的第三方平台分发，需要重新评估这个权衡**（届时可参考 pangea CHANGELOG 1.3.1 的处理方式：把"会话开始自动执行"降级为"当轮对话内按需执行"）。这一点已记录在 SKILL.md 的 PM Demo 章节与 project-structure.md，避免以后有人直接抄 pangea 的做法"修复"掉这个已确认的功能。
- **视觉 token 当前只有语义色层，其余待补**：用户提供的 CSS 变量只是 `:root`/`.dark` 的语义色定义（`--primary`/`--background`/`--card` 等），底层调色板（`--color-teal-600` 等实际取值）、字体、间距、圆角均未提供。`design-tokens.md` 已用醒目的 TODO 清单列出缺口，`SKILL.md`「后续补充」章节也提到了这点。**在补充之前，agent 生成代码时颜色只能用已提供的语义变量名（通过 Tailwind 类），不能臆造新变量、不能瞎猜调色板取值。**
- **三个自定义 token 需要特别注意**（design-tokens.md 已记录，容易被后续维护者当成"缺失变量"误删或误加）：`--primary-bg`/`--destructive-bg`（浅底变体，非 shadcn 默认）、`--background-desktop`/`--background-mobile`（区分桌面/移动端页面级背景，非组件级 `--background`）。另外 `--info`/`--success`/`--warning` **没有** `-bg` 浅底变体（不对称，需要浅底时暂无现成变量，需用户确认后补）。
- **`--ring` 与品牌色解耦**：亮暗色下都是中性灰（`neutral-400`/`neutral-500`），不是 `--primary`——写聚焦环样式时不要想着换成品牌色。
- **暗色下 `--primary` 未变浅**（与亮色同值 `teal-600`），这与"暗色主色调亮"的常见做法不同，design-tokens.md 已提醒不要自行"修正"。
- **界面形态编号里"嵌入式"故意降级为⚪不固化**：design.md 里嵌入式有完整的设计约束（2.4 节），但没有配套的 `patterns/embedded-*.md` 布局外壳文档或脚手架，因为用户明确"嵌入式定制性比较强，可以根据设计指南和实际的场景来生成"——这是有意的范围收窄，不是遗漏。
- **协作约定**：不要替用户自动 `git commit`/`git push`，只改文件，提交推送由用户手动操作（沿用 pangea 的既有约定，本项目未单独确认但按同一用户的一贯要求执行，若有出入以用户当前指令为准）。
- **shadcn CLI 在此环境里默认 `npx shadcn@latest add` 会静默挂起（无输出、无报错），改成后台进程执行才能看到它其实卡在"Ok to proceed? (y)"的包安装确认交互上**——根因是 `shadcn@latest` 首次调用需要 npx 下载并确认安装该包，交互式确认在非 TTY 环境下会挂住。解决方法：先 `npm install -D shadcn@latest` 把包装进项目本地依赖，再用 `npx shadcn add <components> --yes`（不带 `@latest`）调用已安装的本地版本，就不会再触发确认交互。两套脚手架都是这么解决的。
- **shadcn CLI 生成的文件路径用的是 `@/components/ui/...`（按 `components.json` 里的 `@` alias 字面量创建目录），不是解析后的 `src/components/ui/...`**——需要手动 `mv @/components/ui/*.tsx src/components/ui/ && rm -rf @` 挪过去。这是这次实测中发现的一个 CLI 行为坑，之前写文档时没预料到，值得记录以免下次又踩。
- **`tsconfig.app.json` 里 `baseUrl` 在当前 TypeScript 版本（`~6.0.2`，实测装到的是较新的预览版）下已被标记 deprecated**（`TS5101`），仅配置 `paths` 不配 `baseUrl` 即可正常解析 `@/*` alias，不需要额外加 `ignoreDeprecations`。
- **Vite 8 + `vite.config.ts` 用 `__dirname` 会有 native config loader 的过时警告**（非报错，但会污染 `npm run build` 输出），改用 `import.meta.dirname`（Node 20.11+/22+ 原生支持）即可消除。
- **实测环境的包版本比预期新**：`vite@^8.2.2`、`tailwindcss@^4.3.3`、`react@^19.2.8`、`typescript@~6.0.2`——均是 `npm create vite@latest` / `npm install <pkg>` 拿到的当前最新版，比写文档时设想的"React 19 + Vite 6 + Tailwind v4"版本号更新；文档里 `project-structure.md` 给的版本号示例（`vite: ^6.0.0` 等）已经偏旧，**这是文档与实际不一致的已知差异，暂不强行改文档去匹配某个快照版本号**（版本号本来就该用 `^`/`~` 让其自然升级，文档里的版本号只是示意）。
- **Phase 4 卡片回写边界（2026-09-03）**：`ConfirmCard`、`ErrorState`、`FollowUpSuggestions` 是 shared public API，但只派发中立 `ProductBlockAction`；`ProductBlockContext.onAction` 的消费者拥有业务结果。沉浸式 local renderer 使用 `data`/rich context 并显示本地演示反馈；`ConversationPage` 会将 follow-up 选择的 `content` 回填 Composer，用户发送后才追加本地 `sentMessages`，并隐藏历史回复中的 follow-up；仍不触发真实请求或业务执行。Copilot 使用 `payload`/shared context，action 与交付物都经 `routeArtifact` 更新左侧画布。两种 renderer API 不可互换，shared 永不加入 panel/canvas。`actionStatus` 尚未由 active renderer 传入；follow-up 的完成轮次/禁用场景由 scene 或 renderer 策略保证，当前卡片本身不强制。
- **审批规则已沉淀为通用设计规则（2026-09-03）**：`design.md` 新增 3.4.1（确认卡只出现在即将执行的那一轮）、3.4.2（待确认期间阻断新指令）、3.8 的"默认定位到最新一轮"，并把 4.1 从四种状态扩为五种（新增「等待用户批准」，destructive 语义）。`quality-gates.md` 的 G6/G7/G8、`SKILL.md` 状态语言结论表、`extension-map.md` 的"待批准阻断"条目与 `confirm-card.md` 的 whenNotToUse/pitfalls/designRules 已同步。旧锚点 `#41-四种状态语言` 已全仓替换为 `#41-五种状态语言`。
- **报表高风险审批流（2026-09-03）**：置顶 `pinned-1` 场景改为“符号建议 → 是否调整报表 → 用户允许后写入前审批”三轮。`Conversation` 的 `approvalStatus` 由 `AgentShell` 单一持有，并驱动侧栏 destructive “等待批准”标签、rich Flow 在执行过程与回复间展示 destructive “需要你的批准”、Composer 的全量禁用和确认卡可见性；批准/拒绝后均追加场景声明的本地演示执行与结果消息，解除禁用并移除标签。`ConversationPage` 在首次进入或切换任意会话时同步定位到消息容器底部。此状态属于沉浸式壳层，shared ConfirmCard 仍只派发中立 action，不得声称真实文件已被写入。
- **`ConfirmCard`/`ClarifyCard` 里用 `console.warn` 做硬约束的运行时提示**（字段数超限、高风险缺字段等），这是本项目独有的"轻量运行时机检"手法——G5 门禁文档里说的"人工核对字段数"，实际组件代码里补了一层开发期兜底提示，不依赖人工数数。这个模式后续如果要加新组件，建议延续（对超限情况给 `console.warn` 而不是 silently 不管）。

## 5. 文件地图（File Map）

```
agent-ued-guide/
├── package.json                  # workspaces 根（新增，第四轮）
├── PROJECT_CONTEXT.md            # 本台账（单一事实源）
├── README.md                     # 仓库首页
├── CONTRIBUTING.md               # 贡献/维护规则、事实源约定
├── CHANGELOG.md                  # 变更记录
├── .gitignore
├── docs/
│   ├── 智能体产品交互设计指南V1.4.md   # 设计依据原文（人读，照搬）
│   └── proposals/                     # 方案文档（第三轮新增）
│       ├── mock-script-engine.md
│       └── website-showcase.md
├── scripts/
│   └── sync-agent-ui.mjs              # packages/agent-ui → 两套脚手架 的物化同步（新增，第四轮）
├── packages/
│   └── agent-ui/                       # 唯一组件源码（新增，第四轮，详见 3.1 节）
│       ├── package.json                # workspace 包 @agent-ux/agent-ui
│       └── src/
│           ├── *.tsx                   # 9 个对话组件
│           ├── layout/                 # immersive-shell.tsx / copilot-shell.tsx
│           ├── ui/                     # button.tsx / dropdown-menu.tsx
│           ├── lib/utils.ts
│           ├── script-engine/          # 剧本引擎（新增，第五轮，详见 3.2 节）
│           │   ├── types.ts / parse.ts / match.ts / interpolate.ts / runtime.ts / script-player.tsx
│           │   └── index.ts
│           ├── immersive/              # Phase 8 真实沉浸式运行时：agent-layout、ui、hooks、lib、contracts、theme.css、typeset.css
│           │   ├── agent-app.tsx / contracts.ts / index.ts
│           │   ├── agent-layout/ / ui/ / hooks/ / lib/
│           │   └── theme.css / typeset.css
│           └── index.ts
├── website/                            # Phase 7 静态文档站、双模板演示、组件详情与本地 JSON 剧本编辑器（独立 workspace）
├── releases/                           # 可分发的版本归档
│   └── pangea-design-ai-v0.1.0.zip       # v0.1.0 skill 完整 ZIP（不含 node_modules/dist）
└── skills/pangea-design-ai/
    ├── SKILL.md                            # skill 入口
    ├── references/
    │   ├── design.md                       # 全局设计规则唯一事实源（★核心，已完成）
    │   ├── theme/design-tokens.md          # 视觉 token（语义色层已完成，其余待补）
    │   ├── overview/
    │   │   ├── requirement-intake.md       # 需求规格化（含界面形态判定）
    │   │   ├── project-structure.md        # 工程结构 + 两套脚手架关系 + PM Demo 自动化
    │   │   ├── quality-gates.md            # G0-G7
    │   │   └── metadata-schema.md          # layout-shell / component 两类 schema
    │   ├── patterns/
    │   │   ├── immersive-shell.md          # 沉浸式布局外壳文档
    │   │   └── copilot-shell.md            # 助手式布局外壳文档
    │   ├── overview/                        # extension-map、project-structure 等架构/扩展边界
    │   ├── components/                      # Phase 3–4 组件 API 文档与 check-component-docs 事实校验
    │   │   ├── {delegation,conversation}/   # 输入、消息与三张 shared 对话卡
    │   │   ├── {process,artifact}/          # L1/L2/L3 与 Panel/Image adapter/容器
    │   │   └── {shell,registry}/            # 沉浸式壳层、导航与视觉映射
    │   └── component-selection/            # 9 个公共对话组件选型文档
    │       ├── composer.md
    │       ├── message-bubble.md
    │       ├── task-progress.md
    │       ├── clarify-card.md
    │       ├── confirm-card.md
    │       ├── artifact-card.md
    │       ├── message-actions.md
    │       ├── follow-up-suggestions.md
    │       └── error-state.md
    ├── scripts/
    │   ├── build-catalog.mjs                # 已实现：frontmatter → references/_generated/catalog.json
    │   ├── check-component-docs.mjs         # Phase 3：组件 metadata/source/designRules 事实校验，接入 root gate
    │   ├── check-tokens.mjs                 # 已实现：扫描裸 hex/rgb
    │   └── check-scripts.mjs                # 已实现（第五轮）：校验 scenarios.json
    └── templates/
        ├── immersive-starter/                # ✅ 可运行（沉浸式，示例：合同审核助手，剧本驱动）
        │   └── src/
        │       ├── components/{ui,agent-ui,layout}/  # agent-ui/（含 script-engine/ 子目录）与 ui/button.tsx、ui/dropdown-menu.tsx 现为同步产物
        │       ├── pages/Conversation.tsx      # 已改为 useScriptRuntime + <ScriptPlayer> 驱动
        │       └── mock/{conversations.ts,scenarios.json}
        └── copilot-starter/                   # ✅ 可运行（助手式，示例：合同审阅助手，剧本驱动）
            └── src/
                ├── components/{ui,agent-ui,layout}/  # 同上
                ├── pages/ContractReview.tsx     # 同上
                └── mock/{conversations.ts,scenarios.json}
```

## 5.1 方案文档（第三轮，未落地，仅方案讨论）

新增 `docs/proposals/`，存放"讨论过但还没写代码"的架构方案，与 `PROJECT_CONTEXT.md`（过程台账）和 `CHANGELOG.md`（能力变更）区分：方案文档记录"打算怎么做、为什么这么选、放弃了哪些选项"，供后续实现阶段直接照做，不需要重新讨论一遍。

- **`docs/proposals/mock-script-engine.md`**：把两个脚手架里手写的 `if (text.includes(...))` 剧本抽成 JSON 数据 + 通用引擎渲染。关键决策：剧本"块类型"直接对应 9 个 `agent-ui/` 组件不发明新类型；节点是状态机图（不是线性列表）支持分支；一个工程一份 `scenarios.json`（非每场景一个文件）；新增 `scripts/check-scripts.mjs` 校验剧本是否违反 design.md 硬约束。**用户已确认的点（第二轮追加）**：① 兜底回复用随机话术池（按建议方案）；② 剧本文件粒度一个工程一份 `scenarios.json`（按建议方案）；③ 补充了"思考执行过程"——`taskProgress` 块直接复用 `TaskProgress` 组件已有的 `status`/`tasks[]`/`steps[]` 三层字段，新增剧本层的 `steps[].delayMs`（块内逐条 append 节奏）与块级 `delayMs`（跨块追加节奏）两级独立延时控制，文档第 4 节新增了"合同风险扫描"示例场景演示这个用法。三点均已定稿，无待确认项。
- **`docs/proposals/website-showcase.md`**：新增 `website/` 目录，服务文档展示 + 沉浸式在线编辑器（仅服务沉浸式，助手式因主工作区差异大不参数化）。**用户已全部确认**：① 架构选"选项 A"（通用播放器 + 配置对象，纯前端状态驱动，不读写真实脚手架文件）；② 不做持久化服务，只做 localStorage + JSON 导入导出；③ 部署到 Cloudflare（纯静态，不需要鉴权/协作）；④ 新增独立 `website/` 目录；⑤ **组件源码同源方案（npm workspaces + `packages/agent-ui`）已拍板确认**——两份方案文档状态已更新为"方案已确认，待实现"。

  **✅ 2026-08-27 已落地**：`packages/agent-ui` workspaces 重构已完成（详见第 3.1 节），`CONTRIBUTING.md` 已同步修订，本文档第 2/4 节的旧结论已标注并更新。`website/` 本体（文档站 + 播放器 + 在线编辑器）与剧本引擎仍未实现，按第 6 节的顺序继续推进。

### 3.2 剧本引擎（第五轮，已完成）

对应 `docs/proposals/mock-script-engine.md`，用户已确认三个决策点（兜底随机话术池/一份 scenarios.json/思考执行过程复用 TaskProgress 字段）后落地实现：

- **代码位置 `packages/agent-ui/src/script-engine/`**（决策见方案文档第 8 节「实现备注」——放进 agent-ui 包而非独立 `packages/script-engine`，因为引擎的块类型直接 import 组件文件的类型定义）：
  - `types.ts`：`ScriptBlock`（7 种块类型：markdown/taskProgress/clarifyCard/confirmCard/artifactCard/errorState/followUp）、`Scenario`、`ScriptNode`、`ScriptDocument` 等类型定义，字段类型尽量直接复用组件 Props（如 `ClarifyCardBlock.fields` 就是 `ClarifyField[]`）。
  - `parse.ts`：`parseScript()`，校验规则对齐 G5/G6（字段数≤10、高风险字段完整性、followUp 数量2-4、分支目标节点存在性），不合规只 `console.warn` 不阻断。
  - `match.ts`：`matchTrigger()`（keyword 子串匹配 / regex 匹配，"先声明优先"）、`pickFallback()`（随机挑话术池，池空则 echo 兜底）。
  - `interpolate.ts`：`interpolate()`，`{{fieldKey}}` 变量插值，找不到值时原样保留并 `console.warn`。
  - `runtime.ts`：`useScriptRuntime(doc)` React hook，管理对话轮次状态机（`entries`/`values`），暴露 `send`/`advance`/`reset`。
  - `script-player.tsx`：`<ScriptPlayer>` 组件，把 entries 渲染成 agent-ui 组件树，内部 `useProgressiveReveal` 按 `block.delayMs` 渐进式揭示多个 block（对齐 design.md 3.2"过程可见"）。
- **两个示例场景改为剧本驱动**：`immersive-starter/src/mock/scenarios.json`（3 个场景：合作协议审核/Q2报销筛选/合同风险扫描）、`copilot-starter/src/mock/scenarios.json`（1 个场景：调整违约金条款）。对应页面 `Conversation.tsx`/`ContractReview.tsx` 里原来的 `if (text.includes(...))` 分支全部移除，改用 `useScriptRuntime` + `<ScriptPlayer>`。
- **新增 `skills/pangea-design-ai/scripts/check-scripts.mjs`**：纯 Node 环境校验 `scenarios.json`（规则与 `parse.ts` 相同但独立实现），接入两套脚手架的 `npm run gate`（`check:tokens` → `check:scripts` → `tsc -b` → `vite build`）。
- **`sync-agent-ui.mjs` 扩展**：新增对 `script-engine/` 子目录的整体同步（`buildCommonPlan` 里新增一段读取 `script-engine/` 下所有文件），发现子目录内部的相对导入（如 `../clarify-card`）因为整体拷贝、层级关系不变，**不需要**改写路径——一开始设计时想改写成 `@/` 别名，写完发现是多余的，已撤回改成"保持相对路径不变"的简化实现。
- **tsconfig 补充 `resolveJsonModule: true`**（两套脚手架的 `tsconfig.app.json`）：`import scenariosData from '@/mock/scenarios.json'` 需要这个选项才能被 TS 正确识别类型。
- **回归验证**：根目录 `npm run gate` 全流程通过（漂移检测 → 包类型检查 → 两套脚手架的 check:tokens+check:scripts+构建）；两个已在后台运行的 dev server 文件被覆盖后 HMR 自动生效，`curl` 复测返回 200，且日志显示最新几次 HMR 更新（针对 `Conversation.tsx`/`ContractReview.tsx`）均无报错。

## 5.2 整合 agent-layout（第六轮，方案已确认，未实现）

**这是本项目至今最大的方向调整**，方案文档 `docs/proposals/agent-layout-integration.md`。

用户在 `/Users/yangshuo/Code/agent-layout` 已独立做出一个成型的沉浸式智能体工作台模板（23 文件 / 3346 行业务代码 / 21 个 shadcn v4 基础组件 + `AGENTS.md`/`DESIGN.md`/`HANDOFF.md` 三份文档），成熟度远超本 skill 第二轮做的 `immersive-starter`（约 1200 行骨架）。决定**采纳它作为沉浸式形态的事实源，反向重构 skill**。

### 已确认的六项决策

| # | 决策 | 结论 |
|---|---|---|
| 1 | 技术栈 | **Base UI**（`@base-ui/react` + shadcn v4）。本项目第二轮基于 `radix-ui` 的实现作废 |
| 2 | 剧本数据格式 | **引擎接受已解析对象，TS / JSON 双数据源**（不是原方案的 JSON 唯一） |
| 3 | 仓库整合 | **`git subtree add` 搬入**保留历史；agent-layout 此后不再独立演进 |
| 4 | 包抽取粒度 | **粒度 3（整个应用底座）+ 分层导出 + 配置化改造** |
| 5 | 助手式 | 保持现有轻量骨架，仅迁移 Base UI，不追平沉浸式深度 |
| 6 | 组件文档体系 | 参照 pangea 引用 arco 的做法建立，但有两处刻意差异（见下） |

### 新立的铁律（需写入 CONTRIBUTING.md）

> **agent 生成能力是主用途，website 在线编辑是次要用途。两者冲突时牺牲 website 的便利性，不牺牲生成能力。**
> 判据：某项能力"配置化之后会让 agent 少一种表达方式"，就不配置化，让编辑器少一个可编辑项。

这条是用户主动提出的关切（"website 只是其中一种使用方式，skill 本身被 agent 调用生成智能体产品的效果也很重要"）推导出来的，直接导致了决策 2 的修订（原定 JSON 唯一格式，因为对 agent 丢失类型检查而改为双数据源）与 `website-showcase.md` 7.3 里四项刻意不配置化的决定。

### agent-layout 是「深而窄」，不是 skill 超集

缺三块需要补：① 风险分级与操作确认（V1.4 3.4/4.1）→ 新增 `confirm-card`；② 异常处理七场景（V1.4 4.2）→ 新增 `error-state`；③ 后续引导（V1.4 3.7，注意与它已有的"新对话首屏推荐指令"不是同一个东西，后者属 V1.4 1.2 首屏引导）→ 新增 `follow-up-suggestions`；另外无障碍层偏薄（缺 WCAG AA 明示、`aria-live`、44px 触控、图表 `role=img`）。助手式它完全没有。

### 组件文档体系（用户特别强调的一点）

用户指出：agent-layout 虽有一个总壳层，但中间对话区域与右侧面板容器已做了充分组件化解构，**叶子仍需体系化管理**，类似 pangea 引用 arco 官方组件规则的结构。

pangea 的做法是两层：`components/<分类>/<名>.md` 放 arco 官方 API **零漂移镜像**，`component-selection/<名>.md` 放薄选型元数据（frontmatter `meta` + 何时用/别用/变体/组合边界/坑 + 链回完整 API）。

本项目做两处**刻意差异**（理由已写进方案 5.1，避免以后有人"修正"回 pangea 的形态）：
1. **不拆分完整 API 与选型元数据，合并为一份。** pangea 必须拆是因为 `components/` 是外部依赖逐字镜像、不能注入判断；本项目对话域组件是自研，文档本身就是事实源，拆开只制造同步负担。
2. **底层 21 个基础件不做 API 镜像，只做一份 `base-inventory.md`（清单 + 本项目约定）。** arco 是 npm 包 API 不可见所以值得镜像；shadcn 是拷贝源码模式，源码就在 `src/components/ui/`，agent 读源码比读二手文档更准。

**分组方式按 `DESIGN.md` 的四层信息模型**（委托 / 对话 / 过程 / 产物）+ 壳层 + 注册表两组，不用 arco 式的 `data-display/data-entry/feedback` 分类——这样组件目录与设计方法论同构，agent 走完"新增能力先归位到哪一层"的判断后能直接落到对应目录。约 30 份文档，`meta` 新增 `layer` / `exported` / `designRules` 三个字段。

### 实测发现（必须写进文档，否则 agent 会踩）

`grep` 核对 agent-layout 实际导出，发现 `HANDOFF.md` 第 9 节描述的 **`AgentResponseBlock`、`ConversationTurn`、`AssistantContinuation` 并不在导出列表中**，是 `conversation-flow.tsx` 的文件内私有组件。这影响 agent 的行为边界：公共导出可直接组合使用；内部实现要改必须改 `conversation-flow.tsx` 本身、属于修改壳层内部、需在需求文档说明理由。方案 5.4 已记录完整的实测导出清单（13 个文件的公共导出）。

**⚠️ 尚未逐行阅读 3346 行实现**，各组件 props 细节需在写文档时逐个核对源码，不能照抄 `HANDOFF.md` 的叙述。

### 三个真实风险与对策

| 风险 | 对策 |
|---|---|
| agent 面对 3350 行不知道改哪里（最大风险，是导航问题不是架构问题） | 新增 `references/overview/extension-map.md`，形式是「要加 X → 改哪个文件 → 不要碰哪个文件」查表。好消息：agent-layout 已内建扩展点模式（`panel-registry` / `icon-registry` / `resource-visuals` / `actionIcons`），不用新造抽象，只需文档化 |
| JSON 化削弱 agent 类型安全 | 改双数据源，agent 走 TS 路径保留 `tsc` 校验 |
| agent 偷懒只填配置、独特需求被静默忽略 | SKILL.md 加强制判断步骤（能否配置覆盖 → 不能必须走扩展点并在需求文档说明），性质等同现有两阶段确认门；之后接 `DESIGN.md` 第 8 节六问决策流程 |

### 已识别的真实缺口

对话流内**目前没有**"插入产品专属自定义块"的扩展点（`AgentResponseBlock` 是私有组件）。这是 agent 生成差异化产品最可能需要的扩展方式，需在 Phase 2 补设计。

### 设计规则合并

V1.4 与 `DESIGN.md` 同一血统不是竞争关系——最强证据是 V1.4 3.2 的"状态层/任务层/执行层"与 `DESIGN.md` 的 L1/L2/L3 是同一个三层模型，后者只补了严格判定规则。合并方式：**V1.4 做骨架，DESIGN.md 沉浸式细则填入对应章节**；`DESIGN.md` 第 9 节评审清单与第 10 节反面清单**直接升级为 `quality-gates.md` 检查项**（实战沉淀，含金量高于现有 G0–G7 里靠推理写的条目）。

过滤原则：`HANDOFF.md` 读者是"维护模板的人"，skill 读者是"拿模板生成新产品的 agent"，所以 **Figma 节点索引、`.workbuddy` 提醒、"当前工作树有未提交改动"这类项目特定内容不进 skill**。

### 七阶段改造顺序

0 合并 design.md + 建文档体系骨架（纯文档）→ 1 subtree 搬入 + workspaces 接线 → 2 分层导出 + 配置化 + 补自定义块扩展点 → **3 写组件文档 + 扩展点地图（skill 生成质量的决定性一步）** → 4 补三个 V1.4 缺口组件 + 无障碍 → 5 剧本引擎适配双数据源 → 6 copilot 迁 Base UI → 7 website。

**website 从原来的第三步后移到最后**，让位给组件文档体系。

### 废弃物

方案第 10 节有完整清单。要点：第二轮做的 9 个 Radix 组件作废（其中三个 V1.4 缺口组件的设计意图保留、在 Base UI 上重写）、`immersive-shell.tsx` 作废、`immersive-starter` 整个被替换、`script-player.tsx` 重写、`runtime.ts` 重构；`match/interpolate/parse` 大部分保留，`sync-agent-ui.mjs` 保留但需扩展目录层级。这批本来就是"等设计稿之前的占位实现"，作废是预期内的。

## 5.3 Phase 0：设计规则合并与文档体系骨架（第七轮，已完成）

纯文档，未动任何代码。整合方案七阶段的第一步。

### design.md 重写为合并版（734 行，七章）

结构：零 核心原则与心智模型 / 一 能力识别与引导 / 二 界面形态与空间 / 三 场景链路 / 四 状态与反馈 / 五 全局规则 / 六 视觉基础 / 七 扩展新能力的决策流程。V1.4 的四章内容都在原有相对位置，新增的是四层信息模型、状态语言、间距契约、动效、视觉基础、决策流程。

**两个实质判断（不是机械拼接，重看时不要当成随意选择）**：

1. **来源标记机制**：每节标注〔指南〕/〔沉浸式契约〕/〔通用契约〕。这解决一个真实问题——助手式没有实测验证，不标清楚的话，以后会有人把沉浸式的契约（如产物容器 Tab/蒙层判定、420/800/320 宽度）当三形态通用规则去套助手式。〔通用契约〕表示出自沉浸式实测但判定与形态无关。

2. **响应式数值冲突的处理**（design.md 2.2 有专门的"⚠️ 两组数值的关系（必读）"小节）：指南给 1024/768 断点 + 对话流最小 440px；沉浸式实测给 980/740/659 + 对话区 `clamp(420,50%,800)`。我**没有硬选一个**，而是回查指南原文，它明确写了"以下数值为最小极限数值，但不是强制标准，不同产品可根据实际业务复杂度增加最小宽度的设定"——所以两者是**下限声明 vs 实测契约**的层级关系，不是矛盾。结论：沉浸式用实测契约（含 2560→800/1520 等九档实测尺寸表），助手式/嵌入式沿用指南下限，并注明 440→420 属于指南允许的产品自主调整范围（因为对话区另有 800px 上限保证可读性）。**以后新增形态时：先满足指南下限，再依据实测调优并回写该节。**

### quality-gates.md 从 G0–G7 扩到 G0–G9 + 反面清单

G0 需求确认（新增"每项能力判过配置能否覆盖"）/ G1 编译与类型 / G2 Token 与视觉基础 / G3 结构与层级 / G4 信息归属 / G5 产物与交付 / G6 状态语言 / G7 卡片硬约束与风险分级 / G8 响应式与动效 / G9 无障碍，末尾附**反面清单自查 11 条**。

主要变化是把原来靠推理写的检查项，换成沉浸式实测沉淀的评审清单与反面清单条目（真实复发过的问题）。反面清单最后一条是我新加的："没有把不能被配置覆盖的需求悄悄降级成用现有配置近似一下"——对应本轮新立的铁律。

### metadata-schema.md 新增三个关键字段

- `layer`（delegation/conversation/process/artifact/shell/registry）——与 design.md 第七章决策流程第 1 问闭环：判出"属于过程层"后可直接筛该层现有组件，先看能否复用。
- `exported`（true/false）——解决实测发现的真问题（见下）。文档里明确写了 agent 的行为边界：`true` 可直接 import；`false` 要改必须改宿主文件、属于修改壳层内部、需在需求文档说明理由。
- `designRules`（design.md 锚点数组）——从组件反查设计依据，避免"改了组件但违反某条原则"。
- `kind` 扩展为 `component` / `layout-shell` / `pattern` / `contract`（`contract` 用于纯类型契约如产物判别联合、内联标签格式，无渲染）。
- 文档里写明"`exported` 必须以实际 grep 结果为准，不能照抄上游交接文档叙述"。

### 组件文档体系骨架

- 新建 `references/components/` 六个子目录（delegation / conversation / process / artifact / shell / registry），**删除旧的 `component-selection/`**（9 份文档内容作废，形态合并进新体系）。
- `components/README.md`：索引 + 分组理由 + 公共导出/内部实现划线 + 每份文档的固定结构 + 四条写作要求 + **完整组件清单表（约 30 项，标注 exported 与源文件）**。
- `components/base-inventory.md`：21 个 Base UI 基础件清单 + 本项目约定与已踩坑（Base UI DropdownMenu 递归覆盖后代颜色、表单不得退回原生控件、日期依赖锁版本且避免 toISOString、shimmer 只用官方 utility、注册表与容器实现要分文件、shadcn CLI 在非 TTY 挂起的绕法）。
- 组件文档**正文留到 Phase 3**，因为要逐个核对源码。

### extension-map.md 提前建了骨架

原计划 Phase 3，但 SKILL.md 与 design.md 多处已引用，留断链不合适，且表格内容在整合方案里已拟好，落地成本低。含：查表（9 类扩展）、扩展前的 7 条判定要点（每条链到 design.md 依据）、已知缺口说明、改完之后的三步。**文件级精确路径留空待 Phase 1 回填**——工程还没搬进来，现在写死会立刻过期，文档里已注明这一点。

### SKILL.md 重写

- 技术栈改为 Vite 8 + React 19 + TS + Tailwind v4 + **shadcn v4（底层 Base UI）** + lucide-react，并强调"Base UI 与 Radix API 不兼容，参考任何 shadcn 片段前先确认底层"。
- **新增「第二道门：每项能力先判断能否用配置覆盖」**——这是本轮防 agent 偷懒的核心机制，与两阶段确认门并列为最高优先级。判定不能覆盖 → 走 design.md 六问 → 查 extension-map。
- 全局设计规则结论表从 13 行扩到 21 行，覆盖新增的四层模型、身份开场、间距契约、状态语言、动效、视觉基础。
- 索引改为指向新的组件体系六层目录 + extension-map。
- 新增「当前状态与后续补充」，明确列出各 Phase 未完成项，并写明"组件文档补齐前，涉及具体组件用法时直接读工程源码，不要凭猜测调用 API"。

### 踩坑记录

**zsh 的 `$path` 是与 `$PATH` 绑定的特殊数组变量。** 我在写链接校验脚本时用了 `path="${link%%#*}"` 作为普通变量，直接把 `PATH` 冲掉，导致后续所有命令 `command not found`（包括 `node`/`sed`/`dirname`/`head`）。恢复方式是 `export PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin`。**以后在 zsh 里写脚本不要用 `path` / `cdpath` / `fpath` / `manpath` 作变量名**，改用 `p`、`rel`、`target` 等。

链接校验最终用 node 完成，结果：12 个文件的全部相对链接可达。

## 6. 待办 / 下一步（Next）

- [x] ~~Phase 3 组件文档、扩展地图与事实校验~~ —— **已完成（2026-09-03，Batch A–D）**：六层正文、Copilot 左画布定位和精确扩展路径已以实际源码回填；新增零依赖 `skills/pangea-design-ai/scripts/check-component-docs.mjs`，校验 component frontmatter、六层 layer、源码存在性、Phase 4 planned 边界及 designRules 文档路径，并在 root gate 的类型/漂移检查后、模板 gate 前运行。shared `ArtifactTarget` 保持中立；沉浸式本地 adapter 仍是 panel/image 展示层；Copilot 只通过产品页 `routeArtifact(target)` 更新左侧画布。
- [x] ~~Phase 4 交互式对话卡、无障碍与治理回填~~ —— **已完成（2026-09-03，Batch A–C）**：三张 shared 卡片和 `onAction` 事件回写已以实际 API 文档化，沉浸式/ Copilot renderer 边界已记录，并完成根级文档、类型、漂移与 gate 验证。后续仅保留 `actionStatus` 传入、follow-up 场景策略强化与实际新回合/业务执行等产品行为，不属于本阶段已验证的纯前端展示回写。
- [ ] **等待用户提供视觉资产**：调色板完整取值、字体/字号/字重档位、间距/圆角/阴影档位、基础布局与核心组件设计稿。收到后回填 `design-tokens.md` 并同步两套脚手架的 `globals.css`（当前圆角占位为 shadcn 默认 `0.5rem`）。
- [ ] **验证 PM Demo 自动化预览在真实 agent 执行环境下的可靠性**：目前只是文档约定"每轮修改自动重启 dev server"，没有类似 Kiro Hooks 的机制强制保障，实际效果依赖执行 agent 是否遵守约定。
- [ ] **两套脚手架的 `package-lock.json` 未提交检查**：已跑过 `npm install`，生成了 lock 文件，但未做进一步的依赖版本审计（如是否有已知漏洞）。
- [ ] （待用户反馈后决定）是否需要嵌入式 Embedded 的参考实现示例（如一个划词工具栏 demo），目前按用户要求不固化模板。
- [ ] 两套脚手架当前各自的示例页面（`Conversation.tsx` / `ContractReview.tsx`）是演示性质的 demo，实际使用时应作为「起步后删除示例、替换为真实需求页面」的参照，而非直接保留在交付产物里——这一点尚未在 SKILL.md 或脚手架 README 里明确提示，可考虑补充。
- [x] ~~`packages/agent-ui` workspaces 重构~~ —— **已完成（2026-08-27，第四轮）**，详见第 3.1 节。
- [x] ~~剧本引擎一期~~ —— **已完成（2026-08-27，第五轮）**，详见第 3.2 节。⚠️ 将随 agent-layout 整合部分重构，见 5.2 节。
- [x] ~~Phase 0：合并 design.md + 质量门禁升级 + 组件文档体系骨架~~ —— **已完成（2026-08-27，第七轮）**，详见 5.3 节。
- [x] ~~Phase 1：仓库整合~~ —— **已完成（2026-09-02，第八轮）**：目标目录已初始化为 Git 仓库并关联 `ysredcity/pangea-design-ai`（未 push）；旧 Radix 沉浸式脚手架归档为 `archive/immersive-starter-radix/`；`agent-layout` 以非 `--squash` subtree 导入 `templates/immersive-starter/`，完整历史保留（导入提交 `32afb02`，上游锚点 `b6fbbfc`）。清理上游专属 AGENTS/HANDOFF/.workbuddy，模板转为 Base UI `immersive-starter` workspace，旧同步脚本仅保留 Copilot 目标。根与模板 gate 都已通过。
- [x] ~~Phase 2 第一纵切：AppConfig 与产品对话块扩展点~~ —— **已完成（2026-09-03）**：`app-config.ts` 成为产品身份、导航、首屏专家与推荐指令的受类型约束入口；`AgentShell` 将配置透传至侧栏、新对话页和对话流。`ProductConversationBlock` 保持可选，并由可选 `renderProductBlock` 在私有 `AgentResponseBlock` 内的正文/附件/澄清之后、续流程之前渲染；未知或未配置 renderer 不影响既有场景。对外提供中立 `ArtifactRouter` 回调类型（当前实现仍是 `ArtifactTarget → void`），产品块不依赖 Panel UI。仅改动 immersive-starter，`npm run gate --workspace=immersive-starter` 已通过。
- [ ] ~~原第三步 `website/`~~ —— **后移到 Phase 7（最后）**，让位给组件文档体系与扩展点地图。
- [ ] **剧本引擎遗留待办**（第五轮新增，均已记在 `docs/proposals/mock-script-engine.md` 第 8 节「实现备注」）：
  - `requirement-intake.md` 补一节"生成剧本 JSON 的映射规则"，让 agent 需求确认后直接产出 `scenarios.json` 草稿。
  - `scripts/check-scripts.mjs`（`skills/pangea-design-ai/scripts/`）与 `packages/agent-ui/src/script-engine/parse.ts` 的校验规则是两处独立实现、手动保持一致，未来规则变化需要两处都改，暂无机械化保障。
  - `Composer` 的 `@`/`/` 选择面板仍未实现（沿用此前已知待办），剧本里因此没有"能力选择"相关的块类型。
  - `taskProgress` 块的 `tasks[].status` 不会随 `steps` 播放自动推进（剧本作者需要手动把 `tasks` 写成期望的最终状态），这是实现时的简化决策，非缺陷。

---

## ■ 更新协议（How to update this file）

沿用 pangea-design-skill 的协议：完成里程碑 / 做出重要决策 / 新增删除重要文件 / 明确新待办或放弃某方向时更新对应小节，并在文末「变更日志」加一行，刷新顶部「最后更新」日期（**用 `date` 命令核实真实日期，不要用会话上下文里可能过期的注入日期**）。

与 `CHANGELOG.md` 的分工见 [CONTRIBUTING.md 第六节](./CONTRIBUTING.md)：本台账写给维护者，过程/根因/细节越细越好；`CHANGELOG.md` 写给使用者，只写"这个版本多了什么能力"。

---

## 变更日志（本文件的，非 CHANGELOG.md）

- 首次搭建：仓库治理骨架 + skill 文档骨架（design.md 全量转写完成、9 个对话组件选型文档、2 个布局外壳文档、theme/overview 文档），两套脚手架代码与组件实现代码尚未开始。参照 pangea-design-skill 的治理结构，但界面形态决策粒度、脚手架独立性、PM Demo 自动化策略均按本项目实际需求重新设计，未照搬 pangea 的具体内容。
- 第二轮：两套脚手架从零初始化到可运行验证完成。用 `npm create vite@latest --template react-ts` 起步，手工接入 Tailwind v4（`@tailwindcss/vite` 插件 + `@theme inline` 桥接用户提供的语义色变量）与 shadcn CLI（`new-york` 风格，`neutral` 基色，装了 button/badge/card/scroll-area/avatar/separator/tooltip/dialog/sheet/textarea/dropdown-menu/skeleton，copilot-starter 额外装了 resizable/tabs）。9 个 `agent-ui/` 组件写完并在两套脚手架分别落地一份代码；两套布局外壳组件写完（`ImmersiveShell`/`CopilotShell`）；各配一个演示场景页面。`scripts/build-catalog.mjs`（零依赖 YAML frontmatter 简化解析器）与 `scripts/check-tokens.mjs`（裸 hex/rgb 扫描）写完并接入 `npm run gate`，两套脚手架的 `gate` 均已实测通过；`npm run dev` 也各自实测跑通（curl 验证 HTTP 200）。踩坑记录见下方「关键结论」新增条目。
- 第三轮：讨论并确认两份架构方案（不动代码），落成 `docs/proposals/mock-script-engine.md`、`docs/proposals/website-showcase.md`，用户全部确认后进入实现阶段，约定顺序为"先重构 workspaces，再做剧本引擎，最后做 website"。
- 第四轮：完成方案顺序里的第一步——`packages/agent-ui` npm workspaces 重构。根目录新增 `package.json`（workspaces 根）与 `packages/agent-ui/`（唯一组件源码，含 9 个对话组件 + 2 个布局外壳 + button/dropdown-menu 基础件 + `cn()` 工具），新增 `scripts/sync-agent-ui.mjs` 做物化同步（含路径改写、按脚手架分发对应布局外壳、`--check` 漂移检测三个关键设计点，过程中发现并修正了"两个脚手架都拿到对方布局外壳"和"双引号 import 未被正则匹配"两处实现疏漏）。根 `package.json` 新增编排式 `npm run gate`。回归验证：两套脚手架单独 `gate` 与根目录整体 `gate` 均通过，`vite build` 产物大小基本不变，两个此前已运行的 `dev server`（5301/5302）在文件被覆盖后未重启即验证 HMR 生效、`curl` 仍返回 200。`CONTRIBUTING.md` 已同步修订目录结构图与「核心原则」第 8 条，新增 F 节说明同源机制。详见第 3.1 节。
- 第五轮：完成方案顺序里的第二步——剧本引擎。在 `packages/agent-ui/src/script-engine/` 实现 `parseScript`/`matchTrigger`/`pickFallback`/`interpolate`/`useScriptRuntime`/`<ScriptPlayer>`，7 种块类型对应 agent-ui 已有 7 个可渲染组件（message-actions/composer 不作为块类型，因为它们不是"响应内容"而是"交互容器/输入区"）。两个示例场景迁移为 `scenarios.json` 驱动，移除页面里手写的 if/else。新增 `skills/pangea-design-ai/scripts/check-scripts.mjs` 并接入两套脚手架 `gate`。`sync-agent-ui.mjs` 扩展支持子目录同步。tsconfig 补 `resolveJsonModule`。实现过程中对方案文档做了若干收敛（fallback 独立成文档级字段而非 trigger 的一种取值、字段名 `$schemaVersion`→`schemaVersion`、taskProgress 的 tasks 不自动随 steps 推进等），均已记录在 `docs/proposals/mock-script-engine.md` 第 8 节并同步本文件 6 节待办。回归验证：根目录 `npm run gate` 全流程通过，两个后台 dev server 热更新无报错。详见第 3.2 节。
- 2026-09-03 Phase 3 Batch B：新增 15 份委托/对话层组件文档并更新组件索引。所有 API、导出状态和私有边界均以 immersive-starter 实际源码核对；三项 Phase 4 缺口只记录不可变设计约束和实施前提，明确为 planned/unimplemented、`exported: false` 与 `source: Phase 4 planned`。`npm run gate --workspace=immersive-starter` 与 `git diff --check` 通过。
- 2026-09-03 Phase 3 Batch C：新增 14 份过程/产物层组件文档并更新组件索引与台账。过程层以 rich `conversation-flow.tsx` 的公开导出为准，明确 L1/L2/L3、私有 action 图标/Disclosure 边界及点击条件；产物层明确 `PanelView`/`ImageView`/`PanelTab` 是沉浸式 adapter，shared `ArtifactTarget` 不含容器字段，Copilot 只路由至左侧画布。新容器的唯一扩展链是 panel types → containers → registry，壳层不写类型分支。验证：`npm run gate --workspace=immersive-starter` 与 `git diff --check` 均通过；保持 7 条既有 lint warning 与 >500 kB bundle 提示，未新增 warning。
- 第六轮（本轮，纯方案不动代码）：**最大的方向调整**——采纳用户独立完成的 `/Users/yangshuo/Code/agent-layout`（沉浸式工作台成品，3346 行 + 三份文档）作为沉浸式事实源，反向重构 skill。新增 `docs/proposals/agent-layout-integration.md`，同时修订 `mock-script-engine.md`（新增第 9 节：JSON 唯一 → TS/JSON 双数据源，数据模型对齐 agent-layout）与 `website-showcase.md`（新增第 7 节：粒度 3 + 分层导出、四项刻意不配置化、实现顺序后移到最后）。六项决策全部确认（Base UI / 双数据源 / subtree 搬入 / 粒度 3 / 助手式保持轻量 / 组件文档体系）。新立铁律「agent 生成能力是主用途，website 是次要用途，冲突时牺牲 website」——这条由用户主动提出的关切推导而来，并已实际改变了两处设计决定。组件文档体系按 `DESIGN.md` 四层信息模型分组（约 30 份），与 pangea 有两处刻意差异（不拆 API/选型两层、底层基础件不做镜像）。`grep` 实测发现 `AgentResponseBlock`/`ConversationTurn`/`AssistantContinuation` 是私有组件而非 HANDOFF 描述暗示的公共 API，已记录完整导出清单。识别出三个真实风险（导航/类型安全/偷懒填配置）与对策，以及一个真实缺口（对话流缺自定义块扩展点）。详见 5.2 节。
- 第七轮（本轮）：执行整合方案 **Phase 0**，纯文档不动代码。① `design.md` 重写为合并版（734 行七章，V1.4 骨架 + 沉浸式实测细则，引入〔指南〕/〔沉浸式契约〕/〔通用契约〕来源标记机制，并专设小节显式处理两组响应式数值的层级关系——回查指南原文确认它自称"最小极限数值非强制标准"，故沉浸式用实测契约、助手式沿用指南下限）；② `quality-gates.md` 从 G0–G7 扩到 G0–G9 + 反面清单自查 11 条，检查项主体换成实测沉淀而非推理条目；③ `metadata-schema.md` 新增 `layer`/`exported`/`designRules` 三字段并扩 `kind`，写明 `exported` 必须以 grep 实测为准；④ 建 `components/` 六层目录骨架 + 索引（含约 30 项组件清单表与 exported 标注）+ `base-inventory.md`（21 个 Base UI 基础件与六条已踩坑），删除旧 `component-selection/`；⑤ `extension-map.md` 提前建骨架（因多处已引用，避免断链），文件级路径留待 Phase 1 回填；⑥ `SKILL.md` 重写，技术栈改 Base UI，**新增「第二道门：每项能力先判断能否用配置覆盖」** 作为防 agent 偷懒的核心机制。踩坑：zsh 的 `$path` 与 `$PATH` 绑定，用作普通变量名会冲掉 PATH。最终用 node 校验 12 个文件全部相对链接可达。详见 5.3 节。
- 第八轮（Phase 1，已完成）：用户确认 `agent-layout` 不再独立演进后，因原目录不是 Git 仓库而先在本地创建 `main` 初始提交 `9c9061f` 并关联空远程 `ysredcity/pangea-design-ai`（全程未 push）；随后将旧 Radix `immersive-starter` 移至 `archive/immersive-starter-radix/`（`39c386c`），通过**非 `--squash`** `git subtree add` 将 `agent-layout/main` 导入 `skills/pangea-design-ai/templates/immersive-starter/`（导入提交 `32afb02`，上游历史锚点 `b6fbbfc` 可追溯）。上游未提交文档未进入导入，导入后的 `AGENTS.md`/`HANDOFF.md` 与本地工具状态不再随模板分发；README 改为 skill 模板说明。新模板包名为 `immersive-starter`，新增 lint+build gate；Root gate 改为先执行 Base UI `gate:immersive`，再执行 legacy `gate:copilot`。为防旧 Radix UI 污染 Base UI，`sync-agent-ui.mjs` 已永久收缩为仅同步 Copilot，兼容旧命令名但明确标注 legacy。运行 `npm install` 后，`npm run gate --workspace=immersive-starter` 和根 `npm run gate` 均通过；沉浸式存在 7 条上游既有 Oxlint warning 与单 bundle 超 500kB 提示，均未阻断。治理文档、工程结构和扩展地图已按当前事实源回填精确路径；下一步是 Phase 2（分层导出、AppConfig 与自定义对话块扩展点）。
- 第九轮（Phase 2 第一纵切）：仅在 `skills/pangea-design-ai/templates/immersive-starter/` 落地配置入口与产品块扩展点。新增受 `satisfies AppConfig` 约束的 `app-config.ts`，集中产品 identity（name/avatar）、导航、首屏专家（id/label/visualKey）及推荐数据；`App.tsx` 以配置装配 `AgentShell`，并由壳层透传到侧栏、新对话页、对话流与头像。新增可选 `ProductConversationBlock` 与 `renderProductBlock`，插槽严格位于助手正文/附件/澄清之后、续流程之前，未知/未配置 renderer 返回空而不影响原场景；公开中立 `ArtifactRouter`（暂等同 `ArtifactTarget → void`），不让产品块耦合 Panel UI。未改 `packages/agent-ui` 或 Copilot，未提交/推送。验证：`npm run gate --workspace=immersive-starter` 通过（保留 7 条上游既有 lint warning 与 bundle >500kB 提示），`git diff --check` 通过。


### 3.3 Phase 2：共享 Base UI 对话域与 Copilot 迁移（2026-09-03，已完成可运行纵切）

- `packages/agent-ui` 已改为 Base UI 分层 source：根入口只导出共享 conversation；稳定子路径为 `@agent-ux/agent-ui/conversation`、`/immersive`、`/copilot`。旧 Radix 文件不再进入 package TypeScript 入口，active package/template manifests 已移除 Radix 依赖。
- 新共享域定义中立 `ArtifactTarget`/`ArtifactRouter`、`ConversationScene`、`ConversationFlow`、`Composer` 与 `ProductBlockRenderer`。不依赖 `PanelView` 或 Copilot canvas；产品块在 assistant 正文之后、续流程之前渲染。当前共享 Flow 在 renderer 缺失或返回空时安全跳过；产品 registry 如需诊断未知 type，须自行在开发期告警。
- Copilot 已通过 Base UI `CopilotApp` 装配共享对话域。合同审阅示例的产物点击调用 `routeArtifact(target)` 更新左侧工作画布；未引入沉浸式右侧产物面板。四种辅助区模式继续由 Copilot shell 支持。
- `scripts/sync-agent-ui.mjs` 现在同时把 shared conversation 及对应形态 adapter 物化到两套模板的 `src/agent-ui/`，并将零依赖 `check-tokens.mjs` / `check-scripts.mjs` 物化到各模板的 `scripts/agent-ux/`；`--check` 同时检测两个模板的所有物化产物。根 gate 改为 package type → 双模板 drift → immersive → copilot，旧 legacy 命令已删除。
- `AppConfig` 仍只承载身份、导航与欢迎页数据；业务场景、面板容器与产品块没有被配置层吞没。沉浸式成熟 panel/image adapter 继续留在模板作为形态专属实现，下一阶段可继续将完整 AgentApp 壳层迁入 package 而不改变中立契约。
- Phase 3 Batch C 已将这一边界文档化：shared `ArtifactTarget` 是跨壳层中立语义；沉浸式 `PanelView` / `ImageView` / `PanelTab` 是本地 adapter；Copilot 不使用沉浸式右侧面板。仅加内容改 `panel-data.ts`，新增容器类型必须同步 types、containers、registry。
- 验证：`npm install`、`npm run check:agent-ui-types`、双模板 `npm run gate`、`npm run check:agent-ui-drift`、根 `npm run gate` 与 `git diff --check` 均通过；从仓库外临时复制两套模板后，均成功执行 `npm install && npm run gate`，证明不依赖 workspace、根脚本或根 `node_modules`。沉浸式保留 7 条既有 Oxlint warning 与 bundle >500 kB 提示，Copilot 保留 4 条既有 Fast Refresh warning；本轮未新增 warning。Copilot 的独立安装审计报告 1 条 moderate 依赖漏洞，尚未执行可能改变锁文件的 `npm audit fix`。待完成：完整 AgentApp 壳层抽取。

### 变更日志

- 2026-09-03：完成 Phase 2 Base UI 共享对话域/Copilot 迁移纵切、双模板同步和 root gate 重建；补齐可移植质量门禁的物化与 `--template-dir` 契约，修复 Copilot 模板复制后 `npm run gate` 依赖 skill 外部路径的问题。根门禁、差异检查，以及两套模板在仓库外的 `npm install && npm run gate` 均通过；更新技能、方案、扩展地图、贡献指南与变更日志。
- 2026-09-03：用户确认按完整四批启动 Phase 3；新增组件文档实施计划，先校正共享轻量 conversation 域、沉浸式 rich implementation 与 Copilot canvas 的边界，再逐层补正文、扩展地图和零依赖文档事实校验。
- 2026-09-03：完成 Phase 3 Batch A（Task 1–3）文档边界校正。组件索引、Base UI inventory 与 extension map 已明确 shared conversation / immersive rich implementation / Copilot shell / Phase 4 planned 的事实源；新增共享 conversation 契约及双实现 Composer、ConversationFlow 文档。实测共享与沉浸式同名组件的 props、场景数据、artifact adapter、product-block context 均不可互换；`ArtifactTarget` 共享契约不含 Panel/Image/Tab/Canvas。验证：`npm run check:agent-ui-types`、`npm run check:agent-ui-drift`、`git diff --check` 均通过；未提交或推送。
- 2026-09-03 Phase 3 Batch D：完成壳层（AgentShell/ChatWorkspace/ConversationPage/AgentSidebar）与注册表（icon-registry/resource-visuals/IconButton）正文，按实际源码记录 state 归属、会话切换同步清理旧 panel、AppConfig、本地 panel/image adapter 与 980/740/659 响应式边界；回填 Copilot `routeArtifact(target)` 仅更新产品页左画布的精确路径。新增 root `check:component-docs`，零依赖遍历全部组件叶子文档，校验 metadata、source、六层 layer、Phase 4 planned 边界和 designRules 文档路径，并在模板 gate 前执行。未 commit 或 push。
- 2026-09-03 Phase 4 Batch C：将 ConfirmCard、ErrorState、FollowUpSuggestions 文档从 planned 占位改为 shared public API，记录 typed payload、`ProductBlockContext.onAction` 中立回写、高风险/异常/后续建议约束与无障碍边界；同步组件索引、扩展地图、工程结构、实施计划和整合方案。明确 immersive local `data` renderer 与 shared/Copilot `payload` renderer 不可互换，Copilot action 经 `routeArtifact` 仅更新左画布，shared 不含 panel/canvas。未 commit 或 push。
- 2026-09-03 Phase 4 收口复核：以 `ConversationPage` 实现为准修正后续建议事实边界——shared `FollowUpSuggestions` 仅派发中立 action，沉浸式消费方会将选择内容追加为本地 `sentMessages` 用户消息；不触发真实请求或业务执行。组件文档、类型、同步漂移、双模板 gate 与 Git 空白检查均通过；未 commit 或 push。
- 2026-09-03 Phase 4 视觉复核：置顶对话 `ConfirmCard` 对齐 Pangea AI Components 的 Alert 确认态（标题、说明、右对齐紧凑操作；视觉 28px 操作以透明命中区保持 44px 触控）；`FollowUpSuggestions` 对齐截图中专家推荐列表，改为展示完整 `content` 的纵向行，使用 `ArrowDownLeft` 指向下方 Composer。shared 源码已同步至两套模板。
- 2026-09-03 推荐指令复用收口：首页的私有 `ExpertSuggestionList` 与 shared `FollowUpSuggestions` 曾分别实现，造成对话页错误升为 44px。现新增 shared `RecommendationList`（36px 行高）；首页复用 `up-left`，跟进建议复用 `down-left`，仅保留空间箭头方向差异。
- 2026-09-03 Follow-up 交互收口：点击建议只将完整提示词回填 Composer，不再伪造用户消息；rich renderer 现在传递 `isLatestTurn`，`ConversationPage` 仅为尚未发送后续用户消息的最新回复渲染 follow-up。用户实际发送后列表消失，追加的本地用户消息仍不触发真实请求。
- 2026-09-03 Follow-up 视觉收口：移除点击建议后的灰色本地结果提示条；确认/错误恢复仍保留各自反馈，跟进建议仅回填 Composer，避免在用户尚未发送前制造冗余状态。
- 2026-09-03 ConfirmCard 细化：shared `ui/Button` 已从无依赖声明的 Radix Slot 残留迁为 Base UI shadcn 实现（无 `asChild` 消费方）；确认卡桌面复用 `default` 尺寸，≤659px 以 `lg` 等效 36px 高度均分动作区，标题为 15px，`description?: ReactNode` 作为可组合描述插槽。

## 本轮变更日志（续）

- 2026-09-03：完成 Phase 5 双数据源剧本引擎；新增富场景 `ConversationScene[]` 契约、JSON `resolveTargets()` 边界、TS 场景入口和双模式 `check-scripts.mjs`，并保持报表高风险审批语义与 Copilot 一期 JSON 兼容。
- 2026-09-03：完成 Phase 7 website/showcase。新增 `website/` 独立静态 workspace（文档导览、组件图谱、沉浸式 JSON 编辑/预览、本地持久化与导入导出），并接入根级 `gate:website`；完整 AgentApp 壳层抽取仍是独立技术债。


## 本轮变更日志（续）

- 2026-09-03：Phase 7 website 扩展完成。新增“模板演示”导航，明确呈现沉浸式 Agent 与助手式 Copilot；Copilot 使用共享 `CopilotApp` 的固定合同审阅演示，不引入 Copilot 在线编辑器。
- 2026-09-03：组件图谱从六张静态卡片升级为 catalog 的 11 项可浏览详情（2 个布局壳层 + 9 个组件）；详情复用现有 Markdown 规范事实源，展示变体、组合边界、常见误区与真实/结构化预览。新增网站文件：`components/template-demos-view.tsx`、`components/copilot-preview.tsx`、`components/component-detail-view.tsx`。

- 2026-09-03（Phase 7.1）：**修正一个此前未被发现的实质缺陷**——website 的构建产物里语义色工具类生成数为 0（`bg-card`/`text-muted-foreground`/`border-border`/`bg-primary` 全部缺失），因为 `website/src/index.css` 只有站点自己的编辑风格变量，没有 shadcn 的 `@theme inline` 映射。结果是即使接入了真实共享组件，也只有结构没有产品配色。已引入与 `immersive-starter/src/index.css` 一致的完整语义 token + `tw-animate-css` + Geist 字体；验证后上述工具类均为 1。
- 2026-09-03（Phase 7.1）：确立**双设计语言分离约定**。站点编辑风格变量统一加 `--site-*` 前缀（`--site-ink/--site-paper/--site-line/--site-accent/--site-danger` 等九个），产品语义 token 占用标准 shadcn 名称（`--background/--foreground/--primary/--border/...`）。原先 `--muted` 与 `--accent` 两个名字在两套语言里含义冲突（站点当文字色/品牌色用，产品当 4% 黑色背景用），这是必须重命名的根因。演示区用 `.product-surface` 作用域，不使用模板的 `@layer base` 全局 body 覆盖。
- 2026-09-03（Phase 7.1）：website 新增显式依赖 `tw-animate-css@^1.4.0`（共享组件用到 `animate-in/animate-out/fade-in-0/zoom-in-95/slide-in-from-*`）与 `@fontsource-variable/geist@^5.3.0`（此前 CSS 已引用该字体名但从未导入）。`npm install` 已执行，lockfile 更新。**未引入 `shadcn` 包**——经 grep 核实共享组件不使用 `data-open`/`data-closed` 等由 `shadcn/tailwind.css` 提供的自定义 variant，故不需要。
- 2026-09-03（Phase 7.1）：组件详情不再对模板内部实现绘制结构示意图。可独立运行的共享组件（Composer/ConversationFlow/ConfirmCard/ErrorState/FollowUpSuggestions）标为「真实组件 · 形态展示」；模板内部实现（AgentShell/ArtifactCard/TaskProgress/MessageBubble/MessageActions 与两个布局壳层）标为「模板内部实现」，给出真实源码路径与启动模板的命令。
- **Phase 8 待决（技术债）**：把真实沉浸式壳层抽进 `packages/agent-ui/immersive`，让 website 与模板消费同一份真实壳层。实测规模：`agent-layout/` 共 26 文件 3766 行（`agent-shell.tsx` 407 / `composer.tsx` 562 / `conversation-flow.tsx` 455 / `sidebar.tsx` 446 / `conversation-data.ts` 325 / `clarification-form-card.tsx` 263），依赖 21 个 Base UI 基础件中的 17 个，而 `packages/agent-ui/src/ui/` 目前只有 `button` 与 `dropdown-menu` 两个。`packages/agent-ui/src/immersive/agent-app.tsx` 当前只是 10 行占位，不是真实壳层。抽取时必须用不同子路径区分同名不兼容的 rich 与 shared `Composer`/`ConversationFlow`。已否决「website 深链 import 模板源码」方案：方向反转、`@` 别名冲突、无漂移防护。

## Phase 8 完成记录（2026-09-03）

- `packages/agent-ui/src/immersive/` 已成为 rich immersive runtime 的唯一源码：含 `ImmersiveAgentApp`、contracts、完整 `agent-layout`、Base UI closure、hooks/lib 和 canonical `theme.css`/`typeset.css`。
- `scripts/sync-agent-ui.mjs` 新增 immersive-only materialization；template 是独立物化消费者，Copilot 不接收 immersive runtime。模板数据（scenes、panel data、app config）保留在模板侧，经 props 注入运行时。
- website 直接导入 package runtime，并由 `website-document.ts` 将中立 JSON targets 显式适配为 `PanelView`/`ImageView`；Phase 7.1 token bridge 改为 package canonical theme import。
- 验证：package check、sync --check、immersive gate、website gate 通过；仍有既有 Oxlint Fast Refresh/set-state warnings 与 Vite >500kB bundle warning。未执行 git commit/push。

### 变更日志
- 2026-09-03：完成 Phase 8 真实沉浸式运行时抽取、模板物化和 website runtime adapter；替换 Phase 7.1 website token bridge。

## 变更日志

- **2026-09-03 — Phase 8 真实沉浸式运行时完成**：`packages/agent-ui/src/immersive/` 现在是 rich AgentShell、Base UI 闭包、hooks、utility、显式 contracts 与 canonical theme/typeset 的唯一来源；`sync-agent-ui.mjs` 仅向 immersive-starter 单向物化完整独立源码，Copilot 不接收 immersive 文件；website 直接依赖 package runtime，并在 website-local adapter 中把中立 JSON `ArtifactTarget` 映射为 panel/image routes。Phase 7.1 的 website 产品 token bridge 已由 package canonical theme 取代。实施方案：`docs/plans/2026-09-03-phase-8-real-immersive-runtime.md`。
- **2026-09-03 — v0.1.0 稳定基线**：开始以语义化版本管理根 workspace、`@agent-ux/agent-ui`、两套 active 模板与 website workspace；`CHANGELOG.md` 以 `[Unreleased]` + 带日期版本段记录发布。v0.1.0 冻结 Phase 0–8 的 skill、模板、运行时与质量门禁能力。website 仅保留为内部 showcase，体验与信息架构优化暂缓到独立后续迭代，不阻塞 skill 发布。
- **2026-09-03 — v0.1.0 门禁清理**：将 `useIsMobile` 改为 lazy `matchMedia` 初始化，Composer 专家选择改为受控/非受控统一派生状态，消除两处 effect 同步状态 warning；为 shadcn 风格公开 helper/hook 的 intentional mixed exports 增加精确 Oxlint 抑制并同步 immersive 模板。`npm audit fix --package-lock-only --ignore-scripts` 将传递依赖 `qs` 更新到安全版本；`npm audit` 为 0 vulnerabilities。immersive 与 website 仍各有一个大于 500 kB 的初始 chunk 性能提示，已明确留作独立性能优化，不通过提高阈值掩盖。
- **2026-09-03 — v0.1.0 分发归档**：新增 `releases/pangea-design-ai-v0.1.0.zip`，从 `skills/pangea-design-ai/` 打包当前稳定 skill，包含入口、参考文档、校验脚本和两套模板源码；明确排除 `node_modules`、`dist` 与 `.DS_Store`。已用 `unzip -t` 完整性校验并确认含 `pangea-design-ai/SKILL.md`，压缩包大小为 577,144 bytes。
- **2026-09-03 — skill 更名与重新分发**：skill 目录与 frontmatter machine name 已从 `agent-ux-react` 统一更名为 `pangea-design-ai`；根 workspace、同步脚本、组件文档 metadata、维护文档及 lockfile workspace 键均已同步。保留 `@agent-ux/agent-ui` 及其运行时 imports，不把 skill 重命名扩展为破坏性包 API 变更。新增 `releases/pangea-design-ai-v0.1.0.zip`（573,604 bytes），内部顶层目录同名，已排除 `node_modules`、`dist`、`.DS_Store` 和模板 `.workbuddy` 本地记忆；旧 `agent-ux-react-v0.1.0.zip` 保留为更名前的历史归档。