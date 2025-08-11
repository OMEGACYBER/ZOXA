// 🎤 Conversation Manager - Natural Human-like Conversation Flow
// Handles greeting, listening, responding, and transitions without debug exposure

export interface ConversationState {
  phase: 'greeting' | 'listening' | 'processing' | 'responding' | 'transitioning';
  turnNumber: number;
  lastUserInput: string;
  lastUserEmotion: string;
  conversationHistory: Array<{
    speaker: 'user' | 'zoxaa';
    text: string;
    emotion: string;
    timestamp: number;
  }>;
  engagement: number;
  naturalFlow: boolean;
}

export interface ConversationResponse {
  text: string;
  emotion: string;
  voiceSettings: any;
  shouldListen: boolean;
  naturalDelay: number;
}

export class ConversationManager {
  private conversations: Map<string, ConversationState> = new Map();
  private productionMode: boolean = true;

  // Natural conversation patterns
  private readonly greetingPatterns = [
    "Hey there! How's your day been so far?",
    "Hi! I'm here to chat. What's on your mind?",
    "Hello! I'd love to hear about your day.",
    "Hey! How are you feeling today?",
    "Hi there! What's been happening in your world?"
  ];

  private readonly transitionPatterns = [
    "Tell me more about that.",
    "That's really interesting. What happened next?",
    "I'd love to hear more.",
    "That sounds important. Can you elaborate?",
    "What do you think about that?"
  ];

  private readonly acknowledgmentPatterns = [
    "I hear you.",
    "That makes sense.",
    "I understand.",
    "I see what you mean.",
    "That's valid."
  ];

  constructor(productionMode: boolean = true) {
    this.productionMode = productionMode;
  }

  // 🎤 Start a new conversation
  startConversation(sessionId: string): ConversationResponse {
    const state: ConversationState = {
      phase: 'greeting',
      turnNumber: 0,
      lastUserInput: '',
      lastUserEmotion: 'neutral',
      conversationHistory: [],
      engagement: 0.5,
      naturalFlow: true
    };

    this.conversations.set(sessionId, state);

    const greeting = this.getRandomPattern(this.greetingPatterns);
    
    return {
      text: greeting,
      emotion: 'warm',
      voiceSettings: {
        voice: 'nova',
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0,
        emotion: 'warm',
        ssml: true,
        emotionalModulation: true
      },
      shouldListen: true,
      naturalDelay: 1000
    };
  }

  // 🎧 Process user input and determine response
  processUserInput(sessionId: string, userText: string, userEmotion: string): ConversationResponse {
    const state = this.conversations.get(sessionId);
    if (!state) {
      return this.startConversation(sessionId);
    }

    // Update conversation state
    state.turnNumber++;
    state.lastUserInput = userText;
    state.lastUserEmotion = userEmotion;
    state.phase = 'processing';

    // Add to history
    state.conversationHistory.push({
      speaker: 'user',
      text: userText,
      emotion: userEmotion,
      timestamp: Date.now()
    });

    // Determine response based on conversation flow
    const response = this.determineResponse(state, userText, userEmotion);

    // Update state
    state.phase = 'responding';
    state.engagement = this.calculateEngagement(state);

    return response;
  }

  // 🧠 Determine appropriate response
  private determineResponse(state: ConversationState, userText: string, userEmotion: string): ConversationResponse {
    const lowerText = userText.toLowerCase();

    // Check for conversation flow patterns
    if (this.isGreeting(lowerText)) {
      return this.handleGreeting(state);
    } else if (this.isFarewell(lowerText)) {
      return this.handleFarewell(state);
    } else if (this.isQuestion(lowerText)) {
      return this.handleQuestion(state, userText, userEmotion);
    } else if (this.isEmotional(lowerText, userEmotion)) {
      return this.handleEmotionalResponse(state, userText, userEmotion);
    } else {
      return this.handleGeneralResponse(state, userText, userEmotion);
    }
  }

  // 👋 Handle greetings
  private handleGreeting(state: ConversationState): ConversationResponse {
    const responses = [
      "Hello! It's great to hear from you.",
      "Hi there! I'm glad you're here.",
      "Hey! How are you doing today?",
      "Hello! What's new with you?"
    ];

    return {
      text: this.getRandomPattern(responses),
      emotion: 'warm',
      voiceSettings: {
        voice: 'nova',
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0,
        emotion: 'warm',
        ssml: true,
        emotionalModulation: true
      },
      shouldListen: true,
      naturalDelay: 800
    };
  }

  // 👋 Handle farewells
  private handleFarewell(state: ConversationState): ConversationResponse {
    const responses = [
      "Take care! I'm here whenever you want to chat.",
      "Goodbye! It was nice talking with you.",
      "See you later! Don't hesitate to reach out.",
      "Bye! I hope you have a great day."
    ];

    return {
      text: this.getRandomPattern(responses),
      emotion: 'warm',
      voiceSettings: {
        voice: 'nova',
        speed: 0.95,
        pitch: 0.95,
        volume: 0.95,
        emotion: 'warm',
        ssml: true,
        emotionalModulation: true
      },
      shouldListen: false,
      naturalDelay: 500
    };
  }

