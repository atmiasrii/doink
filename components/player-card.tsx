"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, MoreHorizontal } from "lucide-react"
import { TeamLogoPlaceholder } from "@/components/team-logo-placeholder"

interface StatLine {
  date: string
  opponent: string
  wl: string
  mins: number
  usg: number
  pts: number
  fg: string
  threePtr: string
  reb: number
  ast: number
  stl: number
  blk: number
  tov: number
  twoPtr?: string
}

interface Averages {
  mins: number
  usg: number
  pts: number
  fg: string
  threePtr: string
  reb: number
  ast: number
  stl: number
  blk: number
  tov: number
}

interface HitRates {
  pts: string
  reb: string
  ast: string
  threePtr: string
  fg: string
}

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
  pts: "60% (6/10)",
  reb: "40% (4/10)",
  ast: "50% (5/10)",
  threePtr: "40% (4/10)",
  fg: "80% (8/10)",
}

const defaultBestLines: BestLine[] = [
  { stat: "PTS", line: 12.9, price: -112 },
  { stat: "REB", line: 3, price: 140 },
  { stat: "AST", line: 4, price: -185 },
  { stat: "THREES", line: 2, price: -185 },
  { stat: "COMBO", line: 0.5, price: -180 },
  { stat: "ALT", line: 0.5, price: 235 },
]

