import type React from "react"

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="md:ml-64 pt-16 min-h-screen bg-slate-950 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 text-white">{children}</div>
    </main>
  )
}
