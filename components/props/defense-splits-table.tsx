"use client"

import { Card } from "@/components/ui/card"
import { getMissProbabilityColor, getMissProbabilityTextColor, calculateMissProbability } from "@/lib/color-utils"

interface DefenseSplitsTableProps {
  defenseSplits: any[]
  activeMarket: string
  selectedLine: number
}

export function DefenseSplitsTable({ defenseSplits, activeMarket, selectedLine }: DefenseSplitsTableProps) {
  const getStatValue = (split: any) => {
    if (activeMarket === "pts") return split.avgPts
    if (activeMarket === "reb") return split.avgReb
    if (activeMarket === "ast") return split.avgAst
    return split.avgPts
  }

  return (
    <Card className="p-6 bg-slate-800/30 border-slate-700/50 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Position vs Defense</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="text-left py-3 px-2 text-slate-400 font-semibold">DEFENSE</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">AVG</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">SAMPLE</th>
          </tr>
        </thead>
        <tbody>
          {defenseSplits.map((split, idx) => {
            const statValue = getStatValue(split)
            const recentValues = [statValue, statValue * 0.9, statValue * 1.1]
            const missProbability = calculateMissProbability(statValue, selectedLine, recentValues)
            const bgColor = getMissProbabilityColor(missProbability)
            const textColor = getMissProbabilityTextColor(missProbability)

            return (
              <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="py-3 px-2">{split.label}</td>
                <td className={`text-right py-3 px-2 font-semibold ${bgColor} ${textColor} rounded`}>
                  {statValue.toFixed(1)}
                </td>
                <td className="text-right py-3 px-2 text-slate-400">{split.sample}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}
