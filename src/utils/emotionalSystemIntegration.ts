// 🔗 Emotional System Integration - ZOXAA Voice Intelligence
// Coordinates all components, manages data flow, and handles errors

import EnhancedEmotionalSystem, { EnhancedEmotionalState } from './enhancedEmotionalSystem';
import VoiceProsodyAnalyzer, { ProsodyFrame } from './voiceProsodyAnalyzer';
import ConversationManager from './conversationManager';
import ProductionLogger from './productionLogger';
import EmotionalLearningSystem from './emotionalLearning';
import AdvancedVoiceSynthesis from './advancedVoiceSynthesis';
import ConversationFlowManager from './conversationFlowManager';
import EmotionalAnalytics from './emotionalAnalytics';
import ResponseGenerator from './responseGenerator';
import { prosodyToEmotion } from './enhancedEmotionPatterns';

export interface SystemConfig {
  productionMode: boolean;
  enableLearning: boolean;
  enableAnalytics: boolean;
  enableVoiceAnalysis: boolean;
  enableResponseGeneration: boolean;
  maxLatency: number;
  errorRetryAttempts: number;
  sessionTimeout: number;
}

export interface SystemState {
  isInitialized: boolean;
  isHealthy: boolean;
  activeSessions: number;
  totalInteractions: number;
  averageLatency: number;
  errorRate: number;
  lastHealthCheck: number;
}

export interface IntegrationRequest {
  sessionId: string;
  userInput: string;
  voiceData?: Float32Array;
  context?: RequestContext;
  priority?: 'high' | 'medium' | 'low';
}

export interface RequestContext {
  turnNumber: number;
  sessionDuration: number;
  userEngagement: number;
  conversationFlow: string;
  topicContext: string;
  relationshipDepth: number;
}

export interface IntegrationResponse {
  success: boolean;
  emotionalState: EnhancedEmotionalState;
  voiceSettings: VoiceSettings;
  responseText?: string;
  conversationFlow: ConversationFlowData;
  analytics: AnalyticsData;
  latency: number;
  errors: string[];
}

export interface VoiceSettings {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  emotion: string;
  ssml: boolean;
  emotionalModulation: boolean;
}

export interface ConversationFlowData {
  phase: string;
  turnNumber: number;
  engagement: number;
  naturalFlow: boolean;
  pauseDuration: number;
}

export interface AnalyticsData {
  emotionalMetrics: EmotionalMetric[];
  engagementPatterns: EngagementPattern[];
  qualityIndicators: QualityIndicator[];
}

export interface EmotionalMetric {
  timestamp: number;
  emotion: string;
  intensity: number;
  confidence: number;
  source: string;
}

export interface EngagementPattern {
  pattern: string;
  frequency: number;
  averageEngagement: number;
  triggers: string[];
  effectiveness: number;
}

export interface QualityIndicator {
  indicator: string;
  value: number;
  threshold: number;
  status: string;
  trend: string;
}

export class EmotionalSystemIntegration {
  private config: SystemConfig;
  private state: SystemState;
  
  // Core systems
  private emotionalSystem: EnhancedEmotionalSystem;
  private voiceAnalyzer: VoiceProsodyAnalyzer;
  private conversationManager: ConversationManager;
  private logger: ProductionLogger;
  private learningSystem: EmotionalLearningSystem;
  private voiceSynthesis: AdvancedVoiceSynthesis;
  private flowManager: ConversationFlowManager;
  private analytics: EmotionalAnalytics;
  private responseGenerator: ResponseGenerator;
  
  // Session management
  private activeSessions: Map<string, any> = new Map();
  private sessionTimers: Map<string, NodeJS.Timeout> = new Map();
  
  // Performance tracking
  private latencyHistory: number[] = [];
  private errorHistory: string[] = [];
  private maxHistorySize: number = 100;

