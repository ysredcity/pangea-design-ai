---
name: agent-ux-container-search-results
description: "沉浸式检索结果 PanelView 的结果列表容器。"
user-invocable: false
meta:
  id: container-search-results
  kind: component
  layer: artifact
  title: 检索结果容器 Search Results Container
  exported: true
  source: skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/panel-containers.tsx
  whenToUse: [在右侧 PanelView 中浏览检索命中并进入网页预览]
  whenNotToUse: [直接在对话气泡中塞完整结果列表, 为每个结果另开 Tab]
  composeWith: [SearchResultsToolbar, SearchResultsBody, panel-registry, ArtifactPanel]
  composeBoundary: [点击结果通过 onNavigate 替换当前容器, 不创建新 Tab]
  pitfalls: [将搜索结果链接跳为外部页面, 在壳层实现检索类型 UI]
  designRules: [design.md#35-结果呈现与产物容器, design.md#53-无障碍与包容性]
---

# 检索结果容器 Search Results Container

## 选型
用于 `PanelView.type === 'search-results'` 的右侧容器。用户需要在对话之外核对多条检索资料时使用。

## 事实源与 API
公开导出 `SearchResultsToolbar({ view })` 与 `SearchResultsBody({ view, onNavigate })`。二者接收 `Extract<PanelView, { type: 'search-results' }>`；Toolbar 显示结果数量，Body 遍历 `SearchResult` 并把点击结果转换为 browser view。

## 结构、状态与无障碍
每条结果是可聚焦 button，带标题、描述、来源/URL 和 hover 时的外链图标。结果点击调用 `onNavigate(browserView)`；`AgentShell.navigatePanel()` 保留当前 Tab 的 id 并替换 view，因此检索 → 浏览器是当前容器内导航，不新开 Tab。

## 组合边界
容器 UI 在 `panel-containers.tsx`，图标/关联在 `panel-registry.ts`，Tab 框架在 `ArtifactPanel`。不要在 `AgentShell` 或 `ArtifactPanel` 添加搜索结果类型分支。

## 扩展方式
添加搜索实例和结果只改 `panel-data.ts`。改变此容器的操作栏或正文改 `panel-containers.tsx`；新增另一种容器类型按 panel types → containers → registry 链路。

## 常见坑
- 每条搜索结果都调用 openPanel，造成 Tab 泛滥。
- 仅用 hover 显示关键信息，忽略键盘焦点访问。
