import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Star } from 'lucide-react'

const ROUND_LABELS: Record<number, string> = {
  1: 'Round 1', 2: 'Semifinals', 3: 'Conference Finals', 4: 'NBA Finals'
}

export default async function MyPicksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: picks }, { data: preBet }] = await Promise.all([
    supabase
      .from('picks')
      .select('*, matchup:matchups(*)')
      .eq('user_id', user.id)
      .order('created_at'),
    supabase
      .from('pre_bets')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .single(),
  ])

  const grouped: Record<number, typeof picks> = {}
  ;(picks ?? []).forEach((p: any) => {
    const round = p.matchup?.round ?? 1
    if (!grouped[round]) grouped[round] = []
    grouped[round].push(p)
  })

  const totalPts = (picks ?? []).reduce((sum: number, p: any) => sum + (p.points_earned ?? 0), 0) + (preBet?.points_earned ?? 0)
  const correctPicks = (picks ?? []).filter((p: any) => p.is_winner_correct).length
  const exactPicks = (picks ?? []).filter((p: any) => p.is_exact_correct).length

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">My Picks</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Points', value: totalPts, color: 'text-primary' },
          { label: 'Correct Picks', value: correctPicks },
          { label: 'Exact Scores', value: exactPicks },
        ].map(({ label, value, color }) => (
          <div key={label} className="border rounded-lg p-4 text-center">
            <div className={`text-3xl font-bold ${color ?? ''}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Pre-bets */}
      {preBet && (
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            Pre-Playoff Picks
            <Badge variant={preBet.points_earned > 0 ? 'success' : 'secondary'}>
              {preBet.points_earned} pts
            </Badge>
          </h2>
          <div className="space-y-2 text-sm">
            {[
              { label: 'East Champion', name: preBet.east_winner_name, correct: preBet.east_correct },
              { label: 'West Champion', name: preBet.west_winner_name, correct: preBet.west_correct },
              { label: 'Finals Winner', name: preBet.finals_winner_name, correct: preBet.finals_correct },
            ].map(({ label, name, correct }) => (
              <div key={label} className="flex items-center gap-2">
                {correct === true && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                {correct === false && <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                {correct === null && <div className="h-4 w-4 rounded-full border-2 border-muted shrink-0" />}
                <span className="text-muted-foreground">{label}:</span>
                <span className="font-medium">{name ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Picks by round */}
      {[1, 2, 3, 4].map(round => {
        const roundPicks = grouped[round]
        if (!roundPicks?.length) return null
        return (
          <div key={round}>
            <h2 className="font-semibold mb-3">{ROUND_LABELS[round]}</h2>
            <div className="space-y-2">
              {roundPicks.map((pick: any) => {
                const matchup = pick.matchup
                return (
                  <div key={pick.id} className="border rounded-lg p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {matchup?.team1_name} vs {matchup?.team2_name}
                      </p>
                      <p className="text-sm font-medium">
                        Picked: {pick.picked_winner_name} in 4-{pick.picked_score_loser}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {pick.is_winner_correct === true && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {pick.is_winner_correct === false && (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      {pick.is_exact_correct === true && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                      {matchup?.status === 'completed' && (
                        <Badge variant={pick.points_earned > 0 ? 'success' : 'secondary'} className="text-xs">
                          {pick.points_earned > 0 ? `+${pick.points_earned}` : '0'} pts
                        </Badge>
                      )}
                      {matchup?.status !== 'completed' && (
                        <Badge variant="outline" className="text-xs">
                          {matchup?.status?.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {!picks?.length && !preBet && (
        <p className="text-muted-foreground text-sm">No picks yet. Head to Picks to get started!</p>
      )}
    </div>
  )
}
