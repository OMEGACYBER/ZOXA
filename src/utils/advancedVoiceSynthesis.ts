// 🎤 Advanced Voice Synthesis - ZOXAA Voice Intelligence
// Dynamic and nuanced voice modulation for truly alive voice companion

export interface VoiceModulation {
  speed: number;        // 0.5 to 2.0
  pitch: number;        // 0.5 to 2.0
  volume: number;       // 0.1 to 2.0
  emotion: string;      // Primary emotion
  warmth: number;       // 0 to 1
  engagement: number;   // 0 to 1
  empathy: number;      // 0 to 1
  playfulness: number;  // 0 to 1
  breathiness: number;  // 0 to 1
  clarity: number;      // 0 to 1
}

export interface SSMLConfig {
  useSSML: boolean;
  addPauses: boolean;
  addEmphasis: boolean;
  addBreathing: boolean;
  addEmotionalMarkers: boolean;
  customProsody: boolean;
}

export interface SynthesisRequest {
  text: string;
  modulation: VoiceModulation;
  ssmlConfig: SSMLConfig;
  context: {
    conversationFlow: string;
    turnNumber: number;
    userEmotion: string;
    relationshipDepth: number;
  };
}

export class AdvancedVoiceSynthesis {
  private voiceCache: Map<string, any> = new Map();
  private emotionToProsody: Map<string, any> = new Map();
  private naturalPausePatterns: RegExp[] = [];
  private emphasisWords: Set<string> = new Set();
  
  constructor() {
    this.initializeEmotionMappings();
    this.initializePausePatterns();
    this.initializeEmphasisWords();
  }

  // 🎤 Synthesize voice with advanced modulation
  async synthesizeVoice(request: SynthesisRequest): Promise<any> {
    const { text, modulation, ssmlConfig, context } = request;
    
    // Apply emotional modulation
    const enhancedModulation = this.applyEmotionalModulation(modulation, context);
    
    // Generate SSML if enabled
    const processedText = ssmlConfig.useSSML ? 
      this.generateEmotionalSSML(text, enhancedModulation, ssmlConfig) : 
      text;
    
    // Apply natural speech patterns
    const finalModulation = this.applyNaturalPatterns(enhancedModulation, context);
    
    return {
      text: processedText,
      voice: 'nova',
      speed: finalModulation.speed,
      pitch: finalModulation.pitch,
      volume: finalModulation.volume,
      emotion: finalModulation.emotion,
      ssml: ssmlConfig.useSSML,
      emotionalModulation: true,
      metadata: {
        warmth: finalModulation.warmth,
        engagement: finalModulation.engagement,
        empathy: finalModulation.empathy,
        playfulness: finalModulation.playfulness,
        breathiness: finalModulation.breathiness,
        clarity: finalModulation.clarity
      }
    };
  }

  // 🎭 Apply emotional modulation based on context
  private applyEmotionalModulation(modulation: VoiceModulation, context: any): VoiceModulation {
    const { conversationFlow, turnNumber, userEmotion, relationshipDepth } = context;
    
    // Base emotional mapping
    const emotionMapping = this.emotionToProsody.get(modulation.emotion) || {};
    const enhancedModulation = { ...modulation };
    
    // Apply emotion-specific adjustments
    Object.entries(emotionMapping).forEach(([key, value]) => {
      if (enhancedModulation.hasOwnProperty(key)) {
        enhancedModulation[key as keyof VoiceModulation] = value as number;
      }
    });
    
    // Apply conversation flow adjustments
    switch (conversationFlow) {
      case 'greeting':
        enhancedModulation.warmth = Math.min(1, enhancedModulation.warmth + 0.2);
        enhancedModulation.engagement = Math.min(1, enhancedModulation.engagement + 0.1);
        break;
      case 'listening':
        enhancedModulation.volume = Math.max(0.3, enhancedModulation.volume - 0.1);
        enhancedModulation.breathiness = Math.min(1, enhancedModulation.breathiness + 0.1);
        break;
      case 'responding':
        enhancedModulation.clarity = Math.min(1, enhancedModulation.clarity + 0.1);
        enhancedModulation.engagement = Math.min(1, enhancedModulation.engagement + 0.15);
        break;
      case 'transitioning':
        enhancedModulation.speed = Math.max(0.7, enhancedModulation.speed - 0.1);
        enhancedModulation.volume = Math.max(0.5, enhancedModulation.volume - 0.05);
        break;
    }
    
    // Apply relationship depth adjustments
    if (relationshipDepth > 0.7) {
      enhancedModulation.warmth = Math.min(1, enhancedModulation.warmth + 0.15);
      enhancedModulation.empathy = Math.min(1, enhancedModulation.empathy + 0.1);
    }
    
    // Apply turn number adjustments (fatigue simulation)
    if (turnNumber > 20) {
      enhancedModulation.speed = Math.max(0.8, enhancedModulation.speed - 0.05);
      enhancedModulation.volume = Math.max(0.7, enhancedModulation.volume - 0.03);
    }
    
    return enhancedModulation;
  }

