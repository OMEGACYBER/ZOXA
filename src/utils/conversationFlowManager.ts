// 🎤 Conversation Flow Manager - ZOXAA Voice Intelligence
// Manages natural conversation flow, turn-taking, and transitions

export interface ConversationState {
  phase: 'greeting' | 'listening' | 'processing' | 'responding' | 'transitioning' | 'paused';
  turnNumber: number;
  lastUserInput: string;
  lastUserEmotion: string;
  conversationHistory: Array<{
    speaker: 'user' | 'zoxaa';
    text: string;
    emotion: string;
    timestamp: number;
    duration: number;
  }>;
  engagement: number;
  naturalFlow: boolean;
  pauseDuration: number;
  interruptionCount: number;
  responseDelay: number;
}

export interface FlowDecision {
  action: 'speak' | 'listen' | 'pause' | 'transition' | 'interrupt';
  duration: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  emotionalContext: string;
}

export interface TurnTakingConfig {
  minResponseDelay: number;    // Minimum delay before responding (ms)
  maxResponseDelay: number;    // Maximum delay before responding (ms)
  naturalPauseDuration: number; // Natural pause duration (ms)
  interruptionThreshold: number; // Threshold for interruption detection
  engagementDecay: number;     // Engagement decay rate
  turnTimeout: number;         // Turn timeout (ms)
}

export class ConversationFlowManager {
  private conversations: Map<string, ConversationState> = new Map();
  private config: TurnTakingConfig;
  private naturalPausePatterns: RegExp[] = [];
  private engagementTriggers: Set<string> = new Set();
  private disengagementTriggers: Set<string> = new Set();
  
  constructor(config: Partial<TurnTakingConfig> = {}) {
    this.config = {
      minResponseDelay: 500,
      maxResponseDelay: 3000,
      naturalPauseDuration: 800,
      interruptionThreshold: 0.7,
      engagementDecay: 0.95,
      turnTimeout: 10000,
      ...config
    };
    
    this.initializePatterns();
  }

  // 🎯 Process conversation flow and make decisions
  processFlow(sessionId: string, userInput: string, userEmotion: string): FlowDecision {
    const state = this.getOrCreateState(sessionId);
    
    // Update conversation state
    this.updateState(state, userInput, userEmotion);
    
    // Calculate engagement
    const engagement = this.calculateEngagement(state, userInput, userEmotion);
    state.engagement = engagement;
    
    // Determine next action
    const decision = this.determineNextAction(state, userInput, userEmotion);
    
    // Update state based on decision
    this.applyDecision(state, decision);
    
    return decision;
  }

  // 🎭 Determine the next action in conversation flow
  private determineNextAction(state: ConversationState, userInput: string, userEmotion: string): FlowDecision {
    const { phase, turnNumber, engagement, interruptionCount } = state;
    
    // Handle interruptions
    if (this.shouldInterrupt(state, userInput)) {
      return {
        action: 'interrupt',
        duration: 0,
        reason: 'User interruption detected',
        priority: 'high',
        emotionalContext: userEmotion
      };
    }
    
    // Handle different conversation phases
    switch (phase) {
      case 'greeting':
        return this.handleGreetingPhase(state, userInput);
      
      case 'listening':
        return this.handleListeningPhase(state, userInput, userEmotion);
      
      case 'processing':
        return this.handleProcessingPhase(state, userInput);
      
      case 'responding':
        return this.handleRespondingPhase(state, userInput);
      
      case 'transitioning':
        return this.handleTransitioningPhase(state, userInput);
      
      case 'paused':
        return this.handlePausedPhase(state, userInput);
      
      default:
        return this.handleDefaultPhase(state, userInput);
    }
  }

  // 👋 Handle greeting phase
  private handleGreetingPhase(state: ConversationState, userInput: string): FlowDecision {
    const isGreeting = this.isGreeting(userInput);
    
    if (isGreeting) {
      return {
        action: 'speak',
        duration: this.calculateResponseDelay(state, 'greeting'),
        reason: 'Responding to greeting',
        priority: 'high',
        emotionalContext: 'warm'
      };
    } else {
      state.phase = 'listening';
      return {
        action: 'listen',
        duration: this.config.turnTimeout,
        reason: 'Transitioning to listening phase',
        priority: 'medium',
        emotionalContext: 'neutral'
      };
    }
  }

