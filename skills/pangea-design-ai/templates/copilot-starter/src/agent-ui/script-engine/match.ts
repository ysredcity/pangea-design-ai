import type { SceneTrigger } from './types'

/** matchTrigger 只读取 id 与 trigger，因此对场景形状做结构化约束，供沉浸式与 JSON 剧本共用。 */
type TriggerableScene = { id: string; trigger?: SceneTrigger }

/**
 * 匹配用户输入到预写场景。
 *
 * 关键词是子串匹配，并按**最长命中优先**裁决：输入同时命中「出差」和「出差申请变更」时，
 * 取更精确的后者。这让结果不依赖场景声明顺序——早期实现是「按声明顺序首个命中」，
 * 把宽泛词写在前面会静默抢占后面更精确的场景，且重排导出顺序就会改变行为。
 * 长度相同则回到声明顺序，保持确定性。
 *
 * 关键词全部未命中时才尝试正则（正则长度不代表精确度，无法参与长度裁决），按声明顺序取首个。
 * 无效正则仅跳过该条，不让一条坏规则阻断其它可用场景。
 */
export function matchTrigger<TScene extends TriggerableScene>(input: string, scenes: readonly TScene[]): TScene | null {
  let best: { scene: TScene; length: number } | null = null
  for (const scene of scenes) {
    if (scene.trigger?.type !== 'keyword') continue
    for (const pattern of scene.trigger.patterns) {
      if (!pattern || !input.includes(pattern)) continue
      if (!best || pattern.length > best.length) best = { scene, length: pattern.length }
    }
  }
  if (best) return best.scene

  for (const scene of scenes) {
    if (scene.trigger?.type !== 'regex') continue
    for (const pattern of scene.trigger.patterns) {
      try {
        if (new RegExp(pattern).test(input)) return scene
      } catch {
        console.warn(`[matchTrigger] scene "${scene.id}" 包含无效正则：${pattern}`)
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
