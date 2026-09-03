export type ExecutionStatus = "completed" | "running" | "waiting"
import type { ConfirmBlockPayload, FollowUpSuggestionsPayload } from "@/agent-ui/conversation"
import { agentGuidelineFile, automationScreenshotImage, brandFinancialSearch, coffeeIndustryResearchReport, coffeeKeywordSearch, coffeeMarketSearch, coffeeReportFile, coffeeStatsPage, deviceScreenshotImage, freshDrinkWhitepaperFile, googleHomeSearch, homeScreenshotImage, luckinFinancialFile, meetingNotesFile, mijiaErrorSearch, reportIconSearch, taskListFile, wcagFeedbackSearch } from "./panel-data"
import type { ArtifactTarget } from "./panel-types"

export type ExecutionActionData = {
  label: string
  type: "skill" | "api" | "query" | "script" | "file" | "connector" | "knowledge" | "web"
  target?: ArtifactTarget
}

export type ReasoningData = {
  id: string
  content: string
  running?: boolean
}

export type ExecutionStepData = {
  id: string
  title: string
  detail?: string
  status: "completed" | "running" | "pending"
  actions?: ExecutionActionData[]
  reasoning?: ReasoningData
}

export type ExecutionTaskData = {
  id: string
  title: string
  summary: string
  status: "completed" | "running"
  steps: ExecutionStepData[]
}

export type ExecutionData = {
  status: ExecutionStatus
  summary: string
  duration?: string
  showSummary?: boolean
  flat?: boolean
  steps: ExecutionStepData[]
  reasoning?: ReasoningData
  tasks?: ExecutionTaskData[]
}

/** 用户消息里的本地上传文件，渲染为可打开右侧预览的独立 Attachment */
export type MessageAttachment = { id: string; name: string; size: number; target?: ArtifactTarget }

/** 智能体交付物附件必须带可打开的预览目标。 */
export type AssistantAttachment = MessageAttachment & { target: ArtifactTarget }

export type ClarificationOption = { label: string; value: string }
export type ClarificationFieldValue = string | string[] | { end: string; start: string }

export type ClarificationField =
  | { id: string; label: string; placeholder?: string; required?: boolean; type: "text" | "textarea" }
  | { id: string; label: string; required?: boolean; type: "date-range" }
  | { id: string; label: string; required?: boolean; type: "single-select" | "multi-select"; options: ClarificationOption[] }

export type ClarificationFollowUpData = {
  assistant: AssistantMessageData & { kind: "question" }
  execution: ExecutionData
  id: string
}

/** 智能体向用户补齐关键信息时推送的结构化表单。 */
export type ClarificationFormData = {
  defaultOpen?: boolean
  description?: string
  fields: ClarificationField[]
  followUp?: ClarificationFollowUpData
  id: string
  initialValues?: Record<string, ClarificationFieldValue>
  submitLabel?: string
  title: string
}

/** 产品自定义对话块的中立数据载体；具体渲染由应用配置提供。 */
export type ProductConversationBlock = {
  id: string
  type: string
  data?: unknown
}

export type AssistantMessageData = {
  attachments?: AssistantAttachment[]
  clarification?: ClarificationFormData
  content: string
  timestamp: string
  kind?: "answer" | "question"
}

/** 未指定专家时，智能体侧显示的产品身份 */
export const DEFAULT_AGENT_NAME = "智能助手"

export type ApprovalOutcomeData = {
  execution: ExecutionData
  assistant: AssistantMessageData
}

export type ConversationTurnData = {
  id: string
  /** 确认待决时，rich Flow 以会话状态驱动审批提示、卡片和 Composer 禁用。 */
  awaitingApproval?: boolean
  approvalOutcomes?: {
    approved: ApprovalOutcomeData
    rejected: ApprovalOutcomeData
  }
  /**
   * 这一轮由哪个专家执行。等于指定了子智能体，因此显示在智能体消息开头，
   * 而不是用户消息上；缺省时显示产品身份 `DEFAULT_AGENT_NAME`。
   */
  expert?: string
  user: {
    /** 可内联的上下文与能力写成 `[[类型:名称]]` 标记，渲染为气泡内的 badge */
    content: string
    attachments?: MessageAttachment[]
    timestamp?: string
  }
  execution: ExecutionData
  assistant?: AssistantMessageData
  productBlock?: ProductConversationBlock
}

