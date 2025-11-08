"use client"

import { Card } from "@/components/ui/card"

interface AltLinesGridProps {
  market: any
  onLineSelect: (line: number) => void
}

export function AltLinesGrid({ market, onLineSelect }: AltLinesGridProps) {
  if (!market || !market.altLines) return null

  return (
    <Card className="p-6 bg-slate-800/30 border-slate-700/50">
      <h3 className="text-lg font-bold mb-4">{market.label}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {market.altLines.map((altLine: any, idx: number) => {
          // Determine color intensity based on how far from current line
          const diff = altLine.line - market.currentLine
          const isHarder = diff > 0 // higher line = harder to hit = more red
          const intensity = Math.min(Math.abs(diff) / 5, 1) // normalize to 0-1

          let bgClass = "bg-slate-700/30"
          if (isHarder) {
            bgClass = intensity > 0.5 ? "bg-rose-900/50" : "bg-rose-900/30"
          } else {
            bgClass = intensity > 0.5 ? "bg-emerald-900/50" : "bg-emerald-900/30"
          }

          return (
            <button
              key={idx}
              onClick={() => onLineSelect(altLine.line)}
              className={`p-3 rounded border border-slate-700/50 hover:border-slate-600/50 transition-colors ${bgClass}`}
            >
              <div className="font-semibold text-sm">{altLine.line}</div>
              <div className="text-xs text-slate-400">
                {altLine.price > 0 ? "+" : ""}
                {altLine.price}
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
