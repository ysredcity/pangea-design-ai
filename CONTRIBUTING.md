# 贡献指南（CONTRIBUTING）

本工程维护**智能体产品交互设计的 React skill**（`skills/agent-ux-react/`）。技术栈为 React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui + lucide-react。

本 skill 是**给 AI agent 消费的知识库**，目标是让 agent 产出「交互符合《智能体产品交互设计指南》+ 视觉符合项目主题」的前端代码。改动前请先读完本指南。

---

## 一、核心原则（改动铁律）

1. **设计规则以《智能体产品交互设计指南》为唯一事实源。** `references/design.md` 是该指南的机读转写版；指南更新时先改 `design.md`，再视需要回填/标注人读原文 `docs/智能体产品交互设计指南V1.4.md`。两者冲突以 `design.md` 为准（它是可执行版本）。
2. **视觉 token 以项目主题文件（`globals.css` 的 `@theme`/`:root`/`.dark`）为唯一事实源。** Figma、设计稿、记忆都不是权威——冲突时以运行时 CSS 变量为准。当前色板层已由用户提供，字体/间距/圆角/阴影/组件级 token 待补充，**不臆造取值**。
3. **区分「照搬」与「定制」**：
   - **照搬（verbatim）**：`docs/智能体产品交互设计指南V1.4.md`（人读原文，不改内容，只能整篇替换升级版本）。
   - **定制（本 skill 专属）**：`SKILL.md`、`references/design.md`、`references/theme/design-tokens.md`、`references/component-selection/`、`references/patterns/`、`templates/immersive-starter/`、`templates/copilot-starter/`。
4. **设计规则只写一处（`references/design.md`）。** 判断标准：一条规则在**2 个以上界面形态或组件**上生效 → 正文进 `design.md`，其它文件只留一行指针 + 链接，不复制正文。**严禁把设计规则写进具体组件实现文件之外的地方重复陈述**——组件文档只写该组件独有的适用边界与坑。
5. **双受众目的不变**：产物是可运行的 React 工程，同时服务 PM 出高保真 demo（mock 数据）与开发基于 PRD 产出界面（真实接口）；两者结构/组件/主题一致，仅数据来源不同。
6. **两套脚手架对用户独立，不做运行时切换**：沉浸式 `immersive-starter` 与助手式 `copilot-starter` 是两个完全独立的起始工程，交付给用户时不依赖任何 workspace，不做"同一工程内切换布局"的设计。
7. **纯前端边界**：产出始终是完整的前端工程（页面/组件/前端状态/mock 或调用既有接口），**不产出、不涉及后端代码或服务**。
8. **公共对话组件层只有一份源码，改动必须先改源头再同步**（⚠️ 2026-08-27 起生效，取代此前"两份拷贝各自维护"的做法）：消息气泡、澄清卡片、确认卡片、制品卡片等对话组件的**唯一源码**在 `packages/agent-ui/src/`（npm workspace 包 `@agent-ux/agent-ui`），两套脚手架的 `src/components/agent-ui/`（以及 `src/components/ui/button.tsx`、`dropdown-menu.tsx`、`src/lib/utils.ts`）是**物化拷贝**，由 `node scripts/sync-agent-ui.mjs` 从源码生成（并把包内相对路径改写成脚手架的 `@/` 别名）。**禁止直接编辑脚手架里 `agent-ui/`、`ui/button.tsx`、`ui/dropdown-menu.tsx` 这几个同步产物**——改了会在下次同步时被覆盖，也会被 `npm run gate` 的漂移检测（`check:agent-ui-drift`）拦下。正确流程：改 `packages/agent-ui/src/*` → 跑 `node scripts/sync-agent-ui.mjs` → 提交时脚手架里的 diff 会一起出现，用于确认"这次组件改动影响了哪些交付文件"。`website/`（见 [website-showcase 方案](docs/proposals/website-showcase.md)）直接以 workspace 依赖引用 `@agent-ux/agent-ui`，不需要同步。

---

## 二、目录结构与职责

本仓库是 **npm workspaces monorepo**（根 `package.json` 的 `workspaces` 字段声明了 `packages/*` 与 `skills/agent-ux-react/templates/*`）。

