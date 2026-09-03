---
name: agent-ux-follow-up-suggestions
description: "共享 Base UI 后续建议的公共 API、2–4 条约束与中立选择 action 边界。"
user-invocable: false
meta:
  id: follow-up-suggestions
  kind: component
  layer: conversation
  title: 后续建议 FollowUpSuggestions
  exported: true
  source: packages/agent-ui/src/conversation/follow-up-suggestions.tsx
  whenToUse: [已完成回答末尾且仍有上下文相关的下一步可供选择]
  whenNotToUse: [等待澄清或用户回复, 执行中, 高风险确认待决, 错误恢复待处理, 新对话首屏推荐]
  composeWith: [共享 ConversationFlow, ProductBlockContext.onAction, RecommendationList, 产品 renderer]
  composeBoundary: [卡片只派发建议内容选择, 产品/形态层决定是否创建下一轮, 不含 panel/canvas 或真实执行状态]
  pitfalls: [建议数量不在2到4条, 在禁用场景抢占主任务, 将选择写成已经发送或已执行]
  designRules: [design.md#37-后续引导, design.md#31-对话流的基本顺序, design.md#44-状态与反馈]
---

# 后续建议 FollowUpSuggestions

## 选型

只在一个已完成的回答之后，为当前任务提供 2–4 条具体、上下文相关的下一步。等待澄清或用户回复、执行进行中、高风险确认待决、错误恢复待处理时不展示；它也不是 `NewConversationPage` 的首屏推荐。

## 事实源与 API

事实源是 [`packages/agent-ui/src/conversation/follow-up-suggestions.tsx`](../../../../../packages/agent-ui/src/conversation/follow-up-suggestions.tsx)，由 `@agent-ux/agent-ui/conversation`（及包根共享入口）公开导出。

```ts
type FollowUpSuggestionsProps = FollowUpSuggestionsPayload & {
  blockId: string
  onAction: ProductBlockActionHandler
  actionStatus?: ProductBlockActionStatus
  className?: string
}

type FollowUpSuggestionsPayload = {
  suggestions: Array<{ id: string; label: string; content: string }>
}
```

卡片只接受 2–4 条建议；数量不符合时开发环境告警并返回 `null`。每次选择经 `onAction` 派发 `{ type: 'follow-up-select', blockId, actionId, suggestionId, content }`。shared Flow 将 handler 注入 `ProductBlockContext.onAction`；可选 `actionStatus` 仅在最近选择匹配时播报消费者消息，未表示新用户轮次或后端任务已经创建。

## 结构、状态与无障碍

- 建议以与选中专家后的推荐列表一致的纵向行呈现：展示完整 `content`，右侧以 `ArrowDownLeft` 指向下方 Composer；`label` 保留给产品数据标识或简短名称，仍应保留用户自由输入。
- 每项复用 `RecommendationList` 的 36px 单行 Base UI button，带可见键盘焦点；右侧 `ArrowDownLeft` 仅说明下方 Composer 是继续输入位置，不表示已经发送或执行。
- 可选结果使用单一 `role="status" aria-live="polite"`，且只播报消费者提供的本地状态。卡片自身不会创建用户回合、发起真实请求或宣称任务已执行；当前沉浸式消费方会将选择的 `content` 回填到 Composer，等待用户自行发送。
- “仅在完成轮次显示”是 scene 生产者/产品 renderer 的展示策略。shared context 提供 `isLatestTurn`，但卡片自身不读取它；调用方须在上述禁用场景不渲染该 block。

## 组合边界

沉浸式 local adapter 校验本地 `data`；确认/恢复动作仍由 rich Flow 记录本地结果，follow-up 选择不新增结果提示。`ConversationPage` 将选择内容回填 Composer，并在用户发送消息后停止渲染该场景历史回复中的 follow-up。Copilot/shared renderer 使用 `payload` 和 `ProductBlockContext.onAction`，由产品页决定是否路由交付物。local rich renderer 与 shared renderer 同名但上下文和数据结构不同，不可互换；shared 卡片不含 Panel、Tab、ImageViewer 或 Canvas 概念。

## 扩展方式

在产品 `renderProductBlock` 中验证 suggestions payload，并在 `onAction` 消费 `content`。若产品需要把选择变成新的对话回合、任务或左画布内容，应在其 scene/state owner 中实现并据实回写；不要在卡片内直接调用 Composer、panel router 或后端接口。

## 常见坑

- 在等待回复、执行中、待确认或待恢复时渲染建议。
- 数量少于 2 或多于 4，或用泛化欢迎语代替具体建议。
- 将点击提示写成“已发送下一轮请求”或“已执行”，但实际没有创建该行为。 