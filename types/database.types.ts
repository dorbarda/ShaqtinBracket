export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SeasonStatus = 'pre_playoffs' | 'round1' | 'semifinals' | 'conference_finals' | 'finals' | 'completed'
export type MatchupStatus = 'upcoming' | 'betting_open' | 'locked' | 'completed'
export type Conference = 'East' | 'West' | 'Finals'
export type UserRole = 'admin' | 'user'

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          display_name: string
          role: UserRole
          avatar_url: string | null
        }
        Insert: {
          id: string
          display_name: string
          role?: UserRole
          avatar_url?: string | null
        }
        Update: {
          id?: string
          display_name?: string
          role?: UserRole
          avatar_url?: string | null
        }
        Relationships: []
      }
      seasons: {
        Row: {
          id: string
          year: number
          name: string
          status: SeasonStatus
          pre_bets_open: boolean
          betting_open: boolean
          points_r1_winner: number
          points_r1_exact: number
          points_semi_winner: number
          points_semi_exact: number
          points_conf_winner: number
          points_conf_exact: number
          points_finals_winner: number
          points_finals_exact: number
          points_pre_conf_winner: number
          points_pre_finals_winner: number
          created_at: string
        }
        Insert: {
          id?: string
          year: number
          name: string
          status?: SeasonStatus
          pre_bets_open?: boolean
          betting_open?: boolean
          points_r1_winner?: number
          points_r1_exact?: number
          points_semi_winner?: number
          points_semi_exact?: number
          points_conf_winner?: number
          points_conf_exact?: number
          points_finals_winner?: number
          points_finals_exact?: number
          points_pre_conf_winner?: number
          points_pre_finals_winner?: number
          created_at?: string
        }
        Update: {
          id?: string
          year?: number
          name?: string
          status?: SeasonStatus
          pre_bets_open?: boolean
          betting_open?: boolean
          points_r1_winner?: number
          points_r1_exact?: number
          points_semi_winner?: number
          points_semi_exact?: number
          points_conf_winner?: number
          points_conf_exact?: number
          points_finals_winner?: number
          points_finals_exact?: number
          points_pre_conf_winner?: number
          points_pre_finals_winner?: number
          created_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          season_id: string
          name: string
          abbreviation: string
          conference: 'East' | 'West'
          seed: number
          color: string
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          season_id: string
          name: string
          abbreviation: string
          conference: 'East' | 'West'
          seed: number
          color?: string
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          season_id?: string
          name?: string
          abbreviation?: string
          conference?: 'East' | 'West'
          seed?: number
          color?: string
          logo_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          }
        ]
      }
      matchups: {
        Row: {
          id: string
          season_id: string
          round: number
          conference: Conference
          team1_id: string | null
          team1_name: string
          team2_id: string | null
          team2_name: string
          actual_winner_id: string | null
          actual_score_team1: number | null
          actual_score_team2: number | null
          status: MatchupStatus
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          season_id: string
          round: number
          conference: Conference
          team1_id?: string | null
          team1_name: string
          team2_id?: string | null
          team2_name: string
          actual_winner_id?: string | null
          actual_score_team1?: number | null
          actual_score_team2?: number | null
          status?: MatchupStatus
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          season_id?: string
          round?: number
          conference?: Conference
          team1_id?: string | null
          team1_name?: string
          team2_id?: string | null
          team2_name?: string
          actual_winner_id?: string | null
          actual_score_team1?: number | null
          actual_score_team2?: number | null
          status?: MatchupStatus
          display_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matchups_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          }
        ]
      }
      picks: {
        Row: {
          id: string
          user_id: string
          matchup_id: string
          season_id: string
          picked_winner_id: string
          picked_winner_name: string
          picked_score_winner: number
          picked_score_loser: number
          points_earned: number
          is_winner_correct: boolean | null
          is_exact_correct: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          matchup_id: string
          season_id: string
          picked_winner_id: string
          picked_winner_name: string
          picked_score_winner?: number
          picked_score_loser: number
          points_earned?: number
          is_winner_correct?: boolean | null
          is_exact_correct?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          matchup_id?: string
          season_id?: string
          picked_winner_id?: string
          picked_winner_name?: string
          picked_score_winner?: number
          picked_score_loser?: number
          points_earned?: number
          is_winner_correct?: boolean | null
          is_exact_correct?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "picks_matchup_id_fkey"
            columns: ["matchup_id"]
            isOneToOne: false
            referencedRelation: "matchups"
            referencedColumns: ["id"]
          }
        ]
      }
      pre_bets: {
        Row: {
          id: string
          user_id: string
          season_id: string
          east_winner_id: string | null
          east_winner_name: string | null
          west_winner_id: string | null
          west_winner_name: string | null
          finals_winner_id: string | null
          finals_winner_name: string | null
          east_correct: boolean | null
          west_correct: boolean | null
          finals_correct: boolean | null
          points_earned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          season_id: string
          east_winner_id?: string | null
          east_winner_name?: string | null
          west_winner_id?: string | null
          west_winner_name?: string | null
          finals_winner_id?: string | null
          finals_winner_name?: string | null
          east_correct?: boolean | null
          west_correct?: boolean | null
          finals_correct?: boolean | null
          points_earned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          season_id?: string
          east_winner_id?: string | null
          east_winner_name?: string | null
          west_winner_id?: string | null
          west_winner_name?: string | null
          finals_winner_id?: string | null
          finals_winner_name?: string | null
          east_correct?: boolean | null
          west_correct?: boolean | null
          finals_correct?: boolean | null
          points_earned?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pre_bets_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      leaderboard: {
        Row: {
          profile_id: string
          display_name: string
          avatar_url: string | null
          total_points: number
          correct_picks: number
          exact_picks: number
          pre_bet_points: number
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: {
      season_status: SeasonStatus
      matchup_status: MatchupStatus
      user_role: UserRole
    }
    CompositeTypes: Record<string, never>
  }
}

export type Season = Database['public']['Tables']['seasons']['Row']
export type Team = Database['public']['Tables']['teams']['Row']
export type Matchup = Database['public']['Tables']['matchups']['Row']
export type Pick = Database['public']['Tables']['picks']['Row']
export type PreBet = Database['public']['Tables']['pre_bets']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
