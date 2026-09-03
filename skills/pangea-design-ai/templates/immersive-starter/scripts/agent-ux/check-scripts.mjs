#!/usr/bin/env node
// 验证剧本数据入口：TS 富场景由 tsc 检查；JSON 富场景额外校验 targetId 与审批契约。
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
      if (!turn.approvalOutcomes?.approved || !turn.approvalOutcomes?.rejected) addIssue(issues, path, '高风险确认卡必须提供 approved 与 rejected 的结果')
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
    console.log(`[check-scripts] ${tsScenes} 使用 TS 富场景入口（由 tsc 校验）。`)
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
