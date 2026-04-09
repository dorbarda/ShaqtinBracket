import type { BracketMatchup } from '@/types/bracket'
import { RoundColumn } from './RoundColumn'

interface ConferenceBracketProps {
  conference: 'East' | 'West'
  matchupsByRound: Record<number, BracketMatchup[]>
  reversed?: boolean
}

export function ConferenceBracket({ conference, matchupsByRound, reversed }: ConferenceBracketProps) {
  const rounds = reversed ? [3, 2, 1] : [1, 2, 3]

  return (
    <div className="flex-1">
      <div className="text-center text-sm font-semibold text-muted-foreground mb-2 tracking-wide uppercase">
        {conference}ern
      </div>
      <div className={`flex gap-1 ${reversed ? 'flex-row-reverse' : 'flex-row'}`}>
        {rounds.map(round => (
          <div key={round} className="flex-1 min-w-0">
            <div className="text-[10px] text-center text-muted-foreground mb-1">
              {round === 1 ? 'R1' : round === 2 ? 'Semi' : 'Conf Finals'}
            </div>
            <RoundColumn
              round={round}
              matchups={matchupsByRound[round] ?? []}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
