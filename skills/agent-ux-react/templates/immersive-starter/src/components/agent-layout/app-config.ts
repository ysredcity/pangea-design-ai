import type { ProductBlockRenderer } from "./conversation-flow"
import { renderProductBlock } from "./product-block-renderer"
import type { ExpertVisualKey, ProductAvatarKey } from "./resource-visuals"

export type ProductIdentity = {
  name: string
  avatar: ProductAvatarKey
}

export type NavigationItem = {
  id: "new-conversation" | "capability-hub" | "scheduled-task" | "file-library"
  label: string
  visualKey: "newConversation" | "capabilityHub" | "scheduledTask" | "fileLibrary"
}

export type WelcomeExpert = {
  id: string
  label: string
  visualKey: ExpertVisualKey
}

export type WelcomeRecommendation = {
  expertId: string
  prompt: string
}

export type AppConfig = {
  identity: ProductIdentity
  navigation: readonly NavigationItem[]
  experts: readonly WelcomeExpert[]
  welcome: {
    greeting: string
    expertIds: readonly string[]
    recommendations: readonly WelcomeRecommendation[]
    expertRecommendations: Readonly<Record<string, readonly string[]>>
  }
  renderProductBlock?: ProductBlockRenderer
}

export const appConfig = {
  identity: { name: "智能助手", avatar: "bot" },
  navigation: [
    { id: "new-conversation", label: "新对话", visualKey: "newConversation" },
    { id: "capability-hub", label: "智能体 · 技能 · 连接器", visualKey: "capabilityHub" },
    { id: "scheduled-task", label: "定时任务", visualKey: "scheduledTask" },
    { id: "file-library", label: "文件库", visualKey: "fileLibrary" },
  ],
  experts: [
    { id: "office", label: "日常办公专家", visualKey: "office" },
    { id: "document", label: "文档处理专家", visualKey: "document" },
    { id: "data", label: "数据分析专家", visualKey: "data" },
    { id: "research", label: "市场调研专家", visualKey: "research" },
    { id: "campus", label: "园区生活专家", visualKey: "campus" },
    { id: "travel", label: "差旅助手", visualKey: "travel" },
    { id: "ux", label: "用户体验专家", visualKey: "ux" },
    { id: "industry", label: "行业研究专家", visualKey: "industry" },
  ],
  renderProductBlock,
  welcome: {
    greeting: "👋 Hey！有什么需要我搞定的？",
    expertIds: ["office", "document", "data", "research", "campus"],
    recommendations: [
      { expertId: "office", prompt: "创建飞书「需求内审评审流」评审内容清单文档" },
      { expertId: "document", prompt: "将《UI Skill 使用手册》精简为设计师快速上手指南" },
      { expertId: "research", prompt: "帮我联网调研瑞幸，对比它和星巴克的差异" },
      { expertId: "data", prompt: "分析本季度业务数据并找出增长机会" },
      { expertId: "campus", prompt: "推荐园区附近适合团队聚餐的餐厅" },
      { expertId: "office", prompt: "整理本周工作进展并生成周报" },
    ],
    expertRecommendations: {
      office: ["创建飞书「需求内审评审流」评审内容清单文档", "整理本周工作进展并生成周报", "根据会议记录提炼待办事项"],
      document: ["将《UI Skill 使用手册》精简为设计师快速上手指南", "总结这份项目文档的核心结论", "把需求说明改写成结构化方案"],
      data: ["分析本季度业务数据并找出增长机会", "将这份表格生成可视化分析报告", "对比各区域指标并解释异常变化"],
      research: ["帮我联网调研瑞幸，对比它和星巴克的差异", "分析目标行业的市场规模与竞争格局", "整理竞品的核心功能和定价策略"],
      campus: ["推荐园区附近适合团队聚餐的餐厅", "查询园区班车路线和发车时间", "帮我规划园区一天的访客接待安排"],
    },
  },
} satisfies AppConfig
