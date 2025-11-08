"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageContainer } from "@/components/layout/page-container"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { MoreVertical, Plus } from "lucide-react"

function createSlug(homeTricode: string, awayTricode: string) {
  const home = homeTricode.toLowerCase()
  const away = awayTricode.toLowerCase()
  return `${home}-vs-${away}`
}

interface Game {
  id: string
  time: string
  homeTeam: string
  awayTeam: string
  spread: string
  ou: string
  slug: string
}

export default function NBAPage() {
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([
    {
      id: "1",
      time: "4:30am",
      homeTeam: "PHI",
      awayTeam: "WAS",
      spread: "PHI -5",
      ou: "OU 239",
      slug: createSlug("PHI", "WAS"),
    },
    {
      id: "2",
      time: "5:00am",
      homeTeam: "CHA",
      awayTeam: "MIA",
      spread: "CHA +5.5",
      ou: "OU 240.5",
      slug: createSlug("CHA", "MIA"),
    },
    {
      id: "3",
      time: "5:30am",
      homeTeam: "SAC",
      awayTeam: "OKC",
      spread: "SAC +9.5",
      ou: "OU 226.5",
      slug: createSlug("SAC", "OKC"),
    },
    {
      id: "4",
      time: "8:30am",
      homeTeam: "NYK",
      awayTeam: "MIL",
      spread: "NYK -2.5",
      ou: "OU 229.5",
      slug: createSlug("NYK", "MIL"),
    },
    {
      id: "5",
      time: "8:30am",
      homeTeam: "LAC",
      awayTeam: "GSW",
      spread: "LAC -2",
      ou: "OU 224.5",
      slug: createSlug("LAC", "GSW"),
    },
  ])

  const [openDialog, setOpenDialog] = useState(false)
  const [homeInput, setHomeInput] = useState("")
  const [awayInput, setAwayInput] = useState("")

  const handleAddGame = () => {
    if (!homeInput || !awayInput) return

    const slug = createSlug(homeInput, awayInput)

    const newGame: Game = {
      id: `game-${Date.now()}`,
      time: "TBD",
      homeTeam: homeInput.toUpperCase(),
      awayTeam: awayInput.toUpperCase(),
      spread: "TBD",
      ou: "TBD",
      slug,
    }

    setGames((prev) => [...prev, newGame])
    setOpenDialog(false)
    setHomeInput("")
    setAwayInput("")

    // Navigate to the new game page
    router.push(`/nba/games/${slug}`)
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">NBA</h1>
          <p className="text-slate-400">Select a game to view detailed research</p>
        </div>

        <div className="grid gap-4">
          {games.map((game) => (
            <div key={game.id} className="flex gap-2">
              <Link href={`/nba/games/${game.slug}`} className="flex-1">
                <Card className="p-4 hover:bg-slate-800/50 cursor-pointer transition-colors border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-400">{game.time}</div>
                      <div className="font-semibold text-white">
                        {game.homeTeam} @ {game.awayTeam}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-emerald-400">{game.spread}</div>
                      <div className="text-sm text-slate-400">{game.ou}</div>
                    </div>
                  </div>
                </Card>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  // Settings action
                }}
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6"
          onClick={() => setOpenDialog(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Game
        </Button>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="bg-[#101014] border border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Add New Game</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="home" className="text-white">
                  Home Team (3 letters)
                </Label>
                <Input
                  id="home"
                  placeholder="e.g., LAL"
                  value={homeInput}
                  onChange={(e) => setHomeInput(e.target.value.toUpperCase().slice(0, 3))}
                  className="bg-[#1a1b1f] border-slate-700 text-white"
                  maxLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="away" className="text-white">
                  Away Team (3 letters)
                </Label>
                <Input
                  id="away"
                  placeholder="e.g., GSW"
                  value={awayInput}
                  onChange={(e) => setAwayInput(e.target.value.toUpperCase().slice(0, 3))}
                  className="bg-[#1a1b1f] border-slate-700 text-white"
                  maxLength={3}
                />
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleAddGame}
                disabled={!homeInput || !awayInput}
              >
                Add Game
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  )
}
