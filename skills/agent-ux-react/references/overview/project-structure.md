---
name: agent-ux-project-structure
description: "工程结构与生成层级约定：两套独立脚手架（沉浸式 immersive-starter / 助手式 copilot-starter）的目录结构、依赖引用、组件层复用方式，以及 PM demo 与开发交付两类产物的差异。注意：本文档正在随 agent-layout 整合重写，技术栈与组件清单部分已过时。"
user-invocable: false
---

# 工程结构与生成层级

> ## ⚠️ 本文档部分内容已过时，正在重写（Phase 1–2）
>
> 本 skill 正在按 [agent-layout 整合方案](../../../../docs/proposals/agent-layout-integration.md) 重构，以下内容**已不准确**，不要照此执行：
>
> | 本文描述 | 实际方向 |
> |---|---|
> | 组件基础层用 Radix（`radix-ui` 包） | **Base UI**（`@base-ui/react`，shadcn v4）。两者 API 不兼容，见 [base-inventory.md](../components/base-inventory.md) |
> | Vite 6 / 9 个自研对话组件 | Vite 8 / 沉浸式为约 30 个组件的完整成品 |
> | 两套脚手架各自拷贝一份组件源码、需人工同步 | 单一源码包 + 同步脚本物化；沉浸式整个应用底座进包并做配置化改造 |
> | 依赖清单里的版本号 | 仅作示意；实际以脚手架 `package.json` 为准 |
>
> **当前仍然有效的部分**：核心目的与双受众、纯前端铁律、生成层级约定、PM Demo 自动化预览要求。
>
> 完整重写要等工程搬入（Phase 1）与配置化改造（Phase 2）完成后进行——现在写死目录与路径会立刻过期。需要具体组件用法时**直接读工程源码**，路径见 [components/README.md](../components/README.md) 的组件清单表。

本 skill 的产出物是一个**可运行的 React 工程**。技术栈固定为 **React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui + lucide-react**。

## 核心目的与双受众

| 受众 | 场景 | 数据 |
|---|---|---|
| **产品经理（PM）** | 快速产出高保真 demo 原型，用于评审、对齐、演示 | mock 数据 |
| **开发工程师** | 基于 PRD 直接产出符合交互规范的界面 | 真实接口 |

> **纯前端铁律**：产出始终是完整的前端工程（页面/组件/前端状态/mock 或调用既有接口），**不产出、不涉及任何后端代码或服务**。demo 用前端 mock；开发交付对接既有接口（`fetch` 等），不实现后端。

## 两套独立脚手架（不是同一脚手架里切换）

与 Pangea（单脚手架 + Layout 内切页面）不同，本 skill 提供**两个完全独立的起始工程**——因为一个产品通常在立项时就已经确定是沉浸式还是助手式，不会运行时互相切换：

| 脚手架 | 界面形态 | 适用 |
|---|---|---|
| `templates/immersive-starter/` | 沉浸式 Agent | 通用助手、客服、知识问答类产品 |
| `templates/copilot-starter/` | 助手式 Copilot | IDE/设计工具/BI/合同审阅等专业工具类产品 |

