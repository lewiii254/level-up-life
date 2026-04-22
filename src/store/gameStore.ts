import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export type ActivityType = 'coding' | 'study' | 'self_improvement';

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  target_minutes: number;
  progress_minutes: number;
  bonus_xp: number;
  completed: boolean;
  claimed: boolean;
  claimed_at: string | null;
  week_start: string;
  week_end: string;
}

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  level: number;
  total_xp: number;
  avatar_url: string | null;
  avatar_emoji?: string | null;
  avatar_color?: string | null;
  avatar_accessory?: string | null;
  skill_points?: number;
}

interface Streak {
  coding_streak: number;
  study_streak: number;
  self_streak: number;
  weekly_streak: number;
  last_coding_date: string | null;
  last_study_date: string | null;
  last_self_date: string | null;
  last_weekly_complete: string | null;
}

interface Mission {
  id: string;
  type: ActivityType;
  target_minutes: number;
  completed: boolean;
  progress_minutes: number;
  date: string;
}

interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  xp_required: number;
  streak_required: number;
  badge_type: string;
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

interface Activity {
  id: string;
  type: ActivityType;
  minutes: number;
  xp: number;
  created_at: string;
}

interface GameState {
  profile: Profile | null;
  streaks: Streak | null;
  missions: Mission[];
  weeklyChallenges: WeeklyChallenge[];
  badges: Badge[];
  userBadges: UserBadge[];
  activities: Activity[];
  isLoading: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  
  // Actions
  setProfile: (profile: Profile | null) => void;
  setStreaks: (streaks: Streak | null) => void;
  setMissions: (missions: Mission[]) => void;
  setWeeklyChallenges: (challenges: WeeklyChallenge[]) => void;
  setBadges: (badges: Badge[]) => void;
  setUserBadges: (userBadges: UserBadge[]) => void;
  setActivities: (activities: Activity[]) => void;
  setLoading: (loading: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  
  // Computed
  getXpForNextLevel: () => number;
  getXpProgress: () => number;
  
  // Database actions
  fetchUserData: (userId: string) => Promise<void>;
  logActivity: (type: ActivityType, minutes: number) => Promise<void>;
  updateMissionProgress: (missionId: string, minutes: number) => Promise<void>;
  generateDailyMissions: () => Promise<void>;
  generateWeeklyChallenges: () => Promise<void>;
  updateWeeklyChallengeProgress: (challengeId: string, minutes: number) => Promise<void>;
  claimWeeklyChallenge: (challengeId: string) => Promise<{ awarded: number; multiplier: number; weeklyStreak: number } | null>;
  getWeeklyBonusMultiplier: () => number;
}

// XP required for each level (exponential growth)
const getXpRequiredForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

const getXpForActivity = (type: ActivityType, minutes: number): number => {
  switch (type) {
    case 'coding':
      return minutes;
    case 'study':
      return minutes;
    case 'self_improvement':
      return Math.floor(minutes * 0.5);
    default:
      return 0;
  }
};

export const useGameStore = create<GameState>((set, get) => ({
  profile: null,
  streaks: null,
  missions: [],
  weeklyChallenges: [],
  badges: [],
  userBadges: [],
  activities: [],
  isLoading: false,
  soundEnabled: typeof window !== 'undefined' ? localStorage.getItem('soundEnabled') !== 'false' : true,
  hapticEnabled: typeof window !== 'undefined' ? localStorage.getItem('hapticEnabled') !== 'false' : true,

  setProfile: (profile) => set({ profile }),
  setStreaks: (streaks) => set({ streaks }),
  setMissions: (missions) => set({ missions }),
  setWeeklyChallenges: (weeklyChallenges) => set({ weeklyChallenges }),
  setBadges: (badges) => set({ badges }),
  setUserBadges: (userBadges) => set({ userBadges }),
  setActivities: (activities) => set({ activities }),
  setLoading: (isLoading) => set({ isLoading }),
  setSoundEnabled: (soundEnabled) => {
    if (typeof window !== 'undefined') localStorage.setItem('soundEnabled', String(soundEnabled));
    set({ soundEnabled });
  },
  setHapticEnabled: (hapticEnabled) => {
    if (typeof window !== 'undefined') localStorage.setItem('hapticEnabled', String(hapticEnabled));
    set({ hapticEnabled });
  },

  getXpForNextLevel: () => {
    const profile = get().profile;
    if (!profile) return 100;
    return getXpRequiredForLevel(profile.level + 1);
  },

  getXpProgress: () => {
    const profile = get().profile;
    if (!profile) return 0;
    const currentLevelXp = getXpRequiredForLevel(profile.level);
    const nextLevelXp = getXpRequiredForLevel(profile.level + 1);
    const xpInCurrentLevel = profile.total_xp - currentLevelXp;
    const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
    return Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));
  },

  fetchUserData: async (userId: string) => {
    set({ isLoading: true });
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profile) {
        set({ profile: profile as Profile });
      }

      // Fetch streaks
      const { data: streaks } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (streaks) {
        set({ streaks: streaks as unknown as Streak });
      }

      // Fetch today's missions
      const today = new Date().toISOString().split('T')[0];
      const { data: missions } = await supabase
        .from('missions')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today);
      
