import type { ImageView, PanelView, SearchResult } from "./panel-types"

/**
 * 独立面板的场景数据层。
 *
 * 这里只放示例内容，不含任何布局或渲染逻辑：
 * - 容器的布局与交互在 `artifact-panel.tsx`（框架壳层）和 `panel-containers.tsx`（各类型容器）。
 * - 对话数据 `conversation-data.ts` 只引用本文件导出的常量作为 Badge 的 `target`。
 *
 * 接真实数据时替换本文件即可，模板框架无需改动。
 */

const searchPanel = (query: string, results: SearchResult[]): PanelView => ({ type: "search-results", title: "检索结果", query, results })
const browserPage = (title: string, url: string, source: string, description: string): PanelView => ({ type: "browser", title, url, source, description })
const filePreview = (fileName: string, fileType: string, content: string, title = fileName.replace(/\.[^.]+$/, "")): PanelView => ({ type: "file-preview", title, fileName, fileType, content })
const screenshot = (fileName: string, title: string, src: string): ImageView => ({ type: "image", title, fileName, src, alt: `${title}截图`, fileType: "PNG · 截图" })

// ── 报表图标选择场景 ────────────────────────────────────────────────

export const reportIconSearch = searchPanel("报表图标语义", [
  { id: "report-icon-1", source: "Nielsen Norman Group", title: "Icon Usability: 图标语义与识别成本", description: "说明抽象图标在缺少文字标签时的识别失败率，以及数据类图标应优先保留的结构特征。", url: "https://www.nngroup.com/articles/icon-usability" },
  { id: "report-icon-2", source: "Material Design", title: "Icons —— 数据与图表类符号规范", description: "梳理图表、仪表盘、表格三类符号的适用语境，并给出小尺寸下的简化建议。", url: "https://m3.material.io/styles/icons/overview" },
  { id: "report-icon-3", source: "Lucide", title: "Lucide 图标库中的图表与趋势分类", description: "列出 bar-chart、line-chart、gauge、table 等图标的命名规则与视觉一致性约定。", url: "https://lucide.dev/icons/categories#charts" },
  { id: "report-icon-4", source: "Ant Design", title: "数据展示类图标的选择原则", description: "从信息密度和业务语义角度说明报表、看板和明细表应如何区分图标。", url: "https://ant.design/components/icon-cn" },
])

export const lucideIconSearch = searchPanel("chart dashboard report", [
  { id: "lucide-1", source: "Lucide", title: "chart-no-axes-combined", description: "组合趋势图标，同时表达柱状与折线，去掉坐标轴后在 16px 下仍可辨识。", url: "https://lucide.dev/icons/chart-no-axes-combined" },
  { id: "lucide-2", source: "Lucide", title: "gauge", description: "仪表盘图标，偏实时监控与经营驾驶舱语义，适合指标预警类入口。", url: "https://lucide.dev/icons/gauge" },
  { id: "lucide-3", source: "Lucide", title: "chart-column", description: "标准柱状图图标，语义明确但更偏单一图表而非完整报表。", url: "https://lucide.dev/icons/chart-column" },
  { id: "lucide-4", source: "Lucide", title: "table-2", description: "表格图标，强调明细数据，小尺寸下线条较密容易糊成一块。", url: "https://lucide.dev/icons/table-2" },
])

// ── 现制咖啡行业调研场景 ────────────────────────────────────────────

