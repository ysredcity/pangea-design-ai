#!/usr/bin/env node
// 零依赖：扫描 references/patterns/*.md 与 references/component-selection/*.md 的 frontmatter meta，
// 生成机读索引 references/_generated/catalog.json。规范见 references/overview/metadata-schema.md。
// 用法：node scripts/build-catalog.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REFERENCES = join(SKILL_ROOT, 'references')
const OUT_DIR = join(REFERENCES, '_generated')
const OUT_FILE = join(OUT_DIR, 'catalog.json')

const SOURCE_DIRS = [
  { dir: join(REFERENCES, 'patterns'), kind: 'layout-shell' },
  { dir: join(REFERENCES, 'component-selection'), kind: 'component' },
]

/** 极简 YAML frontmatter 解析：只支持本项目 meta 块用到的 string / string[] / nested map 结构。 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null
  const lines = match[1].split('\n')
  const root = {}
  let currentKey = null
  let currentObj = root
  let listKey = null

  for (const line of lines) {
    if (/^\S/.test(line)) {
      // 顶层 key
      const m = line.match(/^([\w-]+):\s*(.*)$/)
      if (!m) continue
      const [, key, val] = m
      if (val === '') {
        currentKey = key
        currentObj = {}
        root[key] = currentObj
        listKey = null
      } else {
        root[key] = stripQuotes(val)
        currentKey = null
      }
      continue
    }
    if (currentKey && /^\s{2}\S/.test(line)) {
      const m = line.match(/^\s{2}([\w-]+):\s*(.*)$/)
      if (m) {
        const [, k, v] = m
        currentObj[k] = parseInlineValue(v)
        listKey = k
      }
    }
  }
  return root
}

function parseInlineValue(v) {
  const trimmed = v.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim()
    if (!inner) return []
    return inner.split(',').map((s) => stripQuotes(s.trim()))
  }
  return stripQuotes(trimmed)
}

function stripQuotes(s) {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1)
  }
  return s
}

function main() {
  const layoutShells = []
  const components = []

  for (const { dir, kind } of SOURCE_DIRS) {
    let entries = []
    try {
      entries = readdirSync(dir).filter((f) => f.endsWith('.md'))
    } catch {
      continue
    }
    for (const file of entries) {
      const fullPath = join(dir, file)
      const raw = readFileSync(fullPath, 'utf-8')
      const fm = parseFrontmatter(raw)
      const meta = fm?.meta
      if (!meta || !meta.id) continue

      const docRelPath = `references/${dir.endsWith('patterns') ? 'patterns' : 'component-selection'}/${file}`
      const entry = { ...meta, doc: docRelPath }

      if (meta.kind === 'layout-shell' || kind === 'layout-shell') {
        layoutShells.push(entry)
      } else {
        components.push(entry)
      }
    }
  }

  mkdirSync(OUT_DIR, { recursive: true })
  const catalog = {
    generatedAt: new Date().toISOString(),
    layoutShells,
    components,
  }
  writeFileSync(OUT_FILE, JSON.stringify(catalog, null, 2) + '\n')
  console.log(
    `[build-catalog] 写入 ${OUT_FILE}：${layoutShells.length} 个布局外壳，${components.length} 个组件。`,
  )
}

main()
