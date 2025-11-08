import { Card } from "@/components/ui/card"

export function CurrentLinesRow() {
  const lines = [
    { label: "Points", value: 28.5, price: "+109" },
    { label: "Rebounds", value: 5.5, price: "+110" },
    { label: "Assists", value: 6.5, price: "+110" },
    { label: "3-Pointers", value: 3.5, price: "+120" },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Current Lines</h2>
      <div className="grid md:grid-cols-4 gap-4">
        {lines.map((line) => (
          <Card key={line.label} className="p-4 bg-slate-800/30 border-slate-700/50">
            <div className="text-xs text-slate-400 mb-2">{line.label}</div>
            <div className="text-2xl font-bold text-emerald-400 mb-2">{line.value}</div>
            <div className="text-sm text-slate-400">{line.price}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
