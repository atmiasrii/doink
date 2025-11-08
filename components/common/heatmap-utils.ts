export function getHeatmapColor(value: number, max: number, type: "intensity" | "diverging" = "intensity") {
  const ratio = Math.min(value / max, 1)

  if (type === "diverging") {
    if (ratio > 0.5) {
      return `rgba(16, 185, 129, ${0.2 + ratio * 0.6})`
    } else {
      return `rgba(244, 63, 94, ${0.2 + (1 - ratio) * 0.6})`
    }
  }

  return `rgba(16, 185, 129, ${0.1 + ratio * 0.7})`
}

export function getHeatmapBgClass(value: number, max: number): string {
  const ratio = Math.min(value / max, 1)

  if (ratio < 0.2) return "bg-slate-800/30"
  if (ratio < 0.4) return "bg-emerald-900/30"
  if (ratio < 0.6) return "bg-emerald-900/50"
  if (ratio < 0.8) return "bg-emerald-800/70"
  return "bg-emerald-700/90"
}
