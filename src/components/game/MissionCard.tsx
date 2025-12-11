import { motion } from 'framer-motion';
import { Check, Code, BookOpen, Heart, Zap } from 'lucide-react';
import { ActivityType } from '@/store/gameStore';
import { Progress } from '@/components/ui/progress';

interface MissionCardProps {
  type: ActivityType;
  targetMinutes: number;
  progressMinutes: number;
  completed: boolean;
  onClick?: () => void;
}

const missionConfig = {
  coding: {
    label: 'Code',
    icon: Code,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    progressColor: 'bg-primary',
  },
  study: {
    label: 'Study',
    icon: BookOpen,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/30',
    progressColor: 'bg-secondary',
  },
  self_improvement: {
    label: 'Self-Improve',
    icon: Heart,
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/30',
    progressColor: 'bg-accent',
  },
};

export function MissionCard({ type, targetMinutes, progressMinutes, completed, onClick }: MissionCardProps) {
  const config = missionConfig[type];
  const progress = Math.min(100, (progressMinutes / targetMinutes) * 100);
  const xpReward = type === 'self_improvement' ? Math.floor(targetMinutes * 0.5) : targetMinutes;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left mission-card ${completed ? 'mission-complete' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.bg} ${config.border} border`}>
            <config.icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h4 className="font-medium">
              {config.label} {targetMinutes} minutes
            </h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="w-3 h-3" />
              <span>+{xpReward} XP</span>
            </div>
          </div>
        </div>
        
        {completed ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-8 h-8 rounded-full bg-neon-green flex items-center justify-center"
          >
            <Check className="w-5 h-5 text-background" />
          </motion.div>
        ) : (
          <span className="text-sm text-muted-foreground">
            {progressMinutes}/{targetMinutes} min
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${config.progressColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right">
          {Math.round(progress)}% complete
        </p>
      </div>
    </motion.button>
  );
}
