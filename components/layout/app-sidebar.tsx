"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, BarChart3, TrendingUp, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TeamLogoPlaceholder } from "@/components/team-logo-placeholder"

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  const games = [
    { id: 1, time: "Mon 2:30am", team1: "PHI", team2: "WAS", spread: "PHI -5.5", ou: "o235.5" },
    { id: 2, time: "Mon 5:00am", team1: "CHA", team2: "MIA", spread: "CHA +5.5", ou: "o240.5" },
    { id: 3, time: "Mon 5:30am", team1: "SAC", team2: "OKC", spread: "SAC +9.5", ou: "o226.5" },
    { id: 4, time: "Mon 6:00am", team1: "LAL", team2: "GSW", spread: "LAL -3", ou: "o218.5" },
    { id: 5, time: "Mon 6:30am", team1: "BOS", team2: "MIL", spread: "BOS -7", ou: "o229" },
    { id: 6, time: "Mon 7:00am", team1: "DEN", team2: "PHX", spread: "DEN +2", ou: "o220.5" },
    { id: 7, time: "Mon 7:30am", team1: "DAL", team2: "LAC", spread: "DAL -4", ou: "o225" },
    { id: 8, time: "Mon 8:00am", team1: "NYK", team2: "ATL", spread: "NYK -6", ou: "o235" },
    { id: 9, time: "Mon 8:30am", team1: "TOR", team2: "BRK", spread: "TOR -8", ou: "o215" },
    { id: 10, time: "Mon 9:00am", team1: "HOU", team2: "MEM", spread: "HOU -5", ou: "o230.5" },
  ]

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 text-white hover:text-white md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      <aside
        className={`fixed left-0 top-0 h-screen bg-slate-900/95 border-r border-slate-700/50 transition-all duration-300 z-40 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${collapsed ? "w-20" : "w-64"}`}
      >
        <div className={`p-4 border-b border-slate-700/50 ${collapsed ? "text-center" : ""}`}>
          <div className={`font-bold text-emerald-400 ${collapsed ? "text-sm" : "text-xl"}`}>
            {collapsed ? "D" : "DOINK"}
          </div>
        </div>

        <nav className="p-2 space-y-1">
          <div className="pt-2">
            <div
              className={`text-xs font-semibold text-slate-400 px-3 py-2 uppercase ${collapsed ? "text-center" : ""}`}
            >
              {collapsed ? "SP" : "Sports"}
            </div>
            <Link href="/nba">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-sm text-white hover:text-white ${collapsed ? "justify-center" : ""}`}
              >
                <span
                  className={`${collapsed ? "w-6 h-6" : "w-5 h-5"} rounded bg-slate-700 flex items-center justify-center text-xs font-bold`}
                >
                  🏀
                </span>
                {!collapsed && "NBA"}
              </Button>
            </Link>
          </div>

          <div className={`pt-2 space-y-1 ${collapsed ? "text-center" : ""}`}>
            <Link href="/hit-rater">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-white hover:text-white ${collapsed ? "justify-center" : ""}`}
              >
                <BarChart3 className="w-5 h-5" />
                {!collapsed && <span>Hit Rater</span>}
              </Button>
            </Link>
            <Link href="/trending-insights">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-white hover:text-white ${collapsed ? "justify-center" : ""}`}
              >
                <TrendingUp className="w-5 h-5" />
                {!collapsed && <span>Trending Insights</span>}
              </Button>
            </Link>
            <Link href="/my-bets">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-white hover:text-white ${collapsed ? "justify-center" : ""}`}
              >
                <Settings className="w-5 h-5" />
                {!collapsed && <span>My Bets</span>}
              </Button>
            </Link>
          </div>
        </nav>

        {!collapsed && (
          <div className="border-t border-slate-700/50 p-4 mt-4">
            <div className="text-xs font-semibold text-slate-400 px-3 py-2 uppercase mb-3">Upcoming Games</div>
            <div className="space-y-1">
              {games.map((game) => (
                <Link key={game.id} href={`/nba/games/${game.id}`}>
                  <Card className="p-0 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 cursor-pointer transition-colors py-1.5 px-3 border-0 my-1 leading-5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-400 whitespace-nowrap">{game.time}</span>
                      <div className="flex items-center gap-1.5">
                        <TeamLogoPlaceholder abbreviation={game.team1} size="sm" />
                        <span className="text-white font-semibold">{game.team1}</span>
                      </div>
                      <span className="text-emerald-400 whitespace-nowrap">{game.spread}</span>
                      <div className="flex items-center gap-1.5">
                        <TeamLogoPlaceholder abbreviation={game.team2} size="sm" />
                        <span className="text-white font-semibold">{game.team2}</span>
                      </div>
                      <span className="text-slate-300 whitespace-nowrap">{game.ou}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-slate-700/50 p-2 mt-auto sticky bottom-0 bg-slate-900/95">
          <Button
            variant="ghost"
            size="icon"
            className="w-full text-slate-400 hover:text-white"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
