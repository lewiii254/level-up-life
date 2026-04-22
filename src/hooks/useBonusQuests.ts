import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BonusQuest {
  id: string;
  date: string;
  title: string;
  description: string | null;
  type: 'coding' | 'study' | 'self_improvement';
  target_minutes: number;
  progress_minutes: number;
  bonus_xp: number;
  rarity: 'common' | 'rare' | 'epic';
  completed: boolean;
  claimed: boolean;
}

const QUEST_POOL: Array<Omit<BonusQuest, 'id' | 'date' | 'progress_minutes' | 'completed' | 'claimed'>> = [
  { title: '⚡ Lightning Round', description: 'Code for 15 minutes in one burst', type: 'coding', target_minutes: 15, bonus_xp: 40, rarity: 'common' },
  { title: '🎯 Sharp Focus', description: 'Study for 25 minutes', type: 'study', target_minutes: 25, bonus_xp: 50, rarity: 'common' },
  { title: '🧘 Mindful Moment', description: '10 minutes of self-improvement', type: 'self_improvement', target_minutes: 10, bonus_xp: 30, rarity: 'common' },
  { title: '🔥 Code Marathon', description: 'Code for 60 minutes today', type: 'coding', target_minutes: 60, bonus_xp: 120, rarity: 'rare' },
  { title: '📚 Deep Dive', description: 'Study for 45 minutes today', type: 'study', target_minutes: 45, bonus_xp: 100, rarity: 'rare' },
  { title: '💎 Legendary Grind', description: 'Code for 90 minutes — pure dedication', type: 'coding', target_minutes: 90, bonus_xp: 250, rarity: 'epic' },
  { title: '🌟 Scholar Trial', description: 'Study for 75 minutes — epic challenge', type: 'study', target_minutes: 75, bonus_xp: 220, rarity: 'epic' },
  { title: '🦾 Self Mastery', description: '40 minutes of self-improvement', type: 'self_improvement', target_minutes: 40, bonus_xp: 150, rarity: 'rare' },
];

const pickRandomQuest = () => {
  // Weighted: 60% common, 30% rare, 10% epic
  const r = Math.random();
  const rarity: 'common' | 'rare' | 'epic' = r < 0.6 ? 'common' : r < 0.9 ? 'rare' : 'epic';
  const pool = QUEST_POOL.filter(q => q.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
};

export function useBonusQuests(userId: string | undefined) {
  const [quests, setQuests] = useState<BonusQuest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuests = useCallback(async () => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('bonus_quests')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .order('created_at', { ascending: true });
    setQuests((data as BonusQuest[]) ?? []);
    setLoading(false);
  }, [userId]);

  const generateIfNeeded = useCallback(async () => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('bonus_quests')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today);
    if (existing && existing.length > 0) {
      await fetchQuests();
      return;
    }
    // Generate 1-2 random quests for the day
    const count = Math.random() < 0.4 ? 2 : 1;
    const picks = Array.from({ length: count }, () => pickRandomQuest());
    for (const q of picks) {
      await supabase.from('bonus_quests').insert({
        user_id: userId,
        date: today,
        title: q.title,
        description: q.description,
        type: q.type,
        target_minutes: q.target_minutes,
        bonus_xp: q.bonus_xp,
        rarity: q.rarity,
      });
    }
    await fetchQuests();
  }, [userId, fetchQuests]);

  useEffect(() => {
    if (userId) {
      generateIfNeeded();
    }
  }, [userId, generateIfNeeded]);

  const claimQuest = async (questId: string) => {
    if (!userId) return null;
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return null;

    await supabase
      .from('bonus_quests')
      .update({ claimed: true, claimed_at: new Date().toISOString() })
      .eq('id', questId);

    // Award XP to profile
    const { data: profile } = await supabase.from('profiles').select('total_xp, level').eq('id', userId).single();
    if (profile) {
      const newXp = (profile.total_xp ?? 0) + quest.bonus_xp;
      let newLevel = profile.level ?? 1;
      const xpForLevel = (l: number) => Math.floor(100 * Math.pow(1.5, l - 1));
      while (newXp >= xpForLevel(newLevel + 1)) newLevel++;
      await supabase.from('profiles').update({ total_xp: newXp, level: newLevel }).eq('id', userId);
    }

    await fetchQuests();
    return quest.bonus_xp;
  };

  return { quests, loading, claimQuest, refetch: fetchQuests };
}