export const PlayerCard: React.FC<PlayerCardProps> = ({
  playerName = "Dennis Schröder",
  teamName = "SAC",
  position = "PG",
  avatarUrl = "https://via.placeholder.com/48",
  opponent = "MIL",
  location = "Away",
  status = "Expected",
  statLines = defaultStatLines,
  averages = defaultAverages,
  hitRates = defaultHitRates,
  bestLines = defaultBestLines,
}) => {
  const [selectedRange, setSelectedRange] = useState<"L5" | "L10" | "Season">("L10")
  const [expandedBestLine, setExpandedBestLine] = useState<number | null>(null)

  const altLines = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5]

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
      <div className="overflow-x-auto mb-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800/50">
              <th className="text-left px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs">
                Date
              </th>
              <th className="text-left px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs flex items-center gap-1">
                <TeamLogoPlaceholder abbreviation="OPP" size="sm" />
                Opponent
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs">
                W/L
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs">
                Mins
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs">
                USG%
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs">
                PTS
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs">
                FG
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs">
                3PT
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs">
                REB
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs">
                AST
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs">
                STL
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs">
                BLK
              </th>
              <th className="text-center px-1.5 py-1.5 font-semibold text-slate-400 uppercase tracking-wide text-xs">
                TOV
              </th>
            </tr>
          </thead>
          <tbody>
            {statLines.slice(0, 4).map((stat, idx) => (
              <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                <td className="px-1.5 py-1.5 text-white text-xs">{stat.date}</td>
                <td className="px-1.5 py-1.5 text-white text-xs flex items-center gap-1.5">
                  <TeamLogoPlaceholder abbreviation={stat.opponent} size="sm" />
                  <span>{stat.opponent}</span>
                </td>
                <td className="px-1.5 py-1.5 text-center">
                  <span
                    className={`px-1 py-0.5 rounded text-white font-semibold text-xs ${stat.wl === "W" ? "bg-emerald-600" : "bg-red-600"}`}
                  >
                    {stat.wl}
                  </span>
                </td>
                <td
                  className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.mins, averages.mins)}`}
                >
                  {stat.mins}
                </td>
                <td
                  className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.usg, averages.usg)}`}
                >
                  {stat.usg}%
                </td>
                <td
                  className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.pts, averages.pts as number)}`}
                >
                  {stat.pts}
                </td>
                <td
                  className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.fg, Number.parseFloat((averages.fg as string).split("/")[0]))}`}
                >
                  {stat.fg}
                </td>
                <td
                  className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.threePtr, Number.parseFloat((averages.threePtr as string).split("/")[0]))}`}
                >
                  {stat.threePtr}
                </td>
                <td
                  className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.reb, averages.reb)}`}
                >
                  {stat.reb}
                </td>
                <td
                  className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.ast, averages.ast)}`}
                >
                  {stat.ast}
                </td>
                <td
                  className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.stl, averages.stl)}`}
                >
                  {stat.stl}
                </td>
                <td
                  className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.blk, averages.blk)}`}
                >
                  {stat.blk}
                </td>
                <td
                  className={`px-1.5 py-1.5 text-center text-white font-semibold rounded transition-colors ${getColorByDeviation(stat.tov, averages.tov)}`}
                >
                  {stat.tov}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AVG Row */}
      <div className="mb-2 pb-2 border-b border-slate-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="px-1.5 py-1.5 text-slate-400 font-semibold uppercase text-xs">AVG</td>
                <td className="px-1.5 py-1.5"></td>
                <td className="px-1.5 py-1.5"></td>
                <td className="px-1.5 py-1.5 text-center text-white font-semibold">{averages.mins}</td>
                <td className="px-1.5 py-1.5 text-center text-white font-semibold">{averages.usg}%</td>
                <td className="px-1.5 py-1.5 text-center text-white font-semibold">{averages.pts}</td>
                <td className="px-1.5 py-1.5 text-center text-white font-semibold">{averages.fg}</td>
                <td className="px-1.5 py-1.5 text-center text-white font-semibold">{averages.threePtr}</td>
                <td className="px-1.5 py-1.5 text-center text-white font-semibold">{averages.reb}</td>
                <td className="px-1.5 py-1.5 text-center text-white font-semibold">{averages.ast}</td>
                <td className="px-1.5 py-1.5 text-center text-white font-semibold">{averages.stl}</td>
                <td className="px-1.5 py-1.5 text-center text-white font-semibold">{averages.blk}</td>
                <td className="px-1.5 py-1.5 text-center text-white font-semibold">{averages.tov}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* HIT RATE Row */}
      <div className="mb-3 pb-3 border-b border-slate-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="px-1.5 py-1.5 text-slate-400 font-semibold uppercase text-xs">HIT RA.</td>
                <td className="px-1.5 py-1.5"></td>
                <td className="px-1.5 py-1.5"></td>
                <td className="px-1.5 py-1.5"></td>
                <td className="px-1.5 py-1.5"></td>
                <td className="px-1.5 py-1.5 text-center font-semibold text-emerald-400 text-xs">{hitRates.pts}</td>
                <td className="px-1.5 py-1.5 text-center font-semibold text-slate-400 text-xs">--</td>
                <td className="px-1.5 py-1.5 text-center font-semibold text-rose-400 text-xs">--</td>
                <td className="px-1.5 py-1.5 text-center font-semibold text-emerald-400 text-xs">{hitRates.reb}</td>
                <td className="px-1.5 py-1.5 text-center font-semibold text-emerald-400 text-xs">{hitRates.ast}</td>
                <td className="px-1.5 py-1.5 text-center font-semibold text-slate-400 text-xs">--</td>
                <td className="px-1.5 py-1.5 text-center font-semibold text-slate-400 text-xs">--</td>
                <td className="px-1.5 py-1.5 text-center font-semibold text-slate-400 text-xs">--</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Best Lines Strip - Interactive clickable boxes with alt lines expansion */}
      <div className="mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Best Lines</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="px-1.5 py-1.5"></td>
                <td className="px-1.5 py-1.5"></td>
                <td className="px-1.5 py-1.5"></td>
                {bestLines.map((line, idx) => (
                  <td key={idx} className="px-1.5 py-1.5 text-center relative">
                    <button
                      onClick={() => setExpandedBestLine(expandedBestLine === idx ? null : idx)}
                      className="bg-slate-800/60 border border-slate-700/50 rounded p-1.5 hover:border-emerald-500/50 transition-all w-full text-center"
                    >
                      <div className="text-xs font-semibold text-white">{line.line}</div>
                      <div className="text-xs font-semibold text-slate-400 mt-0.5">
                        {line.price > 0 ? `+${line.price}` : line.price}
                      </div>
                    </button>
                    {expandedBestLine === idx && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded p-2 z-10 min-w-max">
                        <div className="flex gap-1 flex-wrap justify-center mb-2">
                          {altLines.map((altLine) => (
                            <button
                              key={altLine}
                              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-xs font-semibold text-white transition-colors"
                            >
                              {altLine}
                              <span className="text-slate-400 ml-1">-110</span>
                            </button>
                          ))}
                        </div>
                        <button className="w-full px-2 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-xs font-semibold text-white transition-colors">
                          Track Bet
                        </button>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
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
