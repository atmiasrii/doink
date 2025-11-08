import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PlayerHeader({ player }: any) {
  return (
    <Card className="p-6 bg-slate-800/30 border-slate-700/50">
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-lg bg-slate-700 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{player.name}</h1>
            <Badge variant="outline" className="bg-slate-800/50">
              Expected
            </Badge>
          </div>
          <div className="flex gap-4 text-sm text-slate-400">
            <span>{player.pos}</span>
            <span>•</span>
            <span>{player.team}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
