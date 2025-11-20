"use client"

import { useEffect, useMemo, useState } from "react"

interface TeamLogoPlaceholderProps {
  abbreviation: string
  size?: "sidebar" | "sm" | "md" | "lg" | "xl" | "xxl"
  variant?: "circle" | "plain"
}

const TEAM_CODE_ALIASES: Record<string, string> = {
  BRK: "BKN",
  BKN: "BKN",
  BRO: "BKN",
  CHO: "CHA",
  CHA: "CHA",
  PHO: "PHX",
  PHX: "PHX",
  GSW: "GSW",
  NOP: "NOP",
  SAN: "SAS",
  SAS: "SAS",
  NOR: "NOP",
  NYK: "NYK",
  NYC: "NYK",
  LAC: "LAC",
  LAL: "LAL",
}

export function TeamLogoPlaceholder({ abbreviation, size = "sm", variant = "circle" }: TeamLogoPlaceholderProps) {
  const sizeClasses: Record<NonNullable<TeamLogoPlaceholderProps["size"]>, string> = {
    sidebar: "w-5 h-5",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
    xxl: "w-16 h-16",
  }

  const [imageError, setImageError] = useState(false)

  const { logoCode, fallbackLetter } = useMemo(() => {
    const normalized = (abbreviation || "").trim().toUpperCase()
    if (!normalized) {
      return { logoCode: "", fallbackLetter: "" }
    }

    const mappedCode = TEAM_CODE_ALIASES[normalized] || normalized
    return { logoCode: mappedCode, fallbackLetter: normalized.charAt(0) }
  }, [abbreviation])

  useEffect(() => {
    setImageError(false)
  }, [logoCode])

  const logoSrc = logoCode ? `/data/logos/${logoCode}.png` : null

  const renderFallback = () => (
    <span className="text-[11px] font-semibold text-slate-300 leading-none">{fallbackLetter}</span>
  )

  const containerClasses =
    variant === "plain"
      ? `${sizeClasses[size]} flex items-center justify-center flex-shrink-0`
      : `${sizeClasses[size]} rounded-full border border-slate-600/70 flex items-center justify-center flex-shrink-0 overflow-hidden bg-slate-900/70`

  const imageClasses = variant === "plain" ? "w-full h-full object-contain" : "w-full h-full object-cover"

  return (
    <div className={containerClasses}>
      {logoSrc && !imageError ? (
        <img
          src={logoSrc}
          alt={`${logoCode} logo`}
          className={imageClasses}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        renderFallback()
      )}
    </div>
  )
}
