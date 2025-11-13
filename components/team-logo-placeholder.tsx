"use client"

interface TeamLogoPlaceholderProps {
  abbreviation: string
  size?: "sidebar" | "sm" | "md" | "lg"
}

export function TeamLogoPlaceholder({ abbreviation, size = "sm" }: TeamLogoPlaceholderProps) {
  const sizeClasses: Record<NonNullable<TeamLogoPlaceholderProps["size"]>, string> = {
    sidebar: "w-5 h-5",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  const fallbackLetter = (abbreviation || "").trim().charAt(0).toUpperCase()

  return (
    <div
      className={`${sizeClasses[size]} rounded-full border border-slate-600/70 flex items-center justify-center flex-shrink-0 bg-slate-800/60`}
    >
      <span className="text-[11px] font-semibold text-slate-300 leading-none">{fallbackLetter || ""}</span>
    </div>
  )
}
