import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/store/gameStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { MissionCard } from '@/components/game/MissionCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Zap, Trophy, Timer } from 'lucide-react';

export default function Missions() {
  const navigate = useNavigate();
  const { profile, missions, isLoading, fetchUserData, generateDailyMissions } = useGameStore();

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      await fetchUserData(session.user.id);
      await generateDailyMissions();
    };
    initData();
  }, [navigate, fetchUserData, generateDailyMissions]);

  const completedMissions = missions.filter(m => m.completed).length;
  const totalMissions = missions.length;
  const allComplete = completedMissions === totalMissions && totalMissions > 0;

  // Calculate bonus XP for completing all missions
  const bonusXp = allComplete ? 50 : 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-2xl mx-auto">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              Daily Missions
            </h1>
            <p className="text-muted-foreground mt-1">Complete missions to earn XP and build streaks</p>
          </div>
        </div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-card-glow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Today's Progress</h3>
            <div className="flex items-center gap-2">
              <Trophy className={`w-5 h-5 ${allComplete ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              <span className={`font-display font-bold ${allComplete ? 'text-yellow-500' : 'text-foreground'}`}>
                {completedMissions}/{totalMissions}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full bg-muted overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${(completedMissions / Math.max(totalMissions, 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {allComplete ? (
            <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="font-semibold text-yellow-500">
                All missions complete! +{bonusXp} Bonus XP! 🎉
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Zap className="w-4 h-4" />
              <span className="text-sm">
                Complete all missions for +50 bonus XP
              </span>
            </div>
          )}
        </motion.div>

        {/* Missions List */}
        <div className="space-y-4">
          {missions.length > 0 ? (
            missions.map((mission, index) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MissionCard
                  type={mission.type}
                  targetMinutes={mission.target_minutes}
                  progressMinutes={mission.progress_minutes}
                  completed={mission.completed}
                  onClick={() => navigate('/timer')}
                />
              </motion.div>
            ))
          ) : (
            <div className="game-card p-8 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No missions yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Missions are generated daily. Check back soon!
              </p>
            </div>
          )}
        </div>

        {/* Start Timer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="game-card p-6 text-center"
        >
          <h3 className="font-semibold mb-2">Ready to work on a mission?</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Start a focus session to earn XP and progress your missions
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
