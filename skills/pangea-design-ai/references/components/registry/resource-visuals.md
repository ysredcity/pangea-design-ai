---
name: agent-ux-resource-visuals
description: "沉浸式文件、专家与产品身份的稳定视觉映射和头像组件。"
user-invocable: false
meta:
  id: resource-visuals
  kind: component
  layer: registry
  title: 资源视觉映射 Resource Visuals
  exported: true
  source: skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/resource-visuals.tsx
  whenToUse: [渲染文件类型图标, 渲染专家或产品智能体头像]
  whenNotToUse: [为导航/上下文对象选图标, 用中文展示名作为专家稳定映射键]
  composeWith: [LibraryFileIcon, ExpertAvatar, AgentAvatar, AppConfig]
  composeBoundary: [文件/专家/产品头像映射在此集中维护，导航与上下文图标由 icon-registry 维护]
  pitfalls: [在 JSX 依据文件名硬编码图标, 以专家展示文本作稳定 key, 给文件图标加入业务色]
  designRules: [design.md#12-首屏与能力识别, design.md#23-上下文与能力对象, design.md#64-图标]
---

# 资源视觉映射 Resource Visuals

## 选型
`resource-visuals.tsx` 集中文件扩展名、专家视觉 key 与产品头像，避免同一资源在侧栏、Composer、菜单与消息中出现不同图标或头像。导航和上下文对象图标仍属于 `icon-registry.ts`。

## 事实源与 API
公开导出 `ExpertVisualKey`、`ProductAvatarKey`、`LibraryFileIcon`、`ExpertAvatar`、`AgentAvatar`。`ExpertVisualKey` 由私有 `expertVisuals` 的稳定 key 推导；当前产品头像 key 仅为 `bot`。`LibraryFileIcon` 从文件扩展名解析私有 `fileIcons`，未知类型回退 `File`。`ExpertAvatar` 优先接收 `visualKey`，其次用兼容的展示名表解析；`AgentAvatar` 优先专家视觉，否则渲染产品 bot 身份。

## 结构、状态与无障碍
文件图标只按文件类型区分形状，继承所在容器文字颜色，不携带业务色。头像是装饰性视觉，输出 `aria-hidden="true"`；名称/身份仍需由周边文本表达。内部映射和 fallback 不公开，消费者不能依赖其实现细节。

## 组合边界
专家应在产品数据中稳定保存 `id`、`label`、`visualKey`，优先传 `visualKey`，而不是把中文展示文本作为映射契约。身份配置中的 `avatar` 传给 `AgentAvatar`，使侧栏与对话流保持同一产品身份。不得在组件 JSX 硬编码文件扩展名、专家名或头像样式映射。

## 扩展方式
新增文件类别时扩展私有 `fileIcons`；新增专家视觉时扩展 `expertVisuals`，由类型推导 key，再在场景/AppConfig 中复用该 key。若改变产品头像种类，先扩展 `ProductAvatarKey` 和 `AgentAvatar` 的明确分支。

## 常见坑
- 把 `expertVisualKeys` 的显示名兼容表当作新数据模型。
- 让未知文件没有 fallback 或让文件图标使用随机颜色。
- 在每个消费者复制专家/文件映射。