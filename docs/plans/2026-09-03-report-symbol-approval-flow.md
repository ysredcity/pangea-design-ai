# Report Symbol Approval Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将置顶“报表符号”示例改为三轮高风险审批流程，并让确认待决状态统一驱动输入禁用、审批提示和侧栏标签。

**Architecture:** 审批状态由 `AgentShell` 持有并写回 `Conversation` 元数据；沉浸式 `ConversationFlow` 仅根据显式场景字段渲染审批提示、确认卡和已批准/已拒绝的后续轮次。富 Composer 接收受控 `disabled`，不把沉浸式审批策略泄漏到 shared conversation 包。

**Tech Stack:** React 19、TypeScript、Tailwind CSS v4、shadcn Base UI。

---

### Task 1: 定义场景与会话审批状态

**Files:**
- Modify: `skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/conversation-data.ts`
- Modify: `skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/sidebar.tsx`

**Step 1:** 为 rich turn 定义显式 `awaitingApproval` 与批准/拒绝后的执行和回复数据；将 `pinned-1` 改为首次建议、调整询问、用户“可以”后的高风险写入确认三轮。

**Step 2:** 为 `Conversation` 增加审批状态，并为 pending 会话渲染 destructive 语义的“等待批准”文字标签。

### Task 2: 将审批状态接入沉浸式 Flow 与 Composer

**Files:**
- Modify: `skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx`
- Modify: `skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/composer.tsx`

**Step 1:** 由 Flow 的显式审批状态决定确认卡、过程与回复之间的“需要你的审批”提示，以及批准/拒绝后的后续 AgentResponseBlock。

**Step 2:** 增加 Composer `disabled` 契约，禁用编辑、输入菜单、上传、连接器、录音和提交，且保留可访问语义。

### Task 3: 由壳层拥有审批结果

**Files:**
- Modify: `skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/conversation-page.tsx`
- Modify: `skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/chat-workspace.tsx`
- Modify: `skills/pangea-design-ai/templates/immersive-starter/src/components/agent-layout/agent-shell.tsx`

**Step 1:** 将确认 action 从页面上抛给 AgentShell，并映射为 approved/rejected 会话状态。

**Step 2:** 将 pending 状态同时传给 Flow 和 Composer；批准或拒绝后取消标签与禁用并显示相应后续过程/消息。

### Task 4: 回填文档与验证

**Files:**
- Modify: `skills/pangea-design-ai/references/components/conversation/conversation-flow.md`
- Modify: `skills/pangea-design-ai/references/components/delegation/composer.md`
- Modify: `skills/pangea-design-ai/references/components/shell/agent-sidebar.md`
- Modify: `docs/plans/2026-09-03-phase-4-interactive-conversation-cards.md`
- Modify: `PROJECT_CONTEXT.md`
- Modify: `CHANGELOG.md`

**Step 1:** 记录审批状态归属、禁用边界、语义提示与侧栏状态规则。

**Step 2:** 运行 `npm run gate`、`git diff --check` 与 `git status -sb`，确认无新增 warning 或模板漂移。
