---
name: agent-ux-markdown-content
description: "沉浸式 Markdown 排版入口：GFM 渲染与统一 typeset 容器。"
user-invocable: false
meta:
  id: markdown-content
  kind: component
  layer: conversation
  title: Markdown 内容 MarkdownContent
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/markdown-content.tsx
  whenToUse: [渲染无内联标签的对话正文或推理内容]
  whenNotToUse: [将 badge 与块级 Markdown 混在同一 ReactMarkdown 树, 在业务组件逐项手写排版]
  composeWith: [react-markdown, remark-gfm, typeset.css, AssistantMessage]
  composeBoundary: [children 必须是 string, 带内联标签的消息转纯文本分段路径]
  pitfalls: [把 className 当成内容安全策略, 误称支持 badge 混排 Markdown]
  designRules: [design.md#351-markdown内联响应, design.md#62-排版与阅读密度]
---

# Markdown 内容 MarkdownContent

## 选型
所有普通富文本回复与推理内容统一进入此组件，让排版规则集中在 `typeset` 层。

## 事实源与 API
`MarkdownContent({ children, className? })` 为公共导出，`children` 是 Markdown 字符串。它以 `react-markdown` 渲染并启用 `remark-gfm`，外层固定拥有 `typeset` class，额外 className 用 `cn` 合并。

## 结构、状态与无障碍
正文排版由 typeset 统一处理，沉浸式消息正文目标为 15px/1.6；推理面板通过 className 覆盖为 14px 密度。内容语义由 Markdown AST 生成，不在每个业务消息组件重设标题、列表、引用和代码块样式。

## 组合边界
`MessageContent` 检测到 `[[类型:名称]]` 时不使用 MarkdownContent，因为块级 Markdown 与行内 badge 无法安全共存；它改以纯文本分段渲染。不要将该限制解释为内联标签支持完整 GFM。

## 扩展方式
排版改 `typeset.css`/组件 className；新增 Markdown 插件前检查安全、产物链接与所有消息场景，不能局部绕开此入口。

## 常见坑
- 为一条回答手写 `<p>/<ul>` 排版。
- 把含内联标签的字符串直接传给 ReactMarkdown，期待标签还原。
