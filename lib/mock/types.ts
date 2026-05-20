export type Player = {
  id: string
  name: string
  pos: string
  team: string
  num: number
  age: number
  proj: number
  actual: number
  rank: number
  prev: number
  ros: number
  own: number
  trend: "up" | "down" | "flat"
  risk: "low" | "med" | "high"
  adp: number
  round: number
  matchup: string
  matchupRating: number
  traj: number[]
  notes: string
  boom: number
  bust: number
  snap: number
  tgt: number
  rush: number
  news: string
  ceiling: number
  floor: number
}

export type GameLogWeek = {
  wk: number
  opp?: string
  home?: boolean
  indoor?: boolean
  kickoff?: string
  day?: string
  weather?: string
  holiday?: string | null
  proj: number
  actual: number | null
  ceiling: number
  floor: number
  played?: boolean
  bye: boolean
}
