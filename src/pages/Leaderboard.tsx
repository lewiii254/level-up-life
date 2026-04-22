import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/store/gameStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trophy, Crown, Medal, Zap, Flame, Code, BookOpen, Heart } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string | null;
  level: number;
  total_xp: number;
  avatar_url: string | null;
  coding_streak: number;
  study_streak: number;
  self_streak: number;
  best_streak: number;
}

type SortKey = 'total_xp' | 'best_streak' | 'coding_streak' | 'study_streak' | 'self_streak';

const tabConfig: Record<SortKey, { label: string; icon: any; color: string; suffix: string }> = {
  total_xp: { label: 'Total XP', icon: Zap, color: 'text-primary', suffix: 'XP' },
  best_streak: { label: 'Best Streak', icon: Flame, color: 'text-orange-500', suffix: 'days' },
  coding_streak: { label: 'Coding', icon: Code, color: 'text-primary', suffix: 'days' },
  study_streak: { label: 'Study', icon: BookOpen, color: 'text-secondary', suffix: 'days' },
  self_streak: { label: 'Self', icon: Heart, color: 'text-accent', suffix: 'days' },
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const { profile } = useGameStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>('total_xp');

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('leaderboard' as any)
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(100);
      if (!error && data) setEntries(data as unknown as LeaderboardEntry[]);
      setLoading(false);
    };
    load();
  }, [navigate]);

  const sorted = [...entries].sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
  const myRank = sorted.findIndex((e) => e.id === profile?.id) + 1;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500 fill-current" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300 fill-current" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700 fill-current" />;
    return <span className="font-display font-bold text-muted-foreground w-6 text-center">{rank}</span>;
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Compete with fellow heroes across XP and streaks
          </p>
        </div>

        {profile && myRank > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="game-card-glow p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="level-badge">{profile.level}</div>
              <div>
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="font-display text-2xl font-bold">#{myRank}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{tabConfig[sortBy].label}</p>
              <p className={`font-display text-2xl font-bold ${tabConfig[sortBy].color}`}>
                {sorted[myRank - 1]?.[sortBy] ?? 0} {tabConfig[sortBy].suffix}
              </p>
            </div>
          </motion.div>
        )}

        <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
          <TabsList className="grid grid-cols-5 w-full">
            {(Object.keys(tabConfig) as SortKey[]).map((key) => {
              const Icon = tabConfig[key].icon;
              return (
                <TabsTrigger key={key} value={key} className="gap-1.5">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tabConfig[key].label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={sortBy} className="mt-6 space-y-2">
            {loading ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </>
            ) : sorted.length === 0 ? (
              <div className="game-card p-12 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No heroes on the leaderboard yet. Be the first!</p>
              </div>
            ) : (
              sorted.map((entry, idx) => {
                const rank = idx + 1;
                const isMe = entry.id === profile?.id;
                const value = entry[sortBy] ?? 0;
                const Icon = tabConfig[sortBy].icon;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                    className={`game-card p-4 flex items-center gap-4 ${
                      isMe ? 'border-primary border-2 bg-primary/5' : ''
                    } ${rank <= 3 ? 'border-yellow-500/30' : ''}`}
                  >
                    <div className="w-8 flex justify-center">{getRankBadge(rank)}</div>
                    <div className="level-badge text-sm flex-shrink-0">{entry.level}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {entry.name || 'Anonymous Hero'}
                        {isMe && <span className="ml-2 text-xs text-primary">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 font-display font-bold ${tabConfig[sortBy].color}`}>
                      <Icon className="w-4 h-4" />
                      <span>{value.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground font-normal ml-1">
                        {tabConfig[sortBy].suffix}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
