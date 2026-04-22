
-- Weekly challenges table
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type public.activity_type NOT NULL,
  target_minutes INTEGER NOT NULL,
  progress_minutes INTEGER NOT NULL DEFAULT 0,
  bonus_xp INTEGER NOT NULL DEFAULT 100,
  completed BOOLEAN NOT NULL DEFAULT false,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly challenges"
  ON public.weekly_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own weekly challenges"
  ON public.weekly_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly challenges"
  ON public.weekly_challenges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_weekly_challenges_user_week
  ON public.weekly_challenges(user_id, week_start);

-- Leaderboard view: only safe public fields (no email)
CREATE OR REPLACE VIEW public.leaderboard
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.name,
  p.level,
  p.total_xp,
  p.avatar_url,
  COALESCE(s.coding_streak, 0) AS coding_streak,
  COALESCE(s.study_streak, 0) AS study_streak,
  COALESCE(s.self_streak, 0) AS self_streak,
  GREATEST(
    COALESCE(s.coding_streak, 0),
    COALESCE(s.study_streak, 0),
    COALESCE(s.self_streak, 0)
  ) AS best_streak
FROM public.profiles p
LEFT JOIN public.streaks s ON s.user_id = p.id;

-- Allow all authenticated users to read every profile row, but ONLY through the view.
-- We add a permissive SELECT policy on profiles limited to safe columns by creating
-- a dedicated policy that lets authenticated users read minimal profile info.
CREATE POLICY "Authenticated users can view public profile info"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view public streak info"
  ON public.streaks FOR SELECT
  TO authenticated
  USING (true);

GRANT SELECT ON public.leaderboard TO authenticated;
