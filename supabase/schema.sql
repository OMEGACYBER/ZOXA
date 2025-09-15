-- ZOXAA Database Schema for Supabase
-- This file defines the complete database structure for the ZOXAA AI companion

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    preferences JSONB DEFAULT '{}'::jsonb,
    voice_settings JSONB DEFAULT '{
        "voice": "nova",
        "speed": 1.0,
        "pitch": 1.0,
        "volume": 1.0,
        "emotion_sensitivity": 0.7
    }'::jsonb,
    emotion_profile JSONB DEFAULT '{
        "baseline_mood": "neutral",
        "emotional_sensitivity": 0.5,
        "communication_style": "balanced"
    }'::jsonb
);

-- Create conversations table
CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    type TEXT CHECK (type IN ('text', 'voice', 'mixed')) DEFAULT 'text',
    status TEXT CHECK (status IN ('active', 'archived', 'deleted')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    emotion_summary JSONB DEFAULT '{}'::jsonb,
    crisis_level TEXT CHECK (crisis_level IN ('none', 'low', 'medium', 'high', 'critical')) DEFAULT 'none'
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'voice', 'emotion', 'system')) DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    emotion_data JSONB DEFAULT '{}'::jsonb,
    voice_data JSONB DEFAULT '{}'::jsonb,
    crisis_indicators JSONB DEFAULT '{}'::jsonb,
    embedding vector(1536) -- For semantic search
);

-- Create memories table for conversation memory management
CREATE TABLE public.memories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    context TEXT,
    importance REAL DEFAULT 0.5,
    memory_type TEXT CHECK (memory_type IN ('conversation', 'preference', 'emotional', 'behavioral', 'crisis')) DEFAULT 'conversation',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(1536) -- For semantic search
);

-- Create emotion analytics table
CREATE TABLE public.emotion_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    emotion_type TEXT NOT NULL,
    intensity REAL NOT NULL,
    confidence REAL NOT NULL,
    triggers TEXT[],
    context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create voice analytics table
CREATE TABLE public.voice_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    audio_level REAL,
    speech_duration REAL,
    pause_patterns JSONB,
    voice_quality JSONB,
    emotional_markers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create crisis events table
CREATE TABLE public.crisis_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    crisis_level TEXT CHECK (crisis_level IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    indicators TEXT[] NOT NULL,
    context TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create system logs table
CREATE TABLE public.system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    level TEXT CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')) DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create user sessions table for tracking engagement
CREATE TABLE public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    session_end TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    interaction_count INTEGER DEFAULT 0,
    voice_interactions INTEGER DEFAULT 0,
    text_interactions INTEGER DEFAULT 0,
    emotional_insights JSONB DEFAULT '{}'::jsonb,
    quality_score REAL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own conversations" ON public.conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON public.messages
    FOR ALL USING (auth.uid() = (SELECT user_id FROM public.conversations WHERE id = conversation_id));

CREATE POLICY "Users can view own memories" ON public.memories
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own emotion analytics" ON public.emotion_analytics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own voice analytics" ON public.voice_analytics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own crisis events" ON public.crisis_events
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own system logs" ON public.system_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_memories_user_id ON public.memories(user_id);
CREATE INDEX idx_memories_importance ON public.memories(importance);
CREATE INDEX idx_memories_created_at ON public.memories(created_at);
CREATE INDEX idx_emotion_analytics_user_id ON public.emotion_analytics(user_id);
CREATE INDEX idx_emotion_analytics_created_at ON public.emotion_analytics(created_at);
CREATE INDEX idx_voice_analytics_user_id ON public.voice_analytics(user_id);
CREATE INDEX idx_crisis_events_user_id ON public.crisis_events(user_id);
CREATE INDEX idx_crisis_events_resolved ON public.crisis_events(resolved);
CREATE INDEX idx_system_logs_level ON public.system_logs(level);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);

-- Vector similarity search indexes (for semantic search)
CREATE INDEX messages_embedding_idx ON public.messages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX memories_embedding_idx ON public.memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Functions and triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.memories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get conversation summary with emotions
CREATE OR REPLACE FUNCTION public.get_conversation_summary(conversation_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'message_count', COUNT(*),
        'last_message', MAX(created_at),
        'emotions', jsonb_agg(DISTINCT emotion_data->>'primaryEmotion') FILTER (WHERE emotion_data->>'primaryEmotion' IS NOT NULL),
        'crisis_level', MAX(crisis_indicators->>'crisisLevel'),
        'avg_intensity', AVG((emotion_data->>'emotionalIntensity')::REAL)
    )
    INTO result
    FROM public.messages
    WHERE conversation_id = conversation_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for semantic search of memories
CREATE OR REPLACE FUNCTION public.search_memories(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    filter_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    context TEXT,
    importance REAL,
    similarity REAL,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.content,
        m.context,
        m.importance,
        1 - (m.embedding <=> query_embedding) AS similarity,
        m.created_at
    FROM public.memories m
    WHERE 
        (filter_user_id IS NULL OR m.user_id = filter_user_id)
        AND 1 - (m.embedding <=> query_embedding) > match_threshold
    ORDER BY m.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for semantic search of messages
CREATE OR REPLACE FUNCTION public.search_messages(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    filter_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    conversation_id UUID,
    content TEXT,
    role TEXT,
    similarity REAL,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.conversation_id,
        m.content,
        m.role,
        1 - (m.embedding <=> query_embedding) AS similarity,
        m.created_at
    FROM public.messages m
    JOIN public.conversations c ON m.conversation_id = c.id
    WHERE 
        (filter_user_id IS NULL OR c.user_id = filter_user_id)
        AND 1 - (m.embedding <=> query_embedding) > match_threshold
    ORDER BY m.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

