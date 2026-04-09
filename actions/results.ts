'use server'

import { createClient } from '@/lib/supabase/server'
import { calculatePickResult, calculatePreBetResult } from '@/lib/scoring'
import { revalidatePath } from 'next/cache'

export async function saveMatchupResult(
  matchupId: string,
  winnerId: string,
  scoreTeam1: number,
  scoreTeam2: number
) {
  const supabase = await createClient()

  // 1. Write the result, mark completed
  const { data: matchup, error } = await supabase
    .from('matchups')
    .update({
      actual_winner_id: winnerId,
      actual_score_team1: scoreTeam1,
      actual_score_team2: scoreTeam2,
      status: 'completed',
    })
    .eq('id', matchupId)
    .select()
    .single()

  if (error || !matchup) throw new Error(error?.message ?? 'Matchup not found')

  // Fetch the season
  const { data: season } = await supabase
    .from('seasons')
    .select('*')
    .eq('id', matchup.season_id)
    .single()

  if (!season) throw new Error('Season not found')

  // 2. Recalculate all picks for this matchup
  const { data: picks } = await supabase
    .from('picks')
    .select('*')
    .eq('matchup_id', matchupId)

  if (picks?.length) {
    const updates = picks.map(pick => ({
      ...pick,
      ...calculatePickResult(pick, matchup, season),
    }))
    await supabase.from('picks').upsert(updates)
  }

  // 3. Recalculate pre_bets if round 3 or 4
  if (matchup.round >= 3) {
    const { data: preBets } = await supabase
      .from('pre_bets')
      .select('*')
      .eq('season_id', matchup.season_id)

    if (preBets?.length) {
      const updates = preBets.map(pb => ({
        ...pb,
        ...calculatePreBetResult(pb, matchup, season),
      }))
      await supabase.from('pre_bets').upsert(updates)
    }
  }

  revalidatePath('/leaderboard')
  revalidatePath('/my-picks')
  revalidatePath('/bracket')
  revalidatePath('/admin/results')
}
