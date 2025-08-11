// 📊 Emotional Analytics - ZOXAA Voice Intelligence
// Tracks emotional trends, engagement metrics, and conversation quality

export interface EmotionalMetric {
  timestamp: number;
  emotion: string;
  intensity: number;
  confidence: number;
  source: 'lexical' | 'prosodic' | 'contextual' | 'override';
  context: {
    turnNumber: number;
    sessionDuration: number;
    userInput: string;
    zoxaaResponse: string;
  };
}

export interface EngagementMetric {
  timestamp: number;
  engagement: number;
  factors: {
    emotionalIntensity: number;
    questionCount: number;
    responseLength: number;
    interruptionCount: number;
    naturalFlow: number;
  };
  sessionId: string;
}

export interface ConversationQuality {
  sessionId: string;
  startTime: number;
  endTime: number;
  totalTurns: number;
  averageEngagement: number;
  emotionalDiversity: number;
  responseQuality: number;
  naturalFlowScore: number;
  userSatisfaction: number;
  metrics: {
    emotionalTrends: EmotionalTrend[];
    engagementPatterns: EngagementPattern[];
    qualityIndicators: QualityIndicator[];
  };
}

export interface EmotionalTrend {
  emotion: string;
  frequency: number;
  averageIntensity: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
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
  status: 'excellent' | 'good' | 'fair' | 'poor';
  trend: 'improving' | 'declining' | 'stable';
}