  constructor(config: Partial<SystemConfig> = {}) {
    this.config = {
      productionMode: true,
      enableLearning: true,
      enableAnalytics: true,
      enableVoiceAnalysis: true,
      enableResponseGeneration: true,
      maxLatency: 5000,
      errorRetryAttempts: 3,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      ...config
    };

    this.state = {
      isInitialized: false,
      isHealthy: false,
      activeSessions: 0,
      totalInteractions: 0,
      averageLatency: 0,
      errorRate: 0,
      lastHealthCheck: 0
    };

    this.initializeSystems();
  }

  // 🚀 Initialize all systems
  private async initializeSystems(): Promise<void> {
    try {
      this.logger = new ProductionLogger({
        productionMode: this.config.productionMode,
        enableConsole: !this.config.productionMode
      });

      this.emotionalSystem = new EnhancedEmotionalSystem(this.config.productionMode);
      this.voiceAnalyzer = new VoiceProsodyAnalyzer();
      this.conversationManager = new ConversationManager();
      this.learningSystem = new EmotionalLearningSystem();
      this.voiceSynthesis = new AdvancedVoiceSynthesis();
      this.flowManager = new ConversationFlowManager();
      this.analytics = new EmotionalAnalytics();
      this.responseGenerator = new ResponseGenerator();

      this.state.isInitialized = true;
      this.state.isHealthy = true;
      this.state.lastHealthCheck = Date.now();

      this.logger.logSystem('system', 'Emotional System Integration initialized successfully');
      
      // Start health monitoring
      this.startHealthMonitoring();
      
    } catch (error) {
      this.logger.logError('system', 'Failed to initialize systems', error);
      throw error;
    }
  }

