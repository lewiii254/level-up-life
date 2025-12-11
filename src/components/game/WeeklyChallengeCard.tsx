import { motion } from 'framer-motion';
import { Check, Code, BookOpen, Heart, Zap, Trophy } from 'lucide-react';
import { ActivityType } from '@/store/gameStore';
import { Progress } from '@/components/ui/progress';

interface WeeklyChallengeCardProps {
  title: string;
  description: string;
  type: ActivityType;
  targetMinutes: number;
  progressMinutes: number;
  bonusXp: number;
  completed: boolean;
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
  onClick,
}: WeeklyChallengeCardProps) {
  const config = challengeConfig[type];
  const progress = Math.min(100, (progressMinutes / targetMinutes) * 100);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left game-card p-6 ${completed ? 'border-2 border-yellow-500/50 bg-yellow-500/5' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`p-3 rounded-lg ${config.bg} ${config.border} border`}>
            <config.icon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <span>
                  {progressMinutes}/{targetMinutes} minutes
                </span>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Trophy className="w-4 h-4" />
                <span className="font-semibold">+{bonusXp} Bonus XP</span>
              </div>
            </div>
          </div>
        </div>

        {completed && (
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

      <div className="space-y-2">
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${config.progressColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(progress)}% complete</span>
          {completed && (
            <span className="text-yellow-500 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" />
              Challenge Complete!
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
