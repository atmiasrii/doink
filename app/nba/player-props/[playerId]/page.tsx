"use client"

import { useState } from "react"
import { PageContainer } from "@/components/layout/page-container"
import { Card } from "@/components/ui/card"
import playerData from "@/data/player.json"
import { PlayerHeader } from "@/components/props/player-header"
import { GameLogTable } from "@/components/props/game-log-table"
import { DefenseSplitsTable } from "@/components/props/defense-splits-table"
import { BestLinesStrip } from "@/components/props/best-lines-strip"
import { AltLinesGrid } from "@/components/props/alt-lines-grid"

export default function PlayerPropsPage() {
  const [activeMarket, setActiveMarket] = useState("pts")
  const [selectedLines, setSelectedLines] = useState({
    pts: 25.5,
    reb: 4.5,
    ast: 6.5,
    threePm: 2.5,
    pra: 35.5,
  })
  const [range, setRange] = useState("L10")
  const [opponent, setOpponent] = useState("any")
  const [location, setLocation] = useState("all")

  const markets = {
    pts: {
      label: "Points",
      currentLine: selectedLines.pts,
      bestPrice: 109,
      altLines: [
        { line: 20.5, price: -110 },
        { line: 21.5, price: -105 },
        { line: 22.5, price: -110 },
        { line: 23.5, price: -110 },
        { line: 24.5, price: -110 },
        { line: 25.5, price: 109 },
        { line: 26.5, price: -110 },
        { line: 27.5, price: -110 },
      ],
    },
    reb: {
      label: "Rebounds",
      currentLine: selectedLines.reb,
      bestPrice: 110,
      altLines: [
        { line: 2.5, price: -110 },
        { line: 3.5, price: -110 },
        { line: 4.5, price: 110 },
        { line: 5.5, price: -110 },
        { line: 6.5, price: -110 },
      ],
    },
    ast: {
      label: "Assists",
      currentLine: selectedLines.ast,
      bestPrice: 110,
      altLines: [
        { line: 4.5, price: -110 },
        { line: 5.5, price: -110 },
        { line: 6.5, price: 110 },
        { line: 7.5, price: -110 },
        { line: 8.5, price: -110 },
      ],
    },
    threePm: {
      label: "3-Pointers",
      currentLine: selectedLines.threePm,
      bestPrice: 120,
      altLines: [
        { line: 1.5, price: -110 },
        { line: 2.5, price: -110 },
        { line: 2.5, price: 120 },
        { line: 3.5, price: -110 },
        { line: 4.5, price: -110 },
      ],
    },
    pra: {
      label: "PRA",
      currentLine: selectedLines.pra,
      bestPrice: 110,
      altLines: [
        { line: 30.5, price: -110 },
        { line: 32.5, price: -110 },
        { line: 35.5, price: 110 },
        { line: 38.5, price: -110 },
        { line: 40.5, price: -110 },
      ],
    },
  }

  const handleLineChange = (newLine: number) => {
    setSelectedLines({
      ...selectedLines,
      [activeMarket]: newLine,
    })
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>NBA</span>
          <span>›</span>
          <span>Player Props</span>
        </div>

        {/* Player Header */}
        <PlayerHeader player={playerData} />

        {/* Filters */}
        <Card className="p-4 bg-slate-800/30 border-slate-700/50">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-2">Range</label>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="bg-slate-900/50 border border-slate-700/50 rounded px-3 py-2 text-sm"
              >
                <option>L5</option>
                <option>L10</option>
                <option>Season</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-2">Opponent</label>
              <select
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                className="bg-slate-900/50 border border-slate-700/50 rounded px-3 py-2 text-sm"
              >
                <option value="any">vs Any</option>
                <option value="selected">vs Selected Team</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-2">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-slate-900/50 border border-slate-700/50 rounded px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="home">Home</option>
                <option value="away">Away</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <GameLogTable
            gameLog={playerData.logs}
            activeMarket={activeMarket}
            selectedLine={selectedLines[activeMarket as keyof typeof selectedLines]}
          />
          <DefenseSplitsTable
            defenseSplits={playerData.defenseSplits}
            activeMarket={activeMarket}
            selectedLine={selectedLines[activeMarket as keyof typeof selectedLines]}
          />
        </div>

        {/* Best Lines Strip */}
        <BestLinesStrip markets={markets} activeMarket={activeMarket} onMarketChange={setActiveMarket} />

        {/* Alt Lines Grid */}
        <AltLinesGrid market={markets[activeMarket as keyof typeof markets]} onLineSelect={handleLineChange} />
      </div>
    </PageContainer>
  )
}