  // 🎵 Generate emotional SSML
  private generateEmotionalSSML(text: string, modulation: VoiceModulation, config: SSMLConfig): string {
    let ssml = '<speak>';
    
    // Add breathing if enabled
    if (config.addBreathing && modulation.breathiness > 0.3) {
      ssml += '<break time="200ms"/>';
    }
    
    // Process text with emotional markers
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    sentences.forEach((sentence, index) => {
      let processedSentence = sentence.trim();
      
      // Add emphasis to important words
      if (config.addEmphasis) {
        processedSentence = this.addEmphasis(processedSentence, modulation);
      }
      
      // Add emotional prosody
      if (config.customProsody) {
        processedSentence = this.addEmotionalProsody(processedSentence, modulation);
      }
      
      ssml += processedSentence;
      
      // Add natural pauses
      if (config.addPauses && index < sentences.length - 1) {
        const pauseDuration = this.calculatePauseDuration(modulation, index);
        ssml += `<break time="${pauseDuration}ms"/>`;
      }
    });
    
    // Add final breathing if needed
    if (config.addBreathing && modulation.breathiness > 0.5) {
      ssml += '<break time="300ms"/>';
    }
    
    ssml += '</speak>';
    return ssml;
  }

  // ⚡ Apply natural speech patterns
  private applyNaturalPatterns(modulation: VoiceModulation, context: any): VoiceModulation {
    const { turnNumber, userEmotion } = context;
    
    // Add subtle variations to avoid robotic speech
    const variation = 0.05;
    const randomVariation = () => (Math.random() - 0.5) * variation;
    
    return {
      ...modulation,
      speed: Math.max(0.5, Math.min(2.0, modulation.speed + randomVariation())),
      pitch: Math.max(0.5, Math.min(2.0, modulation.pitch + randomVariation())),
      volume: Math.max(0.1, Math.min(2.0, modulation.volume + randomVariation() * 0.5))
    };
  }

  // 🎯 Add emphasis to important words
  private addEmphasis(sentence: string, modulation: VoiceModulation): string {
    const words = sentence.split(' ');
    const emphasizedWords = words.map(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (this.emphasisWords.has(cleanWord) || modulation.engagement > 0.7) {
        return `<emphasis level="moderate">${word}</emphasis>`;
      }
      return word;
    });
    
