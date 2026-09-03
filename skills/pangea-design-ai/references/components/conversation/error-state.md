---
name: agent-ux-error-state
description: "共享 Base UI 异常状态卡的公共 API、七种 scenario 与中立恢复 action 边界。"
user-invocable: false
meta:
  id: error-state
  kind: component
  layer: conversation
  title: 异常状态 ErrorState
  exported: true
  source: packages/agent-ui/src/conversation/error-state.tsx
  whenToUse: [向用户解释已发生的异常、影响和可选恢复路径]
  whenNotToUse: [任务成功完成, 只有技术日志且无用户可理解影响, 将失败伪装成成功]
  composeWith: [共享 ConversationFlow, ProductBlockContext.onAction, 产品 renderer]
  composeBoundary: [卡片描述事实并派发中立恢复意图, 业务方拥有 retry/permission/alternative 的实际执行和结果状态, 不含 panel/canvas]
  pitfalls: [只有错误码或颜色, 缺失 fact/impact/nextStep, 将 recovery action 写成真实重试成功]
  designRules: [design.md#42-异常与恢复, design.md#44-状态与反馈, design.md#九无障碍与可用性]
---

# 异常状态 ErrorState

## 选型

当任务、连接器或产物链路出现用户需要理解并选择下一步的异常时使用。它不是技术栈日志，也不能将失败任务改标为完成。

## 事实源与 API

事实源是 [`packages/agent-ui/src/conversation/error-state.tsx`](../../../../../packages/agent-ui/src/conversation/error-state.tsx)，由 `@agent-ux/agent-ui/conversation`（及包根共享入口）公开导出。

```ts
type ErrorStateProps = ErrorBlockPayload & {
  blockId: string
  onAction: ProductBlockActionHandler
  actionStatus?: ProductBlockActionStatus
  className?: string
}

type ErrorBlockPayload = {
  scenario: ErrorScenario
  fact: string
  impact: string
  nextStep: string
  recoveryActions: ErrorRecoveryAction[]
}
```

`scenario` 仅为 `unavailable`、`timeout`、`failed`、`partial`、`no-permission`、`unsupported` 或 `unknown`。每种场景都有图标、文本标签和 destructive/warning 呈现，但任何场景都必须传入并显示 `fact`、`impact` 与 `nextStep`。`ErrorRecoveryAction` 有 `id`、`label`、`recovery: 'retry' | 'cancel' | 'wait' | 'request-permission' | 'alternative'` 和语义 `tone`。

点击只派发 `{ type: 'error-recovery', blockId, actionId, recovery }` 到 `onAction`；shared Flow 将其作为 `ProductBlockContext.onAction` 交给 renderer。可选 `actionStatus` 仅在当前点击 action 匹配时以 polite status 显示消费者提供的消息，不能表示真实重试、权限或人工接管已成功。

## 结构、状态与无障碍

- 卡片恒定呈现事实、影响和下一步，且恢复动作可为空；异常不能只依赖颜色、图标或错误码表达。
- 七种 scenario 都有明确名称：服务不可用、响应超时、执行失败、部分完成、权限不足、暂不支持、结果未知。
- 恢复动作是键盘可操作的 Base UI button，最小触控高度 44px，提供可见焦点；首个 `primary` 样式为主操作，destructive 使用危险语义。
- 可选结果区域使用 `role="status" aria-live="polite"`。它播报的是形态层或产品页确认后的信息；此卡不执行网络重试、不申请权限、不写审计、不承诺恢复成功。

## 组合边界

产品 renderer 必须先将 `unknown` block 数据验证为 `ErrorBlockPayload`，再传入卡片。沉浸式 local renderer 接受 `data` 并由 rich Flow 保存本地演示回写；shared/Copilot renderer 接受 `payload` 并由产品页决定后续展示。两者同名但 data/context 契约不同，不能互换。shared 卡片和 `ProductBlockAction` 均不携带 Panel、Tab、ImageViewer 或 Copilot Canvas。

## 扩展方式

需要新增业务恢复效果时，在消费 `ProductBlockContext.onAction` 的形态层/产品页实现，并以 `actionStatus` 或该层自己的对话结果呈现。新增 scenario 前先扩展 shared 类型、展示映射、产品 payload validator 与文档；不要在卡片内注入后端重试或特定容器。

## 常见坑

- 只写“失败了”或错误码，不说明事实、影响和下一步。
- 让 `retry` action 的点击本身被误写成“重试成功”。
- 用沉浸式 `data` renderer 代替 shared/Copilot 的 `payload` renderer。 