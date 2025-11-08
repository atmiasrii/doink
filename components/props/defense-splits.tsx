import { Card } from "@/components/ui/card"
import type { DefenseSplit } from "@/types"

export function DefenseSplits({ splits }: { splits: DefenseSplit[] }) {
  return (
    <Card className="p-6 bg-slate-800/30 border-slate-700/50 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Defense Splits</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="text-left py-3 px-2 text-slate-400 font-semibold">DEFENSE</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">AVG PTS</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">AVG REB</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">AVG AST</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">SAMPLE</th>
          </tr>
        </thead>
        <tbody>
          {splits.map((split, idx) => (
            <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-800/30">
              <td className="py-3 px-2">{split.label}</td>
              <td className="text-right py-3 px-2 font-semibold text-emerald-400">{split.avgPts.toFixed(1)}</td>
              <td className="text-right py-3 px-2">{split.avgReb.toFixed(1)}</td>
              <td className="text-right py-3 px-2">{split.avgAst.toFixed(1)}</td>
              <td className="text-right py-3 px-2 text-slate-400">{split.sample}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