export class EmotionalAnalytics {
  private emotionalMetrics: Map<string, EmotionalMetric[]> = new Map();
  private engagementMetrics: Map<string, EngagementMetric[]> = new Map();
  private conversationQuality: Map<string, ConversationQuality> = new Map();
  private sessionStartTimes: Map<string, number> = new Map();
  private maxMetricsPerSession: number = 1000;
  private analysisWindow: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.startPeriodicCleanup();
  }

  // 📈 Record emotional metric
  recordEmotionalMetric(sessionId: string, metric: Omit<EmotionalMetric, 'timestamp'>): void {
    const fullMetric: EmotionalMetric = {
      ...metric,
      timestamp: Date.now()
    };

    if (!this.emotionalMetrics.has(sessionId)) {
      this.emotionalMetrics.set(sessionId, []);
    }

    const metrics = this.emotionalMetrics.get(sessionId)!;
    metrics.push(fullMetric);

    // Keep only recent metrics
    if (metrics.length > this.maxMetricsPerSession) {
      metrics.shift();
    }
  }

  // 📊 Record engagement metric
  recordEngagementMetric(sessionId: string, metric: Omit<EngagementMetric, 'timestamp'>): void {
    const fullMetric: EngagementMetric = {
      ...metric,
      timestamp: Date.now()
    };

    if (!this.engagementMetrics.has(sessionId)) {
      this.engagementMetrics.set(sessionId, []);
    }

    const metrics = this.engagementMetrics.get(sessionId)!;
    metrics.push(fullMetric);

    // Keep only recent metrics
    if (metrics.length > this.maxMetricsPerSession) {
      metrics.shift();
    }
  }

  // 🎯 Start session tracking
  startSession(sessionId: string): void {
    this.sessionStartTimes.set(sessionId, Date.now());
  }

  // 🏁 End session and calculate quality
  endSession(sessionId: string): ConversationQuality {
    const startTime = this.sessionStartTimes.get(sessionId) || Date.now();
    const endTime = Date.now();
    
    const emotionalMetrics = this.emotionalMetrics.get(sessionId) || [];
    const engagementMetrics = this.engagementMetrics.get(sessionId) || [];
    
    const quality = this.calculateConversationQuality(sessionId, startTime, endTime, emotionalMetrics, engagementMetrics);
    this.conversationQuality.set(sessionId, quality);
    
    return quality;
  }

  // 📊 Get real-time analytics
  getRealTimeAnalytics(sessionId: string): any {
    const emotionalMetrics = this.emotionalMetrics.get(sessionId) || [];
    const engagementMetrics = this.engagementMetrics.get(sessionId) || [];
    
    const recentEmotional = emotionalMetrics.slice(-20);
    const recentEngagement = engagementMetrics.slice(-20);
    
    return {
      currentEmotion: this.getCurrentEmotion(recentEmotional),
      emotionalTrend: this.calculateEmotionalTrend(recentEmotional),
      currentEngagement: this.getCurrentEngagement(recentEngagement),
      engagementTrend: this.calculateEngagementTrend(recentEngagement),
      sessionDuration: this.getSessionDuration(sessionId),
      turnCount: emotionalMetrics.length,
      qualityScore: this.calculateQualityScore(recentEmotional, recentEngagement)
    };
  }

  // 📈 Get emotional trends
  getEmotionalTrends(sessionId: string, windowMinutes: number = 60): EmotionalTrend[] {
    const metrics = this.emotionalMetrics.get(sessionId) || [];
    const cutoffTime = Date.now() - (windowMinutes * 60 * 1000);
    const recentMetrics = metrics.filter(m => m.timestamp > cutoffTime);
    
    const emotionGroups = this.groupByEmotion(recentMetrics);
    const trends: EmotionalTrend[] = [];
    
    Object.entries(emotionGroups).forEach(([emotion, emotionMetrics]) => {
      const frequency = emotionMetrics.length;
      const averageIntensity = emotionMetrics.reduce((sum, m) => sum + m.intensity, 0) / frequency;
      const trend = this.calculateTrendDirection(emotionMetrics);
      const confidence = emotionMetrics.reduce((sum, m) => sum + m.confidence, 0) / frequency;
      
      trends.push({
        emotion,
        frequency,
        averageIntensity,
        trend,
        confidence
      });
    });
    
    return trends.sort((a, b) => b.frequency - a.frequency);
  }

  // 🎯 Get engagement patterns
  getEngagementPatterns(sessionId: string, windowMinutes: number = 60): EngagementPattern[] {
    const metrics = this.engagementMetrics.get(sessionId) || [];
    const cutoffTime = Date.now() - (windowMinutes * 60 * 1000);
    const recentMetrics = metrics.filter(m => m.timestamp > cutoffTime);
    
    const patterns: EngagementPattern[] = [];
    
    // Analyze high engagement periods
    const highEngagement = recentMetrics.filter(m => m.engagement > 0.8);
    if (highEngagement.length > 0) {
      patterns.push({
        pattern: 'high_engagement',
        frequency: highEngagement.length,
        averageEngagement: highEngagement.reduce((sum, m) => sum + m.engagement, 0) / highEngagement.length,
        triggers: this.identifyEngagementTriggers(highEngagement),
        effectiveness: 0.9
      });
    }
    
    // Analyze low engagement periods
    const lowEngagement = recentMetrics.filter(m => m.engagement < 0.3);
    if (lowEngagement.length > 0) {
      patterns.push({
        pattern: 'low_engagement',
        frequency: lowEngagement.length,
        averageEngagement: lowEngagement.reduce((sum, m) => sum + m.engagement, 0) / lowEngagement.length,
        triggers: this.identifyDisengagementTriggers(lowEngagement),
        effectiveness: 0.2
      });
    }
    
    return patterns;
  }

  // 📊 Get quality indicators
  getQualityIndicators(sessionId: string): QualityIndicator[] {
    const emotionalMetrics = this.emotionalMetrics.get(sessionId) || [];
    const engagementMetrics = this.engagementMetrics.get(sessionId) || [];
    
    const indicators: QualityIndicator[] = [];
    
    // Emotional diversity
    const uniqueEmotions = new Set(emotionalMetrics.map(m => m.emotion)).size;
    const emotionalDiversity = Math.min(1, uniqueEmotions / 10);
    indicators.push({
      indicator: 'emotional_diversity',
      value: emotionalDiversity,
      threshold: 0.6,
      status: this.getStatus(emotionalDiversity, 0.6),
      trend: this.getTrend(emotionalMetrics, 'emotion')
    });
    
    // Average engagement
    const averageEngagement = engagementMetrics.length > 0 ? 
      engagementMetrics.reduce((sum, m) => sum + m.engagement, 0) / engagementMetrics.length : 0;
    indicators.push({
      indicator: 'average_engagement',
      value: averageEngagement,
      threshold: 0.7,
      status: this.getStatus(averageEngagement, 0.7),
      trend: this.getTrend(engagementMetrics, 'engagement')
    });
    
    // Response quality
    const responseQuality = this.calculateResponseQuality(emotionalMetrics, engagementMetrics);
    indicators.push({
      indicator: 'response_quality',
      value: responseQuality,
      threshold: 0.8,
      status: this.getStatus(responseQuality, 0.8),
      trend: 'stable' // Would need historical data for trend
    });
    
    // Natural flow
    const naturalFlow = this.calculateNaturalFlow(engagementMetrics);
    indicators.push({
      indicator: 'natural_flow',
      value: naturalFlow,
      threshold: 0.75,
      status: this.getStatus(naturalFlow, 0.75),
      trend: this.getTrend(engagementMetrics, 'naturalFlow')
    });
    
    return indicators;
  }

  // 🧮 Calculate conversation quality
  private calculateConversationQuality(
    sessionId: string,
    startTime: number,
    endTime: number,
    emotionalMetrics: EmotionalMetric[],
    engagementMetrics: EngagementMetric[]
  ): ConversationQuality {
    const totalTurns = emotionalMetrics.length;
    const averageEngagement = engagementMetrics.length > 0 ? 
      engagementMetrics.reduce((sum, m) => sum + m.engagement, 0) / engagementMetrics.length : 0;
    
    const emotionalDiversity = new Set(emotionalMetrics.map(m => m.emotion)).size;
    const responseQuality = this.calculateResponseQuality(emotionalMetrics, engagementMetrics);
    const naturalFlowScore = this.calculateNaturalFlow(engagementMetrics);
    const userSatisfaction = this.estimateUserSatisfaction(emotionalMetrics, engagementMetrics);
    
    return {
      sessionId,
      startTime,
      endTime,
      totalTurns,
      averageEngagement,
      emotionalDiversity,
      responseQuality,
      naturalFlowScore,
      userSatisfaction,
      metrics: {
        emotionalTrends: this.getEmotionalTrends(sessionId, 60),
        engagementPatterns: this.getEngagementPatterns(sessionId, 60),
        qualityIndicators: this.getQualityIndicators(sessionId)
      }
    };
  }

  // 🎯 Calculate response quality
  private calculateResponseQuality(emotionalMetrics: EmotionalMetric[], engagementMetrics: EngagementMetric[]): number {
    if (emotionalMetrics.length === 0 || engagementMetrics.length === 0) return 0.5;
    
    // Quality based on emotional appropriateness and engagement maintenance
    const emotionalAppropriateness = emotionalMetrics.reduce((sum, m) => sum + m.confidence, 0) / emotionalMetrics.length;
    const engagementMaintenance = engagementMetrics.reduce((sum, m) => sum + m.engagement, 0) / engagementMetrics.length;
    
    return (emotionalAppropriateness + engagementMaintenance) / 2;
  }

  // 🌊 Calculate natural flow
  private calculateNaturalFlow(engagementMetrics: EngagementMetric[]): number {
    if (engagementMetrics.length < 2) return 0.5;
    
    // Calculate flow based on engagement stability and natural variations
    const engagementValues = engagementMetrics.map(m => m.engagement);
    const averageEngagement = engagementValues.reduce((sum, val) => sum + val, 0) / engagementValues.length;
    
    // Calculate stability (lower variance = better flow)
    const variance = engagementValues.reduce((sum, val) => sum + Math.pow(val - averageEngagement, 2), 0) / engagementValues.length;
    const stability = Math.max(0, 1 - variance);
    
    return stability;
  }

  // 😊 Estimate user satisfaction
  private estimateUserSatisfaction(emotionalMetrics: EmotionalMetric[], engagementMetrics: EngagementMetric[]): number {
    if (emotionalMetrics.length === 0 || engagementMetrics.length === 0) return 0.5;
    
    // Satisfaction based on positive emotions and sustained engagement
    const positiveEmotions = emotionalMetrics.filter(m => 
      ['joy', 'surprise', 'curious', 'relief', 'pride'].includes(m.emotion)
    ).length;
    
    const positiveEmotionRatio = positiveEmotions / emotionalMetrics.length;
    const averageEngagement = engagementMetrics.reduce((sum, m) => sum + m.engagement, 0) / engagementMetrics.length;
    
    return (positiveEmotionRatio + averageEngagement) / 2;
  }

  // 📈 Get current emotion
  private getCurrentEmotion(metrics: EmotionalMetric[]): string {
    if (metrics.length === 0) return 'neutral';
    
    const recent = metrics.slice(-3); // Last 3 metrics
    const emotionCounts = new Map<string, number>();
    
    recent.forEach(m => {
      emotionCounts.set(m.emotion, (emotionCounts.get(m.emotion) || 0) + 1);
    });
    
    return Array.from(emotionCounts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  // 📊 Get current engagement
  private getCurrentEngagement(metrics: EngagementMetric[]): number {
    if (metrics.length === 0) return 0.5;
    
    const recent = metrics.slice(-3); // Last 3 metrics
    return recent.reduce((sum, m) => sum + m.engagement, 0) / recent.length;
  }

  // 📈 Calculate emotional trend
  private calculateEmotionalTrend(metrics: EmotionalMetric[]): 'improving' | 'declining' | 'stable' {
    if (metrics.length < 4) return 'stable';
    
    const recent = metrics.slice(-4);
    const intensities = recent.map(m => m.intensity);
    
    // Simple trend calculation
    const firstHalf = intensities.slice(0, 2).reduce((sum, val) => sum + val, 0) / 2;
    const secondHalf = intensities.slice(2).reduce((sum, val) => sum + val, 0) / 2;
    
    const difference = secondHalf - firstHalf;
    if (Math.abs(difference) < 0.1) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }

  // 📊 Calculate engagement trend
  private calculateEngagementTrend(metrics: EngagementMetric[]): 'improving' | 'declining' | 'stable' {
    if (metrics.length < 4) return 'stable';
    
    const recent = metrics.slice(-4);
    const engagements = recent.map(m => m.engagement);
    
    const firstHalf = engagements.slice(0, 2).reduce((sum, val) => sum + val, 0) / 2;
    const secondHalf = engagements.slice(2).reduce((sum, val) => sum + val, 0) / 2;
    
    const difference = secondHalf - firstHalf;
    if (Math.abs(difference) < 0.05) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }

  // 🎯 Group metrics by emotion
  private groupByEmotion(metrics: EmotionalMetric[]): Record<string, EmotionalMetric[]> {
    const groups: Record<string, EmotionalMetric[]> = {};
    
    metrics.forEach(metric => {
      if (!groups[metric.emotion]) {
        groups[metric.emotion] = [];
      }
      groups[metric.emotion].push(metric);
    });
    
    return groups;
  }

  // 📈 Calculate trend direction
  private calculateTrendDirection(metrics: EmotionalMetric[]): 'increasing' | 'decreasing' | 'stable' {
    if (metrics.length < 3) return 'stable';
    
    const intensities = metrics.map(m => m.intensity);
    const firstThird = intensities.slice(0, Math.floor(intensities.length / 3));
    const lastThird = intensities.slice(-Math.floor(intensities.length / 3));
    
    const firstAvg = firstThird.reduce((sum, val) => sum + val, 0) / firstThird.length;
    const lastAvg = lastThird.reduce((sum, val) => sum + val, 0) / lastThird.length;
    
    const difference = lastAvg - firstAvg;
    if (Math.abs(difference) < 0.1) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }

  // 🎯 Identify engagement triggers
  private identifyEngagementTriggers(metrics: EngagementMetric[]): string[] {
    const triggers: string[] = [];
    
    // Analyze factors that correlate with high engagement
    const highEmotionalIntensity = metrics.filter(m => m.factors.emotionalIntensity > 0.7).length;
    const highQuestionCount = metrics.filter(m => m.factors.questionCount > 0).length;
    
    if (highEmotionalIntensity > metrics.length * 0.6) triggers.push('emotional_intensity');
    if (highQuestionCount > metrics.length * 0.4) triggers.push('questions');
    
    return triggers;
  }

  // 😴 Identify disengagement triggers
  private identifyDisengagementTriggers(metrics: EngagementMetric[]): string[] {
    const triggers: string[] = [];
    
    // Analyze factors that correlate with low engagement
    const highInterruptionCount = metrics.filter(m => m.factors.interruptionCount > 0).length;
    const lowNaturalFlow = metrics.filter(m => m.factors.naturalFlow < 0.3).length;
    
    if (highInterruptionCount > metrics.length * 0.5) triggers.push('interruptions');
    if (lowNaturalFlow > metrics.length * 0.6) triggers.push('unnatural_flow');
    
    return triggers;
  }

  // 📊 Get status based on value and threshold
  private getStatus(value: number, threshold: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (value >= threshold * 1.2) return 'excellent';
    if (value >= threshold) return 'good';
    if (value >= threshold * 0.8) return 'fair';
    return 'poor';
  }

  // 📈 Get trend based on metrics
  private getTrend<T extends EmotionalMetric | EngagementMetric>(
    metrics: T[],
    key: keyof T
  ): 'improving' | 'declining' | 'stable' {
    if (metrics.length < 4) return 'stable';
    
    const recent = metrics.slice(-4);
    const values = recent.map(m => Number(m[key]));
    
    const firstHalf = values.slice(0, 2).reduce((sum, val) => sum + val, 0) / 2;
    const secondHalf = values.slice(2).reduce((sum, val) => sum + val, 0) / 2;
    
    const difference = secondHalf - firstHalf;
    const threshold = key === 'engagement' ? 0.05 : 0.1;
    
    if (Math.abs(difference) < threshold) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }

  // ⏱️ Get session duration
  private getSessionDuration(sessionId: string): number {
    const startTime = this.sessionStartTimes.get(sessionId);
    if (!startTime) return 0;
    
    return Date.now() - startTime;
  }

  // 📊 Calculate quality score
  private calculateQualityScore(emotionalMetrics: EmotionalMetric[], engagementMetrics: EngagementMetric[]): number {
    if (emotionalMetrics.length === 0 || engagementMetrics.length === 0) return 0.5;
    
    const emotionalQuality = emotionalMetrics.reduce((sum, m) => sum + m.confidence, 0) / emotionalMetrics.length;
    const engagementQuality = engagementMetrics.reduce((sum, m) => sum + m.engagement, 0) / engagementMetrics.length;
    
    return (emotionalQuality + engagementQuality) / 2;
  }

  // 🧹 Start periodic cleanup
  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000); // Clean up every hour
  }

  // 🧹 Clean up old data
  private cleanup(): void {
    const cutoffTime = Date.now() - this.analysisWindow;
    
    // Clean emotional metrics
    for (const [sessionId, metrics] of this.emotionalMetrics.entries()) {
      this.emotionalMetrics.set(sessionId, metrics.filter(m => m.timestamp > cutoffTime));
    }
    
    // Clean engagement metrics
    for (const [sessionId, metrics] of this.engagementMetrics.entries()) {
      this.engagementMetrics.set(sessionId, metrics.filter(m => m.timestamp > cutoffTime));
    }
    
    // Clean old sessions
    for (const [sessionId, startTime] of this.sessionStartTimes.entries()) {
      if (startTime < cutoffTime) {
        this.sessionStartTimes.delete(sessionId);
        this.emotionalMetrics.delete(sessionId);
        this.engagementMetrics.delete(sessionId);
      }
    }
  }

  // 📊 Get analytics summary
  getAnalyticsSummary(): any {
    const totalSessions = this.sessionStartTimes.size;
    const totalEmotionalMetrics = Array.from(this.emotionalMetrics.values())
      .reduce((sum, metrics) => sum + metrics.length, 0);
    const totalEngagementMetrics = Array.from(this.engagementMetrics.values())
      .reduce((sum, metrics) => sum + metrics.length, 0);
    
    return {
      totalSessions,
      totalEmotionalMetrics,
      totalEngagementMetrics,
      activeSessions: Array.from(this.sessionStartTimes.keys()).length,
      dataRetentionWindow: this.analysisWindow
    };
  }
}

export default EmotionalAnalytics;
