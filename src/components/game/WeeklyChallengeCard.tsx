import { motion } from 'framer-motion';
import { Check, Code, BookOpen, Heart, Zap, Trophy, Sparkles } from 'lucide-react';
import { ActivityType } from '@/store/gameStore';
import { Button } from '@/components/ui/button';

interface WeeklyChallengeCardProps {
  title: string;
  description: string;
  type: ActivityType;
  targetMinutes: number;
  progressMinutes: number;
  bonusXp: number;
  completed: boolean;
  claimed?: boolean;
  multiplier?: number;
  onClaim?: () => void;
  onClick?: () => void;
}

const challengeConfig = {
  coding: {
    icon: Code,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    progressColor: 'bg-primary',
  },
  study: {
    icon: BookOpen,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/30',
    progressColor: 'bg-secondary',
  },
  self_improvement: {
    icon: Heart,
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/30',
    progressColor: 'bg-accent',
  },
};

export function WeeklyChallengeCard({
  title,
  description,
  type,
  targetMinutes,
  progressMinutes,
  bonusXp,
  completed,
  claimed = false,
  multiplier = 1,
  onClaim,
  onClick,
}: WeeklyChallengeCardProps) {
  const config = challengeConfig[type];
  const progress = Math.min(100, (progressMinutes / targetMinutes) * 100);
  const projectedXp = Math.floor(bonusXp * multiplier);

  const handleCardClick = () => {
    if (!completed && onClick) onClick();
  };

  return (
    <motion.div
      whileHover={!completed ? { scale: 1.01, y: -2 } : undefined}
      onClick={handleCardClick}
      className={`w-full text-left game-card p-6 ${!completed ? 'cursor-pointer' : ''} ${
        claimed ? 'border-2 border-yellow-500/50 bg-yellow-500/5' : completed ? 'border-2 border-green-500/50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`p-3 rounded-lg ${config.bg} ${config.border} border`}>
            <config.icon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                {progressMinutes}/{targetMinutes} minutes
              </span>
              <div className="flex items-center gap-1 text-yellow-500">
                <Trophy className="w-4 h-4" />
                <span className="font-semibold">+{projectedXp} XP</span>
                {multiplier > 1 && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 ml-1">
                    {multiplier.toFixed(2)}x
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {claimed && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0"
          >
            <Check className="w-6 h-6 text-background" />
          </motion.div>
        )}
      </div>

      <div className="space-y-3">
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${config.progressColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{Math.round(progress)}% complete</span>
          {claimed && (
            <span className="text-yellow-500 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" />
              Bonus Claimed!
            </span>
          )}
        </div>

        {completed && !claimed && onClaim && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={(e) => { e.stopPropagation(); onClaim(); }}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-background hover:opacity-90 font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Claim +{projectedXp} XP
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
