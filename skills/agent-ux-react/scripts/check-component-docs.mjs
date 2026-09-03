#!/usr/bin/env node
// 零依赖：校验 components 文档的必填 metadata、源码事实源与设计规则文档路径。

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const SKILL_ROOT = resolve(SCRIPT_DIR, '..')
const REPO_ROOT = resolve(SKILL_ROOT, '../..')
const COMPONENTS_ROOT = join(SKILL_ROOT, 'references/components')
const REQUIRED_META = ['id', 'kind', 'layer', 'title', 'exported', 'source', 'designRules']
const LAYERS = new Set(['delegation', 'conversation', 'process', 'artifact', 'shell', 'registry'])

function componentDocs(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return componentDocs(path)
    if (!entry.isFile() || !entry.name.endsWith('.md')) return []
    if (entry.name === 'README.md' || entry.name === 'base-inventory.md') return []
    return [path]
  })
}

function parseValue(value) {
  const trimmed = value.trim()
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const contents = trimmed.slice(1, -1).trim()
    return contents ? contents.split(',').map((item) => stripQuotes(item.trim())) : []
  }
  return stripQuotes(trimmed)
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  return value
}

function parseMeta(raw) {
  const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!frontmatter) return { error: 'frontmatter' }

  const meta = {}
  let inMeta = false
  for (const line of frontmatter[1].split(/\r?\n/)) {
    if (line === 'meta:') {
      inMeta = true
      continue
    }
    if (inMeta && /^\S/.test(line)) break
    if (!inMeta) continue
    const match = line.match(/^\s{2}([\w-]+):\s*(.*)$/)
    if (match) meta[match[1]] = parseValue(match[2])
  }
  return { meta }
}

function main() {
  const errors = []
  for (const doc of componentDocs(COMPONENTS_ROOT)) {
    const label = relative(REPO_ROOT, doc)
    const { error, meta } = parseMeta(readFileSync(doc, 'utf8'))
    if (error) {
      errors.push(`${label}: ${error} is required`)
      continue
    }

    for (const field of REQUIRED_META) {
      if (meta[field] === undefined || meta[field] === '' || (Array.isArray(meta[field]) && meta[field].length === 0)) {
        errors.push(`${label}: meta.${field} is required`)
      }
    }

    if (meta.layer !== undefined && !LAYERS.has(meta.layer)) {
      errors.push(`${label}: meta.layer must be one of ${[...LAYERS].join(', ')}`)
    }

    if (meta.source === 'Phase 4 planned') {
      if (meta.exported !== false) errors.push(`${label}: meta.exported must be false when meta.source is Phase 4 planned`)
    } else if (typeof meta.source === 'string' && meta.source) {
      for (const source of meta.source.split(';').map((item) => item.trim()).filter(Boolean)) {
        const sourcePath = resolve(REPO_ROOT, source)
        if (!existsSync(sourcePath)) errors.push(`${label}: meta.source does not exist: ${source}`)
      }
    }

    if (Array.isArray(meta.designRules)) {
      for (const rule of meta.designRules) {
        const docPath = rule.split('#', 1)[0]
        if (!docPath) {
          errors.push(`${label}: meta.designRules entry must include a document path: ${rule}`)
          continue
        }
        if (!existsSync(resolve(SKILL_ROOT, 'references', docPath))) {
          errors.push(`${label}: meta.designRules document does not exist: ${docPath}`)
        }
      }
    } else if (meta.designRules !== undefined) {
      errors.push(`${label}: meta.designRules must be an array`)
    }
  }

  if (errors.length) {
    console.error(`[check-component-docs] ${errors.length} issue(s):`)
    for (const error of errors) console.error(`- ${error}`)
    process.exitCode = 1
    return
  }
  console.log(`[check-component-docs] passed: ${componentDocs(COMPONENTS_ROOT).length} component documents checked.`)
}

main()
