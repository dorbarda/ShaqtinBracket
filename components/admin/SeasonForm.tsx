"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSeason, updateSeason } from "@/actions/season"
import type { Season } from "@/types/database.types"

const STATUS_ORDER = ['pre_playoffs', 'round1', 'semifinals', 'conference_finals', 'finals', 'completed'] as const

interface SeasonFormProps {
  season?: Season
}

export function SeasonForm({ season }: SeasonFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const defaultValues = {
    year: season?.year ?? new Date().getFullYear(),
    name: season?.name ?? `NBA Playoffs ${new Date().getFullYear()}`,
    points_r1_winner: season?.points_r1_winner ?? 2,
    points_r1_exact: season?.points_r1_exact ?? 2,
    points_semi_winner: season?.points_semi_winner ?? 3,
    points_semi_exact: season?.points_semi_exact ?? 3,
    points_conf_winner: season?.points_conf_winner ?? 4,
    points_conf_exact: season?.points_conf_exact ?? 4,
    points_finals_winner: season?.points_finals_winner ?? 5,
    points_finals_exact: season?.points_finals_exact ?? 5,
    points_pre_conf_winner: season?.points_pre_conf_winner ?? 7,
    points_pre_finals_winner: season?.points_pre_finals_winner ?? 15,
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    const formData = new FormData(e.currentTarget)
    try {
      if (season) {
        await updateSeason(season.id, formData)
      } else {
        await createSeason(formData)
      }
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  const pointsRows = [
    { label: 'Round 1', winner: 'points_r1_winner', exact: 'points_r1_exact' },
    { label: 'Semifinals', winner: 'points_semi_winner', exact: 'points_semi_exact' },
    { label: 'Conf Finals', winner: 'points_conf_winner', exact: 'points_conf_exact' },
    { label: 'Finals', winner: 'points_finals_winner', exact: 'points_finals_exact' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor={`year-${season?.id}`}>Year</Label>
          <Input id={`year-${season?.id}`} name="year" type="number" defaultValue={defaultValues.year} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`name-${season?.id}`}>Season Name</Label>
          <Input id={`name-${season?.id}`} name="name" defaultValue={defaultValues.name} required />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Points per round</p>
        <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-sm">
          <div className="font-medium text-muted-foreground">Round</div>
          <div className="font-medium text-muted-foreground">Winner pts</div>
          <div className="font-medium text-muted-foreground">+ Exact score</div>
          {pointsRows.map(row => (
            <>
              <div key={row.label} className="flex items-center text-muted-foreground">{row.label}</div>
              <Input
                key={`${row.winner}-${season?.id}`}
                name={row.winner}
                type="number"
                min={0}
                defaultValue={defaultValues[row.winner as keyof typeof defaultValues]}
                className="h-8"
              />
              <Input
                key={`${row.exact}-${season?.id}`}
                name={row.exact}
                type="number"
                min={0}
                defaultValue={defaultValues[row.exact as keyof typeof defaultValues]}
                className="h-8"
              />
            </>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor={`pre_conf-${season?.id}`}>Pre-bet: Conf winner pts</Label>
          <Input
            id={`pre_conf-${season?.id}`}
            name="points_pre_conf_winner"
            type="number"
            min={0}
            defaultValue={defaultValues.points_pre_conf_winner}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`pre_finals-${season?.id}`}>Pre-bet: Finals winner pts</Label>
          <Input
            id={`pre_finals-${season?.id}`}
            name="points_pre_finals_winner"
            type="number"
            min={0}
            defaultValue={defaultValues.points_pre_finals_winner}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Saving..." : season ? "Update season" : "Create season"}
        </Button>
        {success && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </form>
  )
}
