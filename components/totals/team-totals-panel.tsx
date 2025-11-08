import { Card } from "@/components/ui/card"
import type { Team } from "@/types"
import { TotalsTable } from "./totals-table"

export function TeamTotalsPanel({ team }: { team: Team }) {
  return (
    <Card className="p-6 bg-slate-800/30 border-slate-700/50">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-xs font-bold">
          {team.tricode[0]}
        </span>
        {team.name} Games Total Points
      </h2>
      <TotalsTable team={team} />
    </Card>
  )
}
