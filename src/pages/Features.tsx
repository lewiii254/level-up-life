import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Sparkles,
  Target,
  Trophy,
  Users,
  Palette,
  Smartphone,
  Bell,
  Globe,
  TrendingUp,
  Gift,
  MapPin,
  Gamepad2,
  Zap,
  Calendar,
  Settings,
  Link2,
  Music,
} from 'lucide-react';

interface Feature {
  icon: any;
  title: string;
  description: string;
  status: 'implemented' | 'in-progress' | 'planned';
  category: string;
}

const features: Feature[] = [
  // Implemented Features
  {
    icon: Target,
    title: 'Daily Missions',
    description: 'Auto-generated daily missions tailored to your productivity goals with bonus XP rewards.',
    status: 'implemented',
    category: 'Core Features',
  },
  {
    icon: Trophy,
    title: 'Weekly Challenges',
    description: 'High-reward weekly challenges with massive bonus XP for sustained progress.',
    status: 'implemented',
    category: 'Core Features',
  },
  {
    icon: Zap,
    title: 'XP & Leveling System',
    description: 'Earn XP for productive activities and level up your character with exponential progression.',
    status: 'implemented',
    category: 'Core Features',
  },
  {
    icon: Music,
    title: 'Sound Effects & Haptics',
    description: 'Immersive audio feedback and haptic vibrations for XP gains, completions, and level ups.',
    status: 'implemented',
    category: 'Experience',
  },
  {
    icon: Calendar,
    title: 'Streak Tracking',
    description: 'Daily streaks for each activity type to build consistent habits.',
    status: 'implemented',
    category: 'Gamification',
  },
  
  // In Progress
  {
    icon: Smartphone,
    title: 'Mobile App',
    description: 'Native mobile app for iOS and Android with offline support and notifications.',
    status: 'in-progress',
    category: 'Platform',
  },
  {
    icon: Palette,
    title: 'Custom Themes',
    description: 'Personalize your experience with custom color themes and UI customization.',
    status: 'in-progress',
    category: 'Customization',
  },
  
  // Planned Features
  {
    icon: Users,
    title: 'Social Features',
    description: 'Connect with friends, share achievements, and compete on leaderboards.',
    status: 'planned',
    category: 'Social',
  },
  {
    icon: Gift,
    title: 'Virtual Rewards Store',
    description: 'Spend earned currency on virtual items, themes, and power-ups.',
    status: 'planned',
    category: 'Gamification',
  },
  {
    icon: Gamepad2,
    title: 'Avatar Customization',
    description: 'Create and customize your unique avatar with unlockable items.',
    status: 'planned',
    category: 'Customization',
  },
  {
    icon: MapPin,
    title: 'Skill Trees',
    description: 'Unlock and progress through skill trees for different activity types.',
    status: 'planned',
    category: 'Progression',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Intelligent reminders for missions, streaks, and optimal focus times.',
    status: 'planned',
    category: 'Experience',
  },
  {
    icon: Globe,
    title: 'Multi-language Support',
    description: 'Full internationalization with support for multiple languages.',
    status: 'planned',
    category: 'Accessibility',
  },
  {
    icon: TrendingUp,
    title: 'Advanced Analytics',
    description: 'Deep insights into your productivity patterns with AI-powered recommendations.',
    status: 'planned',
    category: 'Analytics',
  },
  {
    icon: Link2,
    title: 'Third-party Integrations',
    description: 'Connect with GitHub, Notion, Todoist, and other productivity tools.',
    status: 'planned',
    category: 'Integration',
  },
  {
    icon: Sparkles,
    title: 'Random Daily Quests',
    description: 'Surprise bonus missions with extra rewards to keep things exciting.',
    status: 'planned',
    category: 'Gamification',
  },
  {
    icon: Settings,
    title: 'Custom Mission Creation',
    description: 'Create your own missions with custom goals and XP rewards.',
    status: 'planned',
    category: 'Customization',
  },
];

const statusConfig = {
  implemented: {
    label: '✅ Implemented',
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    border: 'border-green-500/30',
  },
  'in-progress': {
    label: '🚧 In Progress',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-500',
    border: 'border-yellow-500/30',
  },
  planned: {
    label: '💡 Planned',
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    border: 'border-blue-500/30',
  },
};

export default function Features() {
  const categories = [...new Set(features.map((f) => f.category))];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              Features & Roadmap
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Explore what's available now and what's coming next!
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="game-card p-6 text-center">
            <div className="text-3xl font-display font-bold text-green-500 mb-1">
              {features.filter((f) => f.status === 'implemented').length}
            </div>
            <div className="text-sm text-muted-foreground">Implemented</div>
          </div>
          <div className="game-card p-6 text-center">
            <div className="text-3xl font-display font-bold text-yellow-500 mb-1">
              {features.filter((f) => f.status === 'in-progress').length}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="game-card p-6 text-center">
            <div className="text-3xl font-display font-bold text-blue-500 mb-1">
              {features.filter((f) => f.status === 'planned').length}
            </div>
            <div className="text-sm text-muted-foreground">Planned</div>
          </div>
        </motion.div>

        {/* Features by Category */}
        {categories.map((category, categoryIndex) => {
          const categoryFeatures = features.filter((f) => f.category === category);
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + categoryIndex * 0.1 }}
              className="space-y-4"
            >
              <h2 className="font-display text-2xl font-semibold text-primary">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  const config = statusConfig[feature.status];
                  
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="game-card p-6 hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold">{feature.title}</h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text} border ${config.border} whitespace-nowrap`}
                            >
                              {config.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="game-card-glow p-8 text-center"
        >
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="font-display text-2xl font-bold mb-2">
            Have a Feature Request?
          </h3>
          <p className="text-muted-foreground mb-4">
            We'd love to hear your ideas! Share your suggestions and help shape the future of Level Up Life.
          </p>
          <a
            href="https://github.com/lewiii254/level-up-life/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Share Your Ideas
          </a>
        </motion.div>
      </div>
    </AppLayout>
  );
}
