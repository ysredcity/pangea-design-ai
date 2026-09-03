---
name: agent-ux-agent-response-block
description: "沉浸式私有回复编排：身份、执行、正文与产品块的固定顺序。"
user-invocable: false
meta:
  id: agent-response-block
  kind: component
  layer: conversation
  title: 智能体回复块 AgentResponseBlock
  exported: false
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx
  whenToUse: [在 conversation-flow 宿主内编排一段智能体响应]
  whenNotToUse: [从其他页面直接 import, 更改产品块插槽位置而不审查完整回复时序]
  composeWith: [AgentIdentity, ExecutionProcess, AssistantMessage, ProductBlockRenderer]
  composeBoundary: [私有实现不得直接 import, 产品块只在 assistant 之后且 continuation 之前]
  pitfalls: [把产品块放到正文前, 将它描述为稳定公共 API]
  designRules: [design.md#31-对话流的基本顺序, design.md#323-有产物的动作才做成可点击资源]
---

# 智能体回复块 AgentResponseBlock

## 选型
这是 rich Flow 宿主内部的回复编排，不是对外组件。

## 事实源与 API
它在 `conversation-flow.tsx` 中没有 `export`。内部接收身份、专家、执行数据、可选 assistant、澄清提交状态、router，以及可选 `productBlock`/`renderProductBlock`。这些参数是内部实现细节，不构成稳定 import API。

## 结构、状态与无障碍
固定顺序为：`AgentIdentity` 与 `ExecutionProcess`（局部 8px 组距）→ 可选 `AssistantMessage` → 可选产品块。外层与下一块的距离由宿主控制。产品块 renderer 仅收到 `{ onOpenArtifact }`；未提供 renderer 时块不渲染。

## 组合边界
**不能直接 import。** 如需改动，只能修改 `conversation-flow.tsx` 宿主文件，并必须在需求文档说明为何公共导出不能满足需求。产品块在 assistant 正文、附件与澄清之后，且在 `AssistantContinuation` 之前；不得移位或把未知块降级为 Markdown。

## 扩展方式
产品专属内容通过 `renderProductBlock` 注入；若其无法覆盖需求，先记录壳层内部修改理由再在宿主中修改。不要从外部复制该结构。

## 常见坑
- 把私有名称写进消费方 import。
- 声称 renderer 对未知 type 会告警：当前这个组件仅在 renderer 存在时调用，不实现告警。
