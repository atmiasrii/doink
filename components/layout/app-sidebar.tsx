"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Menu,
  X,
  BarChart3,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  ChevronDown,
} from "lucide-react"
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
import { cn } from "@/lib/utils"

type SidebarGame = {
  id: number
  dateLabel: string
  status: "upcoming" | "final" | "live"
  isLive?: boolean
  topTeam: { name: string; code: string; isHome?: boolean }
  bottomTeam: { name: string; code: string; isHome?: boolean }
  marketPrimary: string
  marketSecondary: string
}

const initialGames: SidebarGame[] = [
  {
    id: 1,
    dateLabel: "Thu 5:30am",
    status: "upcoming",
    topTeam: { name: "Orlando Magic", code: "ORL", isHome: false },
    bottomTeam: { name: "New York Knicks", code: "NYK", isHome: true },
    marketPrimary: "ORL -2.5",
    marketSecondary: "o219.5",
  },
  {
    id: 2,
    dateLabel: "Thu 5:30am",
    status: "upcoming",
    topTeam: { name: "Chicago Bulls", code: "CHI", isHome: false },
    bottomTeam: { name: "Detroit Pistons", code: "DET", isHome: true },
    marketPrimary: "CHI -4.5",
    marketSecondary: "o217.0",
  },
  {
    id: 3,
    dateLabel: "Thu 5:30am",
    status: "upcoming",
    topTeam: { name: "Milwaukee Bucks", code: "MIL", isHome: false },
    bottomTeam: { name: "Charlotte Hornets", code: "CHA", isHome: true },
    marketPrimary: "MIL -7.0",
    marketSecondary: "o221.5",
  },
  {
    id: 4,
    dateLabel: "Thu 6:00am",
    status: "live",
    isLive: true,
    topTeam: { name: "Cleveland Cavaliers", code: "CLE", isHome: false },
    bottomTeam: { name: "Miami Heat", code: "MIA", isHome: true },
    marketPrimary: "MIA -1.5",
    marketSecondary: "o215.5",
  },
  {
    id: 5,
    dateLabel: "Thu 6:30am",
    status: "upcoming",
    topTeam: { name: "Memphis Grizzlies", code: "MEM", isHome: false },
    bottomTeam: { name: "Boston Celtics", code: "BOS", isHome: true },
    marketPrimary: "BOS -6.5",
    marketSecondary: "o223.5",
  },
  {
    id: 6,
    dateLabel: "Thu 6:30am",
    status: "upcoming",
    topTeam: { name: "Portland Trail Blazers", code: "POR", isHome: false },
    bottomTeam: { name: "New Orleans Pelicans", code: "NOP", isHome: true },
    marketPrimary: "NOP -5.0",
    marketSecondary: "o221.0",
  },
  {
    id: 7,
    dateLabel: "Thu 6:30am",
    status: "upcoming",
    topTeam: { name: "Golden State Warriors", code: "GSW", isHome: false },
    bottomTeam: { name: "San Antonio Spurs", code: "SAS", isHome: true },
    marketPrimary: "GSW -4.5",
    marketSecondary: "o225.5",
  },
  {
    id: 8,
    dateLabel: "Thu 6:30am",
    status: "final",
    topTeam: { name: "Washington Wizards", code: "WAS", isHome: false },
    bottomTeam: { name: "Houston Rockets", code: "HOU", isHome: true },
    marketPrimary: "HOU -3.5",
    marketSecondary: "o216.0",
  },
]

const filters = ["All", "Upcoming", "Final"] as const

