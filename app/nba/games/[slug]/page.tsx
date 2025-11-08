"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { PageContainer } from "@/components/layout/page-container"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GameHeaderCard } from "@/components/game/game-header-card"
import { MatchupFactors } from "@/components/game/matchup-factors"
import { LineupTable } from "@/components/game/lineup-table"
import { PlayerPropsTab } from "@/components/game/player-props-tab"
import { BenchPropsTab } from "@/components/game/bench-props-tab"
import { TeamPropsTab } from "@/components/game/team-props-tab"
import gameData from "@/data/game.json"

export default function GamePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const params = useParams()
  const slug = params?.slug as string

  const { homeTeam, awayTeam } = useMemo(() => {
    if (!slug) return { homeTeam: "PHI", awayTeam: "WAS" }

    const parts = slug.split("-vs-")
    const team1 = parts[0]?.toUpperCase() || "PHI"
    const team2 = parts[1]?.toUpperCase() || "WAS"

    console.log("[v0] Slug:", slug)
    console.log("[v0] Extracted teams:", team1, "vs", team2)

    return { homeTeam: team1, awayTeam: team2 }
  }, [slug])

  const displayGameData = useMemo(() => {
    return {
      ...gameData,
      teamA: {
        ...gameData.teamA,
        code: homeTeam,
        tricode: homeTeam,
        name: homeTeam, // Use team code as name for now
      },
      teamB: {
        ...gameData.teamB,
        code: awayTeam,
        tricode: awayTeam,
        name: awayTeam, // Use team code as name for now
      },
    }
  }, [homeTeam, awayTeam])

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>NBA</span>
          <span>›</span>
          <span>
            {homeTeam} vs {awayTeam}
          </span>
        </div>

        {/* Game Title */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {homeTeam} vs {awayTeam}
          </h1>
          <p className="text-slate-400">TODAY 4:30AM</p>
        </div>

        {/* Odds Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <OddsCard label={`${homeTeam} SPREAD`} value="-5" price="+100" />
          <OddsCard label={`${awayTeam} SPREAD`} value="+5" price="-110" />
          <OddsCard label="OVER/UNDER" value="o239" price="-103" />
          <OddsCard label={`${homeTeam} ML`} value="-180" price="" />
          <OddsCard label={`${awayTeam} ML`} value="+179" price="" />
          <OddsCard label={`${homeTeam} POINTS`} value="o121.5" price="-110" />
          <OddsCard label={`${awayTeam} POINTS`} value="o117.5" price="-108" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800/50 border-b border-slate-700/50 w-full justify-start overflow-x-auto">
            <TabsTrigger className="text-card" value="overview">
              Game Overview
            </TabsTrigger>
            <TabsTrigger className="text-card" value="player-props">
              Player Props
            </TabsTrigger>
            <TabsTrigger className="text-card" value="bench-props">
              Bench Props
            </TabsTrigger>
            <TabsTrigger className="text-card" value="over-under">
              Over / Under
            </TabsTrigger>
            <TabsTrigger className="text-card" value="team-props">
              Team Props
            </TabsTrigger>
            <TabsTrigger className="text-card" value="sides">
              Sides
            </TabsTrigger>
            <TabsTrigger className="text-card" value="my-bets">
              My Bets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <GameHeaderCard game={displayGameData} />
            <MatchupFactors game={displayGameData} />
            <LineupTable game={displayGameData} />
          </TabsContent>

          <TabsContent value="player-props" className="mt-6">
            <PlayerPropsTab game={displayGameData} />
          </TabsContent>

          <TabsContent value="bench-props" className="mt-6">
            <BenchPropsTab game={displayGameData} />
          </TabsContent>

          <TabsContent value="over-under" className="mt-6">
            <Card className="p-6 bg-slate-800/30 border-slate-700/50">
              <p className="text-white">Over/Under view coming soon</p>
            </Card>
          </TabsContent>

          <TabsContent value="team-props" className="mt-6">
            <TeamPropsTab />
          </TabsContent>

          <TabsContent value="sides" className="mt-6">
            <Card className="p-6 bg-slate-800/30 border-slate-700/50">
              <p className="text-white">Sides view coming soon</p>
            </Card>
          </TabsContent>

          <TabsContent value="my-bets" className="mt-6">
            <Card className="p-6 bg-slate-800/30 border-slate-700/50">
              <p className="text-white">My Bets view coming soon</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  )
}

function OddsCard({ label, value, price }: { label: string; value: string; price?: string }) {
  return (
    <Card className="p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl hover:bg-slate-900/80 transition-colors">
      <div className="text-xs font-semibold text-white mb-2 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {price && <div className="text-xs text-slate-300 mt-2">{price}</div>}
    </Card>
  )
}
