# 助手式 Copilot 工作台模板

这是 `agent-ux-react` skill 的助手式 Copilot 脚手架：左侧资源区、中间主工作画布与右侧 AI 对话辅助区。工程采用 **Vite 8 + React 19 + TypeScript + Tailwind CSS v4 + shadcn v4（底层 Base UI）**。

## 使用方式

### 在本仓库内开发

```bash
npm install
npm run dev --workspace=copilot-starter
npm run gate --workspace=copilot-starter
```

### 作为独立脚手架使用

复制此目录后不依赖 monorepo、根 `node_modules` 或 `packages/agent-ui`：

```bash
npm install
npm run gate
npm run dev
```

`src/agent-ui/` 与 `scripts/agent-ux/` 是从 skill 唯一源码物化的分发文件；在本仓库内维护时不要手改，先改 `packages/agent-ui/` 或 `skills/agent-ux-react/scripts/`，再执行根目录的 `npm run sync:agent-ui`。

## 修改入口

- `src/App.tsx`：应用入口，只装配产品页面。
- `src/pages/ContractReview.tsx`：产品配置、示例对话、左侧工作区和 `routeArtifact(target)`。
- `src/agent-ui/copilot/`：Base UI Copilot 壳层同步产物；不要在业务页面复制三栏状态。
- `src/agent-ui/conversation/`：共享对话域同步产物；不得耦合沉浸式面板或画布类型。
- `src/mock/scenarios.json`：示例剧本数据与门禁校验对象。

## 产物路由边界

Copilot 的交付物可从对话流点击，但只能由 `routeArtifact(target)` 更新左侧工作区/画布；**不得引入沉浸式右侧产物面板或 Tab**。

## 模板边界

这是纯前端交互与视觉底座：不接后端、不做鉴权或持久化、不引入状态管理库。业务接入时替换产品数据与画布内容，而不是将业务逻辑写进通用壳层。
