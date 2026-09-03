---
name: agent-ux-design-tokens
description: "视觉设计 token 取值表（shadcn/ui + Tailwind CSS v4 主题变量）。品牌色、语义色、亮/暗色模式、字体、间距、圆角的唯一事实源。用于确保生成代码颜色/尺寸只走 CSS 变量，不硬编码。"
user-invocable: false
---

# 设计 Token（shadcn + Tailwind v4）

> ⚠️ **本文件当前只有色板层是完整事实源，其余（字体/间距/圆角/组件级 token）待补充。** 用户已提供 `:root` / `.dark` 的语义色变量定义，尚未提供：完整调色板取值（`--color-teal-600`、`--color-neutral-*` 等实际色值来源，可能是 Tailwind 默认色板或自定义）、字体家族与字号档位、间距/圆角档位、基础布局与组件设计稿。**补充前，生成代码时颜色仍必须只用下表已定义的语义变量名，不得臆造新变量或硬编码 hex。**

## 事实源与取值原则

- **唯一事实源**：项目 `globals.css`（或等价的 Tailwind v4 主题文件）中 `:root` / `.dark` 定义的 CSS 变量。**Figma/设计稿/记忆都不是权威**——冲突时以运行时 CSS 变量为准。
- **语义变量 vs 调色板变量**：语义变量（`--primary`、`--destructive` 等）用于组件；调色板变量（`--color-teal-600` 等）是语义变量的底层引用，**组件代码不应直接使用调色板变量**，只用语义变量。
- **Tailwind v4 用法**：变量定义在 `@theme` 或 `:root`/`.dark` 中，组件里通过 Tailwind 语义类使用（如 `bg-primary`、`text-muted-foreground`），不直接写 `var(--xxx)`（除非该场景没有对应 Tailwind 类，如自定义渐变）。
- 暗色模式通过 `.dark` 类切换（`class` 策略，非 `media` 策略），根元素加 `.dark` class 即可整体切换。

## 语义色 Token（当前事实源，已提供）

### Light（`:root`）

| 变量 | 值 | 用途 |
|---|---|---|
| `--background` | `var(--color-white)` | 页面基础背景 |
| `--background-desktop`（自定义） | `var(--color-neutral-50)` | 桌面端页面背景（区分基础 background） |
| `--background-mobile`（自定义） | `var(--color-gray-100)` | 移动端页面背景 |
| `--foreground` | `var(--color-neutral-800)` | 基础文字色 |
| `--card` | `var(--color-white)` | 卡片背景 |
| `--card-foreground` | `var(--color-neutral-800)` | 卡片文字色 |
| `--popover` | `var(--color-white)` | 弹出层背景 |
| `--popover-foreground` | `var(--color-neutral-800)` | 弹出层文字色 |
| `--primary` | `var(--color-teal-600)` | **品牌主色**（青色，非 Pangea 的青绿） |
| `--primary-bg`（自定义） | `--alpha(var(--color-teal-600) / 8%)` | 主色浅底（如选中态背景） |
| `--primary-foreground` | `var(--color-white)` | 主色上的文字色 |
| `--secondary` | `--alpha(var(--color-black) / 4%)` | 次要背景 |
| `--secondary-foreground` | `var(--color-neutral-800)` | 次要背景文字色 |
| `--muted` | `--alpha(var(--color-black) / 4%)` | 弱化背景 |
| `--muted-foreground` | `var(--color-neutral-500)` | 弱化文字色 |
| `--accent` | `--alpha(var(--color-black) / 4%)` | 强调背景（hover/选中态常用） |
| `--accent-foreground` | `var(--color-neutral-800)` | 强调背景文字色 |
| `--destructive` | `var(--color-red-500)` | 危险色 |
| `--destructive-bg`（自定义） | `var(--color-red-50)` | 危险浅底 |
| `--destructive-foreground` | `var(--color-red-700)` | 危险色文字 |
| `--info` | `var(--color-blue-500)` | 信息色 |
| `--info-foreground` | `var(--color-blue-700)` | 信息色文字 |
| `--success` | `var(--color-emerald-500)` | 成功色 |
| `--success-foreground` | `var(--color-emerald-700)` | 成功色文字 |
| `--warning` | `var(--color-amber-500)` | 警告色 |
| `--warning-foreground` | `var(--color-amber-700)` | 警告色文字 |
| `--border` | `--alpha(var(--color-black) / 8%)` | 边框色 |
| `--input` | `--alpha(var(--color-black) / 10%)` | 输入框边框色 |
| `--ring` | `var(--color-neutral-400)` | 聚焦环颜色 |
| `--sidebar` | `var(--color-neutral-100)` | 侧边栏背景 |
| `--sidebar-foreground` | `var(--color-neutral-500)` | 侧边栏文字色 |
| `--sidebar-primary` | `var(--color-neutral-800)` | 侧边栏主色（选中项） |
| `--sidebar-primary-foreground` | `var(--color-neutral-50)` | 侧边栏主色上文字 |
| `--sidebar-accent` | `--alpha(var(--color-black) / 4%)` | 侧边栏强调背景（hover） |
| `--sidebar-accent-foreground` | `var(--color-neutral-800)` | 侧边栏强调背景文字 |
| `--sidebar-border` | `--alpha(var(--color-black) / 6%)` | 侧边栏边框 |
| `--sidebar-ring` | `var(--color-neutral-400)` | 侧边栏聚焦环 |

