export const documentation = [
  { id: 'principles', eyebrow: '00 / 方法', title: '把智能体做成一条可检查的工作链。', body: '从能力识别、任务过程到交付物，每个状态都必须让用户理解正在发生什么、为什么需要参与，以及下一步是什么。', href: '../skills/agent-ux-react/references/design.md' },
  { id: 'shapes', eyebrow: '01 / 形态', title: '先选容器，再写界面。', body: '沉浸式以对话为主工作区；Copilot 服务于既有工作面；嵌入式由宿主任务定义边界。三者不做运行时互换。', href: '../skills/agent-ux-react/references/design.md#二界面形态选型' },
  { id: 'risk', eyebrow: '02 / 风险', title: '确认只发生在真正写入之前。', body: '高风险操作展示对象、动作、影响、后果与操作人。待批准期间阻断新指令，且批准状态必须来自显式模型。', href: '../skills/agent-ux-react/references/design.md#34-操作确认' },
]

export type ComponentVisibility = 'shared' | 'template'

export type ComponentDocument = {
  id: string
  title: string
  layer: string
  visibility: ComponentVisibility
  summary: string
  whenToUse: string[]
  whenNotToUse: string[]
  variants: string[]
  composeWith: string[]
  composeBoundary: string[]
  pitfalls: string[]
  source: string
  docHref: string
  tags: string[]
}

const referenceRoot = '../skills/agent-ux-react/references'

