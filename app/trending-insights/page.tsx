"use client"

import { PageContainer } from "@/components/layout/page-container"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

export default function TrendingInsightsPage() {
  const insights = [
    {
      title: "Team A Overs Trending",
      description: "Team A has hit the over in 7 of last 10 games",
      tags: ["Overs", "Trending Up"],
      trend: "up",
    },
    {
      title: "Player 1 Assists Surge",
      description: "Averaging 7.2 assists in last 5 games vs 5.8 season avg",
      tags: ["Assists", "Player Props"],
      trend: "up",
    },
    {
      title: "Team B Defense Weakening",
      description: "Allowing 112.5 PPG in last 5 vs 108.2 season avg",
      tags: ["Defense", "Overs"],
      trend: "down",
    },
    {
      title: "Pace Increase Alert",
      description: "Pace of play up 3.2% in last 3 games",
      tags: ["Pace", "Overs"],
      trend: "up",
    },
    {
      title: "Player 2 Usage Rate",
      description: "Usage rate increased to 28% after recent trade",
      tags: ["Usage", "Player Props"],
      trend: "up",
    },
    {
      title: "Injury Impact Analysis",
      description: "Key defender out - expect higher scoring",
      tags: ["Injuries", "Overs"],
      trend: "up",
    },
  ]

  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Trending Insights</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {insights.map((insight, idx) => (
            <Card key={idx} className="p-6 bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{insight.title}</h3>
                <TrendingUp className={`w-5 h-5 ${insight.trend === "up" ? "text-emerald-400" : "text-rose-400"}`} />
              </div>
              <p className="text-sm text-slate-400 mb-4">{insight.description}</p>
              <div className="flex flex-wrap gap-2">
                {insight.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-slate-900/50 border-slate-700/50">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
