#!/usr/bin/env node
// 机检 mock/scenarios.json 是否违反 design.md 硬约束（G5/G6）。
// 对应方案文档 docs/proposals/mock-script-engine.md 第 5 节"决策点"里的"校验"一项。
// 用法：node scripts/check-scripts.mjs [--template immersive-starter|copilot-starter]
//
// 说明：这是纯 JSON 结构校验（不依赖 packages/agent-ui 的 TS 类型），复用与
// packages/agent-ui/src/script-engine/parse.ts 相同的规则集，但独立实现——
// 因为这个脚本要能在不装 TS 编译工具链的情况下用纯 Node 跑，parse.ts 里的规则
// 如果未来有变化，两处都要同步修改（已记录在 PROJECT_CONTEXT.md 待办）。

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TEMPLATES_DIR = join(SKILL_ROOT, 'templates')

function validateScenario(scenario, issues) {
  const nodeIds = new Set(scenario.nodes.map((n) => n.id))

  if (!nodeIds.has(scenario.entryNodeId)) {
    issues.push(`scenario "${scenario.id}": entryNodeId "${scenario.entryNodeId}" 在 nodes 中不存在`)
  }

  for (const node of scenario.nodes) {
    node.blocks.forEach((block, i) => {
      const loc = `scenario "${scenario.id}" / node "${node.id}" / block[${i}]`

      if (block.type === 'clarifyCard') {
        if (block.fields.length > 10) {
          issues.push(`${loc}: clarifyCard 字段数为 ${block.fields.length}，超过 design.md 3.3 硬约束（≤10）`)
        }
        if (!block.branches || block.branches.length === 0) {
          issues.push(`${loc}: clarifyCard 未定义 branches`)
        }
      }

      if (block.type === 'confirmCard') {
        if (block.fields && block.fields.length > 10) {
          issues.push(`${loc}: confirmCard 字段数为 ${block.fields.length}，超过 design.md 3.4 硬约束（≤10）`)
        }
        if (block.riskLevel === 'high' && (!block.fields || block.fields.length === 0)) {
          issues.push(`${loc}: confirmCard riskLevel=high 但未提供 fields，违反 design.md 3.4/4.1`)
        }
        if (!block.branches || block.branches.length === 0) {
          issues.push(`${loc}: confirmCard 未定义 branches`)
        }
      }

      if (block.type === 'followUp') {
        if (block.suggestions.length < 2 || block.suggestions.length > 4) {
          issues.push(`${loc}: followUp 推荐追问数量为 ${block.suggestions.length}，应为 2-4 个（design.md 3.7）`)
        }
      }

      if ((block.type === 'clarifyCard' || block.type === 'confirmCard') && block.branches) {
        for (const branch of block.branches) {
          if (!nodeIds.has(branch.goto)) {
            issues.push(`${loc}: 分支 "${branch.on}" 的 goto 目标节点 "${branch.goto}" 不存在`)
          }
        }
      }
    })
  }
}

function validateDocument(doc, issues) {
  if (!Array.isArray(doc.scenarios)) {
    issues.push('顶层 scenarios 字段缺失或不是数组')
    return
  }
  for (const scenario of doc.scenarios) {
    validateScenario(scenario, issues)
  }
  if (doc.fallback && (!Array.isArray(doc.fallback.pool) || doc.fallback.pool.length === 0)) {
    issues.push('fallback.pool 为空数组或缺失')
  }
}

function findScenariosFiles(templateDir) {
  const mockDir = join(templateDir, 'src/mock')
  let entries = []
  try {
    entries = readdirSync(mockDir)
  } catch {
    return []
  }
  return entries
    .filter((f) => f === 'scenarios.json')
    .map((f) => join(mockDir, f))
}

function main() {
  const templateArgIndex = process.argv.indexOf('--template')
  const templates =
    templateArgIndex >= 0 ? [process.argv[templateArgIndex + 1]] : ['immersive-starter', 'copilot-starter']

  let totalIssues = 0

  for (const tpl of templates) {
    const templateDir = join(TEMPLATES_DIR, tpl)
    let dirStat
    try {
      dirStat = statSync(templateDir)
    } catch {
      console.warn(`[check-scripts] 跳过（未找到）：${templateDir}`)
      continue
    }
    if (!dirStat.isDirectory()) continue

    const files = findScenariosFiles(templateDir)
    if (files.length === 0) {
      console.log(`[check-scripts] ${tpl}：未找到 src/mock/scenarios.json，跳过`)
      continue
    }

    for (const file of files) {
      const issues = []
      let doc
      try {
        doc = JSON.parse(readFileSync(file, 'utf-8'))
      } catch (err) {
        console.error(`[check-scripts] ${file}：JSON 解析失败 — ${err.message}`)
        totalIssues++
        continue
      }
      validateDocument(doc, issues)
      if (issues.length > 0) {
        console.error(`\n[check-scripts] ${file} 发现 ${issues.length} 处问题：`)
        for (const issue of issues) console.error(`  - ${issue}`)
        totalIssues += issues.length
      } else {
        console.log(`[check-scripts] ${file} 通过`)
      }
    }
  }

  if (totalIssues > 0) {
    console.error(`\n[check-scripts] 共发现 ${totalIssues} 处问题。`)
    process.exit(1)
  }
  console.log('[check-scripts] 全部通过。')
}

main()