  // ❓ Handle questions
  private handleQuestion(state: ConversationState, userText: string, userEmotion: string): ConversationResponse {
    const responses = [
      "That's a great question. Let me think about that.",
      "I'd be happy to help with that.",
      "That's interesting to think about.",
      "I can definitely help you with that."
    ];

    return {
      text: this.getRandomPattern(responses),
      emotion: 'engaged',
      voiceSettings: {
        voice: 'nova',
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0,
        emotion: 'engaged',
        ssml: true,
        emotionalModulation: true
      },
      shouldListen: true,
      naturalDelay: 600
    };
  }

  // 🎭 Handle emotional responses
  private handleEmotionalResponse(state: ConversationState, userText: string, userEmotion: string): ConversationResponse {
    let response: string;
    let emotion: string;
    let voiceSettings: any;

    switch (userEmotion) {
      case 'joy':
        response = "That's wonderful! I'm so happy for you!";
        emotion = 'happy';
        voiceSettings = {
          voice: 'nova',
          speed: 1.05,
          pitch: 1.1,
          volume: 1.05,
          emotion: 'happy',
          ssml: true,
          emotionalModulation: true
        };
        break;
      case 'sadness':
        response = "I'm so sorry you're going through that. I'm here for you.";
        emotion = 'caring';
        voiceSettings = {
          voice: 'nova',
          speed: 0.9,
          pitch: 0.9,
          volume: 0.9,
          emotion: 'caring',
          ssml: true,
          emotionalModulation: true
        };
        break;
      case 'anger':
        response = "I understand you're frustrated. That's completely valid.";
        emotion = 'calm';
        voiceSettings = {
          voice: 'nova',
          speed: 0.95,
          pitch: 0.95,
          volume: 0.95,
          emotion: 'calm',
          ssml: true,
          emotionalModulation: true
        };
        break;
      case 'anxiety':
        response = "It's going to be okay. I'm here to support you.";
        emotion = 'reassuring';
        voiceSettings = {
          voice: 'nova',
          speed: 0.9,
          pitch: 0.95,
          volume: 0.9,
          emotion: 'reassuring',
          ssml: true,
          emotionalModulation: true
        };
        break;
      default:
        response = this.getRandomPattern(this.acknowledgmentPatterns);
        emotion = 'neutral';
        voiceSettings = {
          voice: 'nova',
          speed: 1.0,
          pitch: 1.0,
          volume: 1.0,
          emotion: 'neutral',
          ssml: true,
          emotionalModulation: true
        };
    }

    return {
      text: response,
      emotion,
      voiceSettings,
      shouldListen: true,
      naturalDelay: 700
    };
  }

  // 💬 Handle general responses
  private handleGeneralResponse(state: ConversationState, userText: string, userEmotion: string): ConversationResponse {
    const responses = [
      "That's really interesting. Tell me more about that.",
      "I'd love to hear more about your thoughts on this.",
      "That sounds important to you. What makes you feel that way?",
      "I'm curious to hear more about your perspective."
    ];

    return {
      text: this.getRandomPattern(responses),
      emotion: 'curious',
      voiceSettings: {
        voice: 'nova',
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0,
        emotion: 'curious',
        ssml: true,
        emotionalModulation: true
      },
      shouldListen: true,
      naturalDelay: 600
    };
  }

  // 🔍 Pattern detection helpers
  private isGreeting(text: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(greeting => text.includes(greeting));
  }

  private isFarewell(text: string): boolean {
    const farewells = ['goodbye', 'bye', 'see you', 'talk to you later', 'take care'];
    return farewells.some(farewell => text.includes(farewell));
  }

  private isQuestion(text: string): boolean {
    return text.includes('?') || text.includes('what') || text.includes('how') || text.includes('why') || text.includes('when') || text.includes('where');
  }

  private isEmotional(text: string, emotion: string): boolean {
    return emotion !== 'neutral' && emotion !== 'undefined';
  }

  // 📊 Calculate engagement level
  private calculateEngagement(state: ConversationState): number {
    const recentTurns = state.conversationHistory.slice(-5);
    if (recentTurns.length === 0) return 0.5;

    const avgLength = recentTurns.reduce((sum, turn) => sum + turn.text.length, 0) / recentTurns.length;
    const emotionalVariety = new Set(recentTurns.map(turn => turn.emotion)).size;
    
    let engagement = 0.5;
    if (avgLength > 50) engagement += 0.2;
    if (emotionalVariety > 2) engagement += 0.2;
    if (recentTurns.length > 3) engagement += 0.1;

    return Math.min(1.0, engagement);
  }

  // 🎲 Get random pattern
  private getRandomPattern(patterns: string[]): string {
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  // 📝 Production-safe logging
  private log(message: string): void {
    if (!this.productionMode) {
      console.log(`🎤 Conversation Manager: ${message}`);
    }
  }

  // 🔄 Get conversation state
  getConversationState(sessionId: string): ConversationState | null {
    return this.conversations.get(sessionId) || null;
  }

  // 🧹 Clean up old conversations
  cleanupOldConversations(maxAge: number = 30 * 60 * 1000): void {
    const now = Date.now();
    for (const [sessionId, state] of this.conversations.entries()) {
      const lastActivity = state.conversationHistory[state.conversationHistory.length - 1]?.timestamp || 0;
      if (now - lastActivity > maxAge) {
        this.conversations.delete(sessionId);
        if (!this.productionMode) {
          this.log(`Cleaned up old conversation: ${sessionId}`);
        }
      }
    }
  }
}

export default ConversationManager;
