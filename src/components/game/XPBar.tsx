import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useSound } from '@/hooks/useSound';
import { useHaptic } from '@/hooks/useHaptic';
import { Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

export function XPBar() {
  const { profile, getXpProgress, getXpForNextLevel, soundEnabled, hapticEnabled } = useGameStore();
  const { playSound } = useSound({ enabled: soundEnabled });
  const { triggerHaptic } = useHaptic({ enabled: hapticEnabled });
  const prevXpRef = useRef<number>(0);
  const prevLevelRef = useRef<number>(0);

  useEffect(() => {
    if (!profile) return;

    // First load — initialize without firing
    if (prevXpRef.current === 0 && prevLevelRef.current === 0) {
      prevXpRef.current = profile.total_xp;
      prevLevelRef.current = profile.level;
      return;
    }

    // XP gain
    if (profile.total_xp > prevXpRef.current) {
      const gained = profile.total_xp - prevXpRef.current;
      playSound('xp');
      triggerHaptic('light');
      toast({
        title: `⚡ +${gained} XP earned!`,
        description: `Total: ${profile.total_xp.toLocaleString()} XP`,
      });
    }

    // Level up
    if (profile.level > prevLevelRef.current) {
      playSound('levelUp');
      triggerHaptic('success');
      toast({
        title: `🎉 LEVEL UP! You're now Level ${profile.level}`,
        description: 'New milestones unlocked — keep grinding!',
      });
    }

    prevXpRef.current = profile.total_xp;
    prevLevelRef.current = profile.level;
  }, [profile?.total_xp, profile?.level]);

  if (!profile) return null;

  const progress = getXpProgress();
  const nextLevelXp = getXpForNextLevel();

  return (
    <div className="game-card-glow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="level-badge">
            {profile.level}
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">
              Level {profile.level}
            </h3>
            <p className="text-sm text-muted-foreground">
              {profile.name || 'Hero'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-primary">
            <Zap className="w-5 h-5 fill-current" />
            <span className="font-display font-bold text-xl">
              {profile.total_xp.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Total XP
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="xp-bar">
          <motion.div
            className="xp-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Level {profile.level}</span>
          <span>{Math.round(progress)}% to Level {profile.level + 1}</span>
          <span>{nextLevelXp.toLocaleString()} XP</span>
        </div>
      </div>
    </div>
  );
}
