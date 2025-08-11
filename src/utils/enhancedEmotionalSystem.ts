// 🧠 Enhanced Emotional System - ZOXAA Voice Intelligence
// Redesigned for truly alive, emotionally expressive, and context-aware voice companion

export interface EnhancedEmotionalState {
  // Core emotional dimensions
  pleasure: number;      // -1 to 1 (negative to positive)
  arousal: number;       // 0 to 1 (calm to excited)
  dominance: number;     // -1 to 1 (submissive to dominant)
  
  // Primary emotional classification
  primaryEmotion: string;
  secondaryEmotion: string;
  emotionalIntensity: number;
  
  // Enhanced detection
  detectedEmotions: EmotionConfidence[];
  confidenceScore: number;
  isBlendedEmotion: boolean;
  sarcasmDetected: boolean;
  
  // Context and memory
  conversationContext: ConversationContext;
  emotionalMemory: EmotionalMemory;
  
  // Voice behavior mapping
  voiceBehavior: VoiceBehavior;
  
  // Crisis and safety
  crisisLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  safetyCheck: boolean;
  
  // Production mode (no debug exposure)
  isProductionMode: boolean;
}

export interface EmotionConfidence {
  emotion: string;
  confidence: number;
  intensity: number;
  source: 'lexical' | 'prosodic' | 'contextual' | 'override';
}

export interface ConversationContext {
  turnNumber: number;
  sessionDuration: number;
  userEngagement: number;
  conversationFlow: 'greeting' | 'listening' | 'responding' | 'transitioning';
  lastUserEmotion: string;
  emotionalTrend: 'improving' | 'stable' | 'declining';
  topicContext: string;
  relationshipDepth: number;
}

export interface EmotionalMemory {
  recentEmotions: Array<{emotion: string, timestamp: number, intensity: number}>;
  emotionalBaseline: {pleasure: number, arousal: number, dominance: number};
  conversationHistory: Array<{text: string, emotion: string, timestamp: number}>;
  userPreferences: Map<string, number>;
  emotionalTriggers: Map<string, string>;
}

export interface VoiceBehavior {
  // ZOXAA's emotional response behavior
  primaryBehavior: string;
  secondaryBehavior: string;
  
  // Voice modulation parameters
  speed: number;
  pitch: number;
  volume: number;
  emotion: string;
  
  // Conversational style
  warmth: number;
  engagement: number;
  empathy: number;
  playfulness: number;
  
  // Response characteristics
  responseLength: 'short' | 'medium' | 'long';
  responseStyle: 'casual' | 'formal' | 'caring' | 'playful' | 'professional';
  interruptionStyle: 'gentle' | 'assertive' | 'none';
}

export class EnhancedEmotionalSystem {
  private sessions: Map<string, EnhancedEmotionalState> = new Map();
  private emotionCache: Map<string, EnhancedEmotionalState> = new Map();
  private productionMode: boolean = true;
  
