import type { AssistantAttachment, ConversationScene, ExecutionData, ExecutionStepData, ImmersiveConversationMeta, PanelView } from '../immersive/contracts'

type Conversation = ImmersiveConversationMeta & { scene: ConversationScene }
const monthlyReport: PanelView = {
  type: 'file-preview', title: '8月财经共享运营分析报告', fileName: '8月财经共享运营分析报告.md', fileType: 'md',
  content: '# 8月财经共享运营分析报告\n\n> SmartReport 演示数据 · 2026年8月\n\n## 运营概览\n\n| 指标 | 本期 |\n| --- | --- |\n| 处理单据 | 42,816 笔 |\n| 自动化率 | 91.6% |\n| 满意度 | 96.2% |\n\n## 效率分析\n\n自动化率为91.6%。当前快照不包含人工处理原因明细，不能据此推断剩余单据均为异常。建议补充人工介入原因后再识别自动化改善机会。\n\n## 服务质量分析\n\n满意度为96.2%。缺少样本量与分业务评价，暂不作事业部排名或因果归因。\n\n## 后续建议\n\n1. 补充人工介入原因及单据类型。\n2. 核对满意度样本量和统计口径。\n3. 在相同周期与口径下开展趋势对比。\n\n来源：FSSC报表8月演示快照。本文未调用真实数据接口。',
}
const monthlyAttachment: AssistantAttachment = { id: 'monthly-report', name: monthlyReport.fileName, size: new TextEncoder().encode(monthlyReport.content).length, target: monthlyReport }

function step(id: string, title: string, type: NonNullable<ExecutionStepData['actions']>[number]['type'], label: string, status: ExecutionStepData['status'] = 'completed', target?: PanelView): ExecutionStepData {
  return { id, title, status, actions: [{ type, label, ...(target ? { target } : {}) }] }
}
function execution(duration: string, summary: string, steps: ExecutionStepData[], status: ExecutionData['status'] = 'completed'): ExecutionData {
  return { status, duration, summary, steps, flat: status === 'completed' }
}
function conversation(id: string, title: string, content: string, process: ExecutionData, meta: Partial<ImmersiveConversationMeta> = {}, attachments?: AssistantAttachment[]): Conversation {
  return { ...meta, id, title, scene: { id, title, turns: [{ id: `${id}-turn`, user: { content: title, timestamp: '09月10日 10:20' }, execution: process, assistant: { content, timestamp: '09月10日 10:21', kind: meta.waitingForReply ? 'question' : 'answer', attachments } }] } }
}

export const smartReportPinnedConversations: Conversation[] = [
  conversation('sr-pin-1', '8月财经共享运营月报', '8月处理单据 42,816 笔，自动化率 91.6%，满意度 96.2%。已分别核对运营效率和服务质量，汇总为下方月报。所有数据均为演示快照。', {
    status: 'completed', duration: '32秒', summary: '已完成效率、服务质量两项分析并汇总月报。', steps: [],
    tasks: [
      { id: 'efficiency', title: '分析运营效率', status: 'completed', summary: '处理单据42,816笔，自动化率91.6%；人工介入原因待补充。', steps: [step('read-efficiency', '读取运营指标', 'query', 'FSSC指标检索'), step('analyze-efficiency', '核对自动化口径', 'skill', '运营效率分析')] },
      { id: 'service', title: '分析服务质量', status: 'completed', summary: '满意度96.2%；暂不对缺失的分组样本作推断。', steps: [step('read-service', '读取满意度指标', 'query', '服务质量检索'), step('analyze-service', '检查结论边界', 'skill', '数据口径校验')] },
      { id: 'publish', title: '汇总分析报告', status: 'completed', summary: '报告已包含指标、分析边界与后续建议。', steps: [step('write', '整理分析结论', 'skill', '经营月报生成'), step('deliver', '生成月报文件', 'file', monthlyReport.title, 'completed', monthlyReport)] },
    ],
  }, {}, [monthlyAttachment]),
  conversation('sr-pin-2', '哪些事业部的人才认证需要重点关注？', '按2026年1—8月认证通过率排序，建议优先关注海信厨卫（73%）与海信营销（78%），其次为海信视像（84%）。整体通过率为86.4%，认证人数1,284人。以上为通过率比较，尚不能归因于培训质量；需结合各事业部样本量复核。', execution('6秒', '已读取精益人才报表并完成通过率排序。', [step('talent-query', '读取各事业部认证通过率', 'query', '精益人才报表检索'), step('talent-rank', '排序并核对统计范围', 'skill', '指标对比分析')])),
]

