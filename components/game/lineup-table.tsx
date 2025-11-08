"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import type { Game } from "@/types"
import { getMissProbabilityColor, calculateMissProbability } from "@/lib/color-utils"

export function LineupTable({ game }: { game: Game }) {
  const [selectedLines, setSelectedLines] = useState({
    pts: 18.5,
    reb: 5.5,
    ast: 3.5,
    threePm: 2.5,
    pra: 28.5,
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Starting Lineups</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <LineupCard team={game.teamA} players={game.lineups.teamA} selectedLines={selectedLines} />
        <LineupCard team={game.teamB} players={game.lineups.teamB} selectedLines={selectedLines} />
      </div>

      <div className="text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">Color Legend:</p>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-900/80 rounded"></div>
            <span>Likely to Hit (0-24%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-900/50 rounded"></div>
            <span>Lean Hit (25-39%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-700/40 rounded"></div>
            <span>Balanced (40-59%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-rose-900/50 rounded"></div>
            <span>Lean Miss (60-74%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-rose-900/80 rounded"></div>
            <span>Likely to Miss (75-100%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function LineupCard({ team, players, selectedLines }: any) {
  return (
    <Card className="p-6 bg-slate-900/40 border border-slate-700/50 rounded-xl overflow-x-auto">
      <h3 className="font-semibold text-white mb-4">
        {team.name} Starting Lineup <span className="text-xs text-slate-400 font-normal">Expected</span>
      </h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="text-left py-2 px-2 text-slate-300 font-semibold uppercase text-xs tracking-wide">PLAYER</th>
            <th className="text-right py-2 px-2 text-slate-300 font-semibold uppercase text-xs tracking-wide">GS</th>
            <th className="text-right py-2 px-2 text-slate-300 font-semibold uppercase text-xs tracking-wide">PTS</th>
            <th className="text-right py-2 px-2 text-slate-300 font-semibold uppercase text-xs tracking-wide">REB</th>
            <th className="text-right py-2 px-2 text-slate-300 font-semibold uppercase text-xs tracking-wide">AST</th>
            <th className="text-right py-2 px-2 text-slate-300 font-semibold uppercase text-xs tracking-wide">3PM</th>
            <th className="text-right py-2 px-2 text-slate-300 font-semibold uppercase text-xs tracking-wide">PRA</th>
            <th className="text-right py-2 px-2 text-slate-300 font-semibold uppercase text-xs tracking-wide">
              POINTS
            </th>
          </tr>
        </thead>
        <tbody>
          {players.map((player: any) => {
            const ptsRecentValues = [player.statsAvg.pts, player.statsAvg.pts * 0.95, player.statsAvg.pts * 1.05]
            const rebRecentValues = [player.statsAvg.reb, player.statsAvg.reb * 0.9, player.statsAvg.reb * 1.1]
            const astRecentValues = [player.statsAvg.ast, player.statsAvg.ast * 0.85, player.statsAvg.ast * 1.15]
            const threePmRecentValues = [
              player.statsAvg.threePm,
              player.statsAvg.threePm * 0.8,
              player.statsAvg.threePm * 1.2,
            ]
            const praRecentValues = [player.statsAvg.pra, player.statsAvg.pra * 0.95, player.statsAvg.pra * 1.05]

            const ptsMissProb = calculateMissProbability(player.statsAvg.pts, selectedLines.pts, ptsRecentValues)
            const rebMissProb = calculateMissProbability(player.statsAvg.reb, selectedLines.reb, rebRecentValues)
            const astMissProb = calculateMissProbability(player.statsAvg.ast, selectedLines.ast, astRecentValues)
            const threePmMissProb = calculateMissProbability(
              player.statsAvg.threePm,
              selectedLines.threePm,
              threePmRecentValues,
            )
            const praMissProb = calculateMissProbability(player.statsAvg.pra, selectedLines.pra, praRecentValues)

            return (
              <tr key={player.id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="py-3 px-2">
                  <div className="font-semibold text-white">{player.name}</div>
                  <div className="text-xs text-slate-400">{player.pos}</div>
                </td>
                <td className="text-right py-3 px-2 text-slate-300">{player.gs}</td>
                <td
                  className={`text-right py-3 px-2 font-semibold text-white rounded ${getMissProbabilityColor(ptsMissProb)}`}
                >
                  {player.statsAvg.pts.toFixed(1)}
                </td>
                <td
                  className={`text-right py-3 px-2 font-semibold text-white rounded ${getMissProbabilityColor(rebMissProb)}`}
                >
                  {player.statsAvg.reb.toFixed(1)}
                </td>
                <td
                  className={`text-right py-3 px-2 font-semibold text-white rounded ${getMissProbabilityColor(astMissProb)}`}
                >
                  {player.statsAvg.ast.toFixed(1)}
                </td>
                <td
                  className={`text-right py-3 px-2 font-semibold text-white rounded ${getMissProbabilityColor(threePmMissProb)}`}
                >
                  {player.statsAvg.threePm.toFixed(1)}
                </td>
                <td
                  className={`text-right py-3 px-2 font-semibold text-white rounded ${getMissProbabilityColor(praMissProb)}`}
                >
                  {player.statsAvg.pra.toFixed(1)}
                </td>
                <td className="text-right py-3 px-2 text-slate-300">
                  {player.currentLines?.pts && <div className="font-semibold">{player.currentLines.pts}</div>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}
