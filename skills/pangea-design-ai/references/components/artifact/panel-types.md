---
name: agent-ux-panel-types
description: "沉浸式右侧面板与图片查看器的本地 adapter 契约。"
user-invocable: false
meta:
  id: panel-types
  kind: contract
  layer: artifact
  title: 面板类型 Panel Types
  exported: true
  source: skills/agent-ux-react/templates/immersive-starter/src/components/agent-layout/panel-types.ts
  whenToUse: [为沉浸式产物选择搜索、浏览器、文件预览或图片查看展示]
  whenNotToUse: [扩展 shared ArtifactTarget, 将 PanelTab 或 Canvas 字段传入跨形态数据]
  composeWith: [panelContainers, panelViewKey, ArtifactPanel, ImageViewer]
  composeBoundary: [PanelView/ImageView/PanelTab 是 immersive adapter, shared ArtifactTarget 保持中立]
  pitfalls: [把同名 shared ArtifactTarget 当作本类型, 为 ImageView 创建 Tab]
  designRules: [design.md#35-结果呈现与产物容器, design.md#323-有产物的动作才做成可点击资源]
---

# 面板类型 Panel Types

## 选型
本契约仅表达沉浸式如何呈现产物：可并排查看的内容进入 `PanelView` Tab，需专注单看图片的内容进入 `ImageView` 蒙层。它不是跨壳层的共享交付物模型。

## 事实源与 API
`panel-types.ts` 公开导出：

| 类型/函数 | 当前成员与责任 |
|---|---|
| `SearchResult` | `id`、`title`、`description`、`url`、`source`。|
| `PanelView` | `search-results { title, query, results }`、`browser { title, url, description?, source? }`、`file-preview { title, fileName, content, fileType? }` 的判别联合。|
| `ImageView` | `type: image`、`title`、`fileName`、`src`，可选 `alt`、`fileType`；不进入 Tab。|
| `ArtifactTarget` | `PanelView | ImageView`，只供沉浸式 router 使用。|
| `PanelTab` | `{ id } & PanelView`，右侧打开实例。|
| `panelViewKey(view)` | 按检索 query、网页 URL、文件名生成去重键。|

## 结构、状态与无障碍
`AgentShell.openArtifact()` 按 `type` 分发：图片设为 `imageView`，其他 adapter 进入 Tab。`panelViewKey` 使同一 search/browser/file 内容只切换已有 Tab；检索到网页的内部导航替换当前 Tab 内容而不新增 Tab。

## 组合边界
shared `packages/agent-ui/src/conversation/types.ts` 的 `ArtifactTarget` 仅有 `id/type/title/description?/href?/payload?` 的中立语义，**没有** `PanelView`、`ImageView`、`PanelTab` 或 Canvas 字段。Copilot 将 shared target 路由到左侧画布，不使用沉浸式右侧 panel。两个同名 `ArtifactTarget` 不可互换。

## 扩展方式
仅添加已有容器的数据，修改 `panel-data.ts`。新增容器类型必须依序扩展本 `PanelView`、实现 `panel-containers.tsx` 的 Toolbar/Body、注册 `panel-registry.ts`；不可在 `AgentShell` 或 `ArtifactPanel` 添加按类型分支。

## 常见坑
- 把 adapter 字段扩散到 shared conversation，锁死 Copilot 布局。
- 将图片塞进 `PanelTab`，而不是走 `ImageViewer`。
- 用标题替代 `panelViewKey` 的实际去重字段。
