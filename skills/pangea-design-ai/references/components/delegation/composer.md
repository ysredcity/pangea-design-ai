---
name: agent-ux-composer
description: "共享轻量 Composer 与沉浸式富 Composer 的双实现边界。"
user-invocable: false
meta:
  id: composer
  kind: component
  layer: delegation
  title: 意图输入区 Composer
  exported: true
  source: packages/agent-ui/src/conversation/composer.tsx; skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/composer.tsx
  whenToUse: [需要轻量文本提交时使用 shared Composer, 需要上下文标签附件连接器或专家状态时使用 immersive Composer]
  whenNotToUse: [把沉浸式 props 传给共享 Composer, 把基础 shared 输入当作富委托工作台]
  composeWith: [ConversationFlow, icon-registry.ts, resource-visuals.tsx]
  composeBoundary: [两套同名组件的 onSend 签名与状态模型不兼容, 新对象图标必须经注册表]
  pitfalls: [shared Composer 不支持附件或 trigger 菜单, immersive contentEditable 的发送值与草稿值不同]
  designRules: [design.md#12-能力识别与低成本表达, design.md#七扩展新能力的决策流程]
---

# 意图输入区 Composer

## 选型

同名 `Composer` 有两套实现，不能按名称互换。需要单个文本问题与最小提交行为时选 shared；沉浸式模板需要把文件、技能、最近对话、专家与连接器组织进委托语义时选 rich immersive implementation。

## 事实源与 API

### Shared：轻量文本输入

事实源：[`packages/agent-ui/src/conversation/composer.tsx`](../../../../../packages/agent-ui/src/conversation/composer.tsx)。它只导出 `Composer`，props 为：

```ts
{ onSend: (value: string) => void; placeholder?: string }
```

`placeholder` 默认是“输入你的问题…”。组件在本地维护 textarea 值，点击发送或未按 Shift 的 Enter 会 trim 后调用 `onSend(value)`，空白不发送并在发送后清空；Shift+Enter 保留换行。它没有受控草稿、附件、上下文标签、连接器、专家、录音或 `/`、`@` 菜单 API。

### Immersive：富委托输入

事实源：[`templates/immersive-starter/src/components/agent-layout/composer.tsx`](../../../templates/immersive-starter/src/components/agent-layout/composer.tsx)。公开导出 `Composer`、`ContextItem` 与 `MenuSide`；`ComposerProps` 是文件私有类型。组件 props 为 `onSend?`、`draft?`、`onDraftChange?`、`selectedExpert?`、`onSelectedExpertChange?`、`menuSide?`，其中 `menuSide` 默认 `above`。它的 `onSend` 是 `(message: string, context: ContextItem[]) => void`，不是 shared 的单字符串回调。

`ContextItem` 包含 `id`、`label`、`type`、可选 `size` 与可选的沉浸式产物 `target`；`MenuSide` 是 `'above' | 'below'`。富实现还支持产品页传入的 `disabled?: boolean`：该状态禁用编辑、上传、上下文/能力菜单、连接器、专家移除、录音和发送，且 `send()` 会二次阻止提交；它用于确认待决等产品流程，不复用录音状态。组件以 `contentEditable` 编辑器组织内联项：发送时把内联项序列化为 `[[类型:名称]]`，向 `onDraftChange` 回传纯文本。它支持有效起始/空白位置的 `/` 技能与 `@` 文件或最近对话触发、上传本地文件并创建目标预览、选择连接器、录音权限请求、专家选择和发送状态；发送后重置编辑器、上传、连接器与草稿。

## 结构、状态与无障碍

Shared 输入用带 `aria-label` 的 textarea 与发送按钮，键盘提交保留多行输入路径。Immersive 的 `contentEditable` 必须保持可访问名称、清晰的菜单焦点与麦克风失败提示；允许在有文本、上传、专家或连接器任一上下文时发送，不能将 rich 行为退化为仅文本。

## 组合边界

shared `Composer` 只能组合 shared `ConversationFlow` 的文本发送入口。不可把 `ContextItem[]`、`draft`、`selectedExpert` 或 `menuSide` 传给它。Immersive `Composer` 属于沉浸式壳层的数据与视觉体系，不能以 shared props 直接替换，也不得向 shared conversation 域泄漏其 adapter target。

## 扩展方式

沉浸式新增文件、专家或上下文对象时，图标分别扩展 `resource-visuals.tsx` 与 `icon-registry.ts`，禁止在 Composer JSX 临时写映射。新增共享能力前先判断它是否仍是所有形态都需要的轻量文本能力；否则留在 immersive。上传实体附件与消息内联语义上下文须按 `message-context` 契约分层。

## 常见坑

- 认为同名的 `onSend` 兼容：shared 接收一个 trimmed 字符串，immersive 额外接收上下文并发送序列化 markup。
- 在 shared 组件上假定支持 `/`、`@`、附件、连接器或语音。
- 为新对象在 JSX 写图标判断，导致侧栏、菜单、输入区和消息流的视觉语义漂移。
- 把 `onDraftChange` 的纯文本与 `onSend` 的序列化内容当成同一值。
