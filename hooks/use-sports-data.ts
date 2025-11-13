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
  const [playerStatsByName, setPlayerStatsByName] = useState<Record<string, PlayerStat[]>>({})
  const [teamStats, setTeamStats] = useState<TeamStat[]>([])
  const [gameData, setGameData] = useState<GameData[]>([])
  const [teamIdMap, setTeamIdMap] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const [part1Res, part2Res, part3Res, teamRes, gamesRes, teamMapRes] = await Promise.all([
          fetch("/data/player_game_stats_part1_2024-25.json"),
          fetch("/data/player_game_stats_part2_2024-25.json"),
          fetch("/data/player_game_stats_part3_2024-25.json"),
          fetch("/data/team_game_stats_2024-25.json"),
          fetch("/data/games_2024-25.json"),
          fetch("/data/teamsign2id.json"),
        ])

        if (!part1Res.ok || !part2Res.ok || !part3Res.ok || !teamRes.ok || !gamesRes.ok || !teamMapRes.ok) {
          throw new Error("Failed to fetch one or more data files")
        }

        const part1Data = await part1Res.json()
        const part2Data = await part2Res.json()
        const part3Data = await part3Res.json()
        const teamData = await teamRes.json()
        const gamesData = await gamesRes.json()
        const teamMapData = await teamMapRes.json()

        // Merge all player stats
        const mergedPlayerStats = [...part1Data, ...part2Data, ...part3Data]

        const statsByName: Record<string, PlayerStat[]> = {}

        for (const stat of mergedPlayerStats) {
          const key = normalizePlayerName(stat.player_name || "")
          if (!key) continue
          if (!statsByName[key]) {
            statsByName[key] = []
          }
          statsByName[key].push(stat)
        }

        Object.values(statsByName).forEach((entries) => {
          entries.sort((a, b) => (b.date ?? 0) - (a.date ?? 0))
        })

        // Build team ID to code map
        const idToCodeMap = teamMapData.reduce((acc: Record<number, string>, team: any) => {
          acc[team.team_id] = team.team_code;
          return acc;
        }, {});

        setPlayerStats(mergedPlayerStats)
        setPlayerStatsByName(statsByName)
        setTeamStats(teamData)
        setGameData(gamesData)
        setTeamIdMap(idToCodeMap)
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

  return { playerStats, playerStatsByName, teamStats, gameData, teamIdMap, loading, error }
}

// --- 🧠 PLAYER STATS HELPERS ---

/**
 * Normalize player name for matching by removing special characters and accents.
 * Handles cases like "Luka Dončić" vs "Luka Doncic"
 */
function normalizePlayerName(name: string): string {
  if (!name) return '';
  
  return name
    .trim()
    .toLowerCase()
    // Normalize Unicode characters (NFD = decompose accented characters)
    .normalize('NFD')
    // Remove diacritical marks (accents)
    .replace(/[\u0300-\u036f]/g, '')
    // Also handle some common special characters manually
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/đ/g, 'd')
    .replace(/ñ/g, 'n')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ä/g, 'a')
    .replace(/é/g, 'e')
    .replace(/è/g, 'e')
    .replace(/ê/g, 'e')
    .replace(/á/g, 'a')
    .replace(/à/g, 'a')
    .replace(/â/g, 'a')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u');
}

/**
 * Get the last 5 games for a given player.
 * Matches by player_name and sorts by game_date descending.
 */
export function getPlayerRecentGames(
  playerStats: PlayerStat[] | Record<string, PlayerStat[]>,
  playerName: string,
  teamIdMap: Record<number, string> = {},
  limit = 10
) {
  if (!playerStats || !playerName) return [];

  const normalizedLimit = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 10;

  // Normalize player name for matching (case-insensitive, no special chars)
  const normalizedName = normalizePlayerName(playerName);

  const sourceIsArray = Array.isArray(playerStats);

  const rawGames = sourceIsArray
    ? (playerStats as PlayerStat[]).filter((g) => {
        const nameMatches = normalizePlayerName(g.player_name || "") === normalizedName;
        const playerPlayed = g.minutes != null && g.minutes !== "";
        return nameMatches && playerPlayed;
      })
    : ((playerStats as Record<string, PlayerStat[]>)[normalizedName] ?? []);

  if (!rawGames.length) return [];

  const sortedGames = sourceIsArray
    ? rawGames.sort((a, b) => (b.date ?? 0) - (a.date ?? 0))
    : rawGames;

  const recentGames = sortedGames
    .slice(0, normalizedLimit)
    .map((g) => {
      const minutes = typeof g.minutes === "string" ? Number.parseFloat(g.minutes.split(":")[0] || "0") : Number(g.minutes ?? 0);
      const fgm = Number(g.fgm ?? 0);
      const fga = Number(g.fga ?? 0);
      const fg3m = Number(g.fg3m ?? 0);
      const fg3a = Number(g.fg3a ?? 0);
      const ftm = Number(g.ftm ?? 0);
      const usageRaw = (g as any).usg ?? (g as any).usage_rate;
      const usage = usageRaw != null ? Number.parseFloat(String(usageRaw)) : undefined;
      const gameResult = typeof (g as any).game_result === "string" ? (g as any).game_result.toUpperCase() : undefined;

      return {
        date: new Date(g.date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
        opp: teamIdMap[g.opponent_id] || String(g.opponent_id) || "TBD",
        opponent: teamIdMap[g.opponent_id] || String(g.opponent_id) || "TBD",
        wl: gameResult,
        mins: Number.isFinite(minutes) ? minutes : 0,
        usg: Number.isFinite(usage ?? NaN) ? usage : undefined,
        pts: (fgm - fg3m) * 2 + fg3m * 3 + ftm,
        fg: `${fgm}/${fga}`,
        fgm,
        fga,
        threePtr: `${fg3m}/${fg3a}`,
        threePm: fg3m,
        reb: Number(g.rebounds ?? 0),
        ast: Number(g.assists ?? 0),
        stl: Number(g.steals ?? 0),
        blk: Number(g.blocks ?? 0),
        tov: Number(g.turnovers ?? 0),
      };
    });

  return recentGames;
}

export function getLast5Games(
  playerStats: any[],
  playerName: string,
  teamIdMap: Record<number, string> = {}
) {
  return getPlayerRecentGames(playerStats, playerName, teamIdMap, 5);
}

/**
 * Compute averages from recent games.
 */
export function getPlayerAverages(games: any[]) {
  if (!games?.length)
    return { pts: 0, reb: 0, ast: 0, threePm: 0, pra: 0 };

  const sum = (key: string) =>
    games.reduce((acc, g) => acc + (Number(g[key]) || 0), 0);
  const avg = (key: string) =>
    Number((sum(key) / games.length).toFixed(1));

  return {
    pts: avg("pts"),
    reb: avg("reb"),
    ast: avg("ast"),
    threePm: avg("threePm"),
    pra: Number((avg("pts") + avg("reb") + avg("ast")).toFixed(1)),
  };
}
