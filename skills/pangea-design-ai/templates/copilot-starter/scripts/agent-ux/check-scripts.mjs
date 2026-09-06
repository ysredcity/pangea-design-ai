#!/usr/bin/env node
// 验证剧本数据入口：JSON 富场景全量校验；TS 富场景在 tsc 之外补结构化审批校验
// （tsc 只能查类型，awaitingApproval/approvalOutcomes 都是可选字段，查不出"写在中间轮"或"缺一侧结果"）。
// 用法：node check-scripts.mjs [--template immersive-starter|copilot-starter] [--template-dir <目录>]

import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TEMPLATES_DIR = join(SKILL_ROOT, 'templates')
const KNOWN_TEMPLATES = new Set(['immersive-starter', 'copilot-starter'])
const HIGH_RISK_FIELDS = new Set(['object', 'action', 'impact-scope', 'consequence', 'operator'])

function fail(message) {
  console.error(`[check-scripts] ${message}`)
  process.exit(1)
}

function addIssue(issues, path, message) {
  issues.push(`${path}: ${message}`)
}

function validateExecution(execution, path, issues) {
  if (!execution || !Array.isArray(execution.steps)) addIssue(issues, path, 'execution.steps 缺失或不是数组')
  const validateSteps = (steps, stepsPath) => {
    for (const [stepIndex, step] of (steps ?? []).entries()) {
      for (const [actionIndex, action] of (step.actions ?? []).entries()) {
        if (action.targetId !== undefined && typeof action.targetId !== 'string') addIssue(issues, `${stepsPath}[${stepIndex}].actions[${actionIndex}]`, 'targetId 必须是字符串')
      }
    }
  }
  validateSteps(execution?.steps, `${path}.steps`)
  for (const [taskIndex, task] of (execution?.tasks ?? []).entries()) validateSteps(task.steps, `${path}.tasks[${taskIndex}].steps`)
}

function validateAssistant(assistant, path, issues) {
  for (const [index, attachment] of (assistant?.attachments ?? []).entries()) {
    if (typeof attachment.targetId !== 'string' || !attachment.targetId) addIssue(issues, `${path}.attachments[${index}]`, '智能体交付物必须提供 targetId')
  }
  const clarification = assistant?.clarification
  if (clarification?.fields?.length > 10) addIssue(issues, `${path}.clarification`, '澄清字段数超过 design.md 3.3 硬约束（≤10）')
  if (clarification?.followUp) {
    validateExecution(clarification.followUp.execution, `${path}.clarification.followUp.execution`, issues)
    validateAssistant(clarification.followUp.assistant, `${path}.clarification.followUp.assistant`, issues)
  }
}

function validateScene(scene, issues) {
  const scenePath = `scene "${scene?.id ?? '(missing id)'}"`
  if (!scene?.id) addIssue(issues, scenePath, 'id 缺失')
  if (!Array.isArray(scene?.turns)) {
    addIssue(issues, scenePath, 'turns 缺失或不是数组')
    return
  }
  const turnIds = new Set()
  for (const turn of scene.turns) {
    const path = `${scenePath} / turn "${turn?.id ?? '(missing id)'}"`
    if (!turn?.id) addIssue(issues, path, 'id 缺失')
    if (turnIds.has(turn?.id)) addIssue(issues, path, 'turn id 重复')
    turnIds.add(turn?.id)
    validateExecution(turn?.execution, path, issues)
    validateAssistant(turn?.assistant, path, issues)
    for (const [index, attachment] of (turn?.user?.attachments ?? []).entries()) {
      if (attachment.targetId !== undefined && typeof attachment.targetId !== 'string') addIssue(issues, `${path}.user.attachments[${index}]`, 'targetId 必须是字符串')
    }

    const block = turn?.productBlock
    const payload = block?.data
    if (block?.type === 'follow-up-suggestions') {
      const count = payload?.suggestions?.length
      if (count < 2 || count > 4) addIssue(issues, `${path}.productBlock`, 'follow-up 推荐追问数量应为 2–4 个（design.md 3.7）')
    }
    if (block?.type === 'confirm-card' && payload?.riskLevel === 'high') {
      const keys = new Set((payload.fields ?? []).map((field) => field.key))
      const missing = [...HIGH_RISK_FIELDS].filter((key) => !keys.has(key))
      if (missing.length) addIssue(issues, `${path}.productBlock`, `高风险确认卡缺少字段：${missing.join('、')}`)
      if (!turn.awaitingApproval) addIssue(issues, path, '高风险确认卡必须显式设置 awaitingApproval')
    }

    // 审批契约（双向）：awaitingApproval 本身就要求确认卡与双结果，不能只在 high-risk 分支里查。
    if (turn?.awaitingApproval) {
      if (turn !== scene.turns.at(-1)) addIssue(issues, path, 'awaitingApproval 必须写在场景末轮：待批准会阻断新指令，写在中间轮会静默失效')
      if (block?.type !== 'confirm-card') addIssue(issues, path, 'awaitingApproval 必须配一张 confirm-card 产物块，否则用户无处批准')
      const missingOutcomes = ['approved', 'rejected'].filter((outcome) => !turn.approvalOutcomes?.[outcome])
      if (missingOutcomes.length) addIssue(issues, path, `审批轮必须同时提供 approved 与 rejected 的结果，缺少：${missingOutcomes.join('、')}`)
    } else if (turn?.approvalOutcomes) {
      addIssue(issues, path, '提供了 approvalOutcomes 却没有 awaitingApproval：审批结果永远不会渲染')
    }

    for (const outcome of ['approved', 'rejected']) {
      if (turn?.approvalOutcomes?.[outcome]) {
        validateExecution(turn.approvalOutcomes[outcome].execution, `${path}.approvalOutcomes.${outcome}.execution`, issues)
        validateAssistant(turn.approvalOutcomes[outcome].assistant, `${path}.approvalOutcomes.${outcome}.assistant`, issues)
      }
    }
  }
}

