"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updateMatchupStatus } from "@/actions/matchups"
import type { Matchup, MatchupStatus, Season } from "@/types/database.types"

const ROUND_LABELS: Record<number, string> = {
  1: 'Round 1', 2: 'Semifinals', 3: 'Conference Finals', 4: 'NBA Finals'
}

const STATUS_COLORS: Record<MatchupStatus, 'default' | 'success' | 'warning' | 'secondary' | 'outline'> = {
  upcoming: 'secondary',
  betting_open: 'default',
  locked: 'warning',
  completed: 'success',
}

export function BettingControls({ matchups, season }: { matchups: Matchup[]; season: Season }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const grouped: Record<number, Matchup[]> = {}
  matchups.forEach(m => {
    if (!grouped[m.round]) grouped[m.round] = []
    grouped[m.round].push(m)
  })

  const handleStatus = async (matchupId: string, status: MatchupStatus) => {
    setLoadingId(matchupId)
    await updateMatchupStatus(matchupId, status)
    setLoadingId(null)
  }

  const nextStatus = (current: MatchupStatus): MatchupStatus | null => {
    const flow: MatchupStatus[] = ['upcoming', 'betting_open', 'locked']
    const idx = flow.indexOf(current)
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null
  }

  const prevStatus = (current: MatchupStatus): MatchupStatus | null => {
    const flow: MatchupStatus[] = ['upcoming', 'betting_open', 'locked']
    const idx = flow.indexOf(current)
    return idx > 0 ? flow[idx - 1] : null
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Season: <span className="font-medium text-foreground">{season.name}</span> —{' '}
        Status: <span className="font-medium text-foreground capitalize">{season.status.replace('_', ' ')}</span>
      </div>

      {Object.entries(grouped).map(([round, roundMatchups]) => (
        <div key={round}>
          <h3 className="font-semibold mb-3">{ROUND_LABELS[Number(round)]}</h3>
          <div className="space-y-2">
            {roundMatchups.map(m => {
              const next = nextStatus(m.status)
              const prev = prevStatus(m.status)
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Badge variant="outline">{m.conference}</Badge>
                  <span className="flex-1 text-sm">{m.team1_name} vs {m.team2_name}</span>
                  <Badge variant={STATUS_COLORS[m.status]}>{m.status.replace('_', ' ')}</Badge>
                  <div className="flex gap-1">
                    {prev && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatus(m.id, prev)}
                        disabled={loadingId === m.id}
                      >
                        ← {prev.replace('_', ' ')}
                      </Button>
                    )}
                    {next && (
                      <Button
                        size="sm"
                        onClick={() => handleStatus(m.id, next)}
                        disabled={loadingId === m.id}
                      >
                        {next.replace('_', ' ')} →
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {matchups.length === 0 && (
        <p className="text-muted-foreground text-sm">No active matchups. Create matchups in the Bracket builder.</p>
      )}
    </div>
  )
}
