// Maps miss probability (0-1) to color classes and styles
// 0.00-0.24: strong green (likely to hit)
// 0.25-0.39: light green
// 0.40-0.59: neutral gray (balanced)
// 0.60-0.74: light red (likely to miss)
// 0.75-1.00: strong red (highly likely to miss)

export function getMissProbabilityColor(missProbability: number): string {
  if (missProbability < 0.25) return "bg-emerald-900/80"
  if (missProbability < 0.4) return "bg-emerald-900/50"
  if (missProbability < 0.6) return "bg-slate-700/40"
  if (missProbability < 0.75) return "bg-rose-900/50"
  return "bg-rose-900/80"
}

export function getMissProbabilityTextColor(missProbability: number): string {
  if (missProbability < 0.25) return "text-emerald-300"
  if (missProbability < 0.4) return "text-emerald-300"
  if (missProbability < 0.6) return "text-slate-300"
  if (missProbability < 0.75) return "text-rose-300"
  return "text-rose-300"
}

export function calculateMissProbability(value: number, line: number, recentValues: number[]): number {
  if (recentValues.length < 5) return 0.5 // neutral for low sample size
  const missCount = recentValues.filter((v) => v < line).length
  return missCount / recentValues.length
}

export function getHitPercentage(value: number, line: number, recentValues: number[]): number {
  if (recentValues.length === 0) return 0
  const hitCount = recentValues.filter((v) => v >= line).length
  return Math.round((hitCount / recentValues.length) * 100)
}
