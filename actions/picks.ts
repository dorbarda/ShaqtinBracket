'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertPick(
  matchupId: string,
  seasonId: string,
  winnerId: string,
  winnerName: string,
  scoreLosing: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('picks').upsert({
    user_id: user.id,
    matchup_id: matchupId,
    season_id: seasonId,
    picked_winner_id: winnerId,
    picked_winner_name: winnerName,
    picked_score_winner: 4,
    picked_score_loser: scoreLosing,
    points_earned: 0,
  }, { onConflict: 'user_id,matchup_id' })

  if (error) throw new Error(error.message)
  revalidatePath('/picks')
  revalidatePath('/my-picks')
}
