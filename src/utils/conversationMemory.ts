// Conversation Memory System for Personalized Interactions
export interface ConversationMemory {
  userId: string;
  emotionalPatterns: EmotionalPattern[];
  importantTopics: ImportantTopic[];
  relationshipContext: RelationshipContext;
  lastInteraction: Date;
  totalInteractions: number;
  trustLevel: number; // 0-1
  comfortLevel: number; // 0-1
}

export interface EmotionalPattern {
  emotion: string;
  frequency: number;
  triggers: string[];
  lastOccurrence: Date;
  intensity: number;
}

export interface ImportantTopic {
  topic: string;
  importance: number; // 0-1
  lastMentioned: Date;
  emotionalImpact: number; // -1 to 1
  userResponse: string;
}

export interface RelationshipContext {
  relationshipStage: 'new' | 'building' | 'established' | 'close';
  sharedExperiences: string[];
  insideJokes: string[];
  comfortTopics: string[];
  sensitiveTopics: string[];
  communicationStyle: 'formal' | 'casual' | 'playful' | 'supportive';
}

export class ConversationMemoryManager {
  private static instance: ConversationMemoryManager;
  private memories: Map<string, ConversationMemory> = new Map();

  static getInstance(): ConversationMemoryManager {
    if (!ConversationMemoryManager.instance) {
      ConversationMemoryManager.instance = new ConversationMemoryManager();
    }
    return ConversationMemoryManager.instance;
  }

  // Initialize or get memory for a user
  getMemory(userId: string): ConversationMemory {
    if (!this.memories.has(userId)) {
      this.memories.set(userId, {
        userId,
        emotionalPatterns: [],
        importantTopics: [],
        relationshipContext: {
          relationshipStage: 'new',
          sharedExperiences: [],
          insideJokes: [],
          comfortTopics: [],
          sensitiveTopics: [],
          communicationStyle: 'supportive'
        },
        lastInteraction: new Date(),
        totalInteractions: 0,
        trustLevel: 0.3,
        comfortLevel: 0.3
      });
    }
    return this.memories.get(userId)!;
  }

  // Update memory with new interaction
  updateMemory(userId: string, interaction: {
    emotion: string;
    topics: string[];
    message: string;
    emotionalIntensity: number;
    userResponse?: string;
  }): void {
    const memory = this.getMemory(userId);
    
    // Update interaction count and last interaction
    memory.totalInteractions++;
    memory.lastInteraction = new Date();
    
    // Update emotional patterns
    this.updateEmotionalPatterns(memory, interaction.emotion, interaction.emotionalIntensity);
    
    // Update important topics
    this.updateImportantTopics(memory, interaction.topics, interaction.message, interaction.userResponse);
    
    // Update relationship context
    this.updateRelationshipContext(memory, interaction);
    
    // Update trust and comfort levels
    this.updateTrustAndComfort(memory, interaction);
    
    this.memories.set(userId, memory);
  }

  private updateEmotionalPatterns(memory: ConversationMemory, emotion: string, intensity: number): void {
    const existingPattern = memory.emotionalPatterns.find(p => p.emotion === emotion);
    
    if (existingPattern) {
      existingPattern.frequency++;
      existingPattern.lastOccurrence = new Date();
      existingPattern.intensity = (existingPattern.intensity + intensity) / 2;
    } else {
      memory.emotionalPatterns.push({
        emotion,
        frequency: 1,
        triggers: [],
        lastOccurrence: new Date(),
        intensity
      });
    }
  }

  private updateImportantTopics(memory: ConversationMemory, topics: string[], message: string, userResponse?: string): void {
    topics.forEach(topic => {
      const existingTopic = memory.importantTopics.find(t => t.topic.toLowerCase() === topic.toLowerCase());
      
      if (existingTopic) {
        existingTopic.lastMentioned = new Date();
        if (userResponse) {
          existingTopic.userResponse = userResponse;
        }
      } else {
        memory.importantTopics.push({
          topic,
          importance: 0.5,
          lastMentioned: new Date(),
          emotionalImpact: 0,
          userResponse: userResponse || ''
        });
      }
    });
  }

