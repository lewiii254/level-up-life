import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/store/gameStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { WeeklyChallengeCard } from '@/components/game/WeeklyChallengeCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Calendar, Zap, Timer, Sparkles } from 'lucide-react';

export default function WeeklyChallenges() {
  const navigate = useNavigate();
  const { profile, weeklyChallenges, isLoading, fetchUserData, generateWeeklyChallenges } = useGameStore();

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      await fetchUserData(session.user.id);
      await generateWeeklyChallenges();
    };
    initData();
  }, [navigate, fetchUserData, generateWeeklyChallenges]);

  const completedChallenges = weeklyChallenges.filter(c => c.completed).length;
  const totalChallenges = weeklyChallenges.length;
  const allComplete = completedChallenges === totalChallenges && totalChallenges > 0;
  const totalBonusXp = weeklyChallenges.reduce((sum, c) => sum + (c.completed ? c.bonus_xp : 0), 0);
  const potentialBonusXp = weeklyChallenges.reduce((sum, c) => sum + c.bonus_xp, 0);

  // Calculate week dates
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekDisplay = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Weekly Challenges
            </h1>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <p>{weekDisplay}</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-card-glow p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="font-display text-2xl font-bold">
                  {completedChallenges}/{totalChallenges}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <Zap className="w-6 h-6 text-yellow-500 fill-current" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bonus XP Earned</p>
                <p className="font-display text-2xl font-bold text-yellow-500">
                  {totalBonusXp}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Potential XP</p>
                <p className="font-display text-2xl font-bold">
                  {potentialBonusXp}
                </p>
              </div>
            </div>
          </div>

          {allComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 flex items-center justify-center gap-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
            >
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="font-display font-semibold text-yellow-500">
                All challenges complete! You're a champion! 🎉
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Challenges List */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            This Week's Challenges
          </h2>

          {weeklyChallenges.length > 0 ? (
            weeklyChallenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <WeeklyChallengeCard
                  title={challenge.title}
                  description={challenge.description}
                  type={challenge.type}
                  targetMinutes={challenge.target_minutes}
                  progressMinutes={challenge.progress_minutes}
                  bonusXp={challenge.bonus_xp}
                  completed={challenge.completed}
                  onClick={() => navigate('/timer')}
                />
              </motion.div>
            ))
          ) : (
            <div className="game-card p-8 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No challenges yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Weekly challenges are generated at the start of each week. Check back soon!
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="game-card p-6 text-center"
        >
          <h3 className="font-semibold mb-2">Ready to tackle a challenge?</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Start a focus session to earn progress on your weekly challenges and earn massive bonus XP!
          </p>
          <Button variant="fire" size="lg" onClick={() => navigate('/timer')}>
            <Timer className="w-5 h-5 mr-2" />
            Start Focus Timer
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
