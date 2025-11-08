import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PlayerLogRow } from "@/types"

export function HitRateRow({ logs }: { logs: PlayerLogRow[] }) {
  const avgPts = (logs.reduce((sum, l) => sum + l.pts, 0) / logs.length).toFixed(1)
  const avgReb = (logs.reduce((sum, l) => sum + l.reb, 0) / logs.length).toFixed(1)
  const avgAst = (logs.reduce((sum, l) => sum + l.ast, 0) / logs.length).toFixed(1)

  const ptsHits = logs.filter((l) => l.pts >= 21).length
  const rebHits = logs.filter((l) => l.reb >= 5).length
  const astHits = logs.filter((l) => l.ast >= 4).length

  const ptsHitRate = ((ptsHits / logs.length) * 100).toFixed(0)
  const rebHitRate = ((rebHits / logs.length) * 100).toFixed(0)
  const astHitRate = ((astHits / logs.length) * 100).toFixed(0)

  return (
    <Card className="p-6 bg-slate-800/30 border-slate-700/50">
      <h2 className="text-xl font-bold mb-4">Summary & Hit Rate</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <div className="text-sm text-slate-400 mb-2">Points</div>
          <div className="text-3xl font-bold text-emerald-400 mb-3">{avgPts}</div>
          <Badge variant="outline" className="bg-emerald-900/30 text-emerald-300 border-emerald-700/50">
            {ptsHits}/{logs.length} ({ptsHitRate}%)
          </Badge>
        </div>
        <div>
          <div className="text-sm text-slate-400 mb-2">Rebounds</div>
          <div className="text-3xl font-bold text-emerald-400 mb-3">{avgReb}</div>
          <Badge variant="outline" className="bg-emerald-900/30 text-emerald-300 border-emerald-700/50">
            {rebHits}/{logs.length} ({rebHitRate}%)
          </Badge>
        </div>
        <div>
          <div className="text-sm text-slate-400 mb-2">Assists</div>
          <div className="text-3xl font-bold text-emerald-400 mb-3">{avgAst}</div>
          <Badge variant="outline" className="bg-emerald-900/30 text-emerald-300 border-emerald-700/50">
            {astHits}/{logs.length} ({astHitRate}%)
          </Badge>
        </div>
      </div>
    </Card>
  )
}
