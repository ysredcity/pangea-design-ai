# 方案：Mock 对话剧本引擎

> 状态：**一期与 Phase 5 双数据源适配均已实现**（2026-09-03）。
> 一期代码位于 `packages/agent-ui/src/script-engine/`；Phase 5 已将沉浸式默认作者入口切换为 TS 富场景，同时保留 JSON 编辑器入口的解析边界。
> ⚠️ **后续变更**：采纳 [agent-layout 作为沉浸式事实源](./agent-layout-integration.md) 后，本方案有两处修订，见第 9 节。`script-player.tsx` 需重写、`runtime.ts` 需重构，`match/interpolate/parse` 大部分保留。
> 关联：[SKILL.md](../../skills/pangea-design-ai/SKILL.md) · [design.md](../../skills/pangea-design-ai/references/design.md) · [component-selection/](../../skills/pangea-design-ai/references/component-selection/)

## 1. 问题

当前两套脚手架的演示场景（`immersive-starter/src/pages/Conversation.tsx`、`copilot-starter/src/pages/ContractReview.tsx`）把"剧本"直接写死在 TSX 里：`if (text.includes('合同')) { ... }`。这带来两个问题：

1. **PM 改不了**：想改一句话、加一个分支，只能找工程师改代码。
2. **不可复用**：每个新场景都要重写一份 if/else，无法沉淀成"剧本模板"，也无法喂给后续的[在线编辑器](./website-showcase.md)做可视化编辑。

目标：把剧本从代码里剥离成**数据**（JSON），由一个通用的"剧本引擎"组件负责解释执行，渲染出 `agent-ui/` 里已有的 9 个组件。剧本引擎不新增业务能力，只是"把已有能力参数化"。

## 2. 设计原则

- **不发明新组件**：剧本能表达的内容上限 = `agent-ui/` 已有 9 个组件的能力上限。剧本里的"块类型"直接对应这 9 个组件，不做超集设计。
- **剧本是 design.md 规则的实例，不是绕过规则的后门**：剧本校验要复用质量门禁 G5/G6 的判断逻辑（字段数、按钮数、高风险字段完整性），机检未过的剧本不应被引擎渲染，或渲染时给出明显的开发期警告（沿用现有 `ClarifyCard`/`ConfirmCard` 里 `console.warn` 的兜底手法）。
- **两条生产路径共用一份 schema**：agent 根据需求文档生成剧本（路径 A），PM 在[在线编辑器](./website-showcase.md)里改剧本（路径 B），两者读写同一份 JSON 结构，不允许出现"生成器格式"和"编辑器格式"两套并行标准。
- **剧本文件本身也是纯前端数据**：不依赖后端，可以被 import、可以被导出成文件、可以被塞进 localStorage，这是能同时服务"脚手架里的 mock 数据"和"在线编辑器"两个场景的前提。

## 3. 词汇表（受控词汇，剧本字段命名的唯一依据）

| 概念 | 字段 | 取值 | 对应 |
|---|---|---|---|
| 场景 | `scenario` | 顶层对象 | 一个可被 `trigger` 命中的完整对话小剧本 |
| 触发方式 | `trigger.type` | `keyword` \| `regex` \| `fallback` | `fallback` 全局最多一个，未命中任何场景时使用 |
| 触发词 | `trigger.patterns` | `string[]` | `keyword` 类型下的命中词数组；`regex` 类型下为正则字符串数组 |
| 节点 | `nodes[].id` | string | 场景内的状态机节点，`entry` 为固定入口节点 id |
| 响应块 | `nodes[].blocks[]` | 见下表 `block.type` | 一个节点可包含多个块，按数组顺序渲染 |
| 块类型 | `block.type` | `markdown` \| `taskProgress` \| `clarifyCard` \| `confirmCard` \| `artifactCard` \| `errorState` \| `followUp` | 一一对应 `agent-ui/` 组件，不允许出现表外类型 |
| 风险等级 | `block.riskLevel` | `low` \| `medium` \| `high` | 仅 `confirmCard` 必填，对齐 design.md 4.1 |
| 分支 | `block.branches` | `{ on: string; goto: string }[]` | `on` 取值见下方"分支出口"；`goto` 指向 `nodes[].id` |
| 分支出口 | `branches[].on` | `onSubmit` \| `onSkip` \| `onConfirm` \| `onReset` | 对应交互类块（clarifyCard/confirmCard）的用户操作 |
| 变量插值 | 文本中的 `{{fieldKey}}` | — | 引用 `clarifyCard` 提交结果里的字段值，回填进后续 `markdown` 文本 |
| 节奏控制 | `block.delayMs` | number（毫秒） | 演示用假延时，不是真流式；用于模拟"思考中"停顿或执行层逐条 append 的节奏 |

