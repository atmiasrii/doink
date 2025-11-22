"use client"

import type React from "react"
import { useMemo, useState } from "react"

interface StatLine {
  date: string
  reb: number
  pts: number
  ast: number
  threes?: number
  threePm?: number
}

interface PlayerCard2Props {
  playerName?: string
  statLines?: StatLine[]
}

export const PlayerCard2: React.FC<PlayerCard2Props> = ({ 
  playerName = "Player Name",
  statLines = []
}) => {
  const [selectedStat, setSelectedStat] = useState<"pts"|"reb"|"ast"|"threes"|"pra"|"pa"|"ra">("reb")
  const [lineValue, setLineValue] = useState(24.5)


  // Helper to safely get stat value
  const getValue = (s: StatLine) => {
    const pts = Number(s.pts ?? (s as any).points ?? 0)
    const reb = Number(s.reb ?? (s as any).rebounds ?? 0)
    const ast = Number(s.ast ?? (s as any).assists ?? 0)
    const threes = Number(s.threes ?? s.threePm ?? (s as any).threePm ?? (s as any).fg3m ?? 0)
    switch (selectedStat) {
      case "pts": return pts
      case "reb": return reb
      case "ast": return ast
      case "threes": return threes
      case "pra": return pts + reb + ast
      case "pa": return pts + ast
      case "ra": return reb + ast
      default: return 0
    }
  }

  // Use REAL latest 10 games based on date
  const data = useMemo(() => {
    if (!statLines || statLines.length === 0) return []

    // 1. Sort all games by real chronological date (descending)
    const sorted = [...statLines].sort((a, b) => {
      const da = Date.parse(a.date || '')
      const db = Date.parse(b.date || '')
      return db - da
    })

    // 2. Take the truly most recent 10 games
    return sorted.slice(0, 10)
  }, [statLines])


  const processedData = useMemo(() => {
    return data.map((stat) => ({
      stat,
      value: Number(getValue(stat)) || 0,
    }))
  }, [data, selectedStat])

  const values = useMemo(() => {
    return processedData.map((entry) => entry.value).filter((value) => Number.isFinite(value))
  }, [processedData])

  // Calculate average for selected stat
  const avgValue = useMemo(() => {
    if (!values.length) return 0
    const total = values.reduce((sum, v) => sum + v, 0)
    return total / values.length
  }, [values])


  // Use a fixed yMax for rebound stats, or dynamic based on stat type
  const yAxisMax = useMemo(() => {
    const maxInData = Math.max(...values, 0)
    
    // Set reasonable fixed maximums for each stat type
    switch (selectedStat) {
      case "reb":
        return Math.max(10, maxInData) // Rebounds: 0-10 scale
      case "ast":
        return Math.max(10, maxInData) // Assists: 0-10 scale
      case "threes":
        return Math.max(8, maxInData)  // 3PM: 0-8 scale
      case "pts":
        return Math.max(40, maxInData) // Points: 0-40 scale
      case "pra":
        return Math.max(50, maxInData) // P+R+A: 0-50 scale
      case "pa":
        return Math.max(40, maxInData) // P+A: 0-40 scale
      case "ra":
        return Math.max(20, maxInData) // R+A: 0-20 scale
      default:
        return maxInData > 0 ? maxInData : 1
    }
  }, [selectedStat, values])


  // Count how many times they hit the average or above
  const hitsAboveAvg = useMemo(() => {
    if (!processedData.length) return 0
    return processedData.filter(({ value }) => value >= avgValue).length
  }, [processedData, avgValue])

  const hitRate = processedData.length > 0 
    ? `${Math.round((hitsAboveAvg / processedData.length) * 100)}% (${hitsAboveAvg}/${processedData.length})`
    : "0% (0/0)"

  return (
    // Narrow vertical profile card (keeps the same min-height)
    <div className="w-full md:w-72 lg:w-80 bg-slate-900/60 border border-slate-800/50 rounded-lg p-3 shadow-[0_4px_12px_rgba(0,0,0,0.4)] min-h-[640px] flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-base font-bold text-white text-center">{playerName}</h2>
      </div>

      {/* Rebounds Chart */}
      <div className="flex-1 rounded-lg border border-slate-800/40 bg-slate-950/10 p-4 flex flex-col min-h-[500px]">
        {/* Header */}
        <div className="mb-3 flex-shrink-0">
          <h3 className="text-sm font-semibold text-white mb-1">
            {selectedStat === "pts" ? "Points" : 
             selectedStat === "reb" ? "Rebounds" :
             selectedStat === "ast" ? "Assists" :
             selectedStat === "threes" ? "3-Pointers Made" :
             selectedStat === "pra" ? "Points + Rebounds + Assists" :
             selectedStat === "pa" ? "Points + Assists" :
             "Rebounds + Assists"}
          </h3>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Avg: <span className="text-emerald-400 font-semibold">{avgValue.toFixed(1)}</span></span>
            <span className="text-slate-400">Hit Rate: <span className="text-amber-400 font-semibold">{hitRate}</span></span>
          </div>

          {/* Stat Switch Buttons */}
          <div className="grid grid-cols-4 gap-1.5 mt-3 mb-2">
            {[
              { key: "pts", label: "PTS" },
              { key: "reb", label: "REB" },
              { key: "ast", label: "AST" },
              { key: "threes", label: "3PM" },
              { key: "pra", label: "P+R+A" },
              { key: "pa", label: "P+A" },
              { key: "ra", label: "R+A" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedStat(key as any)}
                className={`text-xs px-2 py-1 rounded-md border 
                  ${selectedStat === key 
                    ? "bg-emerald-500 text-black border-emerald-400" 
                    : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="block" style={{ height: 320 }}>
          {/* GRAPH BOX */}
            <div className="relative h-[260px] w-full">
            {processedData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                No stat data available
              </div>
            ) : (
              <>
                {/* Avg line */}
                <div 
                  className="absolute left-0 right-0 border-t-2 border-emerald-500 border-dashed"
                  style={{ bottom: `${(avgValue / yAxisMax) * 100}%` }}
                >
                  <span className="absolute -top-2 -left-1 text-[10px] font-semibold text-emerald-400 bg-slate-950/80 px-1 rounded">
                    {avgValue.toFixed(1)}
                  </span>
                </div>

                {/* Bars */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around gap-2 px-2 h-full">
                  {processedData.map(({ stat, value }, idx) => {
                    const heightPercent = yAxisMax > 0 ? (value / yAxisMax) * 100 : 0
                    const heightPx = Math.max((heightPercent / 100) * 260, 8) // 260px is h-[260px], min 8px
                    const isAboveAvg = value >= avgValue
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative">
                        <div 
                          className={`w-full rounded-t transition-all hover:opacity-80 ${
                            isAboveAvg ? "bg-emerald-500" : "bg-red-500"
                          }`}
                          style={{ 
                            height: `${heightPx}px`
                          }}
                        >
                          {/* Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs whitespace-nowrap pointer-events-none">
                            <div className="text-white font-semibold">{value}</div>
                            <div className="text-slate-400 text-[10px]">{stat.date}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* X-AXIS LABEL */}
          <div className="mt-3 text-[10px] text-slate-500 text-center">
            {processedData.length > 0
              ? `Last ${processedData.length} Games (Most Recent →)`
              : "No recent games available"}
          </div>

          {/* LINE PICKER */}
          <div className="mt-4 flex items-center justify-center gap-6">
            <button 
              onClick={() => setLineValue(prev => prev - 0.5)}
              className="px-2 py-1 rounded bg-slate-800 text-white text-lg"
            >
              &lt;
            </button>

            <span className="text-xl font-bold text-white">
              {lineValue.toFixed(1)}
            </span>

            <button 
              onClick={() => setLineValue(prev => prev + 0.5)}
              className="px-2 py-1 rounded bg-slate-800 text-white text-lg"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
