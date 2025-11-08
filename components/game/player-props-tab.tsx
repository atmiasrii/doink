"use client"

import { useMemo } from "react"
import { useSportsData } from "@/hooks/use-sports-data"
import { useTeamRosters } from "@/hooks/use-team-rosters"
import { PlayerCard } from "@/components/player-card"

interface PlayerStatsRow {
  player_name: string
  team_id: number
  opponent_id: number
  date: number
  fgm: number
  fga: number
  fg_pct: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number | null
  plus_minus: number
}

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
    teamA: Player[]
    teamB: Player[]
  }
}

interface PlayerPropsTabProps {
  game: GameData
}

function getStatColor(value: number | null, average: number) {
  if (value === null || value === undefined) return "text-slate-400"
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

export function PlayerPropsTab({ game }: PlayerPropsTabProps) {
  const { playerStats, loading: sportsDataLoading } = useSportsData()
  const { rosters, loading: teamRostersLoading } = useTeamRosters()

  const teamAData = useMemo(() => {
    const teamId = String(game.teamA.code)
    return rosters[teamId] || null
  }, [rosters])

  const teamBData = useMemo(() => {
    const teamId = String(game.teamB.code)
    return rosters[teamId] || null
  }, [rosters])

  const loading = sportsDataLoading || teamRostersLoading

  const teamAStarters = game.lineups.teamA || []
  const teamBStarters = game.lineups.teamB || []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Loading player data...</p>
      </div>
    )
  }

  if (teamAStarters.length === 0 && teamBStarters.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Data not available for this matchup</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Starting Lineups</h2>

      <div className="space-y-6">
        {/* Team A Starters */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">{game.teamA.name} Starting Lineup</h3>
          <div className="space-y-4">
            {teamAStarters.map((player) => (
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

        {/* Team B Starters */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">{game.teamB.name} Starting Lineup</h3>
          <div className="space-y-4">
            {teamBStarters.map((player) => (
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

      {/* Player Game Stats */}
      {/* This section can be added if needed, but it's not part of the updates */}
    </div>
  )
}
