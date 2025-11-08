"use client"

import { useSportsData } from "@/hooks/use-sports-data"

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function GameOverviewTab() {
  const { gameData, loading } = useSportsData()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Loading games...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">All Games</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {gameData.map((game) => (
          <div
            key={game.game_id}
            className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400">{formatDate(game.date)}</p>
              <p className="text-xs font-semibold text-slate-300">Season {game.season}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-white font-medium">{game.home_team_name}</p>
                <p className={`text-lg font-bold ${game.home_win ? "text-green-500" : "text-red-500"}`}>
                  {game.home_score}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-slate-300">{game.away_team_name}</p>
                <p className={`text-lg font-bold ${!game.home_win ? "text-green-500" : "text-red-500"}`}>
                  {game.away_score}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700/30">
              <p className="text-xs text-slate-400">
                {game.home_win ? (
                  <>
                    <span className="text-green-500 font-semibold">{game.home_team_name}</span> won
                  </>
                ) : (
                  <>
                    <span className="text-green-500 font-semibold">{game.away_team_name}</span> won
                  </>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {gameData.length === 0 && <div className="text-center py-8 text-slate-400">No games data available</div>}
    </div>
  )
}
