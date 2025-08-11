import { EmotionalState } from '@/hooks/useZoxaaVoice';

// Predictive interruption interfaces
export interface IntentionSignals {
  breathIntake: number; // 0-1, strength of detected inhalation
  micromovements: number; // 0-1, subtle audio preparation signals
  backgroundNoise: number; // 0-1, preparation sounds (lip smacking, etc.)
  pausePatterns: number; // 0-1, likelihood based on learned pause preferences
  urgencyScore: number; // 0-1, how urgent the interruption seems
}

export interface ConversationFlow {
  currentSentenceProgress: number; // 0-1, how far through current sentence
  thoughtCompleteness: number; // 0-1, how complete the current thought is
  naturalBreakPoints: number[]; // Array of time positions where breaks feel natural
  contextualPriority: 'low' | 'medium' | 'high' | 'crisis'; // Current topic priority
  userEngagement: number; // 0-1, how engaged the user seems
}

export interface InterruptionDecision {
  shouldYield: boolean;
  yieldConfidence: number; // 0-1, confidence in the decision
  delayMs: number; // Milliseconds to wait before yielding
  resumeStrategy: 'continue' | 'summarize' | 'redirect' | 'pause_indefinitely';
  reason: string; // Human-readable reason for the decision
}

export interface UserInteractionPattern {
  averageTurnLength: number; // Milliseconds
  preferredPauseLength: number; // Milliseconds
  interruptionStyle: 'polite' | 'assertive' | 'hesitant' | 'urgent';
  emotionalInterruptionTriggers: string[]; // Emotions that trigger interruptions
  timeOfDayPatterns: Map<number, number>; // Hour -> interruption frequency
  conversationLengthTolerance: number; // How long they tolerate being spoken to
}

// Predictive Interruption Intelligence Engine
export class PredictiveInterruptionEngine {
  private userPatterns: UserInteractionPattern;
  private conversationHistory: Array<{
    timestamp: number;
    speaker: 'user' | 'zoxaa';
    duration: number;
    wasInterrupted: boolean;
    emotionalState: EmotionalState;
  }>;
  
  private audioAnalysisBuffer: Float32Array[];
  private lastBreathDetection: number = 0;
  private micromovementThreshold: number = 0.003;
  private urgencyThreshold: number = 0.7;

  constructor() {
    this.userPatterns = {
      averageTurnLength: 3000, // 3 seconds default
      preferredPauseLength: 500, // 0.5 seconds default
      interruptionStyle: 'polite',
      emotionalInterruptionTriggers: ['anxious', 'angry', 'crisis'],
      timeOfDayPatterns: new Map(),
      conversationLengthTolerance: 30000 // 30 seconds default
    };
    
    this.conversationHistory = [];
    this.audioAnalysisBuffer = [];
  }

  // Analyze real-time audio for interruption intentions
  analyzeIntentionSignals(audioData: Float32Array, currentTime: number): IntentionSignals {
    // Store recent audio for pattern analysis
    this.audioAnalysisBuffer.push(audioData);
    if (this.audioAnalysisBuffer.length > 10) {
      this.audioAnalysisBuffer.shift(); // Keep last 10 frames
    }

    // Detect breath intake patterns
    const breathIntake = this.detectBreathIntake(audioData, currentTime);
    
    // Detect subtle preparation sounds
    const micromovements = this.detectMicromovements(audioData);
    
    // Analyze background preparation sounds
    const backgroundNoise = this.analyzeBackgroundPreparation(audioData);
    
    // Calculate pause pattern likelihood
    const pausePatterns = this.calculatePausePatternLikelihood(currentTime);
    
    // Calculate overall urgency
    const urgencyScore = this.calculateUrgencyScore(breathIntake, micromovements, backgroundNoise);

    return {
      breathIntake,
      micromovements,
      backgroundNoise,
      pausePatterns,
      urgencyScore
    };
  }

  // Analyze current conversation flow for natural break points
  analyzeConversationFlow(
    currentText: string, 
    speechProgress: number, 
    emotionalState: EmotionalState,
    topicContext: string
  ): ConversationFlow {
    // Calculate sentence progress
    const sentences = currentText.split(/[.!?]+/);
    const currentSentence = sentences[sentences.length - 1] || '';
    const avgSentenceLength = 15; // Average words per sentence
    const currentSentenceWords = currentSentence.split(' ').length;
    const currentSentenceProgress = Math.min(currentSentenceWords / avgSentenceLength, 1);

    // Analyze thought completeness
    const thoughtCompleteness = this.analyzeThoughtCompleteness(currentText, currentSentence);
    
    // Identify natural break points
    const naturalBreakPoints = this.identifyNaturalBreakPoints(currentText);
    
    // Determine contextual priority
    const contextualPriority = this.determineContextualPriority(emotionalState, topicContext);
    
    // Calculate user engagement based on history
    const userEngagement = this.calculateUserEngagement(emotionalState);

    return {
      currentSentenceProgress,
      thoughtCompleteness,
      naturalBreakPoints,
      contextualPriority,
      userEngagement
    };
  }

