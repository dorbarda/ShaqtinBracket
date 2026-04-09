import { createClient } from '@/lib/supabase/server'
import { TeamManager } from '@/components/admin/TeamManager'

export default async function AdminTeamsPage() {
  const supabase = await createClient()
  const [{ data: seasons }, { data: teams }] = await Promise.all([
    supabase.from('seasons').select('id, name, year').order('year', { ascending: false }),
    supabase.from('teams').select('*').order('conference').order('seed'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Teams</h1>
        <p className="text-muted-foreground text-sm">Manage playoff teams (8 East + 8 West).</p>
      </div>
      <TeamManager seasons={seasons ?? []} teams={teams ?? []} />
    </div>
  )
}
