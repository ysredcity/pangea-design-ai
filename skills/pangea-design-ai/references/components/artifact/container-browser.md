---
name: agent-ux-container-browser
description: "沉浸式 browser PanelView 的网页预览容器。"
user-invocable: false
meta:
  id: container-browser
  kind: component
  layer: artifact
  title: 浏览器容器 Browser Container
  exported: true
  source: skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/panel-containers.tsx
  whenToUse: [在独立面板内阅读网页摘要、来源和关键结论]
  whenNotToUse: [把网页产物伪装为共享 Canvas 字段, 在顶层 Tab 行加入网页专属操作]
  composeWith: [BrowserToolbar, BrowserBody, panel-registry, ArtifactPanel]
  composeBoundary: [网页专属地址/打开操作属于容器 Toolbar, Tab 顶栏只保留全局操作]
  pitfalls: [假装返回按钮可用, 用新 Tab 替代当前容器导航]
  designRules: [design.md#35-结果呈现与产物容器, design.md#64-图标]
---

# 浏览器容器 Browser Container

## 选型
用于 `PanelView.type === 'browser'`，在右侧与对话并排预览网页的来源、标题、摘要和后续正文位置。

## 事实源与 API
公开导出 `BrowserToolbar({ view })` 与 `BrowserBody({ view })`，均接收 browser 判别分支。Toolbar 显示 URL、禁用的返回入口和“在新窗口打开”的视觉入口；当前两者均未绑定浏览历史或外部打开回调。Body 使用 `source ?? new URL(url).hostname`，展示标题、描述及页面摘要占位区。

## 结构、状态与无障碍
滚动正文使用语义 `article`、标题层级和可截断 URL。当前返回控件明确为 disabled，不应伪称有浏览历史。来自检索结果的导航保留现有 Tab id，由 shell 替换当前 view。

## 组合边界
当前实现是预览模式，不等于嵌入真实网页浏览器，也不接管 Copilot 的左画布。类型相关地址栏和外部打开操作放在本 Toolbar；不要回填到 `ArtifactPanel` 顶栏。

## 扩展方式
替换示例网页数据改 `panel-data.ts`。扩充网页预览行为时改本容器并保持 `PanelView` 字段契约；若新增独立容器类型，依序更新 types、containers、registry。

## 常见坑
- 把 placeholder 段落宣称为抓取的网页正文。
- 把检索内导航实现成新增 Tab 或另一个 panel。
