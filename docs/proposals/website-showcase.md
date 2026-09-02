# 方案：Website / Showcase（含在线编辑器）

> 状态：**方案已确认，待实现**（含 npm workspaces + `packages/agent-ui` 同源方案）。本文档定方向和结构，代码尚未开始。
> ⚠️ **后续变更**：workspaces 同源机制已于 2026-08-27 实现；采纳 [agent-layout 作为沉浸式事实源](./agent-layout-integration.md) 后，第 4 节的抽取粒度与第 3 节的可编辑配置项有修订，见第 7 节。**实现顺序调整为最后一步**（Phase 7），排在组件文档体系与扩展点地图之后。
> 关联：[README.md](../../README.md) · [CONTRIBUTING.md](../../CONTRIBUTING.md) · [mock-script-engine.md](./mock-script-engine.md)

## 1. 目标与范围

新增 `website/` 目录，服务两个目的：

1. **文档/组件展示**（偏静态）：把 `SKILL.md`/`design.md`/`CHANGELOG.md`/`_generated/catalog.json` 渲染成可浏览的站点，替代"直接读仓库 Markdown"。
2. **沉浸式在线编辑器**：一个纯前端工具，PM 可以在网页上改「应用身份 / 导航固定入口 / 对话剧本」并**实时预览**，不需要起本地工程、不需要 `npm install`。

已确认的边界：

- 只服务**沉浸式 Agent**。助手式 Copilot 的主工作区（画布/代码/表格等）差异太大，无法参数化成通用播放器，助手式仍走"起 `copilot-starter` 脚手架 + 工程师/agent 写代码"的路子。网站里"在线编辑器"入口只出现在沉浸式模板介绍页。
- 部署到 Cloudflare（Cloudflare Pages），纯静态产物，不需要考虑鉴权与多人协作。
- 不提供持久化服务：编辑器状态存 `localStorage` 做"刷新不丢"，**导入/导出 JSON 文件**是用户备份和分享效果的唯一方式（用户自己发文件给别人，别人导入到编辑器还原效果）。

## 2. 架构：选项 A（通用播放器 + 配置对象）

对比过的两个选项：

- **选项 A（选定）**：部署一份通用的"沉浸式播放器"（`immersive-starter` 去掉具体业务页面，只保留"读配置对象渲染"的壳），编辑器是"表单/JSON 编辑 + 实时预览这个播放器"。纯前端状态驱动，改配置立即重渲染，不需要文件系统、不需要重新起工程。
- **选项 B（未选）**：编辑器直接读写 `templates/immersive-starter` 的真实源文件，预览走真实 Vite dev server。更贴近"编辑器即最终交付物"，但需要后端/文件系统访问，与"零后端、纯静态部署到 Cloudflare"的约束冲突，放弃。

选 A 的连带影响：

- **播放器是第三个产物类型**（区别于 `immersive-starter`/`copilot-starter` 两个业务脚手架），需要独立维护，但它的"渲染逻辑"和脚手架里的布局外壳、`agent-ui/` 组件是同一份代码（见第 4 节的同源方案），维护成本主要在"播放器壳本身"（读配置 → 渲染），不是重复造轮子。
- 编辑器导出的"配置对象 + 剧本 JSON"与真实脚手架共用 [mock-script-engine.md](./mock-script-engine.md) 定义的同一份 schema，理论上可以直接喂给 `immersive-starter` 的 `mock/scenarios.json`——**编辑器是草稿阶段，脚手架是交付阶段**，两者衔接靠"同一份 JSON 格式"而不是靠代码耦合。

## 3. 播放器可编辑的配置项（沉浸式专属，对齐"差异性小"的判断）

