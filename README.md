# agent-ux-guide

**智能体产品交互设计的 React skill** —— 给 AI agent 消费的知识库，让 agent 产出「交互符合智能体产品设计规范 + 视觉符合 shadcn 主题」的前端代码。

事实源 = [《智能体产品交互设计指南 V1.4》](docs/智能体产品交互设计指南V1.4.md)（海信集团）。技术栈 = **React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui + lucide-react**。

> **当前稳定基线：v0.1.0（2026-09-03）**。该版本冻结了两套独立脚手架、共享运行时、剧本引擎、组件文档与质量门禁；后续遵循语义化版本管理。

## 核心目的与受众

产出物是一个**可运行的 React 工程**，服务两类使用者（差别只在数据来源）：

- **产品经理（PM）**：快速产出高保真 demo 原型（mock 数据），用于评审、对齐、演示。
- **开发工程师**：基于 PRD 直接产出符合交互规范的界面（真实接口）。

## 界面形态与脚手架

智能体产品的界面形态分三类（见 [design.md 二](skills/pangea-design-ai/references/design.md#二界面形态选型)），本 skill 按标准化程度分层覆盖：

| 形态 | 说明 | 模板化程度 |
|---|---|---|
| **沉浸式 Agent** | 对话流为主工作区，左菜单（非必需）+ 中对话流 + 右面板 | ✅ 固化脚手架 `templates/immersive-starter/` |
| **助手式 Copilot** | AI 辅助主工作区（画布/代码/表格），左资源区 + 中主工作区 + 右对话辅助区（或浮窗/抽屉） | ✅ 固化脚手架 `templates/copilot-starter/` |
| **嵌入式 Embedded** | 划词工具栏/悬浮卡/右键菜单，深度嵌入宿主界面 | ⚪ 不固化模板，按场景现场设计（仍受 token/组件约束） |

沉浸式与助手式的**对话流内标准化交互组件**（消息气泡、澄清卡片、确认卡片、制品卡片、工具调用过程展示等）抽成公共组件层，两套脚手架共享，嵌入式场景也可复用。

## 目录结构

```
agent-ux-guide/
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── PROJECT_CONTEXT.md
├── docs/
│   └── 智能体产品交互设计指南V1.4.md   # 原始设计依据（人读，不供 agent 直接消费）
├── skills/
│   └── pangea-design-ai/
        ├── SKILL.md                       # skill 入口：两阶段确认门 + 界面形态决策树 + 索引
        ├── references/
        │   ├── design.md                  # 全局设计规则（唯一事实源，源自设计指南 V1.4）
        │   ├── theme/design-tokens.md      # 视觉 token（shadcn + Tailwind v4 CSS 变量）
        │   ├── overview/                   # 工程结构 / 安装 / 质量门禁 / 元数据 schema
        │   ├── components/                 # 公共对话组件说明（消息气泡/卡片类/工具调用等）
        │   └── patterns/                    # 界面形态骨架说明（沉浸式/助手式）
        └── templates/
            ├── immersive-starter/          # 沉浸式 Agent 可运行脚手架
            └── copilot-starter/             # 助手式 Copilot 可运行脚手架
└── website/                                # 静态文档站、双模板演示、组件详情与沉浸式 JSON 剧本编辑器（独立 workspace）
```

## 快速开始

### 作为 skill 使用
把 `skills/pangea-design-ai/SKILL.md` 作为入口交给支持 skill 的 agent；agent 按需加载 `references/` 下的文档。

### 起一个可运行工程
```bash
cp -R skills/pangea-design-ai/templates/immersive-starter my-agent-app   # 沉浸式
# 或
cp -R skills/pangea-design-ai/templates/copilot-starter my-agent-app     # 助手式
cd my-agent-app && npm install && npm run dev
```

## Website / Showcase

仓库内的 `website/` 是面向设计系统浏览与剧本试验的独立静态 workspace；它不随 skill 脚手架复制给最终用户。

```bash
npm install
npm run gate:website
# Cloudflare Pages：Root directory = website，Build command = npm run build，Build output = dist
```

站点当前作为 **v0.1.0 的内部 showcase 基线**保留：文档导览、双模板演示与本地 JSON 剧本编辑能力均可用，但体验、信息架构与演示质量的优化已暂缓到独立后续迭代，不阻塞 skill 的使用或发布。

## 相关文档

- 设计依据：[docs/智能体产品交互设计指南V1.4.md](docs/智能体产品交互设计指南V1.4.md)
- 贡献与维护规则：[CONTRIBUTING.md](./CONTRIBUTING.md)
- 变更记录：[CHANGELOG.md](./CHANGELOG.md)
- 全局设计规则：[skills/pangea-design-ai/references/design.md](skills/pangea-design-ai/references/design.md)
- 设计 token：[skills/pangea-design-ai/references/theme/design-tokens.md](skills/pangea-design-ai/references/theme/design-tokens.md)

## Phase 8 runtime ownership

`@agent-ux/agent-ui/immersive` owns the complete `ImmersiveAgentApp` runtime, rich panel/image routes, Base UI closure, and canonical product `theme.css`/`typeset.css`. `immersive-starter` is a standalone materialized consumer through `scripts/sync-agent-ui.mjs`; its scenes, panel data, and product config remain template-owned. The website imports this package runtime directly and adapts neutral JSON targets locally, never importing template paths. See the Phase 8 implementation plan at `docs/plans/2026-09-03-phase-8-real-immersive-runtime.md`.
