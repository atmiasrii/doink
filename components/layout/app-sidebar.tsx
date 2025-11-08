"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, BarChart3, TrendingUp, Settings, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TeamLogoPlaceholder } from "@/components/team-logo-placeholder"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  const [games, setGames] = useState([
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
  ])

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [newTeam1, setNewTeam1] = useState("")
  const [newTeam2, setNewTeam2] = useState("")
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null)

  const handleAddGame = () => {
    if (newTeam1.trim() && newTeam2.trim()) {
      const newGame = {
        id: Math.max(...games.map((g) => g.id), 0) + 1,
        time: "Today",
        team1: newTeam1.trim().toUpperCase().slice(0, 3),
        team2: newTeam2.trim().toUpperCase().slice(0, 3),
        spread: "-",
        ou: "-",
      }
      setGames([...games, newGame])
      setNewTeam1("")
      setNewTeam2("")
      setAddDialogOpen(false)
    }
  }

  const handleRemoveGame = () => {
    if (selectedGameId !== null) {
      setGames(games.filter((g) => g.id !== selectedGameId))
      setSelectedGameId(null)
      setRemoveDialogOpen(false)
    }
  }

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
        className={`fixed left-0 top-0 h-screen bg-slate-900/95 border-r border-slate-700/50 transition-all duration-300 z-40 overflow-y-auto w-fit ${
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

            {!collapsed && (
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-emerald-400 hover:text-emerald-300"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Game</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add New Game</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Enter the 3-letter abbreviations for both teams
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="team1" className="text-white">
                        Team 1 (3 letters)
                      </Label>
                      <Input
                        id="team1"
                        placeholder="PHI"
                        maxLength={3}
                        value={newTeam1}
                        onChange={(e) => setNewTeam1(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="team2" className="text-white">
                        Team 2 (3 letters)
                      </Label>
                      <Input
                        id="team2"
                        placeholder="WAS"
                        maxLength={3}
                        value={newTeam2}
                        onChange={(e) => setNewTeam2(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddDialogOpen(false)}
                      className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddGame}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Add Game
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {!collapsed && (
              <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300">
                    <Trash2 className="w-5 h-5" />
                    <span>Remove Game</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Remove Game</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Select a game to remove from the list
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2 py-4 max-h-[400px] overflow-y-auto">
                    {games.map((game) => (
                      <Card
                        key={game.id}
                        className={`p-3 cursor-pointer transition-colors ${
                          selectedGameId === game.id
                            ? "bg-red-900/30 border-red-700"
                            : "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
                        }`}
                        onClick={() => setSelectedGameId(game.id)}
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-400">{game.time}</span>
                          <span className="text-white font-semibold">{game.team1}</span>
                          <span className="text-slate-500">vs</span>
                          <span className="text-white font-semibold">{game.team2}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRemoveDialogOpen(false)
                        setSelectedGameId(null)
                      }}
                      className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleRemoveGame}
                      disabled={selectedGameId === null}
                      className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                      Remove Game
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </nav>

        {!collapsed && (
          <div className="border-t border-slate-700/50 p-4 mt-4">
            <div className="text-xs font-semibold text-slate-400 px-3 py-2 uppercase mb-3">Upcoming Games</div>
            <div className="space-y-1">
              {games.map((game) => {
                const slug = `${game.team1.toLowerCase()}-vs-${game.team2.toLowerCase()}`
                return (
                  <Link key={game.id} href={`/nba/games/${slug}`}>
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
                )
              })}
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
