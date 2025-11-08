"use client"

interface TeamLogoPlaceholderProps {
  abbreviation: string
  size?: "sm" | "md" | "lg"
}

export function TeamLogoPlaceholder({ abbreviation, size = "sm" }: TeamLogoPlaceholderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full border-2 border-slate-500/60 flex items-center justify-center flex-shrink-0 bg-slate-800/40`}
    >
      {/* Placeholder for team logo - will be replaced with actual SVG/image later */}
    </div>
  )
}
