import { createClient } from '@/lib/supabase/server'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Build leaderboard from picks + pre_bets grouped by user
  const [{ data: profiles }, { data: picks }, { data: preBets }] = await Promise.all([
    supabase.from('user_profiles').select('*'),
    supabase.from('picks').select('user_id, points_earned, matchup:matchups(round)'),
    supabase.from('pre_bets').select('user_id, points_earned'),
  ])

  const pointsByUser: Record<string, {
    r1: number; r2: number; r3: number; r4: number; preBet: number
  }> = {}

  ;(picks ?? []).forEach((p: any) => {
    if (!pointsByUser[p.user_id]) pointsByUser[p.user_id] = { r1: 0, r2: 0, r3: 0, r4: 0, preBet: 0 }
    const round = p.matchup?.round ?? 1
    const key = `r${round}` as 'r1' | 'r2' | 'r3' | 'r4'
    pointsByUser[p.user_id][key] += p.points_earned
  })

  ;(preBets ?? []).forEach((pb: any) => {
    if (!pointsByUser[pb.user_id]) pointsByUser[pb.user_id] = { r1: 0, r2: 0, r3: 0, r4: 0, preBet: 0 }
    pointsByUser[pb.user_id].preBet += pb.points_earned
  })

  const rows = (profiles ?? []).map(p => {
    const pts = pointsByUser[p.id] ?? { r1: 0, r2: 0, r3: 0, r4: 0, preBet: 0 }
    const total = pts.r1 + pts.r2 + pts.r3 + pts.r4 + pts.preBet
    return {
      id: p.id,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      total,
      r1: pts.r1,
      r2: pts.r2,
      r3: pts.r3,
      r4: pts.r4,
      preBet: pts.preBet,
      isCurrentUser: p.id === user?.id,
    }
  }).sort((a, b) => b.total - a.total)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <LeaderboardTable rows={rows} />
    </div>
  )
}
