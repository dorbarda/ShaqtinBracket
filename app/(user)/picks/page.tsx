import { createClient } from '@/lib/supabase/server'
import { PickCard } from '@/components/picks/PickCard'

export default async function PicksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: season }, { data: matchups }, { data: userPicks }] = await Promise.all([
    supabase.from('seasons').select('*').order('year', { ascending: false }).limit(1).single(),
    supabase.from('matchups')
      .select('*, team1:teams!matchups_team1_id_fkey(*), team2:teams!matchups_team2_id_fkey(*)')
      .eq('status', 'betting_open')
      .order('round')
      .order('display_order'),
    user
      ? supabase.from('picks').select('*').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ])

  if (!season?.betting_open) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Make Your Picks</h1>
        <p className="text-muted-foreground">Betting is currently closed. Check back when the next round opens.</p>
      </div>
    )
  }

  const picksByMatchup = Object.fromEntries((userPicks ?? []).map(p => [p.matchup_id, p]))

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Make Your Picks</h1>
        <p className="text-muted-foreground text-sm">
          Pick the winner and how many games the loser wins (0–3).
        </p>
      </div>

      {matchups && matchups.length > 0 ? (
        <div className="space-y-4">
          {matchups.map((matchup: any) => (
            <PickCard
              key={matchup.id}
              matchup={matchup}
              season={season}
              existingPick={picksByMatchup[matchup.id] ?? null}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No matchups open for betting right now.</p>
      )}
    </div>
  )
}
