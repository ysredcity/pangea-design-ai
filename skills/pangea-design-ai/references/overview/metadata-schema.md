---
name: agent-ux-metadata-schema
description: "组件 / 布局外壳 / 页面模式的元数据 frontmatter schema 定义。规定 components/、patterns/ 下文档顶部 meta 字段的结构，含 layer（四层信息模型归属）、exported（公共导出 vs 内部实现）、designRules（反查设计依据）三个关键字段，以及由此生成机读索引 catalog.json 的约定。"
user-invocable: false
---

# 元数据 Schema

> **目的**：为每个组件、布局外壳标注「归属哪一层 / 是否可直接引用 / 适用场景 / 组合边界 / 依据哪条设计规则」，让 AI 选型与后续官网目录消费同一份结构化依据。
> **单一事实源**：元数据写在各文档**顶部 frontmatter 的 `meta` 字段**；生成器汇总成机读的 `references/_generated/catalog.json`。

## 与 pangea-design-skill 的两处刻意差异

本 schema 参照 pangea 引用 arco 的做法，但有两处**有意为之**的不同，理由记录在此以免被"修正"回去：

| | pangea | 本项目 |
|---|---|---|
| 文档分层 | 拆两层：`components/` 放 arco 官方 API **零漂移镜像**，`component-selection/` 放薄选型元数据 | **合并为一份**。pangea 必须拆是因为镜像文档不能注入判断；本项目对话域组件是**自研**，文档本身就是事实源，拆开只制造同步负担 |
| 底层基础件 | 60+ 份 arco 组件 API 镜像 | **只做一份 `components/base-inventory.md`**（清单 + 本项目约定）。arco 是 npm 包、API 不可见所以值得镜像；shadcn 是**拷贝源码**模式，源码就在 `src/components/ui/`，agent 读源码比读二手文档更准 |

## 字段规范

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | string | 是 | 全局唯一，kebab-case（如 `execution-action-badge`） |
| `kind` | `component` \| `layout-shell` \| `pattern` \| `contract` | 是 | 元数据类别，见下方说明 |
| `layer` | `delegation` \| `conversation` \| `process` \| `artifact` \| `shell` \| `registry` | 是（`kind: component`） | **所属信息层**，对应 [design.md 0.2 四层信息模型](../design.md#02-产品心智模型与四层信息分层) + 壳层 + 注册表 |
| `title` | string | 是 | 中文名 + 英文组件名 |
| `exported` | boolean | 是（`kind: component`） | **是否为公共导出**，见下方说明 |
| `status` | `stable` \| `draft` | 否 | 默认 `stable` |
| `whenToUse` | string[] | 是 | 适用场景（正向） |
| `whenNotToUse` | string[] | 荐 | 不适用场景 + 更合适的替代 |
| `keyStructure` | string[] | 荐（`layout-shell`） | 关键结构区块 |
| `variants` | string[] | 否 | 可选变体 |
| `composeWith` | string[] | 否 | 常配合使用的组件 |
| `composeBoundary` | string[] | 荐 | 组合/嵌套边界与禁忌 |
| `pitfalls` | string[] | 荐 | 常见错误/反例（优先收录实战记录） |
| `designRules` | string[] | 荐 | **反查设计依据**，指向 design.md 锚点，见下方说明 |
| `sizeContract` | string[] | 否 | 已成契约的尺寸（仅当该组件有，见 [design.md 6.3](../design.md#63-已成契约的组件尺寸)） |
| `source` | string | 否 | 对应源文件路径 |
| `previewRoute` | string | 否 | 脚手架可预览的路由 |
| `tags` | string[] | 否 | 检索/过滤标签 |

字段命名用 camelCase；数组元素为简短中文短语，能被人和 AI 直接读。

## 三个关键字段的用途

### `layer` — 所属信息层

支撑按信息层检索，也让 `catalog.json` 能按层分组。更重要的作用是**与 [design.md 第七章决策流程](../design.md#七扩展新能力的决策流程)第 1 问闭环**：agent 判断出"新能力属于过程层"之后，可以直接筛出该层的全部现有组件，先看能不能复用，再决定是否新建。

`shell` 与 `registry` 不属于四层信息模型，是基础设施：
- `shell` — 布局壳层与导航（`AgentShell` / `ChatWorkspace` / `ConversationPage` / `AgentSidebar`）
- `registry` — 注册表与视觉映射（图标注册表、资源视觉映射、通用图标按钮）

### `exported` — 公共导出 vs 内部实现

**这个字段解决一个实测发现的真实问题**：沉浸式实现的交接文档里描述了 `AgentResponseBlock`、`ConversationTurn`、`AssistantContinuation` 三个组件，但 `grep` 实际导出发现**它们并不在导出列表中**，是文件内私有组件。

不标清楚的后果：agent 试图 `import { AgentResponseBlock }` 然后失败，或者反过来不敢碰任何东西。

| 值 | 含义 | agent 的行为边界 |
|---|---|---|
| `true` | 公共导出 | 可以在自己的页面里直接 import 并组合使用 |
| `false` | 文件内私有实现 | 要改它必须改宿主文件本身，属于"修改壳层内部"，**需在需求文档说明理由** |

### `designRules` — 反查设计依据

从组件反查它依据的设计规则，避免"改了组件但违反了某条原则"。取值是 design.md 的锚点数组，例如：

```yaml
designRules:
  - design.md#323-有产物的动作才做成可点击资源
  - design.md#63-已成契约的组件尺寸
```

## kind 说明

| kind | 用于 | 目录 |
|---|---|---|
| `component` | 具体组件（含对话域组件与基础件清单） | `references/components/<layer>/` |
| `layout-shell` | 界面形态的布局外壳 | `references/patterns/` |
| `pattern` | 横切模式（执行层级判定、产物容器判定、响应式等） | `references/patterns/` |
| `contract` | 纯类型契约（如产物判别联合、内联标签格式），无渲染 | `references/components/<layer>/` |

## 生成产物：`references/_generated/catalog.json`

- **生成器**：`scripts/build-catalog.mjs`（零依赖），扫描 `references/components/**/*.md` 与 `references/patterns/*.md` 的 frontmatter `meta`，按 `kind` 与 `layer` 归组输出。
- **形态**：

```jsonc
{
  "generatedAt": "2026-08-27T00:00:00Z",
  "layoutShells": [
    { "id": "immersive-shell", "kind": "layout-shell", "title": "沉浸式 Agent 布局外壳", "doc": "references/patterns/immersive-shell.md" }
  ],
  "patterns": [
    { "id": "execution-hierarchy", "kind": "pattern", "title": "执行层级 L1/L2/L3 判定", "doc": "..." }
  ],
  "componentsByLayer": {
    "delegation": [ { "id": "composer", "layer": "delegation", "exported": true, "title": "意图输入区 Composer", "doc": "..." } ],
    "conversation": [ /* ... */ ],
    "process": [ /* ... */ ],
    "artifact": [ /* ... */ ],
    "shell": [ /* ... */ ],
    "registry": [ /* ... */ ]
  }
}
```

- 每条自动补 `doc` 字段。`_generated/` 为生成目录，**勿手改**；改元数据请改各文档 frontmatter 后重跑生成器。

## 维护约定

- 新增/修改组件或布局外壳 → 改对应文档的 `meta` → 重跑 `node scripts/build-catalog.mjs`。
- schema 变更（增删字段）→ 更新本文件 + 生成器 + 已回填文档，保持一致。
- `exported` 字段必须以**实际 `grep` 导出结果**为准，不能照抄上游交接文档的叙述。