function validateLegacyDocument(document, issues) {
  if (!Array.isArray(document?.scenarios)) {
    addIssue(issues, 'document', '顶层 scenarios 字段缺失或不是数组')
    return
  }
  for (const scenario of document.scenarios) {
    const nodeIds = new Set((scenario.nodes ?? []).map((node) => node.id))
    if (!nodeIds.has(scenario.entryNodeId)) addIssue(issues, `scenario "${scenario.id}"`, `entryNodeId "${scenario.entryNodeId}" 在 nodes 中不存在`)
    for (const node of scenario.nodes ?? []) {
      for (const [index, block] of (node.blocks ?? []).entries()) {
        const path = `scenario "${scenario.id}" / node "${node.id}" / block[${index}]`
        if (block.type === 'clarifyCard' && block.fields?.length > 10) addIssue(issues, path, 'clarifyCard 字段数超过 design.md 3.3 硬约束（≤10）')
        if (block.type === 'confirmCard') {
          if (block.fields?.length > 10) addIssue(issues, path, 'confirmCard 字段数超过 design.md 3.4 硬约束（≤10）')
          if (block.riskLevel === 'high' && !block.fields?.length) addIssue(issues, path, '高风险 confirmCard 必须提供 fields')
        }
        if (block.type === 'followUp' && (block.suggestions?.length < 2 || block.suggestions?.length > 4)) addIssue(issues, path, 'followUp 推荐追问数量应为 2–4 个（design.md 3.7）')
        for (const branch of block.branches ?? []) if (!nodeIds.has(branch.goto)) addIssue(issues, path, `分支目标节点 "${branch.goto}" 不存在`)
      }
    }
  }
}

/**
 * trigger 匹配是「子串命中 + 声明顺序首个命中优先」（script-engine/match.ts），
 * 因此跨场景重复或互为子串的 keyword 会让命中结果依赖导出顺序——这类歧义必须在数据层拦住。
 */
function validateTriggers(scenes, issues) {
  const keywords = []
  for (const scene of scenes) {
    if (scene?.trigger?.type !== 'keyword') continue
    for (const pattern of scene.trigger.patterns ?? []) {
      if (typeof pattern !== 'string' || !pattern.trim()) {
        addIssue(issues, `scene "${scene.id}"`, 'trigger.patterns 含空字符串')
        continue
      }
      keywords.push({ pattern, sceneId: scene.id })
    }
  }
  for (const [index, current] of keywords.entries()) {
    for (const other of keywords.slice(index + 1)) {
      if (other.sceneId === current.sceneId) continue
      if (other.pattern === current.pattern) {
        addIssue(issues, `scene "${current.sceneId}"`, `trigger "${current.pattern}" 与 scene "${other.sceneId}" 完全重复：命中结果只取决于导出顺序`)
      } else if (other.pattern.includes(current.pattern) || current.pattern.includes(other.pattern)) {
        const [broad, narrow] = current.pattern.length <= other.pattern.length ? [current, other] : [other, current]
        addIssue(issues, `scene "${broad.sceneId}"`, `trigger "${broad.pattern}" 是 scene "${narrow.sceneId}" 的 "${narrow.pattern}" 的子串：宽泛词会抢占更精确的场景，请改用专属动词短语`)
      }
    }
  }
}

