---
name: agent-ux-extension-map
description: "共享 conversation、沉浸式 rich implementation 与 Copilot shell 的精确扩展点地图。"
user-invocable: false
---

# 扩展点地图

先完成 SKILL 的配置/扩展判定。三层的边界是：共享域提供跨形态的轻量对话语义；沉浸式模板实现完整工作台体验；Copilot 壳层只把中立产物路由到左侧工作区。相同的组件名称不表示 props 或数据契约相容。

| 需求 | 改这里 | 不要碰 |
|---|---|---|
| 轻量消息、浅层执行、基础 Composer、中立 `ArtifactRouter`、产品块 renderer | `packages/agent-ui/src/conversation/` | `PanelView`、`PanelTab`、`ImageView`、Copilot canvas、富澄清与 L1/L2/L3 |
| 共享产物语义 | `packages/agent-ui/src/conversation/types.ts` 的 `ArtifactTarget` | 任一形态专属 Panel、图片蒙层或 Canvas 字段 |
| 共享产品专属对话块 | 产品 `renderProductBlock` registry；校验 payload 后用 `ProductBlockContext.onAction` 回写，renderer 缺失或返回空时安全跳过 | 将未知块降级为 Markdown；导入沉浸式私有回复组件；把 local `data` renderer 当作 shared `payload` renderer |
| 富 Composer、内联标签、实体附件、连接器、专家或录音 | `templates/immersive-starter/src/components/agent-layout/composer.tsx` 与其 registry | 共享 `conversation/composer.tsx` 的 props |
| 沉浸式身份开场、L1/L2/L3、澄清、富附件、消息操作与产品块结果 | `templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx`；卡片适配在 `product-block-renderer.tsx`，由 rich Flow 本地拥有 action 结果 | shared `ConversationFlow` 的轻量 scene 与 props；把结果状态放回卡片 |
| 待批准阻断（等待提示、输入禁用、会话标签、批准/拒绝收尾） | 场景轮的 `awaitingApproval` 与 `approvalOutcomes`（`conversation-data.ts`）+ `Conversation.approvalStatus`；状态由 `agent-shell.tsx` 更新，`conversation-page.tsx` 分发给 rich Flow 与 Composer `disabled` | 把审批状态放进 shared `ConfirmCard`；用卡片文案、按钮名或块 ID 推断待决；复用 Composer 的 `recording` 表达业务禁用 |
| 已有沉浸式面板的内容 | `templates/immersive-starter/src/components/agent-layout/panel-data.ts` | panel 类型、container 或 registry；除非真的新增容器类型 |
| 新沉浸式面板容器类型 | `panel-types.ts`、`panel-containers.tsx`、`panel-registry.ts` | 仅改 `panel-data.ts` 后假定 renderer 自动存在 |
| 沉浸式产物展示 | `templates/immersive-starter/src/components/agent-layout/{agent-shell,panel-*,image-viewer}.tsx` | 共享对话域中的容器分支 |
| Copilot 产物展示与产品块 action 回写 | `skills/pangea-design-ai/templates/copilot-starter/src/pages/ContractReview.tsx` 的 `artifact` state、`routeArtifact={setArtifact}` 与 `onProductBlockAction`；传给 `packages/agent-ui/src/copilot/copilot-app.tsx` 的 `workspace` | 沉浸式 `ArtifactPanel`、右侧产物 Tab；把 action 结果写入 shared panel/canvas |
| Copilot 辅助区模式 | `packages/agent-ui/src/copilot/copilot-app.tsx` 的 `CopilotApp` 与 `CopilotConfig.assistantMode` | 业务页面中复制三栏壳层或在 Copilot 中引入沉浸式 panel |
| 产品身份、导航、欢迎专家/推荐 | `skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/app-config.ts` 的 `AppConfig` | 用 AppConfig 代替业务场景、面板容器或产品块扩展 |

## 必守边界

- **shared conversation**：共享 `Composer` 只有文本 `onSend(value)`；共享 Flow 只有中立 scene、浅层执行、`openArtifact` 与产品块 renderer。不要假定它支持内联标签、附件、连接器、澄清表单或 rich L1/L2/L3。
- **immersive rich implementation**：同名 Composer 和 ConversationFlow 采用独立的 rich data、回调与展示 adapter；不能用 shared props 直接替换。新增对象视觉统一经 `icon-registry.ts` 或 `resource-visuals.tsx`。
- **Copilot shell**：消费中立 `ArtifactTarget`；产品页接收 `ProductBlockContext.onAction` 后，经 `routeArtifact(target)` 只更新左侧工作画布；不引入沉浸式右侧产物面板。

产物是否可点击只由是否存在用户可查看的 `ArtifactTarget` 决定。沉浸式将其适配为 Tab/图片蒙层；Copilot 映射到左侧画布。三者共享语义，不共享容器。
