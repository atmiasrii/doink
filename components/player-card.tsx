"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { ChevronDown, MoreHorizontal } from "lucide-react"
import { TeamLogoPlaceholder } from "@/components/team-logo-placeholder"

interface StatLine {
  date: string
  opponent?: string
  opp?: string | number
  wl?: string
  mins: number
  usg?: number
  pts: number
  fg?: string
  fgm?: number
  fga?: number
  threePtr?: string
  threePm?: number
  reb: number
  ast: number
  stl?: number
  blk?: number
  tov?: number
  twoPtr?: string
}

interface Averages {
  mins?: number
  usg?: number
  pts: number
  fg?: string
  threePtr?: string
  threePm?: number
  reb: number
  ast: number
  stl?: number
  blk?: number
  tov?: number
  pra?: number
}

type HitRateKey = "mins" | "usg" | "pts" | "fg" | "threePtr" | "reb" | "ast" | "stl" | "blk" | "tov"

type HitRates = Record<HitRateKey, string>

interface BestLine {
  stat: string
  line: number
  price: number
}

interface PlayerCardProps {
  playerName?: string
  teamName?: string
  position?: string
  avatarUrl?: string
  opponent?: string
  location?: string
  status?: string
  statLines?: StatLine[]
  averages?: Averages
  hitRates?: HitRates
  bestLines?: BestLine[]
}

const getColorByDeviation = (statValue: number | string, bestLineValue: number): string => {
  // Parse string values like "6/10" to numeric for calculation
  let numValue: number
  if (typeof statValue === "string") {
    const parts = statValue.split("/")
    numValue = Number.parseFloat(parts[0]) || 0
  } else {
    numValue = statValue
  }

  if (bestLineValue === 0) return "bg-slate-900"

  const diff = (numValue - bestLineValue) / Math.abs(bestLineValue)

  if (diff > 0.25) return "bg-emerald-700"
  if (diff > 0.1) return "bg-emerald-600"
  if (diff > 0.05) return "bg-emerald-500"
  if (Math.abs(diff) <= 0.05) return "bg-slate-800"
  if (diff < -0.05) return "bg-red-500"
  if (diff < -0.1) return "bg-red-600"
  if (diff < -0.25) return "bg-red-700"

  return "bg-slate-800"
}

const defaultStatLines: StatLine[] = [
  {
    date: "4/22/25",
    opponent: "NYK",
    wl: "W",
    mins: 29,
    usg: 23,
    pts: 20,
    fg: "6/10",
    threePtr: "3/5",
    reb: 2,
    ast: 3,
    stl: 0,
    blk: 0,
    tov: 2,
  },
  {
    date: "4/25/25",
    opponent: "NYK",
    wl: "L",
    mins: 29,
    usg: 15,
    pts: 18,
    fg: "6/9",
    threePtr: "4/6",
    reb: 5,
    ast: 2,
    stl: 0,
    blk: 0,
    tov: 0,
  },
  {
    date: "4/27/25",
    opponent: "NYK",
    wl: "L",
    mins: 27,
    usg: 9,
    pts: 6,
    fg: "2/4",
    threePtr: "0/0",
    reb: 3,
    ast: 2,
    stl: 3,
    blk: 0,
    tov: 0,
  },
  {
    date: "4/30/25",
    opponent: "NYK",
    wl: "W",
    mins: 22,
    usg: 28,
    pts: 14,
    fg: "6/13",
    threePtr: "1/4",
    reb: 0,
    ast: 3,
    stl: 1,
    blk: 0,
    tov: 2,
  },
  {
    date: "5/2/25",
    opponent: "NYK",
    wl: "L",
    mins: 30,
    usg: 17,
    pts: 9,
    fg: "3/9",
    threePtr: "1/4",
    reb: 4,
    ast: 9,
    stl: 1,
    blk: 1,
    tov: 1,
  },
]

const defaultAverages: Averages = {
  mins: 29,
  usg: 18,
  pts: 12.9,
  fg: "5/11",
  threePtr: "2/4",
  reb: 3,
  ast: 4,
  stl: 1,
  blk: 0,
  tov: 1,
}

