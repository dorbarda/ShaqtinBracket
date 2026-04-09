'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Conference, MatchupStatus } from '@/types/database.types'

export async function createMatchup(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('matchups').insert({
    season_id: String(formData.get('season_id')),
    round: Number(formData.get('round')),
    conference: String(formData.get('conference')) as Conference,
    team1_id: formData.get('team1_id') ? String(formData.get('team1_id')) : null,
    team1_name: String(formData.get('team1_name')),
    team2_id: formData.get('team2_id') ? String(formData.get('team2_id')) : null,
    team2_name: String(formData.get('team2_name')),
    display_order: Number(formData.get('display_order') || 0),
    status: 'upcoming',
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/bracket')
  revalidatePath('/bracket')
}

export async function updateMatchupStatus(matchupId: string, status: MatchupStatus) {
  const supabase = await createClient()
  const { error } = await supabase.from('matchups').update({ status }).eq('id', matchupId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/betting')
  revalidatePath('/picks')
  revalidatePath('/bracket')
}

export async function deleteMatchup(matchupId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('matchups').delete().eq('id', matchupId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/bracket')
}
