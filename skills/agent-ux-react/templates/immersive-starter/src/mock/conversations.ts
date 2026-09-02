export interface MockConversation {
  id: string
  title: string
  updatedAt: string
}

export const mockConversations: MockConversation[] = [
  { id: 'c1', title: '合同审核助手', updatedAt: '刚刚' },
  { id: 'c2', title: '总结这份会议纪要', updatedAt: '10 分钟前' },
  { id: 'c3', title: 'Q2 报销记录筛选', updatedAt: '昨天' },
]

export const suggestedPrompts = [
  '总结这份会议纪要',
  '帮我起草一份供应商合作协议',
  '筛选一下 Q2 报销记录',
  '生成一份 Q3 销售报告',
]
