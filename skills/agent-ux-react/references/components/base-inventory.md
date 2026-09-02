---
name: agent-ux-base-inventory
description: "底层基础件清单（shadcn v4 / Base UI）。列出项目可用的 21 个基础组件、按需添加方式，以及 Base UI 特有的本项目约定与已踩过的坑。不镜像官方 API——组件源码在项目内，读源码比读二手文档更准。"
user-invocable: false
---

# 底层基础件清单（shadcn v4 / Base UI）

## 为什么这里不是 API 镜像

pangea-design-skill 为 arco 做了 60+ 份组件 API 零漂移镜像，因为 arco 是 npm 包、API 在源码里不可见，镜像有价值。

本项目不同：**shadcn 是"拷贝源码"模式**，21 个基础组件的源码就在工程的 `src/components/ui/` 里。**agent 读源码比读二手文档更准**，二手文档还会随 shadcn 升级漂移。

所以本文件只做两件事：**说明有哪些可用**、**记录本项目特有的约定与坑**。需要完整 API 时读源码或查 [Base UI 官方文档](https://base-ui.com/)。

## 技术栈

- **shadcn v4**，底层为 **Base UI**（`@base-ui/react`），不是 Radix。
- 样式经 `@import "shadcn/tailwind.css"` 引入，主题变量在工程的 `src/index.css`。
- 图标统一 **Lucide React**。
- 字体 **Geist Variable**。
- Toast 用 **Sonner**。
- Markdown 用 **react-markdown + remark-gfm**。
- 日期用 **react-day-picker + date-fns**（版本需锁定，见下方坑）。

> ⚠️ Base UI 与 Radix 的 API 不兼容。参考任何 shadcn 教程/代码片段前先确认它基于哪个底层，Radix 版本的写法不能直接用。

## 可用组件（21 个）

| 组件 | 文件 | 本项目主要用途 |
|---|---|---|
| Attachment | `attachment.tsx` | 用户上传附件卡片、智能体交付物附件 |
| Badge | `badge.tsx` | 状态标签 |
| Button | `button.tsx` | 全局按钮 |
| Calendar | `calendar.tsx` | 澄清表单的日期范围选择（配合 Popover） |
| Checkbox | `checkbox.tsx` | 澄清表单多选字段 |
| Dialog | `dialog.tsx` | 重命名对话框、点踩反馈弹窗 |
| DropdownMenu | `dropdown-menu.tsx` | 输入区添加菜单、消息更多操作、侧栏对话更多菜单 |
| Field | `field.tsx` | 澄清表单字段容器 |
| Input | `input.tsx` | 澄清表单文本字段 |
| Label | `label.tsx` | 表单标签 |
| Popover | `popover.tsx` | 日期选择容器 |
| RadioGroup | `radio-group.tsx` | 澄清表单单选字段 |
| Separator | `separator.tsx` | 菜单分组分隔、操作栏分隔 |
| Sheet | `sheet.tsx` | 移动端侧栏抽屉 |
| Sidebar | `sidebar.tsx` | 侧栏骨架（shadcn Sidebar） |
| Skeleton | `skeleton.tsx` | 加载占位 |
| Sonner | `sonner.tsx` | Toast 容器 |
| Spinner | `spinner.tsx` | 执行中状态 |
| Switch | `switch.tsx` | 开关 |
| Textarea | `textarea.tsx` | 澄清表单多行文本 |
| Tooltip | `tooltip.tsx` | 纯图标按钮的可访问提示（[无障碍要求](../design.md#53-无障碍与包容性)） |

## 按需添加新基础件

```bash
npx shadcn@latest add <component>
```

新装的组件若**不是**对话域组件的依赖，直接留在 `src/components/ui/` 即可，不需要进 `packages/agent-ui`。

> 实测坑：`npx shadcn@latest add` 在非 TTY 环境会静默挂起（卡在包安装的交互确认上）。解决办法是先 `npm install -D shadcn@latest` 装进项目本地依赖，再用 `npx shadcn add <components> --yes`（不带 `@latest`）调用本地版本。另外 CLI 会按 `components.json` 的 `@` alias **字面量**创建目录（生成 `@/components/ui/...`），需要手动 `mv` 到 `src/components/ui/` 并删掉 `@/` 目录。

## 本项目约定与已踩过的坑

### Base UI DropdownMenu 会递归覆盖后代颜色

Base UI 的 `DropdownMenu` 带有通用的 `focus:**:text-accent-foreground`，**会递归覆盖菜单项内所有后代元素的颜色**。

- **后果**：专家头像（圆形彩色标识）在菜单项悬停/聚焦时整体变色，违反 [design.md 6.4](../design.md#64-图标) 的"专家头像在任何位置颜色稳定"。
- **解决**：专家图标**不依赖 `color` / `currentColor`**，采用显式 SVG `stroke`（固定白色描边）。
- **不受此约束的**：文件类型图标本来就应该跟随文字色变化（它是普通菜单图标），所以不需要规避。

### 表单控件不得退回浏览器原生

澄清表单的日期范围**必须**用 `Popover` + `Calendar` 组合，不用原生 `<input type="date">`——原生控件跨平台视觉与交互不受控。见 [design.md 3.3.1](../design.md#331-向智能体索要结构化信息用表单而不是追问)。

### 日期依赖需锁定精确版本

`react-day-picker` 与 `date-fns` 必须锁精确版本。新增或更新日期能力时保持锁定，并**避免用 `toISOString()` 序列化 date-only 值**——会导致跨时区日期偏移。值在组件边界以本地时区显式转换，数据契约保持 `{ start, end }` 的 `YYYY-MM-DD`。

### Tooltip 需要 Provider

`Tooltip` 组件要求应用外层包 `TooltipProvider`。

### 扫光动画只用官方 utility

运行中 L1 标题的扫光效果**必须**用 shadcn 官方 `shimmer` utility（组合 `shimmer-color-foreground shimmer-duration-1200 shimmer-spread-8`），**不要重新实现另一套关键帧**。官方 utility 内建遵循 `prefers-reduced-motion`。这条对应 [design.md 4.3](../design.md#43-动效原则) 的"同一种效果全局只有一个实现"。

### 注册表与容器实现要分文件

把非组件导出（如容器注册表常量）和组件写在同一文件会触发 lint 的 `react(only-export-components)` 警告。注册表单独放文件。
