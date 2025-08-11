// Advanced Emotional Analysis System
export interface EmotionalState {
  pleasure: number;    // -1 to 1 (negative to positive)
  arousal: number;     // 0 to 1 (calm to excited)
  dominance: number;   // 0 to 1 (submissive to dominant)
  confidence: number;  // 0 to 1 (uncertain to confident)
  stress: number;      // 0 to 1 (relaxed to stressed)
}

export interface EmotionalContext {
  primaryEmotion: string;
  intensity: number;
  triggers: string[];
  suggestedResponse: string;
  crisisLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export class EmotionalAnalyzer {
  private static emotionKeywords = {
    positive: [
      'happy', 'joy', 'excited', 'thrilled', 'amazing', 'wonderful', 'fantastic',
      'great', 'good', 'love', 'hope', 'blessed', 'grateful', 'proud', 'success',
      'achievement', 'win', 'victory', 'accomplish', 'succeed', 'progress'
    ],
    negative: [
      'sad', 'depressed', 'angry', 'frustrated', 'hopeless', 'worthless', 'terrible',
      'awful', 'miserable', 'hate', 'despair', 'lonely', 'empty', 'numb', 'tired',
      'exhausted', 'overwhelmed', 'stressed', 'anxious', 'scared', 'terrified'
    ],
    highArousal: [
      'excited', 'thrilled', 'angry', 'furious', 'anxious', 'panic', 'scared',
      'terrified', 'nervous', 'stressed', 'energetic', 'hyper', 'agitated'
    ],
    lowArousal: [
      'tired', 'exhausted', 'numb', 'empty', 'depressed', 'calm', 'peaceful',
      'relaxed', 'serene', 'quiet', 'lethargic', 'drained'
    ],
    crisis: [
      'suicide', 'kill', 'die', 'end', 'give up', 'hopeless', 'worthless',
      'no point', 'better off', 'everyone would be better', 'self-harm',
      'cut', 'hurt myself', 'overdose', 'overdosing'
    ]
  };

  static analyzeEmotionalState(speech: string): EmotionalState {
    const text = speech.toLowerCase();
    let pleasure = 0.5;
    let arousal = 0.5;
    let dominance = 0.5;
    let confidence = 0.5;
    let stress = 0.5;

    // Pleasure analysis
    this.emotionKeywords.positive.forEach(word => {
      if (text.includes(word)) pleasure += 0.15;
    });
    
    this.emotionKeywords.negative.forEach(word => {
      if (text.includes(word)) pleasure -= 0.2;
    });

    // Arousal analysis
    this.emotionKeywords.highArousal.forEach(word => {
      if (text.includes(word)) arousal += 0.2;
    });
    
    this.emotionKeywords.lowArousal.forEach(word => {
      if (text.includes(word)) arousal -= 0.2;
    });

    // Confidence analysis
    const confidentWords = ['know', 'sure', 'certain', 'definitely', 'absolutely', 'confident'];
    const uncertainWords = ['maybe', 'perhaps', 'unsure', 'doubt', 'confused', 'uncertain'];
    
    confidentWords.forEach(word => {
      if (text.includes(word)) confidence += 0.1;
    });
    
    uncertainWords.forEach(word => {
      if (text.includes(word)) confidence -= 0.1;
    });

    // Stress analysis
    const stressWords = ['stressed', 'overwhelmed', 'anxious', 'worried', 'panic', 'pressure'];
    const calmWords = ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil'];
    
    stressWords.forEach(word => {
      if (text.includes(word)) stress += 0.2;
    });
    
    calmWords.forEach(word => {
      if (text.includes(word)) stress -= 0.15;
    });

    // Dominance analysis based on language patterns
    const dominantPatterns = ['I will', 'I can', 'I am', 'I have', 'I know'];
    const submissivePatterns = ['I think', 'maybe', 'perhaps', 'I guess', 'I suppose'];
    
    dominantPatterns.forEach(pattern => {
      if (text.includes(pattern)) dominance += 0.1;
    });
    
    submissivePatterns.forEach(pattern => {
      if (text.includes(pattern)) dominance -= 0.1;
    });

    // Clamp values
    pleasure = Math.max(-1, Math.min(1, pleasure));
    arousal = Math.max(0, Math.min(1, arousal));
    dominance = Math.max(0, Math.min(1, dominance));
    confidence = Math.max(0, Math.min(1, confidence));
    stress = Math.max(0, Math.min(1, stress));

    return { pleasure, arousal, dominance, confidence, stress };
  }

  static getEmotionalContext(emotionalState: EmotionalState): EmotionalContext {
    const { pleasure, arousal, stress } = emotionalState;
    
    let primaryEmotion = 'neutral';
    let intensity = 0.5;
    const triggers: string[] = [];
    let suggestedResponse = 'I hear you. How are you feeling?';
    let crisisLevel: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';

    // Determine primary emotion
    if (pleasure > 0.6 && arousal > 0.6) {
      primaryEmotion = 'excited';
      intensity = Math.max(pleasure, arousal);
      suggestedResponse = "I'm so excited for you! Tell me more about what's making you feel this way.";
    } else if (pleasure > 0.6 && arousal < 0.4) {
      primaryEmotion = 'content';
      intensity = pleasure;
      suggestedResponse = "I'm glad you're feeling content. What's bringing you this sense of peace?";
    } else if (pleasure < 0.4 && arousal > 0.6) {
      primaryEmotion = 'distressed';
      intensity = arousal;
      suggestedResponse = "I can hear that you're really struggling right now. I'm here for you. What's going on?";
    } else if (pleasure < 0.4 && arousal < 0.4) {
      primaryEmotion = 'depressed';
      intensity = 1 - pleasure;
      suggestedResponse = "I can sense you're feeling down. You're not alone in this. What's on your mind?";
    } else if (stress > 0.7) {
      primaryEmotion = 'overwhelmed';
      intensity = stress;
      suggestedResponse = "It sounds like you're feeling really overwhelmed. Let's take this one step at a time. What's the most pressing thing right now?";
    }

    // Crisis detection
    if (pleasure < 0.2 && stress > 0.8) {
      crisisLevel = 'critical';
      suggestedResponse = "I'm really concerned about how you're feeling. You're not alone, and there are people who want to help. Can you tell me more about what's going on?";
    } else if (pleasure < 0.3 && arousal > 0.7) {
      crisisLevel = 'high';
      suggestedResponse = "I can hear you're in a lot of pain right now. I'm here to listen and support you. What do you need most right now?";
    } else if (pleasure < 0.4) {
      crisisLevel = 'medium';
    } else if (pleasure < 0.5) {
      crisisLevel = 'low';
    }

    return {
      primaryEmotion,
      intensity,
      triggers,
      suggestedResponse,
      crisisLevel
    };
  }

  static getVoiceModulation(emotionalState: EmotionalState) {
    const { pleasure, arousal, stress } = emotionalState;
    
    let rate = 0.85;
    let pitch = 1.1;
    let volume = 1.0;

    // Emotional modulation
    if (pleasure < 0.3) {
      // Sad user = softer, slower voice
      rate = 0.75;
      pitch = 0.95;
      volume = 0.9;
    } else if (arousal > 0.7) {
      // Excited user = more energetic voice
      rate = 0.95;
      pitch = 1.2;
      volume = 1.1;
    } else if (stress > 0.7) {
      // Stressed user = calming voice
      rate = 0.7;
      pitch = 0.9;
      volume = 0.85;
    } else if (pleasure > 0.6) {
      // Happy user = warm, slightly faster voice
      rate = 0.9;
      pitch = 1.15;
      volume = 1.05;
    }

    return { rate, pitch, volume };
  }

  static getResponseStyle(emotionalContext: EmotionalContext) {
    const { primaryEmotion, crisisLevel } = emotionalContext;
    
    switch (primaryEmotion) {
      case 'excited':
        return {
          tone: 'enthusiastic',
          length: 'short',
          style: 'celebratory'
        };
      case 'content':
        return {
          tone: 'warm',
          length: 'medium',
          style: 'supportive'
        };
      case 'distressed':
        return {
          tone: 'calming',
          length: 'short',
          style: 'reassuring'
        };
      case 'depressed':
        return {
          tone: 'gentle',
          length: 'medium',
          style: 'supportive'
        };
      case 'overwhelmed':
        return {
          tone: 'calm',
          length: 'short',
          style: 'grounding'
        };
      default:
        return {
          tone: 'neutral',
          length: 'medium',
          style: 'conversational'
        };
    }
  }
}