const defaultHitRates: HitRates = {
  mins: "0% (0/0)",
  usg: "0% (0/0)",
  pts: "60% (6/10)",
  fg: "80% (8/10)",
  threePtr: "40% (4/10)",
  reb: "40% (4/10)",
  ast: "50% (5/10)",
  stl: "30% (3/10)",
  blk: "10% (1/10)",
  tov: "60% (6/10)",
}

const zeroHitRates: HitRates = {
  mins: "0% (0/0)",
  usg: "0% (0/0)",
  pts: "0% (0/0)",
  fg: "0% (0/0)",
  threePtr: "0% (0/0)",
  reb: "0% (0/0)",
  ast: "0% (0/0)",
  stl: "0% (0/0)",
  blk: "0% (0/0)",
  tov: "0% (0/0)",
}

const defaultBestLines: BestLine[] = [
  { stat: "PTS", line: 12.9, price: -112 },
  { stat: "REB", line: 3, price: 140 },
  { stat: "AST", line: 4, price: -185 },
  { stat: "THREES", line: 2, price: -185 },
  { stat: "COMBO", line: 0.5, price: -180 },
  { stat: "ALT", line: 0.5, price: 235 },
]

// Zero stats for players with no historical data (rookies, etc.)
const zeroStatLines: StatLine[] = []

const zeroAverages: Averages = {
  mins: 0,
  usg: 0,
  pts: 0,
  fg: "0/0",
  threePtr: "0/0",
  threePm: 0,
  reb: 0,
  ast: 0,
  stl: 0,
  blk: 0,
  tov: 0,
  pra: 0,
}

const STAT_COLUMN_KEYS: (string | null)[] = [
  null,
  null,
  "MINS",
  "USG",
  "PTS",
  "FG",
  "3PT",
  "REB",
  "AST",
  "STL",
  "BLK",
  "TOV",
]

const SUPPORTED_BEST_LINE_COLUMNS = new Set(["MINS", "USG", "PTS", "FG", "3PT", "REB", "AST", "STL", "BLK", "TOV"])

const COLUMN_TO_HIT_RATE_KEY: Partial<Record<string, HitRateKey>> = {
  MINS: "mins",
  USG: "usg",
  PTS: "pts",
  FG: "fg",
  "3PT": "threePtr",
  REB: "reb",
  AST: "ast",
  STL: "stl",
  BLK: "blk",
  TOV: "tov",
}

type RawAverages = {
  mins: number
  usg: number
  pts: number
  fgMade: number
  fgAttempts: number
  threeMade: number
  threeAttempts: number
  reb: number
  ast: number
  stl: number
  blk: number
  tov: number
}

const formatNumber = (value: number, decimals = 1): string => {
  if (!Number.isFinite(value)) return "0"
  const fixed = value.toFixed(decimals)
  return fixed.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1")
}

const parseShotString = (value?: string | number): { made: number; attempts: number } => {
  if (typeof value === "number") {
    return { made: value, attempts: 0 }
  }

  if (!value) {
    return { made: 0, attempts: 0 }
  }

  const [madeStr, attemptStr] = String(value).split("/")
  const made = Number.parseFloat(madeStr) || 0
  const attempts = Number.parseFloat(attemptStr) || 0
  return { made, attempts }
}

const extractFgShots = (stat: StatLine): { made: number; attempts: number } => {
  const parsed = parseShotString(stat.fg)
  const made = stat.fgm ?? parsed.made
  const attempts = stat.fga ?? parsed.attempts
  return { made: made ?? 0, attempts: attempts ?? 0 }
}

const extractThreeShots = (stat: StatLine): { made: number; attempts: number } => {
  const parsed = parseShotString(stat.threePtr)
  const made = stat.threePm ?? parsed.made
  return { made: made ?? 0, attempts: parsed.attempts }
}

const formatShotAverage = (madePerGame: number, attemptsPerGame: number): string => {
  if (madePerGame === 0 && attemptsPerGame === 0) return "0/0"
  return `${formatNumber(madePerGame)}/${formatNumber(attemptsPerGame)}`
}

const formatHitRate = (hits: number, total: number): string => {
  if (total === 0) return "0% (0/0)"
  const percentage = Math.round((hits / total) * 100)
  return `${percentage}% (${hits}/${total})`
}

