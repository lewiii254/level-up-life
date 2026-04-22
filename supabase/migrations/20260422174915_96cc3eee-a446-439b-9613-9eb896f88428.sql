
-- Add avatar customization + skill points to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '🧙',
  ADD COLUMN IF NOT EXISTS avatar_color TEXT DEFAULT 'cyan',
  ADD COLUMN IF NOT EXISTS avatar_accessory TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS skill_points INTEGER NOT NULL DEFAULT 0;

-- Bonus quests (random daily extras)
CREATE TABLE IF NOT EXISTS public.bonus_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  description TEXT,
  type public.activity_type NOT NULL,
  target_minutes INTEGER NOT NULL,
  progress_minutes INTEGER NOT NULL DEFAULT 0,
  bonus_xp INTEGER NOT NULL DEFAULT 50,
  rarity TEXT NOT NULL DEFAULT 'common',
  completed BOOLEAN NOT NULL DEFAULT false,
  claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bonus_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bonus quests" ON public.bonus_quests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bonus quests" ON public.bonus_quests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bonus quests" ON public.bonus_quests
  FOR UPDATE USING (auth.uid() = user_id);

-- Skill tree unlocks
CREATE TABLE IF NOT EXISTS public.skill_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

ALTER TABLE public.skill_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own skill unlocks" ON public.skill_unlocks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own skill unlocks" ON public.skill_unlocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