选型依据见 [design.md 2.1](../design.md#21-界面形态选型)。嵌入式 Embedded 不提供脚手架，产出为单个组件/hook，接入宿主应用现有工程。

## 公共对话组件层

沉浸式与助手式**共享同一套对话流交互组件**（见 [components/](../components/)）。这些组件：

- 不依赖任何布局外壳（沉浸式三栏 / 助手式三栏），只依赖 `<div>` 容器 + 设计 token。
- 在两套脚手架里**各自拷贝一份源码**（`src/components/agent-ui/`），不做跨脚手架的 npm 包依赖——保持每个脚手架可独立复制、独立运行、不依赖外部 workspace。
- 组件 API 与用法文档统一维护在 `references/components/`（按四层信息模型分组），实现必须与文档保持一致。
- 嵌入式场景可直接从任一脚手架复制 `src/components/agent-ui/` 中需要的单个组件使用。

## 依赖与引用约定

`package.json` 关键依赖（两套脚手架一致）：

```jsonc
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.460.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "@radix-ui/react-slot": "^1.1.0"
    // 其余 @radix-ui/* 依赖随 shadcn 组件按需通过 `npx shadcn add` 添加，不预先全量安装
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "typescript": "^5.6.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

> **Tailwind v4 用法**：不再需要 `tailwind.config.js` 里手写 `theme.extend.colors` 映射 —— 主题变量直接定义在 `src/styles/globals.css` 的 `@theme` / `:root` / `.dark` 中，`@tailwindcss/vite` 插件负责扫描与生成。`components.json`（shadcn CLI 配置）指向该 CSS 文件。

> **shadcn 组件按需添加**：不预置全部组件。需要新组件时用 `npx shadcn@latest add <component>`（如 `button`、`dialog`、`sheet`、`scroll-area`），CLI 会把源码拷贝进 `src/components/ui/`（shadcn 是"拷贝源码"而非 npm 包依赖模式）。

## 目录结构（两套脚手架一致，内容不同）

```
project/
├── index.html
├── package.json
├── vite.config.ts              # @tailwindcss/vite + @vitejs/plugin-react + 路径别名 @/
├── tsconfig.json
├── components.json             # shadcn CLI 配置（指向 src/styles/globals.css）
└── src/
    ├── main.tsx                 # createRoot 挂载
    ├── App.tsx                  # 组装布局外壳
    ├── styles/
    │   └── globals.css          # Tailwind v4 入口 + 主题 token（@theme / :root / .dark）
    ├── lib/
    │   └── utils.ts             # cn() 等工具（shadcn 标配）
    ├── components/
    │   ├── ui/                  # shadcn 生成的基础组件（button/dialog/sheet/...）
    │   ├── agent-ui/            # 公共对话组件层（消息气泡/澄清卡片/确认卡片/制品卡片/...）
    │   └── layout/              # 该形态专属的布局外壳组件
    ├── mock/                    # PM demo 用的 mock 数据与假异步
    └── pages/ 或 views/         # 具体业务页面/工作区内容（按产品需求生成）
```

沉浸式与助手式在 `src/components/layout/` 与 `src/pages/`（或对应工作区）的具体实现不同，详见各自的布局说明文档：[immersive-shell.md](../patterns/immersive-shell.md) / [copilot-shell.md](../patterns/copilot-shell.md)。

## 快速开始

```bash
cp -R skills/agent-ux-react/templates/immersive-starter my-agent-app   # 或 copilot-starter
cd my-agent-app
npm install
npm run dev
```

> **不需要私有 registry**：所有依赖（React、Vite、Tailwind v4、shadcn 相关 Radix 包、lucide-react）均在公共 npm registry。`npm install` 失败先查网络/代理/Node 版本（Node ≥ 18，推荐 ≥ 20 以匹配 Vite 6 / Tailwind v4），不要改 registry。

## PM Demo 模式：不打扰用户的自动化

**核心要求（用户已明确）**：用户不应关注工程编译、启动等事情，**每次改动都自动执行启动**。这与 Pangea 的做法有一处刻意差异：

- Pangea 因平台安全扫描曾把"会话开始自动装依赖+起服务"的 hook 判定为 P0 风险移除，改为"用户要求预览时才执行"。
- 本 skill **明确采用用户要求的"自动启动"模式**——agent 在完成首次生成后主动 `npm install` + `npm run dev`（后台），并在每轮改动后确认 dev server 仍在运行、必要时自动重启，不需要用户额外要求"运行一下"。
- 若未来接入类似 Kiro Hooks 的自动化能力且需要上传第三方平台分发，需重新评估是否要退回"手动触发"模式（参考 Pangea `CHANGELOG.md` 1.3.1 的教训）；**当前阶段不做该妥协**。

Agent 职责清单、话术约定见 [SKILL.md](../../SKILL.md#pm-demo-模式)。

## 生成层级约定

- **页面/工作区内容**放 `src/pages/<Name>.tsx`（沉浸式：对话场景/会话列表；助手式：工作区视图），不重写布局外壳组件。
- **布局外壳是稳定骨架**，新增内容只在其"内容插槽"内变化，不修改三栏结构本身（除非明确被要求）。
- **对话组件优先复用 `agent-ui/`**，不新建平行实现；确需扩展先看该组件是否有可配置的变体/插槽。

## 接入既有工程（最小清单）

开发工程师若不使用脚手架、要把本套对话组件接进已有 React + Vite 工程：

- [ ] 装依赖：`lucide-react`、`class-variance-authority`、`clsx`、`tailwind-merge`、`@radix-ui/react-slot`；devDep：`tailwindcss@^4`、`@tailwindcss/vite`。
- [ ] `vite.config.ts` 加 `tailwindcss()` 插件（`@tailwindcss/vite`）。
- [ ] 新建 `src/styles/globals.css`，接入本项目的 `@theme` / `:root` / `.dark` 变量定义（见 [design-tokens.md](../theme/design-tokens.md)）。
- [ ] 复制 `src/components/ui/`（按需，或用 `npx shadcn add` 重新生成）与 `src/components/agent-ui/`。
- [ ] 页面遵循生成层级：不修改布局外壳，内容放对应插槽。