function validateJsonDocument(document, issues) {
  if (Array.isArray(document?.scenarios)) {
    validateLegacyDocument(document, issues)
    return
  }
  if (!Array.isArray(document?.scenes)) {
    addIssue(issues, 'document', 'JSON 双数据源必须使用顶层 scenes 数组')
    return
  }
  const ids = new Set()
  for (const scene of document.scenes) {
    validateScene(scene, issues)
    if (ids.has(scene?.id)) addIssue(issues, `scene "${scene?.id}"`, 'scene id 重复')
    ids.add(scene?.id)
  }
  validateTriggers(document.scenes, issues)
}

/**
 * 去掉注释与字符串字面量内容，只保留结构性括号。
 * 场景文案里含 `[[file:xxx]]` 这类内联标签，不清理字符串会把括号深度算错。
 */
function stripLiterals(source) {
  let out = ''
  let index = 0
  while (index < source.length) {
    const char = source[index]
    const next = source[index + 1]
    if (char === '/' && next === '/') {
      const end = source.indexOf('\n', index)
      index = end < 0 ? source.length : end
      continue
    }
    if (char === '/' && next === '*') {
      const end = source.indexOf('*/', index + 2)
      index = end < 0 ? source.length : end + 2
      continue
    }
    if (char === '"' || char === "'" || char === '`') {
      index += 1
      while (index < source.length) {
        if (source[index] === '\\') { index += 2; continue }
        if (source[index] === char) { index += 1; break }
        index += 1
      }
      out += '""'
      continue
    }
    out += char
    index += 1
  }
  return out
}

/** 从 `key: [` 或 `key: {` 起，按括号深度截取其完整字面量，返回 [起点, 终点)。 */
function literalRange(source, startIndex) {
  const open = source[startIndex]
  const close = open === '[' ? ']' : '}'
  let depth = 0
  for (let index = startIndex; index < source.length; index += 1) {
    if (source[index] === open) depth += 1
    else if (source[index] === close) {
      depth -= 1
      if (depth === 0) return [startIndex, index + 1]
    }
  }
  return null
}

/** 把数组字面量按顶层逗号切成元素源码片段。 */
function splitTopLevel(arraySource) {
  const items = []
  let depth = 0
  let start = 1
  for (let index = 1; index < arraySource.length - 1; index += 1) {
    const char = arraySource[index]
    if (char === '{' || char === '[' || char === '(') depth += 1
    else if (char === '}' || char === ']' || char === ')') depth -= 1
    else if (char === ',' && depth === 0) {
      const item = arraySource.slice(start, index).trim()
      if (item) items.push(item)
      start = index + 1
    }
  }
  const tail = arraySource.slice(start, arraySource.length - 1).trim()
  if (tail) items.push(tail)
  return items
}

/** 该 turn 片段的**顶层**是否含某个 key（排除嵌套在 approvalOutcomes 等子对象里的同名 key）。 */
function hasOwnKey(objectSource, key) {
  let depth = 0
  for (let index = 0; index < objectSource.length; index += 1) {
    const char = objectSource[index]
    if (char === '{' || char === '[' || char === '(') { depth += 1; continue }
    if (char === '}' || char === ']' || char === ')') { depth -= 1; continue }
    if (depth !== 1) continue
    if (!objectSource.startsWith(key, index)) continue
    const before = objectSource[index - 1]
    if (before && /[\w$]/.test(before)) continue
    const after = objectSource.slice(index + key.length).match(/^\s*:/)
    if (after) return true
  }
  return false
}

