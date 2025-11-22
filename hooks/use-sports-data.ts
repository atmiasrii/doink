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

let cachedGameDataMap: Record<string, GameData> = {}

function toGameKeys(gameId: string | number | undefined | null): string[] {
  if (gameId == null) return []

  const raw = String(gameId)
  const trimmed = raw.replace(/^0+/, "")
  const numeric = Number.parseInt(raw, 10)
  const keys = new Set<string>()

  if (raw) keys.add(raw)
  if (trimmed) keys.add(trimmed)
  if (!Number.isNaN(numeric)) keys.add(String(numeric))

  return Array.from(keys)
}

export function useSportsData() {
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [playerStatsByName, setPlayerStatsByName] = useState<Record<string, PlayerStat[]>>({})
  const [teamStats, setTeamStats] = useState<TeamStat[]>([])
  const [gameData, setGameData] = useState<GameData[]>([])
  const [gameDataMap, setGameDataMap] = useState<Record<string, GameData>>({})
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

        // Build game data map by game_id for fast lookups
        const gameMap: Record<string, GameData> = {}
        gamesData.forEach((game: GameData) => {
          const keys = toGameKeys(game.game_id)
          keys.forEach((key) => {
            if (!key) return
            gameMap[key] = game
          })
        })
        cachedGameDataMap = gameMap

        setPlayerStats(mergedPlayerStats)
        setPlayerStatsByName(statsByName)
        setTeamStats(teamData)
        setGameData(gamesData)
        setGameDataMap(gameMap)
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

  return { playerStats, playerStatsByName, teamStats, gameData, gameDataMap, teamIdMap, loading, error }
}

let cachedGameDataMap2025: Record<string, GameData> = {}

