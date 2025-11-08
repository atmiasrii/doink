export type Sport = "nba" | "nfl" | "mlb" | "nhl"

export interface Team {
  id: string
  name: string
  tricode: string
  record: { wins: number; losses: number }
}

export interface OddsPrice {
  value: number
  price: number
}

export interface GameOdds {
  spread: { teamA: OddsPrice; teamB: OddsPrice }
  moneyline: { teamA: number; teamB: number }
  total: { over: OddsPrice; under: OddsPrice }
  teamTotals: { teamA: OddsPrice; teamB: OddsPrice }
}

export interface GameResult {
  date: string
  opp: string
  scoreFor: number
  scoreAgainst: number
  ouLine?: number
  ouResult?: "O" | "U" | "P"
  spreadResult?: "+" | "-" | "P"
}

export interface RecordWL {
  wins: number
  losses: number
  pushes?: number
}

export interface ATS {
  total: RecordWL
  home: RecordWL
  away: RecordWL
  favored: RecordWL
  underdog: RecordWL
}

export interface StatLine {
  pts: number
  reb: number
  ast: number
  threePm: number
  pra: number
}

export interface PropLines {
  pts: number
  reb: number
  ast: number
  threePm: number
}

export interface Player {
  id: string
  name: string
  pos: string
  gs: number
  statsAvg: StatLine
  currentLines?: Partial<PropLines>
}

export interface PlayerLogRow {
  date: string
  opp: string
  wl: "W" | "L"
  mins: number
  usgPct: number
  pts: number
  fg: string
  threePt: string
  reb: number
  ast: number
  stl: number
  blk: number
  to: number
}

export interface DefenseSplit {
  label: string
  avgPts: number
  avgReb: number
  avgAst: number
  sample: number
}

export interface Game {
  id: string
  sport: Sport
  date: string
  teamA: Team
  teamB: Team
  venue: { name: string; city?: string; overHitRatePct?: number; since?: number }
  odds: GameOdds
  last5: { teamA: GameResult[]; teamB: GameResult[] }
  ats: { teamA: ATS; teamB: ATS }
  lineups: { teamA: Player[]; teamB: Player[] }
}
