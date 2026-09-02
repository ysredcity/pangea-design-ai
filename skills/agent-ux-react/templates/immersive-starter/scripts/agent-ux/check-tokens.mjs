#!/usr/bin/env node
// 零依赖机检：扫描模板 src/**/*.{tsx,ts,css} 中的裸颜色值（hex / rgb() / rgba()）。
// 对应质量门禁 G2（见 references/overview/quality-gates.md）。
// 用法：node check-tokens.mjs [--template immersive-starter|copilot-starter] [--template-dir <目录>]

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TEMPLATES_DIR = join(SKILL_ROOT, 'templates')
const KNOWN_TEMPLATES = new Set(['immersive-starter', 'copilot-starter'])

const HEX_RE = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g
const RGB_RE = /\brgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g
const EXEMPT_PATHS = []

function fail(message) {
  console.error(`[check-tokens] ${message}`)
  process.exit(1)
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue
    const full = join(dir, name)
    const stat = statSync(full)
    if (stat.isDirectory()) walk(full, files)
    else if (/\.(tsx?|css)$/.test(name)) files.push(full)
  }
  return files
}

function scanFile(filePath) {
  const raw = readFileSync(filePath, 'utf-8')
  const violations = []
  raw.split('\n').forEach((line, index) => {
    if (filePath.endsWith('globals.css')) return
    const codeOnly = line.split('//')[0]
    const hexMatches = codeOnly.match(HEX_RE)
    const rgbMatches = codeOnly.match(RGB_RE)
    if (hexMatches) violations.push({ line: index + 1, match: hexMatches[0], type: 'hex' })
    if (rgbMatches) violations.push({ line: index + 1, match: rgbMatches[0], type: 'rgb' })
  })
  return violations
}

function resolveTemplateDirs() {
  const dirIndex = process.argv.indexOf('--template-dir')
  if (dirIndex >= 0) {
    const value = process.argv[dirIndex + 1]
    if (!value) fail('--template-dir 缺少目录参数。')
    return [resolve(process.cwd(), value)]
  }

  const templateIndex = process.argv.indexOf('--template')
  if (templateIndex < 0) return [...KNOWN_TEMPLATES].map((name) => join(TEMPLATES_DIR, name))
  const name = process.argv[templateIndex + 1]
  if (!KNOWN_TEMPLATES.has(name)) fail(`未知模板 "${name}"。`)
  return [join(TEMPLATES_DIR, name)]
}

let totalViolations = 0
for (const templateDir of resolveTemplateDirs()) {
  let dirStat
  try { dirStat = statSync(templateDir) } catch { fail(`未找到模板目录：${templateDir}`) }
  if (!dirStat.isDirectory()) fail(`模板路径不是目录：${templateDir}`)

  const srcDir = join(templateDir, 'src')
  let sourceFiles
  try { sourceFiles = walk(srcDir) } catch { fail(`未找到模板源码目录：${srcDir}`) }

  for (const file of sourceFiles) {
    const relPath = relative(templateDir, file)
    if (EXEMPT_PATHS.some((item) => relPath.includes(item))) continue
    for (const violation of scanFile(file)) {
      console.error(`${relPath}:${violation.line}  裸${violation.type === 'hex' ? '色值' : 'rgb()'} "${violation.match}"（G2：颜色只能用 Tailwind 语义类）`)
      totalViolations++
    }
  }
}

if (totalViolations > 0) {
  console.error(`\n[check-tokens] 发现 ${totalViolations} 处违规。`)
  process.exit(1)
}
console.log('[check-tokens] 通过：未发现裸色值。')
