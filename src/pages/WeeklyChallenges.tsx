import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/store/gameStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { WeeklyChallengeCard } from '@/components/game/WeeklyChallengeCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Calendar, Zap, Timer, Sparkles, Flame } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';
import { useHaptic } from '@/hooks/useHaptic';

export default function WeeklyChallenges() {
  const navigate = useNavigate();
  const {
    profile, weeklyChallenges, streaks, isLoading,
    fetchUserData, generateWeeklyChallenges, claimWeeklyChallenge, getWeeklyBonusMultiplier,
    soundEnabled, hapticEnabled,
  } = useGameStore();
  const { playSound } = useSound({ enabled: soundEnabled });
  const { triggerHaptic } = useHaptic({ enabled: hapticEnabled });

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
  const claimedChallenges = weeklyChallenges.filter(c => c.claimed).length;
  const totalChallenges = weeklyChallenges.length;
  const allComplete = completedChallenges === totalChallenges && totalChallenges > 0;
  const allClaimed = claimedChallenges === totalChallenges && totalChallenges > 0;
  const multiplier = getWeeklyBonusMultiplier();
  const totalBonusXp = weeklyChallenges.reduce((sum, c) => sum + (c.claimed ? Math.floor(c.bonus_xp * multiplier) : 0), 0);
  const potentialBonusXp = weeklyChallenges.reduce((sum, c) => sum + Math.floor(c.bonus_xp * multiplier), 0);
  const weeklyStreak = streaks?.weekly_streak ?? 0;

  const handleClaim = async (challengeId: string) => {
    const result = await claimWeeklyChallenge(challengeId);
    if (result) {
      playSound('levelUp');
      triggerHaptic('success');
      toast({
        title: `🎉 Bonus Claimed! +${result.awarded} XP`,
        description: result.multiplier > 1
          ? `${result.multiplier.toFixed(2)}x stacking multiplier active`
          : 'Complete all weekly challenges to grow your stack!',
      });
    }
  };

  // Calculate week dates
  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { monday, sunday };
  };

  const { monday, sunday } = getWeekDates();
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="font-display text-xl font-bold">
                  {completedChallenges}/{totalChallenges}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <Zap className="w-6 h-6 text-yellow-500 fill-current" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bonus XP</p>
                <p className="font-display text-xl font-bold text-yellow-500">{totalBonusXp}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Week Streak</p>
                <p className="font-display text-xl font-bold text-orange-500">{weeklyStreak}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Multiplier</p>
                <p className="font-display text-xl font-bold text-accent">{multiplier.toFixed(2)}x</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
            💡 <strong>Stacking Bonus:</strong> Complete all weekly challenges in consecutive weeks to grow your multiplier (+25% per streak week, max 3x). Potential bonus this week: <strong className="text-yellow-500">{potentialBonusXp} XP</strong>.
          </div>

          {allClaimed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 flex items-center justify-center gap-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
            >
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="font-display font-semibold text-yellow-500">
                All bonuses claimed! Streak secured for next week 🔥
              </span>
            </motion.div>
          )}
          {allComplete && !allClaimed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 flex items-center justify-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/30"
            >
              <Sparkles className="w-6 h-6 text-green-500" />
              <span className="font-display font-semibold text-green-500">
                All challenges complete — claim your bonuses below!
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