    return emphasizedWords.join(' ');
  }

  // 🎭 Add emotional prosody
  private addEmotionalProsody(sentence: string, modulation: VoiceModulation): string {
    const prosodyAttributes = [];
    
    // Rate (speed)
    if (modulation.speed !== 1.0) {
      const rate = modulation.speed > 1.0 ? 'fast' : 'slow';
      prosodyAttributes.push(`rate="${rate}"`);
    }
    
    // Pitch
    if (modulation.pitch !== 1.0) {
      const pitch = modulation.pitch > 1.0 ? 'high' : 'low';
      prosodyAttributes.push(`pitch="${pitch}"`);
    }
    
    // Volume
    if (modulation.volume !== 1.0) {
      const volume = modulation.volume > 1.0 ? 'loud' : 'soft';
      prosodyAttributes.push(`volume="${volume}"`);
    }
    
    if (prosodyAttributes.length > 0) {
      return `<prosody ${prosodyAttributes.join(' ')}>${sentence}</prosody>`;
    }
    
    return sentence;
  }

  // ⏱️ Calculate pause duration
  private calculatePauseDuration(modulation: VoiceModulation, sentenceIndex: number): number {
    let basePause = 300; // Base pause in milliseconds
    
    // Adjust based on emotion
    if (modulation.emotion === 'sadness') basePause += 200;
    if (modulation.emotion === 'joy') basePause -= 100;
    if (modulation.emotion === 'anxiety') basePause -= 150;
    
    // Adjust based on engagement
    if (modulation.engagement > 0.8) basePause -= 100;
    if (modulation.engagement < 0.3) basePause += 200;
    
    // Adjust based on sentence position
    if (sentenceIndex === 0) basePause += 100; // Longer pause after first sentence
    
    return Math.max(100, Math.min(800, basePause));
  }

  // 🎨 Initialize emotion to prosody mappings
  private initializeEmotionMappings(): void {
    this.emotionToProsody.set('joy', {
      speed: 1.1,
      pitch: 1.15,
      volume: 1.05,
      warmth: 0.9,
      engagement: 0.8,
      empathy: 0.7,
      playfulness: 0.8,
      breathiness: 0.2,
      clarity: 0.9
    });
    
    this.emotionToProsody.set('sadness', {
      speed: 0.9,
      pitch: 0.9,
      volume: 0.9,
      warmth: 0.9,
      engagement: 0.6,
      empathy: 0.9,
      playfulness: 0.2,
      breathiness: 0.4,
      clarity: 0.8
    });
    
    this.emotionToProsody.set('anger', {
      speed: 1.05,
      pitch: 0.95,
      volume: 1.1,
      warmth: 0.4,
      engagement: 0.9,
      empathy: 0.8,
      playfulness: 0.1,
      breathiness: 0.1,
      clarity: 0.95
    });
    
    this.emotionToProsody.set('anxiety', {
      speed: 1.05,
      pitch: 1.05,
      volume: 0.9,
      warmth: 0.7,
      engagement: 0.8,
      empathy: 0.9,
      playfulness: 0.2,
      breathiness: 0.3,
      clarity: 0.85
    });
    
    this.emotionToProsody.set('surprise', {
      speed: 1.15,
      pitch: 1.2,
      volume: 1.1,
      warmth: 0.7,
      engagement: 0.9,
      empathy: 0.6,
      playfulness: 0.7,
      breathiness: 0.2,
      clarity: 0.9
    });
    
    this.emotionToProsody.set('curious', {
      speed: 1.0,
      pitch: 1.05,
      volume: 1.0,
      warmth: 0.7,
      engagement: 0.9,
      empathy: 0.7,
      playfulness: 0.5,
      breathiness: 0.2,
      clarity: 0.9
    });
  }

  // ⏸️ Initialize natural pause patterns
  private initializePausePatterns(): void {
    this.naturalPausePatterns = [
      /,\s*/g,           // Commas
      /;\s*/g,           // Semicolons
      /\s+and\s+/gi,     // "and" conjunctions
      /\s+but\s+/gi,     // "but" conjunctions
      /\s+however\s+/gi, // "however" transitions
      /\s+therefore\s+/gi // "therefore" transitions
    ];
  }

  // 🎯 Initialize emphasis words
  private initializeEmphasisWords(): void {
    const emphasisWords = [
      'really', 'very', 'absolutely', 'definitely', 'certainly',
      'amazing', 'incredible', 'wonderful', 'terrible', 'awful',
      'love', 'hate', 'adore', 'despise', 'miss', 'need', 'want',
      'always', 'never', 'forever', 'sometimes', 'usually',
      'important', 'crucial', 'essential', 'vital', 'critical'
    ];
    
    emphasisWords.forEach(word => this.emphasisWords.add(word));
  }

  // 📊 Get synthesis statistics
  getSynthesisStats(): any {
    return {
      cacheSize: this.voiceCache.size,
      emotionMappings: this.emotionToProsody.size,
      emphasisWords: this.emphasisWords.size,
      pausePatterns: this.naturalPausePatterns.length
    };
  }

  // 🧹 Clear voice cache
  clearCache(): void {
    this.voiceCache.clear();
  }
}

export default AdvancedVoiceSynthesis;
