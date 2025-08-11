// 🧠 Emotional Learning System - ZOXAA Voice Intelligence
// Enables ZOXAA to learn from interactions and adapt emotional patterns

export interface LearningEvent {
  timestamp: number;
  userEmotion: string;
  userIntensity: number;
  zoxaaResponse: string;
  zoxaaEmotion: string;
  userFeedback?: 'positive' | 'negative' | 'neutral';
  conversationSuccess: number; // 0-1 score
  context: {
    turnNumber: number;
    sessionDuration: number;
    topicContext: string;
  };
}

export interface EmotionalPattern {
  emotion: string;
  frequency: number;
  successRate: number;
  averageIntensity: number;
  preferredResponses: string[];
  lastUpdated: number;
}

export interface UserPreference {
  emotion: string;
  preference: number; // -1 to 1 (dislike to like)
  confidence: number;
  lastInteraction: number;
}

export class EmotionalLearningSystem {
  private learningEvents: LearningEvent[] = [];
  private emotionalPatterns: Map<string, EmotionalPattern> = new Map();
  private userPreferences: Map<string, UserPreference> = new Map();
  private sessionStats: Map<string, any> = new Map();
  private maxEvents: number = 1000;
  private learningRate: number = 0.1;

  constructor() {
    this.initializeDefaultPatterns();
  }

  // 📚 Record a learning event
  recordEvent(event: LearningEvent): void {
    this.learningEvents.push(event);
    
    // Keep only recent events
    if (this.learningEvents.length > this.maxEvents) {
      this.learningEvents.shift();
    }

    // Update patterns and preferences
    this.updateEmotionalPatterns(event);
    this.updateUserPreferences(event);
    this.updateSessionStats(event);
  }

  // 🎯 Get learned emotional response
  getLearnedResponse(userEmotion: string, intensity: number, context: any): any {
    const pattern = this.emotionalPatterns.get(userEmotion);
    const preference = this.userPreferences.get(userEmotion);
    
    if (!pattern) {
      return this.getDefaultResponse(userEmotion);
    }

    // Adjust response based on learning
    const successMultiplier = pattern.successRate;
    const preferenceAdjustment = preference ? preference.preference * 0.2 : 0;
    
    return {
      emotion: pattern.emotion,
      intensity: Math.min(1, intensity * successMultiplier),
      warmth: 0.7 + (successMultiplier * 0.3) + preferenceAdjustment,
      engagement: 0.6 + (successMultiplier * 0.4),
      empathy: 0.6 + (successMultiplier * 0.4),
      playfulness: 0.4 + (successMultiplier * 0.3),
      responseStyle: this.getResponseStyleFromSuccess(successMultiplier),
      confidence: pattern.successRate
    };
  }

  // 📊 Get learning insights
  getLearningInsights(): any {
    const totalEvents = this.learningEvents.length;
    const recentEvents = this.learningEvents.slice(-50);
    
    const averageSuccess = recentEvents.reduce((sum, e) => sum + e.conversationSuccess, 0) / recentEvents.length;
    const topEmotions = Array.from(this.emotionalPatterns.entries())
      .sort((a, b) => b[1].successRate - a[1].successRate)
      .slice(0, 5);

    return {
      totalInteractions: totalEvents,
      averageSuccessRate: averageSuccess,
      topPerformingEmotions: topEmotions.map(([emotion, pattern]) => ({
        emotion,
        successRate: pattern.successRate,
        frequency: pattern.frequency
      })),
      userPreferences: Array.from(this.userPreferences.entries())
        .filter(([_, pref]) => Math.abs(pref.preference) > 0.3)
        .map(([emotion, pref]) => ({
          emotion,
          preference: pref.preference,
          confidence: pref.confidence
        }))
    };
  }

  // 🔄 Update emotional patterns based on events
  private updateEmotionalPatterns(event: LearningEvent): void {
    const { userEmotion, conversationSuccess, userFeedback } = event;
    
    let pattern = this.emotionalPatterns.get(userEmotion);
    if (!pattern) {
      pattern = {
        emotion: userEmotion,
        frequency: 0,
        successRate: 0.5,
        averageIntensity: 0.5,
        preferredResponses: [],
        lastUpdated: Date.now()
      };
    }

    // Update frequency
    pattern.frequency += 1;
    
    // Update success rate with exponential moving average
    const feedbackScore = this.getFeedbackScore(userFeedback, conversationSuccess);
    pattern.successRate = pattern.successRate * (1 - this.learningRate) + feedbackScore * this.learningRate;
    
    // Update average intensity
    pattern.averageIntensity = pattern.averageIntensity * 0.9 + event.userIntensity * 0.1;
    
    // Update preferred responses
    if (feedbackScore > 0.7) {
      if (!pattern.preferredResponses.includes(event.zoxaaResponse)) {
        pattern.preferredResponses.push(event.zoxaaResponse);
        if (pattern.preferredResponses.length > 5) {
          pattern.preferredResponses.shift();
        }
      }
    }
    
    pattern.lastUpdated = Date.now();
    this.emotionalPatterns.set(userEmotion, pattern);
  }