const tools = [
  { href: "/hit-rater", label: "Hit Rater", icon: BarChart3 },
  { href: "/trending-insights", label: "Trending Insights", icon: TrendingUp },
  { href: "/my-bets", label: "My Bets", icon: Settings },
]

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [games, setGames] = useState(initialGames)
  const [activeTool, setActiveTool] = useState(tools[0].href)
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Upcoming")
  const [activeGameId, setActiveGameId] = useState<number | null>(initialGames[0]?.id ?? null)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [newTeam1, setNewTeam1] = useState("")
  const [newTeam2, setNewTeam2] = useState("")
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null)

  useEffect(() => {
    const syncCollapsed = () => {
      if (typeof window === "undefined") return
      setCollapsed((prev) => {
        const shouldCollapse = window.innerWidth < 1024
        if (shouldCollapse) {
          return true
        }
        return prev && !shouldCollapse ? false : prev
      })
    }

    syncCollapsed()
    window.addEventListener("resize", syncCollapsed)
    return () => window.removeEventListener("resize", syncCollapsed)
  }, [])

  const filteredGames = useMemo(() => {
    if (activeFilter === "All") return games
    if (activeFilter === "Upcoming") return games.filter((game) => game.status === "upcoming" || game.status === "live")
    return games.filter((game) => game.status === "final")
  }, [activeFilter, games])

  const handleAddGame = () => {
    if (!newTeam1.trim() || !newTeam2.trim()) return

    const team1Code = newTeam1.trim().toUpperCase().slice(0, 3)
    const team2Code = newTeam2.trim().toUpperCase().slice(0, 3)

    const newGame: SidebarGame = {
      id: Math.max(...games.map((g) => g.id), 0) + 1,
      dateLabel: "Today",
      status: "upcoming",
      topTeam: { name: team1Code, code: team1Code, isHome: false },
      bottomTeam: { name: team2Code, code: team2Code, isHome: true },
      marketPrimary: `${team1Code} -0.0`,
      marketSecondary: "o000.0",
    }

    setGames((prev) => [...prev, newGame])
    setNewTeam1("")
    setNewTeam2("")
    setAddDialogOpen(false)
  }

  const handleRemoveGame = () => {
    if (selectedGameId === null) return
    setGames((prev) => prev.filter((game) => game.id !== selectedGameId))
    if (activeGameId === selectedGameId) {
      setActiveGameId(null)
    }
    setSelectedGameId(null)
    setRemoveDialogOpen(false)
  }

  const sidebarWidth = collapsed ? "w-[72px]" : "w-[272px]"

  return (
    <>
      <button
        type="button"
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-md bg-slate-900/90 text-slate-100 shadow-lg outline-none transition hover:bg-slate-800 md:hidden"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-slate-950/95 backdrop-blur-sm transition-transform duration-300 ease-out border-r border-slate-800/80",
          sidebarWidth,
          collapsed ? "px-0" : "px-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex h-12 items-center border-b border-slate-800/80 px-3">
            <Link href="/" className="flex items-center gap-2 text-slate-50">
              <span className="text-lg font-black tracking-tight">{collapsed ? "D" : "DOINK"}</span>
              {!collapsed && <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">Sports</span>}
            </Link>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className={cn("space-y-4 px-3 py-2", collapsed && "px-2")}> 
              <button
                type="button"
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-md border border-slate-800 bg-slate-900/80 px-3 text-sm font-medium text-slate-100 transition-colors",
                  "hover:bg-slate-800/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500",
                  collapsed && "flex-col gap-1 px-2 py-2 text-xs"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-base">🏀</span>
                  {!collapsed && <span className="font-semibold">NBA</span>}
                </span>
                {!collapsed && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    Regular Season
                    <ChevronDown className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>

              <div>
                <div className={cn("px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500")}>NBA Tools</div>
                <div className="mt-2 space-y-2">
                  {tools.map(({ href, label, icon: Icon }) => {
                    const isActive = activeTool === href
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setActiveTool(href)}
                        className={cn(
                          "group relative flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                          "hover:bg-slate-800/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500",
                          isActive ? "bg-slate-900/80 text-slate-50" : "text-slate-200/90",
                          collapsed && "justify-center px-0"
                        )}
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900/80">
                          <Icon className="h-4 w-4" />
                        </div>
                        {!collapsed && (
                          <span className={cn("truncate", isActive ? "font-semibold" : "font-medium")}>{label}</span>
                        )}
                        {isActive && !collapsed && (
                          <span className="absolute left-0 top-1 h-7 w-[3px] rounded-r-full bg-amber-400" aria-hidden="true" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex h-9 w-full items-center gap-3 rounded-md border border-emerald-600/50 bg-emerald-900/20 px-3 text-sm font-semibold text-emerald-300 transition-colors",
                        "hover:border-emerald-500 hover:text-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      {!collapsed && <span>Add Game</span>}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border border-slate-800">
                    <DialogHeader>
                      <DialogTitle className="text-slate-50">Add Game</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Provide three-letter team codes to stage a matchup.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="sidebar-team1" className="text-slate-100 text-sm">
                          Team 1
                        </Label>
                        <Input
                          id="sidebar-team1"
                          maxLength={3}
                          value={newTeam1}
                          onChange={(event) => setNewTeam1(event.target.value)}
                          placeholder="ORL"
                          className="bg-slate-800/80 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sidebar-team2" className="text-slate-100 text-sm">
                          Team 2
                        </Label>
                        <Input
                          id="sidebar-team2"
                          maxLength={3}
                          value={newTeam2}
                          onChange={(event) => setNewTeam2(event.target.value)}
                          placeholder="NYK"
                          className="bg-slate-800/80 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                    <DialogFooter className="gap-2">
                      <button
                        type="button"
                        className="flex h-9 items-center justify-center rounded-md border border-slate-700 px-4 text-sm font-medium text-slate-200 transition hover:bg-slate-800/70"
                        onClick={() => setAddDialogOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="flex h-9 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-slate-50 transition hover:bg-emerald-500"
                        onClick={handleAddGame}
                      >
                        Add Game
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex h-9 w-full items-center gap-3 rounded-md border border-red-600/40 bg-red-900/20 px-3 text-sm font-semibold text-red-300 transition-colors",
                        "hover:border-red-500 hover:text-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                      {!collapsed && <span>Remove Game</span>}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border border-slate-800">
                    <DialogHeader>
                      <DialogTitle className="text-slate-50">Remove Game</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Choose a matchup to delete from the board.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid max-h-[320px] gap-2 overflow-y-auto pr-1">
                      {games.map((game) => (
                        <button
                          type="button"
                          key={game.id}
                          onClick={() => setSelectedGameId(game.id)}
                          className={cn(
                            "flex flex-col items-start gap-1 rounded-md border px-3 py-2 text-left text-sm transition",
                            selectedGameId === game.id
                              ? "border-red-500 bg-red-900/30 text-red-100"
                              : "border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800"
                          )}
                        >
                          <span className="text-xs text-slate-400">{game.dateLabel}</span>
                          <span className="font-semibold text-slate-100">
                            {game.topTeam.code} @ {game.bottomTeam.code}
                          </span>
                        </button>
                      ))}
                    </div>
                    <DialogFooter className="gap-2">
                      <button
                        type="button"
                        className="flex h-9 items-center justify-center rounded-md border border-slate-700 px-4 text-sm font-medium text-slate-200 transition hover:bg-slate-800/70"
                        onClick={() => {
                          setRemoveDialogOpen(false)
                          setSelectedGameId(null)
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="flex h-9 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-slate-50 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={selectedGameId === null}
                        onClick={handleRemoveGame}
                      >
                        Remove Game
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div>
                <div className={cn("px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500")}>Filters</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {filters.map((filter) => {
                    const isActive = activeFilter === filter
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                          "flex h-7 min-w-[72px] items-center justify-center rounded-full border px-3 text-xs font-semibold uppercase tracking-wide transition",
                          isActive
                            ? "border-slate-600 bg-slate-800 text-slate-100"
                            : "border-transparent bg-slate-900/60 text-slate-400 hover:bg-slate-800/60",
                          collapsed && "min-w-0 px-0 text-[10px]"
                        )}
                      >
                        {collapsed ? filter.charAt(0) : filter}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Upcoming Games
              </div>
              <div className={cn("sidebar-scroll flex-1 overflow-y-auto px-3 pb-6", collapsed && "px-2")}
              >
                {filteredGames.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center text-xs text-slate-500">
                    No games available.
                  </div>
                ) : collapsed ? (
                  <div className="flex flex-col gap-3 pb-10">
                    {filteredGames.map((game) => {
                      const slug = `${game.topTeam.code.toLowerCase()}-vs-${game.bottomTeam.code.toLowerCase()}`
                      return (
                        <Link
                          key={game.id}
                          href={`/nba/games/${slug}`}
                          className="group flex flex-col items-center gap-2 rounded-md border border-slate-800/70 bg-slate-900/80 p-2 transition hover:border-emerald-500/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
                          onFocus={() => setActiveGameId(game.id)}
                          onClick={() => setActiveGameId(game.id)}
                        >
                          <div className="flex items-center gap-1">
                            <TeamLogoPlaceholder abbreviation={game.topTeam.code} size="sidebar" />
                            <TeamLogoPlaceholder abbreviation={game.bottomTeam.code} size="sidebar" />
                          </div>
                          <span className="text-[10px] text-slate-400">{game.dateLabel}</span>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pb-10">
                    {filteredGames.map((game) => {
                      const isActive = activeGameId === game.id
                      const slug = `${game.topTeam.code.toLowerCase()}-vs-${game.bottomTeam.code.toLowerCase()}`
                      const isFinal = game.status === "final"

                      const [primaryLabelRaw, ...primaryValueParts] = game.marketPrimary.split(" ")
                      const hasAlphaLabel = /[a-zA-Z]/.test(primaryLabelRaw)
                      const primaryLabel = hasAlphaLabel ? primaryLabelRaw : game.topTeam.code
                      const primaryValue = primaryValueParts.join(" ") || (hasAlphaLabel ? "--" : game.marketPrimary || "--")

                      const trimmedSecondary = game.marketSecondary?.trim() || ""
                      let secondaryLabel = "OU"
                      let secondaryValue = trimmedSecondary

                      if (trimmedSecondary.length === 0) {
                        secondaryValue = "--"
                      } else if (/^[ou]/i.test(trimmedSecondary)) {
                        secondaryLabel = "OU"
                        secondaryValue = trimmedSecondary.slice(1) || "--"
                      } else if (/^ml/i.test(trimmedSecondary)) {
                        secondaryLabel = "ML"
                        secondaryValue = trimmedSecondary.slice(2).trim() || "--"
                      }

                      if (!secondaryValue.trim()) {
                        secondaryValue = "--"
                      }

                      return (
                        <Link
                          key={game.id}
                          href={`/nba/games/${slug}`}
                          className={cn(
                            "group block rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-3",
                            "transition-colors duration-150 hover:border-slate-700/70 hover:bg-slate-900/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500",
                            isActive && "border-blue-500/70 bg-slate-900/80 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]",
                            isFinal && "opacity-60 hover:border-transparent hover:bg-slate-900/60"
                          )}
                          onClick={() => setActiveGameId(game.id)}
                          onFocus={() => setActiveGameId(game.id)}
                        >
                          <div className="grid grid-cols-[64px,1fr,88px] items-center gap-3">
                            <div className="flex flex-col gap-1 text-xs leading-tight text-slate-400">
                              {game.isLive && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-red-400">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                  Live
                                </span>
                              )}
                              <span className="font-medium text-slate-400/90">
                                {game.dateLabel}
                              </span>
                            </div>

                            <div className="space-y-[6px]">
                              {[game.topTeam, game.bottomTeam].map((team) => (
                                <div key={team.code} className="flex items-center gap-2">
                                  <TeamLogoPlaceholder abbreviation={team.code} size="sidebar" />
                                  <div className="flex min-w-0 flex-1 flex-col">
                                    <span className="truncate text-sm font-semibold text-slate-100">
                                      {team.name}
                                    </span>
                                  </div>
                                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    {team.code}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-col items-end gap-1 text-right">
                              <div className="flex items-baseline gap-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                  {primaryLabel}
                                </span>
                                <span
                                  className={cn(
                                    "text-sm font-semibold tabular-nums",
                                    isActive ? "text-emerald-400" : "text-emerald-300 group-hover:text-emerald-200"
                                  )}
                                >
                                  {primaryValue}
                                </span>
                              </div>
                              <div className="flex items-baseline gap-2 text-xs uppercase tracking-wide text-slate-500">
                                <span>{secondaryLabel}</span>
                                <span className="tabular-nums text-slate-400 group-hover:text-sky-200">
                                  {secondaryValue}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/80 px-2 py-2">
            <button
              type="button"
              className="flex h-9 w-full items-center justify-center rounded-md text-slate-400 transition hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
