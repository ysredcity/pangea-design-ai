import type { Scenario } from './types'

/**
 * 触发命中判断。
 * keyword：命中 patterns 中任意一个子串（大小写不敏感，中文无需处理大小写但统一转小写不影响）。
 * regex：patterns 中任意一个正则匹配成功即命中；正则字符串非法时跳过该 pattern 并 console.warn，不抛异常。
 * 命中多个 scenario 时取 scenarios 数组中最靠前的一个（约定："先声明优先"，剧本作者可通过调整顺序控制优先级）。
 */
export function matchTrigger(input: string, scenarios: Scenario[]): Scenario | null {
  const normalizedInput = input.toLowerCase()

  for (const scenario of scenarios) {
    const { type, patterns } = scenario.trigger

    if (type === 'keyword') {
      if (patterns.some((p) => normalizedInput.includes(p.toLowerCase()))) {
        return scenario
      }
      continue
    }

    if (type === 'regex') {
      const matched = patterns.some((p) => {
        try {
          return new RegExp(p).test(input)
        } catch {
          console.warn(`[matchTrigger] scenario "${scenario.id}" 的正则 "${p}" 非法，已跳过`)
          return false
        }
      })
      if (matched) return scenario
    }
  }

  return null
}

/** 从 fallback.pool 里随机挑一句；池子为空时返回固定 echo 兜底（见方案文档决策点表）。 */
export function pickFallback(pool: string[] | undefined, echoInput: string): string {
  if (!pool || pool.length === 0) {
    return `已收到："${echoInput}"`
  }
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}
