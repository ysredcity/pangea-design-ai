# 项目上下文台账（PROJECT_CONTEXT）

> 本文件是跨会话、跨软件、跨电脑的单一事实源。只记录对后续工作仍有用的当前事实、关键决策、文件地图和待办。最后更新：**2026-09-06**。

## 1. 项目定位

`pangea-design-ai` 是智能体产品交互设计的 React skill。它让 AI agent 基于《智能体产品交互设计指南 V1.4》和项目内设计契约，生成**可运行的智能体应用**，而不是规范站、组件图谱、落地页、配置编辑器或需求文档页。

- 技术栈：React 19、Vite 8、TypeScript、Tailwind CSS v4、shadcn v4（Base UI）、lucide-react。
- 使用者：PM 用 mock 数据制作高保真 demo；开发者在同一底座上继续接入真实业务。
- 形态：沉浸式 Agent 和助手式 Copilot 各有独立模板；嵌入式按场景设计，不固化模板。
- 设计规则事实源：`skills/pangea-design-ai/references/design.md`。
- 当前稳定版本：**v0.3.0（2026-09-06）**。

## 2. 当前状态

### Skill 与模板

- `skills/pangea-design-ai/SKILL.md` 已包含三道行为门：先在对话中确认界面架构需求、逐项判断配置能否覆盖、最终交付必须是可运行的智能体应用。
- `references/` 已覆盖设计规则、质量门禁、需求规格化、组件六层目录、扩展点地图、设计 token 和两种界面形态。
- `templates/immersive-starter/` 与 `templates/copilot-starter/` 均为可独立复制运行的 Vite 工程。
- `packages/agent-ui/` 是共享对话域和双形态运行时的唯一源码；`scripts/sync-agent-ui.mjs` 单向物化 TypeScript 与 canonical theme/typeset 到两套模板，模板不依赖 monorepo 才能运行。
- Copilot 对话辅助区已统一为 `sidebar | floating | collapsed` 三态：桌面侧栏 400px 贴右全高、浮窗 400×600px、收起后优先宿主顶部入口否则右下 44×44px Sparkles；旧 `assistantMode` 仅保留兼容映射。
- Copilot Header 固定按新对话、历史对话、模式菜单、更多、关闭排列；模式菜单含侧边栏/浮动，更多含分享/设置。
- Agent 与 Copilot 共同消费 `ConversationSection` 的 rich Flow、rich Composer、Markdown、执行过程、卡片、滚动/Footer 和草稿；两形态只保留各自 Header 与 artifact adapter。
- 运行时包名保持 `@agent-ux/agent-ui`；skill 更名不扩展为破坏性的 package/import 重命名。

### 关键能力

- TS/JSON 双数据源剧本契约已建立；沉浸式默认使用有类型检查的 TS 场景。
- 沉浸式新对话会先按 trigger 匹配已有场景，keyword 使用最长命中优先，regex 只在 keyword 未命中时兜底；命中后保留用户真实输入和附件。
- 审批状态由场景末轮 `awaitingApproval` 派生，不在会话 meta 重复手写；审批结果支持 `productBlock`。
- `check-scripts.mjs` 校验审批末轮、确认卡、approved/rejected 双分支、孤立 outcomes 和 trigger 冲突。
- 根级门禁包含 package 类型检查、模板漂移、组件文档和两套模板 gate。
- v0.3.0 根级 `npm run gate`、`git diff --check` 与从 ZIP 解压到仓库外后的双模板独立 `npm install && npm run gate` 均已通过；同步漂移为 0，组件文档 40 份通过。沉浸式与 Copilot 均有初始 chunk >500 kB 的已知警告，未通过提高阈值掩盖。

### Website

- 原 `website/` 文档站、模板演示、组件图谱和 JSON 剧本编辑器已于 **2026-09-06 退役**。
- 目录仅保留 `website/README.md` 作为路径占位；不再属于 npm workspace、根级 gate、版本同步范围或 skill 发布物。
- 历史方案和实施计划保留在 `docs/proposals/`、`docs/plans/`，只用于追溯，不代表当前工程状态。
- 后续如重启网站开发，先重新确认目标、信息架构和与 `packages/agent-ui` 的消费边界，不直接恢复旧实现。

