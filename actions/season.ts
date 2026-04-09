'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SeasonStatus } from '@/types/database.types'

export async function createSeason(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('seasons').insert({
    year: Number(formData.get('year')),
    name: String(formData.get('name')),
    status: 'pre_playoffs',
    pre_bets_open: false,
    betting_open: false,
    points_r1_winner: Number(formData.get('points_r1_winner') || 2),
    points_r1_exact: Number(formData.get('points_r1_exact') || 2),
    points_semi_winner: Number(formData.get('points_semi_winner') || 3),
    points_semi_exact: Number(formData.get('points_semi_exact') || 3),
    points_conf_winner: Number(formData.get('points_conf_winner') || 4),
    points_conf_exact: Number(formData.get('points_conf_exact') || 4),
    points_finals_winner: Number(formData.get('points_finals_winner') || 5),
    points_finals_exact: Number(formData.get('points_finals_exact') || 5),
    points_pre_conf_winner: Number(formData.get('points_pre_conf_winner') || 7),
    points_pre_finals_winner: Number(formData.get('points_pre_finals_winner') || 15),
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/season')
}

export async function updateSeason(seasonId: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('seasons').update({
    year: Number(formData.get('year')),
    name: String(formData.get('name')),
    points_r1_winner: Number(formData.get('points_r1_winner')),
    points_r1_exact: Number(formData.get('points_r1_exact')),
    points_semi_winner: Number(formData.get('points_semi_winner')),
    points_semi_exact: Number(formData.get('points_semi_exact')),
    points_conf_winner: Number(formData.get('points_conf_winner')),
    points_conf_exact: Number(formData.get('points_conf_exact')),
    points_finals_winner: Number(formData.get('points_finals_winner')),
    points_finals_exact: Number(formData.get('points_finals_exact')),
    points_pre_conf_winner: Number(formData.get('points_pre_conf_winner')),
    points_pre_finals_winner: Number(formData.get('points_pre_finals_winner')),
  }).eq('id', seasonId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/season')
}

export async function togglePreBetsOpen(seasonId: string, open: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('seasons').update({ pre_bets_open: open }).eq('id', seasonId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/season')
  revalidatePath('/pre-picks')
}

export async function toggleBettingOpen(seasonId: string, open: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('seasons').update({ betting_open: open }).eq('id', seasonId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/season')
  revalidatePath('/picks')
}

export async function advanceSeasonStatus(seasonId: string, status: SeasonStatus) {
  const supabase = await createClient()
  const { error } = await supabase.from('seasons').update({ status }).eq('id', seasonId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/season')
  revalidatePath('/bracket')
}
