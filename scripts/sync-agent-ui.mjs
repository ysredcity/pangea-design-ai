#!/usr/bin/env node
// 把 packages/agent-ui/src/*（开发态唯一源码）物化拷贝进两套脚手架的
// src/components/agent-ui/、src/components/layout/、src/components/ui/{button,dropdown-menu}.tsx、src/lib/utils.ts，
// 并把包内的相对路径改写成脚手架内的 @/ 别名路径，使脚手架产出物不依赖 workspace。
// 对应方案：docs/proposals/website-showcase.md 第 4 节。
// 用法：node scripts/sync-agent-ui.mjs [--check]
//   --check：只比对差异，不写入；发现漂移时以非零退出码结束（用于 CI/gate 的"发布态漂移检测"）。

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PKG_SRC = join(ROOT, 'packages/agent-ui/src')
const TEMPLATES = [
  join(ROOT, 'skills/agent-ux-react/templates/immersive-starter'),
  join(ROOT, 'skills/agent-ux-react/templates/copilot-starter'),
]

const CHECK_ONLY = process.argv.includes('--check')

/**
 * 路径改写规则：包内源码用相对路径互相引用，拷贝进脚手架后统一改写成脚手架已有的 @/ 别名结构：
 *   ./lib/utils            -> @/lib/utils
 *   ./ui/button             -> @/components/ui/button
 *   ./ui/dropdown-menu      -> @/components/ui/dropdown-menu
 *   ../lib/utils            -> @/lib/utils          （ui/*.tsx、script-engine/*.ts(x) 内引用）
 *   ../ui/button            -> @/components/ui/button
 *   同目录/子目录组件间的相对引用（如 message-bubble.tsx 里的 './task-progress'，或 script-engine/
 *   内部互相引用的 './types'，或 script-engine/*.ts 用 '../clarify-card' 引用父级组件）保持相对路径
 *   不变——因为整个目录结构（agent-ui/、agent-ui/script-engine/）是整体拷贝，层级关系保持不变，
 *   这些相对路径拷贝后依然能正确解析，不需要改写。
 */
function rewriteImports(content) {
  return content
    .replace(/from (['"])\.\.?\/lib\/utils\1/g, "from '@/lib/utils'")
    .replace(/from (['"])\.\.?\/ui\/button\1/g, "from '@/components/ui/button'")
    .replace(/from (['"])\.\.?\/ui\/dropdown-menu\1/g, "from '@/components/ui/dropdown-menu'")
}

/** index.ts 是 agent-ui 组件的 barrel export，layout/* 的导出在脚手架里没有对应的扁平路径
 * （脚手架的布局外壳走 @/components/layout/，不归在 agent-ui/ 下），同步时剔除这两行。 */
function stripLayoutExportsForScaffold(content) {
  return content
    .split('\n')
    .filter((line) => !line.includes("from './layout/"))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      walk(full, files)
    } else if (name.endsWith('.tsx') || name.endsWith('.ts')) {
      files.push(full)
    }
  }
  return files
}

// 每个脚手架只使用自己对应的那一种布局外壳，不把另一种也塞进去。
// 注意：脚手架里历史文件名是 PascalCase（ImmersiveShell.tsx），包内源文件是 kebab-case（immersive-shell.tsx）。
// 同步时统一落地为 PascalCase 文件名，保持脚手架现有引用（@/components/layout/ImmersiveShell）不失效。
const TEMPLATE_LAYOUT_MAP = {
  'immersive-starter': { srcName: 'immersive-shell.tsx', destName: 'ImmersiveShell.tsx' },
  'copilot-starter': { srcName: 'copilot-shell.tsx', destName: 'CopilotShell.tsx' },
}

function buildCommonPlan() {
  // agent-ui/ 组件与 index.ts：packages/agent-ui/src/*.tsx（顶层，不含 lib/ ui/ layout/ script-engine/） -> components/agent-ui/
  const topLevelFiles = readdirSync(PKG_SRC).filter((f) => statSync(join(PKG_SRC, f)).isFile())

  const plan = []
  for (const f of topLevelFiles) {
    plan.push({ src: join(PKG_SRC, f), destSuffix: `src/components/agent-ui/${f}` })
  }

  // script-engine/*.ts(x) -> 各脚手架 components/agent-ui/script-engine/（子目录整体同步，剧本引擎两个
  // 脚手架都需要，用来把 mock/scenarios.json 驱动的对话场景渲染出来）
  const scriptEngineFiles = readdirSync(join(PKG_SRC, 'script-engine')).filter(
    (f) => statSync(join(PKG_SRC, 'script-engine', f)).isFile(),
  )
  for (const f of scriptEngineFiles) {
    plan.push({ src: join(PKG_SRC, 'script-engine', f), destSuffix: `src/components/agent-ui/script-engine/${f}` })
  }

  // ui/{button,dropdown-menu}.tsx -> 各脚手架 components/ui/（脚手架里这两个文件本来就是 shadcn 生成的，
  // 同步时用包内版本覆盖，保证与包内组件用的是同一份 Button/DropdownMenu 实现）
  for (const f of ['button.tsx', 'dropdown-menu.tsx']) {
    plan.push({ src: join(PKG_SRC, 'ui', f), destSuffix: `src/components/ui/${f}` })
  }

  // lib/utils.ts -> 各脚手架 src/lib/utils.ts
  plan.push({ src: join(PKG_SRC, 'lib/utils.ts'), destSuffix: 'src/lib/utils.ts' })

  return plan
}

function main() {
  const commonPlan = buildCommonPlan()
  let driftCount = 0
  let writeCount = 0

  for (const template of TEMPLATES) {
    const templateName = template.split('/').pop()
    const layout = TEMPLATE_LAYOUT_MAP[templateName]
    const plan = layout
      ? [...commonPlan, { src: join(PKG_SRC, 'layout', layout.srcName), destSuffix: `src/components/layout/${layout.destName}` }]
      : commonPlan

    for (const { src, destSuffix } of plan) {
      const raw = readFileSync(src, 'utf-8')
      let rewritten = rewriteImports(raw)
      if (destSuffix === 'src/components/agent-ui/index.ts') {
        rewritten = stripLayoutExportsForScaffold(rewritten)
      }
      const destPath = join(template, destSuffix)

      let current = null
      try {
        current = readFileSync(destPath, 'utf-8')
      } catch {
        // 目标不存在，视为需要写入
      }

      if (current === rewritten) continue

      if (CHECK_ONLY) {
        driftCount++
        console.error(`[sync-agent-ui] 漂移：${relative(ROOT, destPath)}（与 packages/agent-ui 源码不一致）`)
        continue
      }

      mkdirSync(dirname(destPath), { recursive: true })
      writeFileSync(destPath, rewritten)
      writeCount++
      console.log(`[sync-agent-ui] 写入 ${relative(ROOT, destPath)}`)
    }
  }

  if (CHECK_ONLY) {
    if (driftCount > 0) {
      console.error(`\n[sync-agent-ui] 发现 ${driftCount} 处漂移，请运行 \`node scripts/sync-agent-ui.mjs\` 同步。`)
      process.exit(1)
    }
    console.log('[sync-agent-ui] 通过：两套脚手架与 packages/agent-ui 源码一致。')
    return
  }

  console.log(`[sync-agent-ui] 完成，共写入 ${writeCount} 个文件（无变化的文件已跳过）。`)
}

main()
