# Phase 4：交互式对话卡片实施计划

## 目标

在当前 Base UI 分层架构中实现 `ConfirmCard`、`ErrorState` 与 `FollowUpSuggestions`，并以**中立产品块事件回写契约**连接 shared conversation、沉浸式 rich flow 与 Copilot 左侧画布。补齐该链路直接涉及的键盘、状态播报与 44px 触控目标约束。

## 实施结果（2026-09-03，批次 A–C 已完成）

- `packages/agent-ui/src/conversation/` 已公开 `ConfirmCard`、`ErrorState`、`FollowUpSuggestions`，并以 `ProductBlockAction` / `ProductBlockContext.onAction` 将确认、恢复和建议选择回写给消费者。卡片只表达用户意图；没有后端持久化、真实重试、权限申请、审计或人工接管承诺。
- `ConfirmCard` 已按 Pangea AI Components 的 Alert 确认态收敛为标题、说明与右对齐操作；`FollowUpSuggestions` 已与选中专家后的推荐列表统一为完整指令的纵向行，并以 `ArrowDownLeft` 指向下方 Composer。
- immersive 的 `product-block-renderer.tsx` 校验本地 `data` 并适配 shared 卡片；rich `ConversationFlow` 拥有本地 action 结果和单一 polite `role="log"` 反馈。`ConversationPage` 消费 follow-up action 后，将选择的 `content` 回填到 Composer；用户发送后会追加本地 `sentMessages` 并隐藏历史回复中的 follow-up，仍不触发真实请求或业务执行。
- Copilot `ContractReview` 用 shared `payload` renderer 复用 ConfirmCard；`onProductBlockAction` 与交付物均经 `routeArtifact` 更新左侧画布，不引入沉浸式 panel/Tab。immersive local renderer 与 shared/Copilot renderer 的 block 数据和 context 不可互换。
- 组件 API 文档、扩展地图、工程结构、方案和治理记录已回填。`actionStatus` 为可选消费者状态，当前 active renderer 尚未传入；“仅完成轮次显示 follow-up”仍须由 scene/renderer 策略保证。

## 已确认决策

- 三张卡片在 `packages/agent-ui/src/conversation/` 以 Base UI 重写；历史 `packages/agent-ui/src/{confirm-card,error-state,follow-up-suggestions}.tsx` 是废弃 Radix 残留，不参与实现、导出或同步。
- shared `ProductBlockContext` 新增中立 `onAction(event)`；卡片仅派发描述用户意图的结构化事件，不自行宣称操作成功、重试成功或已持久化。
- immersive 将事件接入 rich `ConversationFlow` 的私有回复插槽和本地会话状态；Copilot 通过 shared `renderProductBlock` 复用卡片，产物仍只以 `routeArtifact(target)` 更新左侧工作画布。
- shared 继续不包含 `PanelView`、`PanelTab`、`ImageView`、Canvas 或业务壳层状态。
- 本阶段只实现可验证的纯前端演示回写；不承诺后端审计、真实权限申请、幂等重试或人工接管服务。

## 数据与事件契约

在 `packages/agent-ui/src/conversation/types.ts` 增加：

- `ProductBlockAction`：带 `blockId`、`type` 与中立 payload 的判别事件；至少覆盖确认决定、错误恢复动作、后续建议发送。
- `ProductBlockActionHandler`：`(action: ProductBlockAction) => void`。
- `ProductBlockContext.onAction`：由 shared / rich flow 调用，保持 `turnId`、`isLatestTurn`、`openArtifact` 等现有中立字段。
- 三类 block payload 的最小判别类型：确认风险/字段/选项，七种异常状态与恢复动作，2–4 条建议。业务方可用既有 `ProductConversationBlock` 的 `payload` 承载其内容，但实际卡片 props 必须用明确类型解析，不从 `unknown` 直接渲染。

## 实施批次

### 批次 A：共享契约与 Base UI 卡片

1. 在 `packages/agent-ui/src/conversation/` 新建 Base UI 实现：
   - `confirm-card.tsx`
   - `error-state.tsx`
   - `follow-up-suggestions.tsx`
