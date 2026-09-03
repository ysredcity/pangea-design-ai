#!/usr/bin/env node
/** Materialize package-owned Base UI and immersive runtime into standalone templates. */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'packages/agent-ui/src')
const skillScripts = join(root, 'skills/pangea-design-ai/scripts')
const templates = [{ name: 'immersive-starter', shell: 'immersive' }, { name: 'copilot-starter', shell: 'copilot' }]
const check = process.argv.includes('--check')
const files = (dir, pattern) => readdirSync(dir).flatMap((entry) => { const item = join(dir, entry); return statSync(item).isDirectory() ? files(item, pattern) : [item] }).filter((item) => pattern.test(item))

function rewriteForTemplate(sourceFile, content) {
  const packagePath = relative(source, sourceFile).replaceAll('\\', '/')
  if (!packagePath.startsWith('immersive/')) {
    if (packagePath === 'conversation/confirm-card.tsx') return content.replace("import { Button } from '../ui/button'", "import { Button } from '@/components/ui/button'")
    return content
  }
  if (packagePath === 'immersive/agent-app.tsx') return content.replace("from './agent-layout/agent-shell'", "from '@/components/agent-layout/agent-shell'")
  return content
    .replaceAll('../ui/', '@/components/ui/')
    .replaceAll('../hooks/', '@/hooks/')
    .replaceAll('../lib/', '@/lib/')
    .replaceAll('../../conversation', '@/agent-ui/conversation')
    .replaceAll('../contracts', '@/agent-ui/immersive/contracts')
}

function materialize(template, sourceFile, destination) {
  const content = rewriteForTemplate(sourceFile, readFileSync(sourceFile, 'utf8'))
  let existing = ''
  try { existing = readFileSync(destination, 'utf8') } catch { /* generated file does not exist yet */ }
  if (existing === content) return 0
  if (check) console.error(`[sync-agent-ui] ${template.name} drift: ${relative(root, destination)}`)
  else { mkdirSync(dirname(destination), { recursive: true }); writeFileSync(destination, content); console.log(`[sync-agent-ui] wrote ${relative(root, destination)}`) }
  return 1
}

let changes = 0
for (const template of templates) {
  const templateRoot = join(root, 'skills/pangea-design-ai/templates', template.name)
  const targetRoot = join(templateRoot, 'src/agent-ui')
  const sourceRoots = template.shell === 'immersive'
    ? [join(source, 'conversation'), join(source, 'script-engine')]
    : [join(source, 'conversation'), join(source, template.shell), join(source, 'script-engine')]
  for (const sourceRoot of sourceRoots) {
    for (const file of files(sourceRoot, /\.(ts|tsx)$/)) changes += materialize(template, file, join(targetRoot, relative(source, file)))
  }
  if (template.shell === 'immersive') {
    for (const entry of ['agent-app.tsx', 'contracts.ts', 'index.ts']) changes += materialize(template, join(source, 'immersive', entry), join(targetRoot, 'immersive', entry))
    for (const [from, to, pattern] of [
      [join(source, 'immersive/agent-layout'), join(templateRoot, 'src/components/agent-layout'), /\.(ts|tsx)$/],
      [join(source, 'immersive/ui'), join(templateRoot, 'src/components/ui'), /\.(ts|tsx)$/],
      [join(source, 'immersive/hooks'), join(templateRoot, 'src/hooks'), /\.ts$/],
      [join(source, 'immersive/lib'), join(templateRoot, 'src/lib'), /\.ts$/],
    ]) for (const file of files(from, pattern)) changes += materialize(template, file, join(to, relative(from, file)))
    for (const css of ['theme.css', 'typeset.css']) changes += materialize(template, join(source, 'immersive', css), join(targetRoot, 'immersive', css))
  }
  for (const gate of ['check-tokens.mjs', 'check-scripts.mjs']) changes += materialize(template, join(skillScripts, gate), join(templateRoot, 'scripts/agent-ux', gate))
}
if (check && changes) process.exitCode = 1
else console.log(`[sync-agent-ui] ${check ? 'passed' : 'complete'}: ${changes} file(s) ${check ? 'would change' : 'written'}.`)