  // 👂 Handle listening phase
  private handleListeningPhase(state: ConversationState, userInput: string, userEmotion: string): FlowDecision {
    const inputLength = userInput.length;
    const hasQuestion = userInput.includes('?');
    const isEmotional = this.isEmotionalInput(userInput, userEmotion);
    
    // Check if user is done speaking
    if (this.isUserDoneSpeaking(userInput, state)) {
      state.phase = 'processing';
      return {
        action: 'pause',
        duration: this.config.naturalPauseDuration,
        reason: 'Processing user input',
        priority: 'medium',
        emotionalContext: userEmotion
      };
    }
    
    // Continue listening
    return {
      action: 'listen',
      duration: this.config.turnTimeout,
      reason: 'Continuing to listen',
      priority: 'medium',
      emotionalContext: userEmotion
    };
  }

  // 🧠 Handle processing phase
  private handleProcessingPhase(state: ConversationState, userInput: string): FlowDecision {
    const processingTime = this.calculateProcessingTime(userInput);
    
    if (processingTime > 0) {
      return {
        action: 'pause',
        duration: processingTime,
        reason: 'Processing user input',
        priority: 'medium',
        emotionalContext: 'neutral'
      };
    } else {
      state.phase = 'responding';
      return {
        action: 'speak',
        duration: this.calculateResponseDelay(state, 'responding'),
        reason: 'Preparing response',
        priority: 'high',
        emotionalContext: 'engaged'
      };
    }
  }

  // 🗣️ Handle responding phase
  private handleRespondingPhase(state: ConversationState, userInput: string): FlowDecision {
    const responseDelay = this.calculateResponseDelay(state, 'responding');
    
    return {
      action: 'speak',
      duration: responseDelay,
      reason: 'Generating response',
      priority: 'high',
      emotionalContext: 'responsive'
    };
  }

  // 🔄 Handle transitioning phase
  private handleTransitioningPhase(state: ConversationState, userInput: string): FlowDecision {
    const transitionTime = this.calculateTransitionTime(state);
    
    if (transitionTime > 0) {
      return {
        action: 'pause',
        duration: transitionTime,
        reason: 'Conversation transition',
        priority: 'low',
        emotionalContext: 'neutral'
      };
    } else {
      state.phase = 'listening';
      return {
        action: 'listen',
        duration: this.config.turnTimeout,
        reason: 'Ready for next input',
        priority: 'medium',
        emotionalContext: 'neutral'
      };
    }
  }

  // ⏸️ Handle paused phase
  private handlePausedPhase(state: ConversationState, userInput: string): FlowDecision {
    const pauseRemaining = state.pauseDuration;
    
    if (pauseRemaining > 0) {
      return {
        action: 'pause',
        duration: pauseRemaining,
        reason: 'Continuing pause',
        priority: 'low',
        emotionalContext: 'neutral'
      };
    } else {
      state.phase = 'listening';
      return {
        action: 'listen',
        duration: this.config.turnTimeout,
        reason: 'Pause complete, ready to listen',
        priority: 'medium',
        emotionalContext: 'neutral'
      };
    }
  }

  // 🎯 Handle default phase
  private handleDefaultPhase(state: ConversationState, userInput: string): FlowDecision {
    state.phase = 'listening';
    return {
      action: 'listen',
      duration: this.config.turnTimeout,
      reason: 'Default listening mode',
      priority: 'medium',
      emotionalContext: 'neutral'
    };
  }

  // ⚡ Check if user should be interrupted
  private shouldInterrupt(state: ConversationState, userInput: string): boolean {
    const hasUrgentKeyword = this.hasUrgentKeyword(userInput);
    const highEngagement = state.engagement > this.config.interruptionThreshold;
    const recentInterruption = state.interruptionCount < 2; // Limit interruptions
    
    return hasUrgentKeyword && highEngagement && recentInterruption;
  }

