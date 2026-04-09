import { createClient } from '@/lib/supabase/server'
import { BettingControls } from '@/components/admin/BettingControls'

export default async function AdminBettingPage() {
  const supabase = await createClient()
  const [{ data: matchups }, { data: season }] = await Promise.all([
    supabase.from('matchups').select('*').not('status', 'eq', 'completed').order('round').order('display_order'),
    supabase.from('seasons').select('*').order('year', { ascending: false }).limit(1).single(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Betting Controls</h1>
        <p className="text-muted-foreground text-sm">Open or lock individual matchups for betting.</p>
      </div>
      {season && <BettingControls matchups={matchups ?? []} season={season} />}
    </div>
  )
}