### Dark（`.dark`）

| 变量 | 值 |
|---|---|
| `--background` | `var(--color-neutral-900)` |
| `--background-desktop`（自定义） | `var(--color-neutral-800)` |
| `--background-mobile`（自定义） | `var(--color-neutral-800)` |
| `--foreground` | `var(--color-neutral-100)` |
| `--card` | `var(--color-neutral-900)` |
| `--card-foreground` | `var(--color-neutral-100)` |
| `--popover` | `var(--color-neutral-900)` |
| `--popover-foreground` | `var(--color-neutral-100)` |
| `--primary` | `var(--color-teal-600)`（暗色下**与亮色同值**，未变浅） |
| `--primary-bg`（自定义） | `--alpha(var(--color-teal-600) / 15%)` |
| `--primary-foreground` | `var(--color-white)` |
| `--secondary` | `--alpha(var(--color-white) / 4%)` |
| `--secondary-foreground` | `var(--color-neutral-100)` |
| `--muted` | `--alpha(var(--color-white) / 4%)` |
| `--muted-foreground` | `var(--color-neutral-400)` |
| `--accent` | `--alpha(var(--color-white) / 4%)` |
| `--accent-foreground` | `var(--color-neutral-100)` |
| `--destructive` | `var(--color-red-400)` |
| `--destructive-bg`（自定义） | `var(--color-red-950)` |
| `--destructive-foreground` | `var(--color-red-400)` |
| `--info` | `var(--color-blue-500)` |
| `--info-foreground` | `var(--color-blue-400)` |
| `--success` | `var(--color-emerald-500)` |
| `--success-foreground` | `var(--color-emerald-400)` |
| `--warning` | `var(--color-amber-500)` |
| `--warning-foreground` | `var(--color-amber-400)` |
| `--border` | `--alpha(var(--color-white) / 6%)` |
| `--input` | `--alpha(var(--color-white) / 8%)` |
| `--ring` | `var(--color-neutral-500)` |
| `--sidebar` | `var(--color-neutral-800)` |
| `--sidebar-foreground` | `var(--color-neutral-400)` |
| `--sidebar-primary` | `var(--color-neutral-100)` |
| `--sidebar-primary-foreground` | `var(--color-neutral-800)` |
| `--sidebar-accent` | `--alpha(var(--color-white) / 4%)` |
| `--sidebar-accent-foreground` | `var(--color-neutral-100)` |
| `--sidebar-border` | `--alpha(var(--color-white) / 5%)` |
| `--sidebar-ring` | `var(--color-neutral-400)` |

**注意事项（写代码时必须遵守）**：
- 三个语义色带 `-bg` 后缀（`--primary-bg`、`--destructive-bg`）是**本项目自定义**、非 shadcn 默认变量，专门用作该语义色的**浅底色**（如选中态背景、危险提示的浅色底）——组件需要浅底时优先用它们，不要用 `--primary` 直接调透明度重造一份。
- `--background-desktop` / `--background-mobile` 也是自定义，分别用于**桌面端页面级背景**与**移动端页面级背景**（区别于组件级 `--background`）——沉浸式/助手式布局外壳的最外层背景应使用这两个变量按断点切换，而不是统一用 `--background`。
- `--info` / `--success` / `--warning` 三个语义色**没有 `-bg` 浅底变体**（不同于 destructive）——需要浅底时暂用该色 `-foreground` 或自行按同等透明度规则新增（需用户确认后补充到本文件，不要臆造）。
- `--ring` 在亮/暗色下都是中性灰（`neutral-400`/`neutral-500`），**不是主色**——聚焦环颜色与品牌色解耦。
- 暗色下 `--primary` 未变浅（与亮色同值 `teal-600`），这与很多设计系统"暗色主色调亮"的做法不同，**不要自行"修正"成更亮的值**。

## 待补充（等待用户提供后回填）

- [ ] 调色板层实际取值：`--color-white` / `--color-black` / `--color-neutral-*` / `--color-teal-*` / `--color-red-*` / `--color-blue-*` / `--color-emerald-*` / `--color-amber-*` / `--color-gray-*` —— 是 Tailwind v4 默认调色板直接引用，还是项目自定义了这些色阶？
- [ ] `--alpha()` 函数的来源与语法确认（Tailwind v4 新增的 CSS `color-mix` 风格函数，需确认版本要求）。
- [ ] 字体家族、字号档位、行高、字重档位。
- [ ] 间距档位、圆角档位（shadcn 默认有 `--radius` 系列，需确认本项目是否覆盖）。
- [ ] 阴影 token。
- [ ] 组件级 token（如消息气泡、卡片、面板的专属变量，如有）。
- [ ] 基础布局与核心组件的设计稿（用于校验沉浸式/助手式脚手架的视觉还原度）。

> 补充后本文件与两套脚手架的 `globals.css` 需同步更新，并在 [CHANGELOG.md](../../../../CHANGELOG.md) 记录。
