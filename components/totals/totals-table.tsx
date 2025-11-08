import type { Team } from "@/types"
import { getHeatmapBgClass } from "@/components/common/heatmap-utils"

export function TotalsTable({ team }: { team: Team }) {
  // Mock data for team totals
  const totalsData = [
    {
      date: "4/2/25",
      opp: "NYK",
      wl: "L",
      ouLine: 105,
      points: 196,
      q1: 45,
      q2: 61,
      q3: 40,
      q4: 50,
    },
    {
      date: "4/4/25",
      opp: "MIL",
      wl: "L",
      ouLine: 126,
      points: 239,
      q1: 66,
      q2: 56,
      q3: 63,
      q4: 54,
    },
    {
      date: "4/6/25",
      opp: "MIN",
      wl: "L",
      ouLine: 114,
      points: 223,
      q1: 50,
      q2: 56,
      q3: 59,
      q4: 58,
    },
    {
      date: "4/8/25",
      opp: "MIA",
      wl: "L",
      ouLine: 117,
      points: 222,
      q1: 57,
      q2: 57,
      q3: 57,
      q4: 51,
    },
    {
      date: "4/10/25",
      opp: "WAS",
      wl: "W",
      ouLine: 122,
      points: 225,
      q1: 48,
      q2: 55,
      q3: 65,
      q4: 57,
    },
  ]

  const maxQ = Math.max(...totalsData.flatMap((d) => [d.q1, d.q2, d.q3, d.q4]))

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="text-left py-3 px-2 text-slate-400 font-semibold">DATE</th>
            <th className="text-left py-3 px-2 text-slate-400 font-semibold">OPP</th>
            <th className="text-center py-3 px-2 text-slate-400 font-semibold">W/L</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">O/U LINE</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">POINTS</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">Q1</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">Q2</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">Q3</th>
            <th className="text-right py-3 px-2 text-slate-400 font-semibold">Q4</th>
          </tr>
        </thead>
        <tbody>
          {totalsData.map((row, idx) => (
            <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-800/30">
              <td className="py-3 px-2 text-slate-400">{row.date}</td>
              <td className="py-3 px-2">{row.opp}</td>
              <td className="py-3 px-2 text-center">
                <span className={row.wl === "W" ? "text-emerald-400" : "text-rose-400"}>{row.wl}</span>
              </td>
              <td className="text-right py-3 px-2">{row.ouLine}</td>
              <td className="text-right py-3 px-2 font-semibold">{row.points}</td>
              <td className={`text-right py-3 px-2 font-semibold ${getHeatmapBgClass(row.q1, maxQ)}`}>{row.q1}</td>
              <td className={`text-right py-3 px-2 font-semibold ${getHeatmapBgClass(row.q2, maxQ)}`}>{row.q2}</td>
              <td className={`text-right py-3 px-2 font-semibold ${getHeatmapBgClass(row.q3, maxQ)}`}>{row.q3}</td>
              <td className={`text-right py-3 px-2 font-semibold ${getHeatmapBgClass(row.q4, maxQ)}`}>{row.q4}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Row */}
      <div className="mt-4 p-4 bg-slate-900/50 rounded border border-slate-700/50">
        <div className="grid grid-cols-5 gap-4 text-sm">
          <div>
            <div className="text-slate-400 text-xs">AVG POINTS</div>
            <div className="font-bold text-emerald-400">
              {(totalsData.reduce((sum, d) => sum + d.points, 0) / totalsData.length).toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs">AVG Q1</div>
            <div className="font-bold">
              {(totalsData.reduce((sum, d) => sum + d.q1, 0) / totalsData.length).toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs">AVG Q2</div>
            <div className="font-bold">
              {(totalsData.reduce((sum, d) => sum + d.q2, 0) / totalsData.length).toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs">AVG Q3</div>
            <div className="font-bold">
              {(totalsData.reduce((sum, d) => sum + d.q3, 0) / totalsData.length).toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs">AVG Q4</div>
            <div className="font-bold">
              {(totalsData.reduce((sum, d) => sum + d.q4, 0) / totalsData.length).toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
