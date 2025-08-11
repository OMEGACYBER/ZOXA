// Simplified Voice System - EVI3 Level with Comprehensive Emotional Memory
// Natural voice synthesis with advanced emotional intelligence

export interface EmotionConfidence {
  emotion: string;
  confidence: number;
  intensity: number;
}

export interface EmotionalMemory {
  timestamp: number;
  emotionalState: SimplifiedEmotionalState;
  inputText: string;
  voiceData?: any; // For future voice analysis integration
  sessionId: string;
  userId?: string;
  latency?: number; // API response time tracking
  endpoint?: string; // Which API endpoint was used
}

export interface SessionEmotionalContext {
  sessionId: string;
  userId?: string;
  startTime: number;
  emotionalHistory: EmotionalMemory[];
  currentBaseline: SimplifiedEmotionalState;
  emotionalDrift: number;
  roleBaseline?: SimplifiedEmotionalState;
  lastUpdateTime: number;
  averageLatency: number;
  totalInteractions: number;
  emotionalStability: number;
}

export interface SimplifiedEmotionalState {
  pleasure: number;      // -1 to 1 (negative to positive)
  arousal: number;       // 0 to 1 (calm to excited)
  dominance: number;     // -1 to 1 (submissive to dominant)
  primaryEmotion: string;
  secondaryEmotion: string;
  emotionalIntensity: number;
  crisisLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  // Enhanced emotion detection
  detectedEmotions: EmotionConfidence[];
  confidenceThreshold: number;
  isBlendedEmotion: boolean;
  sarcasmDetected: boolean;
  emotionalStability: number;
  // Session management
  sessionId?: string;
  timestamp?: number;
  isHistorical?: boolean;
  voiceTextConflict?: boolean;
  conflictResolution?: 'text' | 'voice' | 'blend';
  // API tracking
  apiEndpoint?: string;
  processingLatency?: number;
  retryCount?: number;
}

export interface SimplifiedVoiceSettings {
  voice: 'nova';
  speed: number;
  pitch: number;
  volume: number;
  emotion: string;
  // Removed complex SSML and text markers
}

export interface APIEmotionRequest {
  text: string;
  sessionId: string;
  userId?: string;
  voiceData?: any;
  timestamp: number;
  endpoint: string;
}

export interface APIEmotionResponse {
  emotionalState: SimplifiedEmotionalState;
  latency: number;
  endpoint: string;
  timestamp: number;
  cached: boolean;
  retryCount: number;
}

export class SimplifiedVoiceSystem {
  private emotionalSessions: Map<string, SessionEmotionalContext> = new Map();
  private emotionCache: Map<string, APIEmotionResponse> = new Map();
  private readonly EMOTION_RETENTION_TIME = 30 * 60 * 1000; // 30 minutes
  private readonly EMOTION_DRIFT_THRESHOLD = 0.3;
  private readonly RECENT_EMOTION_WEIGHT = 0.7; // Weight for recent emotions
  private readonly HISTORICAL_EMOTION_WEIGHT = 0.3; // Weight for historical emotions
  private readonly MAX_SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly EMOTION_BATCH_SIZE = 10; // For batch processing

  constructor() {
    console.log('🎤 Simplified Voice System initialized with comprehensive emotional memory');
    this.startSessionCleanup();
    this.startCacheCleanup();
  }

  // 🧠 Enhanced emotional analysis with comprehensive memory and session management
  async analyzeEmotion(text: string, sessionId: string = 'default', userId?: string, voiceData?: any): Promise<SimplifiedEmotionalState> {
    const startTime = performance.now();
    const currentTime = Date.now();
    
    // Check cache first for instant response
    const cacheKey = this.generateCacheKey(text, sessionId, voiceData);
    const cachedResponse = this.emotionCache.get(cacheKey);
    if (cachedResponse && (currentTime - cachedResponse.timestamp) < this.CACHE_DURATION) {
      console.log(`⚡ Cached emotion response: ${cachedResponse.emotionalState.primaryEmotion} (${cachedResponse.latency}ms)`);
      return cachedResponse.emotionalState;
    }
    
    // Get or create session context
    const sessionContext = this.getOrCreateSession(sessionId, userId);
    
    // Analyze current emotion
    const currentEmotion = this.analyzeCurrentEmotion(text);
    
    // Check for voice-text conflicts if voice data is provided
    if (voiceData) {
      currentEmotion.voiceTextConflict = this.detectVoiceTextConflict(currentEmotion, voiceData);
      currentEmotion.conflictResolution = this.resolveVoiceTextConflict(currentEmotion, voiceData);
    }
    
    // Add session metadata
    currentEmotion.sessionId = sessionId;
    currentEmotion.timestamp = currentTime;
    
    // Store in emotional memory
    this.storeEmotionalMemory(sessionContext, currentEmotion, text, voiceData);
    
    // Calculate contextual emotion with memory
    const contextualEmotion = this.calculateContextualEmotion(sessionContext, currentEmotion);
    
    // Update session baseline and detect drift
    this.updateSessionBaseline(sessionContext, contextualEmotion);
    this.detectEmotionalDrift(sessionContext);
    
    // Maintain role consistency
    const finalEmotion = this.maintainRoleConsistency(sessionContext, contextualEmotion);
    
    // Calculate latency
    const latency = performance.now() - startTime;
    finalEmotion.processingLatency = latency;
    finalEmotion.apiEndpoint = '/api/emotion-analysis';
    
    // Cache the result
    const apiResponse: APIEmotionResponse = {
      emotionalState: finalEmotion,
      latency,
      endpoint: '/api/emotion-analysis',
      timestamp: currentTime,
      cached: false,
      retryCount: 0
    };
    this.emotionCache.set(cacheKey, apiResponse);
    
    // Update session statistics
    sessionContext.averageLatency = (sessionContext.averageLatency + latency) / 2;
    sessionContext.totalInteractions++;
    sessionContext.lastUpdateTime = currentTime;
    
    console.log(`🧠 Emotional Analysis: ${finalEmotion.primaryEmotion} (${finalEmotion.confidenceThreshold.toFixed(2)} confidence) | Session: ${sessionId} | Drift: ${sessionContext.emotionalDrift.toFixed(2)} | Latency: ${latency.toFixed(0)}ms`);
    
    return finalEmotion;
  }

