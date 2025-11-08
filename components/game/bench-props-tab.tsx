"use client"

import { PlayerCard } from "@/components/player-card"

interface Player {
  id: string
  name: string
  pos: string
  gs: number
  statsAvg: {
    pts: number
    reb: number
    ast: number
    threePm: number
    pra: number
  }
  currentLines: {
    pts: number
  }
}

interface GameData {
  teamA: {
    name: string
    code: string
  }
  teamB: {
    name: string
    code: string
  }
  lineups: {
    teamA_bench: Player[]
    teamB_bench: Player[]
  }
}

interface BenchPropsTabProps {
  game: GameData
}

export function BenchPropsTab({ game }: BenchPropsTabProps) {
  const teamABench = game.lineups.teamA_bench || []
  const teamBBench = game.lineups.teamB_bench || []

  if (teamABench.length === 0 && teamBBench.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Data not available for this matchup</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Bench Players</h2>

      <div className="space-y-6">
        {/* Team A Bench */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">{game.teamA.name} Bench</h3>
          <div className="space-y-4">
            {teamABench.map((player) => (
              <PlayerCard
                key={player.id}
                playerName={player.name}
                teamName={game.teamA.code}
                position={player.pos}
                opponent={game.teamB.code}
                location="Away"
                status="Expected"
              />
            ))}
          </div>
        </div>

        {/* Team B Bench */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">{game.teamB.name} Bench</h3>
          <div className="space-y-4">
            {teamBBench.map((player) => (
              <PlayerCard
                key={player.id}
                playerName={player.name}
                teamName={game.teamB.code}
                position={player.pos}
                opponent={game.teamA.code}
                location="Home"
                status="Expected"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
