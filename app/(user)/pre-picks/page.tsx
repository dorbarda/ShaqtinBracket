import { createClient } from '@/lib/supabase/server'
import { PrePicksForm } from '@/components/picks/PrePicksForm'

export default async function PrePicksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: season }, { data: teams }, { data: existingBet }] = await Promise.all([
    supabase.from('seasons').select('*').order('year', { ascending: false }).limit(1).single(),
    supabase.from('teams').select('*').order('conference').order('seed'),
    user ? supabase.from('pre_bets').select('*').eq('user_id', user.id).limit(1).single() : Promise.resolve({ data: null }),
  ])

  if (!season?.pre_bets_open) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold mb-2">Pre-Playoff Picks</h1>
        <p className="text-muted-foreground">Pre-playoff betting is currently closed.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Pre-Playoff Picks</h1>
        <p className="text-muted-foreground text-sm">
          Predict the conference champions and Finals winner before the playoffs begin.
          {season.points_pre_conf_winner > 0 && ` Correct conference pick = ${season.points_pre_conf_winner} pts.`}
          {season.points_pre_finals_winner > 0 && ` Correct Finals pick = ${season.points_pre_finals_winner} pts.`}
        </p>
      </div>
      <PrePicksForm
        season={season}
        teams={teams ?? []}
        existingBet={existingBet}
      />
    </div>
  )
}