```
agent-ued-guide/
├── package.json                   # workspaces 根；npm run gate 编排全仓库检查
├── CONTRIBUTING.md                # 本文件：治理与贡献规则
├── CHANGELOG.md                   # 变更记录（写给使用者：每版交付了什么）
├── PROJECT_CONTEXT.md             # 工程台账（写给维护者：全部上下文与过程）
├── docs/
│   ├── 智能体产品交互设计指南V1.4.md  # 设计依据原文（人读，照搬）
│   └── proposals/                  # 已确认但可能仍在实现中的架构方案文档
├── scripts/
│   └── sync-agent-ui.mjs          # 把 packages/agent-ui 源码物化同步进两套脚手架（含 --check 漂移检测）
├── packages/
│   └── agent-ui/                   # 【唯一源码】公共对话组件 + 布局外壳（workspace 包 @agent-ux/agent-ui）
│       └── src/
│           ├── *.tsx               # 9 个对话组件（composer/message-bubble/task-progress/...）
│           ├── layout/              # immersive-shell.tsx / copilot-shell.tsx
│           ├── ui/                  # button.tsx / dropdown-menu.tsx（组件内部依赖的 shadcn 基础件）
│           └── lib/utils.ts
├── website/                        # （待实现，见 docs/proposals/website-showcase.md）文档站 + 在线编辑器
└── skills/
    └── agent-ux-react/
        ├── SKILL.md               # 入口：两阶段确认门 + 界面形态决策树 + 索引（定制）
        ├── scripts/
        │   ├── build-catalog.mjs  # 元数据生成器（零依赖）
        │   └── check-tokens.mjs   # 裸色值机检
        ├── references/
        │   ├── design.md                    # 全局设计规则（唯一事实源，定制）
        │   ├── theme/design-tokens.md        # 视觉 token（定制，待补全）
        │   ├── overview/                     # 需求规格化/工程结构/质量门禁/元数据 schema（定制）
        │   ├── patterns/                     # 布局外壳说明文档：沉浸式/助手式（定制）
        │   ├── component-selection/          # 公共对话组件选型元数据（定制）
        │   └── _generated/catalog.json       # 机读索引（生成，勿手改）
        └── templates/
            ├── immersive-starter/            # 沉浸式可运行脚手架（agent-ui/ 等目录是同步产物，勿手改）
            └── copilot-starter/               # 助手式可运行脚手架（同上）
```

---

## 三、常见改动的操作规范

### A. 更新视觉 token（主题变化）

1. 取项目最新 `globals.css`（或等价主题文件）的 `@theme`/`:root`/`.dark` 定义作为事实源。
2. 更新 `references/theme/design-tokens.md` 中受影响的取值。
3. 同步更新两套脚手架的 `src/styles/globals.css`。
4. 在 `CHANGELOG.md` 记录变更的 token。

### B. 更新设计规则（指南版本升级）

触发场景：《智能体产品交互设计指南》发布新版本。

1. 对比新旧版本差异。
2. 更新 `references/design.md` 对应分组的正文。
3. 同步更新 `SKILL.md`「全局设计规则」表的一句话结论。
4. 若涉及组件行为变化，同步 `component-selection/` 与两套脚手架的 `agent-ui/` 实现。
5. `docs/` 下的原文档整篇替换为新版本，文件名带版本号。

### C. 新增/修改公共对话组件

1. 先判断是否已有类似组件（澄清卡片 vs 确认卡片 vs 制品卡片边界见 `design.md` 3.3–3.5）。
2. 新建/修改 `references/component-selection/<组件>.md`，含 frontmatter `meta`（`kind: component`）。
3. 在 **`packages/agent-ui/src/`** 实现（唯一源码，用相对路径引用包内其它文件，不写 `@/` 别名——那是脚手架专属的别名，包内不认识）。
4. 跑 `node packages/agent-ui/../../scripts/sync-agent-ui.mjs`（即根目录的 `npm run sync:agent-ui`）把改动物化同步进两套脚手架。
5. 跑 `npm run gate`（根目录）确认漂移检测 + 类型检查 + 两套脚手架构建全部通过。
6. 重跑 `node skills/agent-ux-react/scripts/build-catalog.mjs`。
7. `SKILL.md` 索引表加行。

### D. 新增/修改界面形态布局外壳

1. 新建/修改 `references/patterns/<形态>-shell.md`，含 frontmatter `meta`（`kind: layout-shell`）。
2. 若是全新形态，评估是否需要新脚手架 `templates/<形态>-starter/`。
3. `SKILL.md` 决策树与索引同步更新。

### E. 工程脚手架维护

- 两套脚手架必须保持 `npm install && npm run build && npm run dev` 通过。改依赖/配置后**必须重新跑通这三步**，并更新 `package-lock.json`。
- **PM Demo 自动化预览是本 skill 的明确要求**（用户不应关注编译/启动）：agent 首次生成后自动 `npm install` + `npm run dev`（后台），每轮修改后自动确认/重启 dev server。不要引入需要用户手动触发预览的机制。
- shadcn 组件按需通过 `npx shadcn@latest add <component>` 添加，不预置全量组件。新装的组件如果本身不是 `agent-ui/` 依赖的基础件（当前只有 `button`/`dropdown-menu`），直接留在脚手架的 `src/components/ui/` 里即可，不需要进 `packages/agent-ui`。

