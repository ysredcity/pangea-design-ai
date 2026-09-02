---
name: agent-ux-extension-map
description: "共享对话域与双 Base UI 壳层的扩展点地图。"
user-invocable: false
---

# 扩展点地图

先完成 SKILL 的配置/扩展判定。共享能力进入 `packages/agent-ui/src/conversation/`；形态差异只进入对应壳层，不能把右侧面板或 Copilot 画布泄漏进共享域。

| 需求 | 改这里 | 不要碰 |
|---|---|---|
| 消息、执行、Composer、澄清、交付物入口 | `packages/agent-ui/src/conversation/` | `PanelView`、`ArtifactPanel`、Copilot canvas |
| 新产品专属对话块 | 产品 `renderProductBlock` registry；未知 type `console.warn` 后返回空 | 将未知块降级为 Markdown；导入私有回复组件 |
| 中立交付物语义 | `conversation/types.ts` 的 `ArtifactTarget` | 任一形态特有 Tab、Panel 或 Canvas 类型 |
| 沉浸式产物展示 | `templates/immersive-starter/src/components/agent-layout/{agent-shell,panel-*,image-viewer}.tsx` | 对话域中的面板分支 |
| Copilot 产物展示 | 页面 `routeArtifact(target)` 与 `workspace` | 沉浸式 `ArtifactPanel`；Copilot 右侧产物 Tab |
| Copilot 辅助区模式 | `packages/agent-ui/src/copilot/copilot-app.tsx` | 业务页面中复制三栏壳层 |
| 产品身份、导航、欢迎专家/推荐 | immersive `app-config.ts` 或 Copilot config | 用 AppConfig 代替场景、面板或业务块扩展 |

产物是否可点击只由是否存在用户可查看的 `ArtifactTarget` 决定。沉浸式把它适配为 Tab/图片蒙层；Copilot 把它适配为左侧画布。两者共享语义，不共享容器。
