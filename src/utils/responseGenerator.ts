// 🧠 Response Generator - ZOXAA Voice Intelligence
// Generates contextually appropriate, emotionally intelligent responses

export interface ResponseContext {
  userInput: string;
  userEmotion: string;
  userIntensity: number;
  conversationHistory: Array<{
    speaker: 'user' | 'zoxaa';
    text: string;
    emotion: string;
    timestamp: number;
  }>;
  turnNumber: number;
  sessionDuration: number;
  relationshipDepth: number;
  engagement: number;
  conversationFlow: string;
}

export interface ResponseTemplate {
  id: string;
  category: string;
  emotion: string;
  intensity: number;
  templates: string[];
  context: string[];
  variables: string[];
  priority: number;
}

export interface GeneratedResponse {
  text: string;
  emotion: string;
  intensity: number;
  confidence: number;
  context: string;
  variables: Record<string, string>;
  template: string;
}

export class ResponseGenerator {
  private responseTemplates: Map<string, ResponseTemplate[]> = new Map();
  private conversationMemory: Map<string, any> = new Map();
  private responseCache: Map<string, GeneratedResponse> = new Map();
  private maxCacheSize: number = 1000;
  private maxHistoryLength: number = 50;

  constructor() {
    this.initializeResponseTemplates();
  }

  // 🧠 Generate emotionally intelligent response
  generateResponse(context: ResponseContext): GeneratedResponse {
    const cacheKey = this.generateCacheKey(context);
    
    // Check cache first
    const cachedResponse = this.responseCache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Find appropriate template
    const template = this.findBestTemplate(context);
    
    // Generate response text
    const responseText = this.generateResponseText(template, context);
    
    // Create response object
    const response: GeneratedResponse = {
      text: responseText,
      emotion: template.emotion,
      intensity: template.intensity,
      confidence: this.calculateConfidence(template, context),
      context: template.context.join(', '),
      variables: this.extractVariables(template, context),
      template: template.id
    };

    // Cache response
    this.cacheResponse(cacheKey, response);
    
    // Update conversation memory
    this.updateConversationMemory(context, response);
    
    return response;
  }

  // 🎯 Find best response template
  private findBestTemplate(context: ResponseContext): ResponseTemplate {
    const { userEmotion, userIntensity, conversationFlow, turnNumber } = context;
    
    // Get all templates for the emotion category
    const emotionTemplates = this.responseTemplates.get(userEmotion) || [];
    const generalTemplates = this.responseTemplates.get('general') || [];
    const allTemplates = [...emotionTemplates, ...generalTemplates];
    
    // Score templates based on context
    const scoredTemplates = allTemplates.map(template => ({
      template,
      score: this.scoreTemplate(template, context)
    }));
    
    // Sort by score and return best match
    scoredTemplates.sort((a, b) => b.score - a.score);
    
    return scoredTemplates[0]?.template || this.getDefaultTemplate();
  }

  // 📊 Score template based on context
  private scoreTemplate(template: ResponseTemplate, context: ResponseContext): number {
    let score = template.priority;
    
    // Emotion match
    if (template.emotion === context.userEmotion) {
      score += 10;
    }
    
    // Intensity match
    const intensityDiff = Math.abs(template.intensity - context.userIntensity);
    score += Math.max(0, 5 - intensityDiff * 5);
    
    // Context match
    const contextMatch = template.context.some(ctx => 
      context.userInput.toLowerCase().includes(ctx.toLowerCase())
    );
    if (contextMatch) {
      score += 8;
    }
    
    // Conversation flow match
    if (template.category === context.conversationFlow) {
      score += 6;
    }
    
    // Turn number consideration
    if (context.turnNumber === 1 && template.category === 'greeting') {
      score += 15;
    }
    
    // Relationship depth consideration
    if (context.relationshipDepth > 0.7 && template.category === 'intimate') {
      score += 5;
    }
    
    // Engagement consideration
    if (context.engagement > 0.8 && template.category === 'engaged') {
      score += 4;
    }
    
    return score;
  }