> 这份词汇表就是 design.md 场景链路六环节（意图输入/任务过程/追问澄清/操作确认/结果呈现/后续引导）到"数据字段"的直接映射，没有超出现有组件能力范围。

## 4. Schema 草案（JSON，示意，非最终版本）

> 补充说明（思考执行过程，对应 `taskProgress` 块）：见本节末尾的场景三"合同风险扫描"，演示 `TaskProgress` 组件的状态层/任务层/执行层如何用 `steps[].delayMs` 编排成渐进式播放效果。

```jsonc
{
  "$schemaVersion": "1.0",
  "scenarios": [
    {
      "id": "contract-review",
      "title": "合作协议审核",
      "trigger": { "type": "keyword", "patterns": ["合同", "合作协议"] },
      "entryNodeId": "confirmSubmit",
      "nodes": [
        {
          "id": "confirmSubmit",
          "blocks": [
            { "type": "markdown", "content": "我已根据模板生成了协议草稿，是否提交给对方签署？" },
            {
              "type": "confirmCard",
              "riskLevel": "high",
              "question": "是否提交合作协议供对方签署？",
              "fields": [
                { "label": "对象", "value": "供应商合作协议.docx" },
                { "label": "动作", "value": "提交外部签署" },
                { "label": "影响范围", "value": "对外发出，不可撤销" },
                { "label": "操作人", "value": "当前用户" }
              ],
              "branches": [
                { "on": "onConfirm", "goto": "afterSubmit" },
                { "on": "onSkip", "goto": "afterSkip" }
              ]
            }
          ]
        },
        { "id": "afterSubmit", "blocks": [{ "type": "markdown", "content": "✅ 已提交签署，对方将收到通知邮件。" }] },
        { "id": "afterSkip", "blocks": [{ "type": "markdown", "content": "好的，已保留草稿，未提交。" }] }
      ]
    },
    {
      "id": "expense-filter",
      "title": "Q2 报销记录筛选",
      "trigger": { "type": "keyword", "patterns": ["报销"] },
      "entryNodeId": "clarify",
      "nodes": [
        {
          "id": "clarify",
          "blocks": [
            { "type": "markdown", "content": "筛选 Q2 报销记录前，我需要确认几个条件：" },
            {
              "type": "clarifyCard",
              "title": "筛选 Q2 报销记录",
              "fields": [
                { "key": "range", "label": "日期范围", "required": true, "options": [{ "value": "q2", "label": "4-6 月" }, { "value": "all", "label": "全部" }] },
                { "key": "category", "label": "报销类别", "allowOther": true, "options": [{ "value": "travel", "label": "出差" }, { "value": "meal", "label": "餐饮" }] }
              ],
              "branches": [
                { "on": "onSubmit", "goto": "result" },
                { "on": "onSkip", "goto": "skipped" }
              ]
            }
          ]
        },
        { "id": "result", "blocks": [{ "type": "markdown", "content": "已按条件筛选：{{range}} / {{category}}" }] },
        { "id": "skipped", "blocks": [{ "type": "markdown", "content": "好的，已跳过澄清，你可以随时重新提问。" }] }
      ]
    },
    {
      "id": "contract-risk-scan",
      "title": "合同风险扫描（思考执行过程演示）",
      "trigger": { "type": "keyword", "patterns": ["扫描风险", "审查一下这份合同"] },
      "entryNodeId": "scanning",
      "nodes": [
        {
          "id": "scanning",
          "blocks": [
            {
              "type": "taskProgress",
              "status": "thinking",
              "elapsedMs": 800,
              "tasks": [
                { "name": "解析合同结构", "status": "done" },
                { "name": "逐条比对风险条款库", "status": "running" },
                { "name": "生成风险摘要", "status": "pending" }
              ],
              "steps": [
                { "label": "正在读取文档", "detail": "供应商合作协议.docx", "delayMs": 0 },
                { "label": "正在比对第 3 条·违约金条款", "detail": "命中风险规则：比例超过 20%", "delayMs": 900 },
                { "label": "正在比对第 7 条·保密期限", "detail": "未命中风险规则", "delayMs": 1600 }
              ]
            },
            { "type": "markdown", "content": "扫描完成，发现 1 处高风险条款（第 3 条违约金比例）。", "delayMs": 2400 }
          ]
        }
      ]
    }
  ],
  "fallback": {
    "type": "markdown",
    "pool": ["已收到，这个我需要再确认一下。", "好的，我记下了，还有其他要补充的吗？"]
  }
}
```

