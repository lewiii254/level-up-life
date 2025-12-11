import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/store/gameStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Brain, Send, Sparkles, Zap, Target, TrendingUp, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: "Analyze my progress", prompt: "Analyze my recent productivity and give me feedback on how I'm doing." },
  { icon: Target, label: "Today's focus", prompt: "What should I focus on today based on my activity patterns?" },
  { icon: Sparkles, label: "Motivate me", prompt: "I need some motivation to get started. Give me a pep talk!" },
  { icon: Zap, label: "Weekly summary", prompt: "Give me a summary of my productivity this week." },
];

export default function Mentor() {
  const navigate = useNavigate();
  const { profile, streaks, missions, activities, isLoading, fetchUserData } = useGameStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      await fetchUserData(session.user.id);
    };
    initData();
  }, [navigate, fetchUserData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    // Build user context for the AI
    const recentMinutes = activities.reduce((sum, a) => sum + a.minutes, 0);
    const missionsCompleted = missions.filter(m => m.completed).length;

    const userContext = {
      name: profile?.name,
      level: profile?.level,
      totalXp: profile?.total_xp,
      codingStreak: streaks?.coding_streak || 0,
      studyStreak: streaks?.study_streak || 0,
      selfStreak: streaks?.self_streak || 0,
      recentMinutes,
      missionsCompleted,
      totalMissions: missions.length,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          userContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';

      // Add empty assistant message
      const assistantMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantMsgId 
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error: any) {
      console.error('Mentor chat error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to get response from mentor',
        variant: 'destructive',
      });
      // Remove the empty assistant message if error
      setMessages(prev => prev.filter(m => m.content !== ''));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    streamChat(input.trim());
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isStreaming) return;
    streamChat(prompt);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-accent" />
            AI Mentor
          </h1>
          <p className="text-muted-foreground mt-1">Your personal productivity coach</p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 game-card p-4 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Brain className="w-16 h-16 text-accent mb-4 animate-pulse" />
                <h3 className="font-display text-xl font-semibold mb-2">
                  Hey {profile?.name || 'Hero'}! 👋
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  I'm your AI productivity mentor. Ask me anything about your progress, 
                  get personalized advice, or just chat when you need motivation!
                </p>

                {/* Quick Prompts */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                  {QUICK_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt.label}
                      variant="outline"
                      className="h-auto py-3 px-4 flex flex-col items-center gap-2"
                      onClick={() => handleQuickPrompt(prompt.prompt)}
                    >
                      <prompt.icon className="w-5 h-5 text-primary" />
                      <span className="text-xs">{prompt.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-primary/20 border border-primary/30 rounded-br-md'
                            : 'bg-muted border border-border/50 rounded-bl-md'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-2 text-accent">
                            <Brain className="w-4 h-4" />
                            <span className="text-xs font-medium">AI Mentor</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.content || '...'}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your mentor anything..."
              className="flex-1 bg-muted border-border"
              disabled={isStreaming}
            />
            <Button type="submit" disabled={isStreaming || !input.trim()}>
              {isStreaming ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
