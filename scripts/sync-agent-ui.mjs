#!/usr/bin/env node
/** Materialize shared Base UI code and portable quality gates into standalone templates. */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'packages/agent-ui/src')
const skillScripts = join(root, 'skills/agent-ux-react/scripts')
const templates = [
  { name: 'immersive-starter', shell: 'immersive' },
  { name: 'copilot-starter', shell: 'copilot' },
]
const check = process.argv.includes('--check')

function files(dir, pattern) {
  return readdirSync(dir).flatMap((entry) => {
    const item = join(dir, entry)
    return statSync(item).isDirectory() ? files(item, pattern) : [item]
  }).filter((item) => pattern.test(item))
}

function materialize(template, sourceFile, destination) {
  let content = readFileSync(sourceFile, 'utf8')
  if (relative(source, sourceFile) === 'conversation/confirm-card.tsx') {
    content = content.replace(
      "import { Button } from '../ui/button'",
      "import { Button } from '@/components/ui/button'",
    )
  }
  let existing = ''
  try { existing = readFileSync(destination, 'utf8') } catch { /* missing generated source */ }
  if (existing === content) return 0
  if (check) console.error(`[sync-agent-ui] ${template.name} drift: ${relative(root, destination)}`)
  else {
    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, content)
    console.log(`[sync-agent-ui] wrote ${relative(root, destination)}`)
  }
  return 1
}

let changes = 0
for (const template of templates) {
  const templateRoot = join(root, 'skills/agent-ux-react/templates', template.name)
  const targetRoot = join(templateRoot, 'src/agent-ui')
  for (const sourceRoot of [join(source, 'conversation'), join(source, template.shell)]) {
    for (const file of files(sourceRoot, /\.(ts|tsx)$/)) {
      changes += materialize(template, file, join(targetRoot, relative(source, file)))
    }
  }

  for (const gate of ['check-tokens.mjs', 'check-scripts.mjs']) {
    changes += materialize(template, join(skillScripts, gate), join(templateRoot, 'scripts/agent-ux', gate))
  }
}

if (check && changes) process.exitCode = 1
else console.log(`[sync-agent-ui] ${check ? 'passed' : 'complete'}: ${changes} file(s) ${check ? 'would change' : 'written'}.`)
