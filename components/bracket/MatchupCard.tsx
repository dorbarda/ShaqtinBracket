import type { BracketMatchup, BracketTeam } from '@/types/bracket'
import { cn } from '@/lib/utils'

function TeamSlot({
  team,
  isWinner,
  isPicked,
  isPickCorrect,
  score,
  compact,
}: {
  team: BracketTeam
  isWinner: boolean
  isPicked: boolean
  isPickCorrect: boolean | null
  score: number | null
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1.5 rounded transition-colors',
        isWinner && 'bg-green-50 dark:bg-green-950',
        !isWinner && score !== null && 'opacity-60',
      )}
      style={{ borderLeft: `3px solid ${team.color}` }}
    >
      <span className="text-xs text-muted-foreground w-4 shrink-0">{team.seed > 0 ? team.seed : ''}</span>
      <span className={cn('text-xs font-medium flex-1 truncate', compact && 'text-[11px]')}>
        {compact ? team.abbreviation : team.name}
      </span>
      {isPicked && (
        <span className={cn(
          'text-[10px] px-1 rounded font-semibold shrink-0',
          isPickCorrect === true && 'bg-green-500 text-white',
          isPickCorrect === false && 'bg-red-400 text-white',
          isPickCorrect === null && 'bg-primary text-primary-foreground',
        )}>
          ✓
        </span>
      )}
      {score !== null && (
        <span className={cn('text-xs font-bold shrink-0', isWinner ? 'text-green-700' : 'text-muted-foreground')}>
          {score}
        </span>
      )}
    </div>
  )
}

export function MatchupCard({
  matchup,
  compact,
}: {
  matchup: BracketMatchup
  compact?: boolean
}) {
  const pick = matchup.userPick
  const isCompleted = matchup.status === 'completed'

  return (
    <div className={cn(
      'border rounded bg-card shadow-sm overflow-hidden',
      compact ? 'w-36' : 'w-44',
    )}>
      <div className={cn(
        'text-[10px] text-center py-0.5 font-medium',
        matchup.status === 'betting_open' ? 'bg-primary text-primary-foreground' :
        matchup.status === 'locked' ? 'bg-yellow-500 text-white' :
        matchup.status === 'completed' ? 'bg-green-600 text-white' :
        'bg-muted text-muted-foreground',
      )}>
        {matchup.status === 'betting_open' ? 'OPEN' :
         matchup.status === 'locked' ? 'LOCKED' :
         matchup.status === 'completed' ? 'FINAL' : 'UPCOMING'}
      </div>
      <div className="divide-y">
        <TeamSlot
          team={matchup.team1}
          isWinner={isCompleted && matchup.actual_winner_id === matchup.team1.id}
          isPicked={pick?.picked_winner_id === matchup.team1.id}
          isPickCorrect={pick?.picked_winner_id === matchup.team1.id ? (pick.is_winner_correct ?? null) : null}
          score={isCompleted ? matchup.actual_score_team1 : null}
          compact={compact}
        />
        <TeamSlot
          team={matchup.team2}
          isWinner={isCompleted && matchup.actual_winner_id === matchup.team2.id}
          isPicked={pick?.picked_winner_id === matchup.team2.id}
          isPickCorrect={pick?.picked_winner_id === matchup.team2.id ? (pick.is_winner_correct ?? null) : null}
          score={isCompleted ? matchup.actual_score_team2 : null}
          compact={compact}
        />
      </div>
      {pick && isCompleted && (
        <div className={cn(
          'text-[10px] text-center py-0.5 font-semibold',
          pick.points_earned > 0 ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground',
        )}>
          {pick.points_earned > 0 ? `+${pick.points_earned} pts${pick.is_exact_correct ? ' ★' : ''}` : '0 pts'}
        </div>
      )}
    </div>
  )
}
