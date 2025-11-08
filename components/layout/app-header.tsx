"use client"

import { useState } from "react"
import { Search, BookOpen, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function AppHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <header className="sticky top-0 z-20 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 md:ml-64">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-emerald-400 transition-colors md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Centered search bar */}
        <div className="flex items-center gap-3 max-w-md mx-auto flex-1 justify-center">
          <Search className="w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search Doink Sports"
            className="bg-slate-800/50 border-slate-700/50 text-sm text-white placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2 text-white hover:text-white">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Books</span>
            <span className="bg-emerald-500 text-black text-xs font-bold px-2 py-0.5 rounded">20</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:text-white">
            Log in
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            Get started
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-white">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
