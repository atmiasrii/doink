"use client"

import { PageContainer } from "@/components/layout/page-container"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HitRaterPage() {
  const signals = [
    { label: "Pace Up", value: "+12%", trend: "up" },
    { label: "High Usage", value: "28%", trend: "up" },
    { label: "Weak Defense", value: "Rank 25", trend: "down" },
    { label: "Rest Days", value: "2 days", trend: "up" },
    { label: "Back-to-Back", value: "No", trend: "neutral" },
  ]

  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Hit Rater</h1>

        <Card className="p-6 bg-slate-800/30 border-slate-700/50">
          <p className="text-slate-400 mb-4">
            The Hit Rater analyzes player performance signals to predict prop line hits. Use these insights to identify
            high-probability bets.
          </p>
        </Card>

        <div>
          <h2 className="text-xl font-bold mb-4">Top Signals</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {signals.map((signal) => (
              <Card key={signal.label} className="p-4 bg-slate-800/30 border-slate-700/50">
                <div className="text-sm text-slate-400 mb-2">{signal.label}</div>
                <div className="text-2xl font-bold text-emerald-400 mb-3">{signal.value}</div>
                <Badge
                  variant="outline"
                  className={
                    signal.trend === "up"
                      ? "bg-emerald-900/30 text-emerald-300 border-emerald-700/50"
                      : signal.trend === "down"
                        ? "bg-rose-900/30 text-rose-300 border-rose-700/50"
                        : "bg-slate-800/50 text-slate-300 border-slate-700/50"
                  }
                >
                  {signal.trend === "up" ? "↑" : signal.trend === "down" ? "↓" : "→"} {signal.trend}
                </Badge>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-6 bg-slate-800/30 border-slate-700/50">
          <h2 className="text-lg font-bold mb-4">Recent Analysis</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <span>Player 1 vs Team B Defense</span>
              <Badge className="bg-emerald-900/30 text-emerald-300 border-emerald-700/50">72% Hit Rate</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <span>Player 2 Home Games</span>
              <Badge className="bg-emerald-900/30 text-emerald-300 border-emerald-700/50">68% Hit Rate</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <span>Player 3 After Rest</span>
              <Badge className="bg-rose-900/30 text-rose-300 border-rose-700/50">45% Hit Rate</Badge>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
