import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SKILL_TREE, BRANCH_META, type SkillBranch, type SkillNode } from '@/lib/skillTree';
import { useGameStore } from '@/store/gameStore';
import { useSound } from '@/hooks/useSound';
import { useHaptic } from '@/hooks/useHaptic';
import { toast } from '@/hooks/use-toast';
import { GitBranch, Lock, Check, Sparkles, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SkillTree() {
  const navigate = useNavigate();
  const { profile, fetchUserData } = useGameStore();
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const skillPoints = (profile as typeof profile & { skill_points?: number })?.skill_points ?? 0;

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { navigate('/auth'); return; }
      await fetchUserData(session.user.id);
      const { data } = await supabase.from('skill_unlocks').select('skill_id').eq('user_id', session.user.id);
      setUnlocked(new Set((data ?? []).map(d => d.skill_id)));
      setLoading(false);
    });
  }, [navigate, fetchUserData]);

  const { playSuccess, playLevelUp } = useSound();
  const { triggerSuccess } = useHaptic();

  const canUnlock = (node: SkillNode) => {
    if (unlocked.has(node.id)) return false;
    if (skillPoints < node.cost) return false;
    if (node.requires?.some(r => !unlocked.has(r))) return false;
    return true;
  };

  const handleUnlock = async (node: SkillNode) => {
    if (!profile || !canUnlock(node)) return;
    const { error } = await supabase.from('skill_unlocks').insert({ user_id: profile.id, skill_id: node.id });
    if (error) {
      toast({ title: 'Unlock failed', description: error.message, variant: 'destructive' });
      return;
    }
    await supabase.from('profiles').update({ skill_points: skillPoints - node.cost }).eq('id', profile.id);
    setUnlocked(prev => new Set(prev).add(node.id));
    await fetchUserData(profile.id);
    playLevelUp();
    triggerSuccess();
    toast({ title: `${node.icon} ${node.name} unlocked!`, description: node.description });
  };

  const branches: SkillBranch[] = ['coding', 'study', 'self'];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
              <GitBranch className="w-8 h-8 text-primary" />
              Skill Tree
            </h1>
            <p className="text-muted-foreground mt-1">Spend skill points to unlock permanent power-ups.</p>
          </div>
          <div className="game-card-glow px-5 py-3 flex items-center gap-3">
            <Coins className="w-6 h-6 text-amber-400" />
            <div>
              <p className="text-xs text-muted-foreground">Skill Points</p>
              <p className="font-display font-bold text-2xl text-amber-400">{skillPoints}</p>
            </div>
          </div>
        </div>

        {skillPoints === 0 && unlocked.size === 0 && (
          <div className="game-card p-4 border border-amber-400/30 bg-amber-400/5 text-sm">
            💡 You earn <strong>1 skill point</strong> each time you level up. Keep grinding to unlock the tree!
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-96 w-full" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {branches.map(branch => {
              const meta = BRANCH_META[branch];
              const nodes = SKILL_TREE.filter(n => n.branch === branch).sort((a, b) => a.tier - b.tier);
              return (
                <motion.div
                  key={branch}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className={cn('rounded-xl p-4 bg-gradient-to-br text-white', meta.color)}>
                    <h2 className="font-display font-bold text-xl flex items-center gap-2">
                      <span className="text-2xl">{meta.emoji}</span>{meta.label}
                    </h2>
                    <p className="text-xs opacity-90 mt-1">
                      {nodes.filter(n => unlocked.has(n.id)).length}/{nodes.length} unlocked
                    </p>
                  </div>

                  <div className="relative space-y-3">
                    {nodes.map((node, idx) => {
                      const isUnlocked = unlocked.has(node.id);
                      const available = canUnlock(node);
                      const blocked = node.requires?.some(r => !unlocked.has(r));
                      return (
                        <div key={node.id} className="relative">
                          {idx > 0 && (
                            <div className={cn(
                              'absolute left-1/2 -top-3 w-0.5 h-3 -translate-x-1/2',
                              isUnlocked || available ? 'bg-primary' : 'bg-muted'
                            )} />
                          )}
                          <motion.div
                            whileHover={available ? { scale: 1.02 } : undefined}
                            className={cn(
                              'game-card p-4 transition-all',
                              isUnlocked && 'ring-2 ring-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]',
                              !isUnlocked && blocked && 'opacity-50',
                              available && 'ring-1 ring-amber-400/40'
                            )}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-2xl">{node.icon}</span>
                                <div className="min-w-0">
                                  <h3 className="font-display font-semibold text-sm truncate">{node.name}</h3>
                                  <p className="text-xs text-muted-foreground">Tier {node.tier} · {node.cost} pt{node.cost > 1 ? 's' : ''}</p>
                                </div>
                              </div>
                              {isUnlocked ? (
                                <span className="shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                                  <Check className="w-4 h-4" />
                                </span>
                              ) : blocked ? (
                                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                              ) : (
                                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{node.description}</p>
                            {!isUnlocked && (
                              <Button
                                size="sm"
                                variant={available ? 'fire' : 'outline'}
                                disabled={!available}
                                onClick={() => handleUnlock(node)}
                                className="w-full"
                              >
                                {blocked ? 'Locked' : available ? `Unlock (${node.cost} pt)` : `Need ${node.cost - skillPoints} more`}
                              </Button>
                            )}
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