### 发布物

- 当前归档：`releases/pangea-design-ai-v0.3.0.zip`（330 entries，683,858 bytes；SHA-256 `27e433189bdd7b348ee487725a60a622989a9ed6f0c693b3a4ba71c5ddc89edc`）。
- 历史归档继续保留：`pangea-design-ai-v0.2.0.zip`、`pangea-design-ai-v0.1.0.zip`、`agent-ux-react-v0.1.0.zip`。
- ZIP 排除 `node_modules`、`dist`、`.DS_Store` 和模板 `.workbuddy`；归档根目录、版本号、关键共享组件与 CRC 均已验证，排除项命中为 0。
- 不自动执行 `git commit` 或 `git push`。

## 3. 不可破坏的关键决策

1. **生成能力优先**：skill 生成应用是主用途；任何辅助工具不得让 agent 的表达能力退化。
2. **两套模板独立**：沉浸式与 Copilot 的空间优先级和响应式方向不同，不做运行时形态切换。
3. **共享源码、独立交付**：先改 `packages/agent-ui`，再同步到模板；不得直接手改物化文件。模板复制到仓库外仍须可安装、构建和运行。
4. **数据与呈现分层**：共享 conversation 域保持中立，不依赖沉浸式 Panel/Tab 或 Copilot Canvas。
5. **产物路由按形态分流**：沉浸式进入右侧面板或图片查看器；Copilot 只更新左侧工作区。
6. **共享完整对话 Section**：Agent 与 Copilot 直接复用同一个 `ConversationSection`（rich Flow、rich Composer、滚动/Footer、草稿）；Header、Panel/ImageViewer 与 Canvas adapter 留在形态壳层。
7. **Copilot 三态契约**：新 API 只使用 `sidebar | floating | collapsed` 并支持受控/非受控状态；桌面 sidebar 不隐式降级浮窗，移动端全屏；旧四值 `assistantMode` 仅兼容，不作为新实现入口。
8. **审批单一事实源**：`approvalStatus` 从场景末轮派生；审批续流程由 `awaitingApproval` 判定。
9. **trigger 不依赖声明顺序**：keyword 最长命中优先；跨场景重复或互为子串由机检拦截，不使用领域黑名单。
10. **文档按任务与受众分层**：agent 只读当前任务需要的最小文档集合，避免生成过程被 50+ 份参考文档拖长；README 与 CHANGELOG 只记录核心 skill/runtime 能力，不记录内部 showcase 的建设或退役过程。
11. **值与视觉约束**：颜色只使用语义 token；Base UI 与 Radix API 不兼容，不得恢复 Radix。
12. **高风险操作确认**：确认卡只出现在即将执行动作的末轮；待批准期间阻断新指令，并同时提供 approved/rejected 结果。

## 4. 文件地图

```text
agent-ued-guide/
├── package.json                          # workspace 与根级 gate
├── package-lock.json                     # 根依赖锁文件，使用 npm 重算
├── PROJECT_CONTEXT.md                    # 本台账
├── README.md / CONTRIBUTING.md / CHANGELOG.md
├── docs/
│   ├── 智能体产品交互设计指南V1.4.md
│   ├── proposals/                        # 历史方案与架构决策
│   └── plans/                            # 历史实施计划
├── packages/agent-ui/                    # 共享运行时唯一源码
│   └── src/
│       ├── conversation/                 # 中立共享对话域
│       ├── immersive/                    # 沉浸式运行时
│       ├── copilot/                      # Copilot 运行时
│       └── script-engine/                # trigger/解析/剧本契约
├── scripts/sync-agent-ui.mjs             # package → 两套模板物化
├── skills/pangea-design-ai/
│   ├── SKILL.md
│   ├── references/
│   ├── scripts/                          # token/剧本/组件文档校验
│   └── templates/
│       ├── immersive-starter/
│       └── copilot-starter/
├── website/README.md                     # 退役网站的路径占位
└── releases/                             # 当前与历史 ZIP 归档
```

重要实现入口：

