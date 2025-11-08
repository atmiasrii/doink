"use client"

import { PageContainer } from "@/components/layout/page-container"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function NBAPage() {
  const games = [
    { id: 1, time: "4:30am", team1: "76ers", team2: "Wizards", spread: "PHI -5", ou: "OU 239" },
    { id: 2, time: "5:00am", team1: "Charlotte", team2: "Miami", spread: "CHA +5.5", ou: "OU 240.5" },
    { id: 3, time: "5:30am", team1: "Sacramento", team2: "Oklahoma", spread: "SAC +9.5", ou: "OU 226.5" },
    { id: 4, time: "8:30am", team1: "New York", team2: "Milwaukee", spread: "NYK -2.5", ou: "OU 229.5" },
    { id: 5, time: "8:30am", team1: "Los Angeles", team2: "Golden State", spread: "LAC -2", ou: "OU 224.5" },
  ]

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">NBA</h1>
          <p className="text-slate-400">Select a game to view detailed research</p>
        </div>

        <div className="grid gap-4">
          {games.map((game) => (
            <Link key={game.id} href={`/nba/games/${game.id}`}>
              <Card className="p-4 hover:bg-slate-800/50 cursor-pointer transition-colors border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">{game.time}</div>
                    <div className="font-semibold">
                      {game.team1} vs {game.team2}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-emerald-400">{game.spread}</div>
                    <div className="text-sm text-slate-400">{game.ou}</div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
