"use client"

import { Card } from "@/components/ui/card"
import { getMissProbabilityColor, getMissProbabilityTextColor, calculateMissProbability } from "@/lib/color-utils"

interface GameLogTableProps {
  gameLog: any[]
  activeMarket: string
  selectedLine: number
}

export function GameLogTable({ gameLog, activeMarket, selectedLine }: GameLogTableProps) {
  const getStatColor = (value: number, line: number) => {
    const recentValues = gameLog.map((log) => {
      if (activeMarket === "pts") return log.pts
      if (activeMarket === "reb") return log.reb
      if (activeMarket === "ast") return log.ast
      if (activeMarket === "threePm") return log.threePt ? Number.parseInt(log.threePt.split("/")[0]) : 0
      return value
    })
    const missProbability = calculateMissProbability(value, line, recentValues)
    return { bg: getMissProbabilityColor(missProbability), text: getMissProbabilityTextColor(missProbability) }
  }

  const avgPts = gameLog.reduce((sum, log) => sum + log.pts, 0) / gameLog.length
  const avgReb = gameLog.reduce((sum, log) => sum + log.reb, 0) / gameLog.length
  const avgAst = gameLog.reduce((sum, log) => sum + log.ast, 0) / gameLog.length

  const hitsPts = gameLog.filter((log) => log.pts >= selectedLine).length
  const hitsReb = gameLog.filter((log) => log.reb >= selectedLine).length
  const hitsAst = gameLog.filter((log) => log.ast >= selectedLine).length

  return (
    <Card className="p-6 bg-slate-800/30 border-slate-700/50 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Game Log</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="text-left py-3 px-2 text-slate-400 font-semibold">DATE</th>
            <th className="text-left py-3 px-2 text-slate-400 font-semibold">OPP</th>
            <th className="text-center py-3 px-2 text-slate-400 font-semibold">W/L</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">MINS</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">USG%</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">PTS</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">FG</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">3PT</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">REB</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">AST</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">STL</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">BLK</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">TO</th>
          </tr>
        </thead>
        <tbody>
          {gameLog.map((log, idx) => {
            const ptsColor = getStatColor(log.pts, selectedLine)
            const rebColor = getStatColor(log.reb, selectedLine)
            const astColor = getStatColor(log.ast, selectedLine)

            return (
              <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="py-3 px-2 text-slate-400">{log.date}</td>
                <td className="py-3 px-2">{log.opp}</td>
                <td className="py-3 px-2 text-center">
                  <span className={log.wl === "W" ? "text-emerald-400" : "text-rose-400"}>{log.wl}</span>
                </td>
                <td className="text-right py-3 px-2">{log.mins}</td>
                <td className="text-right py-3 px-2">{log.usgPct}%</td>
                <td className={`text-right py-3 px-2 font-semibold ${ptsColor.bg} ${ptsColor.text} rounded`}>
                  {log.pts}
                </td>
                <td className="text-right py-3 px-2">{log.fg}</td>
                <td className="text-right py-3 px-2">{log.threePt}</td>
                <td className={`text-right py-3 px-2 font-semibold ${rebColor.bg} ${rebColor.text} rounded`}>
                  {log.reb}
                </td>
                <td className={`text-right py-3 px-2 font-semibold ${astColor.bg} ${astColor.text} rounded`}>
                  {log.ast}
                </td>
                <td className="text-right py-3 px-2">{log.stl}</td>
                <td className="text-right py-3 px-2">{log.blk}</td>
                <td className="text-right py-3 px-2">{log.to}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex gap-4 text-slate-400">
          <span>AVG</span>
          <span className="ml-auto">PTS: {avgPts.toFixed(1)}</span>
          <span>REB: {avgReb.toFixed(1)}</span>
          <span>AST: {avgAst.toFixed(1)}</span>
        </div>
        <div className="flex gap-4 text-slate-400">
          <span>HIT RATE</span>
          <span className="ml-auto">
            PTS: {hitsPts}/{gameLog.length} ({Math.round((hitsPts / gameLog.length) * 100)}%)
          </span>
          <span>
            REB: {hitsReb}/{gameLog.length} ({Math.round((hitsReb / gameLog.length) * 100)}%)
          </span>
          <span>
            AST: {hitsAst}/{gameLog.length} ({Math.round((hitsAst / gameLog.length) * 100)}%)
          </span>
        </div>
      </div>
    </Card>
  )
}