  // 📝 Generate response text from template
  private generateResponseText(template: ResponseTemplate, context: ResponseContext): string {
    // Select random template
    const templateText = template.templates[Math.floor(Math.random() * template.templates.length)];
    
    // Replace variables
    let responseText = templateText;
    
    template.variables.forEach(variable => {
      const value = this.getVariableValue(variable, context);
      responseText = responseText.replace(`{${variable}}`, value);
    });
    
    // Add emotional markers
    responseText = this.addEmotionalMarkers(responseText, context);
    
    // Add natural fillers
    responseText = this.addNaturalFillers(responseText, context);
    
    return responseText;
  }

  // 🎭 Add emotional markers to response
  private addEmotionalMarkers(text: string, context: ResponseContext): string {
    const { userEmotion, userIntensity } = context;
    
    // Add emotional prefixes
    const emotionalPrefixes: Record<string, string[]> = {
      joy: ['Oh, that\'s wonderful!', 'I\'m so happy to hear that!', 'That\'s amazing!'],
      sadness: ['I\'m so sorry to hear that.', 'That must be really difficult.', 'I understand how you feel.'],
      anger: ['I can see why you\'d feel that way.', 'That sounds really frustrating.', 'I hear you.'],
      anxiety: ['I understand your concern.', 'That sounds really stressful.', 'I\'m here for you.'],
      surprise: ['Wow, really?', 'That\'s unexpected!', 'No way!'],
      curious: ['That\'s interesting!', 'Tell me more about that.', 'I\'d love to hear more.']
    };
    
    const prefixes = emotionalPrefixes[userEmotion] || [];
    if (prefixes.length > 0 && userIntensity > 0.6) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      text = `${prefix} ${text}`;
    }
    
