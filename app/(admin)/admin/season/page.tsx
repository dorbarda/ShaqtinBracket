import { createClient } from '@/lib/supabase/server'
import { SeasonForm } from '@/components/admin/SeasonForm'
import { BettingGates } from '@/components/admin/BettingGates'

export default async function AdminSeasonPage() {
  const supabase = await createClient()
  const { data: seasons } = await supabase
    .from('seasons')
    .select('*')
    .order('year', { ascending: false })

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Season Management</h1>
        <p className="text-muted-foreground text-sm">Create and configure the season.</p>
      </div>

      {seasons && seasons.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Seasons</h2>
          {seasons.map(season => (
            <div key={season.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{season.name} ({season.year})</p>
                  <p className="text-sm text-muted-foreground capitalize">{season.status.replace('_', ' ')}</p>
                </div>
              </div>
              <BettingGates season={season} />
              <SeasonForm season={season} />
            </div>
          ))}
        </div>
      )}

      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Create New Season</h2>
        <SeasonForm />
      </div>
    </div>
  )
}