const computeHitRatesForLines = (lines: StatLine[], raw: RawAverages): HitRates => {
  if (lines.length === 0) {
    return zeroHitRates
  }

  const metrics: Array<{ key: HitRateKey; average: number; extractor: (line: StatLine) => number }> = [
    { key: "mins", average: raw.mins, extractor: (line) => line.mins ?? 0 },
    { key: "usg", average: raw.usg, extractor: (line) => line.usg ?? 0 },
    { key: "pts", average: raw.pts, extractor: (line) => line.pts ?? 0 },
    { key: "fg", average: raw.fgMade, extractor: (line) => extractFgShots(line).made },
    { key: "threePtr", average: raw.threeMade, extractor: (line) => extractThreeShots(line).made },
    { key: "reb", average: raw.reb, extractor: (line) => line.reb ?? 0 },
    { key: "ast", average: raw.ast, extractor: (line) => line.ast ?? 0 },
    { key: "stl", average: raw.stl, extractor: (line) => line.stl ?? 0 },
    { key: "blk", average: raw.blk, extractor: (line) => line.blk ?? 0 },
    { key: "tov", average: raw.tov, extractor: (line) => line.tov ?? 0 },
  ]

  const results: HitRates = { ...zeroHitRates }

  for (const { key, average, extractor } of metrics) {
    const hits = lines.reduce((totalHits, line) => (extractor(line) > average ? totalHits + 1 : totalHits), 0)
    results[key] = formatHitRate(hits, lines.length)
  }

  return results
}

const computeRangeMetrics = (lines: StatLine[]): { averages: Averages; hitRates: HitRates; raw: RawAverages } => {
  if (lines.length === 0) {
    return { averages: zeroAverages, hitRates: zeroHitRates, raw: {
      mins: 0,
      usg: 0,
      pts: 0,
      fgMade: 0,
      fgAttempts: 0,
      threeMade: 0,
      threeAttempts: 0,
      reb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      tov: 0,
    } }
  }

  const totals = {
    mins: 0,
    usg: 0,
    pts: 0,
    fgMade: 0,
    fgAttempts: 0,
    threeMade: 0,
    threeAttempts: 0,
    reb: 0,
    ast: 0,
    stl: 0,
    blk: 0,
    tov: 0,
    pra: 0,
  }

  for (const stat of lines) {
    const mins = Number(stat.mins ?? 0)
    const usg = Number(stat.usg ?? 0)
    const pts = Number(stat.pts ?? 0)
    const reb = Number(stat.reb ?? 0)
    const ast = Number(stat.ast ?? 0)
    const stl = Number(stat.stl ?? 0)
    const blk = Number(stat.blk ?? 0)
    const tov = Number(stat.tov ?? 0)

    totals.mins += mins
    totals.usg += usg
    totals.pts += pts
    totals.reb += reb
    totals.ast += ast
    totals.stl += stl
    totals.blk += blk
    totals.tov += tov
    totals.pra += pts + reb + ast

    const fg = extractFgShots(stat)
    totals.fgMade += fg.made
    totals.fgAttempts += fg.attempts

    const threes = extractThreeShots(stat)
    totals.threeMade += threes.made
    totals.threeAttempts += threes.attempts
  }

  const gameCount = lines.length
  const averageValue = (value: number) => value / gameCount

  const fgMadePerGame = averageValue(totals.fgMade)
  const fgAttemptsPerGame = averageValue(totals.fgAttempts)
  const threeMadePerGame = averageValue(totals.threeMade)
  const threeAttemptsPerGame = averageValue(totals.threeAttempts)

  const averages: Averages = {
    mins: Number(formatNumber(averageValue(totals.mins))),
    usg: Number(formatNumber(averageValue(totals.usg))),
    pts: Number(formatNumber(averageValue(totals.pts))),
    fg: formatShotAverage(fgMadePerGame, fgAttemptsPerGame),
    threePtr: formatShotAverage(threeMadePerGame, threeAttemptsPerGame),
    threePm: Number(formatNumber(threeMadePerGame)),
    reb: Number(formatNumber(averageValue(totals.reb))),
    ast: Number(formatNumber(averageValue(totals.ast))),
    stl: Number(formatNumber(averageValue(totals.stl))),
    blk: Number(formatNumber(averageValue(totals.blk))),
    tov: Number(formatNumber(averageValue(totals.tov))),
    pra: Number(formatNumber(averageValue(totals.pra))),
  }

  const raw: RawAverages = {
    mins: totals.mins / gameCount,
    usg: totals.usg / gameCount,
    pts: totals.pts / gameCount,
    fgMade: fgMadePerGame,
    fgAttempts: fgAttemptsPerGame,
    threeMade: threeMadePerGame,
    threeAttempts: threeAttemptsPerGame,
    reb: totals.reb / gameCount,
    ast: totals.ast / gameCount,
    stl: totals.stl / gameCount,
    blk: totals.blk / gameCount,
    tov: totals.tov / gameCount,
  }

  const hitRates = computeHitRatesForLines(lines, raw)

  return { averages, hitRates, raw }
}