  private updateRelationshipContext(memory: ConversationMemory, interaction: any): void {
    const { totalInteractions, relationshipContext } = memory;
    
    // Update relationship stage based on interactions
    if (totalInteractions > 50) {
      relationshipContext.relationshipStage = 'close';
    } else if (totalInteractions > 20) {
      relationshipContext.relationshipStage = 'established';
    } else if (totalInteractions > 5) {
      relationshipContext.relationshipStage = 'building';
    }
    
    // Update communication style based on emotional patterns
    const positiveEmotions = memory.emotionalPatterns.filter(p => 
      ['happy', 'excited', 'content'].includes(p.emotion)
    );
    const negativeEmotions = memory.emotionalPatterns.filter(p => 
      ['sad', 'depressed', 'anxious'].includes(p.emotion)
    );
    
    if (positiveEmotions.length > negativeEmotions.length * 2) {
      relationshipContext.communicationStyle = 'playful';
    } else if (negativeEmotions.length > positiveEmotions.length) {
      relationshipContext.communicationStyle = 'supportive';
    } else {
      relationshipContext.communicationStyle = 'casual';
    }
  }

  private updateTrustAndComfort(memory: ConversationMemory, interaction: any): void {
    const { trustLevel, comfortLevel } = memory;
    
    // Increase trust with positive interactions
    if (interaction.emotionalIntensity > 0.6) {
      memory.trustLevel = Math.min(1, trustLevel + 0.05);
    }
    
    // Increase comfort with consistent interactions
    if (memory.totalInteractions > 10) {
      memory.comfortLevel = Math.min(1, comfortLevel + 0.02);
    }
  }

  // Get personalized response context
  getPersonalizedContext(userId: string, currentEmotion: string): {
    relationshipStage: string;
    communicationStyle: string;
    trustLevel: number;
    comfortLevel: number;
    emotionalHistory: string[];
    importantTopics: string[];
    suggestedApproach: string;
  } {
    const memory = this.getMemory(userId);
    
    const emotionalHistory = memory.emotionalPatterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3)
      .map(p => p.emotion);
    
    const importantTopics = memory.importantTopics
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5)
      .map(t => t.topic);
    
    let suggestedApproach = 'supportive';
    if (memory.relationshipContext.communicationStyle === 'playful' && currentEmotion === 'excited') {
      suggestedApproach = 'celebratory';
    } else if (currentEmotion === 'distressed' || currentEmotion === 'depressed') {
      suggestedApproach = 'gentle';
    } else if (memory.trustLevel > 0.7) {
      suggestedApproach = 'direct';
    }
    
    return {
      relationshipStage: memory.relationshipContext.relationshipStage,
      communicationStyle: memory.relationshipContext.communicationStyle,
      trustLevel: memory.trustLevel,
      comfortLevel: memory.comfortLevel,
      emotionalHistory,
      importantTopics,
      suggestedApproach
    };
  }

  // Get conversation suggestions based on memory
  getConversationSuggestions(userId: string): string[] {
    const memory = this.getMemory(userId);
    const suggestions: string[] = [];
    
    // Suggest topics based on important topics
    memory.importantTopics
      .filter(t => t.importance > 0.7)
      .forEach(topic => {
        suggestions.push(`How is ${topic} going for you lately?`);
      });
    
    // Suggest based on emotional patterns
    const frequentEmotion = memory.emotionalPatterns
      .sort((a, b) => b.frequency - a.frequency)[0];
    
    if (frequentEmotion && frequentEmotion.emotion === 'anxious') {
      suggestions.push("I've noticed you've been feeling anxious lately. How are you managing that?");
    } else if (frequentEmotion && frequentEmotion.emotion === 'excited') {
      suggestions.push("You seem to be in a really good place lately! What's been going well?");
    }
    
    // Suggest based on relationship stage
    if (memory.relationshipContext.relationshipStage === 'new') {
      suggestions.push("I'd love to get to know you better. What's something important to you?");
    } else if (memory.relationshipContext.relationshipStage === 'close') {
      suggestions.push("How are you really doing today? I'm here to listen.");
    }
    
    return suggestions;
  }

  // Export memory for persistence
  exportMemory(userId: string): string {
    const memory = this.getMemory(userId);
    return JSON.stringify(memory);
  }

  // Import memory from persistence
  importMemory(userId: string, memoryData: string): void {
    try {
      const memory = JSON.parse(memoryData);
      this.memories.set(userId, memory);
    } catch (error) {
      console.error('Error importing memory:', error);
    }
  }
}