**`taskProgress` 块字段说明**（对应 [task-progress.md](../../skills/pangea-design-ai/references/component-selection/task-progress.md) 的三层结构，剧本里原样复用组件已有的 props，不新增字段）：

| 字段 | 对应组件层级 | 说明 |
|---|---|---|
| `status` / `elapsedMs` | 状态层（必需） | `thinking` \| `calling-tool` \| `done` \| `error` |
| `tasks[]` | 任务层（非必须） | 长链路任务的有序列表，`status` 随剧本播放推进变化（引擎按 `steps` 的 `delayMs` 节奏同步更新对应 `tasks[].status`，具体映射规则留到实现阶段定） |
| `steps[]` | 执行层 | 渐进式 append，每条自带 `delayMs`（相对本块开始播放的偏移量，毫秒），引擎按时间顺序逐条把 `steps` 追加到界面上，而不是一次性全部渲染 |

后续 `markdown` 块的 `delayMs` 表示"整块内容"相对上一块的追加延时，用于表达"思考完成后才出结论"的节奏，和 `steps[].delayMs`（块内部逐条 append）是两级独立的延时控制，不要混用。

> **图状态机而非线性列表**：多数场景其实只有一层分支（确认/跳过各走一条路），图退化成很短的结构，不会显得复杂；但引擎按图设计，以后要表达"多轮追问""条件分支叠加"这类更复杂的演示时不用改架构。

## 5. 决策点（已确认）

| 决策点 | 确认值 | 备注 |
|---|---|---|
| ✅ 兜底回复 | `fallback.pool` 随机挑一句，而非固定 echo | 用户已确认采用建议方案。现在 demo 里的 `已收到："xxx"` 太机械，随机话术池更接近"轻量、不生硬"的产品感；池子为空则退回 echo |
| ✅ 剧本文件粒度 | **一个工程一份 `scenarios.json`**（数组），而非每场景一个文件 | 用户已确认采用建议方案。更方便"整体导入导出"（配合 website 的 JSON 导入导出需求），单场景编辑靠编辑器里的"场景列表"UI 做，不依赖文件系统粒度 |
| ✅ 思考执行过程 | `taskProgress` 块直接复用 `TaskProgress` 组件已有的 `status`/`tasks[]`/`steps[]` 三层字段，新增 `steps[].delayMs` 与块级 `delayMs` 两级独立节奏控制 | 见第 4 节场景三"合同风险扫描"示例；不新增组件层字段，只在剧本层加播放节奏 |
| 校验 | 新增 `scripts/check-scripts.mjs`，机检剧本 JSON 是否违反 design.md 硬约束 | 复用 G5/G6 的判断规则（字段数≤10、按钮数≤3、高风险字段完整性、fallback 唯一）；纳入 `npm run gate` |
| 变量插值失败时 | 未提交对应字段则 `{{fieldKey}}` 原样保留并在开发期 `console.warn` | 不静默吞掉，方便剧本作者发现拼写错误 |
| 多语言 | 暂不支持，剧本内容即最终展示文本 | 如需要多语言，属于独立议题，不在本轮方案范围 |

