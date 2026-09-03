---
name: agent-ux-panel-registry
description: "沉浸式 PanelView 类型到图标、Toolbar 与 Body 的穷尽注册表。"
user-invocable: false
meta:
  id: panel-registry
  kind: contract
  layer: artifact
  title: 面板容器注册表 Panel Registry
  exported: true
  source: skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/panel-registry.ts
  whenToUse: [注册新的沉浸式 PanelView 容器类型, 查找既有容器的图标与渲染入口]
  whenNotToUse: [只替换示例内容, 在 ArtifactPanel 或 AgentShell 写类型分支]
  composeWith: [PanelView, ArtifactPanel, panel-containers]
  composeBoundary: [registry 覆盖所有 PanelView type, 壳层只根据注册结果装配]
  pitfalls: [漏注册联合类型成员, 将类型相关操作放在 Tab 顶栏]
  designRules: [design.md#35-结果呈现与产物容器, design.md#64-图标]
---

# 面板容器注册表 Panel Registry

## 选型
使用类型映射注册表把每种沉浸式 `PanelView` 绑定到 Tab 图标、可选 Toolbar 与 Body。它保证容器细节不泄漏到框架壳层。

## 事实源与 API
`panel-registry.ts` 公开导出 `PanelContainer` 和 `panelContainers`。`PanelContainer<V>` 包含 `icon`、可选 `Toolbar({ view })`、必填 `Body({ view, onNavigate })`。私有 `PanelContainerRegistry` 是对 `PanelView['type']` 的映射；当前条目为 `search-results`、`browser`、`file-preview`。缺少任一联合成员会成为类型错误。

## 结构、状态与无障碍
`ArtifactPanel` 从 `panelContainers[view.type]` 取 Toolbar/Body；Tab 使用 registry 的图标。类型相关操作（如下载、外部打开）属于容器 Toolbar，而顶栏只承载 Tab、全屏与关闭等全局控制。

## 组合边界
这是 immersive-only registry，不是 shared product-block registry，也不服务 Copilot 左画布。不要在 `ArtifactPanel`、`AgentShell` 或对话 JSX 添加 `if (view.type === ...)`；它们只调度注册表。

## 扩展方式
1. 在 `panel-types.ts` 扩展 `PanelView`。2. 在 `panel-containers.tsx` 实现强类型 Toolbar/Body。3. 在本表补全 icon/Toolbar/Body。4. 为场景内容更新 `panel-data.ts`。只扩充既有类型的内容时，跳过前三步，仅改 `panel-data.ts`。

## 常见坑
- 只改 union 与数据，漏掉 registry entry。
- 在壳层复制容器分支，破坏封装与穷尽检查。