### F. 组件源码同源机制（`packages/agent-ui` + `sync-agent-ui.mjs`）

- **唯一源码在 `packages/agent-ui/src/`**，两套脚手架的 `src/components/agent-ui/`、`src/components/ui/button.tsx`、`src/components/ui/dropdown-menu.tsx`、`src/lib/utils.ts` 都是从这里同步出去的物化拷贝，**不要直接改这些拷贝文件**。
- **开发态（本仓库内）**：`packages/agent-ui` 作为 workspace 包 `@agent-ux/agent-ui` 存在，`website/` 直接以 `workspace:*` 依赖引用，不需要同步就能拿到最新代码。
- **发布态（用户拿到的脚手架）**：用户 `cp -R templates/immersive-starter my-app` 之后不会带着 `packages/agent-ui`，所以脚手架必须内置一份**不依赖 workspace 的物化拷贝**——这就是 `sync-agent-ui.mjs` 存在的原因：把包内的相对路径引用（`./lib/utils`、`../ui/button` 等）改写成脚手架的 `@/` 别名路径，产出脚手架能独立运行的版本。
- **常用命令**（均在仓库根目录执行）：
  - `npm run sync:agent-ui` — 把 `packages/agent-ui` 的改动同步进两套脚手架。
  - `npm run check:agent-ui-drift` — 只检测漂移不写入，两套脚手架与源码不一致时非零退出（`npm run gate` 会自动跑这一步，相当于"发布态漂移检测"，防止有人手改了拷贝出去的版本而没改源头）。
  - `npm run check:agent-ui-types` — 对 `packages/agent-ui` 单独跑 `tsc --noEmit`。
- **两个脚手架各自只拿自己对应的布局外壳**：`immersive-starter` 只同步 `layout/immersive-shell.tsx`（落地为 `ImmersiveShell.tsx`），`copilot-starter` 只同步 `copilot-shell.tsx`（落地为 `CopilotShell.tsx`），不会把另一种也塞进去。
- **`agent-ui/index.ts` 的同步例外**：包内源码的 `index.ts` 还导出了 `layout/*`（供 `website/` 直接 `import { ImmersiveShell } from '@agent-ux/agent-ui'` 使用），但脚手架里没有对应的扁平路径（布局外壳走 `@/components/layout/`），所以同步时会自动剔除这两行 `export`，脚手架拿到的 `agent-ui/index.ts` 只导出 9 个对话组件本身。

---

## 四、编写规范

- 文档语言：简体中文为主，代码示例保留英文标识符。
- 代码示例遵循 skill 的「关键约定」：React 19 函数组件 + Hooks、TypeScript、Tailwind utility class、`lucide-react` 图标；不引入 class 组件、不混用其它 UI 库/图标库。
- 颜色一律用 Tailwind 语义类，**禁止硬编码 hex/rgb**。
- front-matter：参考文档用 `name` + `description` + `user-invocable: false`（除布局外壳/组件文档可设 `true`）；`SKILL.md` 用 `name` + `description`。

---

## 五、提交前检查（Checklist）

- [ ] 改动的 token 值能在项目主题文件（`globals.css`）中找到出处。
- [ ] 设计规则改动已先落在 `design.md`，未在别处重复陈述正文。
- [ ] 新增/移动/删除文件后，`SKILL.md` 索引已同步、链接可达。
- [ ] 示例代码符合「关键约定」：无硬编码颜色、无 class 组件、图标只用 lucide-react。
- [ ] 两套脚手架的公共对话组件实现是否需要同步更新（若改动涉及 `agent-ui/`）。
- [ ] 已按「六、CHANGELOG 与工程台账的分工」把内容记到正确的文件。

---

## 六、CHANGELOG 与工程台账的分工

与 pangea-design-skill 相同的约定（详细说明见该项目 `CONTRIBUTING.md` 第七节，此处不重复）：

| | `CHANGELOG.md` | `PROJECT_CONTEXT.md`（台账） |
|---|---|---|
| 读者 | **skill 使用者** | **维护者（日常迭代）** |
| 回答什么 | 这个版本多了什么能力、升级后有什么不一样 | 这个工程当前是什么状态、为什么这么做、别再踩哪些坑 |
| 粒度 | 一条一行，能力/约束/行为变化 | 想多细写多细：过程、根因、实测数据、教训 |

**只进台账、不进 CHANGELOG**：同一版本内对新增内容的返工与修正、根因排查与踩坑细节、逐项实测记录、不随包分发的仓库工具。

**判断方法**：把这条写进去之前问一句——*使用者不知道这件事，会不会用错、或错过一个能力？* 不会，就只进台账。