## 6. 引擎的落地形态（后续实现阶段再细化，先给方向）

- 新增 `agent-ui/script-engine/`（或独立的 `packages/script-engine`，取决于 [website 方案](./website-showcase.md) 里定的 monorepo 结构）：
  - `parseScript(json): Scenario[]` — 校验 + 归一化。
  - `matchTrigger(input, scenarios): Scenario | null` — 命中判断。
  - `<ScriptPlayer scenario={...} onFieldSubmit={...} />` — 按当前节点渲染 `blocks`，交互后按 `branches` 跳转节点，内部状态（当前节点、已提交字段值）自行管理，对外暴露"新增一条对话轮次"的回调，接入方式与现在 `Conversation.tsx` 里手写的分支逻辑等价，只是数据驱动。
- `mock/scenarios.json` 替代现在 `Conversation.tsx`/`ContractReview.tsx` 里的手写分支，两个脚手架的示例场景重写为该 JSON 的两个 `scenario` 条目。

## 7. 与需求规格化流程的衔接

`references/overview/requirement-intake.md` 里"核心场景与交互"一节已经要求描述"用户输入 → 响应形式 → 风险等级"，这份信息足够结构化，后续可以在该文档补一节"生成剧本 JSON 的映射规则"，让 agent 在需求确认后直接产出 `scenarios.json` 草稿，而不是先写 TSX 再抽象。**这一步仍未做**（本轮只完成了引擎本身与两个示例场景的迁移），留在下一轮迭代。

## 8. 实现备注（与本方案的差异，均为实现阶段的收敛，非推翻）

- **代码落地位置**：`packages/agent-ui/src/script-engine/`（不是独立的 `packages/script-engine`）——第 6 节提到"取决于 website 方案里定的 monorepo 结构"，workspaces 重构落地后答案是"放进 agent-ui 包"，因为剧本引擎依赖 agent-ui 的组件类型（`ClarifyField`/`ConfirmField`/`ArtifactSummary`/`ErrorScenario` 等直接 import 自组件文件），拆成独立包会引入不必要的包间依赖。
- **`fallback` 收敛为文档级独立结构，不是 `trigger.type` 的一种取值**：词汇表（第 3 节）里"`trigger.type`: keyword | regex | fallback"这条在实现时改为：`scenario.trigger.type` 只能是 `keyword` / `regex`，`fallback` 固定是 `ScriptDocument.fallback` 字段（与 `scenarios` 同级），未命中任何 scenario 时统一使用。语义不变，只是类型结构更简单、少一层"fallback 是不是也算一个 scenario"的歧义。
- **顶层版本字段名从 `$schemaVersion` 改为 `schemaVersion`**（不带 `$` 前缀）：纯技术原因（本地文件写入工具对 `$` 前缀 JSON key 有限制），字段语义不变。
- **`taskProgress` 块的 `tasks[].status` 不做"随 `steps` 播放自动推进"**：方案文档第 4 节表格里写"具体映射规则留到实现阶段定"，实现时决定**不做**自动映射——`tasks` 与 `steps` 是剧本作者分别声明的两组独立数据，播放时只对 `steps` 做渐进式 delay 揭示，`tasks[].status` 保持剧本里写的固定值。原因：自动推进需要额外的时间轴对齐规则（哪个 step 对应哪个 task 状态变化），复杂度收益不成正比，两个示例场景（合同风险扫描）改为直接把 `tasks` 全部写成 `done`，只用 `steps` 的 `delayMs` 做节奏演示。
- **未新增 `agent-ui/mention-popover`、`agent-ui/slash-popover`**：`Composer` 组件的 `@`/`/` 选择面板本身尚未实现（这是此前已知的待办，不属于本轮范围），因此剧本里没有涉及"能力选择"相关的块类型。
- **`branches` 校验为软约束（console.warn），不阻断渲染**：`parseScript`/`useScriptRuntime`/`scripts/check-scripts.mjs` 三处对"字段数超限""高风险缺字段""分支目标节点不存在"等问题只警告不报错，对齐组件层 `ClarifyCard`/`ConfirmCard` 已有的 `console.warn` 兜底哲学（mock 场景里"能跑起来但提示有问题"优先于"直接崩掉"）。
- **`scripts/check-scripts.mjs` 独立实现，不复用 `parse.ts` 的规则代码**：因为该脚本要在纯 Node（无 TS 编译）环境下跑、且属于 `skills/pangea-design-ai/scripts/`（面向 skill 消费者的机检工具）而非 `packages/agent-ui`（面向仓库内部开发），两处规则集当前是手动保持一致，未来规则变化需要两处都改（已记录在 PROJECT_CONTEXT.md 待办）。
- **两个脚手架的示例页面已改为剧本驱动**：`immersive-starter/src/pages/Conversation.tsx` 与 `copilot-starter/src/pages/ContractReview.tsx` 里原来的 `if (text.includes(...))` 分支全部移除，改为 `useScriptRuntime(scenarios) + <ScriptPlayer>`，剧本内容在各自的 `src/mock/scenarios.json`。

