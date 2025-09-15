import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Types for our database schema
export interface UserProfile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  preferences: Record<string, any>;
  voice_settings: {
    voice: string;
    speed: number;
    pitch: number;
    volume: number;
    emotion_sensitivity: number;
  };
  emotion_profile: {
    baseline_mood: string;
    emotional_sensitivity: number;
    communication_style: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  type: 'text' | 'voice' | 'mixed';
  status: 'active' | 'archived' | 'deleted';
  metadata: Record<string, any>;
  emotion_summary: Record<string, any>;
  crisis_level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  message_type: 'text' | 'voice' | 'emotion' | 'system';
  metadata: Record<string, any>;
  emotion_data: Record<string, any>;
  voice_data: Record<string, any>;
  crisis_indicators: Record<string, any>;
  created_at: string;
}

export interface Memory {
  id: string;
  user_id: string;
  content: string;
  context?: string;
  importance: number;
  memory_type: 'conversation' | 'preference' | 'emotional' | 'behavioral' | 'crisis';
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface EmotionAnalytic {
  id: string;
  user_id: string;
  conversation_id?: string;
  emotion_type: string;
  intensity: number;
  confidence: number;
  triggers: string[];
  context?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CrisisEvent {
  id: string;
  user_id: string;
  conversation_id?: string;
  crisis_level: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  context?: string;
  resolved: boolean;
  resolution_notes?: string;
  metadata: Record<string, any>;
  created_at: string;
  resolved_at?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_start: string;
  session_end?: string;
  duration_seconds?: number;
  interaction_count: number;
  voice_interactions: number;
  text_interactions: number;
  emotional_insights: Record<string, any>;
  quality_score?: number;
  metadata: Record<string, any>;
}

class SupabaseService {
  // User Profile Management
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  }

  async updateVoiceSettings(userId: string, voiceSettings: Partial<UserProfile['voice_settings']>): Promise<boolean> {
    const { error } = await supabase
      .from('user_profiles')
      .update({ voice_settings: voiceSettings })
      .eq('id', userId);

    if (error) {
      console.error('Error updating voice settings:', error);
      return false;
    }

    return true;
  }

  // Conversation Management
  async createConversation(
    userId: string, 
    type: 'text' | 'voice' | 'mixed' = 'text',
    title?: string
  ): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        type,
        title: title || `Conversation ${new Date().toLocaleDateString()}`,
        metadata: {},
        emotion_summary: {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data;
  }

  async getConversations(userId: string, limit: number = 50): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return data || [];
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    return data;
  }

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<boolean> {
    const { error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', conversationId);

    if (error) {
      console.error('Error updating conversation:', error);
      return false;
    }

    return true;
  }

  // Message Management
  async saveMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    messageType: 'text' | 'voice' | 'emotion' | 'system' = 'text',
    emotionData?: Record<string, any>,
    voiceData?: Record<string, any>,
    crisisIndicators?: Record<string, any>
  ): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        message_type: messageType,
        emotion_data: emotionData || {},
        voice_data: voiceData || {},
        crisis_indicators: crisisIndicators || {},
        metadata: {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return null;
    }

    // Update conversation's updated_at timestamp
    await this.updateConversation(conversationId, { updated_at: new Date().toISOString() });