/** 生成与场景数据一致的时间戳格式，用于新发送的消息 */
export function formatTimestamp(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${pad(date.getMonth() + 1)}月${pad(date.getDate())}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export type ConversationScene = { turns: ConversationTurnData[] }

const completed = (id: string, title: string, detail?: string): ExecutionStepData => ({ id, title, detail, status: "completed" })

const reportSymbolConfirmation = {
  id: "report-symbol-confirmation",
  type: "confirm-card",
  data: {
    riskLevel: "high",
    question: "允许编辑《2026年经营分析月报.xlsx》，将其调整为仪表盘表达吗？",
    description: "写入后会更新报表标题、指标区和图表语义，原始数据与计算逻辑不会改变。",
    fields: [
      { key: "object", label: "操作对象", value: "2026年经营分析月报.xlsx" },
      { key: "action", label: "执行动作", value: "写入仪表盘标题、指标区与图表表达" },
      { key: "impact-scope", label: "影响范围", value: "经营分析月报的展示层与图表配置" },
      { key: "consequence", label: "操作后果", value: "现有报表视觉表达会被修改，可通过版本记录回退" },
      { key: "operator", label: "操作人", value: "智能助手（代表当前用户执行）" },
    ],
    actions: [
      { id: "reject-report-write", label: "拒绝", decision: "cancel", tone: "secondary" },
      { id: "approve-report-write", label: "允许", decision: "confirm", tone: "primary" },
    ],
  } satisfies ConfirmBlockPayload,
} satisfies ProductConversationBlock

const coffeeReportFollowUps = {
  id: "coffee-report-follow-ups",
  type: "follow-up-suggestions",
  data: {
    suggestions: [
      { id: "compare-brands", label: "对比头部品牌策略", content: "请基于这份报告对比瑞幸、星巴克与库迪的新品策略。" },
      { id: "test-plan", label: "生成区域测试方案", content: "请把报告中的机会点整理成新品区域测试方案。" },
      { id: "executive-summary", label: "提炼管理层摘要", content: "请将这份行业调研报告整理成面向管理层的三页摘要。" },
    ],
  } satisfies FollowUpSuggestionsPayload,
} satisfies ProductConversationBlock

export const conversationScenes: Record<string, ConversationScene> = {
  "pinned-1": { turns: [
    {
      id: "p1-1",
      user: { content: "如果用一个符号元素形容报表，应该用什么最形象？", timestamp: "08月31日 10:11" },
      execution: {
        status: "completed", summary: "已比较报表相关符号的语义和辨识度", duration: "18秒", showSummary: false, flat: true,
        steps: [
          { ...completed("p1-s1", "检索常见的数据产品图形隐喻", "重点比较图表、表格、仪表盘和文档四类符号"), actions: [{ label: "检索 报表图标语义", type: "knowledge", target: reportIconSearch }, { label: "查询 Lucide 图标库", type: "api" }] },
          { ...completed("p1-s2", "比较候选符号的小尺寸辨识度", "对候选图标进行 16px 小尺寸渲染和语义一致性检查"), actions: [{ label: "执行脚本 图标尺寸对比", type: "script" }, { label: "调用技能 图形语义分析", type: "skill" }] },
        ],
      },
      assistant: { content: "最形象的是「仪表盘」符号。它同时表达了数据汇总、指标监控和决策洞察，比单独的柱状图更能代表完整报表。如果强调数据分析，可选 BarChart3；强调经营驾驶舱，则更适合 Gauge。", timestamp: "08月31日 10:12" },
    },
    {
      id: "p1-2",
      user: { content: "那就用仪表盘吧，能帮我把报表也调整到位吗？", timestamp: "08月31日 10:13" },
      execution: {
        status: "completed", summary: "已确认仪表盘表达适用于当前报表", duration: "9秒", showSummary: false, flat: true,
        steps: [
          { ...completed("p1-s3", "检查报表的现有结构与可编辑范围", "已定位仪表盘标题、指标区和数据图表的关联位置"), actions: [{ label: "读取 经营分析月报", type: "file" }, { label: "调用技能 报表结构分析", type: "skill" }] },
          { ...completed("p1-s4", "评估仪表盘表达的调整范围", "调整会统一标题、指标区与图表语义，不改变报表原始数据"), actions: [{ label: "执行脚本 报表样式影响分析", type: "script" }] },
        ],
      },
      assistant: { content: "可以。我会将报表的标题、指标区和图表表达统一为“经营驾驶舱”的仪表盘语义，同时保留现有数据和计算逻辑。是否现在帮你完成这项调整？", timestamp: "08月31日 10:14", kind: "question" },
    },
    {
      id: "p1-3",
      awaitingApproval: true,
      user: { content: "可以", timestamp: "08月31日 10:15" },
      execution: {
        status: "completed", summary: "已准备报表调整方案，写入前需要审批", duration: "22秒", showSummary: false, flat: true,
        steps: [
          { ...completed("p1-s5", "读取报表上下文与数据范围", "已核对现有指标、图表及其计算引用关系"), actions: [{ label: "读取 2026年经营分析月报.xlsx", type: "file" }, { label: "调用连接器 企业知识库", type: "connector" }] },
          { ...completed("p1-s6", "调用报表规范与可视化能力生成调整方案", "已生成仪表盘标题、指标区和图表语义的变更草案"), actions: [{ label: "调用技能 数据可视化", type: "skill" }, { label: "执行脚本 报表样式预检查", type: "script" }] },
          completed("p1-s7", "识别文件写入操作的影响范围", "此操作将编辑现有报表文件，需要你的明确批准后才能写入"),
        ],
      },
      assistant: { content: "调整方案已经准备完成。下一步会编辑现有报表文件并写入仪表盘表达，这属于高风险写入操作；请核对下方信息后决定是否允许。", timestamp: "08月31日 10:16" },
      productBlock: reportSymbolConfirmation,
      approvalOutcomes: {
        approved: {
          execution: {
            status: "completed", summary: "已获得批准并完成报表写入", duration: "16秒", showSummary: false, flat: true,
            steps: [
              { ...completed("p1-approved-s1", "写入仪表盘标题、指标区与图表表达", "已保留原始数据、计算逻辑和报表结构"), actions: [{ label: "执行脚本 应用报表样式变更", type: "script" }] },
              completed("p1-approved-s2", "校验写入结果", "已完成公式引用、图表显示和文件完整性检查"),
            ],
          },
          assistant: { content: "已获得你的批准，报表已调整为仪表盘表达。原始数据与计算逻辑保持不变，标题、指标区和图表语义已统一为经营驾驶舱视图。", timestamp: "08月31日 10:17" },
        },
        rejected: {
          execution: {
            status: "completed", summary: "已取消报表写入", duration: "刚刚", showSummary: false, flat: true,
            steps: [completed("p1-rejected-s1", "保留现有报表文件", "未写入任何内容，原始报表保持不变")],
          },
          assistant: { content: "已取消写入，报表未作任何修改。你仍可继续讨论仪表盘表达方案，或在准备好后再次发起调整。", timestamp: "08月31日 10:17" },
        },
      },
    },
  ] },
  "chat-1": { turns: [
    { id: "c1-1", user: { content: "帮我写个行业调研报告吧", timestamp: "08月30日 15:19" }, execution: { status: "completed", summary: "已识别需求中缺少的关键调研范围", duration: "18秒", flat: true, steps: [{ ...completed("c1-s1", "检查行业调研所需的输入信息", "检查行业调研所需的输入信息"), actions: [{ label: "调用技能 需求澄清", type: "skill" }] }, completed("c1-s2", "整理需要向用户确认的问题", "需要补充行业、市场范围、时间跨度和报告用途") ] }, assistant: { content: "没问题。为了让报告更有针对性，请告诉我行业、目标市场、时间范围，以及报告主要用于内部决策、融资还是市场进入。", timestamp: "08月30日 15:20", kind: "question" } },
    { id: "c1-2", user: { content: "用 [[技能:深度研究]] 调研中国现制咖啡行业，重点看 2024—2026 年的竞争格局和消费趋势，用于新品规划。", timestamp: "08月30日 15:21" }, execution: { status: "completed", summary: "已完成行业调研并输出新品规划 HTML 报告", duration: "4分08秒", reasoning: { id: "c1-r1", content: "这是一个涉及市场规模、品牌竞争和消费趋势的长链路研究任务。需要先拆分研究维度，再交叉验证行业报告、企业财报与公开经营数据，最后将结论映射到新品规划场景，并整理为可交付的 HTML 调研报告。" }, steps: [], tasks: [
      { id: "c1-task-market", title: "汇总 2024—2026 年市场数据", summary: "已完成行业规模、增速和门店数量的交叉验证", status: "completed", steps: [
        { ...completed("c1-market-1", "检索行业规模与增长数据", "覆盖公开研究报告、统计数据和行业资讯"), actions: [{ label: "检索 中国现制咖啡市场规模", type: "knowledge", target: coffeeMarketSearch }, { label: "浏览 国家统计局行业数据", type: "web", target: coffeeStatsPage }, { label: "查询行业数据库", type: "api" }] },
        { ...completed("c1-market-2", "读取并核对核心报告", "对不同来源的统计口径进行统一"), actions: [{ label: "已读取 2025 咖啡行业报告", type: "file", target: coffeeReportFile }, { label: "已读取 现制饮品消费趋势白皮书", type: "file", target: freshDrinkWhitepaperFile }, { label: "执行脚本 数据口径校准", type: "script" }] },
      ] },
      { id: "c1-task-competition", title: "分析主要品牌竞争格局", summary: "已对比瑞幸、星巴克、库迪等品牌的经营策略", status: "completed", steps: [
        { ...completed("c1-competition-1", "获取头部品牌经营数据", "整理门店、价格带、上新频次与重点市场"), actions: [{ label: "调用接口 品牌经营数据", type: "api" }, { label: "检索 品牌季度财报", type: "knowledge", target: brandFinancialSearch }, { label: "已读取 瑞幸 2025Q2 财报", type: "file", target: luckinFinancialFile }] },
        { ...completed("c1-competition-2", "生成品牌竞争矩阵"), actions: [{ label: "执行脚本 品牌指标标准化", type: "script" }, { label: "执行脚本 竞争矩阵聚类", type: "script" }, { label: "调用技能 竞品分析", type: "skill" }] },
      ] },
      { id: "c1-task-opportunity", title: "提炼新品规划机会点", summary: "已形成风味、价格、功能和消费场景四类建议", status: "completed", steps: [
        { ...completed("c1-opportunity-1", "归纳消费趋势与高潜需求"), actions: [{ label: "检索 咖啡消费关键词", type: "knowledge", target: coffeeKeywordSearch }, { label: "调用接口 社媒趋势数据", type: "api" }, { label: "执行脚本 趋势聚类分析", type: "script" }] },
        { ...completed("c1-opportunity-2", "将趋势映射为新品方向", "结合目标人群、饮用时段和渠道约束生成建议"), actions: [{ label: "调用技能 新品机会分析", type: "skill" }, { label: "执行脚本 机会点评分", type: "script" }] },
      ] },
      { id: "c1-task-delivery", title: "整合发现并交付新品规划调研报告", summary: "已完成执行摘要、竞争格局、消费趋势和新品建议的 HTML 报告输出", status: "completed", steps: [
        { ...completed("c1-delivery-1", "汇总研究结论并校验叙事一致性", "统一市场、竞争和消费趋势的时间范围与证据口径"), actions: [{ label: "调用技能 研究报告整合", type: "skill" }, { label: "执行脚本 结论一致性校验", type: "script" }] },
        { ...completed("c1-delivery-2", "生成并校验 HTML 行业调研报告", "报告包含执行摘要、竞争格局、消费趋势与新品规划建议"), actions: [{ label: "已生成 2024—2026 中国现制咖啡行业调研报告", type: "file", target: coffeeIndustryResearchReport }] },
      ] },
    ] }, assistant: {
      content: "调研显示，中国现制咖啡市场仍处于高频扩张与结构分化阶段。头部品牌通过门店密度和价格带争夺大众市场，精品与茶咖融合则形成差异化增量。新品规划建议优先关注低糖乳咖、地域风味、功能性成分和下午时段场景，并通过小范围区域测试验证复购。完整分析已整理为下方 HTML 报告。",
      attachments: [{ id: "c1-coffee-industry-report", name: "2024—2026中国现制咖啡行业调研报告.html", size: 28672, target: coffeeIndustryResearchReport }],
      timestamp: "08月30日 15:26",
    }, productBlock: coffeeReportFollowUps },
  ] },
  "chat-2": { turns: [
    { id: "c2-1", user: { content: "你能读取飞书文档吗？", timestamp: "08月31日 09:29" }, execution: { status: "completed", summary: "已确认飞书云文档连接器可用", duration: "12秒", flat: true, steps: [{ ...completed("c2-s1", "检查当前可用连接器", "检查当前可用连接器"), actions: [{ label: "查询连接器列表", type: "api" }, { label: "调用连接器 飞书", type: "connector" }] }, { ...completed("c2-s2", "确认文档读取权限范围", "确认文档读取权限范围"), actions: [{ label: "查询授权状态", type: "api" }] }] }, assistant: { content: "可以。连接飞书云文档后，我可以读取你有权限访问的文档并进行总结、问答或信息提取。把文档链接发给我即可。", timestamp: "08月31日 09:30" } },
    { id: "c2-2", user: { content: "读取 [[文件库:智能体产品交互设计指南.pdf]]，整理 Composer 相关规范。", timestamp: "08月31日 09:31" }, execution: { status: "running", summary: "正在整理 Composer 相关规范", duration: "1分36秒", steps: [{ ...completed("c2-s3", "连接并读取相关文档"), actions: [{ label: "调用连接器 飞书云文档", type: "connector" }, { label: "已读取 智能体产品交互设计指南", type: "file", target: agentGuidelineFile }] }, { id: "c2-s5", title: "提取 Composer 的布局、状态与交互规则", detail: "正在合并桌面端与移动端规范", status: "running", actions: [{ label: "调用技能 组件规范分析", type: "skill" }] }, { id: "c2-s6", title: "生成结构化规范清单", status: "pending" }] } },
  ] },
  "chat-3": { turns: [
    { id: "c3-1", expert: "用户体验专家", user: { content: "你是一个挑剔且专业的用户体验专家，帮我评审智能家居 App 的核心页面", timestamp: "08月31日 11:04" }, execution: { status: "completed", summary: "已完成三个核心页面的系统性体验评审", duration: "4分08秒", reasoning: { id: "c3-r1", content: "评审范围包含多个页面和跨页面任务，需要先按核心任务拆分，再分别检查信息架构、状态反馈、错误恢复与一致性，最后按影响程度归并问题，属于规划型长链路任务。" }, steps: [], tasks: [
      { id: "c3-task-1", title: "检查核心任务与信息架构", summary: "完成首页、设备页和自动化页的任务路径与层级分析", status: "completed", steps: [{ ...completed("c3-t1", "读取并识别三个核心页面"), actions: [{ label: "已读取 首页截图.png", type: "file", target: homeScreenshotImage }, { label: "已读取 设备页截图.png", type: "file", target: deviceScreenshotImage }, { label: "已读取 自动化页截图.png", type: "file", target: automationScreenshotImage }] }, { ...completed("c3-t2", "提取页面结构与关键操作入口"), actions: [{ label: "调用技能 视觉结构识别", type: "skill" }, { label: "执行脚本 页面节点聚类", type: "script" }] }, completed("c3-t3", "梳理跨页面核心任务路径", "设备控制和自动化创建存在入口层级不一致") ] },
      { id: "c3-task-2", title: "评估反馈、异常与恢复机制", summary: "发现状态反馈和错误恢复方面的 5 个高优先级问题", status: "completed", steps: [{ ...completed("c3-t4", "检查关键交互状态的反馈完整性"), actions: [{ label: "调用技能 用户体验启发式评估", type: "skill" }, { label: "检索 WCAG 状态反馈规范", type: "knowledge", target: wcagFeedbackSearch }] }, { ...completed("c3-t5", "对比智能家居竞品的异常处理"), actions: [{ label: "检索 米家异常状态设计", type: "knowledge", target: mijiaErrorSearch }, { label: "检索 Google Home UX", type: "knowledge", target: googleHomeSearch }, { label: "调用接口 竞品案例库", type: "api" }] }, { ...completed("c3-t6", "归并问题并生成优化优先级"), actions: [{ label: "执行脚本 问题影响度排序", type: "script" }, { label: "调用技能 设计评审报告", type: "skill" }] }] },
    ] }, assistant: { content: "整体视觉完成度不错，但核心任务链路仍有三个明显问题：设备状态与控制入口层级混杂；异常状态缺少可执行建议；自动化创建流程过早暴露技术概念。建议先重构首页为“空间—状态—快捷操作”三级结构，再统一离线、故障和执行中的反馈模式。", timestamp: "08月31日 11:08" } },
  ] },
  "chat-4": { turns: [
    { id: "c4-1", user: { content: "参考 [[最近的对话:整理本周项目进展]] 和附件里的任务清单，用 [[技能:文档总结]] 整理本周项目进展并生成周报", attachments: [{ id: "c4-upload-tasks", name: "本周任务清单.xlsx", size: 18432, target: taskListFile }, { id: "c4-upload-meeting", name: "项目周会纪要.docx", size: 42137, target: meetingNotesFile }], timestamp: "08月30日 18:04" }, execution: { status: "completed", summary: "已汇总项目资料，但仍缺少周报组织方式", duration: "1分25秒", steps: [{ ...completed("c4-s1", "汇总本周任务、会议和项目资料"), actions: [{ label: "查询最近的对话", type: "query" }, { label: "已读取 项目周会纪要", type: "file", target: meetingNotesFile }, { label: "已读取 本周任务清单", type: "file", target: taskListFile }] }, { ...completed("c4-s2", "识别已完成事项、风险和下周计划"), actions: [{ label: "执行脚本 项目状态归并", type: "script" }, { label: "调用技能 周报整理", type: "skill" }] }, completed("c4-s3", "检查生成周报所需信息", "缺少重点项目和下周计划的组织维度") ] }, assistant: { content: "我已经汇总了现有项目资料。当前还缺少两个关键信息：本周需要重点向管理层同步哪个项目？另外，下周计划是按负责人组织，还是按项目优先级组织？", timestamp: "08月30日 18:06", kind: "question" } },
  ] },
  "chat-5": { turns: [
    {
      id: "c5-1",
      expert: "差旅助手",
      user: { content: "我下周要去上海出差，帮我发起申请。", timestamp: "09月02日 10:16" },
      execution: {
        status: "completed",
        summary: "已识别出差申请所需信息，并发现日期、事由和出行偏好尚未明确",
        duration: "14秒",
        flat: true,
        steps: [
          { ...completed("c5-s1", "识别差旅申请中的已有信息", "已确认目的地为上海，但申请所需的出行日期、出差事由和交通偏好仍缺失"), actions: [{ label: "调用技能 差旅申请", type: "skill" }] },
          completed("c5-s2", "生成差旅信息澄清表单", "通过结构化表单引导补齐必填信息，以便继续发起申请"),
        ],
      },
      assistant: {
        content: "我已为你调度 **差旅助手**。目前已确认目的地是上海，但发起申请还需要补充出行日期、出差事由和交通偏好；请在下方填写后提交。",
        timestamp: "09月02日 10:17",
        kind: "question",
        clarification: {
          id: "travel-application-details",
          title: "补充出差信息",
          defaultOpen: true,
          submitLabel: "提交",
          initialValues: { destination: "上海" },
          fields: [
            { id: "destination", label: "出差目的地", type: "text", required: true, placeholder: "请输入城市或地区" },
            { id: "dates", label: "出发与返程日期", type: "date-range", required: true },
            { id: "purpose", label: "出差事由", type: "textarea", required: true, placeholder: "请简要说明本次出差的工作事项" },
            { id: "transport", label: "交通偏好", type: "single-select", required: true, options: [{ value: "train", label: "高铁/火车" }, { value: "flight", label: "飞机" }, { value: "flexible", label: "按公司差旅标准" }] },
            { id: "services", label: "需要协助安排的事项（可选）", type: "multi-select", options: [{ value: "hotel", label: "推荐酒店" }, { value: "calendar", label: "同步日程" }, { value: "reminder", label: "设置出行提醒" }] },
          ],
          followUp: {
            id: "travel-application-ready",
            execution: {
              status: "completed",
              summary: "已整理出差申请单所需的全部信息",
              duration: "26秒",
              flat: true,
              steps: [
                { ...completed("c5-followup-s1", "校验出差日期、目的地与交通安排", "已完成申请字段完整性检查，并按公司差旅标准匹配出行方案"), actions: [{ label: "调用接口 差旅规则校验", type: "api" }] },
                { ...completed("c5-followup-s2", "整理出差申请单数据", "已生成申请单草稿，包含行程、事由和需协助安排的事项"), actions: [{ label: "调用技能 出差申请整理", type: "skill" }] },
              ],
            },
            assistant: {
              content: "出差申请单所需的信息已经整理完成。是否现在由我帮你提交这份出差申请单？",
              timestamp: "09月02日 10:19",
              kind: "question",
            },
          },
        },
      },
    },
  ] },
}

export function createDraftScene(message: string, expert?: string, attachments: MessageAttachment[] = []): ConversationScene {
  return { turns: [{ id: "draft-turn", expert, user: { content: message, attachments, timestamp: formatTimestamp() }, execution: { status: "running", summary: "正在理解你的需求", duration: "刚刚", steps: [{ id: "draft-step", title: "分析问题并规划执行步骤", status: "running" }] } }] }
}