---

## 9. 修订：随 agent-layout 整合的两处变更（2026-08-27）

采纳 [agent-layout 作为沉浸式事实源](./agent-layout-integration.md) 后，本方案有两处修订。修订依据是该方案第 3 节新立的优先级原则：

> **agent 生成能力是主用途，website 在线编辑是次要用途。两者冲突时牺牲 website 的便利性，不牺牲生成能力。**

### 9.1 从「JSON 唯一格式」改为「引擎接受对象，TS / JSON 双数据源」

原方案（第 3、4 节）把 JSON 定为唯一剧本格式，理由是"要能被 website 编辑器表单化读写"。这个判断对**终端用户**成立——解析在加载边界做一次，下游组件与那条 6 层 `onOpenArtifact` prop 链完全不动，用户无感知。

但对 **agent 生成代码**明确更差：

| | TS 场景数据 | JSON 场景数据 |
|---|---|---|
| 字段写错 | `tsc` 立刻报错 | 静默，要跑 `check-scripts.mjs` 才发现 |
| 产物引用写错 | 常量名找不到 → 编译错 | 字符串 id 拼错 → 运行时才发现 |
| 编写时 | IDE 补全 + 类型提示 | 无 |
| 简写 | `completed(id, title, detail)` 等 helper | 全部展开为字面量，更啰嗦 |

因此改为双数据源，引擎只认解析后的类型：

```
引擎签名：ConversationScene[]        ← 只认这个类型，不关心来源

TS 路径（agent 生成时默认走这条）
  scenes.ts   export const scenes: ConversationScene[] = [...]      ← 完整类型检查

JSON 路径（website 编辑器产出 / 消费）
  scenarios.json + resolveTargets()  →  ConversationScene[]         ← id 字符串换成对象
```

**不需要 TS↔JSON 转换器**，只需要引擎支持"传对象进来"这一件事，加上 JSON 路径的 `resolveTargets()`。编辑器导出的 JSON 也能被脚手架直接 `import`。

有利事实：agent-layout **已经在用字符串引用**（`expert: "差旅助手"` 由 `resource-visuals.tsx` 解析成头像组件，`icon-registry.ts` 同理），所以"字符串 id + 注册表解析"是该项目既定模式，产物 `target` 改成同一写法反而更一致，不是引入新范式。

### 9.2 数据模型对齐 agent-layout，不再自成一套

