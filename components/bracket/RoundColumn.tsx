import type { BracketMatchup } from '@/types/bracket'
import { MatchupCard } from './MatchupCard'

export function RoundColumn({
  round,
  matchups,
}: {
  round: number
  matchups: BracketMatchup[]
}) {
  const sorted = [...matchups].sort((a, b) => a.display_order - b.display_order)
  const compact = round === 1

  return (
    <div className="flex flex-col justify-around gap-2 py-2">
      {sorted.length > 0 ? (
        sorted.map(m => (
          <div key={m.id} className="flex items-center justify-center">
            <MatchupCard matchup={m} compact={compact} />
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-xs text-muted-foreground italic px-2 text-center">TBD</div>
        </div>
      )}
    </div>
  )
}