  // ⚡ FAST current emotion analysis (optimized for speed)
  private analyzeCurrentEmotion(text: string): SimplifiedEmotionalState {
    const lowerText = text.toLowerCase();
    
    // ⚡ Enhanced emotion patterns with multi-label classification
    const emotionPatterns = {
      joy: {
        keywords: ['happy', 'joy', 'excited', 'thrilled', 'amazing', 'wonderful', 'great', 'love', 'good', 'nice', 'fantastic', 'brilliant'],
        pleasure: 0.9,
        arousal: 0.7,
        dominance: 0.6
      },
      sadness: {
        keywords: ['sad', 'depressed', 'down', 'lonely', 'hurt', 'crying', 'empty', 'hopeless', 'bad', 'terrible', 'miserable', 'grief'],
        pleasure: -0.8,
        arousal: 0.2,
        dominance: -0.3
      },
      anxiety: {
        keywords: ['anxious', 'worried', 'scared', 'nervous', 'panic', 'stress', 'overwhelmed', 'afraid', 'fear', 'terrified', 'dread'],
        pleasure: -0.6,
        arousal: 0.8,
        dominance: -0.4
      },
      anger: {
        keywords: ['angry', 'mad', 'furious', 'hate', 'annoyed', 'frustrated', 'rage', 'upset', 'angry', 'livid', 'enraged'],
        pleasure: -0.4,
        arousal: 0.9,
        dominance: 0.2
      },
      surprise: {
        keywords: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'wow', 'unexpected'],
        pleasure: 0.3,
        arousal: 0.8,
        dominance: 0.1
      },
      disgust: {
        keywords: ['disgusted', 'revolted', 'sickened', 'gross', 'nasty', 'repulsive'],
        pleasure: -0.9,
        arousal: 0.6,
        dominance: -0.2
      },
      contempt: {
        keywords: ['contempt', 'disdain', 'scorn', 'mock', 'ridicule', 'sarcastic'],
        pleasure: -0.7,
        arousal: 0.4,
        dominance: 0.3
      },
      fear: {
        keywords: ['fear', 'terrified', 'horrified', 'petrified', 'dread', 'terror'],
        pleasure: -0.9,
        arousal: 0.9,
        dominance: -0.8
      },
      relief: {
        keywords: ['relieved', 'thankful', 'grateful', 'peaceful', 'calm', 'serene'],
        pleasure: 0.7,
        arousal: 0.2,
        dominance: 0.4
      },
      pride: {
        keywords: ['proud', 'accomplished', 'achieved', 'successful', 'confident', 'triumphant'],
        pleasure: 0.8,
        arousal: 0.6,
        dominance: 0.8
      },
      shame: {
        keywords: ['ashamed', 'embarrassed', 'guilty', 'humiliated', 'mortified'],
        pleasure: -0.6,
        arousal: 0.5,
        dominance: -0.7
      },
      // Blended emotions
      bittersweet: {
        keywords: ['bittersweet', 'mixed feelings', 'conflicted', 'torn', 'complicated'],
        pleasure: 0.1,
        arousal: 0.5,
        dominance: 0.0
      },
      relieved_anxious: {
        keywords: ['relieved but anxious', 'calm but worried', 'peaceful but nervous'],
        pleasure: 0.3,
        arousal: 0.6,
        dominance: 0.1
      }
    };

    // ⚡ Enhanced multi-label emotion detection with confidence scores
    const detectedEmotions: EmotionConfidence[] = [];
    const confidenceThreshold = 0.3; // Minimum confidence for emotion detection
    let maxIntensity = 0;
    let primaryEmotion = 'neutral';
    let secondaryEmotion = 'neutral';
    let isBlendedEmotion = false;
    let sarcasmDetected = false;
    
    // ⚡ Optimized: Use Set for faster keyword matching
    const textWords = new Set(lowerText.split(/\s+/));
    
    // Sarcasm detection
    const sarcasmIndicators = ['yeah right', 'sure', 'obviously', 'whatever', 'like i care', 'oh great'];
    sarcasmDetected = sarcasmIndicators.some(indicator => lowerText.includes(indicator));
    
