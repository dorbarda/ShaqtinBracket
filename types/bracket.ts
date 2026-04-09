export type BracketTeam = {
  id: string
  name: string
  abbreviation: string
  seed: number
  color: string
  logo_url?: string | null
}

export type BracketMatchup = {
  id: string
  round: 1 | 2 | 3 | 4
  conference: 'East' | 'West' | 'Finals'
  team1: BracketTeam
  team2: BracketTeam
  actual_winner_id: string | null
  actual_score_team1: number | null
  actual_score_team2: number | null
  status: 'upcoming' | 'betting_open' | 'locked' | 'completed'
  display_order: number
  userPick?: {
    picked_winner_id: string
    picked_winner_name: string
    picked_score_winner: number
    picked_score_loser: number
    is_winner_correct: boolean | null
    is_exact_correct: boolean | null
    points_earned: number
  }
}

export type BracketData = {
  east: Record<number, BracketMatchup[]>
  west: Record<number, BracketMatchup[]>
  finals: BracketMatchup | null
}
