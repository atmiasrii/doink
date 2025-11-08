"use client"

import { useState, useEffect } from "react"

interface Player {
  player_id: number
  player_name: string
  position: string
  points: number
  rebounds: number
  assists: number
  fg_pct: number
  fg3_pct: number
}

interface TeamRoster {
  team_id: number
  team_name: string
  team_abbr: string
  starters: Player[]
  bench: Player[]
}

interface TeamRostersMap {
  [key: string]: TeamRoster
}

export function useTeamRosters() {
  const [rosters, setRosters] = useState<TeamRostersMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRosters() {
      try {
        const response = await fetch("/data/team_rosters_2024-25_NBA.json")
        const data = await response.json()
        // Convert to map keyed by team_id for fast lookup
        const map: TeamRostersMap = {}
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          map[key] = value
        })
        setRosters(map)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load rosters")
      } finally {
        setLoading(false)
      }
    }

    fetchRosters()
  }, [])

  return { rosters, loading, error }
}
