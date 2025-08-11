import { useState, useRef, useCallback, useEffect } from "react";
import { ZOXAA_TEXT_SYSTEM_PROMPT } from "@/utils/systemPrompts";
import { EnhancedEmotionalSystem } from "@/utils/enhancedEmotionalSystem";
import { ConversationMemoryManager } from "@/utils/conversationMemory";
import { EVI3VoiceAnalyzer } from "@/utils/advancedVoiceAnalysis";
import { CrisisDetectionSystem } from "@/utils/crisisDetection";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
  emotion?: string;
  crisisLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical';
  emotionalIntensity?: number;
}

interface EmotionalTrends {
  overallMood: 'improving' | 'stable' | 'declining';
  primaryEmotions: Array<{emotion: string, frequency: number}>;
  emotionalStability: number;
  crisisTrend: 'none' | 'increasing' | 'decreasing';
  trustLevel: number;
  comfortLevel: number;
}

interface UseZoxaaChatReturn {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  emotionalTrends: EmotionalTrends;
  getRelevantMemories: () => string[];
  analyzeEmotionalState: (text: string) => Promise<any>;
  currentEmotion: string;
  crisisLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export const useZoxaaChat = (): UseZoxaaChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [crisisLevel, setCrisisLevel] = useState<'none' | 'low' | 'medium' | 'high' | 'critical'>('none');
  const [emotionalTrends, setEmotionalTrends] = useState<EmotionalTrends>({
    overallMood: 'stable',
    primaryEmotions: [],
    emotionalStability: 0.5,
    crisisTrend: 'none',
    trustLevel: 0.3,
    comfortLevel: 0.3
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const emotionalSystemRef = useRef<EnhancedEmotionalSystem>(new EnhancedEmotionalSystem(true));
  const memoryManagerRef = useRef<ConversationMemoryManager>(ConversationMemoryManager.getInstance());
  const voiceAnalyzerRef = useRef<EVI3VoiceAnalyzer>(new EVI3VoiceAnalyzer());
  const crisisDetectionRef = useRef<CrisisDetectionSystem>(new CrisisDetectionSystem());
  const sessionIdRef = useRef<string>('default');

  // Initialize session
  useEffect(() => {
    const sessionId = `session_${Date.now()}`;
    sessionIdRef.current = sessionId;
    
    // Initialize emotional system for this session
    emotionalSystemRef.current.analyzeEmotion("Hello", sessionId);
  }, []);

  const analyzeEmotionalState = useCallback(async (text: string) => {
    try {
      const emotionalState = await emotionalSystemRef.current.analyzeEmotion(text, sessionIdRef.current);
      setCurrentEmotion(emotionalState.primaryEmotion);
      setCrisisLevel(emotionalState.crisisLevel);
      return emotionalState;
    } catch (error) {
      console.error("Error analyzing emotion:", error);
      return null;
    }
  }, []);

  const getRelevantMemories = useCallback(() => {
    try {
      const memory = memoryManagerRef.current.getMemory(sessionIdRef.current);
      const recentEmotions = memory.emotionalPatterns
        .slice(-5)
        .map(pattern => `${pattern.emotion} (${pattern.frequency} times)`);
      
      const importantTopics = memory.importantTopics
        .filter(topic => topic.importance > 0.5)
        .map(topic => topic.topic);
      
      return [...recentEmotions, ...importantTopics];
    } catch (error) {
      console.error("Error getting memories:", error);
      return [];
    }
  }, []);

  const updateEmotionalTrends = useCallback((newMessage: Message) => {
    try {
      const memory = memoryManagerRef.current.getMemory(sessionIdRef.current);
      
      // Calculate overall mood trend
      const recentMessages = messages.slice(-10);
      const positiveCount = recentMessages.filter(m => 
        m.emotion && ['joy', 'excitement', 'contentment'].includes(m.emotion)
      ).length;
      const negativeCount = recentMessages.filter(m => 
        m.emotion && ['sadness', 'anger', 'fear', 'anxiety'].includes(m.emotion)
      ).length;
      
      let overallMood: 'improving' | 'stable' | 'declining' = 'stable';
      if (positiveCount > negativeCount + 2) overallMood = 'improving';
      else if (negativeCount > positiveCount + 2) overallMood = 'declining';
      
      // Calculate primary emotions
      const emotionCounts = new Map<string, number>();
      recentMessages.forEach(m => {
        if (m.emotion) {
          emotionCounts.set(m.emotion, (emotionCounts.get(m.emotion) || 0) + 1);
        }
      });
      
      const primaryEmotions = Array.from(emotionCounts.entries())
        .map(([emotion, frequency]) => ({ emotion, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5);
      
      // Calculate emotional stability
      const emotionalStability = Math.max(0, Math.min(1, 
        1 - (Math.abs(positiveCount - negativeCount) / recentMessages.length)
      ));
      
      // Update crisis trend
      const crisisMessages = recentMessages.filter(m => m.crisisLevel && m.crisisLevel !== 'none');
      const crisisTrend = crisisMessages.length > 2 ? 'increasing' : 
                         crisisMessages.length === 0 ? 'decreasing' : 'none';
      
      setEmotionalTrends({
        overallMood,
        primaryEmotions,
        emotionalStability,
        crisisTrend,
        trustLevel: memory.trustLevel,
        comfortLevel: memory.comfortLevel
      });
    } catch (error) {
      console.error("Error updating emotional trends:", error);
    }
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    // Analyze emotional state of user message
    const emotionalState = await analyzeEmotionalState(content);
    const userEmotion = emotionalState?.primaryEmotion || 'neutral';
    const emotionalIntensity = emotionalState?.emotionalIntensity || 0.5;

    // Perform crisis detection
    const crisisIndicators = crisisDetectionRef.current.detectCrisis(
      content,
      undefined, // voiceData - would be passed from voice interface
      undefined, // behavioralData
      (Date.now() - sessionIdRef.current.split('_')[1]) / 1000 // sessionDuration
    );
    const userCrisisLevel = crisisIndicators.crisisLevel;

    const userMessage: Message = { 
      role: "user", 
      content,
      timestamp: Date.now(),
      emotion: userEmotion,
      crisisLevel: userCrisisLevel,
      emotionalIntensity
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Update memory with this interaction
    try {
      memoryManagerRef.current.updateMemory(sessionIdRef.current, {
        emotion: userEmotion,
        topics: extractTopics(content),
        message: content,
        emotionalIntensity,
        userResponse: undefined
      });
    } catch (error) {
      console.error("Error updating memory:", error);
    }

    try {
      // Get personalized context for response
      const memory = memoryManagerRef.current.getMemory(sessionIdRef.current);
      const personalizedContext = memoryManagerRef.current.getPersonalizedContext(
        sessionIdRef.current, 
        userEmotion
      );

      // Create enhanced system prompt with memory context
      const enhancedSystemPrompt = `${ZOXAA_TEXT_SYSTEM_PROMPT}

PERSONALIZED CONTEXT:
- Relationship Stage: ${personalizedContext.relationshipStage}
- Communication Style: ${personalizedContext.communicationStyle}
- Trust Level: ${Math.round(personalizedContext.trustLevel * 100)}%
- Comfort Level: ${Math.round(personalizedContext.comfortLevel * 100)}%
- Recent Emotional History: ${personalizedContext.emotionalHistory.slice(-3).join(', ')}
- Important Topics: ${personalizedContext.importantTopics.slice(-3).join(', ')}
- Suggested Approach: ${personalizedContext.suggestedApproach}

CURRENT EMOTIONAL STATE:
- User Emotion: ${userEmotion}
- Emotional Intensity: ${Math.round(emotionalIntensity * 100)}%
- Crisis Level: ${userCrisisLevel}
- Overall Mood Trend: ${emotionalTrends.overallMood}

Use this context to provide a more personalized and emotionally intelligent response.`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: enhancedSystemPrompt },
            ...messages,
            userMessage
          ]
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        // Analyze ZOXAA's response emotion
        const responseEmotionalState = await analyzeEmotionalState(data.response);
        const assistantEmotion = responseEmotionalState?.primaryEmotion || 'neutral';
        
        const assistantMessage: Message = { 
          role: "assistant", 
          content: data.response,
          timestamp: Date.now(),
          emotion: assistantEmotion,
          crisisLevel: 'none', // ZOXAA doesn't have crisis level
          emotionalIntensity: responseEmotionalState?.emotionalIntensity || 0.5
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update memory with ZOXAA's response
        try {
          memoryManagerRef.current.updateMemory(sessionIdRef.current, {
            emotion: assistantEmotion,
            topics: extractTopics(data.response),
            message: data.response,
            emotionalIntensity: responseEmotionalState?.emotionalIntensity || 0.5,
            userResponse: undefined
          });
        } catch (error) {
          console.error("Error updating memory with response:", error);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      console.error("Error sending message:", error);
      
      // Add error message
      const errorMessage: Message = { 
        role: "assistant", 
        content: "I'm sorry, I'm having trouble processing that right now. Could you try again?",
        timestamp: Date.now(),
        emotion: 'concerned',
        crisisLevel: 'none',
        emotionalIntensity: 0.3
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      
      // Update emotional trends after message processing
      updateEmotionalTrends(userMessage);
    }
  }, [messages, analyzeEmotionalState, updateEmotionalTrends, emotionalTrends.overallMood]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentEmotion('neutral');
    setCrisisLevel('none');
  }, []);

  // Helper function to extract topics from text
  const extractTopics = (text: string): string[] => {
    const topics: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Simple topic extraction based on keywords
    const topicKeywords = {
      'work': ['work', 'job', 'career', 'office', 'boss', 'colleague'],
      'family': ['family', 'mom', 'dad', 'parent', 'child', 'sibling'],
      'health': ['health', 'sick', 'pain', 'doctor', 'medical', 'therapy'],
      'relationships': ['relationship', 'partner', 'boyfriend', 'girlfriend', 'friend'],
      'school': ['school', 'college', 'university', 'study', 'exam', 'homework'],
      'money': ['money', 'financial', 'bills', 'expenses', 'budget'],
      'stress': ['stress', 'anxiety', 'worried', 'overwhelmed', 'pressure']
    };
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    return topics;
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    emotionalTrends,
    getRelevantMemories,
    analyzeEmotionalState,
    currentEmotion,
    crisisLevel
  };
};