"use client"

import { PlayerCard } from "@/components/player-card"
import { PlayerCard2 } from "@/components/player-card2"

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
  statsAvg2025?: {
    pts: number
    reb: number
    ast: number
    threePm: number
    pra: number
  }
  currentLines: {
    pts: number
  }
  last5Games?: any[]
  recentGames?: any[]
  seasonGames?: any[]
  last5Games2025?: any[]
  seasonGames2025?: any[]
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
            {teamABench.map((player) => {
              const statLines = player.seasonGames ?? player.recentGames ?? player.last5Games
              const statLines2025 = player.seasonGames2025 ?? player.last5Games2025 ?? []

              return (
                <div
                  key={`${player.id}-bench-away`}
                  className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]"
                >
                  <PlayerCard
                    playerName={player.name}
                    teamName={game.teamA.name}
                    position={player.pos}
                    opponent={game.teamB.name}
                    statLines={statLines}
                    statLines2025={statLines2025}
                    averages={player.statsAvg}
                    averages2025={player.statsAvg2025}
                    location="Away"
                    status="Expected"
                  />
                  <div className="md:justify-self-end">
                    <PlayerCard2 playerName={player.name} statLines={statLines2025} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Team B Bench */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">{game.teamB.name} Bench</h3>
          <div className="space-y-4">
            {teamBBench.map((player) => {
              const statLines = player.seasonGames ?? player.recentGames ?? player.last5Games
              const statLines2025 = player.seasonGames2025 ?? player.last5Games2025 ?? []

              return (
                <div
                  key={`${player.id}-bench-home`}
                  className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]"
                >
                  <PlayerCard
                    playerName={player.name}
                    teamName={game.teamB.name}
                    position={player.pos}
                    opponent={game.teamA.name}
                    statLines={statLines}
                    statLines2025={statLines2025}
                    averages={player.statsAvg}
                    averages2025={player.statsAvg2025}
                    location="Home"
                    status="Expected"
                  />
                  <div className="md:justify-self-end">
                    <PlayerCard2 playerName={player.name} statLines={statLines2025} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
