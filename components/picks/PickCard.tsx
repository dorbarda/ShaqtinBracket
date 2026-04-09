"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { upsertPick } from "@/actions/picks"
import type { Season, Pick } from "@/types/database.types"
import { CheckCircle2 } from "lucide-react"

interface PickCardProps {
  matchup: {
    id: string
    season_id: string
    round: number
    conference: string
    team1_id: string | null
    team1_name: string
    team2_id: string | null
    team2_name: string
    team1: { id: string; name: string; seed: number; color: string; abbreviation: string } | null
    team2: { id: string; name: string; seed: number; color: string; abbreviation: string } | null
  }
  season: Season
  existingPick: Pick | null
}

const LOSER_SCORES = [0, 1, 2, 3]

export function PickCard({ matchup, season, existingPick }: PickCardProps) {
  const [winnerId, setWinnerId] = useState(existingPick?.picked_winner_id ?? '')
  const [loserScore, setLoserScore] = useState(existingPick?.picked_score_loser ?? 0)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const team1 = matchup.team1
  const team2 = matchup.team2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!winnerId) return
    setLoading(true)
    setSaved(false)
    const winnerName = winnerId === matchup.team1_id ? matchup.team1_name : matchup.team2_name
    await upsertPick(matchup.id, matchup.season_id, winnerId, winnerName, loserScore)
    setLoading(false)
    setSaved(true)
  }

  const roundPoints = {
    1: season.points_r1_winner,
    2: season.points_semi_winner,
    3: season.points_conf_winner,
    4: season.points_finals_winner,
  }[matchup.round] ?? 1

  const exactPoints = {
    1: season.points_r1_exact,
    2: season.points_semi_exact,
    3: season.points_conf_exact,
    4: season.points_finals_exact,
  }[matchup.round] ?? 1

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30">
        <Badge variant="outline">{matchup.conference} — Round {matchup.round}</Badge>
        <span className="text-xs text-muted-foreground">
          Winner: {roundPoints}pts + exact score: +{exactPoints}pts
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Team selector */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: matchup.team1_id, name: matchup.team1_name, team: team1 },
            { id: matchup.team2_id, name: matchup.team2_name, team: team2 },
          ].map(({ id, name, team }) => (
            <button
              key={id}
              type="button"
              onClick={() => id && setWinnerId(id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                winnerId === id
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-muted hover:border-muted-foreground/30'
              }`}
              style={team ? { borderLeftColor: team.color, borderLeftWidth: 4 } : undefined}
            >
              <div className="flex items-center gap-2">
                {team && (
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: team.color }}
                  />
                )}
                <div>
                  <p className="font-medium text-sm">{name}</p>
                  {team && <p className="text-xs text-muted-foreground">#{team.seed} seed</p>}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Series score */}
        <div className="space-y-1.5">
          <Label>Loser wins (0–3)</Label>
          <div className="flex gap-2">
            {LOSER_SCORES.map(score => (
              <button
                key={score}
                type="button"
                onClick={() => setLoserScore(score)}
                className={`w-12 h-10 rounded-md border text-sm font-medium transition-colors ${
                  loserScore === score
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted border-input'
                }`}
              >
                4-{score}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={loading || !winnerId}>
            {loading ? 'Saving...' : existingPick ? 'Update pick' : 'Submit pick'}
          </Button>
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Saved!
            </span>
          )}
        </div>
      </div>
    </form>
  )
}