原方案第 3 节的词汇表与第 4 节的 7 种块类型（`markdown` / `taskProgress` / `clarifyCard` / `confirmCard` / `artifactCard` / `errorState` / `followUp`）是针对一期那 9 个自研组件设计的。agent-layout 的数据模型更成熟且已被实现验证，应以它为准：

| 一期块类型 | agent-layout 对应 | 说明 |
|---|---|---|
| `taskProgress`（三层字段挤在一个块里） | `ExecutionData`（L1）+ `ExecutionTaskData`（L2）+ `ExecutionStepData`（L3）+ `ExecutionActionData`（8 类动作 Badge）+ `ReasoningData`（深度思考） | agent-layout 拆得更细且有严格判定规则，一期的单块结构表达力不足 |
| `clarifyCard` | `ClarificationFormData` + `ClarificationField`（text / textarea / date-range / single-select / multi-select）+ `followUp` | agent-layout 多了日期范围、提交转只读、续流程 |
| `artifactCard` | `MessageAttachment` / `AssistantAttachment` + `ArtifactTarget` | agent-layout 区分用户附件与智能体交付物，且强制交付物必须带可打开目标 |
| `markdown` | `AssistantMessageData.content` + `[[类型:名称]]` 内联标记 | agent-layout 支持气泡内内联标签 |
| `confirmCard` / `errorState` / `followUp` | **无对应** | 这三个是 V1.4 缺口，需在 Base UI 上新建，见整合方案第 1 节 |

**剧本"触发"机制的处置**：agent-layout 是预写完整场景（`chat-1`…`chat-5`，从侧栏选择）+ 一处运行时续流程；一期引擎是关键词触发 + 节点图分支。两者不冲突，可叠加——保留 `matchTrigger` 作为"用户自由输入时的响应机制"，同时保留 agent-layout 的预写场景作为"侧栏可选的完整用例"。`match.ts` / `interpolate.ts` / `parse.ts` 的逻辑因此大部分可以留用。

### 9.3 受影响的一期代码

| 文件 | 处置 |
|---|---|
| `script-engine/match.ts` | 保留（触发匹配与渲染无关） |
| `script-engine/interpolate.ts` | 保留（变量插值与渲染无关） |
| `script-engine/parse.ts` | 保留规则集，校验目标改为 agent-layout 数据模型 |
| `script-engine/types.ts` | 重写，改为复用 `conversation-data.ts` 的类型 |
| `script-engine/runtime.ts` | 重构，与"预写场景 + 运行时续流程"模型对齐 |
| `script-engine/script-player.tsx` | 重写，渲染目标改为 agent-layout 组件树 |
| `scripts/check-scripts.mjs` | 适配新数据模型 |
| 两套脚手架的 `scenarios.json` | immersive 的被 agent-layout 场景替换；copilot 的保留 |

### 9.3 Phase 5 实施结果（2026-09-03）

- `script-engine/types.ts` 已改为富 `ConversationScene<TTarget>[]` 契约，包含执行层级、澄清、附件、产品块以及显式 `awaitingApproval`/`approvalOutcomes`；共享层不引用沉浸式 `ArtifactTarget`、panel 或 Copilot canvas。
- `resolveTargets()` 是 JSON 唯一的加载边界：JSON 使用 `targetId`，消费者传入自己的目标注册表；缺少注册项会抛出明确错误。TS 场景不经过该转换，保留 IDE 补全和 `tsc` 字段检查。
- `ScriptPlayer` 已改为 renderer-neutral bridge，由 rich `ConversationFlow` 或其它产品 renderer 消费 resolved scene；不再维护旧七块的平行消息 UI。
- `check-scripts.mjs` 会将 `agent-layout/scenes.ts` 识别为 TS 路径并交由 `tsc` 验证，同时保留对一期 `scenarios.json` 的兼容校验。`chat-5` 的 1.1s/1.4s 澄清续流程仍是 rich renderer 的交互实现，未在本 Phase 强行数据化。