const people = conversation('sr-2', '帮我分析各部门的人效差异', '请先确认分析范围，以便采用一致的人效口径。', execution('4秒', '已读取人效通报；等待补充分析范围。', [step('people-query', '读取人效指标和部门范围', 'query', '人效通报检索'), step('people-check', '检查分析条件', 'skill', '统计口径校验')], 'waiting'), { waitingForReply: true })
people.scene.turns[0].assistant!.clarification = {
  id: 'people-scope', title: '确认人效分析范围', submitLabel: '开始分析', fields: [
    { id: 'period', label: '统计周期', type: 'single-select', options: [{ label: '当前报表周期', value: 'current' }] },
    { id: 'scope', label: '组织范围', type: 'single-select', options: [{ label: '报表全部32个部门', value: 'all' }] },
    { id: 'focus', label: '分析重点', type: 'single-select', options: [{ label: '部门差异', value: 'difference' }, { label: '改善机会', value: 'improvement' }] },
  ], initialValues: { period: 'current', scope: 'all', focus: 'difference' },
}
const sending = conversation('sr-5', '把财经共享月报发送给经营分析组', '已准备月报附件。确认后仅模拟发送，不会向真实群组发送消息。', execution('3秒', '已完成发送前检查，等待用户批准。', [step('send-file', '核对待发送月报', 'file', monthlyReport.title, 'completed', monthlyReport), step('send-scope', '检查发送对象和影响范围', 'skill', '发送前检查')]), { approvalStatus: 'pending' })
Object.assign(sending.scene.turns[0], {
  awaitingApproval: true,
  productBlock: { id: 'send-monthly-confirm', type: 'confirm-card', data: { riskLevel: 'high', question: '模拟发送月报给经营分析组？', fields: [
    { key: 'object', label: '发送对象', value: '8月财经共享运营分析报告' }, { key: 'action', label: '操作', value: '模拟发送月报附件' }, { key: 'impact-scope', label: '接收范围', value: '经营分析组（演示）' }, { key: 'consequence', label: '影响', value: '仅生成本地模拟回执，不实际发送' }, { key: 'operator', label: '操作人', value: '当前演示用户' },
  ], actions: [{ id: 'approve', label: '确认模拟发送', decision: 'confirm', tone: 'primary' }, { id: 'cancel', label: '取消', decision: 'cancel', tone: 'secondary' }] } },
  approvalOutcomes: {
    approved: { execution: execution('1秒', '模拟发送完成。', [step('mock-send', '生成本地发送结果', 'skill', 'Mock发送')]), assistant: { content: '已模拟发送给经营分析组。没有发生真实外部发送。', timestamp: '09月10日 10:22' } },
    rejected: { execution: execution('1秒', '发送已取消。', []), assistant: { content: '已取消发送，月报仍保留。', timestamp: '09月10日 10:22' } },
  },
})

export const smartReportConversations: Conversation[] = [
  people,
  conversation('sr-3', '找出物料通用化的优先改善品类', '当前通用化率74.1%，节省成本2,840万元。正在核对品类通用化率、采购规模和替代可行性；低通用化率本身不能作为改善优先级的唯一依据。', execution('12秒', '已读取物料库，正在分析改善优先级。', [step('material-query', '读取品类通用化指标', 'query', '物料库检索'), step('material-analysis', '结合成本与替代条件筛选品类', 'skill', '通用化机会分析', 'running'), { id: 'material-result', title: '汇总改善建议', status: 'pending' }], 'running'), { loading: true }),
  conversation('sr-4', '冰冷事业部哪些区域履约偏低？', '2026年8月整体履约及时率94.8%。东北区域86%、西北区域89%、华中区域93%，分别低于整体8.8、5.8、1.8个百分点；华南95%、华东97%。建议优先排查东北与西北，当前报表不能直接说明延迟原因。', execution('7秒', '已完成区域及时率与整体指标对比。', [step('region-query', '读取区域供货及时率', 'query', '供货模式明细检索'), step('region-compare', '计算与整体的百分点差异', 'script', '区域指标对比')]), { unread: true }),
  sending,
]