const normalizeBestLineKey = (statLabel: string): string | null => {
  const label = statLabel.trim().toUpperCase()
  if (label === "THREES" || label === "3PM" || label === "3P" || label === "3 POINTERS" || label === "3-PT") {
    return "3PT"
  }
  if (label === "FIELD GOALS" || label === "FGM" || label === "FG%") {
    return "FG"
  }
  if (label === "POINTS" || label === "PTS") {
    return "PTS"
  }
  if (label === "REBOUNDS" || label === "REB") {
    return "REB"
  }
  if (label === "ASSISTS" || label === "AST") {
    return "AST"
  }
  if (label === "STEALS" || label === "STL") {
    return "STL"
  }
  if (label === "BLOCKS" || label === "BLK") {
    return "BLK"
  }
  if (label === "TURNOVERS" || label === "TOV") {
    return "TOV"
  }
  if (label === "MINUTES" || label === "MINS" || label === "MIN") {
    return "MINS"
  }
  if (label === "USAGE" || label === "USG" || label === "USG%") {
    return "USG"
  }

  return SUPPORTED_BEST_LINE_COLUMNS.has(label) ? label : null
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  playerName = "Dennis Schröder",
  teamName = "SAC",
  avatarUrl = "",
  opponent = "MIL",
  location = "Away",
  status = "Expected",
  statLines,
  averages,
  hitRates = defaultHitRates,
  bestLines = defaultBestLines,
}) => {
  const [selectedRange, setSelectedRange] = useState<"L5" | "L10" | "Season">("L10")
  const [expandedBestLine, setExpandedBestLine] = useState<string | null>(null)

  const hasRealStats = Array.isArray(statLines) && statLines.length > 0
  const safeStatLines = hasRealStats ? statLines! : []

  const rangeTarget = selectedRange === "Season" ? safeStatLines.length : selectedRange === "L10" ? 10 : 5
  const normalizedRangeTarget = rangeTarget > 0 ? Math.min(rangeTarget, safeStatLines.length) : safeStatLines.length
  const rangeStatLines = safeStatLines.slice(0, normalizedRangeTarget)

  const rowLimit = selectedRange === "L5" ? 5 : selectedRange === "L10" ? 10 : rangeStatLines.length
  const tableStatLines = rangeStatLines.slice(0, rowLimit)
  const tableContainerClasses = "overflow-x-auto"

  const { averages: computedAverages, hitRates: computedHitRates } = useMemo(
    () => computeRangeMetrics(rangeStatLines),
    [rangeStatLines]
  )

  const displayAverages = hasRealStats ? computedAverages : averages || zeroAverages
  const displayHitRates = hasRealStats ? computedHitRates : hitRates || zeroHitRates

  const bestLineLookup = useMemo(() => {
    const lookup: Record<string, BestLine> = {}
    for (const line of bestLines) {
      const normalized = normalizeBestLineKey(line.stat)
      if (normalized) {
        lookup[normalized] = line
      }
    }
    return lookup
  }, [bestLines])

  useEffect(() => {
    if (expandedBestLine && !bestLineLookup[expandedBestLine]) {
      setExpandedBestLine(null)
    }
  }, [expandedBestLine, bestLineLookup])

  const altLines = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5]

  const renderHitRateCell = (columnKey: string | null, index: number) => {
    if (!columnKey) {
      return <td key={`hit-${index}`} className="px-1.5 py-1.5"></td>
    }

    const hitRateKey = COLUMN_TO_HIT_RATE_KEY[columnKey]

    if (!hitRateKey) {
      return (
        <td key={`hit-${index}`} className="px-1.5 py-1.5 text-center text-xs text-slate-500">
          --
        </td>
      )
    }

    const value = displayHitRates?.[hitRateKey] ?? zeroHitRates[hitRateKey]
    const match = value.match(/^-?(\d+(?:\.\d+)?)%/)
    const percent = match ? Number(match[1]) : null
    const colorClass =
      percent === null
        ? "text-slate-400"
        : percent >= 60
        ? "text-emerald-400"
        : percent >= 40
        ? "text-amber-300"
        : "text-red-400"

    return (
      <td key={`hit-${index}`} className={`px-1.5 py-1.5 text-center text-xs font-semibold tabular-nums ${colorClass}`}>
        {value}
      </td>
    )
  }

  const renderBestLineCell = (columnKey: string | null, index: number) => {
    if (!columnKey) {
      return <td key={`best-${index}`} className="px-1.5 py-1.5"></td>
    }

    const normalizedKey = columnKey.toUpperCase()
    const bestLine = bestLineLookup[normalizedKey]

    if (!bestLine) {
      return (
        <td key={`best-${index}`} className="px-1.5 py-1.5 text-center text-xs text-slate-500">
          --
        </td>
      )
    }

    const formattedLine = formatNumber(bestLine.line, 1)
    const formattedPrice = bestLine.price > 0 ? `+${bestLine.price}` : `${bestLine.price}`
    const isExpanded = expandedBestLine === normalizedKey

    return (
      <td key={`best-${index}`} className="relative px-1.5 py-1.5 text-center">
        <button
          type="button"
          onClick={() => setExpandedBestLine(isExpanded ? null : normalizedKey)}
          className="w-full rounded border border-slate-700/60 bg-slate-800/60 px-2 py-1 text-xs font-semibold text-white transition hover:border-emerald-500/60"
        >
          <div className="tabular-nums">{formattedLine}</div>
          <div className="tabular-nums text-[11px] font-medium text-slate-300">{formattedPrice}</div>
        </button>
        {isExpanded && (
          <div className="absolute left-1/2 top-full z-20 mt-1 w-48 -translate-x-1/2 rounded-md border border-slate-700 bg-slate-900 p-2 shadow-lg">
            <div className="mb-2 flex flex-wrap justify-center gap-1">
              {altLines.map((altLine) => (
                <button
                  key={`${normalizedKey}-${altLine}`}
                  type="button"
                  className="rounded border border-slate-700/60 bg-slate-800 px-2 py-1 text-[11px] font-semibold text-white transition hover:border-emerald-500/60 hover:text-emerald-200"
                >
                  {altLine}
                  <span className="ml-1 text-slate-400">-110</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="w-full rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-emerald-500"
            >
              Track Bet
            </button>
          </div>
        )}
      </td>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900/60 border border-slate-800/50 rounded-lg p-3 shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {/* Avatar and badges */}
          <div className="relative">
            <img
              src={avatarUrl || "/placeholder.svg"}
              alt={playerName}
              className="w-10 h-10 rounded-full object-cover bg-slate-800"
            />
            <div className="absolute -bottom-0.5 -right-0.5 bg-slate-950 border border-slate-700 rounded-full px-1 py-0 text-xs font-semibold text-white">
              {teamName}
            </div>
          </div>
          {/* Player info */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{playerName}</h2>
              <span className="text-xs text-slate-400">⇅ Swap</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 bg-slate-800 rounded text-xs font-semibold text-white border border-slate-700">
                {teamName}
              </span>
              <span className="px-2 py-0.5 bg-yellow-900/40 rounded text-xs font-semibold text-yellow-300 border border-yellow-700/30">
                {status}
              </span>
            </div>
          </div>
        </div>
        {/* Opponent and location */}
        <div className="text-right text-xs text-slate-300">
          <div className="font-semibold text-white flex items-center justify-end gap-1.5">
            <span>vs</span>
            <TeamLogoPlaceholder abbreviation={opponent} size="sm" />
            <span>{opponent}</span>
          </div>
          <div className="text-slate-400">{location}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-800/50">
        {/* Range selector */}
        <div className="flex items-center gap-1">
          {(["L5", "L10", "Season"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                selectedRange === range
                  ? "bg-blue-600 text-white border border-blue-500"
                  : "bg-slate-800 text-slate-300 border border-slate-700/50 hover:bg-slate-700"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Compact filter buttons */}
        {[
          { label: `vs ${opponent}`, icon: true },
          { label: location, icon: true },
          { label: "Full Game", icon: true },
          { label: "Without Players", icon: true },
          { label: "Filter by minutes", icon: true },
          { label: "Filter by FGA", icon: true },
          { label: "More Filters +", icon: false },
        ].map((filter) => (
          <button
            key={filter.label}
            className="px-2.5 py-1 bg-slate-800 border border-slate-700/50 rounded text-xs font-semibold text-white hover:bg-slate-700 transition-colors flex items-center gap-1"
          >
            {filter.label}
            {filter.icon && <ChevronDown size={12} />}
          </button>
        ))}
      </div>

      {/* Stats Table */}
      <div className="mb-3 pb-3 border-b border-slate-800/50">
        <div className={tableContainerClasses}>
          <table className="w-full text-xs table-fixed">
          <thead>
            <tr className="border-b border-slate-800/50">
              <th className="text-left px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs w-[70px]">
                Date
              </th>
              <th className="text-left px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs flex items-center gap-1 w-[50px]">
                <TeamLogoPlaceholder abbreviation="OPP" size="sm" />
                Opponent
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs w-[45px]">
                W/L
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs w-[55px]">
                Mins
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs w-[55px]">
                USG%
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs w-[55px]">
                PTS
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs w-[65px]">
                FG
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs w-[55px]">
                3PT
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs w-[55px]">
                REB
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs w-[55px]">
                AST
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs w-[50px]">
                STL
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs w-[50px]">
                BLK
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs w-[50px]">
                TOV
              </th>
            </tr>
          </thead>
          <tbody>
            {tableStatLines.length === 0 ? (
              <tr className="border-b border-slate-800/50">
                <td colSpan={13} className="px-1.5 py-8 text-center text-slate-400 text-sm">
                  No game data available for 2024-25 season
                </td>
              </tr>
            ) : (
              <>
                {tableStatLines.map((stat, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                    <td className="px-1.5 py-1.5 text-white text-xs">{stat.date}</td>
                    <td className="px-1.5 py-1.5 text-white text-xs flex items-center gap-1.5">
                      <TeamLogoPlaceholder abbreviation={String(stat.opponent || stat.opp || "TBD")} size="sm" />
                      <span>{stat.opponent || stat.opp}</span>
                    </td>
                    <td className="px-1.5 py-1.5 text-center">
                      <span
                        className={`px-1 py-0.5 rounded text-white font-semibold text-xs ${stat.wl === "W" ? "bg-emerald-600" : "bg-red-600"}`}
                      >
                        {stat.wl || "N/A"}
                      </span>
                    </td>
                    <td
                      className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.mins, displayAverages.mins || 0)}`}
                    >
                      {stat.mins}
                    </td>
                    <td
                      className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.usg || 0, displayAverages.usg || 0)}`}
                    >
                      {`${stat.usg ?? 0}%`}
                    </td>
                    <td
                      className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.pts, displayAverages.pts as number)}`}
                    >
                      {stat.pts}
                    </td>
                    <td
                      className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.fg || 0, Number.parseFloat(((displayAverages.fg || "0/0") as string).split("/")[0]))}`}
                    >
                      {stat.fg || (stat.fgm !== undefined && stat.fga !== undefined ? `${stat.fgm}/${stat.fga}` : "0/0")}
                    </td>
                    <td
                      className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.threePtr || stat.threePm || 0, Number.parseFloat(((displayAverages.threePtr || "0/0") as string).split("/")[0]))}`}
                    >
                      {stat.threePtr || stat.threePm || 0}
                    </td>
                    <td
                      className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.reb, displayAverages.reb)}`}
                    >
                      {stat.reb}
                    </td>
                    <td
                      className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.ast, displayAverages.ast)}`}
                    >
                      {stat.ast}
                    </td>
                    <td
                      className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.stl || 0, displayAverages.stl || 0)}`}
                    >
                      {stat.stl || 0}
                    </td>
                    <td
                      className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.blk || 0, displayAverages.blk || 0)}`}
                    >
                      {stat.blk || 0}
                    </td>
                    <td
                      className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.tov || 0, displayAverages.tov || 0)}`}
                    >
                      {stat.tov || 0}
                    </td>
                  </tr>
                ))}
                {/* Add empty placeholder rows when L5 is selected to maintain consistent card height */}
                {selectedRange === "L5" && Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`placeholder-${idx}`} className="border-b border-slate-800/50">
                    <td className="px-1.5 py-1.5 text-xs">&nbsp;</td>
                    <td className="px-1.5 py-1.5 text-xs">&nbsp;</td>
                    <td className="px-1.5 py-1.5 text-center">&nbsp;</td>
                    <td className="px-1.5 py-1.5 text-center">&nbsp;</td>
                    <td className="px-1.5 py-1.5 text-center">&nbsp;</td>
                    <td className="px-1.5 py-1.5 text-center">&nbsp;</td>
                    <td className="px-1.5 py-1.5 text-center">&nbsp;</td>
                    <td className="px-1.5 py-1.5 text-center">&nbsp;</td>
                    <td className="px-1.5 py-1.5 text-center">&nbsp;</td>
                    <td className="px-1.5 py-1.5 text-center">&nbsp;</td>
                    <td className="px-1.5 py-1.5 text-center">&nbsp;</td>
                    <td className="px-1.5 py-1.5 text-center">&nbsp;</td>
                    <td className="px-1.5 py-1.5 text-center">&nbsp;</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
          <tfoot className="bg-slate-900/40">
            <tr className="border-t border-slate-800/50">
              <td className="px-1.5 py-1.5 text-slate-400 font-semibold uppercase text-xs">AVG</td>
              <td className="px-1.5 py-1.5"></td>
              <td className="px-1.5 py-1.5"></td>
              <td className="px-1.5 py-1.5 text-center text-white font-semibold">{displayAverages.mins || 0}</td>
              <td className="px-1.5 py-1.5 text-center text-white font-semibold">
                {displayAverages.usg != null ? `${displayAverages.usg}%` : "0%"}
              </td>
              <td className="px-1.5 py-1.5 text-center text-white font-semibold">{displayAverages.pts}</td>
              <td className="px-1.5 py-1.5 text-center text-white font-semibold">{displayAverages.fg || "0/0"}</td>
              <td className="px-1.5 py-1.5 text-center text-white font-semibold">
                {displayAverages.threePtr || displayAverages.threePm || 0}
              </td>
              <td className="px-1.5 py-1.5 text-center text-white font-semibold">{displayAverages.reb}</td>
              <td className="px-1.5 py-1.5 text-center text-white font-semibold">{displayAverages.ast}</td>
              <td className="px-1.5 py-1.5 text-center text-white font-semibold">{displayAverages.stl || 0}</td>
              <td className="px-1.5 py-1.5 text-center text-white font-semibold">{displayAverages.blk || 0}</td>
              <td className="px-1.5 py-1.5 text-center text-white font-semibold">{displayAverages.tov || 0}</td>
            </tr>
            <tr className="border-t border-slate-800/50">
              <td className="px-1.5 py-1.5 text-slate-400 font-semibold uppercase text-xs">HIT RA.</td>
              {STAT_COLUMN_KEYS.map((columnKey, index) => renderHitRateCell(columnKey, index))}
            </tr>
            <tr className="border-t border-slate-800/50">
              <td className="px-1.5 py-1.5 text-slate-400 font-semibold uppercase text-xs">BEST LINES</td>
              {STAT_COLUMN_KEYS.map((columnKey, index) => renderBestLineCell(columnKey, index))}
            </tr>
          </tfoot>
        </table>
        </div>
      </div>

      {/* Expand Breakdown Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
        <button className="flex items-center gap-2 text-xs font-semibold text-white hover:text-emerald-400 transition-colors group">
          <MoreHorizontal size={14} />
          <span>Expand Breakdown</span>
          <ChevronDown size={12} className="group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  )
}