export const coffeeMarketSearch = searchPanel("中国现制咖啡市场规模", [
  { id: "coffee-1", source: "艾瑞咨询", title: "2025 年中国现制咖啡行业研究报告", description: "梳理现制咖啡市场规模、连锁化率、价格带变化与消费者画像，并展望 2026 年竞争趋势。", url: "https://report.iresearch.cn/coffee-2025" },
  { id: "coffee-2", source: "中国连锁经营协会", title: "中国现制饮品行业发展报告", description: "覆盖咖啡与茶饮门店规模、供应链变化、城市渗透率及主要品牌经营表现。", url: "https://www.ccfa.org.cn/report/fresh-drinks" },
  { id: "coffee-3", source: "国家统计局", title: "餐饮消费与居民消费支出数据", description: "提供社会消费品零售总额、餐饮收入和居民人均消费支出的公开统计数据。", url: "https://data.stats.gov.cn/easyquery.htm?cn=C01" },
  { id: "coffee-4", source: "德勤", title: "中国咖啡消费市场洞察", description: "聚焦消费频次、购买渠道、口味偏好以及年轻消费者对功能性和地域风味的关注。", url: "https://www2.deloitte.com/cn/coffee-consumer-insight" },
  { id: "coffee-5", source: "瑞幸咖啡", title: "瑞幸咖啡 2025 年第二季度业绩公告", description: "披露门店网络、月均交易客户、产品收入和经营利润等关键指标。", url: "https://investor.lkcoffee.com/financials" },
  { id: "coffee-6", source: "世界咖啡门户", title: "East Asia branded coffee shop market update", description: "从国际视角比较中国品牌咖啡门店增长、市场集中度和产品创新方向。", url: "https://www.worldcoffeeportal.com/Latest/InsightAnalysis" },
])

export const brandFinancialSearch = searchPanel("品牌季度财报", [
  { id: "brand-1", source: "瑞幸咖啡", title: "瑞幸咖啡 2025Q2 财报与经营数据", description: "门店总数、自营与联营结构、月均交易客户数、产品净收入与门店层面利润率。", url: "https://investor.lkcoffee.com/financials/q2-2025" },
  { id: "brand-2", source: "星巴克", title: "Starbucks China Q3 FY2025 Results", description: "中国市场同店销售、客单价与门店扩张节奏，以及非咖啡产品线的贡献变化。", url: "https://investor.starbucks.com/financials/china" },
  { id: "brand-3", source: "库迪咖啡", title: "库迪咖啡门店与供应链进展说明", description: "披露联营门店扩张速度、补贴策略调整以及华东供应链基地的产能规划。", url: "https://www.cotticoffee.com/news/2025-operation" },
  { id: "brand-4", source: "百胜中国", title: "肯悦咖啡与餐饮渠道咖啡业务表现", description: "餐饮渠道切入现制咖啡的门店数量、订单结构与客群重叠情况。", url: "https://ir.yumchina.com/coffee-business" },
])

export const coffeeKeywordSearch = searchPanel("咖啡消费关键词", [
  { id: "keyword-1", source: "小红书商业洞察", title: "现制咖啡内容热词榜（2026 上半年）", description: "低糖乳咖、生椰、厚乳、椰云、油柑等风味词的搜索量与同比变化。", url: "https://business.xiaohongshu.com/insight/coffee-keywords" },
  { id: "keyword-2", source: "抖音商业化", title: "咖啡品类搜索与种草趋势报告", description: "按时段与城市层级拆解咖啡内容消费，下午茶与办公场景增速明显高于早餐。", url: "https://bytedance.com/insight/coffee-trend" },
  { id: "keyword-3", source: "美团研究院", title: "现制饮品订单结构与时段分布", description: "外卖与到店订单的时段分布、复购周期，以及联名活动对新客拉动的衰减曲线。", url: "https://www.meituan.com/research/fresh-drinks" },
  { id: "keyword-4", source: "第一财经", title: "功能性咖啡与健康化趋势观察", description: "无糖、控卡、加纤维与益生菌等功能性诉求在咖啡产品中的落地情况。", url: "https://www.yicai.com/news/coffee-health-trend" },
])

export const coffeeStatsPage = browserPage(
  "国家统计局行业数据",
  "https://data.stats.gov.cn/easyquery.htm?cn=C01",
  "国家统计局",
  "国家数据提供月度、季度和年度宏观经济与行业统计。本次浏览用于核对餐饮收入、消费支出和零售增长等公开指标。",
)