  // Enhanced emotion patterns with context awareness
  private readonly emotionPatterns = {
    // Core emotions with rich context
    joy: {
      keywords: ['happy', 'joy', 'excited', 'thrilled', 'amazing', 'wonderful', 'great', 'love', 'good', 'nice', 'fantastic', 'brilliant', 'awesome', 'delighted', 'ecstatic'],
      contextual: ['laugh', 'smile', 'cheer', 'celebrate', 'win', 'success', 'achievement'],
      pleasure: 0.9,
      arousal: 0.7,
      dominance: 0.6,
      voiceBehavior: {
        primaryBehavior: 'share_joy',
        secondaryBehavior: 'excited',
        speed: 1.05,
        pitch: 1.1,
        volume: 1.05,
        emotion: 'happy',
        warmth: 0.9,
        engagement: 0.8,
        empathy: 0.7,
        playfulness: 0.6,
        responseLength: 'medium' as const,
        responseStyle: 'playful' as const,
        interruptionStyle: 'gentle' as const
      }
    },
    sadness: {
      keywords: ['sad', 'depressed', 'down', 'lonely', 'hurt', 'crying', 'empty', 'hopeless', 'bad', 'terrible', 'miserable', 'grief', 'heartbroken', 'devastated'],
      contextual: ['miss', 'lost', 'gone', 'alone', 'nobody', 'never', 'always'],
      pleasure: -0.8,
      arousal: 0.2,
      dominance: -0.3,
      voiceBehavior: {
        primaryBehavior: 'comfort',
        secondaryBehavior: 'gentle',
        speed: 0.9,
        pitch: 0.9,
        volume: 0.9,
        emotion: 'caring',
        warmth: 0.9,
        engagement: 0.7,
        empathy: 0.9,
        playfulness: 0.2,
        responseLength: 'medium' as const,
        responseStyle: 'caring' as const,
        interruptionStyle: 'gentle' as const
      }
    },
    anger: {
      keywords: ['angry', 'mad', 'furious', 'hate', 'annoyed', 'frustrated', 'rage', 'upset', 'livid', 'enraged', 'irritated', 'pissed'],
      contextual: ['unfair', 'wrong', 'stupid', 'idiot', 'hate', 'never', 'always', 'everyone'],
      pleasure: -0.4,
      arousal: 0.9,
      dominance: 0.2,
      voiceBehavior: {
        primaryBehavior: 'de_escalate',
        secondaryBehavior: 'understanding',
        speed: 0.95,
        pitch: 0.95,
        volume: 0.95,
        emotion: 'calm',
        warmth: 0.6,
        engagement: 0.8,
        empathy: 0.8,
        playfulness: 0.1,
        responseLength: 'medium' as const,
        responseStyle: 'caring' as const,
        interruptionStyle: 'gentle' as const
      }
    },
    anxiety: {
      keywords: ['anxious', 'worried', 'scared', 'nervous', 'panic', 'stress', 'overwhelmed', 'afraid', 'fear', 'terrified', 'dread', 'anxiety'],
      contextual: ['what if', 'maybe', 'could', 'might', 'should', 'need to', 'have to'],
      pleasure: -0.6,
      arousal: 0.8,
      dominance: -0.4,
      voiceBehavior: {
        primaryBehavior: 'reassure',
        secondaryBehavior: 'calm',
        speed: 0.9,
        pitch: 0.95,
        volume: 0.9,
        emotion: 'calm',
        warmth: 0.8,
        engagement: 0.7,
        empathy: 0.9,
        playfulness: 0.3,
        responseLength: 'medium' as const,
        responseStyle: 'caring' as const,
        interruptionStyle: 'gentle' as const
      }
    },
    // 🎭 NEW: Expanded emotion patterns
    surprise: {
      keywords: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'wow', 'unexpected', 'incredible', 'unbelievable', 'omg'],
      contextual: ['really', 'seriously', 'no way', 'omg', 'wow', 'what', 'how'],
      pleasure: 0.3,
      arousal: 0.8,
      dominance: 0.1,
      voiceBehavior: {
        primaryBehavior: 'share_wonder',
        secondaryBehavior: 'excited',
        speed: 1.1,
        pitch: 1.2,
        volume: 1.1,
        emotion: 'surprised',
        warmth: 0.7,
        engagement: 0.9,
        empathy: 0.6,
        playfulness: 0.7,
        responseLength: 'short' as const,
        responseStyle: 'playful' as const,
        interruptionStyle: 'gentle' as const
      }
    },
    fear: {
      keywords: ['fear', 'terrified', 'horrified', 'petrified', 'dread', 'terror', 'scared', 'afraid', 'frightened'],
      contextual: ['danger', 'threat', 'attack', 'kill', 'die', 'hurt', 'pain', 'dangerous'],
      pleasure: -0.9,
      arousal: 0.9,
      dominance: -0.8,
      voiceBehavior: {
        primaryBehavior: 'protect',
        secondaryBehavior: 'gentle',
        speed: 0.9,
        pitch: 0.9,
        volume: 0.85,
        emotion: 'protective',
        warmth: 0.8,
        engagement: 0.8,
        empathy: 0.9,
        playfulness: 0.1,
        responseLength: 'medium' as const,
        responseStyle: 'caring' as const,
        interruptionStyle: 'gentle' as const
      }
    },
    disgust: {
      keywords: ['disgusted', 'revolted', 'sickened', 'gross', 'nasty', 'repulsive', 'awful', 'terrible'],
      contextual: ['ew', 'yuck', 'disgusting', 'awful', 'terrible'],
      pleasure: -0.9,
      arousal: 0.6,
      dominance: -0.2,
      voiceBehavior: {
        primaryBehavior: 'acknowledge',
        secondaryBehavior: 'neutral',
        speed: 0.95,
        pitch: 0.9,
        volume: 0.9,
        emotion: 'neutral',
        warmth: 0.5,
        engagement: 0.6,
        empathy: 0.7,
        playfulness: 0.2,
        responseLength: 'short' as const,
        responseStyle: 'casual' as const,
        interruptionStyle: 'gentle' as const
      }
    },
    contempt: {
      keywords: ['contempt', 'disdain', 'scorn', 'mock', 'ridicule', 'sarcastic', 'hate', 'despise', 'loathe'],
      contextual: ['whatever', 'yeah right', 'sure', 'obviously'],
      pleasure: -0.7,
      arousal: 0.4,
      dominance: 0.3,
      voiceBehavior: {
        primaryBehavior: 'de_escalate',
        secondaryBehavior: 'understanding',
        speed: 0.95,
        pitch: 0.95,
        volume: 0.9,
        emotion: 'calm',
        warmth: 0.6,
        engagement: 0.7,
        empathy: 0.8,
        playfulness: 0.3,
        responseLength: 'medium' as const,
        responseStyle: 'caring' as const,
        interruptionStyle: 'gentle' as const
      }
    },
    relief: {
      keywords: ['relieved', 'thankful', 'grateful', 'peaceful', 'calm', 'serene', 'better', 'okay', 'phew'],
      contextual: ['finally', 'at last', 'thank god', 'good', 'better'],
      pleasure: 0.7,
      arousal: 0.2,
      dominance: 0.4,
      voiceBehavior: {
        primaryBehavior: 'share_relief',
        secondaryBehavior: 'gentle',
        speed: 0.95,
        pitch: 1.0,
        volume: 0.95,
        emotion: 'relieved',
        warmth: 0.8,
        engagement: 0.6,
        empathy: 0.7,
        playfulness: 0.5,
        responseLength: 'medium' as const,
        responseStyle: 'caring' as const,
        interruptionStyle: 'gentle' as const
      }
    },
    pride: {
      keywords: ['proud', 'accomplished', 'achieved', 'successful', 'confident', 'triumphant', 'did it', 'made it'],
      contextual: ['finally', 'succeeded', 'won', 'achieved', 'completed'],
      pleasure: 0.8,
      arousal: 0.6,
      dominance: 0.8,
      voiceBehavior: {
        primaryBehavior: 'celebrate_achievement',
        secondaryBehavior: 'excited',
        speed: 1.0,
        pitch: 1.1,
        volume: 1.05,
        emotion: 'proud',
        warmth: 0.8,
        engagement: 0.8,
        empathy: 0.6,
        playfulness: 0.6,
        responseLength: 'medium' as const,
        responseStyle: 'playful' as const,
        interruptionStyle: 'gentle' as const
      }
    },
    // 🎭 Blended emotions
    bittersweet: {
      keywords: ['bittersweet', 'mixed feelings', 'conflicted', 'torn', 'complicated', 'confused'],
      contextual: ['but', 'however', 'though', 'although', 'mixed'],
      pleasure: 0.1,
      arousal: 0.5,
      dominance: 0.0,
      voiceBehavior: {
        primaryBehavior: 'acknowledge_complexity',
        secondaryBehavior: 'understanding',
        speed: 0.95,
        pitch: 1.0,
        volume: 0.95,
        emotion: 'understanding',
        warmth: 0.7,
        engagement: 0.7,
        empathy: 0.8,
        playfulness: 0.3,
        responseLength: 'medium' as const,
        responseStyle: 'caring' as const,
        interruptionStyle: 'gentle' as const
      }
    },
    nostalgic: {
      keywords: ['remember', 'back then', 'good old days', 'nostalgic', 'miss', 'used to'],
      contextual: ['remember when', 'back in the day', 'those were the days'],
      pleasure: 0.4,
      arousal: 0.3,
      dominance: 0.2,
      voiceBehavior: {
        primaryBehavior: 'share_memory',
        secondaryBehavior: 'gentle',
        speed: 0.9,
        pitch: 1.0,
        volume: 0.9,
        emotion: 'warm',
        warmth: 0.8,
        engagement: 0.7,
        empathy: 0.8,
        playfulness: 0.4,
        responseLength: 'medium' as const,
        responseStyle: 'caring' as const,
        interruptionStyle: 'gentle' as const
      }
    },
    curious: {
      keywords: ['wonder', 'curious', 'interesting', 'tell me more', 'what', 'how', 'why'],
      contextual: ['really', 'interesting', 'tell me', 'what happened'],
      pleasure: 0.3,
      arousal: 0.6,
      dominance: 0.1,
      voiceBehavior: {
        primaryBehavior: 'show_interest',
        secondaryBehavior: 'engaged',
        speed: 1.0,
        pitch: 1.05,
        volume: 1.0,
        emotion: 'curious',
        warmth: 0.7,
        engagement: 0.9,
        empathy: 0.7,
        playfulness: 0.5,
        responseLength: 'medium' as const,
        responseStyle: 'casual' as const,
        interruptionStyle: 'gentle' as const
      }
    }
  };

  // Emotion override triggers (direct commands)
  private readonly emotionOverrides = {
    'laugh': { emotion: 'joy', intensity: 0.8, behavior: 'playful' },
    'whisper': { emotion: 'intimate', intensity: 0.6, behavior: 'gentle' },
    'angry': { emotion: 'anger', intensity: 0.7, behavior: 'de_escalate' },
    'sad': { emotion: 'sadness', intensity: 0.7, behavior: 'comfort' },
    'scared': { emotion: 'fear', intensity: 0.8, behavior: 'protect' },
    'excited': { emotion: 'joy', intensity: 0.9, behavior: 'share_joy' },
    'calm': { emotion: 'relief', intensity: 0.6, behavior: 'soothe' },
    'surprised': { emotion: 'surprise', intensity: 0.8, behavior: 'share_wonder' }
  };

  constructor(productionMode: boolean = true) {
    this.productionMode = productionMode;
    if (!productionMode) {
      this.log('🧠 Enhanced Emotional System initialized in DEBUG mode');
    }
  }

  // 🧠 Enhanced emotion analysis with multimodal detection
  async analyzeEmotion(text: string, sessionId: string = 'default', voiceData?: any): Promise<EnhancedEmotionalState> {
    const startTime = performance.now();
    
    // Get or create session
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = this.createNewSession(sessionId);
      this.sessions.set(sessionId, session);
    }

    // Update conversation context
    session.conversationContext.turnNumber++;
    session.conversationContext.sessionDuration = Date.now() - session.emotionalMemory.recentEmotions[0]?.timestamp || 0;

    // Multimodal emotion detection
    const lexicalEmotion = this.detectLexicalEmotion(text);
    const contextualEmotion = this.detectContextualEmotion(text, session);
    const overrideEmotion = this.detectEmotionOverrides(text);
    const prosodicEmotion = voiceData ? this.detectProsodicEmotion(voiceData) : null;

    // Combine emotions with weighted fusion
    const fusedEmotion = this.fuseEmotions(lexicalEmotion, contextualEmotion, overrideEmotion, prosodicEmotion);
    
    // Update emotional memory
    this.updateEmotionalMemory(session, fusedEmotion, text);
    
    // Determine ZOXAA's voice behavior
    const voiceBehavior = this.determineVoiceBehavior(fusedEmotion, session);
    
    // Create final emotional state
    const finalState: EnhancedEmotionalState = {
      ...fusedEmotion,
      conversationContext: session.conversationContext,
      emotionalMemory: session.emotionalMemory,
      voiceBehavior,
      isProductionMode: this.productionMode
    };

    // Cache result
    this.emotionCache.set(`${sessionId}_${text.substring(0, 50)}`, finalState);

    const latency = performance.now() - startTime;
    if (!this.productionMode) {
      this.log(`🧠 Emotion Analysis: ${fusedEmotion.primaryEmotion} (${fusedEmotion.confidenceScore.toFixed(2)}) | Latency: ${latency.toFixed(0)}ms`);
    }

    return finalState;
  }

  // 🔍 Lexical emotion detection with enhanced patterns
  private detectLexicalEmotion(text: string): EmotionConfidence[] {
    const lowerText = text.toLowerCase();
    const words = new Set(lowerText.split(/\s+/));
    const detected: EmotionConfidence[] = [];

    Object.entries(this.emotionPatterns).forEach(([emotion, pattern]) => {
      // Check keywords
      const keywordMatches = pattern.keywords.filter(keyword => 
        words.has(keyword) || lowerText.includes(keyword)
      ).length;

      // Check contextual patterns
      const contextualMatches = pattern.contextual?.filter(context => 
        lowerText.includes(context)
      ).length || 0;

      if (keywordMatches > 0 || contextualMatches > 0) {
        const intensity = Math.min(1.0, (keywordMatches + contextualMatches * 0.5) / Math.max(1, pattern.keywords.length / 3));
        const confidence = Math.min(1.0, intensity * (1 + (keywordMatches + contextualMatches) * 0.15));
        
        if (confidence >= 0.4) { // Higher threshold for better detection
          detected.push({
            emotion,
            confidence,
            intensity,
            source: 'lexical'
          });
        }
      }
    });

    return detected.sort((a, b) => b.confidence - a.confidence);
  }

  // 🎯 Contextual emotion detection
  private detectContextualEmotion(text: string, session: EnhancedEmotionalState): EmotionConfidence[] {
    const detected: EmotionConfidence[] = [];
    
    // Check for conversation flow patterns
    if (session.conversationContext.turnNumber === 1) {
      detected.push({
        emotion: 'neutral',
        confidence: 0.6,
        intensity: 0.5,
        source: 'contextual'
      });
    }

    return detected;
  }

  // ⚡ Emotion override detection (direct commands)
  private detectEmotionOverrides(text: string): EmotionConfidence[] {
    const lowerText = text.toLowerCase();
    const detected: EmotionConfidence[] = [];

    Object.entries(this.emotionOverrides).forEach(([trigger, override]) => {
      if (lowerText.includes(trigger)) {
        detected.push({
          emotion: override.emotion,
          confidence: 0.9, // High confidence for direct commands
          intensity: override.intensity,
          source: 'override'
        });
      }
    });

    return detected;
  }

  // 🎵 Prosodic emotion detection (voice analysis)
  private detectProsodicEmotion(voiceData: any): EmotionConfidence[] {
    // Placeholder for voice analysis integration
    return [];
  }

  // 🔄 Emotion fusion with weighted combination
  private fuseEmotions(lexical: EmotionConfidence[], contextual: EmotionConfidence[], override: EmotionConfidence[], prosodic: EmotionConfidence[] | null): any {
    const allEmotions = [...lexical, ...contextual, ...override, ...(prosodic || [])];
    
    if (allEmotions.length === 0) {
      return this.createNeutralState();
    }

    // Prioritize overrides, then lexical, then contextual
    const sortedEmotions = allEmotions.sort((a, b) => {
      const sourcePriority = { override: 3, lexical: 2, contextual: 1, prosodic: 1 };
      const aPriority = sourcePriority[a.source] || 0;
      const bPriority = sourcePriority[b.source] || 0;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.confidence - a.confidence;
    });

    const primary = sortedEmotions[0];
    const secondary = sortedEmotions[1];
    
    const pattern = this.emotionPatterns[primary.emotion as keyof typeof this.emotionPatterns];
    if (!pattern) return this.createNeutralState();

    return {
      pleasure: pattern.pleasure,
      arousal: pattern.arousal,
      dominance: pattern.dominance,
      primaryEmotion: primary.emotion,
      secondaryEmotion: secondary?.emotion || 'neutral',
      emotionalIntensity: primary.intensity,
      detectedEmotions: allEmotions,
      confidenceScore: primary.confidence,
      isBlendedEmotion: allEmotions.length > 1,
      sarcasmDetected: this.detectSarcasm(primary.emotion, allEmotions),
      crisisLevel: this.detectCrisis(primary.emotion, primary.intensity),
      safetyCheck: true
    };
  }

  // 🎭 Determine ZOXAA's voice behavior based on user emotion
  private determineVoiceBehavior(userEmotion: any, session: EnhancedEmotionalState): VoiceBehavior {
    const pattern = this.emotionPatterns[userEmotion.primaryEmotion as keyof typeof this.emotionPatterns];
    
    if (!pattern) {
      return this.getDefaultVoiceBehavior();
    }

    return pattern.voiceBehavior;
  }

  // 🧠 Update emotional memory
  private updateEmotionalMemory(session: EnhancedEmotionalState, emotion: any, text: string): void {
    const now = Date.now();
    
    // Add to recent emotions
    session.emotionalMemory.recentEmotions.push({
      emotion: emotion.primaryEmotion,
      timestamp: now,
      intensity: emotion.emotionalIntensity
    });

    // Keep only last 10 emotions
    if (session.emotionalMemory.recentEmotions.length > 10) {
      session.emotionalMemory.recentEmotions.shift();
    }

    // Add to conversation history
    session.emotionalMemory.conversationHistory.push({
      text: text.substring(0, 100),
      emotion: emotion.primaryEmotion,
      timestamp: now
    });

    // Keep only last 20 interactions
    if (session.emotionalMemory.conversationHistory.length > 20) {
      session.emotionalMemory.conversationHistory.shift();
    }
  }

  // 🎭 Sarcasm detection
  private detectSarcasm(emotion: string, allEmotions: EmotionConfidence[]): boolean {
    const sarcasmIndicators = ['yeah right', 'sure', 'obviously', 'whatever', 'like i care', 'oh great', 'wow', 'amazing'];
    const hasSarcasmIndicator = allEmotions.some(e => sarcasmIndicators.some(indicator => e.emotion.includes(indicator)));
    return hasSarcasmIndicator;
  }

  // 🚨 Crisis detection
  private detectCrisis(emotion: string, intensity: number): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    const crisisKeywords = ['kill myself', 'want to die', 'end it all', 'suicide', 'hurt myself', 'no point', 'give up'];
    const hasCrisisKeywords = crisisKeywords.some(keyword => emotion.includes(keyword));
    
    if (hasCrisisKeywords) return 'critical';
    if (intensity > 0.8 && (emotion === 'sadness' || emotion === 'fear')) return 'high';
    if (intensity > 0.6 && (emotion === 'anger' || emotion === 'anxiety')) return 'medium';
    return 'none';
  }

  // 🎤 Get voice settings for TTS
  getVoiceSettings(emotionalState: EnhancedEmotionalState): any {
    const behavior = emotionalState.voiceBehavior;
    
    return {
      voice: 'nova',
      speed: behavior.speed,
      pitch: behavior.pitch,
      volume: behavior.volume,
      emotion: behavior.emotion,
      ssml: true,
      emotionalModulation: true
    };
  }

  // 🎯 Get conversational response style
  getResponseStyle(emotionalState: EnhancedEmotionalState): any {
    const behavior = emotionalState.voiceBehavior;
    const context = emotionalState.conversationContext;
    
    return {
      length: behavior.responseLength,
      style: behavior.responseStyle,
      warmth: behavior.warmth,
      engagement: behavior.engagement,
      empathy: behavior.empathy,
      playfulness: behavior.playfulness,
      conversationFlow: context.conversationFlow
    };
  }

  // 🧠 Create new session
  private createNewSession(sessionId: string): EnhancedEmotionalState {
    return {
      pleasure: 0.5,
      arousal: 0.5,
      dominance: 0.5,
      primaryEmotion: 'neutral',
      secondaryEmotion: 'neutral',
      emotionalIntensity: 0.5,
      detectedEmotions: [],
      confidenceScore: 0.5,
      isBlendedEmotion: false,
      sarcasmDetected: false,
      conversationContext: {
        turnNumber: 0,
        sessionDuration: 0,
        userEngagement: 0.5,
        conversationFlow: 'greeting',
        lastUserEmotion: 'neutral',
        emotionalTrend: 'stable',
        topicContext: '',
        relationshipDepth: 0.3
      },
      emotionalMemory: {
        recentEmotions: [],
        emotionalBaseline: { pleasure: 0.5, arousal: 0.5, dominance: 0.5 },
        conversationHistory: [],
        userPreferences: new Map(),
        emotionalTriggers: new Map()
      },
      voiceBehavior: this.getDefaultVoiceBehavior(),
      crisisLevel: 'none',
      safetyCheck: true,
      isProductionMode: this.productionMode
    };
  }

  // 🎤 Default voice behavior
  private getDefaultVoiceBehavior(): VoiceBehavior {
    return {
      primaryBehavior: 'warm_greeting',
      secondaryBehavior: 'listening',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      emotion: 'warm',
      warmth: 0.7,
      engagement: 0.6,
      empathy: 0.6,
      playfulness: 0.4,
      responseLength: 'medium',
      responseStyle: 'casual',
      interruptionStyle: 'gentle'
    };
  }

  // 🎭 Create neutral state
  private createNeutralState(): any {
    return {
      pleasure: 0.5,
      arousal: 0.5,
      dominance: 0.5,
      primaryEmotion: 'neutral',
      secondaryEmotion: 'neutral',
      emotionalIntensity: 0.5,
      detectedEmotions: [],
      confidenceScore: 0.5,
      isBlendedEmotion: false,
      sarcasmDetected: false,
      crisisLevel: 'none',
      safetyCheck: true
    };
  }

  // 📝 Production-safe logging
  private log(message: string): void {
    // PRODUCTION MODE: No debug output to users
    if (!this.productionMode) {
      // Only log in development, never in production
      // console.log(message);
    }
  }
}

export default EnhancedEmotionalSystem;
