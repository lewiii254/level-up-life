import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/store/gameStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { BarChart3, Clock, Zap, TrendingUp, Code, BookOpen, Heart } from 'lucide-react';

export default function Stats() {
  const navigate = useNavigate();
  const { profile, activities, streaks, isLoading, fetchUserData } = useGameStore();
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

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

  // Prepare daily activity data
  const dailyData = (() => {
    const days = timeRange === '7d' ? 7 : 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayActivities = activities.filter(a => a.created_at.split('T')[0] === dateStr);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        coding: dayActivities.filter(a => a.type === 'coding').reduce((sum, a) => sum + a.minutes, 0),
        study: dayActivities.filter(a => a.type === 'study').reduce((sum, a) => sum + a.minutes, 0),
        self: dayActivities.filter(a => a.type === 'self_improvement').reduce((sum, a) => sum + a.minutes, 0),
      });
    }
    return data;
  })();

  // Activity type breakdown
  const pieData = (() => {
    const coding = activities.filter(a => a.type === 'coding').reduce((sum, a) => sum + a.minutes, 0);
    const study = activities.filter(a => a.type === 'study').reduce((sum, a) => sum + a.minutes, 0);
    const self = activities.filter(a => a.type === 'self_improvement').reduce((sum, a) => sum + a.minutes, 0);
    return [
      { name: 'Coding', value: coding, color: 'hsl(199, 89%, 48%)' },
      { name: 'Study', value: study, color: 'hsl(267, 84%, 58%)' },
      { name: 'Self-Improve', value: self, color: 'hsl(174, 100%, 50%)' },
    ].filter(d => d.value > 0);
  })();

  // XP earned over time
  const xpData = (() => {
    const days = 7;
    const data = [];
    let cumulative = 0;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayXp = activities
        .filter(a => a.created_at.split('T')[0] === dateStr)
        .reduce((sum, a) => sum + a.xp, 0);
      cumulative += dayXp;
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        xp: dayXp,
        cumulative,
      });
    }
    return data;
  })();

  // Summary stats
  const totalMinutes = activities.reduce((sum, a) => sum + a.minutes, 0);
  const totalXp = activities.reduce((sum, a) => sum + a.xp, 0);
  const avgMinutesPerDay = Math.round(totalMinutes / 7);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64 w-full" />
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
            <BarChart3 className="w-8 h-8 text-primary" />
            Statistics
          </h1>
          <p className="text-muted-foreground mt-1">Track your productivity journey</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="game-card p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground text-sm">Total Time</span>
            </div>
            <p className="font-display text-3xl font-bold">{totalMinutes}</p>
            <p className="text-muted-foreground text-sm">minutes this week</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="game-card p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-secondary" />
              <span className="text-muted-foreground text-sm">XP Earned</span>
            </div>
            <p className="font-display text-3xl font-bold">{totalXp}</p>
            <p className="text-muted-foreground text-sm">this week</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="game-card p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-muted-foreground text-sm">Daily Average</span>
            </div>
            <p className="font-display text-3xl font-bold">{avgMinutesPerDay}</p>
            <p className="text-muted-foreground text-sm">minutes/day</p>
          </motion.div>
        </div>

        {/* Activity Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="game-card p-6"
          >
            <h3 className="font-display text-lg font-semibold mb-4">Daily Activity</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(215, 20%, 55%)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(215, 20%, 55%)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}m`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 8%)',
                      border: '1px solid hsl(222, 47%, 18%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="coding" stackId="a" fill="hsl(199, 89%, 48%)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="study" stackId="a" fill="hsl(267, 84%, 58%)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="self" stackId="a" fill="hsl(174, 100%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="game-card p-6"
          >
            <h3 className="font-display text-lg font-semibold mb-4">Activity Breakdown</h3>
            <div className="h-[250px] flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222, 47%, 8%)',
                        border: '1px solid hsl(222, 47%, 18%)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value} min`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No activity data yet</p>
              )}
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" />
                <span className="text-sm">Coding</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-secondary" />
                <span className="text-sm">Study</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-accent" />
                <span className="text-sm">Self</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* XP Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="game-card p-6"
        >
          <h3 className="font-display text-lg font-semibold mb-4">XP Progress</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={xpData}>
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(267, 84%, 58%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(267, 84%, 58%)" stopOpacity={0}/>
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 8%)',
                    border: '1px solid hsl(222, 47%, 18%)',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="hsl(267, 84%, 58%)"
                  fillOpacity={1}
                  fill="url(#xpGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
