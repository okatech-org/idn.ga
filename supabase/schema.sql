-- Configuration iAsted
CREATE TABLE IF NOT EXISTS iasted_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT,
  president_voice_id TEXT DEFAULT 'ash',
  minister_voice_id TEXT DEFAULT 'shimmer',
  default_voice_id TEXT DEFAULT 'ash',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions de conversation
CREATE TABLE IF NOT EXISTS conversation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  settings JSONB DEFAULT '{}',
  focus_mode TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages de conversation
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE iasted_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Policies (Basic - Adjust as needed for production)
CREATE POLICY "Allow read access to config for authenticated users" ON iasted_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow users to see their own sessions" ON conversation_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert their own sessions" ON conversation_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to see messages from their sessions" ON conversation_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM conversation_sessions WHERE id = conversation_messages.session_id AND user_id = auth.uid())
);
CREATE POLICY "Allow users to insert messages to their sessions" ON conversation_messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM conversation_sessions WHERE id = conversation_messages.session_id AND user_id = auth.uid())
);
