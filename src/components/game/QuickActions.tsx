import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, BookOpen, Heart, Plus, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore, ActivityType } from '@/store/gameStore';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const activityConfig = [
  { 
    type: 'coding' as ActivityType, 
    label: 'Coding', 
    icon: Code, 
    variant: 'neon' as const,
  },
  { 
    type: 'study' as ActivityType, 
    label: 'Study', 
    icon: BookOpen, 
    variant: 'neon-purple' as const,
  },
  { 
    type: 'self_improvement' as ActivityType, 
    label: 'Self-Improve', 
    icon: Heart, 
    variant: 'neon-cyan' as const,
  },
];

export function QuickActions() {
  const navigate = useNavigate();
  const { logActivity } = useGameStore();
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [minutes, setMinutes] = useState('15');
  const [isOpen, setIsOpen] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const handleLogActivity = async () => {
    if (!selectedActivity || !minutes) return;
    
    setIsLogging(true);
    try {
      await logActivity(selectedActivity, parseInt(minutes));
      toast({
        title: "Activity logged! 🎉",
        description: `+${selectedActivity === 'self_improvement' ? Math.floor(parseInt(minutes) * 0.5) : minutes} XP earned!`,
      });
      setIsOpen(false);
      setMinutes('15');
      setSelectedActivity(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log activity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="game-card p-6">
      <h3 className="font-display text-lg font-semibold mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Log Activity Button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="neon" className="col-span-2 h-12">
              <Plus className="w-5 h-5 mr-2" />
              Log Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="game-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Log Activity</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 pt-4">
              {/* Activity Type Selection */}
              <div className="space-y-3">
                <Label>Activity Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {activityConfig.map((activity) => (
                    <motion.button
                      key={activity.type}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedActivity(activity.type)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedActivity === activity.type
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-muted border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <activity.icon className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-xs font-medium">{activity.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Minutes Input */}
              <div className="space-y-2">
                <Label>Minutes</Label>
                <Input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  min="1"
                  max="240"
                  className="bg-muted border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Quick options: 
                  {[15, 30, 45, 60].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMinutes(m.toString())}
                      className="ml-2 text-primary hover:underline"
                    >
                      {m}min
                    </button>
                  ))}
                </p>
              </div>

              {/* XP Preview */}
              {selectedActivity && minutes && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-sm text-center">
                    You'll earn{' '}
                    <span className="font-display font-bold text-primary">
                      +{selectedActivity === 'self_improvement' 
                        ? Math.floor(parseInt(minutes) * 0.5) 
                        : minutes} XP
                    </span>
                  </p>
                </div>
              )}

              <Button
                onClick={handleLogActivity}
                disabled={!selectedActivity || !minutes || isLogging}
                className="w-full"
                variant="gaming"
              >
                {isLogging ? 'Logging...' : 'Log Activity'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Start Timer Button */}
        <Button 
          variant="fire" 
          className="col-span-2 h-12"
          onClick={() => navigate('/timer')}
        >
          <Timer className="w-5 h-5 mr-2" />
          Start Focus Timer
        </Button>
      </div>
    </div>
  );
}
