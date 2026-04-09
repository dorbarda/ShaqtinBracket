'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertPreBet(
  seasonId: string,
  eastWinnerId: string,
  eastWinnerName: string,
  westWinnerId: string,
  westWinnerName: string,
  finalsWinnerId: string,
  finalsWinnerName: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('pre_bets').upsert({
    user_id: user.id,
    season_id: seasonId,
    east_winner_id: eastWinnerId,
    east_winner_name: eastWinnerName,
    west_winner_id: westWinnerId,
    west_winner_name: westWinnerName,
    finals_winner_id: finalsWinnerId,
    finals_winner_name: finalsWinnerName,
    points_earned: 0,
  }, { onConflict: 'user_id,season_id' })

  if (error) throw new Error(error.message)
  revalidatePath('/pre-picks')
  revalidatePath('/my-picks')
}