      if (missions) {
        set({ missions: missions as unknown as Mission[] });
      }

      // Fetch current week's challenges
      const todayDate = new Date();
      const dayOfWeek = todayDate.getDay();
      const diff = todayDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(todayDate.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      const weekStart = monday.toISOString().split('T')[0];

      const { data: weeklyChallenges } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start', weekStart);
      
      if (weeklyChallenges) {
        set({ weeklyChallenges: weeklyChallenges as unknown as WeeklyChallenge[] });
      }

      // Fetch all badges
      const { data: badges } = await supabase
        .from('badges')
        .select('*');
      
      if (badges) {
        set({ badges: badges as Badge[] });
      }

      // Fetch user's earned badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', userId);
      
      if (userBadges) {
        set({ userBadges: userBadges as UserBadge[] });
      }

      // Fetch recent activities (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });
      
      if (activities) {
        set({ activities: activities as unknown as Activity[] });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  logActivity: async (type: ActivityType, minutes: number) => {
    const profile = get().profile;
    if (!profile) return;

    const xp = getXpForActivity(type, minutes);
    const today = new Date().toISOString().split('T')[0];

    try {
      // Insert activity
      await supabase
        .from('activities')
        .insert({
          user_id: profile.id,
          type,
          minutes,
          xp,
        });

      // Update weekly challenge progress (no XP awarded here — must be claimed)
      const weeklyChallenges = get().weeklyChallenges;
      const relevantChallenge = weeklyChallenges.find(c => c.type === type && !c.completed);
      
      if (relevantChallenge) {
        const newProgress = relevantChallenge.progress_minutes + minutes;
        const isCompleted = newProgress >= relevantChallenge.target_minutes;
        
        await supabase
          .from('weekly_challenges')
          .update({ 
            progress_minutes: newProgress,
            completed: isCompleted
          })
          .eq('id', relevantChallenge.id);
      }

      // Update profile XP and check for level up
      const newTotalXp = profile.total_xp + xp;
      let newLevel = profile.level;
      
      while (newTotalXp >= getXpRequiredForLevel(newLevel + 1)) {
        newLevel++;
      }

      // Award 1 skill point per level gained
      const levelsGained = newLevel - profile.level;
      const currentSkillPoints = profile.skill_points ?? 0;
      const newSkillPoints = currentSkillPoints + levelsGained;

      await supabase
        .from('profiles')
        .update({ total_xp: newTotalXp, level: newLevel, skill_points: newSkillPoints })
        .eq('id', profile.id);

      // Update streak
      const streaks = get().streaks;
      if (streaks) {
        const streakField = type === 'coding' ? 'coding_streak' : 
                          type === 'study' ? 'study_streak' : 'self_streak';
        const lastDateField = type === 'coding' ? 'last_coding_date' : 
                             type === 'study' ? 'last_study_date' : 'last_self_date';
        const lastDate = type === 'coding' ? streaks.last_coding_date : 
                        type === 'study' ? streaks.last_study_date : streaks.last_self_date;
        const currentStreak = type === 'coding' ? streaks.coding_streak : 
                             type === 'study' ? streaks.study_streak : streaks.self_streak;

        let newStreak = currentStreak;
        if (lastDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (lastDate === yesterdayStr) {
            newStreak = currentStreak + 1;
          } else {
            newStreak = 1;
          }
        }

        await supabase
          .from('streaks')
          .update({ 
            [streakField]: newStreak, 
            [lastDateField]: today,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', profile.id);
      }

      // Update mission progress
      const missions = get().missions;
      const relevantMission = missions.find(m => m.type === type && !m.completed && m.date === today);
      if (relevantMission) {
        const newProgress = relevantMission.progress_minutes + minutes;
        const isCompleted = newProgress >= relevantMission.target_minutes;
        
        await supabase
          .from('missions')
          .update({ 
            progress_minutes: newProgress,
            completed: isCompleted
          })
          .eq('id', relevantMission.id);
      }

      // Refresh data
      await get().fetchUserData(profile.id);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  },

  updateMissionProgress: async (missionId: string, minutes: number) => {
    const profile = get().profile;
    const missions = get().missions;
    if (!profile) return;

    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    const newProgress = mission.progress_minutes + minutes;
    const isCompleted = newProgress >= mission.target_minutes;

    try {
      await supabase
        .from('missions')
        .update({ 
          progress_minutes: newProgress,
          completed: isCompleted
        })
        .eq('id', missionId);

      await get().fetchUserData(profile.id);
    } catch (error) {
      console.error('Error updating mission:', error);
    }
  },

  generateDailyMissions: async () => {
    const profile = get().profile;
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Check if missions already exist for today
    const { data: existingMissions } = await supabase
      .from('missions')
      .select('id')
      .eq('user_id', profile.id)
      .eq('date', today);

    if (existingMissions && existingMissions.length > 0) return;

    const dailyMissions = [
      { type: 'coding' as ActivityType, target_minutes: 30 },
      { type: 'study' as ActivityType, target_minutes: 20 },
      { type: 'self_improvement' as ActivityType, target_minutes: 15 },
    ];

    try {
      for (const mission of dailyMissions) {
        await supabase
          .from('missions')
          .insert({
            user_id: profile.id,
            type: mission.type,
            target_minutes: mission.target_minutes,
            date: today,
          });
      }

      await get().fetchUserData(profile.id);
    } catch (error) {
      console.error('Error generating missions:', error);
    }
  },

  generateWeeklyChallenges: async () => {
    const profile = get().profile;
    if (!profile) return;

    // Get current week start (Monday) and end (Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weekStart = monday.toISOString().split('T')[0];
    const weekEnd = sunday.toISOString().split('T')[0];

    // Check if challenges already exist for this week
    const { data: existingChallenges } = await supabase
      .from('weekly_challenges')
      .select('id')
      .eq('user_id', profile.id)
      .eq('week_start', weekStart);

    if (existingChallenges && existingChallenges.length > 0) {
      // Fetch existing challenges
      const { data: challenges } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('user_id', profile.id)
        .eq('week_start', weekStart);
      
      if (challenges) {
        set({ weeklyChallenges: challenges as unknown as WeeklyChallenge[] });
      }
      return;
    }

    // Generate new weekly challenges
    const challenges = [
      {
        title: '🎯 Code Master',
        description: 'Complete 180 minutes of coding this week',
        type: 'coding' as ActivityType,
        target_minutes: 180,
        bonus_xp: 200,
      },
      {
        title: '📚 Knowledge Seeker',
        description: 'Study for 120 minutes this week',
        type: 'study' as ActivityType,
        target_minutes: 120,
        bonus_xp: 150,
      },
      {
        title: '💪 Self Improvement Champion',
        description: 'Dedicate 90 minutes to self-improvement',
        type: 'self_improvement' as ActivityType,
        target_minutes: 90,
        bonus_xp: 100,
      },
    ];

    try {
      for (const challenge of challenges) {
        await supabase
          .from('weekly_challenges')
          .insert({
            user_id: profile.id,
            title: challenge.title,
            description: challenge.description,
            type: challenge.type,
            target_minutes: challenge.target_minutes,
            bonus_xp: challenge.bonus_xp,
            week_start: weekStart,
            week_end: weekEnd,
          });
      }

      // Fetch newly created challenges
      const { data: newChallenges } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('user_id', profile.id)
        .eq('week_start', weekStart);
      
      if (newChallenges) {
        set({ weeklyChallenges: newChallenges as unknown as WeeklyChallenge[] });
      }
    } catch (error) {
      console.error('Error generating weekly challenges:', error);
    }
  },

  updateWeeklyChallengeProgress: async (challengeId: string, minutes: number) => {
    const profile = get().profile;
    const challenges = get().weeklyChallenges;
    if (!profile) return;

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const newProgress = challenge.progress_minutes + minutes;
    const isCompleted = newProgress >= challenge.target_minutes;

    try {
      await supabase
        .from('weekly_challenges')
        .update({ 
          progress_minutes: newProgress,
          completed: isCompleted
        })
        .eq('id', challengeId);

      // Bonus XP is no longer auto-awarded — user must claim via claimWeeklyChallenge.

      await get().fetchUserData(profile.id);
    } catch (error) {
      console.error('Error updating weekly challenge:', error);
    }
  },

  getWeeklyBonusMultiplier: () => {
    const ws = get().streaks?.weekly_streak ?? 0;
    // Stacking: +25% per consecutive completed week, capped at 3x
    return Math.min(3, 1 + ws * 0.25);
  },

  claimWeeklyChallenge: async (challengeId: string) => {
    const profile = get().profile;
    const streaks = get().streaks;
    const challenges = get().weeklyChallenges;
    if (!profile) return null;

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge || !challenge.completed || challenge.claimed) return null;

    // Determine if this claim completes ALL weekly challenges
    const otherChallenges = challenges.filter(c => c.id !== challengeId);
    const allOthersClaimed = otherChallenges.every(c => c.claimed);
    const willCompleteWeek = allOthersClaimed && otherChallenges.every(c => c.completed);

    // Calculate weekly streak bump if this is the final claim
    let newWeeklyStreak = streaks?.weekly_streak ?? 0;
    if (willCompleteWeek) {
      // Check if last_weekly_complete was last week (consecutive)
      const lastWeekly = streaks?.last_weekly_complete ?? null;
      if (lastWeekly) {
        const lastDate = new Date(lastWeekly);
        const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        newWeeklyStreak = diffDays <= 14 ? newWeeklyStreak + 1 : 1;
      } else {
        newWeeklyStreak = 1;
      }
    }

    // Multiplier uses the streak BEFORE this completion bumps it
    const multiplier = get().getWeeklyBonusMultiplier();
    const awarded = Math.floor(challenge.bonus_xp * multiplier);

    try {
      await supabase
        .from('weekly_challenges')
        .update({ claimed: true, claimed_at: new Date().toISOString() })
        .eq('id', challengeId);

      const newTotalXp = profile.total_xp + awarded;
      let newLevel = profile.level;
      while (newTotalXp >= getXpRequiredForLevel(newLevel + 1)) {
        newLevel++;
      }

      await supabase
        .from('profiles')
        .update({ total_xp: newTotalXp, level: newLevel })
        .eq('id', profile.id);

      if (willCompleteWeek && streaks) {
        await supabase
          .from('streaks')
          .update({
            weekly_streak: newWeeklyStreak,
            last_weekly_complete: new Date().toISOString().split('T')[0],
          })
          .eq('user_id', profile.id);
      }

      await get().fetchUserData(profile.id);
      return { awarded, multiplier, weeklyStreak: newWeeklyStreak };
    } catch (error) {
      console.error('Error claiming weekly challenge:', error);
      return null;
    }
  },
}));