export const coffeeReportFile = filePreview(
  "2025 咖啡行业报告.pdf",
  "PDF · 48 页",
  "# 2025 中国现制咖啡行业报告\n\n## 核心摘要\n\n中国现制咖啡市场继续保持增长，消费频次提升与门店网络下沉共同推动市场扩容。头部品牌的竞争重点从单纯门店规模转向供应链效率、产品创新与会员运营。\n\n## 关键发现\n\n- 大众价格带仍是增量市场的主要入口。\n- 低糖乳咖、地域风味与功能性原料关注度提升。\n- 下沉市场门店增速高于一线城市，但对供应链稳定性要求更高。\n- 下午时段和非早餐场景仍存在明显增长空间。",
  "2025 咖啡行业报告",
)

export const freshDrinkWhitepaperFile = filePreview(
  "现制饮品消费趋势白皮书.pdf",
  "PDF · 32 页",
  "# 现制饮品消费趋势白皮书\n\n## 消费频次\n\n一线与新一线城市的周均消费频次继续提升，办公与下午茶场景贡献主要增量；下沉市场以周末与家庭场景为主。\n\n## 口味偏好\n\n- 乳基饮品占比最高，低糖与控卡诉求快速上升。\n- 地域风味原料（油柑、青提、桂花）在区域市场表现分化。\n- 茶咖融合产品的复购表现优于单纯联名新品。\n\n## 渠道结构\n\n到店自提与外卖比例趋于稳定，小程序会员体系是复购的主要抓手。",
  "现制饮品消费趋势白皮书",
)

export const luckinFinancialFile = filePreview(
  "瑞幸 2025Q2 财报.pdf",
  "PDF · 26 页",
  "# 瑞幸咖啡 2025 年第二季度财报摘要\n\n## 经营指标\n\n- 门店网络继续扩张，联营门店占比提升。\n- 月均交易客户数同比增长，客单价基本持平。\n- 产品净收入增速高于门店数量增速，说明单店效率有改善。\n\n## 成本与利润\n\n原材料成本受咖啡豆价格影响上行，门店层面利润率通过供应链集采与产品结构调整部分对冲。\n\n## 战略重点\n\n供应链自建、区域化产品创新与会员运营被列为下阶段三项重点。",
  "瑞幸 2025Q2 财报",
)

// ── 飞书文档整理场景 ────────────────────────────────────────────────

export const agentGuidelineFile = filePreview(
  "智能体产品交互设计指南.docx",
  "飞书云文档",
  "# 智能体产品交互设计指南\n\n## Composer\n\nComposer 是用户与智能体之间唯一的输入入口，需要同时承载文本、附件、上下文与能力选择。\n\n### 布局\n\n- 高度由内容撑开，达到最大高度后内部滚动。\n- 附件与上下文显示在输入区上方，能力与连接器显示在底部操作行。\n\n### 状态\n\n- 空态：只显示占位文案与基础操作。\n- 输入中：发送按钮可用。\n- 录音中：使用醒目的反馈色与波形动画，并提供中断入口。\n\n## 反馈\n\n执行过程需要分层展示，避免把所有中间过程一次性铺给用户。",
  "智能体产品交互设计指南",
)

// ── 智能家居体验评审场景 ────────────────────────────────────────────

// 图片类产物走蒙层图片查看器，不进独立面板
export const homeScreenshotImage = screenshot("首页截图.png", "智能家居 App 首页", "/samples/smart-home-house.svg")
export const deviceScreenshotImage = screenshot("设备页截图.png", "设备详情页", "/samples/smart-home-device.svg")
export const automationScreenshotImage = screenshot("自动化页截图.png", "自动化列表页", "/samples/smart-home-automation.svg")

