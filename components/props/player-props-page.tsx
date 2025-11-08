"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { GameLogTable } from "./game-log-table"
import { DefenseSplitsTable } from "./defense-splits-table"
import { AltLinesGrid } from "./alt-lines-grid"
import { BestLinesStrip } from "./best-lines-strip"

interface PlayerPropsPageProps {
  player: any
  gameLog: any[]
  defenseSplits: any[]
  markets: any
}

export function PlayerPropsPage({ player, gameLog, defenseSplits, markets }: PlayerPropsPageProps) {
  const [activeMarket, setActiveMarket] = useState("pts")
  const [selectedLine, setSelectedLine] = useState(markets[activeMarket]?.currentLine || 0)
  const [filters, setFilters] = useState({
    range: "L10",
    opponent: "Any",
    location: "All",
  })

  const handleLineChange = (newLine: number) => {
    setSelectedLine(newLine)
    markets[activeMarket].currentLine = newLine
  }

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <Card className="p-6 bg-slate-800/30 border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-700/50 rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-slate-400">{player.pos}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{player.name}</h1>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-slate-700/50 px-2 py-1 rounded">{player.pos}</span>
              <span className="text-xs bg-slate-700/50 px-2 py-1 rounded">{player.team}</span>
              <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-1 rounded">Expected</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={filters.range}
          onChange={(e) => setFilters({ ...filters, range: e.target.value })}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded text-sm text-slate-100"
        >
          <option>L5</option>
          <option>L10</option>
          <option>Season</option>
        </select>
        <select
          value={filters.opponent}
          onChange={(e) => setFilters({ ...filters, opponent: e.target.value })}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded text-sm text-slate-100"
        >
          <option>Any</option>
          <option>vs Team A</option>
          <option>vs Team B</option>
        </select>
        <select
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded text-sm text-slate-100"
        >
          <option>All</option>
          <option>Home</option>
          <option>Away</option>
        </select>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GameLogTable gameLog={gameLog} activeMarket={activeMarket} selectedLine={selectedLine} />
        <DefenseSplitsTable defenseSplits={defenseSplits} activeMarket={activeMarket} selectedLine={selectedLine} />
      </div>

      {/* Best Lines Strip */}
      <BestLinesStrip markets={markets} activeMarket={activeMarket} onMarketChange={setActiveMarket} />

      {/* Alt Lines Grid */}
      <AltLinesGrid market={markets[activeMarket]} onLineSelect={handleLineChange} />
    </div>
  )
}