    Object.entries(emotionPatterns).forEach(([emotion, pattern]: [string, any]) => {
      // ⚡ Faster keyword matching using Set intersection
      const keywordMatches = pattern.keywords.filter((keyword: string) => 
        textWords.has(keyword) || lowerText.includes(keyword)
      ).length;
      
      if (keywordMatches > 0) {
        const intensity = Math.min(1.0, keywordMatches / Math.max(1, pattern.keywords.length / 2));
        const confidence = Math.min(1.0, intensity * (1 + keywordMatches * 0.1));
        
        if (confidence >= confidenceThreshold) {
          detectedEmotions.push({
            emotion,
            confidence,
            intensity
          });
          
          if (intensity > maxIntensity) {
            maxIntensity = intensity;
            primaryEmotion = emotion;
          }
        }
      }
    });
    
    // Sort emotions by confidence for secondary emotion
    detectedEmotions.sort((a, b) => b.confidence - a.confidence);
    if (detectedEmotions.length > 1) {
      secondaryEmotion = detectedEmotions[1].emotion;
      isBlendedEmotion = true;
    }
    
    // Calculate PAD values based on detected emotions
    let pleasure = 0.5;
    let arousal = 0.5;
    let dominance = 0.5;
    let emotionalIntensity = 0.5;
    
    if (detectedEmotions.length > 0) {
      const primaryPattern = emotionPatterns[primaryEmotion as keyof typeof emotionPatterns];
      if (primaryPattern) {
        pleasure = primaryPattern.pleasure;
        arousal = primaryPattern.arousal;
        dominance = primaryPattern.dominance;
        emotionalIntensity = maxIntensity;
      }
    }
    
    // Adjust for sarcasm
    if (sarcasmDetected) {
      pleasure = -pleasure * 0.5; // Invert pleasure for sarcasm
      arousal = arousal * 1.2; // Increase arousal
    }
    
    const emotionalState: SimplifiedEmotionalState = {
      pleasure,
      arousal,
      dominance,
      primaryEmotion,
      secondaryEmotion,
      emotionalIntensity,
      crisisLevel: 'none',
      detectedEmotions,
      confidenceThreshold,
      isBlendedEmotion,
      sarcasmDetected,
      emotionalStability: 0.7 // Default stability
    };

    // Crisis detection
    const crisisKeywords = ['kill myself', 'want to die', 'end it all', 'suicide', 'hurt myself'];
    const hasCrisisKeywords = crisisKeywords.some(keyword => lowerText.includes(keyword));
    if (hasCrisisKeywords) {
      emotionalState.crisisLevel = 'critical';
      emotionalState.primaryEmotion = 'crisis';
    }

