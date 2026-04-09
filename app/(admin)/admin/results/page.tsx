import { createClient } from '@/lib/supabase/server'
import { ResultsEntry } from '@/components/admin/ResultsEntry'

export default async function AdminResultsPage() {
  const supabase = await createClient()
  const { data: matchups } = await supabase
    .from('matchups')
    .select('*, season:seasons(points_r1_winner)')
    .in('status', ['betting_open', 'locked', 'completed'])
    .order('round')
    .order('display_order')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Enter Results</h1>
        <p className="text-muted-foreground text-sm">Input actual series scores to trigger points calculation.</p>
      </div>
      <ResultsEntry matchups={matchups ?? []} />
    </div>
  )
}
