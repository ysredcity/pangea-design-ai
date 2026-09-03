---
name: agent-ux-clarification-form-card
description: "沉浸式结构化澄清表单：完整性校验、Base UI 字段与提交后只读记录。"
user-invocable: false
meta:
  id: clarification-form-card
  kind: component
  layer: conversation
  title: 澄清表单卡 ClarificationFormCard
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/clarification-form-card.tsx
  whenToUse: [缺少三个以上结构化关键信息, 需要一次补齐日期事由偏好等字段]
  whenNotToUse: [一两个可自然追问的缺口, 用浏览器原生日期输入或另造表单体系]
  composeWith: [ClarificationFormData, AssistantMessage, Popover, Calendar]
  composeBoundary: [required 字段不完整不可提交, submitted 后只读, 字段和按钮上限是设计规则非当前运行时校验]
  pitfalls: [把 <=10 字段和 <=3 按钮误称为源码强制, 用 toISOString 处理本地日期]
  designRules: [design.md#33-追问澄清, design.md#331-向智能体索要结构化信息用表单而不是追问, design.md#63-已成契约的组件尺寸]
---

# 澄清表单卡 ClarificationFormCard

## 选型
当继续执行需补齐多个结构化字段时使用；少量缺口仍应自然语言追问。设计约束为字段 ≤10、按钮 ≤3 且主按钮 ≤1；当前实现不机械拦截超过上限的数据，交付前仍需按质量门禁检查。

## 事实源与 API
`ClarificationFormCard({ form, onSubmit?, submitted? })` 使用 `ClarificationFormData`：`id`、`title`、`fields`，以及可选 description/defaultOpen/initialValues/submitLabel/followUp。支持 text、textarea、date-range、single-select、multi-select。`onSubmit` 只回传 `form.id`；字段值留在组件本地状态。

## 结构、状态与无障碍
卡片可折叠，关闭内容使用 `aria-hidden` 与 `inert`。所有 required 字段完成前提交禁用；提交后按钮消失、标题显示“已提交”、字段以只读摘要展示。日期范围使用 `Popover + Calendar`、中文 locale 和本地 `yyyy-MM-dd` 格式，绝不退回原生日期输入。字段通过 `Field`、label、RadioGroup/Checkbox 等 Base UI 基础件获得关联语义。

## 组合边界
表单由 `AssistantMessage` 嵌入并由 `ConversationFlow` 持有提交后的轮次时序。高风险操作确认不应假装是澄清表单：它属于尚未实现的 ConfirmCard 设计缺口。

## 扩展方式
新增字段类型须先扩展 `ClarificationField` 数据联合，再为编辑态、完整性判定和只读摘要同步实现。不要只添加 JSX 分支。日期处理继续以本地日期字符串转换，避免 UTC 偏移。

## 常见坑
- 认为 `submitted` 会回传填入值；当前回调只给 form ID。
- 用一行自然语言来回收集大量字段。
- 将设计卡片上限写成当前组件已有的运行时约束。
