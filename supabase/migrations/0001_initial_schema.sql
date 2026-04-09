-- ================================================================
-- 0001_initial_schema.sql
-- ShaqtinBracket2026 — full schema + RLS
-- Safe to re-run (idempotent)
-- ================================================================

-- ================================================================
-- ENUMS
-- ================================================================
DO $$ BEGIN
  CREATE TYPE season_status AS ENUM (
    'pre_playoffs', 'round1', 'semifinals', 'conference_finals', 'finals', 'completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE matchup_status AS ENUM (
    'upcoming', 'betting_open', 'locked', 'completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ================================================================
-- user_profiles
-- ================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role         user_role NOT NULL DEFAULT 'user',
  avatar_url   TEXT
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins full access on profiles" ON user_profiles;

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins full access on profiles"
  ON user_profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin')
  );

-- ================================================================
-- seasons
-- ================================================================
CREATE TABLE IF NOT EXISTS seasons (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year                      INT NOT NULL,
  name                      TEXT NOT NULL,
  status                    season_status NOT NULL DEFAULT 'pre_playoffs',
  pre_bets_open             BOOLEAN NOT NULL DEFAULT false,
  betting_open              BOOLEAN NOT NULL DEFAULT false,
  points_r1_winner          INT NOT NULL DEFAULT 2,
  points_r1_exact           INT NOT NULL DEFAULT 2,
  points_semi_winner        INT NOT NULL DEFAULT 3,
  points_semi_exact         INT NOT NULL DEFAULT 3,
  points_conf_winner        INT NOT NULL DEFAULT 4,
  points_conf_exact         INT NOT NULL DEFAULT 4,
  points_finals_winner      INT NOT NULL DEFAULT 5,
  points_finals_exact       INT NOT NULL DEFAULT 5,
  points_pre_conf_winner    INT NOT NULL DEFAULT 7,
  points_pre_finals_winner  INT NOT NULL DEFAULT 15,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read seasons" ON seasons;
DROP POLICY IF EXISTS "Admins can write seasons" ON seasons;

CREATE POLICY "Anyone can read seasons"
  ON seasons FOR SELECT USING (true);

CREATE POLICY "Admins can write seasons"
  ON seasons FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin')
  );

-- ================================================================
-- teams
-- ================================================================
CREATE TABLE IF NOT EXISTS teams (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id    UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  conference   TEXT NOT NULL CHECK (conference IN ('East', 'West')),
  seed         INT NOT NULL CHECK (seed BETWEEN 1 AND 8),
  color        TEXT NOT NULL DEFAULT '#1a1a1a',
  logo_url     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (season_id, conference, seed)
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read teams" ON teams;
DROP POLICY IF EXISTS "Admins can write teams" ON teams;

CREATE POLICY "Anyone can read teams"
  ON teams FOR SELECT USING (true);

CREATE POLICY "Admins can write teams"
  ON teams FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin')
  );

-- ================================================================
-- matchups
-- ================================================================
CREATE TABLE IF NOT EXISTS matchups (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id           UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  round               INT NOT NULL CHECK (round BETWEEN 1 AND 4),
  conference          TEXT NOT NULL CHECK (conference IN ('East', 'West', 'Finals')),
  team1_id            UUID REFERENCES teams(id),
  team1_name          TEXT NOT NULL,
  team2_id            UUID REFERENCES teams(id),
  team2_name          TEXT NOT NULL,
  actual_winner_id    UUID REFERENCES teams(id),
  actual_score_team1  INT,
  actual_score_team2  INT,
  status              matchup_status NOT NULL DEFAULT 'upcoming',
  display_order       INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE matchups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read matchups" ON matchups;
DROP POLICY IF EXISTS "Admins can write matchups" ON matchups;

CREATE POLICY "Anyone can read matchups"
  ON matchups FOR SELECT USING (true);

CREATE POLICY "Admins can write matchups"
  ON matchups FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin')
  );

