import { createClient } from '@/lib/supabase/server'
import { BracketBuilder } from '@/components/admin/BracketBuilder'

export default async function AdminBracketPage() {
  const supabase = await createClient()
  const [{ data: seasons }, { data: teams }, { data: matchups }] = await Promise.all([
    supabase.from('seasons').select('*').order('year', { ascending: false }),
    supabase.from('teams').select('*').order('conference').order('seed'),
    supabase.from('matchups').select('*').order('round').order('display_order'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Bracket Builder</h1>
        <p className="text-muted-foreground text-sm">Create matchups for each round.</p>
      </div>
      <BracketBuilder
        seasons={seasons ?? []}
        teams={teams ?? []}
        matchups={matchups ?? []}
      />
    </div>
  )
}
