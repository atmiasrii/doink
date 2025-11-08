import { Card } from "@/components/ui/card"
import type { Game } from "@/types"

export function GameHeaderCard({ game }: { game: Game }) {
  return (
    <Card className="p-6 bg-slate-800/30 border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center text-sm font-bold">
            {game.teamA.tricode}
          </div>
          <div>
            <div className="font-semibold text-card">{game.teamA.name}</div>
            <div className="text-sm text-slate-400">
              {game.teamA.record.wins}-{game.teamA.record.losses}
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-slate-400">@</div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <div className="font-semibold text-right text-card">{game.teamB.name}</div>
            <div className="text-sm text-slate-400 text-right">
              {game.teamB.record.wins}-{game.teamB.record.losses}
            </div>
          </div>
          <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center text-sm font-bold">
            {game.teamB.tricode}
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-slate-400">
        {game.venue.name} • {game.venue.city}
      </div>
    </Card>
  )
}