  // Make intelligent interruption decision
  makeInterruptionDecision(
    intentions: IntentionSignals,
    conversationFlow: ConversationFlow,
    emotionalState: EmotionalState
  ): InterruptionDecision {
    // Crisis override - always yield immediately
    if (conversationFlow.contextualPriority === 'crisis' || intentions.urgencyScore > 0.9) {
      return {
        shouldYield: true,
        yieldConfidence: 0.95,
        delayMs: 0,
        resumeStrategy: 'pause_indefinitely',
        reason: 'Crisis or high urgency detected'
      };
    }

    // Calculate base interruption probability
    let interruptionProbability = 0;
    
    // Intention signals weight
    interruptionProbability += intentions.breathIntake * 0.3;
    interruptionProbability += intentions.micromovements * 0.2;
    interruptionProbability += intentions.backgroundNoise * 0.15;
    interruptionProbability += intentions.pausePatterns * 0.25;
    interruptionProbability += intentions.urgencyScore * 0.1;

    // Conversation flow adjustments
    if (conversationFlow.thoughtCompleteness > 0.8) {
      interruptionProbability += 0.2; // Easier to interrupt at thought completion
    } else if (conversationFlow.currentSentenceProgress < 0.3) {
      interruptionProbability -= 0.3; // Harder to interrupt mid-sentence start
    }

    // User engagement adjustments
    if (conversationFlow.userEngagement < 0.4) {
      interruptionProbability += 0.3; // Low engagement means they want to speak
    }

    // Emotional state adjustments
    if (emotionalState.emotion === 'anxious' || emotionalState.arousal > 0.7) {
      interruptionProbability += 0.2; // Anxious users need to be heard quickly
    }

    // User pattern adjustments
    if (this.userPatterns.interruptionStyle === 'assertive') {
      interruptionProbability += 0.1;
    } else if (this.userPatterns.interruptionStyle === 'hesitant') {
      interruptionProbability += 0.2; // Help hesitant users more
    }

    // Make decision
    const shouldYield = interruptionProbability > 0.5;
    const yieldConfidence = Math.abs(interruptionProbability - 0.5) * 2; // 0-1 confidence

    // Calculate delay
    let delayMs = 0;
    if (shouldYield) {
      if (conversationFlow.thoughtCompleteness < 0.7) {
        delayMs = Math.max(500, (0.7 - conversationFlow.thoughtCompleteness) * 2000);
      }
      
      // Reduce delay for urgent situations
      if (intentions.urgencyScore > 0.6) {
        delayMs = Math.min(delayMs, 200);
      }
    }

    // Determine resume strategy
    let resumeStrategy: 'continue' | 'summarize' | 'redirect' | 'pause_indefinitely' = 'continue';
    
    if (conversationFlow.contextualPriority === 'high' || intentions.urgencyScore > 0.7) {
      resumeStrategy = 'redirect';
    } else if (conversationFlow.thoughtCompleteness < 0.5) {
      resumeStrategy = 'summarize';
    }

    // Generate reason
    const reason = this.generateInterruptionReason(intentions, conversationFlow, interruptionProbability);

    return {
      shouldYield,
      yieldConfidence,
      delayMs,
      resumeStrategy,
      reason
    };
  }

  // Learn from user interactions to improve predictions
  learnFromInteraction(
    wasInterrupted: boolean,
    userResponse: string,
    emotionalState: EmotionalState,
    conversationLength: number,
    timeOfDay: number
  ): void {
    // Record interaction
    this.conversationHistory.push({
      timestamp: Date.now(),
      speaker: 'zoxaa',
      duration: conversationLength,
      wasInterrupted,
      emotionalState
    });

    // Keep history manageable
    if (this.conversationHistory.length > 100) {
      this.conversationHistory.shift();
    }

    // Update user patterns
    this.updateUserPatterns(wasInterrupted, userResponse, emotionalState, conversationLength, timeOfDay);
    
    console.log('🧠 Learned from interaction:', {
      wasInterrupted,
      emotionalState: emotionalState.emotion,
      updatedPatterns: this.userPatterns
    });
  }

  // Get current user patterns for debugging/analysis
  getUserPatterns(): UserInteractionPattern {
    return { ...this.userPatterns };
  }

