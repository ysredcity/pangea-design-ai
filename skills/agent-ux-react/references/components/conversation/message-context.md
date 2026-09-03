---
name: agent-ux-message-context
description: "沉浸式发送上下文拆分契约：实体附件、内联语义、专家与连接器的归属。"
user-invocable: false
meta:
  id: message-context
  kind: contract
  layer: conversation
  title: 消息上下文 Message Context
  exported: true
  source: skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/message-context.ts
  whenToUse: [将 immersive Composer 的发送值拆为用户消息内容附件与专家]
  whenNotToUse: [把全部 ContextItem 原样塞进消息数据, 将连接器显示为用户正文]
  composeWith: [Composer ContextItem, ConversationTurnData, inline-tag, UserMessage]
  composeBoundary: [upload 是附件, 文件库最近对话技能已在内容中, 专家只进入 agent 侧, connector 不进消息流]
  pitfalls: [空消息却无上下文时生成无意义已添加, 将第一个专家之外的语义虚构为支持]
  designRules: [design.md#31-意图输入, design.md#31-对话流的基本顺序, design.md#323-有产物的动作才做成可点击资源]
---

# 消息上下文 Message Context

## 选型
这是发送后的归属拆分契约，确保一项上下文只在正确的信息层出现。

## 事实源与 API
`splitSentContext(message, context)` 公共导出返回 `{ content, attachments, expert? }`。它接收 immersive `ContextItem[]`；upload 项转为 `{ id, name, size, target }` 附件，首个 type 为“专家”的 label 成为 `expert`。当 message 为空且没有附件时，content 回退为“已添加 …”。

## 结构、状态与无障碍
文件库、最近的对话和技能已由 Composer 写入 `[[类型:名称]]`，函数不重复生成；upload 作为 UserMessage 上方可预览附件。连接器被刻意排除：它是本次请求的即时调用，其可理解说明属于执行 Badge。

## 组合边界
专家显示在智能体身份侧，不进入用户气泡；Composer 同时只允许一个专家，函数以 `find` 取首项。此契约依赖 rich Composer，不能套到 shared Composer 的单字符串 API。

## 扩展方式
新增 context 类型时先决定其是实体附件、正文语义、智能体身份还是执行行为，再改对应 registry/序列化/数据层；不要先把它塞进所有消息字段。

## 常见坑
- 将 connector 或专家作为用户消息附件。
- 期待函数为纯空 message/空 context 创建回退文本；当前结果会是“已添加 ”。
- 忘记给 upload 的 size 缺省为 0。