export const componentCatalog: ComponentDocument[] = [
  {
    id: 'immersive-shell', title: '沉浸式 Agent 布局外壳', layer: 'layout shell', visibility: 'template', summary: '以对话为主工作区的完整工作台；右侧面板仅在用户打开交付物时出现。',
    whenToUse: ['通用助手、客服、知识问答', '用户用自然语言表达目标并等待结果'], whenNotToUse: ['围绕画布、代码或表格持续操作的 Copilot 场景'], variants: ['无右侧面板（纯对话）', '有右侧面板', '单模块（隐藏左侧菜单栏）'], composeWith: ['MessageBubble', 'Composer', 'ArtifactCard', 'TaskProgress'], composeBoundary: ['中间对话流是主区域，不能压缩至不可读', '右侧面板由制品卡片点击驱动，不常驻'], pitfalls: ['不要为了三栏视觉强加左侧菜单', '右侧面板打开时不能完全遮挡对话流'], source: 'templates/immersive-starter/src/components/agent-layout/agent-shell.tsx', docHref: `${referenceRoot}/components/shell/agent-shell.md`, tags: ['布局', '沉浸式', '三栏'],
  },
  {
    id: 'copilot-shell', title: '助手式 Copilot 布局外壳', layer: 'layout shell', visibility: 'shared', summary: '把 AI 保持为辅助区，让原有画布、代码、表格或设计稿仍是用户的主工作面。',
    whenToUse: ['IDE、设计工具、BI、合同审阅和低代码搭建', 'AI 辅助不能离开原有工作区'], whenNotToUse: ['自然语言表达目标后等待结果的沉浸式 Agent 场景'], variants: ['三栏并列', '浮窗', '浮层抽屉', '侧边抽屉'], composeWith: ['MessageBubble', 'Composer', 'ConfirmCard', 'TaskProgress'], composeBoundary: ['AI 是配角，不能把主工作区压缩到不可用', '浮窗不适合需持续对照主页面的任务'], pitfalls: ['不要为了塞 AI 侧栏压缩主要业务对象', '横向空间紧张时不要使用侧边抽屉'], source: 'packages/agent-ui/src/copilot/copilot-app.tsx', docHref: `${referenceRoot}/design.md#二界面形态选型`, tags: ['布局', '助手式', '三栏'],
  },
  {
    id: 'composer', title: '意图输入区 Composer', layer: 'delegation', visibility: 'shared', summary: '对话底部的统一输入入口；共享实现只承担轻量文本提交。',
    whenToUse: ['对话流底部的统一输入入口', '需要混合编辑提示词、上下文或能力'], whenNotToUse: ['澄清卡片的表单录入', '纯展示内容'], variants: ['基础输入（仅提示词）', '含上下文标签', '含能力标签', '语音输入态'], composeWith: ['ConversationFlow', 'mention-popover', 'slash-popover'], composeBoundary: ['已选上下文或能力必须在输入区内显式呈现', '不与澄清卡片的表单字段混用'], pitfalls: ['占位提示需随场景变化', '异步解析必须展示处理中态'], source: 'packages/agent-ui/src/conversation/composer.tsx', docHref: `${referenceRoot}/components/delegation/composer.md`, tags: ['输入', '对话流'],
  },
  {
    id: 'conversation-flow', title: '对话流 ConversationFlow', layer: 'conversation', visibility: 'shared', summary: '消费场景、身份和产物路由的中立共享对话域。',
    whenToUse: ['需要按回合呈现用户、执行过程、智能体结论与交付物'], whenNotToUse: ['把完整产品壳层或业务路由塞入共享对话域'], variants: ['单回合结论', '带执行过程', '带产物', '带产品块'], composeWith: ['Composer', 'ConfirmCard', 'ArtifactTarget'], composeBoundary: ['只消费中立 ArtifactTarget', '产品壳层负责将产物映射到面板、画布或路由'], pitfalls: ['不要把模板内部 PanelView 泄漏到 shared 类型', '不要在 Flow 内声明业务写入已成功'], source: 'packages/agent-ui/src/conversation/conversation-flow.tsx', docHref: `${referenceRoot}/components/conversation/conversation-flow.md`, tags: ['对话流', '共享', '场景'],
  },
  {
    id: 'confirm-card', title: '确认卡片 ConfirmCard', layer: 'conversation', visibility: 'shared', summary: '在真正写入前收集清晰、可审查的中风险或高风险授权。',
    whenToUse: ['中风险操作的轻量确认', '高风险操作的强确认', '用户对待执行操作做选择'], whenNotToUse: ['待澄清信息缺失', '低风险只读操作'], variants: ['轻量确认（中风险）', '强确认（高风险）', '对象、动作、影响范围、后果、操作人五字段'], composeWith: ['MessageBubble', 'ProductBlockContext.onAction'], composeBoundary: ['无深层导航和内部滚动', '字段不超过 10 个、按钮不超过 3 个且仅一个主操作'], pitfalls: ['高风险不能用自然语言确认替代', '派发 action 不等于真实写入成功'], source: 'packages/agent-ui/src/conversation/confirm-card.tsx', docHref: `${referenceRoot}/components/conversation/confirm-card.md`, tags: ['对话流', '卡片', '风险'],
  },
  {
    id: 'error-state', title: '异常状态 ErrorState', layer: 'conversation', visibility: 'shared', summary: '把失败、影响和可恢复的下一步作为一个完整状态呈现。',
    whenToUse: ['服务不可用、超时、执行失败、部分完成、权限不足或结果未知'], whenNotToUse: ['任务正常完成'], variants: ['服务不可用', '响应超时', '执行失败', '部分完成', '权限不足', '能力不支持', '结果未知'], composeWith: ['MessageBubble', 'ConfirmCard'], composeBoundary: ['必须同时说明发生了什么、影响了什么、下一步怎么做', '未完成时不得暗示已成功'], pitfalls: ['不要只显示错误码', '重试前确认上次执行结果，避免重复高风险动作'], source: 'packages/agent-ui/src/conversation/error-state.tsx', docHref: `${referenceRoot}/components/conversation/error-state.md`, tags: ['对话流', '异常', '可信'],
  },
  {
    id: 'follow-up-suggestions', title: '后续引导 FollowUpSuggestions', layer: 'conversation', visibility: 'shared', summary: '在适合结束的一轮之后，用 2–4 个上下文相关建议维持下一步。',
    whenToUse: ['交互正常结束且非高风险操作刚完成', '有明确基于上下文的追问价值'], whenNotToUse: ['用户已结束对话或表达负面情绪', '任务失败且无恢复路径', '高风险操作刚完成'], variants: ['2 个推荐', '3–4 个推荐'], composeWith: ['MessageBubble'], composeBoundary: ['数量固定在 2–4 个', '内容必须来自当前上下文而非固定话术'], pitfalls: ['不要为简单问答过度延伸推荐', '高风险操作后不展示追问'], source: 'packages/agent-ui/src/conversation/follow-up-suggestions.tsx', docHref: `${referenceRoot}/components/conversation/follow-up-suggestions.md`, tags: ['对话流', '引导', '推荐'],
  },
  {
    id: 'message-actions', title: '消息操作栏 MessageActions', layer: 'conversation', visibility: 'template', summary: '稳定保留在消息末尾的反馈与操作占位，避免悬停时引起布局跳动。',
    whenToUse: ['每条智能体或用户消息末尾'], whenNotToUse: ['消息仍在流式生成中'], variants: ['智能体消息操作', '用户消息操作'], composeWith: ['MessageBubble'], composeBoundary: ['高频操作直接展示，低频操作收进更多菜单', '按消息状态动态显示可用操作'], pitfalls: ['不要提供无意义或易误触的操作', '影响后续流程的操作必须有反馈'], source: 'templates/immersive-starter/src/components/agent-layout/message-actions.tsx', docHref: `${referenceRoot}/components/conversation/message-actions.md`, tags: ['对话流', '操作'],
  },
  {
    id: 'message-bubble', title: '消息气泡 MessageBubble', layer: 'conversation', visibility: 'template', summary: '单条用户或智能体消息的承载单元，专注可读结论而非完整交付物。',
    whenToUse: ['在对话流展示单条用户或智能体消息'], whenNotToUse: ['制品摘要', '需要用户决策的澄清或确认'], variants: ['用户消息', '智能体消息（默认）', '智能体消息流式中', '智能体消息出错'], composeWith: ['MessageActions', 'TaskProgress', 'ArtifactCard', 'MarkdownContent'], composeBoundary: ['不展示模型原始思维链或系统提示词', '长内容应拆分或进入制品卡片'], pitfalls: ['流式输出应使用 aria-live=polite', '不要在气泡内重复用户已知信息'], source: 'templates/immersive-starter/src/components/agent-layout/message-bubble.tsx', docHref: `${referenceRoot}/components/conversation/assistant-message.md`, tags: ['对话流', '消息'],
  },
  {
    id: 'task-progress', title: '任务过程 TaskProgress', layer: 'process', visibility: 'template', summary: '把多步执行翻译成用户能理解的阶段与步骤，不暴露模型原始思维链。',
    whenToUse: ['多步骤任务', '涉及工具调用', '需要解释正在发生什么'], whenNotToUse: ['单轮简单问答', '结果本身就是全部信息量'], variants: ['仅状态层', '状态层 + 执行层', '状态层 + 任务层 + 执行层'], composeWith: ['MessageBubble'], composeBoundary: ['工具调用应转成用户可理解的描述', '过程按需渐进展示'], pitfalls: ['短任务不要强行增加任务层', '不要一次性抛出全部步骤'], source: 'templates/immersive-starter/src/components/agent-layout/conversation-flow.tsx', docHref: `${referenceRoot}/components/process/execution-process.md`, tags: ['对话流', '过程', '可信'],
  },
  {
    id: 'artifact-card', title: '制品卡片 ArtifactCard', layer: 'artifact', visibility: 'template', summary: '为可独立查看或继续处理的文档、表格、图片、代码与报表提供摘要入口。',
    whenToUse: ['AI 生成了可独立处理的文档、表格、图片、视频、代码或报表'], whenNotToUse: ['简短文本结果', '不需要面板承载的轻量信息'], variants: ['文档', '表格', '图片', '视频', '代码', '报表 / 图表'], composeWith: ['沉浸式右侧面板或 Copilot 工作区展示区'], composeBoundary: ['对话流内只展示摘要，不展示完整制品', '面板操作结果同步回对话流'], pitfalls: ['不要在对话流直接渲染完整文档', '面板不承担全局导航'], source: 'templates/immersive-starter/src/components/agent-layout/artifact-panel.tsx', docHref: `${referenceRoot}/components/artifact/artifact-panel.md`, tags: ['对话流', '卡片', '制品'],
  },
]

export const components = componentCatalog
