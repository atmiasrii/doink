"use client"

import { useState, useEffect } from "react"

interface PlayerStat {
  game_id: number
  player_id: number
  player_name: string
  team_id: number
  minutes: string
  fgm: number
  fga: number
  fg_pct: number
  fg3m: number
  fg3a: number
  fg3_pct: number
  ftm: number
  fta: number
  ft_pct: number
  rebounds: number
  oreb: number
  dreb: number
  assists: number
  steals: number
  blocks: number
  turnovers: number | null
  fouls: number
  plus_minus: number
  is_starter: number
  is_home: number
  opponent_id: number
  date: number
}

interface TeamStat {
  game_id: string
  team_id: number
  fgm: number
  fga: number
  fg_pct: number
  fg3m: number
  fg3a: number
  fg3_pct: number
  ftm: number
  fta: number
  ft_pct: number
  oreb: number
  dreb: number
  reb: number
  ast: number
  stl: number
  blk: number
  tov: number | null
  pf: number
  plus_minus: number
  pace: number
  offensive_rating: number
  defensive_rating: number
  efg_pct: number
  ts_pct: number
  tov_pct: number
  oreb_pct: number
  dreb_pct: number
  is_home: number
  opponent_id: number
  days_rest: number
}

interface GameData {
  game_id: string
  date: number
  season: string
  home_team_id: number
  home_team_name: string
  away_team_id: number
  away_team_name: string
  home_score: number
  away_score: number
  home_win: number
}

export function useSportsData() {
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [teamStats, setTeamStats] = useState<TeamStat[]>([])
  const [gameData, setGameData] = useState<GameData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const [part1Res, part2Res, part3Res, teamRes, gamesRes] = await Promise.all([
          fetch("/data/player_game_stats_part1_2024-25.json"),
          fetch("/data/player_game_stats_part2_2024-25.json"),
          fetch("/data/player_game_stats_part3_2024-25.json"),
          fetch("/data/team_game_stats_2024-25.json"),
          fetch("/data/games_2024-25.json"),
        ])

        if (!part1Res.ok || !part2Res.ok || !part3Res.ok || !teamRes.ok || !gamesRes.ok) {
          throw new Error("Failed to fetch one or more data files")
        }

        const part1Data = await part1Res.json()
        const part2Data = await part2Res.json()
        const part3Data = await part3Res.json()
        const teamData = await teamRes.json()
        const gamesData = await gamesRes.json()

        // Merge all player stats
        const mergedPlayerStats = [...part1Data, ...part2Data, ...part3Data]

        setPlayerStats(mergedPlayerStats)
        setTeamStats(teamData)
        setGameData(gamesData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        console.error("Data fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { playerStats, teamStats, gameData, loading, error }
}