    return emotionalState;
  }

  // Enhanced voice settings with blended emotion support
  getVoiceSettings(emotionalState: SimplifiedEmotionalState): SimplifiedVoiceSettings {
    const { 
      crisisLevel, 
      emotionalIntensity, 
      pleasure, 
      primaryEmotion, 
      secondaryEmotion, 
      isBlendedEmotion, 
      sarcasmDetected,
      detectedEmotions 
    } = emotionalState;

    // Always use Nova for natural voice
    const voice = 'nova';
    
    let speed = 1.0;
    let pitch = 1.0;
    let volume = 1.0;
    let emotion = 'neutral';

    // Crisis response - immediate and caring
    if (crisisLevel === 'critical') {
      speed = 0.75;
      pitch = 0.9;
      volume = 0.85;
      emotion = 'comforting';
    }
    // High intensity emotions
    else if (emotionalIntensity > 0.7) {
      if (pleasure > 0.5) {
        // Joy - slightly excited but controlled
        speed = 1.1;
        pitch = 1.1;
        volume = 1.05;
        emotion = 'excited';
      } else {
        // Other high intensity - calm and steady
        speed = 0.95;
        pitch = 0.95;
        volume = 0.95;
        emotion = 'calm';
      }
    }
    // Enhanced emotion adaptations with blended emotions
    else {
      // Handle blended emotions
      if (isBlendedEmotion) {
        switch (primaryEmotion) {
          case 'bittersweet':
            speed = 0.9;
            pitch = 0.95;
            volume = 0.9;
            emotion = 'contemplative';
            break;
          case 'relieved_anxious':
            speed = 0.95;
            pitch = 1.0;
            volume = 0.95;
            emotion = 'calm_concerned';
            break;
          default:
            // Blend primary and secondary emotions
            const primarySettings = this.getEmotionSettings(primaryEmotion);
            const secondarySettings = this.getEmotionSettings(secondaryEmotion);
            speed = (primarySettings.speed + secondarySettings.speed) / 2;
            pitch = (primarySettings.pitch + secondarySettings.pitch) / 2;
            volume = (primarySettings.volume + secondarySettings.volume) / 2;
            emotion = `${primaryEmotion}_${secondaryEmotion}`;
        }
      }
      // Handle sarcasm
      else if (sarcasmDetected) {
        speed = 0.9;
        pitch = 1.1;
        volume = 0.95;
        emotion = 'sarcastic';
      }
      // Handle specific emotions
      else {
        const settings = this.getEmotionSettings(primaryEmotion);
        speed = settings.speed;
        pitch = settings.pitch;
        volume = settings.volume;
        emotion = settings.emotion;
      }
    }

    return {
      voice,
      speed: Math.max(0.5, Math.min(2.0, speed)),
      pitch: Math.max(0.5, Math.min(2.0, pitch)),
      volume: Math.max(0.5, Math.min(2.0, volume)),
      emotion
    };
  }

  // Helper method for emotion-specific voice settings
  private getEmotionSettings(emotion: string): { speed: number; pitch: number; volume: number; emotion: string } {
    switch (emotion) {
      case 'joy':
        return { speed: 1.05, pitch: 1.1, volume: 1.05, emotion: 'happy' };
      case 'sadness':
        return { speed: 0.9, pitch: 0.9, volume: 0.9, emotion: 'sad' };
      case 'anxiety':
        return { speed: 0.9, pitch: 0.95, volume: 0.9, emotion: 'calm' };
      case 'anger':
        return { speed: 0.95, pitch: 0.95, volume: 0.95, emotion: 'calm' };
      case 'surprise':
        return { speed: 1.1, pitch: 1.2, volume: 1.1, emotion: 'surprised' };
      case 'disgust':
        return { speed: 0.85, pitch: 0.9, volume: 0.85, emotion: 'disgusted' };
      case 'contempt':
        return { speed: 0.9, pitch: 0.95, volume: 0.9, emotion: 'contemptuous' };
      case 'fear':
        return { speed: 0.9, pitch: 0.9, volume: 0.85, emotion: 'fearful' };
      case 'relief':
        return { speed: 0.95, pitch: 1.0, volume: 0.95, emotion: 'relieved' };
      case 'pride':
        return { speed: 1.0, pitch: 1.1, volume: 1.05, emotion: 'proud' };
      case 'shame':
        return { speed: 0.85, pitch: 0.85, volume: 0.8, emotion: 'ashamed' };
      default:
        return { speed: 1.0, pitch: 1.0, volume: 1.0, emotion: 'warm' };
    }
  }

  // Natural text processing (no complex expressions)
  processTextForSpeech(text: string): string {
    // Simple text cleaning
    let processedText = text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\*[^*]*\*/g, '') // Remove action tags
      .trim();

    // Add natural pauses based on punctuation
    processedText = processedText.replace(/([.!?])\s+/g, '$1... ');
    
    return processedText;
  }

  // 🧠 Determine ZOXAA's emotional state based on user's emotion
  determineZoxaaEmotionalState(userEmotion: SimplifiedEmotionalState): SimplifiedEmotionalState {
    const { primaryEmotion, emotionalIntensity, crisisLevel, pleasure, arousal, dominance } = userEmotion;
    
    // 🚨 Crisis response - ZOXAA becomes caring and supportive
    if (crisisLevel === 'critical') {
      return {
        ...this.createNeutralBaseline(),
        primaryEmotion: 'caring',
        secondaryEmotion: 'supportive',
        pleasure: 0.3, // Slightly positive to show care
        arousal: 0.4, // Calm but attentive
        dominance: 0.2, // Gentle and supportive
        emotionalIntensity: 0.6, // Moderate intensity for caring
        crisisLevel: 'none', // ZOXAA doesn't mirror crisis
        detectedEmotions: [],
        confidenceThreshold: 0.8,
        isBlendedEmotion: false,
        sarcasmDetected: false,
        emotionalStability: 0.9 // Very stable for crisis support
      };
    }
    
    if (crisisLevel === 'high') {
      return {
        ...this.createNeutralBaseline(),
        primaryEmotion: 'supportive',
        secondaryEmotion: 'calm',
        pleasure: 0.4,
        arousal: 0.3,
        dominance: 0.3,
        emotionalIntensity: 0.5,
        crisisLevel: 'none',
        detectedEmotions: [],
        confidenceThreshold: 0.7,
        isBlendedEmotion: false,
        sarcasmDetected: false,
        emotionalStability: 0.8
      };
    }
    
    // 🎭 ZOXAA's emotional responses to user emotions
    const zoxaaEmotionalResponses = {
      joy: {
        primaryEmotion: 'happy',
        secondaryEmotion: 'excited',
        pleasure: 0.8, // ZOXAA shares the joy
        arousal: 0.6, // Moderately excited
        dominance: 0.5, // Balanced
        emotionalIntensity: Math.min(0.8, emotionalIntensity + 0.1) // Slightly amplify
      },
      sadness: {
        primaryEmotion: 'caring',
        secondaryEmotion: 'gentle',
        pleasure: 0.3, // Slightly positive to show support
        arousal: 0.3, // Calm and gentle
        dominance: 0.2, // Gentle and supportive
        emotionalIntensity: Math.max(0.4, emotionalIntensity - 0.2) // Softer response
      },
      anxiety: {
        primaryEmotion: 'calm',
        secondaryEmotion: 'reassuring',
        pleasure: 0.4, // Slightly positive to reassure
        arousal: 0.3, // Very calm to help user calm down
        dominance: 0.3, // Gentle guidance
        emotionalIntensity: Math.max(0.3, emotionalIntensity - 0.3) // Much calmer
      },
      anger: {
        primaryEmotion: 'calm',
        secondaryEmotion: 'understanding',
        pleasure: 0.3, // Neutral to slightly positive
        arousal: 0.3, // Very calm to de-escalate
        dominance: 0.2, // Gentle and understanding
        emotionalIntensity: Math.max(0.3, emotionalIntensity - 0.4) // Much calmer
      },
      fear: {
        primaryEmotion: 'protective',
        secondaryEmotion: 'calm',
        pleasure: 0.3, // Slightly positive to comfort
        arousal: 0.3, // Very calm to help user feel safe
        dominance: 0.4, // Slightly more dominant to provide protection
        emotionalIntensity: Math.max(0.4, emotionalIntensity - 0.3) // Calmer but protective
      },
      surprise: {
        primaryEmotion: 'curious',
        secondaryEmotion: 'interested',
        pleasure: 0.6, // Positive curiosity
        arousal: 0.5, // Moderately excited
        dominance: 0.4, // Balanced
        emotionalIntensity: Math.min(0.7, emotionalIntensity + 0.1) // Slightly amplify
      },
      disgust: {
        primaryEmotion: 'understanding',
        secondaryEmotion: 'neutral',
        pleasure: 0.2, // Slightly negative to show understanding
        arousal: 0.3, // Calm
        dominance: 0.3, // Balanced
        emotionalIntensity: Math.max(0.3, emotionalIntensity - 0.3) // Much calmer
      },
      contempt: {
        primaryEmotion: 'neutral',
        secondaryEmotion: 'understanding',
        pleasure: 0.3, // Neutral
        arousal: 0.3, // Calm
        dominance: 0.3, // Balanced
        emotionalIntensity: Math.max(0.3, emotionalIntensity - 0.4) // Much calmer
      },
      relief: {
        primaryEmotion: 'happy',
        secondaryEmotion: 'relieved',
        pleasure: 0.7, // Share the relief
        arousal: 0.4, // Calm but happy
        dominance: 0.4, // Balanced
        emotionalIntensity: Math.min(0.7, emotionalIntensity + 0.1) // Slightly amplify
      },
      pride: {
        primaryEmotion: 'proud',
        secondaryEmotion: 'happy',
        pleasure: 0.8, // Share the pride
        arousal: 0.6, // Moderately excited
        dominance: 0.5, // Balanced
        emotionalIntensity: Math.min(0.8, emotionalIntensity + 0.1) // Slightly amplify
      },
      shame: {
        primaryEmotion: 'caring',
        secondaryEmotion: 'gentle',
        pleasure: 0.3, // Slightly positive to show support
        arousal: 0.3, // Calm and gentle
        dominance: 0.2, // Gentle and supportive
        emotionalIntensity: Math.max(0.3, emotionalIntensity - 0.3) // Much softer
      },
      sarcasm: {
        primaryEmotion: 'understanding',
        secondaryEmotion: 'neutral',
        pleasure: 0.2, // Slightly negative to show understanding
        arousal: 0.3, // Calm
        dominance: 0.3, // Balanced
        emotionalIntensity: Math.max(0.3, emotionalIntensity - 0.4) // Much calmer
      },
      neutral: {
        primaryEmotion: 'warm',
        secondaryEmotion: 'friendly',
        pleasure: 0.6, // Slightly positive
        arousal: 0.4, // Calm but engaged
        dominance: 0.4, // Balanced
        emotionalIntensity: 0.5 // Moderate
      }
    };
    
    const response = zoxaaEmotionalResponses[primaryEmotion as keyof typeof zoxaaEmotionalResponses] || zoxaaEmotionalResponses.neutral;
    
    return {
      ...this.createNeutralBaseline(),
      ...response,
      detectedEmotions: [],
      confidenceThreshold: 0.7,
      isBlendedEmotion: false,
      sarcasmDetected: false,
      emotionalStability: 0.8 // ZOXAA is emotionally stable
    };
  }

  // Simplified response generation (for text content - not used for voice behavior)
  getEmotionalResponse(emotionalState: SimplifiedEmotionalState): string {
    const { primaryEmotion, emotionalIntensity, crisisLevel, pleasure, arousal, dominance } = emotionalState;
    
    // 🚨 Crisis response - immediate emotional support
    if (crisisLevel === 'critical') {
      return "I'm really concerned about how you're feeling right now. You're not alone, and I'm here for you. Please know that you matter and your feelings are valid.";
    }
    
    if (crisisLevel === 'high') {
      return "I can sense you're going through something really difficult. I'm here to listen and support you. You don't have to face this alone.";
    }
    
    // 🎭 High intensity emotional responses (intensity > 0.7)
    if (emotionalIntensity > 0.7) {
      const highIntensityResponses = {
        joy: [
          "That's absolutely amazing! I'm so thrilled for you!",
          "This is wonderful! I can feel your excitement!",
          "That's fantastic! I'm genuinely happy for you!"
        ],
        sadness: [
          "I'm so sorry you're going through this. I'm here for you.",
          "This sounds really hard. I want you to know I care.",
          "I can feel how difficult this is for you. I'm here to listen."
        ],
        anxiety: [
          "It's going to be okay. I'm here for you.",
          "You've got this. I believe in you.",
          "I understand this is scary. I'm here to support you."
        ],
        anger: [
          "I understand you're frustrated. That's completely valid.",
          "I'm here to listen. Your feelings matter.",
          "That's really unfair. I'm here for you."
        ],
        fear: [
          "I can sense you're scared. I'm here with you.",
          "You're safe. I'm here to help you through this.",
          "I understand this is frightening. I'm here."
        ],
        surprise: [
          "Wow! That's incredible!",
          "That's amazing! I'm so surprised!",
          "That's unexpected! How exciting!"
        ],
        disgust: [
          "That sounds really unpleasant. I'm sorry.",
          "I understand why you'd feel that way.",
          "That's really not okay. I'm here."
        ],
        contempt: [
          "I understand your frustration. I'm here.",
          "That's really disappointing. I'm sorry.",
          "I can see why you'd feel that way."
        ],
        relief: [
          "I'm so glad you're feeling better!",
          "That's wonderful! I'm relieved for you!",
          "That's great news! I'm happy for you!"
        ],
        pride: [
          "You should be proud! That's amazing!",
          "I'm so proud of you! That's incredible!",
          "That's fantastic! You've done so well!"
        ],
        shame: [
          "You don't need to feel ashamed. I'm here.",
          "I understand. You're not alone.",
          "It's okay. I'm here to support you."
        ],
        sarcasm: [
          "I hear the frustration in your voice.",
          "I understand you're not happy about this.",
          "I can sense your disappointment."
        ]
      };
      
      const emotionResponses = highIntensityResponses[primaryEmotion as keyof typeof highIntensityResponses] || ["I hear you", "Tell me more"];
      return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
    }
    
    // 🎯 Medium intensity responses (intensity 0.4-0.7)
    if (emotionalIntensity > 0.4) {
      const mediumIntensityResponses = {
        joy: ["That's great!", "I'm happy for you!", "Wonderful!"],
        sadness: ["I'm sorry", "That's tough", "I'm here"],
        anxiety: ["It'll be okay", "I'm here", "You're not alone"],
        anger: ["I understand", "That's valid", "I'm listening"],
        fear: ["I'm here", "You're safe", "I understand"],
        surprise: ["That's interesting!", "Wow!", "Really?"],
        disgust: ["I understand", "That's not good", "I'm sorry"],
        contempt: ["I see", "I understand", "That's disappointing"],
        relief: ["That's good", "I'm glad", "That's better"],
        pride: ["That's great!", "Well done!", "Good for you!"],
        shame: ["It's okay", "I understand", "You're not alone"],
        sarcasm: ["I hear you", "I understand", "I see"],
        neutral: ["I hear you", "Tell me more", "I'm listening"]
      };
      
      const emotionResponses = mediumIntensityResponses[primaryEmotion as keyof typeof mediumIntensityResponses] || mediumIntensityResponses.neutral;
      return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
    }
    
    // 😊 Low intensity responses (intensity < 0.4)
    const lowIntensityResponses = {
      joy: ["That's nice", "Good", "I'm glad"],
      sadness: ["I'm sorry", "That's unfortunate", "I understand"],
      anxiety: ["It's okay", "Don't worry", "I'm here"],
      anger: ["I understand", "That's fair", "I see"],
      fear: ["It's okay", "You're safe", "I'm here"],
      surprise: ["Interesting", "Really?", "Hmm"],
      disgust: ["I see", "That's not good", "I understand"],
      contempt: ["I understand", "I see", "That's disappointing"],
      relief: ["Good", "That's better", "I'm glad"],
      pride: ["Good", "Well done", "Nice"],
      shame: ["It's okay", "Don't worry", "I understand"],
      sarcasm: ["I see", "I understand", "I hear you"],
      neutral: ["I hear you", "Tell me more", "I'm listening"]
    };
    
    const emotionResponses = lowIntensityResponses[primaryEmotion as keyof typeof lowIntensityResponses] || lowIntensityResponses.neutral;
    return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
  }

  // 🧠 EMOTIONAL MEMORY MANAGEMENT METHODS

  // Get or create session context
  private getOrCreateSession(sessionId: string, userId?: string): SessionEmotionalContext {
    if (!this.emotionalSessions.has(sessionId)) {
      const newSession: SessionEmotionalContext = {
        sessionId,
        userId,
        startTime: Date.now(),
        emotionalHistory: [],
        currentBaseline: this.createNeutralBaseline(),
        emotionalDrift: 0,
        lastUpdateTime: Date.now(),
        averageLatency: 0,
        totalInteractions: 0,
        emotionalStability: 0.7
      };
      this.emotionalSessions.set(sessionId, newSession);
      console.log(`🧠 Created new emotional session: ${sessionId}`);
    }
    return this.emotionalSessions.get(sessionId)!;
  }

  // Store emotional memory
  private storeEmotionalMemory(sessionContext: SessionEmotionalContext, emotionalState: SimplifiedEmotionalState, text: string, voiceData?: any): void {
    const memory: EmotionalMemory = {
      timestamp: Date.now(),
      emotionalState: { ...emotionalState },
      inputText: text,
      voiceData,
      sessionId: sessionContext.sessionId,
      userId: sessionContext.userId
    };
    
    sessionContext.emotionalHistory.push(memory);
    
    // Keep only recent memories (last 30 minutes)
    const cutoffTime = Date.now() - this.EMOTION_RETENTION_TIME;
    sessionContext.emotionalHistory = sessionContext.emotionalHistory.filter(
      memory => memory.timestamp > cutoffTime
    );
  }

  // Calculate contextual emotion with memory
  private calculateContextualEmotion(sessionContext: SessionEmotionalContext, currentEmotion: SimplifiedEmotionalState): SimplifiedEmotionalState {
    if (sessionContext.emotionalHistory.length === 0) {
      return currentEmotion;
    }

    // Get recent emotions (last 5 minutes)
    const recentCutoff = Date.now() - (5 * 60 * 1000);
    const recentEmotions = sessionContext.emotionalHistory.filter(
      memory => memory.timestamp > recentCutoff
    );

    // Calculate weighted average
    let weightedPleasure = currentEmotion.pleasure * this.RECENT_EMOTION_WEIGHT;
    let weightedArousal = currentEmotion.arousal * this.RECENT_EMOTION_WEIGHT;
    let weightedDominance = currentEmotion.dominance * this.RECENT_EMOTION_WEIGHT;
    let weightedIntensity = currentEmotion.emotionalIntensity * this.RECENT_EMOTION_WEIGHT;

    if (recentEmotions.length > 0) {
      const historicalPleasure = recentEmotions.reduce((sum, mem) => sum + mem.emotionalState.pleasure, 0) / recentEmotions.length;
      const historicalArousal = recentEmotions.reduce((sum, mem) => sum + mem.emotionalState.arousal, 0) / recentEmotions.length;
      const historicalDominance = recentEmotions.reduce((sum, mem) => sum + mem.emotionalState.dominance, 0) / recentEmotions.length;
      const historicalIntensity = recentEmotions.reduce((sum, mem) => sum + mem.emotionalState.emotionalIntensity, 0) / recentEmotions.length;

      weightedPleasure += historicalPleasure * this.HISTORICAL_EMOTION_WEIGHT;
      weightedArousal += historicalArousal * this.HISTORICAL_EMOTION_WEIGHT;
      weightedDominance += historicalDominance * this.HISTORICAL_EMOTION_WEIGHT;
      weightedIntensity += historicalIntensity * this.HISTORICAL_EMOTION_WEIGHT;
    }

    return {
      ...currentEmotion,
      pleasure: weightedPleasure,
      arousal: weightedArousal,
      dominance: weightedDominance,
      emotionalIntensity: weightedIntensity,
      isHistorical: true
    };
  }

  // Update session baseline
  private updateSessionBaseline(sessionContext: SessionEmotionalContext, emotionalState: SimplifiedEmotionalState): void {
    // Update baseline with exponential moving average
    const alpha = 0.1; // Smoothing factor
    sessionContext.currentBaseline.pleasure = alpha * emotionalState.pleasure + (1 - alpha) * sessionContext.currentBaseline.pleasure;
    sessionContext.currentBaseline.arousal = alpha * emotionalState.arousal + (1 - alpha) * sessionContext.currentBaseline.arousal;
    sessionContext.currentBaseline.dominance = alpha * emotionalState.dominance + (1 - alpha) * sessionContext.currentBaseline.dominance;
    sessionContext.currentBaseline.emotionalIntensity = alpha * emotionalState.emotionalIntensity + (1 - alpha) * sessionContext.currentBaseline.emotionalIntensity;
  }

  // Detect emotional drift
  private detectEmotionalDrift(sessionContext: SessionEmotionalContext): void {
    const baseline = sessionContext.currentBaseline;
    const recentEmotions = sessionContext.emotionalHistory.slice(-5); // Last 5 emotions
    
    if (recentEmotions.length === 0) return;

    const recentPleasure = recentEmotions.reduce((sum, mem) => sum + mem.emotionalState.pleasure, 0) / recentEmotions.length;
    const recentArousal = recentEmotions.reduce((sum, mem) => sum + mem.emotionalState.arousal, 0) / recentEmotions.length;
    const recentDominance = recentEmotions.reduce((sum, mem) => sum + mem.emotionalState.dominance, 0) / recentEmotions.length;

    const driftPleasure = Math.abs(recentPleasure - baseline.pleasure);
    const driftArousal = Math.abs(recentArousal - baseline.arousal);
    const driftDominance = Math.abs(recentDominance - baseline.dominance);

    sessionContext.emotionalDrift = (driftPleasure + driftArousal + driftDominance) / 3;

    if (sessionContext.emotionalDrift > this.EMOTION_DRIFT_THRESHOLD) {
      console.log(`⚠️ Emotional drift detected: ${sessionContext.emotionalDrift.toFixed(2)}`);
    }
  }

  // Maintain role consistency
  private maintainRoleConsistency(sessionContext: SessionEmotionalContext, emotionalState: SimplifiedEmotionalState): SimplifiedEmotionalState {
    // If no role baseline is set, use current as baseline
    if (!sessionContext.roleBaseline) {
      sessionContext.roleBaseline = { ...emotionalState };
      return emotionalState;
    }

    // Check if emotional state is too far from role baseline
    const roleDrift = Math.abs(emotionalState.pleasure - sessionContext.roleBaseline.pleasure) +
                     Math.abs(emotionalState.arousal - sessionContext.roleBaseline.arousal) +
                     Math.abs(emotionalState.dominance - sessionContext.roleBaseline.dominance);

    if (roleDrift > 1.5) { // Significant deviation from role
      // Gradually adjust back to role baseline
      const adjustmentFactor = 0.3;
      return {
        ...emotionalState,
        pleasure: emotionalState.pleasure * (1 - adjustmentFactor) + sessionContext.roleBaseline.pleasure * adjustmentFactor,
        arousal: emotionalState.arousal * (1 - adjustmentFactor) + sessionContext.roleBaseline.arousal * adjustmentFactor,
        dominance: emotionalState.dominance * (1 - adjustmentFactor) + sessionContext.roleBaseline.dominance * adjustmentFactor
      };
    }

    return emotionalState;
  }

  // Detect voice-text conflicts
  private detectVoiceTextConflict(emotionalState: SimplifiedEmotionalState, voiceData: any): boolean {
    // This would integrate with voice analysis system
    // For now, return false as placeholder
    return false;
  }

  // Resolve voice-text conflicts
  private resolveVoiceTextConflict(emotionalState: SimplifiedEmotionalState, voiceData: any): 'text' | 'voice' | 'blend' {
    // This would analyze voice data and determine resolution strategy
    // For now, default to text
    return 'text';
  }

  // Create neutral baseline
  private createNeutralBaseline(): SimplifiedEmotionalState {
    return {
      pleasure: 0.5,
      arousal: 0.5,
      dominance: 0.5,
      primaryEmotion: 'neutral',
      secondaryEmotion: 'neutral',
      emotionalIntensity: 0.5,
      crisisLevel: 'none',
      detectedEmotions: [],
      confidenceThreshold: 0.3,
      isBlendedEmotion: false,
      sarcasmDetected: false,
      emotionalStability: 0.7
    };
  }

  // Generate cache key
  private generateCacheKey(text: string, sessionId: string, voiceData?: any): string {
    const textHash = text.toLowerCase().replace(/\s+/g, '').substring(0, 50);
    const voiceHash = voiceData ? JSON.stringify(voiceData).substring(0, 20) : '';
    return `${sessionId}_${textHash}_${voiceHash}`;
  }

  // Session cleanup
  private startSessionCleanup(): void {
    setInterval(() => {
      const currentTime = Date.now();
      for (const [sessionId, session] of this.emotionalSessions.entries()) {
        if (currentTime - session.startTime > this.MAX_SESSION_DURATION) {
          this.emotionalSessions.delete(sessionId);
          console.log(`🧠 Cleaned up expired session: ${sessionId}`);
        }
      }
    }, 60 * 1000); // Check every minute
  }

  // Cache cleanup
  private startCacheCleanup(): void {
    setInterval(() => {
      const currentTime = Date.now();
      for (const [key, response] of this.emotionCache.entries()) {
        if (currentTime - response.timestamp > this.CACHE_DURATION) {
          this.emotionCache.delete(key);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  // 🚀 API & PIPELINE METHODS

  // Batch emotion analysis
  async analyzeEmotionsBatch(requests: APIEmotionRequest[]): Promise<APIEmotionResponse[]> {
    const responses: APIEmotionResponse[] = [];
    
    for (const request of requests) {
      try {
        const startTime = performance.now();
        const emotionalState = await this.analyzeEmotion(request.text, request.sessionId, request.userId, request.voiceData);
        const latency = performance.now() - startTime;
        
        responses.push({
          emotionalState,
          latency,
          endpoint: request.endpoint,
          timestamp: request.timestamp,
          cached: false,
          retryCount: 0
        });
      } catch (error) {
        console.error(`❌ Batch emotion analysis failed for session ${request.sessionId}:`, error);
        responses.push({
          emotionalState: this.createNeutralBaseline(),
          latency: 0,
          endpoint: request.endpoint,
          timestamp: request.timestamp,
          cached: false,
          retryCount: 1
        });
      }
    }
    
    return responses;
  }

  // Get session statistics
  getSessionStats(sessionId: string): SessionEmotionalContext | null {
    return this.emotionalSessions.get(sessionId) || null;
  }

  // Get emotional history
  getEmotionalHistory(sessionId: string, limit: number = 50): EmotionalMemory[] {
    const session = this.emotionalSessions.get(sessionId);
    if (!session) return [];
    
    return session.emotionalHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Set role baseline
  setRoleBaseline(sessionId: string, baseline: SimplifiedEmotionalState): void {
    const session = this.emotionalSessions.get(sessionId);
    if (session) {
      session.roleBaseline = baseline;
      console.log(`🎭 Set role baseline for session ${sessionId}`);
    }
  }

  // Get worst-case latency estimate
  getWorstCaseLatency(): number {
    // Estimate based on current system performance
    return 5000; // 5 seconds worst case
  }

  // Export session data for debugging
  exportSessionData(sessionId: string): any {
    const session = this.emotionalSessions.get(sessionId);
    if (!session) return null;
    
    return {
      sessionId: session.sessionId,
      userId: session.userId,
      startTime: session.startTime,
      duration: Date.now() - session.startTime,
      totalInteractions: session.totalInteractions,
      averageLatency: session.averageLatency,
      emotionalDrift: session.emotionalDrift,
      emotionalStability: session.emotionalStability,
      historyCount: session.emotionalHistory.length,
      currentBaseline: session.currentBaseline,
      roleBaseline: session.roleBaseline
    };
  }
}

export default SimplifiedVoiceSystem;
