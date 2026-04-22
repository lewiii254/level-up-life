import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore, ActivityType } from '@/store/gameStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';
import { useHaptic } from '@/hooks/useHaptic';
import { Play, Pause, RotateCcw, Check, Code, BookOpen, Heart, Zap } from 'lucide-react';

const TIMER_PRESETS = [
  { label: 'Pomodoro', minutes: 25 },
  { label: 'Short', minutes: 15 },
  { label: 'Long Focus', minutes: 60 },
  { label: 'Quick', minutes: 5 },
];

const activityConfig = {
  coding: { label: 'Coding', icon: Code, color: 'text-primary', bg: 'bg-primary/20' },
  study: { label: 'Study', icon: BookOpen, color: 'text-secondary', bg: 'bg-secondary/20' },
  self_improvement: { label: 'Self-Improve', icon: Heart, color: 'text-accent', bg: 'bg-accent/20' },
};

export default function Timer() {
  const navigate = useNavigate();
  const { profile, logActivity, fetchUserData, soundEnabled, hapticEnabled } = useGameStore();
  const { playSound } = useSound({ enabled: soundEnabled });
  const { triggerHaptic } = useHaptic({ enabled: hapticEnabled });
  
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('coding');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      if (!profile) {
        await fetchUserData(session.user.id);
      }
    };
    checkAuth();
  }, [navigate, profile, fetchUserData]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => prev - 1);
      }, 1000);
    } else if (remainingSeconds === 0 && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
      handleComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds]);

  const handleComplete = async () => {
    const minutes = Math.ceil(totalSeconds / 60);
    const xp = selectedActivity === 'self_improvement' ? Math.floor(minutes * 0.5) : minutes;
    
    // Play completion sound and haptic feedback
    playSound('missionComplete');
    triggerHaptic('success');
    
    await logActivity(selectedActivity, minutes);
    
    toast({
      title: "Focus session complete! 🎉",
      description: `+${xp} XP earned for ${minutes} minutes of ${activityConfig[selectedActivity].label.toLowerCase()}!`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

  const setPreset = (minutes: number) => {
    setTotalSeconds(minutes * 60);
    setRemainingSeconds(minutes * 60);
    setIsRunning(false);
    setIsCompleted(false);
  };

  const toggleTimer = () => {
    if (isCompleted) {
      setRemainingSeconds(totalSeconds);
      setIsCompleted(false);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
    setIsCompleted(false);
  };

  const config = activityConfig[selectedActivity];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-2">Focus Timer</h1>
          <p className="text-muted-foreground">Stay focused and earn XP</p>
        </div>

        {/* Activity Selection */}
        <div className="game-card p-6">
          <h3 className="font-medium mb-4 text-center">What are you focusing on?</h3>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(activityConfig) as [ActivityType, typeof config][]).map(([type, cfg]) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedActivity(type)}
                className={`p-4 rounded-xl border transition-all text-center ${
                  selectedActivity === type
                    ? `${cfg.bg} border-current ${cfg.color}`
                    : 'bg-muted border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <cfg.icon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">{cfg.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Timer Display */}
        <motion.div
          layout
          className="game-card-glow p-8 text-center relative overflow-hidden"
        >
          {/* Progress ring background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-72 h-72 md:w-96 md:h-96 -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="hsl(222, 47%, 14%)"
                strokeWidth="8"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="url(#timerGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}%`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}%`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(199, 89%, 48%)" />
                  <stop offset="100%" stopColor="hsl(174, 100%, 50%)" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Timer text */}
          <div className="relative z-10 py-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={remainingSeconds}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
                className="timer-display"
              >
                {formatTime(remainingSeconds)}
              </motion.div>
            </AnimatePresence>

            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-center gap-2 text-green-500"
              >
                <Check className="w-6 h-6" />
                <span className="font-semibold">Session Complete!</span>
              </motion.div>
            )}

            {/* XP Preview */}
            <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm">
                +{selectedActivity === 'self_improvement' 
                  ? Math.floor(Math.ceil(totalSeconds / 60) * 0.5) 
                  : Math.ceil(totalSeconds / 60)} XP on completion
              </span>
            </div>
          </div>
        </motion.div>

        {/* Timer Controls */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={resetTimer}
            disabled={remainingSeconds === totalSeconds && !isCompleted}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          
          <Button
            variant="gaming"
            size="xl"
            onClick={toggleTimer}
            className="px-12"
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6 mr-2" /> Pause
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-2" /> {isCompleted ? 'Restart' : 'Start'}
              </>
            )}
          </Button>
        </div>

        {/* Presets */}
        <div className="game-card p-6">
          <h3 className="font-medium mb-4 text-center">Quick Presets</h3>
          <div className="grid grid-cols-4 gap-3">
            {TIMER_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant={totalSeconds === preset.minutes * 60 ? 'neon' : 'outline'}
                onClick={() => setPreset(preset.minutes)}
                disabled={isRunning}
              >
                {preset.minutes}m
              </Button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