  // 👤 Update user preferences
  private updateUserPreferences(event: LearningEvent): void {
    const { userEmotion, userFeedback, conversationSuccess } = event;
    
    let preference = this.userPreferences.get(userEmotion);
    if (!preference) {
      preference = {
        emotion: userEmotion,
        preference: 0,
        confidence: 0.5,
        lastInteraction: Date.now()
      };
    }

    // Update preference based on feedback
    const feedbackScore = this.getFeedbackScore(userFeedback, conversationSuccess);
    const preferenceChange = (feedbackScore - 0.5) * 0.2;
    
    preference.preference = Math.max(-1, Math.min(1, preference.preference + preferenceChange));
    preference.confidence = Math.min(1, preference.confidence + 0.1);
    preference.lastInteraction = Date.now();
    
    this.userPreferences.set(userEmotion, preference);
  }

  // 📈 Update session statistics
  private updateSessionStats(event: LearningEvent): void {
    const sessionId = `${event.context.turnNumber}_${event.context.sessionDuration}`;
    let stats = this.sessionStats.get(sessionId);
    
    if (!stats) {
      stats = {
        totalEvents: 0,
        averageSuccess: 0,
        emotionDistribution: new Map(),
        startTime: Date.now()
      };
    }

    stats.totalEvents += 1;
    stats.averageSuccess = (stats.averageSuccess * (stats.totalEvents - 1) + event.conversationSuccess) / stats.totalEvents;
    
    const emotionCount = stats.emotionDistribution.get(event.userEmotion) || 0;
    stats.emotionDistribution.set(event.userEmotion, emotionCount + 1);
    
    this.sessionStats.set(sessionId, stats);
  }

  // 🎯 Get feedback score from user feedback and conversation success
  private getFeedbackScore(userFeedback?: string, conversationSuccess?: number): number {
    if (userFeedback) {
      switch (userFeedback) {
        case 'positive': return 0.9;
        case 'negative': return 0.1;
        case 'neutral': return 0.5;
        default: return 0.5;
      }
    }
    
    return conversationSuccess || 0.5;
  }

  // 🎭 Get response style based on success rate
  private getResponseStyleFromSuccess(successRate: number): string {
    if (successRate > 0.8) return 'playful';
    if (successRate > 0.6) return 'casual';
    if (successRate > 0.4) return 'caring';
    return 'formal';
  }

  // 🎯 Get default response for unknown emotions
  private getDefaultResponse(emotion: string): any {
    return {
      emotion: 'neutral',
      intensity: 0.5,
      warmth: 0.7,
      engagement: 0.6,
      empathy: 0.6,
      playfulness: 0.4,
      responseStyle: 'casual',
      confidence: 0.5
    };
  }

  // 🎨 Initialize default emotional patterns
  private initializeDefaultPatterns(): void {
    const defaultEmotions = ['joy', 'sadness', 'anger', 'anxiety', 'surprise', 'curious'];
    
    defaultEmotions.forEach(emotion => {
      this.emotionalPatterns.set(emotion, {
        emotion,
        frequency: 1,
        successRate: 0.6,
        averageIntensity: 0.5,
        preferredResponses: [],
        lastUpdated: Date.now()
      });
    });
  }

  // 📊 Export learning data for analysis
  exportLearningData(): any {
    return {
      events: this.learningEvents.slice(-100), // Last 100 events
      patterns: Object.fromEntries(this.emotionalPatterns),
      preferences: Object.fromEntries(this.userPreferences),
      stats: Object.fromEntries(this.sessionStats)
    };
  }

  // 🧹 Clean up old data
  cleanup(): void {
    const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Clean old events
    this.learningEvents = this.learningEvents.filter(e => e.timestamp > cutoffTime);
    
    // Clean old session stats
    for (const [sessionId, stats] of this.sessionStats.entries()) {
      if (stats.startTime < cutoffTime) {
        this.sessionStats.delete(sessionId);
      }
    }
  }
}

export default EmotionalLearningSystem;
