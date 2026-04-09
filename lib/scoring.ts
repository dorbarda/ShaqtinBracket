import type { Season, Matchup, Pick, PreBet } from '@/types/database.types'

type RoundNumber = 1 | 2 | 3 | 4

export function getPointsForRound(
  season: Season,
  round: RoundNumber
): { winner: number; exact: number } {
  const map: Record<RoundNumber, { winner: number; exact: number }> = {
    1: { winner: season.points_r1_winner,     exact: season.points_r1_exact },
    2: { winner: season.points_semi_winner,   exact: season.points_semi_exact },
    3: { winner: season.points_conf_winner,   exact: season.points_conf_exact },
    4: { winner: season.points_finals_winner, exact: season.points_finals_exact },
  }
  return map[round]
}

export function calculatePickResult(
  pick: Pick,
  matchup: Matchup,
  season: Season
): { is_winner_correct: boolean; is_exact_correct: boolean; points_earned: number } {
  const isWinnerCorrect = pick.picked_winner_id === matchup.actual_winner_id

  if (!isWinnerCorrect) {
    return { is_winner_correct: false, is_exact_correct: false, points_earned: 0 }
  }

  const { winner, exact } = getPointsForRound(season, matchup.round as RoundNumber)

  const actualWinnerScore =
    matchup.actual_winner_id === matchup.team1_id
      ? matchup.actual_score_team1!
      : matchup.actual_score_team2!
  const actualLoserScore =
    matchup.actual_winner_id === matchup.team1_id
      ? matchup.actual_score_team2!
      : matchup.actual_score_team1!

  const isExactCorrect =
    pick.picked_score_winner === actualWinnerScore &&
    pick.picked_score_loser === actualLoserScore

  return {
    is_winner_correct: true,
    is_exact_correct: isExactCorrect,
    points_earned: winner + (isExactCorrect ? exact : 0),
  }
}

export function calculatePreBetResult(
  preBet: PreBet,
  completedMatchup: Matchup,
  season: Season
): Partial<PreBet> {
  const updates: Partial<PreBet> = {}

  if (completedMatchup.round === 3) {
    if (completedMatchup.conference === 'East') {
      updates.east_correct = preBet.east_winner_id === completedMatchup.actual_winner_id
    }
    if (completedMatchup.conference === 'West') {
      updates.west_correct = preBet.west_winner_id === completedMatchup.actual_winner_id
    }
  }

  if (completedMatchup.round === 4) {
    updates.finals_correct = preBet.finals_winner_id === completedMatchup.actual_winner_id
  }

  const eastPts   = ((updates.east_correct   ?? preBet.east_correct)   ? season.points_pre_conf_winner   : 0) ?? 0
  const westPts   = ((updates.west_correct   ?? preBet.west_correct)   ? season.points_pre_conf_winner   : 0) ?? 0
  const finalsPts = ((updates.finals_correct ?? preBet.finals_correct) ? season.points_pre_finals_winner : 0) ?? 0
  updates.points_earned = eastPts + westPts + finalsPts

  return updates
}
