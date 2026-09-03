---
name: agent-ux-agent-identity
description: "沉浸式智能体身份开场：产品身份与指定专家的稳定视觉解析。"
user-invocable: false
meta:
  id: agent-identity
  kind: component
  layer: conversation
  title: 智能体身份 AgentIdentity
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx
  whenToUse: [每轮智能体响应开场, 指定专家或回退到产品身份]
  whenNotToUse: [显示用户身份, 以展示文本作为专家视觉映射的唯一来源]
  composeWith: [ProductIdentity, WelcomeExpert, AgentAvatar]
  composeBoundary: [专家优先按 id 或 label 解析, 找不到时回退 raw expert 再回退 identity.name]
  pitfalls: [在消息 JSX 复制专家头像映射, 把连接器显示为智能体身份]
  designRules: [design.md#31-对话流的基本顺序, design.md#12-能力识别与低成本表达]
---

# 智能体身份 AgentIdentity

## 选型
在每轮智能体侧使用，显式说明当前由产品身份还是指定专家响应。

## 事实源与 API
`AgentIdentity({ identity, experts, expert? })` 是 `conversation-flow.tsx` 的公共导出。它接收 `ProductIdentity` 和 `WelcomeExpert[]`，从 `expert` 同时匹配专家 `id` 或 `label`；显示顺序为匹配到的专家 label、原始 expert 字符串、`identity.name`。

## 结构、状态与无障碍
组件渲染 `AgentAvatar` 与截断名称。专家视觉来自匹配对象的 `visualKey`；未匹配时 `AgentAvatar` 以产品 avatar 回退。身份位于执行过程前，宿主将身份和过程保持 8px 间距。

## 组合边界
专家属于智能体侧，不能进入用户消息。连接器不是身份；它只应作为执行动作体现。不要把这个小组件当作全局导航头像或独立的专家选择器。

## 扩展方式
新增专家先扩展 `AppConfig` 与 `resource-visuals.tsx`；保持稳定 `id`、展示 `label` 和视觉 `visualKey` 三者分离。

## 常见坑
- 只按 label 找专家，导致 ID 传入时无法使用正确头像。
- 直接写 Lucide/头像分支，造成 Composer、首屏和消息中的视觉不一致。
