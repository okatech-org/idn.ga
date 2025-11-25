// supabase/functions/chat-iasted/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateSystemPrompt, IASTED_TOOLS } from "../_shared/iasted-prompts.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, userRole, userGender } = await req.json();
    const systemPrompt = generateSystemPrompt(userRole || 'citizen', userGender || 'male');

    // Construct the full message history for the LLM
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Call Lovable AI Gateway (Gemini)
    // Note: In a real deployment, use Deno.env.get('LOVABLE_API_KEY')
    const response = await fetch('https://api.lovable.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`
      },
      body: JSON.stringify({
        model: 'gemini-1.5-pro', // or appropriate model
        messages: fullMessages,
        tools: IASTED_TOOLS,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lovable API Error: ${response.status} - ${errorText}`);
    }

    // Proxy the streaming response back to the client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
