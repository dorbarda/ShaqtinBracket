import type { BracketData } from '@/types/bracket'
import { ConferenceBracket } from './ConferenceBracket'
import { MatchupCard } from './MatchupCard'
import { Trophy } from 'lucide-react'

interface BracketViewerProps {
  data: BracketData
  showUserPicks?: boolean
}

export function BracketViewer({ data }: BracketViewerProps) {
  const hasData =
    Object.values(data.east).some(r => r.length > 0) ||
    Object.values(data.west).some(r => r.length > 0) ||
    data.finals !== null

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <Trophy className="h-12 w-12 opacity-30" />
        <p className="text-sm">The bracket hasn&apos;t been set up yet. Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto pb-4">
      {/* Desktop layout: East | Finals | West */}
      <div className="hidden md:flex items-stretch gap-2 min-w-[900px]">
        <ConferenceBracket
          conference="East"
          matchupsByRound={data.east}
          reversed={false}
        />

        {/* Finals center column */}
        <div className="flex flex-col items-center justify-center gap-2 px-2 shrink-0">
          <div className="text-[10px] text-center text-muted-foreground font-semibold tracking-wide uppercase">
            NBA Finals
          </div>
          {data.finals ? (
            <MatchupCard matchup={data.finals} compact={false} />
          ) : (
            <div className="w-44 h-24 border-2 border-dashed rounded-lg flex items-center justify-center">
              <span className="text-xs text-muted-foreground">TBD</span>
            </div>
          )}
        </div>

        <ConferenceBracket
          conference="West"
          matchupsByRound={data.west}
          reversed={true}
        />
      </div>

      {/* Mobile layout: stacked */}
      <div className="md:hidden space-y-8">
        {/* East */}
        <div>
          <h3 className="font-semibold text-center mb-3">Eastern Conference</h3>
          <div className="flex overflow-x-auto gap-3 pb-2">
            {[1, 2, 3].map(round => (
              <div key={round} className="shrink-0">
                <div className="text-[10px] text-center text-muted-foreground mb-1">
                  {round === 1 ? 'R1' : round === 2 ? 'Semi' : 'Conf Finals'}
                </div>
                <div className="flex flex-col gap-2">
                  {(data.east[round] ?? []).map(m => (
                    <MatchupCard key={m.id} matchup={m} compact={round === 1} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Finals */}
        {data.finals && (
          <div>
            <h3 className="font-semibold text-center mb-3">NBA Finals</h3>
            <div className="flex justify-center">
              <MatchupCard matchup={data.finals} />
            </div>
          </div>
        )}

        {/* West */}
        <div>
          <h3 className="font-semibold text-center mb-3">Western Conference</h3>
          <div className="flex overflow-x-auto gap-3 pb-2">
            {[1, 2, 3].map(round => (
              <div key={round} className="shrink-0">
                <div className="text-[10px] text-center text-muted-foreground mb-1">
                  {round === 1 ? 'R1' : round === 2 ? 'Semi' : 'Conf Finals'}
                </div>
                <div className="flex flex-col gap-2">
                  {(data.west[round] ?? []).map(m => (
                    <MatchupCard key={m.id} matchup={m} compact={round === 1} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
