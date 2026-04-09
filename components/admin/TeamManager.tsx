"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { upsertTeam, deleteTeam } from "@/actions/teams"
import type { Team } from "@/types/database.types"
import { Pencil, Trash2, Plus } from "lucide-react"

interface TeamManagerProps {
  seasons: { id: string; name: string; year: number }[]
  teams: Team[]
}

function TeamForm({
  team,
  seasonId,
  onDone,
}: {
  team?: Team
  seasonId: string
  onDone: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set('season_id', seasonId)
    await upsertTeam(team?.id ?? null, fd)
    setLoading(false)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 p-4 border rounded-lg bg-muted/20">
      <div className="space-y-1">
        <Label>Name</Label>
        <Input name="name" defaultValue={team?.name} placeholder="Boston Celtics" required />
      </div>
      <div className="space-y-1">
        <Label>Abbreviation</Label>
        <Input name="abbreviation" defaultValue={team?.abbreviation} placeholder="BOS" maxLength={5} required />
      </div>
      <div className="space-y-1">
        <Label>Conference</Label>
        <select name="conference" defaultValue={team?.conference ?? 'East'} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="East">East</option>
          <option value="West">West</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label>Seed (1-8)</Label>
        <Input name="seed" type="number" min={1} max={8} defaultValue={team?.seed} required />
      </div>
      <div className="space-y-1">
        <Label>Color (hex)</Label>
        <Input name="color" defaultValue={team?.color ?? '#1a1a1a'} placeholder="#007A33" />
      </div>
      <div className="space-y-1">
        <Label>Logo URL</Label>
        <Input name="logo_url" defaultValue={team?.logo_url ?? ''} placeholder="https://..." />
      </div>
      <div className="col-span-2 flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  )
}

export function TeamManager({ seasons, teams }: TeamManagerProps) {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]?.id ?? '')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingConf, setAddingConf] = useState<'East' | 'West' | null>(null)

  const filtered = teams.filter(t => t.season_id === selectedSeason)
  const east = filtered.filter(t => t.conference === 'East').sort((a, b) => a.seed - b.seed)
  const west = filtered.filter(t => t.conference === 'West').sort((a, b) => a.seed - b.seed)

  const handleDelete = async (teamId: string) => {
    if (!confirm('Delete this team?')) return
    await deleteTeam(teamId)
  }

  const TeamRow = ({ team }: { team: Team }) => (
    <>
      <div
        className="flex items-center gap-3 p-3 border rounded-lg bg-card"
        style={{ borderLeftColor: team.color, borderLeftWidth: 4 }}
      >
        <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{team.name}</p>
          <p className="text-xs text-muted-foreground">#{team.seed} {team.abbreviation}</p>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(team.id)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(team.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {editingId === team.id && (
        <TeamForm team={team} seasonId={selectedSeason} onDone={() => setEditingId(null)} />
      )}
    </>
  )

  return (
    <div className="space-y-4">
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

      <div className="grid md:grid-cols-2 gap-6">
        {(['East', 'West'] as const).map(conf => {
          const confTeams = conf === 'East' ? east : west
          return (
            <div key={conf}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{conf}ern Conference <span className="text-muted-foreground font-normal text-sm">({confTeams.length}/8)</span></h3>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => setAddingConf(conf)}>
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {confTeams.map(team => <TeamRow key={team.id} team={team} />)}
                {addingConf === conf && (
                  <TeamForm seasonId={selectedSeason} onDone={() => setAddingConf(null)} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
