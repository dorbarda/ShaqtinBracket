"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { createMatchup, deleteMatchup } from "@/actions/matchups"
import type { Season, Team, Matchup, Conference } from "@/types/database.types"
import { Trash2, Plus, Zap } from "lucide-react"

const ROUND_LABELS: Record<number, string> = {
  1: 'Round 1', 2: 'Semifinals', 3: 'Conference Finals', 4: 'NBA Finals'
}

interface BracketBuilderProps {
  seasons: Season[]
  teams: Team[]
  matchups: Matchup[]
}

export function BracketBuilder({ seasons, teams, matchups }: BracketBuilderProps) {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]?.id ?? '')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const seasonTeams = teams.filter(t => t.season_id === selectedSeason)
  const seasonMatchups = matchups.filter(m => m.season_id === selectedSeason)

  const autoSuggestR1 = () => {
    const east = seasonTeams.filter(t => t.conference === 'East').sort((a, b) => a.seed - b.seed)
    const west = seasonTeams.filter(t => t.conference === 'West').sort((a, b) => a.seed - b.seed)
    // 1v8, 2v7, 3v6, 4v5
    const pairs = [[0, 7], [1, 6], [2, 5], [3, 4]]
    return [
      ...pairs.map(([a, b], i) => ({
        conference: 'East' as Conference,
        team1: east[a],
        team2: east[b],
        order: i,
      })),
      ...pairs.map(([a, b], i) => ({
        conference: 'West' as Conference,
        team1: west[a],
        team2: west[b],
        order: i,
      })),
    ].filter(m => m.team1 && m.team2)
  }

  const handleAutoCreate = async () => {
    const suggestions = autoSuggestR1()
    setLoading(true)
    for (const s of suggestions) {
      const fd = new FormData()
      fd.set('season_id', selectedSeason)
      fd.set('round', '1')
      fd.set('conference', s.conference)
      fd.set('team1_id', s.team1.id)
      fd.set('team1_name', s.team1.name)
      fd.set('team2_id', s.team2.id)
      fd.set('team2_name', s.team2.name)
      fd.set('display_order', String(s.order))
      await createMatchup(fd)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this matchup?')) return
    await deleteMatchup(id)
  }

  return (
    <div className="space-y-6">
      {seasons.length > 1 && (
        <div className="flex items-center gap-2">
          <Label>Season:</Label>
          <select
            value={selectedSeason}
            onChange={e => setSelectedSeason(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleAutoCreate}
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={loading || seasonTeams.length < 16}
          title={seasonTeams.length < 16 ? 'Need 16 teams first' : 'Auto-create R1 matchups'}
        >
          <Zap className="h-4 w-4" />
          Auto-create R1 matchups ({seasonTeams.length}/16 teams)
        </Button>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add matchup
        </Button>
      </div>

      {showForm && (
        <MatchupForm
          seasonId={selectedSeason}
          teams={seasonTeams}
          onDone={() => setShowForm(false)}
        />
      )}

      {[1, 2, 3, 4].map(round => {
        const roundMatchups = seasonMatchups.filter(m => m.round === round)
        if (roundMatchups.length === 0) return null
        return (
          <div key={round}>
            <h3 className="font-semibold mb-3">{ROUND_LABELS[round]}</h3>
            <div className="space-y-2">
              {roundMatchups.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Badge variant="outline">{m.conference}</Badge>
                  <span className="flex-1 text-sm">{m.team1_name} vs {m.team2_name}</span>
                  <Badge variant={
                    m.status === 'completed' ? 'success' :
                    m.status === 'betting_open' ? 'default' :
                    m.status === 'locked' ? 'warning' : 'secondary'
                  }>{m.status.replace('_', ' ')}</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleDelete(m.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {seasonMatchups.length === 0 && (
        <p className="text-muted-foreground text-sm">No matchups yet. Use auto-create or add manually.</p>
      )}
    </div>
  )
}

function MatchupForm({
  seasonId,
  teams,
  onDone,
}: {
  seasonId: string
  teams: Team[]
  onDone: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set('season_id', seasonId)
    // Set team names from selected IDs
    const t1 = teams.find(t => t.id === fd.get('team1_id'))
    const t2 = teams.find(t => t.id === fd.get('team2_id'))
    fd.set('team1_name', t1?.name ?? String(fd.get('team1_name_manual') || 'TBD'))
    fd.set('team2_name', t2?.name ?? String(fd.get('team2_name_manual') || 'TBD'))
    await createMatchup(fd)
    setLoading(false)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 p-4 border rounded-lg bg-muted/20">
      <div className="space-y-1">
        <Label>Round</Label>
        <select name="round" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
          {[1, 2, 3, 4].map(r => <option key={r} value={r}>{ROUND_LABELS[r]}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <Label>Conference</Label>
        <select name="conference" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
          <option value="East">East</option>
          <option value="West">West</option>
          <option value="Finals">Finals</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label>Team 1</Label>
        <select name="team1_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
          <option value="">-- TBD --</option>
          {teams.map(t => <option key={t.id} value={t.id}>#{t.seed} {t.name} ({t.conference})</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <Label>Team 2</Label>
        <select name="team2_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
          <option value="">-- TBD --</option>
          {teams.map(t => <option key={t.id} value={t.id}>#{t.seed} {t.name} ({t.conference})</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <Label>Display order</Label>
        <Input name="display_order" type="number" defaultValue={0} />
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit" size="sm" disabled={loading}>{loading ? 'Saving...' : 'Add matchup'}</Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  )
}
