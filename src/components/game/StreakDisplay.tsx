import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Flame, Code, BookOpen, Heart } from 'lucide-react';

const streakConfig = [
  { 
    key: 'coding_streak', 
    label: 'Coding', 
    icon: Code, 
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30'
  },
  { 
    key: 'study_streak', 
    label: 'Study', 
    icon: BookOpen, 
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/30'
  },
  { 
    key: 'self_streak', 
    label: 'Self-Growth', 
    icon: Heart, 
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/30'
  },
];

export function StreakDisplay() {
  const { streaks } = useGameStore();

  if (!streaks) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {streakConfig.map((config, index) => {
        const streak = streaks[config.key as keyof typeof streaks] as number;
        
        return (
          <motion.div
            key={config.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`game-card p-4 ${config.bg} border ${config.border}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <config.icon className={`w-5 h-5 ${config.color}`} />
                <span className="font-medium">{config.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className={`w-5 h-5 ${streak > 0 ? 'text-streak-fire animate-pulse' : 'text-muted-foreground'}`} />
                <span className={`font-display text-2xl font-bold ${streak > 0 ? 'text-streak-fire' : 'text-muted-foreground'}`}>
                  {streak}
                </span>
              </div>
            </div>
            {streak > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {streak} day{streak !== 1 ? 's' : ''} streak! 🔥
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
