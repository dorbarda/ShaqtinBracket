"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { saveMatchupResult } from "@/actions/results"
import type { Matchup } from "@/types/database.types"
import { CheckCircle2 } from "lucide-react"

const ROUND_LABELS: Record<number, string> = {
  1: 'Round 1', 2: 'Semifinals', 3: 'Conference Finals', 4: 'NBA Finals'
}

export function ResultsEntry({ matchups }: { matchups: Matchup[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const grouped: Record<number, Matchup[]> = {}
  matchups.forEach(m => {
    if (!grouped[m.round]) grouped[m.round] = []
    grouped[m.round].push(m)
  })

  const handleSave = async (matchup: Matchup, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const winnerId = String(fd.get('winner_id'))
    const scoreT1 = Number(fd.get('score_t1'))
    const scoreT2 = Number(fd.get('score_t2'))
    setLoadingId(matchup.id)
    await saveMatchupResult(matchup.id, winnerId, scoreT1, scoreT2)
    setLoadingId(null)
    setSavedIds(prev => new Set(Array.from(prev).concat(matchup.id)))
  }

  if (matchups.length === 0) {
    return <p className="text-muted-foreground text-sm">No active matchups. Open betting on some matchups first.</p>
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([round, roundMatchups]) => (
        <div key={round}>
          <h3 className="font-semibold mb-3">{ROUND_LABELS[Number(round)]}</h3>
          <div className="space-y-3">
            {roundMatchups.map(matchup => (
              <div key={matchup.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium">{matchup.team1_name} vs {matchup.team2_name}</span>
                  <Badge variant="outline">{matchup.conference}</Badge>
                  {matchup.status === 'completed' && (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {matchup.actual_winner_id === matchup.team1_id ? matchup.team1_name : matchup.team2_name} {matchup.actual_score_team1}-{matchup.actual_score_team2}
                    </Badge>
                  )}
                </div>
                <form onSubmit={(e) => handleSave(matchup, e)} className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1">
                    <Label>Winner</Label>
                    <select
                      name="winner_id"
                      defaultValue={matchup.actual_winner_id ?? ''}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      required
                    >
                      <option value="">-- Select winner --</option>
                      {matchup.team1_id && <option value={matchup.team1_id}>{matchup.team1_name}</option>}
                      {matchup.team2_id && <option value={matchup.team2_id}>{matchup.team2_name}</option>}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>{matchup.team1_name} wins</Label>
                    <Input
                      name="score_t1"
                      type="number"
                      min={0}
                      max={4}
                      defaultValue={matchup.actual_score_team1 ?? ''}
                      className="w-20"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{matchup.team2_name} wins</Label>
                    <Input
                      name="score_t2"
                      type="number"
                      min={0}
                      max={4}
                      defaultValue={matchup.actual_score_team2 ?? ''}
                      className="w-20"
                      required
                    />
                  </div>
                  <Button type="submit" size="sm" disabled={loadingId === matchup.id}>
                    {loadingId === matchup.id ? 'Saving...' : 'Save & Calculate'}
                  </Button>
                  {savedIds.has(matchup.id) && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Points recalculated
                    </span>
                  )}
                </form>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