    return data;
  }

  async getMessages(conversationId: string, limit: number = 100): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  }

  // Memory Management
  async saveMemory(
    userId: string,
    content: string,
    context?: string,
    importance: number = 0.5,
    memoryType: Memory['memory_type'] = 'conversation',
    tags: string[] = [],
    expiresAt?: Date
  ): Promise<Memory | null> {
    const { data, error } = await supabase
      .from('memories')
      .insert({
        user_id: userId,
        content,
        context,
        importance,
        memory_type: memoryType,
        tags,
        expires_at: expiresAt?.toISOString(),
        metadata: {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving memory:', error);
      return null;
    }

    return data;
  }

  async getMemories(
    userId: string, 
    memoryType?: Memory['memory_type'],
    limit: number = 50
  ): Promise<Memory[]> {
    let query = supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('importance', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (memoryType) {
      query = query.eq('memory_type', memoryType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching memories:', error);
      return [];
    }

    return data || [];
  }

  async updateMemory(memoryId: string, updates: Partial<Memory>): Promise<boolean> {
    const { error } = await supabase
      .from('memories')
      .update(updates)
      .eq('id', memoryId);

    if (error) {
      console.error('Error updating memory:', error);
      return false;
    }

    return true;
  }

  // Emotion Analytics
  async saveEmotionAnalytic(
    userId: string,
    conversationId: string,
    emotionType: string,
    intensity: number,
    confidence: number,
    triggers: string[] = [],
    context?: string
  ): Promise<EmotionAnalytic | null> {
    const { data, error } = await supabase
      .from('emotion_analytics')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        emotion_type: emotionType,
        intensity,
        confidence,
        triggers,
        context,
        metadata: {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving emotion analytic:', error);
      return null;
    }

    return data;
  }

  async getEmotionAnalytics(
    userId: string,
    days: number = 30,
    limit: number = 100
  ): Promise<EmotionAnalytic[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('emotion_analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching emotion analytics:', error);
      return [];
    }

    return data || [];
  }

  // Crisis Management
  async saveCrisisEvent(
    userId: string,
    conversationId: string,
    crisisLevel: CrisisEvent['crisis_level'],
    indicators: string[],
    context?: string
  ): Promise<CrisisEvent | null> {
    const { data, error } = await supabase
      .from('crisis_events')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        crisis_level: crisisLevel,
        indicators,
        context,
        resolved: false,
        metadata: {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving crisis event:', error);
      return null;
    }

    return data;
  }

  async resolveCrisisEvent(
    crisisEventId: string,
    resolutionNotes: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('crisis_events')
      .update({
        resolved: true,
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString()
      })
      .eq('id', crisisEventId);

    if (error) {
      console.error('Error resolving crisis event:', error);
      return false;
    }

    return true;
  }

  async getActiveCrisisEvents(userId: string): Promise<CrisisEvent[]> {
    const { data, error } = await supabase
      .from('crisis_events')
      .select('*')
      .eq('user_id', userId)
      .eq('resolved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching crisis events:', error);
      return [];
    }

    return data || [];
  }

  // Session Management
  async startSession(userId: string): Promise<UserSession | null> {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        interaction_count: 0,
        voice_interactions: 0,
        text_interactions: 0,
        emotional_insights: {},
        metadata: {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting session:', error);
      return null;
    }

    return data;
  }

  async updateSession(
    sessionId: string,
    updates: Partial<UserSession>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('user_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating session:', error);
      return false;
    }

    return true;
  }

  async endSession(sessionId: string, qualityScore?: number): Promise<boolean> {
    const now = new Date().toISOString();
    
    // First get the session to calculate duration
    const { data: session } = await supabase
      .from('user_sessions')
      .select('session_start')
      .eq('id', sessionId)
      .single();

    if (!session) return false;

    const durationSeconds = Math.floor(
      (new Date().getTime() - new Date(session.session_start).getTime()) / 1000
    );

    const { error } = await supabase
      .from('user_sessions')
      .update({
        session_end: now,
        duration_seconds: durationSeconds,
        quality_score: qualityScore
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error ending session:', error);
      return false;
    }

    return true;
  }

  // Search and Analytics
  async searchConversations(
    userId: string,
    query: string,
    limit: number = 20
  ): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .textSearch('title', query)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching conversations:', error);
      return [];
    }

    return data || [];
  }

  async getEmotionTrends(
    userId: string,
    days: number = 7
  ): Promise<{ emotion: string; count: number; avg_intensity: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('emotion_analytics')
      .select('emotion_type, intensity')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString());

    if (error) {
      console.error('Error fetching emotion trends:', error);
      return [];
    }

    // Group by emotion and calculate averages
    const trends = data?.reduce((acc: Record<string, { count: number; total_intensity: number }>, item: { emotion_type: string; intensity: number }) => {
      const emotion = item.emotion_type;
      if (!acc[emotion]) {
        acc[emotion] = { count: 0, total_intensity: 0 };
      }
      acc[emotion].count++;
      acc[emotion].total_intensity += item.intensity;
      return acc;
    }, {});

    return Object.entries(trends || {}).map(([emotion, data]: [string, any]) => ({
      emotion,
      count: data.count,
      avg_intensity: data.total_intensity / data.count
    }));
  }

  // System logging
  async logEvent(
    eventType: string,
    eventData: Record<string, any>,
    level: 'debug' | 'info' | 'warn' | 'error' | 'critical' = 'info',
    userId?: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('system_logs')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        level,
        metadata: {}
      });

    if (error) {
      console.error('Error logging event:', error);
      return false;
    }

    return true;
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;

