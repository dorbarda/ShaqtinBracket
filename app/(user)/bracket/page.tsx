import { createClient } from '@/lib/supabase/server'
import { BracketViewer } from '@/components/bracket/BracketViewer'
import type { BracketData, BracketMatchup, BracketTeam } from '@/types/bracket'

export default async function BracketPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: matchups }, { data: teams }, { data: userPicks }] = await Promise.all([
    supabase.from('matchups').select('*').order('round').order('display_order'),
    supabase.from('teams').select('*'),
    user ? supabase.from('picks').select('*').eq('user_id', user.id) : Promise.resolve({ data: [] }),
  ])

  const teamMap = Object.fromEntries((teams ?? []).map(t => [t.id, t]))
  const picksByMatchup = Object.fromEntries((userPicks ?? []).map(p => [p.matchup_id, p]))

  const toBracketMatchup = (m: any): BracketMatchup => {
    const team1 = m.team1_id ? teamMap[m.team1_id] : null
    const team2 = m.team2_id ? teamMap[m.team2_id] : null
    const pick = picksByMatchup[m.id]
    return {
      id: m.id,
      round: m.round,
      conference: m.conference,
      team1: team1 ? {
        id: team1.id,
        name: team1.name,
        abbreviation: team1.abbreviation,
        seed: team1.seed,
        color: team1.color,
        logo_url: team1.logo_url,
      } : { id: m.team1_id ?? 'tbd1', name: m.team1_name, abbreviation: '?', seed: 0, color: '#888' },
      team2: team2 ? {
        id: team2.id,
        name: team2.name,
        abbreviation: team2.abbreviation,
        seed: team2.seed,
        color: team2.color,
        logo_url: team2.logo_url,
      } : { id: m.team2_id ?? 'tbd2', name: m.team2_name, abbreviation: '?', seed: 0, color: '#888' },
      actual_winner_id: m.actual_winner_id,
      actual_score_team1: m.actual_score_team1,
      actual_score_team2: m.actual_score_team2,
      status: m.status,
      display_order: m.display_order,
      userPick: pick ? {
        picked_winner_id: pick.picked_winner_id,
        picked_winner_name: pick.picked_winner_name,
        picked_score_winner: pick.picked_score_winner,
        picked_score_loser: pick.picked_score_loser,
        is_winner_correct: pick.is_winner_correct,
        is_exact_correct: pick.is_exact_correct,
        points_earned: pick.points_earned,
      } : undefined,
    }
  }

  const all = (matchups ?? []).map(toBracketMatchup)

  const bracketData: BracketData = {
    east: {
      1: all.filter(m => m.conference === 'East' && m.round === 1),
      2: all.filter(m => m.conference === 'East' && m.round === 2),
      3: all.filter(m => m.conference === 'East' && m.round === 3),
    },
    west: {
      1: all.filter(m => m.conference === 'West' && m.round === 1),
      2: all.filter(m => m.conference === 'West' && m.round === 2),
      3: all.filter(m => m.conference === 'West' && m.round === 3),
    },
    finals: all.find(m => m.conference === 'Finals' && m.round === 4) ?? null,
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">2026 NBA Playoff Bracket</h1>
        <p className="text-muted-foreground text-sm">Your picks are shown in blue badges.</p>
      </div>
      <BracketViewer data={bracketData} showUserPicks={!!user} />
    </div>
  )
}
