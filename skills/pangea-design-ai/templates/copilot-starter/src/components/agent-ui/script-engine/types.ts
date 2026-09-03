import type { ClarifyField } from '../clarify-card'
import type { ConfirmField } from '../confirm-card'
import type { ArtifactSummary } from '../artifact-card'
import type { ErrorScenario, RecoveryAction } from '../error-state'

/**
 * Mock 对话剧本引擎 — 类型定义。
 * 对应方案文档：docs/proposals/mock-script-engine.md
 *
 * 设计原则（不要破坏）：
 * - 块类型一一对应 agent-ui 已有的 9 个组件，不发明新组件；字段尽量复用组件 Props 的类型定义
 *   （直接 import 组件文件里的类型），保证"剧本能表达的内容上限 = 组件能力上限"这条硬约束。
 * - fallback 是文档级别的独立结构（不是某个 scenario 的 trigger），与方案文档词汇表里
 *   "trigger.type 可以是 fallback" 的描述略有出入——实现时收敛为更简单的两级结构：
 *   scenario.trigger 只能是 keyword/regex，未命中任何 scenario 时统一走文档级 fallback。
 *   这是实现阶段的收敛，不是对已确认方案的推翻，已同步记录在 PROJECT_CONTEXT.md。
 * - 顶层版本字段命名为 schemaVersion（不带 $ 前缀），与方案文档 JSON 示例里的 "$schemaVersion"
 *   有一处字符差异——纯粹是实现时为避免 JSON 文件写入工具对 $ 前缀 key 的限制，字段语义不变，
 *   同样记录在 PROJECT_CONTEXT.md，不影响其它约定。
 */

export type ScriptBranchOn = 'onSubmit' | 'onSkip' | 'onConfirm' | 'onReset'

export interface ScriptBranch {
  /** 触发这条分支的用户操作。 */
  on: ScriptBranchOn
  /** 跳转到的目标节点 id。 */
  goto: string
}

/** Markdown 块——对应 MessageBubble（role="assistant"）里的纯文本内容。 */
export interface MarkdownBlock {
  type: 'markdown'
  content: string
  /** 相对上一个块的追加延时（毫秒），用于表达"思考完成后才出结论"的节奏。 */
  delayMs?: number
}

/** 任务过程块——对应 TaskProgress 组件，三层结构原样复用组件已有字段。 */
export interface TaskProgressBlock {
  type: 'taskProgress'
  status: 'thinking' | 'calling-tool' | 'done' | 'error'
  elapsedMs?: number
  tasks?: { name: string; status: 'pending' | 'running' | 'done' | 'error' }[]
  /** 执行层，每条自带 delayMs（相对本块开始播放的偏移量，毫秒），渐进式 append。 */
  steps?: { label: string; detail?: string; delayMs?: number }[]
  delayMs?: number
}

/** 澄清卡片块——对应 ClarifyCard 组件。 */
export interface ClarifyCardBlock {
  type: 'clarifyCard'
  title: string
  fields: ClarifyField[]
  /** 提交/跳过后的跳转分支。 */
  branches?: ScriptBranch[]
  delayMs?: number
}

/** 确认卡片块——对应 ConfirmCard 组件。 */
export interface ConfirmCardBlock {
  type: 'confirmCard'
  riskLevel: 'medium' | 'high'
  question: string
  fields?: ConfirmField[]
  branches?: ScriptBranch[]
  delayMs?: number
}

/** 制品卡片块——对应 ArtifactCard 组件。 */
export interface ArtifactCardBlock {
  type: 'artifactCard'
  artifact: ArtifactSummary
  delayMs?: number
}

/** 异常状态块——对应 ErrorState 组件。 */
export interface ErrorStateBlock {
  type: 'errorState'
  scenario: ErrorScenario
  message?: string
  recoveryActions: RecoveryAction[]
  technicalDetail?: string
  completedSteps?: string[]
  failedSteps?: string[]
  delayMs?: number
}

/** 后续引导块——对应 FollowUpSuggestions 组件。 */
export interface FollowUpBlock {
  type: 'followUp'
  suggestions: string[]
  delayMs?: number
}

export type ScriptBlock =
  | MarkdownBlock
  | TaskProgressBlock
  | ClarifyCardBlock
  | ConfirmCardBlock
  | ArtifactCardBlock
  | ErrorStateBlock
  | FollowUpBlock

export interface ScriptNode {
  id: string
  blocks: ScriptBlock[]
}

export interface ScenarioTrigger {
  type: 'keyword' | 'regex'
  patterns: string[]
}

export interface Scenario {
  id: string
  title: string
  trigger: ScenarioTrigger
  entryNodeId: string
  nodes: ScriptNode[]
}

export interface ScriptFallback {
  type: 'markdown'
  pool: string[]
}

export interface ScriptDocument {
  schemaVersion: string
  scenarios: Scenario[]
  fallback?: ScriptFallback
}