| 配置项 | 对应 design.md | 说明 |
|---|---|---|
| 应用名称 / 头像 / 一句话描述 | [1.1 能力识别](../../skills/agent-ux-react/references/design.md#11-能力识别) | 功能导向命名校验（黑名单：不允许配置成人名等，机检可选） |
| 欢迎语 + 3–5 个推荐操作 | [1.2 首屏引导](../../skills/agent-ux-react/references/design.md#12-首屏引导) | 推荐操作数量做范围校验（3–5） |
| 左侧导航固定入口 | [2.1 界面形态](../../skills/agent-ux-react/references/design.md#21-界面形态选型) | 图标（复用 lucide-react 名称）+ 文案 + 是否高亮当前会话的列表 |
| 对话剧本 | 全部场景链路环节 | 见 [mock-script-engine.md](./mock-script-engine.md) 的 `scenarios.json` schema |
| 主题（可选，后置） | [design-tokens.md](../../skills/agent-ux-react/references/theme/design-tokens.md) | 待视觉 token 全量补充后再评估是否开放给编辑器调整，本轮不做 |

配置对象 + 剧本 JSON 合并为一份可导出文件，例如：

```jsonc
{
  "$schemaVersion": "1.0",
  "app": { "name": "合同审核助手", "avatar": "bot", "description": "...", "welcomeMessage": "...", "suggestedPrompts": ["..."] },
  "navigation": { "entries": [{ "icon": "MessageSquare", "label": "对话" }, { "icon": "History", "label": "历史" }] },
  "scenarios": [ /* 见 mock-script-engine.md */ ],
  "fallback": { /* 同上 */ }
}
```

## 4. 组件源码同源方案（决策点 4）

问题：网站的播放器需要用到布局外壳（`ImmersiveShell`）和 9 个 `agent-ui/` 组件，这些组件"有可能做一些自定义样式调整"（你的原话），需要一个机制保证网站用的版本和脚手架交付给用户的版本不会长期分叉。

### 推荐方案：npm workspaces + 独立源码包 `packages/agent-ui`

把当前"写在 `immersive-starter/src/components/agent-ui/` 和 `copilot-starter/src/components/agent-ui/` 各一份"的模式，改成三层结构：

```
agent-ued-guide/
├── package.json                 # workspaces 根，声明 workspaces: ["packages/*", "skills/agent-ux-react/templates/*", "website"]
├── packages/
│   └── agent-ui/                 # 唯一源码：9 个组件 + 布局外壳组件 + 剧本引擎
│       ├── src/
│       │   ├── message-bubble.tsx / composer.tsx / ... （9 个组件）
│       │   ├── layout/immersive-shell.tsx / copilot-shell.tsx
│       │   └── script-engine/     # mock-script-engine.md 落地后的引擎代码
│       └── package.json           # name: "@agent-ux/agent-ui"
├── skills/agent-ux-react/templates/
│   ├── immersive-starter/         # dependencies: "@agent-ux/agent-ui": "workspace:*"（开发态）
│   └── copilot-starter/            # 同上
└── website/
    └── ...                        # 同样 "@agent-ux/agent-ui": "workspace:*"，播放器直接 import
```

**关键点——"给用户的脚手架"和"仓库内部的开发态"要分裂成两种引用方式**：

- **仓库内部开发**（本仓库自己迭代时）：`immersive-starter`/`copilot-starter`/`website` 三者都通过 `workspace:*` 引用 `packages/agent-ui`，改一处、三处同时生效，天然同源，不需要"同步脚本"。
- **交付给用户的脚手架**（用户 `cp -R templates/immersive-starter my-app` 之后）：**不能带着 workspace 依赖**——用户复制出去的工程里没有 `packages/agent-ui`，`workspace:*` 会直接装不上。所以需要一个**发布态转换步骤**：打包/复制时把 `packages/agent-ui/src/*` 的组件源码**物化拷贝**进 `templates/immersive-starter/src/components/agent-ui/`（回到现在的"拷贝源码"模式，符合 shadcn 的哲学、也符合 CONTRIBUTING 里"两套脚手架独立、可单独复制给用户"的既有原则），同时把 `package.json` 里的 workspace 依赖替换成实际的第三方依赖（react/lucide-react 等，`agent-ui` 本身不作为 npm 包发布）。

这一步用一个新脚本实现，建议叫 `scripts/sync-agent-ui.mjs`（类比 pangea 的 `sync-skill.cjs`，用途相同：把"开发态的唯一源码"同步成"发布态的多份拷贝"）：

```
node scripts/sync-agent-ui.mjs
# 从 packages/agent-ui/src/*.tsx 拷贝到：
#   skills/agent-ux-react/templates/immersive-starter/src/components/agent-ui/
#   skills/agent-ux-react/templates/copilot-starter/src/components/agent-ui/
# 拷贝时替换 import 路径（去掉 workspace 包名前缀，改成脚手架内相对路径 @/lib/utils 等）
```

**为什么不是"网站直接复制脚手架里那份，而不建 packages/"**：因为你提到"组件有可能做样式调整"，如果同源关系是"两个脚手架各自一份、网站再抄一份"，会变成三份要人工保持一致，且没有一个"谁是源头"的单一事实源。`packages/agent-ui` 把源头收敛成一份，网站直接实时引用（不需要同步，workspace 天然最新），两个脚手架靠 `sync-agent-ui.mjs` 定期物化，**改动 → 跑同步脚本 → 两个脚手架的 diff 里能清楚看到这次组件改动影响了哪些交付文件**，可追溯性比"三份手动对齐"强。

代价：多了 `packages/agent-ui` 这一层和一个同步脚本，仓库结构变复杂一点；`sync-agent-ui.mjs` 需要处理"import 路径改写"这个小细节（workspace 包名 → 相对路径），复杂度可控。

### 备选方案（未选，记录原因）

- **方案 B：网站单独维护一份精简 `agent-ui`**（不同源，网站按需砍掉部分依赖如 `dropdown-menu`/`sheet`，因为播放器场景可能不需要）。放弃原因：违反"同源"要求，等于主动制造分叉，与你的第 4 点决策直接冲突。
- **方案 C：网站直接 `import` 某个脚手架（如 `immersive-starter`）的组件路径**（跨包引用，不新建 `packages/`）。放弃原因：`immersive-starter` 是"给用户的脚手架"定位，不应该反向被网站依赖——脚手架本身应该能独立复制走，如果网站依赖它，会导致"改脚手架却影响网站"或者"脚手架不能随意重命名/移动"的耦合，方向反了。用一个独立的 `packages/agent-ui` 作为源头，脚手架和网站都是"下游"，方向更干净。

### 治理机制补充（写入未来的 CONTRIBUTING 更新，本轮先记录不落地）

- `packages/agent-ui` 的组件文档仍然维护在 `references/component-selection/*.md`（不变），只是"实现代码"的物理位置从"两份拷贝"变成"一份源码 + 一个同步脚本产出的两份拷贝"。
- `npm run gate` 增加一步：跑完 `sync-agent-ui.mjs` 后 diff 两个脚手架的 `agent-ui/` 目录，若同步后仍有未提交的差异（说明有人手改了拷贝出去的版本而没改源头），CI 应该报错——这属于"发布态漂移检测"，具体实现留到落地阶段。

## 5. 待决策 / 需要你确认的点

| 决策点 | 建议默认值 | 备注 |
|---|---|---|
| 是否引入 npm workspaces | 引入，`packages/agent-ui` 作为组件源头 | 见第 4 节，为满足你提出的"同源或治理机制"要求 |
| 网站技术栈 | 与脚手架一致：Vite + React + TS + Tailwind v4 + shadcn（站点外壳用，非播放器内部） | 保持全仓库技术栈一致，降低认知负担；文档页面可选用 MDX 渲染 Markdown |
| 部署方式 | Cloudflare Pages，纯静态产物（`vite build` 输出） | 与你确认的"零后端"一致 |
| 编辑器数据持久化 | `localStorage` 自动保存 + 手动导入/导出 JSON 文件 | 已按你的第 2 点确认 |
| 站内是否嵌入"组件画廊" | 是，由 `_generated/catalog.json` 驱动，每个组件一个可交互 demo 页 | 复用已有元数据，无需额外维护 |
| `website/` 是否影响现有 `skills/agent-ux-react` 的发布/打包流程 | 不影响，`website/` 是独立 workspace，`skills/agent-ux-react` 仍可单独打包上传给智能体平台（不含 `website/`） | 需要在后续 `scripts/pack-skill.sh`（如果参照 pangea 建立）里显式排除 `website/` |

## 6. 明确不在本轮方案范围内

- 播放器主题/token 可编辑性（等视觉资产补齐后再评估）。
- 助手式 Copilot 的在线编辑器（架构上判定不适合参数化，不做）。
- 任何形式的持久化后端、账号体系、协作编辑。
- `scripts/pack-skill.sh` 之类的打包发布脚本的具体实现（提到但不在本方案内展开，属于治理骨架的后续工作）。

---

## 7. 修订：随 agent-layout 整合的变更（2026-08-27）

### 7.1 新增前置原则

[整合方案](./agent-layout-integration.md) 第 3 节新立了一条铁律，它约束本方案的所有后续设计：

> **agent 生成能力是主用途，website 在线编辑是次要用途。两者冲突时牺牲 website 的便利性，不牺牲生成能力。**
>
> 具体判据：如果某项能力"配置化之后会让 agent 少一种表达方式"，那就不配置化，让编辑器少一个可编辑项。

原因：website 只是 skill 的一种使用方式，而 skill 被 agent 调用生成智能体产品是主用途。本方案第 2 节"选项 A：通用播放器 + 配置对象"的架构依赖"把可变性收进配置项"，这个方向与"agent 需要尽可能大的表达空间"存在天然张力，必须由上述原则裁决。

### 7.2 抽取粒度定为粒度 3 + 分层导出

第 4 节推荐的 `packages/agent-ui` 单一源码方案已实现（2026-08-27），但当时的组件是 9 个薄组件。改用 agent-layout（3346 行、强耦合、`onOpenArtifact` 沿 6 层传递）后，粒度需要重新定，结论是**整个应用底座进包**：

| 粒度 | website 播放器需要重写 |
|---|---|
| 只抽叶子组件 | 壳层 + 对话流 + 产物系统 + Composer ≈ 2700 行 |
| 抽对话流 + 产物 + Composer | shell + sidebar + workspace + page ≈ 1000 行 |
| **整个应用底座（采纳）** | **0 行**，直接 `<AgentApp config scenes />` |

选粒度 3 的决定性理由：在线编辑器的全部价值是"改配置 → 实时预览**完整**界面"。粒度 1/2 都要求 website 自己重写壳层，那 website 与交付给用户的模板必然视觉漂移——这正是建同源机制要防的事。

分层导出避免助手式被迫依赖沉浸式壳层：

```
@agent-ux/agent-ui              → 叶子组件层（copilot-starter 用这层）
@agent-ux/agent-ui/immersive     → 沉浸式应用底座（immersive-starter + website 播放器用这层）
```

**关键澄清**：粒度 3 不会让 agent 面对黑盒。`sync-agent-ui.mjs` 是**物化拷贝**而非 npm 依赖，agent `cp -R templates/immersive-starter` 拿到的是完整源码，可任意修改（该工程已脱离仓库，不受同源约束）。粒度 3 只是把起点从骨架抬高到成品。

### 7.3 可编辑配置项修订

第 3 节的配置项表按 agent-layout 的实际结构重定，并受 7.1 原则约束——**只配置化"高频且已知"的变化**：

| 配置项 | 来源 | 编辑器可编辑 |
|---|---|---|
| 产品名称 | `conversation-data.ts` 的 `DEFAULT_AGENT_NAME` | 是 |
| 产品身份头像 | `resource-visuals.tsx` 的 `AgentAvatar` | 是（限 Lucide 图标 + 语义色） |
| 侧栏主菜单 | `sidebar.tsx` 的三项（智能体·技能·连接器 / 定时任务 / 文件库） | 是 |
| 新对话页专家推荐 | `new-conversation-page.tsx` | 是 |
| 新对话页指令推荐 | `new-conversation-page.tsx` | 是 |
| 对话剧本 | 场景数据（JSON 路径，见 [剧本引擎方案 9.1](./mock-script-engine.md#91-从json-唯一格式改为引擎接受对象ts--json-双数据源)） | 是 |
| 面板内容库 | `panel-data.ts` | 是（检索结果 / 网页 / 文件正文） |
| **主题 token** | `src/index.css` | **否**，后置。视觉 token 全量补齐后再评估 |
| **新增产物容器类型** | `PanelView` + `panelContainers` 注册 | **否**，属于扩展点，只能改代码 |
| **新增动作 Badge 类型** | `ExecutionActionData` + `actionIcons` | **否**，同上 |
| **对话流自定义块** | 待设计的插槽 / 注册表 | **否**，同上 |

后四项刻意不配置化——它们是 agent 生成差异化产品的主要手段，配置化会把可能性限制在预设枚举内。编辑器少这四项功能是可接受的代价。

### 7.4 实现顺序后移

原计划 website 是三步走的第三步。整合 agent-layout 后调整为 **Phase 7（最后）**，让位给：

- **Phase 3 组件文档体系 + 扩展点地图** —— 直接决定 skill 的生成质量，而 website 只是使用方式之一
- **Phase 4 补三个 V1.4 缺口组件** —— 关系到设计规范覆盖完整性

完整 7 阶段顺序见 [整合方案第 9 节](./agent-layout-integration.md#9-改造顺序)。

### 7.5 组件画廊的数据源变化

第 5 节提到"组件画廊由 `_generated/catalog.json` 驱动"。整合后 `catalog.json` 的来源从 9 份 `component-selection/*.md` 变为新的组件文档体系（约 30 份，按四层信息模型分组），`meta` 新增 `layer` / `exported` / `designRules` 三个字段。画廊因此可以：

- 按信息层（委托 / 对话 / 过程 / 产物 / 壳层 / 基础设施）分组展示
- 标注哪些是公共导出、哪些是内部实现
- 从组件反查它依据的设计原则

详见 [整合方案 5.2 / 5.3](./agent-layout-integration.md#52-分组方式按-designmd-的四层信息模型)。
