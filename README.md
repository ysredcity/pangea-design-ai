# agent-ux-guide

**智能体产品交互设计的 React skill** —— 给 AI agent 消费的知识库，让 agent 产出「交互符合智能体产品设计规范 + 视觉符合 shadcn 主题」的前端代码。

事实源 = [《智能体产品交互设计指南 V1.4》](docs/智能体产品交互设计指南V1.4.md)（海信集团）。技术栈 = **React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui（Base UI）+ lucide-react**。

> **当前稳定基线：v0.3.0（2026-09-06）**。该版本按设计稿完成 Copilot 侧边栏/浮窗/收起三态、五操作 Header，并让 Agent 与 Copilot 直接复用同一个 rich `ConversationSection`。

## 核心目的与受众

产出物是一个**可运行的 React 智能体应用**：

- **产品经理（PM）**：使用 mock 数据快速产出高保真 demo，用于评审、对齐和演示。
- **开发工程师**：基于真实需求继续接入业务数据和接口。

## 界面形态与脚手架

| 形态 | 说明 | 支持方式 |
|---|---|---|
| **沉浸式 Agent** | 对话流为主工作区，左菜单 + 中对话流 + 右产物面板 | `templates/immersive-starter/` |
| **助手式 Copilot** | AI 辅助主工作区，资源区 + 主工作区 + 对话辅助区 | `templates/copilot-starter/` |
| **嵌入式 Embedded** | 深度嵌入宿主界面的工具栏、卡片或菜单 | 按场景设计，不固化模板 |

## 目录结构

```text
agent-ux-guide/
├── packages/agent-ui/                    # 共享运行时唯一源码
├── scripts/sync-agent-ui.mjs             # 向两套模板物化源码
├── skills/pangea-design-ai/
│   ├── SKILL.md                           # skill 入口
│   ├── references/                        # 规则、组件、扩展点和 token
│   ├── scripts/                           # 确定性校验脚本
│   └── templates/
│       ├── immersive-starter/
│       └── copilot-starter/
├── releases/                             # 历史分发归档
├── CHANGELOG.md
├── CONTRIBUTING.md
└── PROJECT_CONTEXT.md                    # 跨会话单一事实源
```

## 快速开始

### 作为 skill 使用

把 `skills/pangea-design-ai/SKILL.md` 作为入口交给支持 skill 的 agent；agent 应按任务路由按需读取 `references/`，不要无差别加载全部文档。

### 创建独立工程

```bash
cp -R skills/pangea-design-ai/templates/immersive-starter my-agent-app
# 或
cp -R skills/pangea-design-ai/templates/copilot-starter my-agent-app
cd my-agent-app
npm install
npm run dev
```

### 维护仓库

```bash
npm install
npm run sync:agent-ui
npm run gate
git diff --check
```

`packages/agent-ui` 是共享运行时事实源；两套模板是可独立复制的物化消费者。

## 相关文档

- [设计依据](docs/智能体产品交互设计指南V1.4.md)
- [贡献与维护规则](CONTRIBUTING.md)
- [变更记录](CHANGELOG.md)
- [全局设计规则](skills/pangea-design-ai/references/design.md)
- [设计 token](skills/pangea-design-ai/references/theme/design-tokens.md)
