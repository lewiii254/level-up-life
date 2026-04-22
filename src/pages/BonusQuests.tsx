import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBonusQuests } from '@/hooks/useBonusQuests';
import { useSound } from '@/hooks/useSound';
import { useHaptic } from '@/hooks/useHaptic';
import { toast } from '@/hooks/use-toast';
import { Sparkles, Gift, Timer, Code2, BookOpen, Heart, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const rarityStyles = {
  common: { ring: 'ring-cyan-400/40', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.25)]', label: 'Common', tone: 'text-cyan-300' },
  rare: { ring: 'ring-purple-400/50', glow: 'shadow-[0_0_25px_rgba(168,85,247,0.35)]', label: 'Rare', tone: 'text-purple-300' },
  epic: { ring: 'ring-amber-400/60', glow: 'shadow-[0_0_35px_rgba(251,191,36,0.5)]', label: 'Epic', tone: 'text-amber-300' },
};

const typeIcon = { coding: Code2, study: BookOpen, self_improvement: Heart };

export default function BonusQuests() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>();
  const { quests, loading, claimQuest } = useBonusQuests(userId);
  const { playSuccess, playLevelUp } = useSound();
  const { triggerSuccess, triggerImpact } = useHaptic();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      setUserId(session.user.id);
    });
  }, [navigate]);

  const handleClaim = async (id: string, rarity: string) => {
    const xp = await claimQuest(id);
    if (xp) {
      if (rarity === 'epic') { playLevelUp(); triggerSuccess(); }
      else { playSuccess(); triggerImpact(); }
      toast({
        title: `🎁 +${xp} Bonus XP claimed!`,
        description: rarity === 'epic' ? 'EPIC reward unlocked!' : 'Nice work, keep grinding!',
      });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Gift className="w-8 h-8 text-primary" />
            Bonus Quests
          </h1>
          <p className="text-muted-foreground mt-1">Random surprise quests refresh every day. Higher rarity = bigger rewards.</p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : quests.length === 0 ? (
          <div className="game-card p-8 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No bonus quests today</h3>
            <p className="text-muted-foreground text-sm">Come back tomorrow for new surprises!</p>
          </div>
        ) : (
          <AnimatePresence>
            {quests.map((q, i) => {
              const style = rarityStyles[q.rarity];
              const Icon = typeIcon[q.type];
              const pct = Math.min(100, (q.progress_minutes / q.target_minutes) * 100);
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.08 }}
                  className={cn('game-card p-5 ring-1 transition-all', style.ring, style.glow, q.claimed && 'opacity-60')}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-lg truncate">{q.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{q.description}</p>
                      </div>
                    </div>
                    <span className={cn('text-xs font-bold uppercase px-2 py-1 rounded-full bg-background/50 shrink-0', style.tone)}>
                      {style.label}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {q.progress_minutes}/{q.target_minutes} min · <span className={style.tone}>+{q.bonus_xp} XP</span>
                    </span>
                    {q.claimed ? (
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3"/>Claimed</span>
                    ) : q.completed ? (
                      <Button size="sm" variant="fire" onClick={() => handleClaim(q.id, q.rarity)}>
                        Claim +{q.bonus_xp} XP
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => navigate('/timer')}>
                        <Timer className="w-3 h-3 mr-1" /> Start
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </AppLayout>
  );
}
