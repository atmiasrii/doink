import { PageContainer } from "@/components/layout/page-container"

export default function Home() {
  const games = [
    { id: 1, time: "4:30am", team1: "Philadelphia", team2: "Washington", spread: "PHI -5", ou: "OU 239" },
    { id: 2, time: "5:00am", team1: "Charlotte", team2: "Miami", spread: "CHA +5.5", ou: "OU 240.5" },
    { id: 3, time: "5:30am", team1: "Sacramento", team2: "Oklahoma", spread: "SAC +9.5", ou: "OU 226.5" },
  ]

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Doink Sports</h1>
          <p className="text-slate-400">Select a game from the sidebar to view detailed research and player props</p>
        </div>

        <div className="grid gap-4 mt-8">
          <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">Getting Started</h2>
            <p className="text-slate-400">
              Choose an upcoming game from the sidebar, then explore player props, team stats, and advanced research
              tools.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
