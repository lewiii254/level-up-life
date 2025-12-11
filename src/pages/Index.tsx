import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Gamepad2, Zap, Target, Brain, Trophy, Timer } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const features = [
    { icon: Zap, title: 'Earn XP', desc: 'Level up by completing activities' },
    { icon: Target, title: 'Daily Missions', desc: 'Coding, study & self-improvement' },
    { icon: Timer, title: 'Focus Timer', desc: 'Pomodoro sessions with XP rewards' },
    { icon: Brain, title: 'AI Mentor', desc: 'Personalized coaching & motivation' },
    { icon: Trophy, title: 'Achievements', desc: 'Unlock badges and build streaks' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <Gamepad2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Gamified Productivity</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">LEVELUP</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Transform your daily habits into an epic quest. 
              Code, study, and grow while earning XP, unlocking achievements, and getting AI coaching.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="gaming"
                size="xl"
                onClick={() => navigate('/auth')}
                className="min-w-[200px]"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Your Quest
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/auth')}
              >
                Login
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Your Productivity <span className="gradient-text">Power-Ups</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need to build consistent habits and track your growth
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="game-card p-6 text-center hover:scale-105 transition-transform"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="game-card-glow p-8 md:p-12 text-center"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Ready to Level Up?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join the quest and start building better habits today. 
            Your future self will thank you.
          </p>
          <Button
            variant="gaming"
            size="xl"
            onClick={() => navigate('/auth')}
          >
            Create Free Account
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-display gradient-text">LEVELUP</span> — Gamify your productivity
          </p>
        </div>
      </footer>
    </div>
  );
}
