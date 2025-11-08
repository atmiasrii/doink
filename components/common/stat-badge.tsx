import { cn } from "@/lib/utils"

interface StatBadgeProps {
  value: number
  label?: string
  variant?: "positive" | "negative" | "neutral"
  className?: string
}

export function StatBadge({ value, label, variant = "neutral", className }: StatBadgeProps) {
  const variantClasses = {
    positive: "text-emerald-400",
    negative: "text-rose-400",
    neutral: "text-slate-300",
  }

  return (
    <div className={cn("text-sm", variantClasses[variant], className)}>
      {label && <div className="text-xs text-slate-400">{label}</div>}
      <div className="font-semibold">{value}</div>
    </div>
  )
}