-- ================================================================
-- picks
-- ================================================================
CREATE TABLE IF NOT EXISTS picks (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matchup_id           UUID NOT NULL REFERENCES matchups(id) ON DELETE CASCADE,
  season_id            UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  picked_winner_id     UUID NOT NULL REFERENCES teams(id),
  picked_winner_name   TEXT NOT NULL,
  picked_score_winner  INT NOT NULL DEFAULT 4 CHECK (picked_score_winner = 4),
  picked_score_loser   INT NOT NULL CHECK (picked_score_loser BETWEEN 0 AND 3),
  points_earned        INT NOT NULL DEFAULT 0,
  is_winner_correct    BOOLEAN,
  is_exact_correct     BOOLEAN,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, matchup_id)
);

ALTER TABLE picks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own picks" ON picks;
DROP POLICY IF EXISTS "Admins can read all picks" ON picks;
DROP POLICY IF EXISTS "Users can insert own picks when betting open" ON picks;
DROP POLICY IF EXISTS "Users can update own picks when betting open" ON picks;
DROP POLICY IF EXISTS "Admins full access on picks" ON picks;

CREATE POLICY "Users can read their own picks"
  ON picks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all picks"
  ON picks FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin'));

CREATE POLICY "Users can insert own picks when betting open"
  ON picks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM matchups m WHERE m.id = matchup_id AND m.status = 'betting_open'
    )
  );

CREATE POLICY "Users can update own picks when betting open"
  ON picks FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM matchups m WHERE m.id = matchup_id AND m.status = 'betting_open'
    )
  );

CREATE POLICY "Admins full access on picks"
  ON picks FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin'));

-- ================================================================
-- pre_bets
-- ================================================================
CREATE TABLE IF NOT EXISTS pre_bets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id           UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  east_winner_id      UUID REFERENCES teams(id),
  east_winner_name    TEXT,
  west_winner_id      UUID REFERENCES teams(id),
  west_winner_name    TEXT,
  finals_winner_id    UUID REFERENCES teams(id),
  finals_winner_name  TEXT,
  east_correct        BOOLEAN,
  west_correct        BOOLEAN,
  finals_correct      BOOLEAN,
  points_earned       INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_id)
);

ALTER TABLE pre_bets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own pre_bets" ON pre_bets;
DROP POLICY IF EXISTS "Admins can read all pre_bets" ON pre_bets;
DROP POLICY IF EXISTS "Users can insert own pre_bets when open" ON pre_bets;
DROP POLICY IF EXISTS "Users can update own pre_bets when open" ON pre_bets;
DROP POLICY IF EXISTS "Admins full access on pre_bets" ON pre_bets;

CREATE POLICY "Users can read their own pre_bets"
  ON pre_bets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all pre_bets"
  ON pre_bets FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin'));

CREATE POLICY "Users can insert own pre_bets when open"
  ON pre_bets FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM seasons s WHERE s.id = season_id AND s.pre_bets_open = true)
  );

CREATE POLICY "Users can update own pre_bets when open"
  ON pre_bets FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM seasons s WHERE s.id = season_id AND s.pre_bets_open = true)
  );

CREATE POLICY "Admins full access on pre_bets"
  ON pre_bets FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin'));

-- ================================================================
-- INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_teams_season ON teams(season_id);
CREATE INDEX IF NOT EXISTS idx_matchups_season_round ON matchups(season_id, round);
CREATE INDEX IF NOT EXISTS idx_picks_user ON picks(user_id);
CREATE INDEX IF NOT EXISTS idx_picks_matchup ON picks(matchup_id);
CREATE INDEX IF NOT EXISTS idx_picks_season ON picks(season_id);
CREATE INDEX IF NOT EXISTS idx_pre_bets_user_season ON pre_bets(user_id, season_id);

-- ================================================================
-- updated_at triggers
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS picks_updated_at ON picks;
CREATE TRIGGER picks_updated_at
  BEFORE UPDATE ON picks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS pre_bets_updated_at ON pre_bets;
CREATE TRIGGER pre_bets_updated_at
  BEFORE UPDATE ON pre_bets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- Auto-create user_profile on signup
-- ================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================================================
-- NOTE: After running this migration, manually set the first
-- admin user's role in the Supabase dashboard or via:
--   UPDATE user_profiles SET role = 'admin' WHERE id = '<your-user-id>';
-- ================================================================
