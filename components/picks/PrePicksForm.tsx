"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { upsertPreBet } from "@/actions/pre-bets"
import type { Season, Team, PreBet } from "@/types/database.types"
import { CheckCircle2 } from "lucide-react"

interface PrePicksFormProps {
  season: Season
  teams: Team[]
  existingBet: PreBet | null
}

export function PrePicksForm({ season, teams, existingBet }: PrePicksFormProps) {
  const eastTeams = teams.filter(t => t.conference === 'East')
  const westTeams = teams.filter(t => t.conference === 'West')
  const allTeams = [...eastTeams, ...westTeams]

  const [eastId, setEastId] = useState(existingBet?.east_winner_id ?? '')
  const [westId, setWestId] = useState(existingBet?.west_winner_id ?? '')
  const [finalsId, setFinalsId] = useState(existingBet?.finals_winner_id ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eastId || !westId || !finalsId) return
    setLoading(true)
    setSaved(false)
    const eastTeam = teams.find(t => t.id === eastId)!
    const westTeam = teams.find(t => t.id === westId)!
    const finalsTeam = teams.find(t => t.id === finalsId)!
    await upsertPreBet(
      season.id,
      eastId, eastTeam.name,
      westId, westTeam.name,
      finalsId, finalsTeam.name
    )
    setLoading(false)
    setSaved(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border rounded-lg p-6">
      <div className="space-y-2">
        <Label>Eastern Conference Champion</Label>
        <Select value={eastId} onValueChange={setEastId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select East champion..." />
          </SelectTrigger>
          <SelectContent>
            {eastTeams.map(t => (
              <SelectItem key={t.id} value={t.id}>
                #{t.seed} {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Western Conference Champion</Label>
        <Select value={westId} onValueChange={setWestId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select West champion..." />
          </SelectTrigger>
          <SelectContent>
            {westTeams.map(t => (
              <SelectItem key={t.id} value={t.id}>
                #{t.seed} {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>NBA Finals Winner</Label>
        <Select value={finalsId} onValueChange={setFinalsId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select Finals winner..." />
          </SelectTrigger>
          <SelectContent>
            {allTeams.map(t => (
              <SelectItem key={t.id} value={t.id}>
                #{t.seed} {t.name} ({t.conference})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading || !eastId || !westId || !finalsId}>
          {loading ? 'Saving...' : existingBet ? 'Update picks' : 'Submit picks'}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" /> Saved!
          </span>
        )}
      </div>
    </form>
  )
}
