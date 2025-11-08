"use client"

import { useState } from "react"
import { PageContainer } from "@/components/layout/page-container"
import { Card } from "@/components/ui/card"
import gameData from "@/data/game.json"
import { TeamTotalsPanel } from "@/components/totals/team-totals-panel"

export default function OverUnderPage() {
  const [range, setRange] = useState("L10")
  const [opponent, setOpponent] = useState("any")
  const [location, setLocation] = useState("all")

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>NBA</span>
          <span>›</span>
          <span>Over/Under</span>
        </div>

        <h1 className="text-3xl font-bold">Team Total Points</h1>

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

        {/* Team Totals Panels */}
        <div className="grid md:grid-cols-2 gap-6">
          <TeamTotalsPanel team={gameData.teamA} />
          <TeamTotalsPanel team={gameData.teamB} />
        </div>
      </div>
    </PageContainer>
  )
}
