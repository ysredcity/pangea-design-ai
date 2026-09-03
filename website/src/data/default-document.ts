import type { WebsiteDocument } from '../lib/website-document'

export const defaultDocument: WebsiteDocument = {
  schemaVersion: '1.0',
  app: { name: '经营洞察助手', description: '面向管理者的经营分析协作智能体', welcomeMessage: '从一个真实问题开始，让过程、判断和交付物都可追溯。' },
  targets: {
    'report-file': { id: 'report-file', type: 'document', title: '2026 年经营分析月报.xlsx', description: '含收入、利润、费用与区域经营指标。' },
    'icon-research': { id: 'icon-research', type: 'web', title: '数据产品图形隐喻研究', description: '图表、仪表盘和表格在管理语境中的语义差异。', href: 'https://www.nngroup.com/articles/icon-usability/' },
  },
  scenes: [{
    id: 'report-symbol', title: '报表符号与写入审批', trigger: { type: 'keyword', patterns: ['报表', '仪表盘'] }, turns: [
      { id: 'symbol-advice', user: { content: '如果用一个符号元素形容报表，应该用什么最形象？', timestamp: '09月03日 10:11' }, execution: { status: 'completed', summary: '已比较数据产品中常见的图形隐喻', duration: '18 秒', flat: true, steps: [{ id: 'compare-icons', title: '比较图表、表格与仪表盘的辨识度', status: 'completed', actions: [{ label: '查看图形隐喻研究', type: 'knowledge', targetId: 'icon-research' }] }] }, assistant: { content: '建议使用「仪表盘」。它同时表达数据汇总、指标监控和决策洞察，比单一柱状图更接近完整报表。', timestamp: '09月03日 10:12' } },
      { id: 'write-approval', awaitingApproval: true, user: { content: '可以，帮我把报表调整为仪表盘表达。', timestamp: '09月03日 10:13' }, execution: { status: 'completed', summary: '已准备调整方案，写入前需要审批', duration: '22 秒', flat: true, steps: [{ id: 'read-report', title: '读取报表结构和数据引用关系', status: 'completed', actions: [{ label: '打开经营分析月报', type: 'file', targetId: 'report-file' }] }, { id: 'check-impact', title: '识别写入影响范围', detail: '标题、指标区和图表表达将被更新', status: 'completed' }] }, assistant: { content: '方案已准备完成。下一步会编辑现有报表文件并写入仪表盘表达，这是高风险写入操作。', timestamp: '09月03日 10:14' }, productBlock: { id: 'approve-report', type: 'confirm-card', data: { riskLevel: 'high', question: '允许编辑《2026 年经营分析月报.xlsx》吗？', description: '原始数据与计算逻辑不会改变。', fields: [{ key: 'object', label: '操作对象', value: '2026 年经营分析月报.xlsx' }, { key: 'action', label: '执行动作', value: '写入仪表盘标题、指标区与图表表达' }, { key: 'impact-scope', label: '影响范围', value: '报表展示层与图表配置' }, { key: 'consequence', label: '操作后果', value: '视觉表达被更新，可通过版本记录回退' }, { key: 'operator', label: '操作人', value: '智能助手（本地演示）' }], actions: [{ id: 'reject', label: '拒绝', decision: 'cancel', tone: 'secondary' }, { id: 'approve', label: '允许', decision: 'confirm', tone: 'primary' }] } }, approvalOutcomes: { approved: { execution: { status: 'completed', summary: '本地演示：已完成报表写入', steps: [{ id: 'write', title: '写入仪表盘表达', status: 'completed' }] }, assistant: { content: '本地演示已记录为“允许”；真实文件不会在浏览器中被修改。', timestamp: '刚刚' } }, rejected: { execution: { status: 'completed', summary: '本地演示：已取消写入', steps: [{ id: 'keep', title: '保留原始报表', status: 'completed' }] }, assistant: { content: '本地演示已记录为“拒绝”；未修改任何文件。', timestamp: '刚刚' } } } },
    ],
  }],
}
