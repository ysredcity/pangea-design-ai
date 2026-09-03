#!/usr/bin/env node
// 机检 mock/scenarios.json 是否违反 design.md 硬约束（G5/G6）。
// 用法：node check-scripts.mjs [--template immersive-starter|copilot-starter] [--template-dir <目录>]

import { readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TEMPLATES_DIR = join(SKILL_ROOT, 'templates')
const KNOWN_TEMPLATES = new Set(['immersive-starter', 'copilot-starter'])

function fail(message) {
  console.error(`[check-scripts] ${message}`)
  process.exit(1)
}

function validateScenario(scenario, issues) {
  const nodeIds = new Set(scenario.nodes.map((node) => node.id))
  if (!nodeIds.has(scenario.entryNodeId)) issues.push(`scenario "${scenario.id}": entryNodeId "${scenario.entryNodeId}" 在 nodes 中不存在`)

  for (const node of scenario.nodes) {
    node.blocks.forEach((block, index) => {
      const location = `scenario "${scenario.id}" / node "${node.id}" / block[${index}]`
      if (block.type === 'clarifyCard') {
        if (block.fields.length > 10) issues.push(`${location}: clarifyCard 字段数为 ${block.fields.length}，超过 design.md 3.3 硬约束（≤10）`)
        if (!block.branches?.length) issues.push(`${location}: clarifyCard 未定义 branches`)
      }
      if (block.type === 'confirmCard') {
        if (block.fields && block.fields.length > 10) issues.push(`${location}: confirmCard 字段数为 ${block.fields.length}，超过 design.md 3.4 硬约束（≤10）`)
        if (block.riskLevel === 'high' && !block.fields?.length) issues.push(`${location}: confirmCard riskLevel=high 但未提供 fields，违反 design.md 3.4/4.1`)
        if (!block.branches?.length) issues.push(`${location}: confirmCard 未定义 branches`)
      }
      if (block.type === 'followUp' && (block.suggestions.length < 2 || block.suggestions.length > 4)) {
        issues.push(`${location}: followUp 推荐追问数量为 ${block.suggestions.length}，应为 2-4 个（design.md 3.7）`)
      }
      if ((block.type === 'clarifyCard' || block.type === 'confirmCard') && block.branches) {
        for (const branch of block.branches) if (!nodeIds.has(branch.goto)) issues.push(`${location}: 分支 "${branch.on}" 的 goto 目标节点 "${branch.goto}" 不存在`)
      }
    })
  }
}

function validateDocument(document, issues) {
  if (!Array.isArray(document.scenarios)) {
    issues.push('顶层 scenarios 字段缺失或不是数组')
    return
  }
  for (const scenario of document.scenarios) validateScenario(scenario, issues)
  if (document.fallback && (!Array.isArray(document.fallback.pool) || document.fallback.pool.length === 0)) issues.push('fallback.pool 为空数组或缺失')
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

let totalIssues = 0
for (const templateDir of resolveTemplateDirs()) {
  let dirStat
  try { dirStat = statSync(templateDir) } catch { fail(`未找到模板目录：${templateDir}`) }
  if (!dirStat.isDirectory()) fail(`模板路径不是目录：${templateDir}`)

  const scenarioPath = join(templateDir, 'src/mock/scenarios.json')
  let document
  try { document = JSON.parse(readFileSync(scenarioPath, 'utf-8')) } catch (error) {
    fail(`${scenarioPath}：无法读取或解析 JSON — ${error.message}`)
  }

  const issues = []
  validateDocument(document, issues)
  if (issues.length) {
    console.error(`\n[check-scripts] ${scenarioPath} 发现 ${issues.length} 处问题：`)
    for (const issue of issues) console.error(`  - ${issue}`)
    totalIssues += issues.length
  } else console.log(`[check-scripts] ${scenarioPath} 通过`)
}

if (totalIssues > 0) {
  console.error(`\n[check-scripts] 共发现 ${totalIssues} 处问题。`)
  process.exit(1)
}
console.log('[check-scripts] 全部通过。')