export function useSportsData2025() {
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [playerStatsByName, setPlayerStatsByName] = useState<Record<string, PlayerStat[]>>({})
  const [teamStats, setTeamStats] = useState<TeamStat[]>([])
  const [gameData, setGameData] = useState<GameData[]>([])
  const [gameDataMap, setGameDataMap] = useState<Record<string, GameData>>({})
  const [teamIdMap, setTeamIdMap] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const [playerRes, teamRes, gamesRes] = await Promise.all([
          fetch("/data/S25/player_game_stats_2025-26.json"),
          fetch("/data/S25/team_game_stats_2025-26.json"),
          fetch("/data/S25/games_2025-26.json"),
        ])

        if (!playerRes.ok || !teamRes.ok || !gamesRes.ok) {
          throw new Error("Failed to fetch one or more 2025-26 data files")
        }

        const playerData = await playerRes.json()
        const teamData = await teamRes.json()
        const gamesData = await gamesRes.json()

        const statsByName: Record<string, PlayerStat[]> = {}

        for (const stat of playerData) {
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

        // Build game data map by game_id for fast lookups
        const gameMap: Record<string, GameData> = {}
        gamesData.forEach((game: GameData) => {
          const keys = toGameKeys(game.game_id)
          keys.forEach((key) => {
            if (!key) return
            gameMap[key] = game
          })
        })
        cachedGameDataMap2025 = gameMap

        // Build team ID to code map using standard NBA mapping
        const TEAM_ID_TO_CODE: Record<string, string> = {
          "1610612737": "ATL",
          "1610612738": "BOS",
          "1610612739": "CLE",
          "1610612740": "NOP",
          "1610612741": "CHI",
          "1610612742": "DAL",
          "1610612743": "DEN",
          "1610612744": "GSW",
          "1610612745": "HOU",
          "1610612746": "LAC",
          "1610612747": "LAL",
          "1610612748": "MIA",
          "1610612749": "MIL",
          "1610612750": "MIN",
          "1610612751": "BKN",
          "1610612752": "NYK",
          "1610612753": "ORL",
          "1610612754": "IND",
          "1610612755": "PHI",
          "1610612756": "PHX",
          "1610612757": "POR",
          "1610612758": "SAC",
          "1610612759": "SAS",
          "1610612760": "OKC",
          "1610612761": "TOR",
          "1610612762": "UTA",
          "1610612763": "MEM",
          "1610612764": "WAS",
          "1610612765": "DET",
          "1610612766": "CHA",
        }
        
        const idToCodeMap: Record<number, string> = {}
        Object.entries(TEAM_ID_TO_CODE).forEach(([id, code]) => {
          idToCodeMap[Number(id)] = code
        })

        setPlayerStats(playerData)
        setPlayerStatsByName(statsByName)
        setTeamStats(teamData)
        setGameData(gamesData)
        setGameDataMap(gameMap)
        setTeamIdMap(idToCodeMap)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        console.error("Data fetch error (2025-26):", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { playerStats, playerStatsByName, teamStats, gameData, gameDataMap, teamIdMap, loading, error }
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
  limit = 10,
  gameDataMap: Record<string, GameData> = {}
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

  const lookupGameMap = Object.keys(gameDataMap).length > 0 ? gameDataMap : cachedGameDataMap

  // Filter out games with 0 minutes and then take the limit
  const gamesWithMinutes = sortedGames.filter((g) => {
    const minutes = typeof g.minutes === "string" ? Number.parseFloat(g.minutes.split(":")[0] || "0") : Number(g.minutes ?? 0);
    return minutes > 0;
  });

  const recentGames = gamesWithMinutes
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
  const rawIsHome = (g as any).is_home ?? (g as any).isHome;
  const hasHomeFlag = rawIsHome != null;
  const isHome = hasHomeFlag ? Number(rawIsHome) === 1 : undefined;

      // Determine W/L by looking up the game and checking if player's team won
      let wl: string | undefined
      let gameInfo: GameData | undefined
      const gameLookupKeys = toGameKeys(g.game_id)
      for (const key of gameLookupKeys) {
        const lookup = lookupGameMap[key]
        if (lookup) {
          gameInfo = lookup
          break
        }
      }
      if (gameInfo) {
        const playerTeamId = g.team_id
        const homeScore = Number(gameInfo.home_score ?? 0)
        const awayScore = Number(gameInfo.away_score ?? 0)
        const homeWon =
          typeof gameInfo.home_win === "number"
            ? gameInfo.home_win === 1
            : homeScore > awayScore

        if (gameInfo.home_team_id === playerTeamId) {
          wl = homeWon ? "W" : "L"
        } else if (gameInfo.away_team_id === playerTeamId) {
          wl = homeWon ? "L" : "W"
        }

        if (!wl && Number.isFinite(homeScore) && Number.isFinite(awayScore)) {
          const isHomePlayer = (g as any).is_home === 1
          const inferredHomeWon = homeScore > awayScore
          wl = isHomePlayer ? (inferredHomeWon ? "W" : "L") : inferredHomeWon ? "L" : "W"
        }
      }

      const statLine: any = {
        date: new Date(g.date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
        opp: teamIdMap[g.opponent_id] || String(g.opponent_id) || "TBD",
        opponent: teamIdMap[g.opponent_id] || String(g.opponent_id) || "TBD",
        wl: wl,
        mins: Number.isFinite(minutes) ? minutes : 0,
        usg: Number.isFinite(usage ?? NaN) ? usage : undefined,
        pts: (fgm - fg3m) * 2 + fg3m * 3 + ftm,
        fg: `${fgm}/${fga}`,
        fgm,
        fga,
        threePtr: `${fg3m}/${fg3a}`,
        threePm: fg3m,
        threePa: fg3a,
        reb: Number(g.rebounds ?? 0),
        ast: Number(g.assists ?? 0),
        stl: Number(g.steals ?? 0),
        blk: Number(g.blocks ?? 0),
        tov: Number(g.turnovers ?? 0),
      };

      if (isHome !== undefined) {
        statLine.isHome = isHome;
        statLine.venue = isHome ? "Home" : "Away";
      }

      return statLine;
    });

  return recentGames;
}

export function getLast5Games(
  playerStats: any[],
  playerName: string,
  teamIdMap: Record<number, string> = {},
  gameDataMap: Record<string, GameData> = {}
) {
  return getPlayerRecentGames(playerStats, playerName, teamIdMap, 5, gameDataMap);
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
