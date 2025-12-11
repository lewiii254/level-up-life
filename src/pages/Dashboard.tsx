import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/store/gameStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { XPBar } from '@/components/game/XPBar';
import { StreakDisplay } from '@/components/game/StreakDisplay';
import { MissionCard } from '@/components/game/MissionCard';
import { QuickActions } from '@/components/game/QuickActions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRight, TrendingUp, Sparkles, Trophy } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, missions, weeklyChallenges, activities, isLoading, fetchUserData, generateDailyMissions, generateWeeklyChallenges } = useGameStore();

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      await fetchUserData(session.user.id);
      await generateDailyMissions();
      await generateWeeklyChallenges();
    };
    initData();
  }, [navigate, fetchUserData, generateDailyMissions, generateWeeklyChallenges]);

  // Prepare chart data from activities
  const chartData = (() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayActivities = activities.filter(a => a.created_at.split('T')[0] === dateStr);
      const coding = dayActivities.filter(a => a.type === 'coding').reduce((sum, a) => sum + a.minutes, 0);
      const study = dayActivities.filter(a => a.type === 'study').reduce((sum, a) => sum + a.minutes, 0);
      const self = dayActivities.filter(a => a.type === 'self_improvement').reduce((sum, a) => sum + a.minutes, 0);
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        coding,
        study,
        self,
        total: coding + study + self,
      });
    }
    return last7Days;
  })();

  if (isLoading || !profile) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Welcome back, <span className="gradient-text">{profile.name || 'Hero'}</span>!
            </h1>
            <p className="text-muted-foreground mt-1">Ready to level up today?</p>
          </div>
        </div>

        {/* XP Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <XPBar />
        </motion.div>

        {/* Streaks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StreakDisplay />
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Missions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="game-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold">Today's Missions</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/missions')}>
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              {missions.length > 0 ? (
                <div className="grid gap-4">
                  {missions.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      type={mission.type}
                      targetMinutes={mission.target_minutes}
                      progressMinutes={mission.progress_minutes}
                      completed={mission.completed}
                      onClick={() => navigate('/timer')}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No missions yet today. They'll appear soon!</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <QuickActions />
          </motion.div>
        </div>

        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="game-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Weekly Activity</h3>
          </div>
          
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(215, 20%, 55%)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(215, 20%, 55%)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}m`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(222, 47%, 8%)', 
                    border: '1px solid hsl(222, 47%, 18%)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(199, 89%, 48%)" 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly Challenges Preview */}
        {weeklyChallenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="game-card-glow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <h3 className="font-display text-lg font-semibold">Weekly Challenges</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/challenges')}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid gap-3">
              {weeklyChallenges.slice(0, 2).map((challenge) => (
                <div 
                  key={challenge.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer hover:border-primary/50 ${
                    challenge.completed 
                      ? 'bg-yellow-500/5 border-yellow-500/30' 
                      : 'bg-muted/30 border-border'
                  }`}
                  onClick={() => navigate('/challenges')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{challenge.title}</span>
                    {challenge.completed && (
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(100, (challenge.progress_minutes / challenge.target_minutes) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{challenge.progress_minutes}/{challenge.target_minutes} min</span>
                    <span className="text-yellow-500">+{challenge.bonus_xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
