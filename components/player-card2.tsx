"use client"

import type React from "react"

interface PlayerCard2Props {
  playerName?: string
}

export const PlayerCard2: React.FC<PlayerCard2Props> = ({ playerName = "Player Name" }) => {
  return (
    // Narrow vertical profile card (keeps the same min-height)
    <div className="w-full md:w-72 lg:w-80 bg-slate-900/60 border border-slate-800/50 rounded-lg p-3 shadow-[0_4px_12px_rgba(0,0,0,0.4)] min-h-[640px] flex flex-col">
      <div className="mb-4">
        <h2 className="text-base font-bold text-white text-center">{playerName}</h2>
      </div>
      {/* Central profile area — kept as a placeholder but centered for a vertical layout */}
      <div
        className="flex-1 rounded-lg border border-slate-800/40 bg-slate-950/10 flex items-center justify-center"
        aria-hidden="true"
      />
    </div>
  )
}