- 审批与场景契约：`packages/agent-ui/src/immersive/contracts.ts`
- 新对话和审批派生：`packages/agent-ui/src/immersive/agent-layout/agent-shell.tsx`
- 对话/审批续流程：`packages/agent-ui/src/immersive/agent-layout/conversation-flow.tsx`
- 跨形态完整对话区：`packages/agent-ui/src/immersive/agent-layout/conversation-section.tsx`
- 跨形态底层表面：`packages/agent-ui/src/conversation/conversation-surface.tsx`
- Copilot 三态与产物路由壳层：`packages/agent-ui/src/copilot/copilot-app.tsx`
- trigger 匹配：`packages/agent-ui/src/script-engine/match.ts`
- 剧本类型：`packages/agent-ui/src/script-engine/types.ts`
- 剧本机检：`skills/pangea-design-ai/scripts/check-scripts.mjs`
- 组件事实校验：`skills/pangea-design-ai/scripts/check-component-docs.mjs`

## 5. 维护流程

共享运行时改动：

```bash
npm run sync:agent-ui
npm run check:agent-ui-drift
npm run gate
git diff --check
```

版本发布：

1. 同步根、`packages/agent-ui` 和两套 active 模板的版本。
2. 用 `npm install --package-lock-only` 重算 lockfile。
3. 整理 CHANGELOG、README、SKILL.md 和本台账。
4. 从 `skills/pangea-design-ai/` 打包 ZIP，保留历史归档。
5. 验证 ZIP 完整性与根级 gate；不自动提交或推送。

## 6. 当前待办

- [ ] 等待视觉事实源：完整调色板、字体/字号/字重、间距、圆角、阴影、基础布局和核心组件设计稿；收到后回填 `design-tokens.md` 与模板主题。
- [ ] 补充需求规格化中的“生成剧本数据映射规则”。
- [ ] 优化沉浸式初始 chunk（当前 >500 kB）；不得仅提高告警阈值掩盖问题。
- [ ] 验证 PM Demo 自动预览在真实 agent 执行环境中的可靠性。
- [ ] 视真实产品需求决定是否提供 Embedded 参考实现。
- [ ] 若未来重启 website，先建立新的目标与方案，不恢复旧实现作为默认答案。

## 7. 变更日志（台账）

- **2026-09-06 — v0.3.0**：发布 Copilot sidebar/floating/collapsed 三态与五操作 Header；Agent/Copilot 改为直接复用 rich `ConversationSection`；同步 canonical Base UI/theme 到 Copilot 独立模板；归档 `pangea-design-ai-v0.3.0.zip`。
- **2026-09-06 — Copilot Figma 校准与 rich section 复用**：修正 sidebar 误呈浮窗；Header 按新对话/历史/模式/更多/关闭实现及菜单；抽取 Agent/Copilot 共用 `ConversationSection`，Copilot 改用同一 rich Flow、Composer、Markdown、执行过程和卡片，同时保持产物只更新主画布。
- **2026-09-06 — Copilot 三态与共享对话表面**：按 Figma `12838:5913` 将助手区收敛为 sidebar/floating/collapsed，增加受控/非受控状态与顶部/右下重开入口；新增跨形态 `ConversationSurface`，对齐 Composer、主题和响应式，同时保持 Copilot 产物只更新主画布。
- **2026-09-06 — v0.2.0**：skill 更名为 `pangea-design-ai`；修复审批契约、续流程与状态派生；把 TS 审批语义检查接回；新增自然语言场景入口和最长 trigger 匹配；增加按任务读取路由；发布 `pangea-design-ai-v0.2.0.zip`。
- **2026-09-06 — Website 退役与台账重整**：清空原 website 实现，仅留 README 占位；移除 workspace、根 gate、lockfile和版本同步耦合；将累积 443 行、包含重复阶段记录与冲突状态的台账重写为当前事实源。
- **2026-09-03 — v0.1.0**：完成 Base UI 双模板、共享运行时、剧本引擎、组件文档体系、扩展点地图和根级质量门禁，并归档首个稳定版本。

## 8. 更新规则

完成里程碑、做出影响后续的重要决策、新增/移动/删除重要文件或明确待办变化时：更新对应小节，追加一条精简变更日志，并用 `date +%F` 刷新顶部日期。只保留对后续有用的信息；阶段性过程交给 Git 历史和 `docs/plans|proposals`。
