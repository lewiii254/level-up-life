import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Zap, Gamepad2, Target, Brain } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/dashboard');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({ title: "Welcome back, hero! 🎮", description: "Let's continue your quest!" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { name },
          },
        });
        if (error) throw error;
        toast({ title: "Account created! 🚀", description: "Your productivity journey begins now!" });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-secondary/10 to-background p-12 flex-col justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold gradient-text mb-2">LEVELUP</h1>
          <p className="text-muted-foreground">Your Daily Productivity Quest</p>
        </div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Earn XP</h3>
              <p className="text-sm text-muted-foreground">Level up by completing daily activities</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold">Daily Missions</h3>
              <p className="text-sm text-muted-foreground">Complete coding, study & self-improvement tasks</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold">AI Mentor</h3>
              <p className="text-sm text-muted-foreground">Get personalized coaching & motivation</p>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Gamepad2 className="w-5 h-5" />
          <span className="text-sm">Gamify your productivity</span>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8 lg:hidden">
            <h1 className="font-display text-3xl font-bold gradient-text mb-2">LEVELUP</h1>
            <p className="text-muted-foreground">Your Daily Productivity Quest</p>
          </div>

          <div className="game-card p-8">
            <h2 className="font-display text-2xl font-bold mb-2">
              {isLogin ? 'Welcome Back' : 'Join the Quest'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isLogin ? 'Continue your productivity journey' : 'Create your hero account'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Hero Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-muted border-border"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hero@example.com"
                  className="bg-muted border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-muted border-border"
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="gaming"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : isLogin ? 'Start Quest' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
