"use client"

import { Card } from "@/components/ui/card"

interface BestLinesStripProps {
  markets: any
  activeMarket: string
  onMarketChange: (market: string) => void
}

export function BestLinesStrip({ markets, activeMarket, onMarketChange }: BestLinesStripProps) {
  return (
    <Card className="p-6 bg-slate-800/30 border-slate-700/50">
      <h3 className="text-lg font-bold mb-4">Best Lines</h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Object.entries(markets).map(([key, market]: [string, any]) => (
          <button
            key={key}
            onClick={() => onMarketChange(key)}
            className={`px-4 py-3 rounded border transition-colors flex-shrink-0 ${
              activeMarket === key
                ? "bg-emerald-900/50 border-emerald-700/50 text-emerald-300"
                : "bg-slate-700/30 border-slate-700/50 text-slate-300 hover:bg-slate-700/50"
            }`}
          >
            <div className="font-semibold">{market.currentLine}</div>
            <div className="text-xs text-slate-400">
              {market.bestPrice > 0 ? "+" : ""}
              {market.bestPrice}
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}
