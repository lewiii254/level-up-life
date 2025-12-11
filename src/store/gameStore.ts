import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export type ActivityType = 'coding' | 'study' | 'self_improvement';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  level: number;
  total_xp: number;
  avatar_url: string | null;
}

interface Streak {
  coding_streak: number;
  study_streak: number;
  self_streak: number;
  last_coding_date: string | null;
  last_study_date: string | null;
  last_self_date: string | null;
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
  badges: Badge[];
  userBadges: UserBadge[];
  activities: Activity[];
  isLoading: boolean;
  
  // Actions
  setProfile: (profile: Profile | null) => void;
  setStreaks: (streaks: Streak | null) => void;
  setMissions: (missions: Mission[]) => void;
  setBadges: (badges: Badge[]) => void;
  setUserBadges: (userBadges: UserBadge[]) => void;
  setActivities: (activities: Activity[]) => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  getXpForNextLevel: () => number;
  getXpProgress: () => number;
  
  // Database actions
  fetchUserData: (userId: string) => Promise<void>;
  logActivity: (type: ActivityType, minutes: number) => Promise<void>;
  updateMissionProgress: (missionId: string, minutes: number) => Promise<void>;
  generateDailyMissions: () => Promise<void>;
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
  badges: [],
  userBadges: [],
  activities: [],
  isLoading: false,

  setProfile: (profile) => set({ profile }),
  setStreaks: (streaks) => set({ streaks }),
  setMissions: (missions) => set({ missions }),
  setBadges: (badges) => set({ badges }),
  setUserBadges: (userBadges) => set({ userBadges }),
  setActivities: (activities) => set({ activities }),
  setLoading: (isLoading) => set({ isLoading }),

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

      // Update profile XP and check for level up
      const newTotalXp = profile.total_xp + xp;
      let newLevel = profile.level;
      
      while (newTotalXp >= getXpRequiredForLevel(newLevel + 1)) {
        newLevel++;
      }

      await supabase
        .from('profiles')
        .update({ total_xp: newTotalXp, level: newLevel })
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
}));
