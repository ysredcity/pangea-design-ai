/**
 * 变量插值：把 markdown 文本中的 {{fieldKey}} 替换为 values 中对应字段的提交值。
 * 未提交对应字段时原样保留 {{fieldKey}} 并 console.warn（不静默吞掉，方便剧本作者发现拼写错误，
 * 对齐方案文档决策点表"变量插值失败时"一项）。
 */
export function interpolate(content: string, values: Record<string, string>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    if (key in values) return values[key]
    console.warn(`[interpolate] 未找到变量 "${key}" 对应的提交值，原样保留 "${match}"`)
    return match
  })
}
