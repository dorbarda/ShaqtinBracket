'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertTeam(teamId: string | null, formData: FormData) {
  const supabase = await createClient()
  const data = {
    season_id: String(formData.get('season_id')),
    name: String(formData.get('name')),
    abbreviation: String(formData.get('abbreviation')),
    conference: String(formData.get('conference')) as 'East' | 'West',
    seed: Number(formData.get('seed')),
    color: String(formData.get('color') || '#1a1a1a'),
    logo_url: formData.get('logo_url') ? String(formData.get('logo_url')) : null,
  }

  if (teamId) {
    const { error } = await supabase.from('teams').update(data).eq('id', teamId)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('teams').insert(data)
    if (error) throw new Error(error.message)
  }
  revalidatePath('/admin/teams')
  revalidatePath('/admin/bracket')
}

export async function deleteTeam(teamId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('teams').delete().eq('id', teamId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/teams')
}
