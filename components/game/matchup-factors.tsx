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

      {/* ATS Records */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800/30 border-slate-700/50">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-card">
            <span className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-xs font-bold">
              {game.teamA.tricode[0]}
            </span>
            ATS Record
          </h3>
          <div className="space-y-3">
            <RecordRow label="Total" wins={game.ats.teamA.total.wins} losses={game.ats.teamA.total.losses} />
            <RecordRow label="Home" wins={game.ats.teamA.home.wins} losses={game.ats.teamA.home.losses} />
            <RecordRow label="Away" wins={game.ats.teamA.away.wins} losses={game.ats.teamA.away.losses} />
            <RecordRow label="Favored" wins={game.ats.teamA.favored.wins} losses={game.ats.teamA.favored.losses} />
            <RecordRow label="Underdog" wins={game.ats.teamA.underdog.wins} losses={game.ats.teamA.underdog.losses} />
          </div>
        </Card>

        <Card className="p-6 bg-slate-800/30 border-slate-700/50">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-card">
            <span className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-xs font-bold">
              {game.teamB.tricode[0]}
            </span>
            ATS Record
          </h3>
          <div className="space-y-3">
            <RecordRow label="Total" wins={game.ats.teamB.total.wins} losses={game.ats.teamB.total.losses} />
            <RecordRow label="Home" wins={game.ats.teamB.home.wins} losses={game.ats.teamB.home.losses} />
            <RecordRow label="Away" wins={game.ats.teamB.away.wins} losses={game.ats.teamB.away.losses} />
            <RecordRow label="Favored" wins={game.ats.teamB.favored.wins} losses={game.ats.teamB.favored.losses} />
            <RecordRow label="Underdog" wins={game.ats.teamB.underdog.wins} losses={game.ats.teamB.underdog.losses} />
          </div>
        </Card>
      </div>

      {/* Last 5 Games */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800/30 border-slate-700/50">
          <h3 className="font-semibold mb-4 text-card">Last 5 Games - {game.teamA.name}</h3>
          <div className="space-y-2 text-card">
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
          <h3 className="font-semibold mb-4 text-card">Last 5 Games - {game.teamB.name}</h3>
          <div className="space-y-2">
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

      {/* Venue Card */}
      <Card className="p-6 bg-slate-800/30 border-slate-700/50">
        <h3 className="font-semibold mb-4 text-card">{game.venue.name}</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">Venue Over Hit Rate</div>
            <div className="text-4xl font-bold text-emerald-400">{game.venue.overHitRatePct}%</div>
          </div>
          <div className="text-right text-sm text-slate-400">Since {game.venue.since}</div>
        </div>
      </Card>
    </div>
  )
}

function RecordRow({ label, wins, losses }: { label: string; wins: number; losses: number }) {
  const total = wins + losses
  const pct = total > 0 ? ((wins / total) * 100).toFixed(0) : "0"

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-chart-1">
          {wins}-{losses}
        </span>
        <span className="text-emerald-400 font-semibold">{pct}%</span>
      </div>
    </div>
  )
}
