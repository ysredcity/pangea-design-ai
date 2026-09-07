# 项目上下文台账（PROJECT_CONTEXT）

> 本文件是跨会话、跨软件、跨电脑的单一事实源。只记录对后续工作仍有用的当前事实、关键决策、文件地图和待办。最后更新：**2026-09-06**。

## 1. 项目定位

`pangea-design-ai` 是智能体产品交互设计的 React skill。它让 AI agent 基于《智能体产品交互设计指南 V1.4》和项目内设计契约，生成**可运行的智能体应用**，而不是规范站、组件图谱、落地页、配置编辑器或需求文档页。

- 技术栈：React 19、Vite 8、TypeScript、Tailwind CSS v4、shadcn v4（Base UI）、lucide-react。
- 使用者：PM 用 mock 数据制作高保真 demo；开发者在同一底座上继续接入真实业务。
- 形态：沉浸式 Agent 和助手式 Copilot 各有独立模板；嵌入式按场景设计，不固化模板。
- 设计规则事实源：`skills/pangea-design-ai/references/design.md`。
- 当前稳定版本：**v0.2.0（2026-09-06）**。

## 2. 当前状态

### Skill 与模板

- `skills/pangea-design-ai/SKILL.md` 已包含三道行为门：先在对话中确认界面架构需求、逐项判断配置能否覆盖、最终交付必须是可运行的智能体应用。
- `references/` 已覆盖设计规则、质量门禁、需求规格化、组件六层目录、扩展点地图、设计 token 和两种界面形态。
- `templates/immersive-starter/` 与 `templates/copilot-starter/` 均为可独立复制运行的 Vite 工程。
- `packages/agent-ui/` 是共享对话域和双形态运行时的唯一源码；`scripts/sync-agent-ui.mjs` 单向物化到两套模板，模板不依赖 monorepo 才能运行。
- 运行时包名保持 `@agent-ux/agent-ui`；skill 更名不扩展为破坏性的 package/import 重命名。

### 关键能力

- TS/JSON 双数据源剧本契约已建立；沉浸式默认使用有类型检查的 TS 场景。
- 沉浸式新对话会先按 trigger 匹配已有场景，keyword 使用最长命中优先，regex 只在 keyword 未命中时兜底；命中后保留用户真实输入和附件。
- 审批状态由场景末轮 `awaitingApproval` 派生，不在会话 meta 重复手写；审批结果支持 `productBlock`。
- `check-scripts.mjs` 校验审批末轮、确认卡、approved/rejected 双分支、孤立 outcomes 和 trigger 冲突。
- 根级门禁包含 package 类型检查、模板漂移、组件文档和两套模板 gate。
- Website 退役后的根级 `npm run gate` 已通过；`git diff --check` 通过。沉浸式仍有已知的初始 chunk >500 kB 警告，未通过提高阈值掩盖。

### Website

- 原 `website/` 文档站、模板演示、组件图谱和 JSON 剧本编辑器已于 **2026-09-06 退役**。
- 目录仅保留 `website/README.md` 作为路径占位；不再属于 npm workspace、根级 gate、版本同步范围或 skill 发布物。
- 历史方案和实施计划保留在 `docs/proposals/`、`docs/plans/`，只用于追溯，不代表当前工程状态。
- 后续如重启网站开发，先重新确认目标、信息架构和与 `packages/agent-ui` 的消费边界，不直接恢复旧实现。

### 发布物

- 当前归档：`releases/pangea-design-ai-v0.2.0.zip`。
- 历史归档继续保留：`pangea-design-ai-v0.1.0.zip`、`agent-ux-react-v0.1.0.zip`。
- ZIP 排除 `node_modules`、`dist`、`.DS_Store` 和模板 `.workbuddy`。
- 不自动执行 `git commit` 或 `git push`。

## 3. 不可破坏的关键决策

1. **生成能力优先**：skill 生成应用是主用途；任何辅助工具不得让 agent 的表达能力退化。
2. **两套模板独立**：沉浸式与 Copilot 的空间优先级和响应式方向不同，不做运行时形态切换。
3. **共享源码、独立交付**：先改 `packages/agent-ui`，再同步到模板；不得直接手改物化文件。模板复制到仓库外仍须可安装、构建和运行。
4. **数据与呈现分层**：共享 conversation 域保持中立，不依赖沉浸式 Panel/Tab 或 Copilot Canvas。
5. **产物路由按形态分流**：沉浸式进入右侧面板或图片查看器；Copilot 只更新左侧工作区。
6. **审批单一事实源**：`approvalStatus` 从场景末轮派生；审批续流程由 `awaitingApproval` 判定。
7. **trigger 不依赖声明顺序**：keyword 最长命中优先；跨场景重复或互为子串由机检拦截，不使用领域黑名单。
8. **文档按任务与受众分层**：agent 只读当前任务需要的最小文档集合，避免生成过程被 50+ 份参考文档拖长；README 与 CHANGELOG 只记录核心 skill/runtime 能力，不记录内部 showcase 的建设或退役过程。
9. **值与视觉约束**：颜色只使用语义 token；Base UI 与 Radix API 不兼容，不得恢复 Radix。
10. **高风险操作确认**：确认卡只出现在即将执行动作的末轮；待批准期间阻断新指令，并同时提供 approved/rejected 结果。

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

- **2026-09-06 — v0.2.0**：skill 更名为 `pangea-design-ai`；修复审批契约、续流程与状态派生；把 TS 审批语义检查接回；新增自然语言场景入口和最长 trigger 匹配；增加按任务读取路由；发布 `pangea-design-ai-v0.2.0.zip`。
- **2026-09-06 — Website 退役与台账重整**：清空原 website 实现，仅留 README 占位；移除 workspace、根 gate、lockfile和版本同步耦合；将累积 443 行、包含重复阶段记录与冲突状态的台账重写为当前事实源。
- **2026-09-03 — v0.1.0**：完成 Base UI 双模板、共享运行时、剧本引擎、组件文档体系、扩展点地图和根级质量门禁，并归档首个稳定版本。

## 8. 更新规则

完成里程碑、做出影响后续的重要决策、新增/移动/删除重要文件或明确待办变化时：更新对应小节，追加一条精简变更日志，并用 `date +%F` 刷新顶部日期。只保留对后续有用的信息；阶段性过程交给 Git 历史和 `docs/plans|proposals`。