  // 🎯 Process user interaction through the complete pipeline
  async processInteraction(request: IntegrationRequest): Promise<IntegrationResponse> {
    const startTime = performance.now();
    const errors: string[] = [];
    
    try {
      // Validate request
      this.validateRequest(request);
      
      // Get or create session
      const session = this.getOrCreateSession(request.sessionId);
      
      // Step 1: Voice Analysis (if enabled and voice data provided)
      let prosodyFrames: ProsodyFrame[] = [];
      if (this.config.enableVoiceAnalysis && request.voiceData) {
        try {
          prosodyFrames = this.voiceAnalyzer.analyzeChunk(request.voiceData);
          this.logger.logVoice(request.sessionId, 'Voice analysis completed', { frameCount: prosodyFrames.length });
        } catch (error) {
          errors.push(`Voice analysis failed: ${error}`);
          this.logger.logError('voice', 'Voice analysis error', error);
        }
      }
      
      // Step 2: Emotion Detection
      let emotionalState: EnhancedEmotionalState;
      try {
        emotionalState = await this.emotionalSystem.analyzeEmotion(
          request.userInput,
          request.sessionId,
          prosodyFrames
        );
        this.logger.logEmotion(request.sessionId, 'Emotion analysis completed', {
          primaryEmotion: emotionalState.primaryEmotion,
          confidence: emotionalState.confidenceScore
        });
      } catch (error) {
        errors.push(`Emotion analysis failed: ${error}`);
        this.logger.logError('emotion', 'Emotion analysis error', error);
        emotionalState = this.getFallbackEmotionalState();
      }
      
      // Step 3: Conversation Flow Management
      let flowDecision;
      try {
        flowDecision = this.flowManager.processFlow(
          request.sessionId,
          request.userInput,
          emotionalState.primaryEmotion
        );
        this.logger.logConversation(request.sessionId, 'Flow decision made', {
          action: flowDecision.action,
          reason: flowDecision.reason
        });
      } catch (error) {
        errors.push(`Flow management failed: ${error}`);
        this.logger.logError('conversation', 'Flow management error', error);
        flowDecision = { action: 'listen', duration: 1000, reason: 'fallback', priority: 'low', emotionalContext: 'neutral' };
      }
      
      // Step 4: Response Generation (if enabled)
      let responseText: string | undefined;
      if (this.config.enableResponseGeneration) {
        try {
          const responseContext = this.createResponseContext(request, emotionalState, session);
          const generatedResponse = this.responseGenerator.generateResponse(responseContext);
          responseText = generatedResponse.text;
          this.logger.logConversation(request.sessionId, 'Response generated', {
            template: generatedResponse.template,
            confidence: generatedResponse.confidence
          });
        } catch (error) {
          errors.push(`Response generation failed: ${error}`);
          this.logger.logError('response', 'Response generation error', error);
        }
      }
      
      // Step 5: Voice Synthesis Settings
      let voiceSettings;
      try {
        voiceSettings = this.emotionalSystem.getVoiceSettings(emotionalState);
        this.logger.logVoice(request.sessionId, 'Voice settings generated', voiceSettings);
      } catch (error) {
        errors.push(`Voice settings generation failed: ${error}`);
        this.logger.logError('voice', 'Voice settings error', error);
        voiceSettings = this.getFallbackVoiceSettings();
      }
      
      // Step 6: Learning (if enabled)
      if (this.config.enableLearning) {
        try {
          this.learningSystem.recordEvent({
            timestamp: Date.now(),
            userEmotion: emotionalState.primaryEmotion,
            userIntensity: emotionalState.emotionalIntensity,
            zoxaaResponse: responseText || '',
            zoxaaEmotion: emotionalState.voiceBehavior.emotion,
            conversationSuccess: emotionalState.confidenceScore,
            context: {
              turnNumber: session.turnNumber,
              sessionDuration: Date.now() - session.startTime,
              topicContext: request.userInput.substring(0, 50)
            }
          });
        } catch (error) {
          errors.push(`Learning update failed: ${error}`);
          this.logger.logError('learning', 'Learning update error', error);
        }
      }
      
      // Step 7: Analytics (if enabled)
      let analytics = {};
      if (this.config.enableAnalytics) {
        try {
          this.analytics.recordEmotionalMetric(request.sessionId, {
            emotion: emotionalState.primaryEmotion,
            intensity: emotionalState.emotionalIntensity,
            confidence: emotionalState.confidenceScore,
            source: emotionalState.detectedEmotions[0]?.source || 'lexical',
            context: {
              turnNumber: session.turnNumber,
              sessionDuration: Date.now() - session.startTime,
              userInput: request.userInput,
              zoxaaResponse: responseText || ''
            }
          });
          
          analytics = this.analytics.getRealTimeAnalytics(request.sessionId);
        } catch (error) {
          errors.push(`Analytics update failed: ${error}`);
          this.logger.logError('analytics', 'Analytics update error', error);
        }
      }
      
      // Update session
      this.updateSession(request.sessionId, emotionalState, responseText);
      
      // Update performance metrics
      const latency = performance.now() - startTime;
      this.updatePerformanceMetrics(latency, errors.length > 0);
      
      // Update state
      this.state.totalInteractions++;
      
      return {
        success: errors.length === 0,
        emotionalState,
        voiceSettings,
        responseText,
        conversationFlow: flowDecision,
        analytics,
        latency,
        errors
      };
      
    } catch (error) {
      this.logger.logError('system', 'Critical system error', error);
      return {
        success: false,
        emotionalState: this.getFallbackEmotionalState(),
        voiceSettings: this.getFallbackVoiceSettings(),
        conversationFlow: { action: 'listen', duration: 1000, reason: 'error', priority: 'low', emotionalContext: 'neutral' },
        analytics: {},
        latency: performance.now() - startTime,
        errors: [`Critical error: ${error}`]
      };
    }
  }

  // 🔍 Validate request
  private validateRequest(request: IntegrationRequest): void {
    if (!request.sessionId) {
      throw new Error('Session ID is required');
    }
    if (!request.userInput) {
      throw new Error('User input is required');
    }
    if (request.userInput.length > 1000) {
      throw new Error('User input too long');
    }
  }

