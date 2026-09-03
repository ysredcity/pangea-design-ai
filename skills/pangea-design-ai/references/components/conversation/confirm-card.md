---
name: agent-ux-confirm-card
description: "共享 Base UI 确认卡的公共 API、高风险字段约束与中立 action 回写边界。"
user-invocable: false
meta:
  id: confirm-card
  kind: component
  layer: conversation
  title: 确认卡 ConfirmCard
  exported: true
  source: packages/agent-ui/src/conversation/confirm-card.tsx
  whenToUse: [需要用户对中风险或高风险动作作出明确 confirm/cancel/skip 决定]
  whenNotToUse: [只展示信息或可直接执行的低风险操作, 用自然语言替代高风险五字段确认, 挂在仅给建议或结论的回复上]
  composeWith: [共享 ConversationFlow, ProductBlockContext.onAction, 产品 renderer]
  composeBoundary: [卡片只派发中立 ProductBlockAction, rich flow 或产品页拥有结果状态与后续展示, 不包含 panel/canvas 或后端结果]
  pitfalls: [高风险确认缺少五字段仍尝试确认, 超过字段/按钮限制, 将 action 派发误写成后端成功, 在建议轮弹确认卡, 待确认期间仍允许发送新指令]
  designRules: [design.md#34-操作确认, design.md#341-确认卡应出现在即将执行的那一轮不在建议轮, design.md#342-待确认期间阻断新指令, design.md#51-风险分级与人工接管, design.md#41-五种状态语言]
---

# 确认卡 ConfirmCard

## 选型

在消息流内要求用户对中风险或高风险动作作出明确决定时使用。高风险动作不能以一句“确认吗？”替代；仅展示信息、低风险直接操作或尚未具备可解释动作时不用本卡。

卡片属于**即将执行的那一轮**：只给建议或结论时不出卡；用户表达同意后，才在真正写入、修改、发送或删除前请求授权，并指明具体作用对象。待决期间的输入禁用、等待提示与会话标记按 [design.md#342](../../design.md#342-待确认期间阻断新指令) 由产品壳层实现，不进入本卡。

## 事实源与 API

事实源是 [`packages/agent-ui/src/conversation/confirm-card.tsx`](../../../../../packages/agent-ui/src/conversation/confirm-card.tsx)，由 `@agent-ux/agent-ui/conversation`（及包根共享入口）公开导出。

```ts
type ConfirmCardProps = ConfirmBlockPayload & {
  blockId: string
  onAction: ProductBlockActionHandler
  actionStatus?: ProductBlockActionStatus
  className?: string
}

type ConfirmBlockPayload = {
  riskLevel: 'medium' | 'high'
  question: string
  description?: ReactNode
  fields: ConfirmField[]
  actions: ConfirmAction[]
}
```

`ConfirmField` 有 `key`、`label`、`value`；`ConfirmAction` 有 `id`、`label`、`decision: 'confirm' | 'cancel' | 'skip'` 与 `tone: 'primary' | 'secondary' | 'destructive'`。点击只经 `onAction` 派发 `{ type: 'confirm-decision', blockId, actionId, decision }`。在 shared `ConversationFlow` 中，该 handler 来自 `onProductBlockAction` 并通过 `ProductBlockContext.onAction` 交给产品 renderer；未提供 handler 时 Flow 使用 no-op，卡片自身不拥有持久化、写入或操作成功语义。

`actionStatus` 是可选、由消费者持有的 `{ actionId, message }`。卡片只在其最近点击的 action ID 匹配时播报该文字；当前 shared 卡片 API 不证明动作已经完成。

## 结构、状态与无障碍

- 标题为 15px / 20px。`description` 是可选 `ReactNode` 插槽：默认显示风险说明，也可由调用方传入文本、链接、状态提示或其它受控组件；卡片不解释其中业务语义。
- `riskLevel: 'high'` 必须有 `object`、`action`、`impact-scope`、`consequence`、`operator` 五个字段。缺失时仅禁用 `decision: 'confirm'` 的路径，并提示需补齐的信息；取消或跳过仍按产品提供的动作处理。
- 最多渲染 10 个字段和 3 个动作；开发环境会对超限字段、超限动作和多个 `primary` 动作告警。展示时只保留第一个 `primary` 为主操作。
- 动作复用 shared shadcn `Button`：桌面使用 `size="default"`；≤659px 时以 `lg` 等效的 36px 高度呈现并均分父级宽度，两项操作各占一半。
- 匹配的 `actionStatus` 用单一 `role="status" aria-live="polite"` 告知结果。这个区域只播报消费者给定的本地结果，不宣称未实现的后端成功、审计、权限申请或重试结果。

## 组合边界

共享卡片只消费明确的 payload，并发出中立 `ProductBlockAction`。沉浸式由本地 `product-block-renderer.tsx` 校验其 `data` 后调用卡片，并由 rich `ConversationFlow` 将本地演示结果放在产品块之后；Copilot 由产品页的 renderer 使用 shared `payload`，再通过 `routeArtifact` 更新左侧画布。两种 renderer 的 block 形状与 context 不同，不能按同名 API 互换；卡片中不应出现 `PanelView`、Tab、ImageViewer 或 Canvas 字段。

## 扩展方式

新增确认选项时扩展 `ConfirmAction` 的业务数据，并在产品 `renderProductBlock` 验证 payload 后转交 `ProductBlockContext.onAction`。需要把结果显示为附件、面板或左画布时，由形态层/产品页消费 action 后决定；不要在卡片中加入 router、panel 分支或网络调用。

## 常见坑

- 缺少高风险五字段却仍让确认路径可点。
- 以 action 已派发为由文案声称“已写入”或“操作成功”。
- 把沉浸式本地 `data` renderer 当作 shared `payload` renderer 的可替换 API。 