  // Private helper methods
  private detectBreathIntake(audioData: Float32Array, currentTime: number): number {
    // Look for low-frequency, high-amplitude patterns typical of inhalation
    const lowFreqEnergy = this.calculateLowFrequencyEnergy(audioData);
    const amplitudeSpike = this.detectAmplitudeSpike(audioData);
    
    // Time-based filtering to avoid false positives
    const timeSinceLastBreath = currentTime - this.lastBreathDetection;
    if (timeSinceLastBreath < 1000) { // Less than 1 second
      return 0;
    }
    
    const breathScore = (lowFreqEnergy * 0.6 + amplitudeSpike * 0.4);
    
    if (breathScore > 0.5) {
      this.lastBreathDetection = currentTime;
    }
    
    return Math.min(breathScore, 1);
  }

  private detectMicromovements(audioData: Float32Array): number {
    // Detect very subtle audio changes that might indicate preparation to speak
    if (this.audioAnalysisBuffer.length < 2) return 0;
    
    const previousAudio = this.audioAnalysisBuffer[this.audioAnalysisBuffer.length - 2];
    const differences: number[] = [];
    
    for (let i = 0; i < Math.min(audioData.length, previousAudio.length); i++) {
      differences.push(Math.abs(audioData[i] - previousAudio[i]));
    }
    
    const avgDifference = differences.reduce((a, b) => a + b, 0) / differences.length;
    return Math.min(avgDifference / this.micromovementThreshold, 1);
  }

  private analyzeBackgroundPreparation(audioData: Float32Array): number {
    // Look for characteristic sounds that precede speech (lip smacking, tongue clicks, etc.)
    const highFreqEnergy = this.calculateHighFrequencyEnergy(audioData);
    const shortBursts = this.detectShortEnergyBursts(audioData);
    
    return Math.min((highFreqEnergy * 0.4 + shortBursts * 0.6), 1);
  }

  private calculatePausePatternLikelihood(currentTime: number): number {
    if (this.conversationHistory.length < 3) return 0.5; // Default
    
    // Analyze historical pause patterns
    const recentInterruptions = this.conversationHistory
      .filter(h => h.wasInterrupted && (currentTime - h.timestamp) < 300000) // Last 5 minutes
      .length;
    
    const totalRecent = this.conversationHistory
      .filter(h => (currentTime - h.timestamp) < 300000)
      .length;
    
    return totalRecent > 0 ? recentInterruptions / totalRecent : 0.5;
  }

  private calculateUrgencyScore(breathIntake: number, micromovements: number, backgroundNoise: number): number {
    // Combine signals to determine urgency
    const combinedSignals = (breathIntake + micromovements + backgroundNoise) / 3;
    
    // Apply non-linear scaling for urgency
    return Math.pow(combinedSignals, 1.5);
  }

  private analyzeThoughtCompleteness(fullText: string, currentSentence: string): number {
    // Analyze linguistic patterns to determine if thought is complete
    const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) return 0;
    
    // Check for completion markers
    const completionMarkers = [
      'so', 'therefore', 'in conclusion', 'finally', 'ultimately',
      'that\'s why', 'anyway', 'basically', 'essentially'
    ];
    
    const hasCompletionMarker = completionMarkers.some(marker => 
      currentSentence.toLowerCase().includes(marker)
    );
    
    // Check sentence structure
    const hasCompleteStructure = /\b(and|but|so|because|when|if|that)\b/.test(currentSentence);
    
    let completeness = 0.5; // Base completeness
    
    if (hasCompletionMarker) completeness += 0.3;
    if (hasCompleteStructure) completeness += 0.2;
    if (currentSentence.trim().endsWith('.')) completeness += 0.2;
    
