# 沉浸式 Agent 工作台模板

这是 `agent-ux-react` skill 的沉浸式 Agent 脚手架：左侧导航、以对话为核心的工作区，以及可并排查看交付物的右侧面板。工程采用 **Vite 8 + React 19 + TypeScript + Tailwind CSS v4 + shadcn v4（底层 Base UI）**。

## 使用方式

### 在本仓库内开发

在仓库根目录安装依赖后，通过 workspace 运行：

```bash
npm install
npm run dev --workspace=immersive-starter
```

构建与质量门禁：

```bash
npm run gate --workspace=immersive-starter
```

### 作为独立脚手架使用

复制模板后不依赖 monorepo 或其他 workspace，并可运行完整质量门禁：

```bash
npm install
npm run gate
npm run dev
```

## 修改入口

- `src/App.tsx`：应用入口，只装配完整的 `AgentShell`。
- `src/components/agent-layout/agent-shell.tsx`：应用状态、侧栏、抽屉、独立面板和交付物分流。
- `src/components/agent-layout/conversation-data.ts`：示例对话与场景数据。
- `src/components/agent-layout/panel-data.ts`：右侧面板的示例内容。
- `src/components/agent-layout/panel-registry.ts`：新增面板类型的注册入口。
- `src/components/agent-layout/icon-registry.ts` / `resource-visuals.tsx`：统一图标与资源视觉映射。
- `src/components/ui/`：本模板内置的 shadcn v4 / Base UI 基础组件。

完整的生成规则、组件分层和扩展边界以 [skill 入口](../../SKILL.md) 及其 `references/` 文档为准。特别注意：Base UI 与 Radix API 不兼容；新增或替换基础组件前必须确认其底层实现。

## 模板边界

这是纯前端交互与视觉底座：不接后端、不做鉴权或持久化、不引入状态管理库。业务接入时应替换数据层，而不是将业务逻辑写进模板壳层。
