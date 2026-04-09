"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { togglePreBetsOpen, toggleBettingOpen, advanceSeasonStatus } from "@/actions/season"
import { Button } from "@/components/ui/button"
import type { Season, SeasonStatus } from "@/types/database.types"

const STATUS_ORDER: SeasonStatus[] = [
  'pre_playoffs', 'round1', 'semifinals', 'conference_finals', 'finals', 'completed'
]

export function BettingGates({ season }: { season: Season }) {
  const [preBetsOpen, setPreBetsOpen] = useState(season.pre_bets_open)
  const [bettingOpen, setBettingOpen] = useState(season.betting_open)
  const [loading, setLoading] = useState<string | null>(null)

  const currentIdx = STATUS_ORDER.indexOf(season.status)
  const nextStatus = currentIdx < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIdx + 1] : null

  const handlePreBets = async (checked: boolean) => {
    setPreBetsOpen(checked)
    setLoading('prebets')
    await togglePreBetsOpen(season.id, checked)
    setLoading(null)
  }

  const handleBetting = async (checked: boolean) => {
    setBettingOpen(checked)
    setLoading('betting')
    await toggleBettingOpen(season.id, checked)
    setLoading(null)
  }

  const handleAdvance = async () => {
    if (!nextStatus) return
    setLoading('advance')
    await advanceSeasonStatus(season.id, nextStatus)
    setLoading(null)
  }

  return (
    <div className="space-y-3 p-3 bg-muted/30 rounded-md">
      <div className="flex items-center justify-between">
        <Label htmlFor={`pre-bets-${season.id}`} className="cursor-pointer">Pre-bets open</Label>
        <Switch
          id={`pre-bets-${season.id}`}
          checked={preBetsOpen}
          onCheckedChange={handlePreBets}
          disabled={loading === 'prebets'}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor={`betting-${season.id}`} className="cursor-pointer">Round betting open</Label>
        <Switch
          id={`betting-${season.id}`}
          checked={bettingOpen}
          onCheckedChange={handleBetting}
          disabled={loading === 'betting'}
        />
      </div>
      {nextStatus && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Advance to <span className="font-medium capitalize">{nextStatus.replace('_', ' ')}</span>
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAdvance}
            disabled={loading === 'advance'}
          >
            Advance
          </Button>
        </div>
      )}
    </div>
  )
}