export const wcagFeedbackSearch = searchPanel("WCAG 状态反馈规范", [
  { id: "wcag-1", source: "W3C", title: "WCAG 2.2 —— 4.1.3 Status Messages", description: "要求状态变化能被辅助技术感知，且不依赖焦点转移即可播报。", url: "https://www.w3.org/WAI/WCAG22/Understanding/status-messages" },
  { id: "wcag-2", source: "W3C", title: "WCAG 2.2 —— 1.4.1 Use of Color", description: "状态不得仅依赖颜色传达，需要配合图标、文字或形状。", url: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color" },
  { id: "wcag-3", source: "W3C ARIA", title: "ARIA live regions 使用指南", description: "说明 polite 与 assertive 的适用场景，避免高频状态更新造成播报噪音。", url: "https://www.w3.org/WAI/ARIA/apg/practices/live-regions" },
  { id: "wcag-4", source: "Nielsen Norman Group", title: "系统状态可见性与错误恢复", description: "从可用性启发式角度说明执行中、失败与恢复三类反馈的信息构成。", url: "https://www.nngroup.com/articles/visibility-system-status" },
])

export const mijiaErrorSearch = searchPanel("米家异常状态设计", [
  { id: "mijia-1", source: "小米开发者平台", title: "米家 App 设备离线与异常状态规范", description: "定义离线、故障、固件升级中三类状态的图标、文案与恢复引导路径。", url: "https://dev.mi.com/console/doc/mijia-status" },
  { id: "mijia-2", source: "小米有品体验团队", title: "智能设备异常场景的分层提示策略", description: "按影响范围区分卡片内提示、全局横幅与阻断弹窗的使用边界。", url: "https://home.mi.com/design/error-handling" },
  { id: "mijia-3", source: "知乎专栏", title: "智能家居异常反馈的可用性拆解", description: "对比多个国内智能家居 App 在断网与设备失联场景下的处理差异。", url: "https://zhuanlan.zhihu.com/p/smart-home-error" },
])

export const googleHomeSearch = searchPanel("Google Home UX", [
  { id: "ghome-1", source: "Google Design", title: "Google Home 的空间与设备信息架构", description: "以房间为主索引组织设备，并将高频控制上浮到首页快捷区。", url: "https://design.google/library/google-home-ux" },
  { id: "ghome-2", source: "Google Nest Help", title: "设备离线与连接问题排查流程", description: "把技术排查步骤转换为用户可执行的分步引导，减少术语暴露。", url: "https://support.google.com/googlenest/answer/offline" },
  { id: "ghome-3", source: "Material Design", title: "Automation 与条件设置的表达方式", description: "使用自然语言句式描述触发条件，把技术参数收进高级设置。", url: "https://m3.material.io/foundations/content-design/automation" },
])

// ── 周报整理场景 ────────────────────────────────────────────────────

export const meetingNotesFile = filePreview(
  "项目周会纪要.docx",
  "飞书云文档",
  "# 项目周会纪要\n\n## 结论\n\n- 智能体工作台模板的对话流与独立面板本周完成主体验收。\n- 移动端断点问题按 659px 统一处理。\n- 独立面板改为多容器 Tab，类型相关操作下移到容器操作栏。\n\n## 风险\n\n- 主包体积仍偏大，需要评估按需拆分。\n- 真实接口尚未接入，示例数据与线上结构可能存在差异。\n\n## 下周\n\n- 补充工具结果与审批卡片形态。\n- 梳理连接器授权失败的兜底提示。",
  "项目周会纪要",
)

export const taskListFile = filePreview(
  "本周任务清单.xlsx",
  "表格 · 24 行",
  "# 本周任务清单\n\n| 任务 | 负责人 | 状态 | 备注 |\n| --- | --- | --- | --- |\n| 独立面板多容器 Tab | 前端 | 已完成 | 含容器操作栏调整 |\n| 执行 Badge 可交互补全 | 前端 | 已完成 | 覆盖检索、文件、网页 |\n| 全屏切换 | 前端 | 已完成 | 窄屏强制全屏 |\n| 主包体积优化 | 前端 | 未开始 | 待评估拆包方案 |\n| 连接器异常兜底 | 设计 | 进行中 | 缺少失败态文案 |",
  "本周任务清单",
)
