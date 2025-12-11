import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt with user context
    const systemPrompt = `You are an AI Productivity Coach and Mentor for a gamified productivity app called LEVELUP. Your role is to help users stay consistent with coding, studying, and self-improvement habits.

USER CONTEXT:
- Name: ${userContext?.name || 'Hero'}
- Level: ${userContext?.level || 1}
- Total XP: ${userContext?.totalXp || 0}
- Coding Streak: ${userContext?.codingStreak || 0} days
- Study Streak: ${userContext?.studyStreak || 0} days
- Self-Improvement Streak: ${userContext?.selfStreak || 0} days
- Recent Activity: ${userContext?.recentMinutes || 0} minutes in the last 7 days
- Today's Missions Completed: ${userContext?.missionsCompleted || 0}/${userContext?.totalMissions || 3}

YOUR PERSONALITY:
- Encouraging and motivating, like a supportive coach
- Use gaming terminology (XP, level up, quest, grind, etc.)
- Celebrate wins and provide constructive feedback on missed goals
- Be concise but warm - users are busy!
- Use emojis sparingly to add energy 🎮💪🔥

CAPABILITIES:
1. Analyze yesterday's/recent performance and give feedback
2. Recommend today's focus areas based on patterns
3. Provide motivation when streaks are broken or progress slows
4. Generate weekly summaries of progress
5. Suggest improvements based on activity patterns
6. Identify productivity patterns (e.g., "You're more productive in the evenings")
7. Create personalized challenges

Keep responses focused and actionable. If the user seems unmotivated, be extra encouraging. If they're doing well, celebrate and push them to the next level!`;

    console.log("Calling Lovable AI Gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Mentor chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
