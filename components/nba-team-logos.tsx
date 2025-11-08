interface TeamLogoProps {
  team: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
}

export function NBATeamLogo({ team, size = "md" }: TeamLogoProps) {
  const logos: Record<string, string> = {
    ATL: "🦅",
    BOS: "🍀",
    BRK: "🖤",
    CHI: "🐂",
    CLE: "👑",
    DAL: "⭐",
    DEN: "🏔️",
    DET: "🏈",
    GSW: "⚡",
    HOU: "🚀",
    LAC: "🎪",
    LAL: "👑",
    MEM: "🐻",
    MIA: "🔥",
    MIL: "🦌",
    MIN: "👑",
    NOP: "🎭",
    NYK: "🗽",
    OKC: "⚡",
    ORL: "🪄",
    PHI: "🔔",
    PHX: "🌞",
    POR: "🪵",
    SAC: "👑",
    SAS: "🤠",
    TOR: "🦖",
    UTA: "⛰️",
    WAS: "🧛",
    CHO: "🐱",
    IND: "⚔️",
  }

  // Create actual SVG logos instead of emojis for professional look
  const getTeamLogoSVG = (abbr: string) => {
    const colors: Record<string, { primary: string; secondary: string }> = {
      ATL: { primary: "#E03C3C", secondary: "#C4D600" },
      BOS: { primary: "#007A33", secondary: "#BA9653" },
      BRK: { primary: "#000000", secondary: "#FFFFFF" },
      CHI: { primary: "#CE1141", secondary: "#000000" },
      CLE: { primary: "#6F2DA8", secondary: "#041E42" },
      DAL: { primary: "#002B81", secondary: "#FFFFFF" },
      DEN: { primary: "#0E2240", secondary: "#FEC52E" },
      DET: { primary: "#C8102E", secondary: "#1D42BA" },
      GSW: { primary: "#1D428A", secondary: "#FFC72C" },
      HOU: { primary: "#CE1141", secondary: "#000000" },
      LAC: { primary: "#C60C30", secondary: "#000000" },
      LAL: { primary: "#552583", secondary: "#FDB927" },
      MEM: { primary: "#12173F", secondary: "#6ABBBF" },
      MIA: { primary: "#98002E", secondary: "#F9A01B" },
      MIL: { primary: "#12173F", secondary: "#00471B" },
      MIN: { primary: "#0C2B76", secondary: "#2A8040" },
      NOP: { primary: "#0C2340", secondary: "#C4CED4" },
      NYK: { primary: "#0851BA", secondary: "#FF6B35" },
      OKC: { primary: "#007DC5", secondary: "#EF3B36" },
      ORL: { primary: "#0077B6", secondary: "#000000" },
      PHI: { primary: "#1D76EF", secondary: "#ED174C" },
      PHX: { primary: "#1D1160", secondary: "#E56828" },
      POR: { primary: "#E03C3C", secondary: "#000000" },
      SAC: { primary: "#5A2D81", secondary: "#63727A" },
      SAS: { primary: "#C4CED4", secondary: "#000000" },
      TOR: { primary: "#CE1141", secondary: "#000000" },
      UTA: { primary: "#002B5C", secondary: "#00471B" },
      WAS: { primary: "#002B5C", secondary: "#E31937" },
    }

    const color = colors[abbr] || { primary: "#666666", secondary: "#FFFFFF" }

    return (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={sizeMap[size]}>
        <circle cx="50" cy="50" r="48" fill={color.primary} />
        <circle cx="50" cy="50" r="40" fill={color.secondary} opacity="0.2" />
        <text x="50" y="60" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" fontFamily="Arial">
          {abbr[0]}
        </text>
      </svg>
    )
  }

  return <div className="inline-flex items-center justify-center">{getTeamLogoSVG(team)}</div>
}
