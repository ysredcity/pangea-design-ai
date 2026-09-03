---
name: agent-ux-inline-tag
description: "沉浸式内联标签契约：Composer 与对话流共用的序列化、解析和样式。"
user-invocable: false
meta:
  id: inline-tag
  kind: contract
  layer: conversation
  title: 内联标签 Inline Tag
  exported: true
  source: skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/inline-tag.ts
  whenToUse: [在消息正文保留文件库最近对话技能的语义位置]
  whenNotToUse: [表示本地上传实体附件或连接器调用, 让各组件自行编写标签正则]
  composeWith: [Composer, MessageContent, icon-registry.ts]
  composeBoundary: [格式固定为 [[类型:名称]], 解析类型仅断言为 ContextType 不做运行时校验]
  pitfalls: [将未知类型视为安全, 将内联标签与完整 Markdown 混排]
  designRules: [design.md#31-意图输入, design.md#35-结果呈现与产物容器]
---

# 内联标签 Inline Tag

## 选型
这是纯契约，不是渲染组件。用来在消息文本内保留文件库、最近对话和技能的语义位置；本地上传文件是独立附件，连接器是执行行为。

## 事实源与 API
公共导出包括 `INLINE_TAG_CLASS`、`formatInlineTag(type, label)`、`parseInlineTags(content)`、`hasInlineTags(content)` 和 `MessageSegment`。唯一序列化格式是 `[[类型:名称]]`；解析返回 text 段或 `{ kind: "tag", type, label }`。Composer 生成标记，Conversation Flow 解析并渲染 badge。

## 结构、状态与无障碍
标签视觉使用共享 `INLINE_TAG_CLASS`；图标由 `icon-registry.ts` 的 `ContextType` 映射，文件库标签例外使用 `LibraryFileIcon`。包含标签的正文走纯文本分段，避免与 Markdown 块结构冲突。

## 组合边界
类型在解析时只是 `as ContextType`，不做运行时白名单验证；未知或畸形但匹配的类型可能在 `contextIcons[type]` 渲染处失败。调用方不可把它当作外部不可信内容的完整校验器。

## 扩展方式
新增可内联上下文时同步扩展 `ContextType`、icon registry、Composer 插入和消息渲染；不能只扩大正则或 JSX 映射。

## 常见坑
- 以不同正则在 Composer/消息两端实现同一格式。
- 认为任意解析出的 type 都安全可渲染。
- 把 upload 或 connector 序列化进消息标签。
