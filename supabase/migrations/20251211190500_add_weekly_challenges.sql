-- Create weekly_challenges table
CREATE TABLE public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type activity_type NOT NULL,
  target_minutes INTEGER NOT NULL,
  progress_minutes INTEGER DEFAULT 0,
  bonus_xp INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX idx_weekly_challenges_user_week ON public.weekly_challenges(user_id, week_start);

-- Enable RLS
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

-- Weekly challenges policies
CREATE POLICY "Users can view own weekly challenges" ON public.weekly_challenges 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly challenges" ON public.weekly_challenges 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly challenges" ON public.weekly_challenges 
  FOR UPDATE USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.weekly_challenges IS 'Weekly challenges for users with bonus XP rewards';