  // 🎯 Calculate engagement level
  private calculateEngagement(state: ConversationState, userInput: string, userEmotion: string): number {
    let engagement = state.engagement * this.config.engagementDecay;
    
    // Boost engagement for emotional inputs
    if (this.isEmotionalInput(userInput, userEmotion)) {
      engagement += 0.2;
    }
    
    // Boost engagement for questions
    if (userInput.includes('?')) {
      engagement += 0.15;
    }
    
    // Boost engagement for engagement triggers
    if (this.hasEngagementTrigger(userInput)) {
      engagement += 0.1;
    }
    
    // Reduce engagement for disengagement triggers
    if (this.hasDisengagementTrigger(userInput)) {
      engagement -= 0.2;
    }
    
    return Math.max(0, Math.min(1, engagement));
  }

  // ⏱️ Calculate response delay
  private calculateResponseDelay(state: ConversationState, context: string): number {
    const baseDelay = this.config.minResponseDelay;
    const maxDelay = this.config.maxResponseDelay;
    
    let delay = baseDelay;
    
    // Adjust based on context
    switch (context) {
      case 'greeting':
        delay = baseDelay * 0.8; // Faster for greetings
        break;
      case 'responding':
        delay = baseDelay * 1.2; // Slightly slower for responses
        break;
      case 'emotional':
        delay = baseDelay * 0.9; // Faster for emotional responses
        break;
    }
    
    // Adjust based on engagement
    if (state.engagement > 0.8) {
      delay *= 0.8; // Faster when highly engaged
    } else if (state.engagement < 0.3) {
      delay *= 1.3; // Slower when less engaged
    }
    
    // Add natural variation
    const variation = (Math.random() - 0.5) * 0.2;
    delay *= (1 + variation);
    
    return Math.max(this.config.minResponseDelay, Math.min(maxDelay, delay));
  }

  // 🧠 Calculate processing time
  private calculateProcessingTime(userInput: string): number {
    const wordCount = userInput.split(' ').length;
    const baseProcessingTime = 200; // Base processing time per word
    const maxProcessingTime = 2000; // Maximum processing time
    
    let processingTime = wordCount * baseProcessingTime;
    
    // Add complexity factor
    const hasComplexEmotion = /sad|angry|anxious|fear|surprise/.test(userInput.toLowerCase());
    if (hasComplexEmotion) {
      processingTime *= 1.5;
    }
    
    return Math.min(maxProcessingTime, processingTime);
  }

  // 🔄 Calculate transition time
  private calculateTransitionTime(state: ConversationState): number {
    const baseTransitionTime = 500;
    const engagementFactor = 1 - state.engagement; // Longer transitions for lower engagement
    
    return baseTransitionTime * (1 + engagementFactor);
  }

  // 📝 Update conversation state
  private updateState(state: ConversationState, userInput: string, userEmotion: string): void {
    state.turnNumber++;
    state.lastUserInput = userInput;
    state.lastUserEmotion = userEmotion;
    
    // Add to conversation history
    state.conversationHistory.push({
      speaker: 'user',
      text: userInput,
      emotion: userEmotion,
      timestamp: Date.now(),
      duration: 0 // Will be calculated later
    });
    
    // Keep only recent history
    if (state.conversationHistory.length > 20) {
      state.conversationHistory.shift();
    }
  }

  // 🎯 Apply decision to state
  private applyDecision(state: ConversationState, decision: FlowDecision): void {
    switch (decision.action) {
      case 'interrupt':
        state.interruptionCount++;
        state.phase = 'responding';
        break;
      case 'speak':
        state.phase = 'responding';
        break;
      case 'listen':
        state.phase = 'listening';
        break;
      case 'pause':
        state.phase = 'paused';
        state.pauseDuration = decision.duration;
        break;
      case 'transition':
        state.phase = 'transitioning';
        break;
    }
  }

  // 🎭 Check if input is emotional
  private isEmotionalInput(userInput: string, userEmotion: string): boolean {
    const emotionalKeywords = ['love', 'hate', 'sad', 'happy', 'angry', 'scared', 'excited', 'worried'];
    const hasEmotionalKeyword = emotionalKeywords.some(keyword => 
      userInput.toLowerCase().includes(keyword)
    );
    
    return hasEmotionalKeyword || userEmotion !== 'neutral';
  }