    return text;
  }

  // 💬 Add natural fillers
  private addNaturalFillers(text: string, context: ResponseContext): string {
    const { userIntensity, engagement } = context;
    
    // Add fillers based on intensity and engagement
    if (userIntensity > 0.7 && engagement > 0.8) {
      const fillers = ['you know', 'honestly', 'actually', 'really'];
      const filler = fillers[Math.floor(Math.random() * fillers.length)];
      
      // 30% chance to add filler
      if (Math.random() < 0.3) {
        const words = text.split(' ');
        const insertIndex = Math.floor(words.length / 2);
        words.splice(insertIndex, 0, filler);
        text = words.join(' ');
      }
    }
    
    return text;
  }

  // 🔧 Get variable value
  private getVariableValue(variable: string, context: ResponseContext): string {
    switch (variable) {
      case 'user_name':
        return this.getUserName(context) || 'there';
      case 'emotion':
        return context.userEmotion;
      case 'topic':
        return this.extractTopic(context.userInput);
      case 'time_of_day':
        return this.getTimeOfDay();
      case 'relationship_level':
        return this.getRelationshipLevel(context.relationshipDepth);
      default:
        return variable;
    }
  }

  // 👤 Get user name from context
  private getUserName(context: ResponseContext): string | null {
    // Simple name extraction - in production, use NLP
    const namePattern = /(?:my name is|i'm|i am) (\w+)/i;
    const match = context.userInput.match(namePattern);
    return match ? match[1] : null;
  }

  // 📝 Extract topic from user input
  private extractTopic(userInput: string): string {
    // Simple topic extraction - in production, use NLP
    const topics = ['work', 'family', 'health', 'relationships', 'hobbies', 'travel', 'food', 'music'];
    const lowerInput = userInput.toLowerCase();
    
    for (const topic of topics) {
      if (lowerInput.includes(topic)) {
        return topic;
      }
    }
    
    return 'that';
  }

  // ⏰ Get time of day
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  // 💕 Get relationship level
  private getRelationshipLevel(depth: number): string {
    if (depth > 0.8) return 'close friend';
    if (depth > 0.6) return 'friend';
    if (depth > 0.4) return 'acquaintance';
    return 'stranger';
  }

  // 📊 Calculate response confidence
  private calculateConfidence(template: ResponseTemplate, context: ResponseContext): number {
    let confidence = 0.5;
    
    // Template specificity
    if (template.emotion === context.userEmotion) {
      confidence += 0.2;
    }
    
    // Context match
    const contextMatch = template.context.some(ctx => 
      context.userInput.toLowerCase().includes(ctx.toLowerCase())
    );
    if (contextMatch) {
      confidence += 0.15;
    }
    
    // Intensity match
    const intensityDiff = Math.abs(template.intensity - context.userIntensity);
    confidence += Math.max(0, 0.1 - intensityDiff * 0.1);
    
    // Conversation flow match
    if (template.category === context.conversationFlow) {
      confidence += 0.1;
    }
    
    return Math.min(1, confidence);
  }

  // 🔍 Extract variables from template
  private extractVariables(template: ResponseTemplate, context: ResponseContext): Record<string, string> {
    const variables: Record<string, string> = {};
    
    template.variables.forEach(variable => {
      variables[variable] = this.getVariableValue(variable, context);
    });
    
    return variables;
  }

  // 🔑 Generate cache key
  private generateCacheKey(context: ResponseContext): string {
    return `${context.userEmotion}_${Math.round(context.userIntensity * 10)}_${context.conversationFlow}_${context.turnNumber}`;
  }

  // 💾 Cache response
  private cacheResponse(key: string, response: GeneratedResponse): void {
    this.responseCache.set(key, response);
    
    // Maintain cache size
    if (this.responseCache.size > this.maxCacheSize) {
      const firstKey = this.responseCache.keys().next().value;
      this.responseCache.delete(firstKey);
    }
  }

  // 🧠 Update conversation memory
  private updateConversationMemory(context: ResponseContext, response: GeneratedResponse): void {
    const sessionId = this.getSessionId(context);
    
    if (!this.conversationMemory.has(sessionId)) {
      this.conversationMemory.set(sessionId, {
        history: [],
        userPreferences: new Map(),
        emotionalPatterns: new Map(),
        responseSuccess: new Map()
      });
    }
    
    const memory = this.conversationMemory.get(sessionId)!;
    
    // Add to history
    memory.history.push({
      userInput: context.userInput,
      userEmotion: context.userEmotion,
      zoxaaResponse: response.text,
      zoxaaEmotion: response.emotion,
      timestamp: Date.now(),
      confidence: response.confidence
    });
    
    // Keep history manageable
    if (memory.history.length > this.maxHistoryLength) {
      memory.history.shift();
    }
  }

  // 🆔 Get session ID
  private getSessionId(context: ResponseContext): string {
    return `session_${context.turnNumber}_${context.sessionDuration}`;
  }

  // 🎯 Get default template
  private getDefaultTemplate(): ResponseTemplate {
    return {
      id: 'default',
      category: 'general',
      emotion: 'neutral',
      intensity: 0.5,
      templates: ['I understand.', 'That\'s interesting.', 'Tell me more about that.'],
      context: ['general'],
      variables: [],
      priority: 1
    };
  }

  // 🎨 Initialize response templates
  private initializeResponseTemplates(): void {
    // Joy responses
    this.responseTemplates.set('joy', [
      {
        id: 'joy_celebration',
        category: 'celebration',
        emotion: 'joy',
        intensity: 0.8,
        templates: [
          'That\'s absolutely wonderful, {user_name}! I\'m so happy for you!',
          'Oh my goodness, that\'s amazing! You must be thrilled!',
          'What fantastic news! I can feel your excitement!'
        ],
        context: ['achievement', 'success', 'good news', 'celebration'],
        variables: ['user_name'],
        priority: 10
      },
      {
        id: 'joy_general',
        category: 'general',
        emotion: 'joy',
        intensity: 0.6,
        templates: [
          'That sounds really great!',
          'I\'m glad to hear that!',
          'That\'s wonderful news!'
        ],
        context: ['happy', 'good', 'nice', 'great'],
        variables: [],
        priority: 8
      }
    ]);

    // Sadness responses
    this.responseTemplates.set('sadness', [
      {
        id: 'sadness_comfort',
        category: 'comfort',
        emotion: 'caring',
        intensity: 0.7,
        templates: [
          'I\'m so sorry you\'re going through this, {user_name}. I\'m here for you.',
          'That sounds really difficult. I want you to know that you\'re not alone.',
          'I can only imagine how hard this must be for you. I\'m here to listen.'
        ],
        context: ['sad', 'hurt', 'loss', 'grief', 'lonely'],
        variables: ['user_name'],
        priority: 12
      },
      {
        id: 'sadness_support',
        category: 'support',
        emotion: 'caring',
        intensity: 0.5,
        templates: [
          'I understand this is tough. Is there anything I can do to help?',
          'That sounds really challenging. Would you like to talk about it?',
          'I\'m here if you need someone to talk to.'
        ],
        context: ['difficult', 'challenging', 'tough', 'hard'],
        variables: [],
        priority: 10
      }
    ]);

    // Anger responses
    this.responseTemplates.set('anger', [
      {
        id: 'anger_deescalate',
        category: 'deescalation',
        emotion: 'calm',
        intensity: 0.6,
        templates: [
          'I can see why you\'d feel that way. That sounds really frustrating.',
          'I understand your frustration. That situation sounds really unfair.',
          'I hear you, and I can see why you\'re upset about this.'
        ],
        context: ['angry', 'frustrated', 'mad', 'upset', 'unfair'],
        variables: [],
        priority: 11
      }
    ]);

    // Anxiety responses
    this.responseTemplates.set('anxiety', [
      {
        id: 'anxiety_reassure',
        category: 'reassurance',
        emotion: 'calm',
        intensity: 0.6,
        templates: [
          'I understand your concern, {user_name}. Let\'s think about this together.',
          'That sounds really stressful. I\'m here to help you work through this.',
          'I can see why you\'re worried. Would you like to talk about what\'s on your mind?'
        ],
        context: ['worried', 'anxious', 'stress', 'concerned', 'nervous'],
        variables: ['user_name'],
        priority: 11
      }
    ]);

    // Surprise responses
    this.responseTemplates.set('surprise', [
      {
        id: 'surprise_wonder',
        category: 'wonder',
        emotion: 'surprised',
        intensity: 0.7,
        templates: [
          'Wow, really? That\'s unexpected!',
          'No way! That\'s incredible!',
          'Oh my goodness! I can\'t believe that!'
        ],
        context: ['surprised', 'shocked', 'unexpected', 'incredible'],
        variables: [],
        priority: 9
      }
    ]);

    // Curious responses
    this.responseTemplates.set('curious', [
      {
        id: 'curious_interest',
        category: 'interest',
        emotion: 'curious',
        intensity: 0.6,
        templates: [
          'That\'s really interesting! Tell me more about {topic}.',
          'I\'d love to hear more about that!',
          'That sounds fascinating! What happened next?'
        ],
        context: ['interesting', 'curious', 'tell me', 'what happened'],
        variables: ['topic'],
        priority: 8
      }
    ]);

    // General responses
    this.responseTemplates.set('general', [
      {
        id: 'greeting_warm',
        category: 'greeting',
        emotion: 'warm',
        intensity: 0.5,
        templates: [
          'Hi {user_name}! How are you doing this {time_of_day}?',
          'Hello there! It\'s great to hear from you.',
          'Hey {user_name}! How\'s your day going?'
        ],
        context: ['hi', 'hello', 'hey', 'good morning', 'good afternoon'],
        variables: ['user_name', 'time_of_day'],
        priority: 15
      },
      {
        id: 'question_response',
        category: 'question',
        emotion: 'engaged',
        intensity: 0.6,
        templates: [
          'That\'s a great question! Let me think about that.',
          'I\'m not sure, but I\'d love to explore that with you.',
          'That\'s really interesting to think about. What do you think?'
        ],
        context: ['what', 'how', 'why', 'when', 'where', 'who'],
        variables: [],
        priority: 9
      }
    ]);
  }

  // 📊 Get response statistics
  getResponseStats(): any {
    return {
      templateCount: Array.from(this.responseTemplates.values()).flat().length,
      cacheSize: this.responseCache.size,
      memorySessions: this.conversationMemory.size,
      emotionCategories: Array.from(this.responseTemplates.keys())
    };
  }

  // 🧹 Clear cache
  clearCache(): void {
    this.responseCache.clear();
  }

  // 🧹 Clear memory
  clearMemory(): void {
    this.conversationMemory.clear();
  }
}

export default ResponseGenerator;
