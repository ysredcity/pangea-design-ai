---
name: agent-ux-message-actions
description: "沉浸式统一消息动作：复制与互斥的点赞/点踩反馈。"
user-invocable: false
meta:
  id: message-actions
  kind: component
  layer: conversation
  title: 消息操作 Message Actions
  exported: true
  source: skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/message-actions.tsx
  whenToUse: [给消息复用复制与反馈操作]
  whenNotToUse: [为用户与智能体消息复制另一套动作, 将无意义的内部过程加入动作栏]
  composeWith: [IconButton, Tooltip, Dialog, UserMessage, AssistantMessage]
  composeBoundary: [CopyAction 只接 content, FeedbackActions 的回调是 reasons 与 note, 动作栏空间由消息宿主预留]
  pitfalls: [未处理 clipboard 异常仍声称已复制, 把 raw textarea 误推广为澄清表单模式]
  designRules: [design.md#36-消息操作, design.md#54-无障碍]
---

# 消息操作 Message Actions

## 选型
所有消息复制、点赞与点踩反馈都复用这里的组件，保证 tooltip、图标按钮和状态语义一致。

## 事实源与 API
公开 `CopyAction({ content })` 与 `FeedbackActions({ onFeedback? })`。复制调用 `navigator.clipboard.writeText(content)`，成功视觉态维持 3 秒并在卸载时清理 timer。反馈回调为 `{ reasons: string[]; note: string }`；点赞和已提交点踩互斥，点踩在选择原因或输入备注后提交才变为填充态。

## 结构、状态与无障碍
所有动作经文件内 tooltip 包裹的 `IconButton`，有可访问名称。点踩使用 Dialog，多选原因由 `aria-pressed` 表达；提交按钮在没有原因且没有备注时禁用。宿主必须保留操作栏空间，仅控制透明度，不能条件卸载。

## 组合边界
`CopyAction` 在用户和智能体消息均可用；反馈目前由 `AssistantMessage` 使用。操作不是交付物入口，也不能替代 artifact target。对话框内原生 `textarea` 是当前反馈实现事实，不应被描述为澄清表单的字段标准。

## 扩展方式
新增通用消息动作加入本文件的 Tooltip/IconButton 路径，并审查键盘/焦点与状态文案；不要在消息 JSX 各写一套。

## 常见坑
- 无论 Clipboard 写入是否成功都显示“已复制”；当前源码没有 rejection 处理，接入时不可承诺失败反馈。
- 点踩打开即标记选中；实际必须提交。
- 通过条件渲染让 hover 动作栏挤动消息流。
