"use client"

import { useSportsData } from "@/hooks/use-sports-data"

function getStatColor(value: number, average: number) {
  if (value > average) return "text-green-500"
  if (value < average) return "text-red-500"
  return "text-slate-300"
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  })
}

export function TeamPropsTab() {
  const { teamStats, loading } = useSportsData()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Loading team data...</p>
      </div>
    )
  }

  const leagueAvgs = {
    pts: teamStats.reduce((sum, t) => sum + (t.fgm * 2 + t.fg3m), 0) / teamStats.length || 0,
    reb: teamStats.reduce((sum, t) => sum + t.reb, 0) / teamStats.length || 0,
    ast: teamStats.reduce((sum, t) => sum + t.ast, 0) / teamStats.length || 0,
    fg_pct: teamStats.reduce((sum, t) => sum + t.fg_pct, 0) / teamStats.length || 0,
    fg3_pct: teamStats.reduce((sum, t) => sum + t.fg3_pct, 0) / teamStats.length || 0,
    ft_pct: teamStats.reduce((sum, t) => sum + t.ft_pct, 0) / teamStats.length || 0,
    tov: teamStats.reduce((sum, t) => sum + (t.tov || 0), 0) / teamStats.length || 0,
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-6">Team Game Stats</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 font-semibold text-slate-300">DATE</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">TEAM</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">OPP</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-300">PTS</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-300">REB</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-300">AST</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-300">FG%</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-300">3P%</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-300">FT%</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-300">TOV</th>
              </tr>
            </thead>
            <tbody>
              {teamStats.map((stat, idx) => {
                const pts = stat.fgm * 2 + stat.fg3m
                return (
                  <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-800/40">
                    <td className="py-2 px-4 text-slate-400">{formatDate(Number.parseInt(stat.game_id) * 1000)}</td>
                    <td className="py-2 px-4 text-white">{stat.team_id}</td>
                    <td className="py-2 px-4 text-slate-300">{stat.opponent_id}</td>
                    <td className={`py-2 px-4 text-right ${getStatColor(pts, leagueAvgs.pts)}`}>{pts}</td>
                    <td className={`py-2 px-4 text-right ${getStatColor(stat.reb, leagueAvgs.reb)}`}>{stat.reb}</td>
                    <td className={`py-2 px-4 text-right ${getStatColor(stat.ast, leagueAvgs.ast)}`}>{stat.ast}</td>
                    <td className={`py-2 px-4 text-right ${getStatColor(stat.fg_pct * 100, leagueAvgs.fg_pct * 100)}`}>
                      {(stat.fg_pct * 100).toFixed(1)}%
                    </td>
                    <td
                      className={`py-2 px-4 text-right ${getStatColor(stat.fg3_pct * 100, leagueAvgs.fg3_pct * 100)}`}
                    >
                      {(stat.fg3_pct * 100).toFixed(1)}%
                    </td>
                    <td className={`py-2 px-4 text-right ${getStatColor(stat.ft_pct * 100, leagueAvgs.ft_pct * 100)}`}>
                      {(stat.ft_pct * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400">{stat.tov ?? "—"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-4">
          <div className="bg-slate-800/20 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">AVG PTS</p>
            <p className="text-lg font-semibold text-white">{leagueAvgs.pts.toFixed(1)}</p>
          </div>
          <div className="bg-slate-800/20 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">AVG REB</p>
            <p className="text-lg font-semibold text-white">{leagueAvgs.reb.toFixed(1)}</p>
          </div>
          <div className="bg-slate-800/20 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">AVG AST</p>
            <p className="text-lg font-semibold text-white">{leagueAvgs.ast.toFixed(1)}</p>
          </div>
          <div className="bg-slate-800/20 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">AVG FG%</p>
            <p className="text-lg font-semibold text-white">{(leagueAvgs.fg_pct * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-slate-800/20 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">AVG 3P%</p>
            <p className="text-lg font-semibold text-white">{(leagueAvgs.fg3_pct * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-slate-800/20 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">AVG FT%</p>
            <p className="text-lg font-semibold text-white">{(leagueAvgs.ft_pct * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-slate-800/20 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">AVG TOV</p>
            <p className="text-lg font-semibold text-white">{leagueAvgs.tov.toFixed(1)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
