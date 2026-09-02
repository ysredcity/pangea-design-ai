#!/usr/bin/env node
// 零依赖机检：扫描 templates/*/src/**/*.{tsx,ts} 中的裸颜色值（hex / rgb() / rgba()）与其它硬编码 token 违规。
// 对应质量门禁 G2（见 references/overview/quality-gates.md）。
// 用法：node scripts/check-tokens.mjs [--template immersive-starter|copilot-starter]

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TEMPLATES_DIR = join(SKILL_ROOT, 'templates')

const HEX_RE = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g
const RGB_RE = /\brgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g
// 允许的例外：shadcn 组件源码本身（`components/ui/`）以 oklch/hsl 数学换算实现视觉效果时可能出现，
// 但本项目 globals.css 未使用裸 hex，故不豁免 components/ui。真正需要豁免时在此数组按相对路径加白名单。
const EXEMPT_PATHS = []

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue
    const full = join(dir, name)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walk(full, files)
    } else if (/\.(tsx?|css)$/.test(name)) {
      files.push(full)
    }
  }
  return files
}

function scanFile(filePath) {
  const raw = readFileSync(filePath, 'utf-8')
  const violations = []
  const lines = raw.split('\n')
  lines.forEach((line, i) => {
    // globals.css 里定义 token 本身允许出现调色板引用（--color-teal-600 等），跳过纯 CSS 变量定义行
    if (filePath.endsWith('globals.css')) return
    // 跳过注释行的误报（简单启发式，非完整解析）
    const codeOnly = line.split('//')[0]
    const hexMatches = codeOnly.match(HEX_RE)
    const rgbMatches = codeOnly.match(RGB_RE)
    if (hexMatches) violations.push({ line: i + 1, match: hexMatches[0], type: 'hex' })
    if (rgbMatches) violations.push({ line: i + 1, match: rgbMatches[0], type: 'rgb' })
  })
  return violations
}

function main() {
  const templateArgIndex = process.argv.indexOf('--template')
  const templates =
    templateArgIndex >= 0 ? [process.argv[templateArgIndex + 1]] : ['immersive-starter', 'copilot-starter']

  let totalViolations = 0

  for (const tpl of templates) {
    const srcDir = join(TEMPLATES_DIR, tpl, 'src')
    let files = []
    try {
      files = walk(srcDir)
    } catch {
      console.warn(`[check-tokens] 跳过（未找到）：${srcDir}`)
      continue
    }

    for (const file of files) {
      const relPath = relative(SKILL_ROOT, file)
      if (EXEMPT_PATHS.some((p) => relPath.includes(p))) continue

      const violations = scanFile(file)
      for (const v of violations) {
        console.error(`${relPath}:${v.line}  裸${v.type === 'hex' ? '色值' : 'rgb()'} "${v.match}"（G2：颜色只能用 Tailwind 语义类）`)
        totalViolations++
      }
    }
  }

  if (totalViolations > 0) {
    console.error(`\n[check-tokens] 发现 ${totalViolations} 处违规。`)
    process.exit(1)
  }
  console.log('[check-tokens] 通过：未发现裸色值。')
}

main()
