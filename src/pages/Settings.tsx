import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/store/gameStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Volume2, Smartphone, Sparkles, Info } from 'lucide-react';
import { useSound } from '@/hooks/useSound';
import { useHaptic } from '@/hooks/useHaptic';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { soundEnabled, hapticEnabled, setSoundEnabled, setHapticEnabled } = useGameStore();
  const { playSound } = useSound({ enabled: true });
  const { triggerHaptic } = useHaptic({ enabled: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) navigate('/auth');
    });
  }, [navigate]);

  const supportsHaptic = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const handleSoundToggle = (checked: boolean) => {
    setSoundEnabled(checked);
    if (checked) playSound('xp');
    toast({
      title: checked ? '🔊 Audio enabled' : '🔇 Audio disabled',
      description: checked ? "You'll now hear sound effects on XP events." : 'Sound effects are muted.',
    });
  };

  const handleHapticToggle = (checked: boolean) => {
    setHapticEnabled(checked);
    if (checked) triggerHaptic('medium');
    toast({
      title: checked ? '📳 Haptics enabled' : '📴 Haptics disabled',
      description: checked
        ? supportsHaptic
          ? 'Vibration feedback is now active on supported devices.'
          : "Haptics are on, but your device doesn't support vibration."
        : 'Vibration feedback is off.',
    });
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize your immersion preferences.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-card p-6 space-y-6"
        >
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Feedback & Immersion
          </h2>

          {/* Sound */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/30">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
                <Volume2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Sound Effects</h3>
                <p className="text-sm text-muted-foreground">
                  Plays satisfying audio cues on XP gain, mission completion, and level ups.
                </p>
              </div>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={handleSoundToggle} />
          </div>

          {/* Haptic */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/30">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/30">
                <Smartphone className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">
                  Haptic Feedback
                  {!supportsHaptic && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Not supported on this device
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Vibrates on supported devices (typically mobile) for XP, completions, and level ups.
                </p>
              </div>
            </div>
            <Switch checked={hapticEnabled} onCheckedChange={handleHapticToggle} />
          </div>

          {/* Test buttons */}
          <div className="pt-2 space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" /> Test your settings
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { playSound('xp'); triggerHaptic('light'); }}
              >
                XP Gain
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { playSound('missionComplete'); triggerHaptic('success'); }}
              >
                Mission Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { playSound('levelUp'); triggerHaptic('success'); }}
              >
                Level Up
              </Button>
            </div>
          </div>
        </motion.div>

        <p className="text-xs text-center text-muted-foreground">
          Preferences are saved on this device.
        </p>
      </div>
    </AppLayout>
  );
}
