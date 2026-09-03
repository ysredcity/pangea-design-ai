import type { ConversationScene } from './types'

/**
 * 按声明顺序匹配用户输入。关键词是子串匹配；正则无效时仅跳过该条，
 * 不让编辑器导入的一条坏规则阻断其它可用场景。
 */
export function matchTrigger<TTarget>(input: string, scenes: readonly ConversationScene<TTarget>[]): ConversationScene<TTarget> | null {
  for (const scene of scenes) {
    if (!scene.trigger) continue
    if (scene.trigger.type === 'keyword' && scene.trigger.patterns.some((pattern) => input.includes(pattern))) return scene
    if (scene.trigger.type === 'regex') {
      for (const pattern of scene.trigger.patterns) {
        try {
          if (new RegExp(pattern).test(input)) return scene
        } catch {
          console.warn(`[matchTrigger] scene "${scene.id}" 包含无效正则：${pattern}`)
        }
      }
    }
  }
  return null
}

/** 未命中预写场景时可使用的纯前端回退文案。 */
export function pickFallback(pool: readonly string[] | undefined, echoInput: string): string {
  if (!pool?.length) return `已收到：${echoInput}`
  return pool[Math.floor(Math.random() * pool.length)]
}
