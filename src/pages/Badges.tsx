import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/store/gameStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Lock, Check } from 'lucide-react';

export default function Badges() {
  const navigate = useNavigate();
  const { profile, badges, userBadges, isLoading, fetchUserData } = useGameStore();

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      await fetchUserData(session.user.id);
    };
    initData();
  }, [navigate, fetchUserData]);

  const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
  const earnedCount = earnedBadgeIds.length;
  const totalCount = badges.length;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Badge Collection
          </h1>
          <p className="text-muted-foreground mt-1">Unlock badges by achieving milestones</p>
        </div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-card-glow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Collection Progress</h3>
            <span className="font-display text-2xl font-bold">
              <span className="text-yellow-500">{earnedCount}</span>
              <span className="text-muted-foreground">/{totalCount}</span>
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${(earnedCount / Math.max(totalCount, 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Badge Categories */}
        {['streak', 'xp', 'coding', 'study', 'self', 'milestone', 'special', 'level'].map((category, catIndex) => {
          const categoryBadges = badges.filter(b => b.badge_type === category);
          if (categoryBadges.length === 0) return null;

          const categoryLabels: Record<string, string> = {
            streak: '🔥 Streak Badges',
            xp: '⚡ XP Badges',
            coding: '💻 Coding Badges',
            study: '📚 Study Badges',
            self: '🧘 Self-Improvement Badges',
            milestone: '🎯 Milestone Badges',
            special: '🦅 Special Badges',
            level: '👑 Level Badges',
          };

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <h3 className="font-display text-lg font-semibold mb-4">
                {categoryLabels[category] || category}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categoryBadges.map((badge, index) => {
                  const isEarned = earnedBadgeIds.includes(badge.id);
                  
                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`game-card p-6 text-center transition-all ${
                        isEarned 
                          ? 'border-yellow-500/50 bg-yellow-500/5' 
                          : 'opacity-60 grayscale'
                      }`}
                    >
                      {/* Badge Icon */}
                      <div className="relative inline-block mb-3">
                        <span className="text-4xl">{badge.icon || '🏆'}</span>
                        {isEarned ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        ) : (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Badge Info */}
                      <h4 className="font-semibold mb-1">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>

                      {/* Requirements */}
                      {!isEarned && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          {badge.xp_required > 0 && (
                            <span>Requires {badge.xp_required} XP</span>
                          )}
                          {badge.streak_required > 0 && (
                            <span>{badge.streak_required}-day streak</span>
                          )}
                        </div>
                      )}

                      {isEarned && (
                        <div className="mt-3">
                          <span className="inline-block px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">
                            Unlocked!
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </AppLayout>
  );
}