  // 👋 Check if input is a greeting
  private isGreeting(userInput: string): boolean {
    const greetingPatterns = [
      /^hi\b/i, /^hello\b/i, /^hey\b/i, /^good morning\b/i, 
      /^good afternoon\b/i, /^good evening\b/i, /^how are you\b/i
    ];
    
    return greetingPatterns.some(pattern => pattern.test(userInput));
  }

  // ✅ Check if user is done speaking
  private isUserDoneSpeaking(userInput: string, state: ConversationState): boolean {
    const hasEndingPunctuation = /[.!?]$/.test(userInput.trim());
    const hasQuestion = userInput.includes('?');
    const isLongEnough = userInput.length > 10;
    
    return hasEndingPunctuation || hasQuestion || isLongEnough;
  }

  // 🚨 Check for urgent keywords
  private hasUrgentKeyword(userInput: string): boolean {
    const urgentKeywords = ['help', 'emergency', 'urgent', 'stop', 'wait', 'no'];
    return urgentKeywords.some(keyword => userInput.toLowerCase().includes(keyword));
  }

  // 🎯 Check for engagement triggers
  private hasEngagementTrigger(userInput: string): boolean {
    return Array.from(this.engagementTriggers).some(trigger => 
      userInput.toLowerCase().includes(trigger)
    );
  }

  // 😴 Check for disengagement triggers
  private hasDisengagementTrigger(userInput: string): boolean {
    return Array.from(this.disengagementTriggers).some(trigger => 
      userInput.toLowerCase().includes(trigger)
    );
  }

  // 🎨 Initialize patterns and triggers
  private initializePatterns(): void {
    // Natural pause patterns
    this.naturalPausePatterns = [
      /,\s*/g,
      /;\s*/g,
      /\s+and\s+/gi,
      /\s+but\s+/gi,
      /\s+however\s+/gi
    ];
    
    // Engagement triggers
    const engagementWords = [
      'really', 'interesting', 'tell me more', 'what do you think',
      'how', 'why', 'when', 'where', 'who', 'what'
    ];
    engagementWords.forEach(word => this.engagementTriggers.add(word));
    
    // Disengagement triggers
    const disengagementWords = [
      'whatever', 'i don\'t care', 'not interested', 'boring',
      'stop talking', 'shut up', 'leave me alone'
    ];
    disengagementWords.forEach(word => this.disengagementTriggers.add(word));
  }

  // 🎯 Get or create conversation state
  private getOrCreateState(sessionId: string): ConversationState {
    let state = this.conversations.get(sessionId);
    
    if (!state) {
      state = {
        phase: 'greeting',
        turnNumber: 0,
        lastUserInput: '',
        lastUserEmotion: 'neutral',
        conversationHistory: [],
        engagement: 0.5,
        naturalFlow: true,
        pauseDuration: 0,
        interruptionCount: 0,
        responseDelay: 0
      };
      this.conversations.set(sessionId, state);
    }
    
    return state;
  }

  // 📊 Get conversation statistics
  getConversationStats(sessionId: string): any {
    const state = this.conversations.get(sessionId);
    if (!state) return null;
    
    return {
      turnNumber: state.turnNumber,
      engagement: state.engagement,
      phase: state.phase,
      interruptionCount: state.interruptionCount,
      historyLength: state.conversationHistory.length,
      averageTurnDuration: this.calculateAverageTurnDuration(state)
    };
  }

  // ⏱️ Calculate average turn duration
  private calculateAverageTurnDuration(state: ConversationState): number {
    if (state.conversationHistory.length < 2) return 0;
    
    const durations = state.conversationHistory.map((entry, index) => {
      if (index === 0) return 0;
      return entry.timestamp - state.conversationHistory[index - 1].timestamp;
    }).filter(d => d > 0);
    
    return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  }

  // 🧹 Clean up old conversations
  cleanup(): void {
    const cutoffTime = Date.now() - (60 * 60 * 1000); // 1 hour
    
    for (const [sessionId, state] of this.conversations.entries()) {
      const lastActivity = state.conversationHistory[state.conversationHistory.length - 1]?.timestamp || 0;
      if (lastActivity < cutoffTime) {
        this.conversations.delete(sessionId);
      }
    }
  }
}

export default ConversationFlowManager;
