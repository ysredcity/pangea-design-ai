---
name: agent-ux-new-conversation-page
description: "沉浸式新对话页：用受限 AppConfig 呈现欢迎、专家与可执行推荐。"
user-invocable: false
meta:
  id: new-conversation-page
  kind: component
  layer: delegation
  title: 新对话页 NewConversationPage
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/new-conversation-page.tsx; skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/app-config.ts
  whenToUse: [沉浸式工作台的新对话首屏, 需要让用户选择专家或从具体推荐开始委托]
  whenNotToUse: [通用导航页, 用 AppConfig 偷偷承载业务场景主题面板或产品块]
  composeWith: [AppConfig, Composer, resource-visuals.tsx, AgentShell]
  composeBoundary: [页面只消费 experts 与 welcome, 专家用稳定 id label visualKey, 业务场景与容器不属于配置]
  pitfalls: [按专家展示文案做视觉映射, 将 3 项分页实现误述为推荐数量上限]
  designRules: [design.md#12-能力识别与低成本表达, design.md#31-意图输入, design.md#七扩展新能力的决策流程]
---

# 新对话页 NewConversationPage

## 选型
用于沉浸式工作台的初始委托入口：用户可选专家、选择具体推荐或直接在富 `Composer` 输入。它不是导航、主题或产品块的总配置面。

## 事实源与 API
事实源是 `new-conversation-page.tsx` 与 `app-config.ts`。公共组件接收 `config: Pick<AppConfig, "experts" | "welcome">`、`isSidebarDocked`、`onOpenSidebar` 与 `onStartConversation(message, context)`。`AppConfig` 的完整配置还包括 `identity`、`navigation` 和可选 `renderProductBlock`；页面本身不消费后两者。

`WelcomeExpert` 由 `id`、`label`、`visualKey` 组成；推荐由专家 `id` 与 `prompt` 关联。初始推荐按每页 3 项分组；这只是当前分页实现，产品推荐仍应保持具体、可执行，计划范围为 3–5 条时应由配置数据约束。无专家专属推荐时，页面使用文件内的通用兜底提示。

## 结构、状态与无障碍
初始态展示欢迎语、Composer、精选专家和推荐；选专家后展示该专家推荐；选推荐后将其写入草稿并隐藏推荐。非停靠侧栏才显示带 `aria-label` 与 Tooltip 的展开按钮。窄屏使用横向滚动与 snap，分页箭头隐藏；长推荐仅在检测到截断时显示完整 Tooltip。

## 组合边界
专家视觉只能经 `AgentAvatar` 和 `resource-visuals.tsx` 的 `visualKey` 映射；不能用中文 `label` 充当映射键。`onStartConversation` 交给宿主创建/选择对话；页面不管理场景数据、面板容器、主题或产品块。不能借 `AppConfig` 把不能配置覆盖的产品需求伪装成配置。

## 扩展方式
新增专家或推荐仅扩展 `AppConfig` 数据与既有视觉映射。需要新委托交互时先判断是否能由 Composer/现有配置覆盖；不能覆盖时走扩展决策流程并改明确的宿主/组件，而非扩大 `AppConfig`。

## 常见坑
- 以 `label` 查找后误认为它是稳定标识；数据关联应使用 `id`。
- 说页面消费完整 `AppConfig`，实际 props 仅允许 `experts` 与 `welcome`。
- 把推荐选中误写成直接发送；当前实现只设置草稿并等待用户提交。
