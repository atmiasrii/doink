"use client"

import { PageContainer } from "@/components/layout/page-container"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export default function MyBetsPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Bets</h1>

        <Card className="p-12 bg-slate-800/30 border-slate-700/50 text-center">
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Sportsbooks</h2>
          <p className="text-slate-400 mb-6">
            Link your sportsbook accounts to track your bets and see your performance metrics.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">Connect Sportsbooks</Button>
        </Card>

        <Card className="p-6 bg-slate-800/30 border-slate-700/50">
          <h2 className="text-lg font-bold mb-4">Saved Bets</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded border border-slate-700/30">
              <div>
                <div className="font-semibold">Team A -5 vs Team B</div>
                <div className="text-sm text-slate-400">Spread • $100</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-emerald-400">+110</div>
                <div className="text-sm text-slate-400">Pending</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded border border-slate-700/30">
              <div>
                <div className="font-semibold">Player 1 Over 28.5 Points</div>
                <div className="text-sm text-slate-400">Player Props • $50</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-emerald-400">-110</div>
                <div className="text-sm text-slate-400">Pending</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