/** TS 场景的 trigger 冲突校验：把 `"<id>": { trigger: { … patterns: [...] } }` 抽成场景后复用同一套规则。 */
function validateTsTriggers(raw, sourceFile, issues) {
  const scenes = []
  const scenePattern = /["']([\w-]+)["']\s*:\s*\{\s*trigger\s*:\s*\{([^}]*)\}/g
  let match
  while ((match = scenePattern.exec(raw))) {
    const [, id, body] = match
    const typeMatch = body.match(/type\s*:\s*["'](\w+)["']/)
    const patternsMatch = body.match(/patterns\s*:\s*\[([^\]]*)\]/)
    if (!patternsMatch) continue
    const patterns = [...patternsMatch[1].matchAll(/["']([^"']*)["']/g)].map((item) => item[1])
    scenes.push({ id, trigger: { type: typeMatch?.[1] ?? 'keyword', patterns } })
  }
  if (!scenes.length) return
  const scoped = []
  validateTriggers(scenes, scoped)
  for (const issue of scoped) addIssue(issues, sourceFile, issue)
}

/**
 * TS 富场景的结构化校验：tsc 只保证类型，查不出「awaitingApproval 写在中间轮」
 * 「审批轮缺一侧结果」这类语义错误，这里用括号深度扫描补上。
 */
function validateTsScenes(sourceFile, issues) {
  const raw = readFileSync(sourceFile, 'utf-8')
  validateTsTriggers(raw, sourceFile, issues)
  const source = stripLiterals(raw)
  const turnsKey = /\bturns\s*:\s*\[/g
  let match
  let scanned = 0
  while ((match = turnsKey.exec(source))) {
    const arrayStart = source.indexOf('[', match.index)
    const range = literalRange(source, arrayStart)
    if (!range) continue
    const turns = splitTopLevel(source.slice(range[0], range[1]))
    if (!turns.length) continue
    scanned += 1
    const sceneLabel = `${sourceFile} / turns@${match.index}`
    for (const [index, turn] of turns.entries()) {
      if (!/\bawaitingApproval\s*:\s*true\b/.test(turn)) {
        if (hasOwnKey(turn, 'approvalOutcomes')) addIssue(issues, `${sceneLabel} / turn[${index}]`, '提供了 approvalOutcomes 却没有 awaitingApproval: true：审批结果永远不会渲染')
        continue
      }
      const path = `${sceneLabel} / turn[${index}]`
      if (index !== turns.length - 1) addIssue(issues, path, 'awaitingApproval 必须写在场景末轮：待批准会阻断新指令，写在中间轮会静默失效')
      if (!hasOwnKey(turn, 'productBlock')) addIssue(issues, path, 'awaitingApproval 必须配一张 confirm-card 产物块，否则用户无处批准')
      if (!hasOwnKey(turn, 'approvalOutcomes')) addIssue(issues, path, '审批轮必须提供 approvalOutcomes 的 approved 与 rejected 结果')
      else for (const outcome of ['approved', 'rejected']) {
        if (!new RegExp(`\\b${outcome}\\s*:`).test(turn)) addIssue(issues, path, `审批轮缺少 ${outcome} 结果分支`)
      }
    }
  }
  return scanned
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

  const tsScenes = join(templateDir, 'src/components/agent-layout/scenes.ts')
  const jsonScenes = join(templateDir, 'src/mock/scenarios.json')
  if (existsSync(tsScenes)) {
    // TS 场景入口的实际数据通常在 conversation-data.ts；两者都扫。
    const issues = []
    let scanned = 0
    for (const candidate of [tsScenes, join(templateDir, 'src/components/agent-layout/conversation-data.ts')]) {
      if (existsSync(candidate)) scanned += validateTsScenes(candidate, issues)
    }
    if (issues.length) {
      console.error(`\n[check-scripts] ${tsScenes} 发现 ${issues.length} 处问题：`)
      for (const issue of issues) console.error(`  - ${issue}`)
      totalIssues += issues.length
    } else console.log(`[check-scripts] ${tsScenes} 通过（TS 富场景入口：tsc 查类型 + 审批结构校验 ${scanned} 组 turns）。`)
    continue
  }
  if (!existsSync(jsonScenes)) {
    console.log(`[check-scripts] ${templateDir} 未声明剧本数据入口，跳过。`)
    continue
  }

  let document
  try { document = JSON.parse(readFileSync(jsonScenes, 'utf-8')) } catch (error) {
    fail(`${jsonScenes}：无法读取或解析 JSON — ${error.message}`)
  }
  const issues = []
  validateJsonDocument(document, issues)
  if (issues.length) {
    console.error(`\n[check-scripts] ${jsonScenes} 发现 ${issues.length} 处问题：`)
    for (const issue of issues) console.error(`  - ${issue}`)
    totalIssues += issues.length
  } else console.log(`[check-scripts] ${jsonScenes} 通过（JSON 剧本入口）。`)
}

if (totalIssues > 0) {
  console.error(`\n[check-scripts] 共发现 ${totalIssues} 处问题。`)
  process.exit(1)
}
console.log('[check-scripts] 全部通过。')
