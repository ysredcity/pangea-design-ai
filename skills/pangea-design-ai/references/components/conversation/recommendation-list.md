---
name: agent-ux-recommendation-list
description: "首页专家推荐与完成回复后跟进建议共用的 36px 指令列表及箭头方向变体。"
user-invocable: false
meta:
  id: recommendation-list
  kind: component
  layer: conversation
  title: 推荐指令列表 RecommendationList
  exported: true
  source: packages/agent-ui/src/conversation/recommendation-list.tsx
  whenToUse: [需要在对话相关场景中展示一组可选的单行指令]
  whenNotToUse: [新对话首屏的多列推荐卡片, 需要多选或分组的复杂菜单]
  composeWith: [FollowUpSuggestions, NewConversationPage]
  composeBoundary: [仅负责 36px 行布局、单击事件和箭头方向，不决定建议内容、消息创建或业务执行]
  pitfalls: [为两个场景复制行样式, 使用错误的箭头方向, 把视觉高度改为44px]
  designRules: [design.md#37-后续引导, design.md#31-对话流的基本顺序]
---

# 推荐指令列表 RecommendationList

## 选型

用于复用首页“选中专家”后的推荐行与完成回复后的跟进建议行。两处统一使用 36px 高的单行布局，差别只有箭头所表达的目标方向。

## 事实源与 API

事实源是 [`packages/agent-ui/src/conversation/recommendation-list.tsx`](../../../../../packages/agent-ui/src/conversation/recommendation-list.tsx)，由 `@agent-ux/agent-ui/conversation` 公开导出。

```ts
type RecommendationListProps = {
  items: readonly { id: string; content: string }[]
  arrowDirection: 'up-left' | 'down-left'
  onSelect: (item: { id: string; content: string }) => void
  className?: string
}
```

首页专家推荐传 `up-left`，表示将选择带回上方 Composer；`FollowUpSuggestions` 传 `down-left`，表示下方 Composer 是继续输入位置。组件只回调所选条目，不创建消息或执行业务动作。

## 结构、状态与无障碍

- 每行是全宽、36px 的 Base UI button，内容单行截断，悬停和键盘焦点均使用语义 accent/ring。
- 图标只表达空间目标，不能单独承载“已发送”或“已执行”等业务状态。
- `FollowUpSuggestions` 负责 2–4 条数量约束与 polite 状态播报；列表本身不重复这些产品语义。

## 组合边界

不要将首屏三列推荐卡片接入本组件；其分页、专家标识与密度不同。不要在首页和对话页各自复制一份行样式；需要新的箭头方向时先扩展本组件的受限变体。