  // 🎯 Get or create session
  private getOrCreateSession(sessionId: string): any {
    if (!this.activeSessions.has(sessionId)) {
      const session = {
        id: sessionId,
        startTime: Date.now(),
        turnNumber: 0,
        lastActivity: Date.now(),
        emotionalHistory: [],
        conversationHistory: []
      };
      
      this.activeSessions.set(sessionId, session);
      this.state.activeSessions++;
      
      // Start session timeout
      this.startSessionTimeout(sessionId);
      
      // Start analytics session
      if (this.config.enableAnalytics) {
        this.analytics.startSession(sessionId);
      }
      
      this.logger.logSystem('session', `New session created: ${sessionId}`);
    }
    
    return this.activeSessions.get(sessionId);
  }

  // 📝 Update session
  private updateSession(sessionId: string, emotionalState: EnhancedEmotionalState, responseText?: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.turnNumber++;
      session.lastActivity = Date.now();
      session.emotionalHistory.push({
        emotion: emotionalState.primaryEmotion,
        intensity: emotionalState.emotionalIntensity,
        timestamp: Date.now()
      });
      
      if (responseText) {
        session.conversationHistory.push({
          speaker: 'zoxaa',
          text: responseText,
          emotion: emotionalState.voiceBehavior.emotion,
          timestamp: Date.now()
        });
      }
      
      // Keep history manageable
      if (session.emotionalHistory.length > 50) {
        session.emotionalHistory.shift();
      }
      if (session.conversationHistory.length > 100) {
        session.conversationHistory.shift();
      }
    }
  }

  // 🎭 Create response context
  private createResponseContext(
    request: IntegrationRequest,
    emotionalState: EnhancedEmotionalState,
    session: any
  ): any {
    return {
      userInput: request.userInput,
      userEmotion: emotionalState.primaryEmotion,
      userIntensity: emotionalState.emotionalIntensity,
      conversationHistory: session.conversationHistory,
      turnNumber: session.turnNumber,
      sessionDuration: Date.now() - session.startTime,
      relationshipDepth: emotionalState.conversationContext.relationshipDepth,
      engagement: emotionalState.conversationContext.userEngagement,
      conversationFlow: emotionalState.conversationContext.conversationFlow
    };
  }

  // 📊 Update performance metrics
  private updatePerformanceMetrics(latency: number, hasError: boolean): void {
    // Update latency history
    this.latencyHistory.push(latency);
    if (this.latencyHistory.length > this.maxHistorySize) {
      this.latencyHistory.shift();
    }
    
    // Update average latency
    this.state.averageLatency = this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length;
    
    // Update error rate
    if (hasError) {
      this.errorHistory.push(new Date().toISOString());
      if (this.errorHistory.length > this.maxHistorySize) {
        this.errorHistory.shift();
      }
    }
    
    this.state.errorRate = this.errorHistory.length / this.maxHistorySize;
  }

  // 🎯 Get fallback emotional state
  private getFallbackEmotionalState(): EnhancedEmotionalState {
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
        conversationFlow: 'listening',
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
      voiceBehavior: {
        primaryBehavior: 'listening',
        secondaryBehavior: 'neutral',
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0,
        emotion: 'neutral',
        warmth: 0.7,
        engagement: 0.6,
        empathy: 0.6,
        playfulness: 0.4,
        responseLength: 'medium',
        responseStyle: 'casual',
        interruptionStyle: 'gentle'
      },
      crisisLevel: 'none',
      safetyCheck: true,
      isProductionMode: this.config.productionMode
    };
  }

  // 🎤 Get fallback voice settings
  private getFallbackVoiceSettings(): any {
    return {
      voice: 'nova',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      emotion: 'neutral',
      ssml: true,
      emotionalModulation: true
    };
  }

  // ⏰ Start session timeout
  private startSessionTimeout(sessionId: string): void {
    const timeout = setTimeout(() => {
      this.endSession(sessionId);
    }, this.config.sessionTimeout);
    
    this.sessionTimers.set(sessionId, timeout);
  }

  // 🏁 End session
  private endSession(sessionId: string): void {
    // Clear timeout
    const timeout = this.sessionTimers.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.sessionTimers.delete(sessionId);
    }
    
    // End analytics session
    if (this.config.enableAnalytics) {
      try {
        this.analytics.endSession(sessionId);
      } catch (error) {
        this.logger.logError('analytics', 'Failed to end analytics session', error);
      }
    }
    
    // Remove from active sessions
    this.activeSessions.delete(sessionId);
    this.state.activeSessions--;
    
    this.logger.logSystem('session', `Session ended: ${sessionId}`);
  }

  // 🏥 Start health monitoring
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Check every minute
  }

  // 🏥 Perform health check
  private performHealthCheck(): void {
    try {
      const now = Date.now();
      
      // Check system health
      const isHealthy = this.state.isInitialized && 
                       this.state.errorRate < 0.1 && 
                       this.state.averageLatency < this.config.maxLatency;
      
      this.state.isHealthy = isHealthy;
      this.state.lastHealthCheck = now;
      
      // Clean up expired sessions
      this.cleanupExpiredSessions();
      
      // Log health status
      if (!isHealthy) {
        this.logger.logWarning('system', 'System health check failed', {
          errorRate: this.state.errorRate,
          averageLatency: this.state.averageLatency,
          activeSessions: this.state.activeSessions
        });
      }
      
    } catch (error) {
      this.logger.logError('system', 'Health check failed', error);
      this.state.isHealthy = false;
    }
  }

  // 🧹 Clean up expired sessions
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastActivity > this.config.sessionTimeout) {
        expiredSessions.push(sessionId);
      }
    }
    
    expiredSessions.forEach(sessionId => {
      this.endSession(sessionId);
    });
  }

  // 📊 Get system state
  getSystemState(): SystemState {
    return { ...this.state };
  }

  // 📈 Get system statistics
  getSystemStats(): any {
    return {
      state: this.state,
      config: this.config,
      activeSessions: this.activeSessions.size,
      sessionTimers: this.sessionTimers.size,
      latencyHistory: this.latencyHistory.length,
      errorHistory: this.errorHistory.length,
      emotionalSystem: this.emotionalSystem ? 'initialized' : 'not initialized',
      voiceAnalyzer: this.voiceAnalyzer ? 'initialized' : 'not initialized',
      conversationManager: this.conversationManager ? 'initialized' : 'not initialized',
      learningSystem: this.learningSystem ? 'initialized' : 'not initialized',
      voiceSynthesis: this.voiceSynthesis ? 'initialized' : 'not initialized',
      flowManager: this.flowManager ? 'initialized' : 'not initialized',
      analytics: this.analytics ? 'initialized' : 'not initialized',
      responseGenerator: this.responseGenerator ? 'initialized' : 'not initialized'
    };
  }

  // 🔧 Update configuration
  updateConfig(newConfig: Partial<SystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.logSystem('config', 'Configuration updated', newConfig);
  }

  // 🧹 Cleanup all systems
  cleanup(): void {
    // End all active sessions
    for (const sessionId of this.activeSessions.keys()) {
      this.endSession(sessionId);
    }
    
    // Clear all timers
    for (const timeout of this.sessionTimers.values()) {
      clearTimeout(timeout);
    }
    this.sessionTimers.clear();
    
    // Cleanup individual systems
    if (this.learningSystem) {
      this.learningSystem.cleanup();
    }
    if (this.analytics) {
      this.analytics.cleanup();
    }
    if (this.flowManager) {
      this.flowManager.cleanup();
    }
    if (this.voiceSynthesis) {
      this.voiceSynthesis.clearCache();
    }
    if (this.responseGenerator) {
      this.responseGenerator.clearCache();
    }
    
    this.logger.logSystem('cleanup', 'System cleanup completed');
  }

  // 🚨 Emergency shutdown
  emergencyShutdown(): void {
    this.logger.logError('system', 'Emergency shutdown initiated');
    this.cleanup();
    this.state.isHealthy = false;
    this.state.isInitialized = false;
  }
}

export default EmotionalSystemIntegration;
