---
name: agent-ux-project-structure
description: "消费者视角的独立工程结构与扩展入口，Base UI 共享对话域与两套形态壳层的职责边界，以及仅维护者需要的物化分发管线。"
user-invocable: false
---

# 工程结构与生成层级

固定技术栈是 **Vite 8 + React 19 + TypeScript + Tailwind CSS v4 + shadcn v4（Base UI）+ lucide-react**。两套模板可独立复制和安装，运行时不在形态之间切换。

## 你在哪里工作（先读这节）

**产出物是一个独立的智能体应用工程，落在用户的工作目录里，不是本仓库的一部分。**

1. 按已确认的界面形态，把对应模板整目录复制到**用户工作目录**：`templates/immersive-starter/` 或 `templates/copilot-starter/`。
2. 在复制出来的工程里 `npm install`，之后所有改动都发生在**那个工程内部**。
3. 校验只跑该工程自己的 `npm run gate`（模板不使用 `workspace:*`，因此在仓库外可独立安装与构建）。

| 禁止 | 原因 |
|---|---|
| 在本 skill 仓库里改代码当成交付 | skill 仓库是规则与模板的事实源，不是用户的产品工程 |
| 让产物依赖 `@agent-ux/agent-ui` 或任何 workspace 协议 | 模板已把共享运行时**物化为自己的源码**，复制出去即自包含 |
| 跑仓库根级命令（根 `gate`、`sync:agent-ui`）当作交付校验 | 那些是维护者管线，见本文最后一节 |

### 独立工程内的目录职责

以沉浸式模板为例（Copilot 模板同构，差异在壳层与左画布）：

| 路径 | 职责 |
|---|---|
| `src/agent-ui/conversation/` | 物化的共享对话域：消息、执行过程、Composer、三张交互卡、中立 `ArtifactRouter` / `ProductBlockAction` |
| `src/agent-ui/immersive/`（或 `copilot/`） | 物化的形态运行时入口与显式 contracts |
| `src/components/agent-layout/` | 沉浸式壳层与产品装配：侧栏、对话区、右侧 Tab / 图片查看器、本地 panel adapter |
| `src/components/ui/` | 物化的 Base UI 基础件 |
| `src/agent-ui/script-engine/` | 剧本引擎；场景数据由产品层提供 |
| `scripts/agent-ux/` | 物化的零依赖质量脚本（Token 机检、剧本机检） |

**共享对话域绝不 import `PanelView`、`ArtifactPanel` 或 Copilot canvas**；`AgentResponseBlock`、`ConversationTurn`、`AssistantContinuation` 是实现内部边界，不作为产品扩展点。

## 产品扩展

改动前先查 [extension-map.md](extension-map.md)（改哪个文件、不要碰哪个文件）。

- **沉浸式**：场景改 `agent-layout/scenes.ts` 与 `conversation-data.ts`，面板内容改 `panel-data.ts`，产品身份/导航/欢迎页专家与推荐改 `app-config.ts`。同产物重复打开只切换 Tab，切换会话立即清面板。
- **Copilot**：产品页（示例为 `src/pages/ContractReview.tsx`）提供 `workspace` 与 `routeArtifact(target)`；交付物点击与产品块 action 经 `onProductBlockAction` 转为 artifact，**都只能更新左侧工作区，不出现右侧产物面板**。
- `AppConfig` 只承载身份、导航与欢迎页专家/推荐；**场景、主题、面板容器与产品块继续以 TypeScript 扩展，不把业务能力吞入 `AppConfig`**。
- 产品块的固定插槽在 assistant 正文/附件之后、续流程之前；renderer 接收 `ProductBlockContext.onAction`，未知类型由产品 renderer 记录开发期警告并安全跳过。沉浸式 local renderer 消费本地 `data`/rich context，Copilot/shared renderer 消费 `payload`/shared context；**同名 renderer API 不可互换**。

## 交付校验（在产出工程内执行）

```bash
npm install
npm run gate
```

沉浸式 gate = lint + 剧本机检 + `tsc -b` + `vite build`；Copilot gate 额外含 Token 机检。逐条核销见 [quality-gates.md](quality-gates.md)。

---

## 仅维护者：物化分发管线

> 消费 skill 生成产品界面时**不需要这一节**。它只描述本 skill 仓库如何把共享源码同步进两套模板。

单一源码在 `packages/agent-ui/src/`，`node scripts/sync-agent-ui.mjs` 把 `conversation/` 及对应的 `immersive/` 或 `copilot/` 写入模板的 `src/agent-ui/`，并物化质量脚本到 `scripts/agent-ux/`；`--check` 检测两个模板漂移。因此**模板内被同步覆盖的文件不应手改**，要改先改 `packages/agent-ui`。

```bash
npm run sync:agent-ui
npm run gate
```

两套 active manifest 均使用 Base UI；旧 Radix 源码仅作为未进入 TypeScript/Vite 入口的历史隔离文件，不能恢复为同步输入。
