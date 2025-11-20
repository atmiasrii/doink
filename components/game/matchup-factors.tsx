import { Card } from "@/components/ui/card"
import type { Game } from "@/types"

export function MatchupFactors({ game }: { game: Game }) {
  const getWinPct = (wins: number, losses: number) => {
    const total = wins + losses
    return total > 0 ? ((wins / total) * 100).toFixed(0) : "0"
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Matchup Factors</h2>

      {/* Last 5 Games */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800/30 border-slate-700/50">
          <h3 className="font-semibold mb-4 text-slate-100">Last 5 Games - {game.teamA.name}</h3>
          <div className="space-y-2 text-slate-100">
            {game.last5.teamA.map((result, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm p-2 bg-slate-900/50 rounded">
                <span className="text-slate-400">{result.date}</span>
                <span className="text-card">{result.opp}</span>
                <span className="font-semibold">
                  {result.scoreFor}-{result.scoreAgainst}
                </span>
                <span className={result.ouResult === "O" ? "text-emerald-400" : "text-rose-400"}>
                  {result.ouResult}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-slate-800/30 border-slate-700/50">
          <h3 className="font-semibold mb-4 text-slate-100">Last 5 Games - {game.teamB.name}</h3>
          <div className="space-y-2 text-slate-100">
            {game.last5.teamB.map((result, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm p-2 bg-slate-900/50 rounded text-card">
                <span className="text-slate-400">{result.date}</span>
                <span>{result.opp}</span>
                <span className="font-semibold">
                  {result.scoreFor}-{result.scoreAgainst}
                </span>
                <span className={result.ouResult === "O" ? "text-emerald-400" : "text-rose-400"}>
                  {result.ouResult}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
