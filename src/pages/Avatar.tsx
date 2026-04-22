import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { AvatarDisplay } from '@/components/game/AvatarDisplay';
import { AVATAR_EMOJIS, AVATAR_COLORS, AVATAR_ACCESSORIES } from '@/lib/avatarOptions';
import { useGameStore } from '@/store/gameStore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Palette, Save, User } from 'lucide-react';

export default function Avatar() {
  const navigate = useNavigate();
  const { profile, fetchUserData } = useGameStore();
  const [emoji, setEmoji] = useState('🧙');
  const [color, setColor] = useState('cyan');
  const [accessory, setAccessory] = useState('none');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { navigate('/auth'); return; }
      await fetchUserData(session.user.id);
    });
  }, [navigate, fetchUserData]);

  useEffect(() => {
    if (profile) {
      const p = profile as typeof profile & { avatar_emoji?: string; avatar_color?: string; avatar_accessory?: string };
      if (p.avatar_emoji) setEmoji(p.avatar_emoji);
      if (p.avatar_color) setColor(p.avatar_color);
      if (p.avatar_accessory) setAccessory(p.avatar_accessory);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_emoji: emoji, avatar_color: color, avatar_accessory: accessory })
      .eq('id', profile.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✨ Avatar updated!', description: 'Your hero looks fresh.' });
      await fetchUserData(profile.id);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            Customize Avatar
          </h1>
          <p className="text-muted-foreground mt-1">Make your hero unmistakably yours.</p>
        </div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="game-card-glow p-8 flex flex-col items-center"
        >
          <AvatarDisplay emoji={emoji} color={color} accessory={accessory} size="xl" />
          <p className="mt-4 font-display font-bold text-lg">{profile?.name || 'Hero'}</p>
          <p className="text-sm text-muted-foreground">Level {profile?.level ?? 1}</p>
        </motion.div>

        {/* Emoji picker */}
        <div className="game-card p-5">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4" /> Character
          </h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {AVATAR_EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={cn(
                  'aspect-square rounded-lg text-2xl flex items-center justify-center transition-all',
                  emoji === e ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'bg-muted hover:bg-muted/70'
                )}
              >{e}</button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="game-card p-5">
          <h3 className="font-display font-semibold mb-3">Color</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {AVATAR_COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => setColor(c.id)}
                className={cn(
                  'h-14 rounded-xl bg-gradient-to-br transition-all',
                  c.class,
                  color === c.id ? `ring-4 ${c.ring} scale-105` : 'opacity-80 hover:opacity-100'
                )}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Accessory */}
        <div className="game-card p-5">
          <h3 className="font-display font-semibold mb-3">Accessory</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {AVATAR_ACCESSORIES.map(a => (
              <button
                key={a.id}
                onClick={() => setAccessory(a.id)}
                className={cn(
                  'h-14 rounded-lg flex flex-col items-center justify-center text-xs gap-1 transition-all',
                  accessory === a.id ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted hover:bg-muted/70'
                )}
              >
                <span className="text-xl">{a.emoji || '∅'}</span>
                <span className="text-muted-foreground">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button variant="fire" size="lg" className="w-full" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Avatar'}
        </Button>
      </div>
    </AppLayout>
  );
}