2. 更新 `types.ts`、`conversation-flow.tsx`、`index.ts`，将 `onAction` 安全透传到 `renderProductBlock(block, context)`。
3. 约束：
   - ConfirmCard：字段 ≤10、按钮 ≤3、唯一 primary；高风险必须要求对象/动作/影响范围/后果/操作人五项。
   - ErrorState：七种异常状态均以事实、影响和恢复下一步的文本表达，不能只用颜色或图标。
   - FollowUpSuggestions：仅接受 2–4 条具体建议；选择后派发同一中立事件。
   - 所有核心操作为键盘 button、可访问名称明确、触控命中区至少 44px；卡片动作结果通过一个可控 polite live region 播报，不嵌套重复历史消息播报。
4. 运行 package 类型检查与同步差异检查。

### 批次 B：沉浸式 rich flow 适配

1. 在 `conversation-data.ts` 定义与示例场景相邻的产品块数据，提供至少：中风险确认、错误恢复、合法后续建议的演示。
2. 在 `conversation-flow.tsx` 的既有产品块插槽接入 renderer，确认/恢复/建议动作都由 rich flow 状态拥有并回写为可见结果；不得在卡片内持有业务完成态。
3. 保持产品块位置：assistant 正文/附件/澄清之后、续流程之前。
4. 为新增 assistant 结果提供单一 `role="log" aria-live="polite"` 播报边界，避免整段历史重复朗读。
5. 不在 `ConversationPage` 新建平行消息结构；不把本地 Panel/Image adapter 加入 shared 数据。
6. 运行 immersive gate、手工检查宽屏/侧栏收起/约 700px/<659px 与键盘流程。

### 批次 C：Copilot 复用与文档/治理

1. 在 `ContractReview.tsx` 通过 `renderProductBlock` 复用 shared 卡片；当前确认 action 产生的交付物仍经 `setArtifact` / `routeArtifact` 更新左侧工作区。后续增加错误/建议 renderer 时必须按 action 语义映射，不能把所有 action 当合同决定。
2. 不引入沉浸式 `ArtifactPanel` 或右侧 Tab。
3. 将三个 planned 文档转换为真实 API 文档：更新 source、exported、事实源、状态、扩展方式与 action 回写边界。
4. 更新组件索引、extension map、project structure、Phase 4 方案、`PROJECT_CONTEXT.md`、`CHANGELOG.md`；按真实日期刷新台账。
5. 若类型/文档结构变化，确保 `check-component-docs.mjs` 和 root gate 仍通过；不扩大 catalog generator 职责。

## 验收与验证

```bash
npm run check:agent-ui-types
npm run sync:agent-ui
npm run check:agent-ui-drift
npm run check:component-docs
npm run gate
git diff --check
git status -sb
```

额外人工核验：

- 中风险确认：确认与取消均写回真实后续文本，未暗示未执行的写操作成功。
- 高风险确认：五项字段缺失时不进入确认执行路径。
- 七种错误均有事实、影响和下一步，且动作不只靠颜色。
- 后续建议仅在完成轮次显示、数量 2–4；等待回复、执行中、待确认和待恢复时不显示。
- Tab / Enter / Space 可以完成卡片核心操作；焦点可见；亮暗两套采用语义 token；核心触控目标 ≥44px。
- immersive 维持 7 条既有 Oxlint warning 与 bundle 提示；Copilot 维持 4 条既有 Fast Refresh warning；不得新增 warning。

## 非目标

- 不接后端、鉴权、持久化、真实重试、权限申请、审计或人工接管服务。
- 不重构剧本引擎；其新数据模型适配留给 Phase 5。
- 不迁移完整 immersive AgentApp 壳层进 package。
- 不创建 commit 或 push。

## 补充实施结果：报表高风险审批演示（2026-09-03）

- 置顶 `pinned-1` 改为“符号建议 → 是否调整报表 → 用户‘可以’后写入前审批”三轮；第一轮不再渲染确认卡。
- 审批待决是沉浸式壳层会话状态：`AgentShell` 更新 `Conversation.approvalStatus`，`ConversationPage` 将其传入 rich Flow 与 Composer。shared ConfirmCard 只继续回传中立决定。
- `awaitingApproval` 的当前轮在执行过程与回复文字之间显示 destructive 语义的“需要你的批准”；高风险卡包含对象、动作、影响范围、后果和操作人五字段。
- pending 时 Composer 禁止编辑、上下文/能力、上传、连接器、录音与发送，侧栏显示 `bg-destructive-bg` / `text-destructive-foreground` 的“等待批准”。批准或拒绝后解除禁用、移除标签，并按场景数据添加本地演示的执行与结果消息。