    return Math.min(completeness, 1);
  }

  private identifyNaturalBreakPoints(text: string): number[] {
    const breakPoints: number[] = [];
    const breakMarkers = ['.', '!', '?', ',', ';', ' and ', ' but ', ' so ', ' because '];
    
    let position = 0;
    for (const char of text) {
      if (breakMarkers.includes(char) || breakMarkers.some(marker => 
        text.substr(position - marker.length + 1, marker.length) === marker
      )) {
        breakPoints.push(position);
      }
      position++;
    }
    
    return breakPoints;
  }

  private determineContextualPriority(emotionalState: EmotionalState, topicContext: string): 'low' | 'medium' | 'high' | 'crisis' {
    // Crisis detection
    if (emotionalState.emotion === 'crisis' || 
        topicContext.toLowerCase().includes('suicide') ||
        topicContext.toLowerCase().includes('crisis')) {
      return 'crisis';
    }
    
    // High priority emotions
    if (emotionalState.emotion === 'anxious' || 
        emotionalState.emotion === 'angry' ||
        emotionalState.arousal > 0.8) {
      return 'high';
    }
    
    // Medium priority
    if (emotionalState.emotion === 'sad' || 
        emotionalState.pleasure < 0.3) {
      return 'medium';
    }
    
    return 'low';
  }

  private calculateUserEngagement(emotionalState: EmotionalState): number {
    // Base engagement on emotional arousal and recent interaction patterns
    let engagement = emotionalState.arousal;
    
    // Adjust based on recent interruption patterns
    const recentInterruptions = this.conversationHistory
      .slice(-5) // Last 5 interactions
      .filter(h => h.wasInterrupted)
      .length;
    
    // High interruption rate suggests low engagement with current speech
    engagement -= (recentInterruptions / 5) * 0.3;
    
    return Math.max(0, Math.min(1, engagement));
  }

  private updateUserPatterns(
    wasInterrupted: boolean,
    userResponse: string,
    emotionalState: EmotionalState,
    conversationLength: number,
    timeOfDay: number
  ): void {
    // Update average turn length
    this.userPatterns.averageTurnLength = 
      (this.userPatterns.averageTurnLength * 0.9) + (conversationLength * 0.1);
    
    // Update interruption style
    if (wasInterrupted && conversationLength < 2000) {
      this.userPatterns.interruptionStyle = 'assertive';
    } else if (!wasInterrupted && conversationLength > 10000) {
      this.userPatterns.interruptionStyle = 'polite';
    }
    
    // Update emotional triggers
    if (wasInterrupted && !this.userPatterns.emotionalInterruptionTriggers.includes(emotionalState.emotion)) {
      this.userPatterns.emotionalInterruptionTriggers.push(emotionalState.emotion);
    }
    
    // Update time of day patterns
    const hour = Math.floor(timeOfDay / (1000 * 60 * 60)) % 24;
    const currentCount = this.userPatterns.timeOfDayPatterns.get(hour) || 0;
    this.userPatterns.timeOfDayPatterns.set(hour, currentCount + (wasInterrupted ? 1 : 0));
  }

  private generateInterruptionReason(
    intentions: IntentionSignals,
    conversationFlow: ConversationFlow,
    probability: number
  ): string {
    if (probability > 0.8) {
      return 'Strong intention signals detected, user likely wants to speak';
    } else if (probability > 0.6) {
      return 'Moderate intention signals, natural break point available';
    } else if (probability > 0.4) {
      return 'Some intention signals, waiting for better opportunity';
    } else {
      return 'Low intention signals, continuing current thought';
    }
  }

  // Audio analysis helper methods
  private calculateLowFrequencyEnergy(audioData: Float32Array): number {
    // Simplified low-frequency energy calculation
    let energy = 0;
    const lowFreqSamples = Math.min(audioData.length / 4, 512); // Low frequency portion
    
    for (let i = 0; i < lowFreqSamples; i++) {
      energy += audioData[i] * audioData[i];
    }
    
    return Math.sqrt(energy / lowFreqSamples);
  }

  private calculateHighFrequencyEnergy(audioData: Float32Array): number {
    // Simplified high-frequency energy calculation
    let energy = 0;
    const startIndex = Math.floor(audioData.length * 0.7); // High frequency portion
    
    for (let i = startIndex; i < audioData.length; i++) {
      energy += audioData[i] * audioData[i];
    }
    
    return Math.sqrt(energy / (audioData.length - startIndex));
  }

  private detectAmplitudeSpike(audioData: Float32Array): number {
    if (this.audioAnalysisBuffer.length < 2) return 0;
    
    const currentMax = Math.max(...Array.from(audioData).map(Math.abs));
    const previousMax = Math.max(...Array.from(this.audioAnalysisBuffer[this.audioAnalysisBuffer.length - 2]).map(Math.abs));
    
    const spike = Math.max(0, currentMax - previousMax);
    return Math.min(spike * 5, 1); // Scale and cap at 1
  }

  private detectShortEnergyBursts(audioData: Float32Array): number {
    const windowSize = 64;
    let bursts = 0;
    
    for (let i = 0; i < audioData.length - windowSize; i += windowSize) {
      const window = audioData.slice(i, i + windowSize);
      const energy = Math.sqrt(window.reduce((sum, val) => sum + val * val, 0) / windowSize);
      
      if (energy > 0.05 && energy < 0.2) { // Short burst range
        bursts++;
      }
    }
    
    return Math.min(bursts / 10, 1); // Normalize
  }
}

// Export singleton instance
export const predictiveInterruption = new PredictiveInterruptionEngine();
