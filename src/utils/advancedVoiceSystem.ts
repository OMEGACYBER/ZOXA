// Advanced Voice System - EVI3 Level Implementation
// Real-time emotional adaptation and natural conversational flow

import EVI3VoiceAnalyzer, { AdvancedEmotionalState, VoiceQualityMetrics } from './advancedVoiceAnalysis';

export interface EVI3VoiceSettings {
  voice: 'nova' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'shimmer';
  speed: number;
  pitch: number;
  volume: number;
  emotion: string;
  ssml: boolean;
  naturalPauses: boolean;
  emotionalModulation: boolean;
}

export interface ConversationalFlow {
  isInterruptible: boolean;
  interruptionThreshold: number;
  naturalPauses: boolean;
  emotionalAdaptation: boolean;
  responseUrgency: 'low' | 'medium' | 'high' | 'critical';
  conversationDepth: 'casual' | 'personal' | 'deep' | 'therapeutic';
}

export class EVI3VoiceSystem {
  private analyzer: EVI3VoiceAnalyzer;
  private emotionalHistory: AdvancedEmotionalState[] = [];
  private voiceQualityHistory: VoiceQualityMetrics[] = [];
  private conversationContext: Map<string, any> = new Map();
  private personalityEvolution: Map<string, number> = new Map();
  private interruptionCount: number = 0;
  private responseLatency: number[] = [];
  private isSpeaking: boolean = false;
  private currentEmotionalState: AdvancedEmotionalState;

  constructor() {
    this.analyzer = new EVI3VoiceAnalyzer();
    this.currentEmotionalState = {
      pleasure: 0.5,
      arousal: 0.5,
      dominance: 0.5,
      confidence: 0.5,
      stress: 0.5,
      empathy: 0.5,
      engagement: 0.5,
      trust: 0.5,
      primaryEmotion: 'neutral',
      secondaryEmotion: 'neutral',
      emotionalIntensity: 0.5,
      emotionalStability: 0.5,
      conversationalFlow: 0.5,
      crisisLevel: 'none'
    };
    
    console.log('🎤 EVI3 Voice System initialized');
  }

  // Real-time emotional analysis and voice adaptation
  analyzeAndAdapt(text: string, audioData?: Float32Array): {
    emotionalState: AdvancedEmotionalState;
    voiceSettings: EVI3VoiceSettings;
    conversationalFlow: ConversationalFlow;
    responseStyle: any;
  } {
    // Analyze emotional state
    const emotionalState = this.analyzer.analyzeEmotionalState(text, audioData);
    this.currentEmotionalState = emotionalState;
    
    // Update emotional history
    this.emotionalHistory.push(emotionalState);
    if (this.emotionalHistory.length > 20) {
      this.emotionalHistory.shift();
    }

    // Get optimal voice settings
    const voiceSettings = this.getAdaptiveVoiceSettings(emotionalState);
    
    // Determine conversational flow
    const conversationalFlow = this.getConversationalFlow(emotionalState);
    
    // Get response style
    const responseStyle = this.analyzer.getResponseStyle(emotionalState);

    return {
      emotionalState,
      voiceSettings,
      conversationalFlow,
      responseStyle
    };
  }

  // Adaptive voice settings based on emotional context
  private getAdaptiveVoiceSettings(emotionalState: AdvancedEmotionalState): EVI3VoiceSettings {
    // Always use Nova for the best human-like experience
    const voice = 'nova';
    
    let speed = 1.0;
    let pitch = 1.0;
    let volume = 1.0;
    let emotion = 'neutral';

    const { crisisLevel, emotionalIntensity, stress, pleasure, primaryEmotion } = emotionalState;

    // Crisis response - immediate and caring
    if (crisisLevel === 'critical') {
      speed = 0.75;
      pitch = 0.9;
      volume = 0.85;
      emotion = 'comforting';
    }
    // High stress - calm and reassuring
    else if (stress > 0.7) {
      speed = 0.85;
      pitch = 0.92;
      volume = 0.9;
      emotion = 'calm';
    }
    // Sadness - gentle and warm
    else if (pleasure < -0.3) {
      speed = 0.9;
      pitch = 0.95;
      volume = 0.9;
      emotion = 'comforting';
    }
    // High intensity emotions
    else if (emotionalIntensity > 0.7) {
      if (pleasure > 0.5) {
        // Joy - slightly excited but controlled
        speed = 1.1;
        pitch = 1.1;
        volume = 1.05;
        emotion = 'excited';
      } else {
        // Other high intensity - calm and steady
        speed = 0.95;
        pitch = 0.95;
        volume = 0.95;
        emotion = 'calm';
      }
    }
    // Specific emotion adaptations
    else {
      switch (primaryEmotion) {
        case 'joy':
          speed = 1.05;
          pitch = 1.1;
          volume = 1.05;
          emotion = 'happy';
          break;
        case 'anxiety':
          speed = 0.9;
          pitch = 0.95;
          volume = 0.9;
          emotion = 'calm';
          break;
        case 'anger':
          speed = 0.95;
          pitch = 0.95;
          volume = 0.95;
          emotion = 'calm';
          break;
        default:
          speed = 1.0;
          pitch = 1.0;
          volume = 1.0;
          emotion = 'warm';
      }
    }

    return {
      voice,
      speed: Math.max(0.5, Math.min(2.0, speed)),
      pitch: Math.max(0.5, Math.min(2.0, pitch)),
      volume: Math.max(0.5, Math.min(2.0, volume)),
      emotion,
      ssml: true,
      naturalPauses: true,
      emotionalModulation: true
    };
  }

  // Determine conversational flow based on emotional state
  private getConversationalFlow(emotionalState: AdvancedEmotionalState): ConversationalFlow {
    const { crisisLevel, emotionalIntensity, stress, engagement } = emotionalState;

    const flow: ConversationalFlow = {
      isInterruptible: true,
      interruptionThreshold: 0.3,
      naturalPauses: true,
      emotionalAdaptation: true,
      responseUrgency: 'medium',
      conversationDepth: 'personal'
    };

    // Crisis - immediate response, not interruptible
    if (crisisLevel === 'critical') {
      flow.isInterruptible = false;
      flow.interruptionThreshold = 0.1;
      flow.responseUrgency = 'critical';
      flow.conversationDepth = 'therapeutic';
      flow.naturalPauses = false; // Immediate response
    }
    // High stress - quick response, low interruption threshold
    else if (stress > 0.7) {
      flow.interruptionThreshold = 0.2;
      flow.responseUrgency = 'high';
      flow.conversationDepth = 'therapeutic';
    }
    // Low engagement - attention-grabbing
    else if (engagement < 0.3) {
      flow.interruptionThreshold = 0.4;
      flow.responseUrgency = 'high';
      flow.conversationDepth = 'casual';
    }
    // High emotional intensity - match energy
    else if (emotionalIntensity > 0.7) {
      flow.interruptionThreshold = 0.25;
      flow.responseUrgency = 'high';
      flow.conversationDepth = 'deep';
    }
    // Normal conversation
    else {
      flow.interruptionThreshold = 0.3;
      flow.responseUrgency = 'medium';
      flow.conversationDepth = 'personal';
    }

    return flow;
  }

  // Process text for natural speech with emotional expressions
  processTextForSpeech(text: string, emotionalState: AdvancedEmotionalState): string {
    let processedText = text;

    // Add natural pauses based on emotional state
    if (emotionalState.stress > 0.6) {
      // Add calming pauses for stressed users
      processedText = processedText.replace(/([.!?])\s+/g, '$1... ');
      processedText = processedText.replace(/\b(and|but|or|so)\b/gi, '... $1 ...');
    } else if (emotionalState.pleasure > 0.6) {
      // Add energetic pauses for happy users
      processedText = processedText.replace(/([.!?])\s+/g, '$1! ');
    } else {
      // Natural pauses for normal conversation
      processedText = processedText.replace(/([.!?])\s+/g, '$1... ');
    }

    // Add emotional expressions based on detected emotion
    const expressions = this.getEmotionalExpressions(emotionalState);
    if (expressions.length > 0 && Math.random() < 0.3) {
      const expression = expressions[Math.floor(Math.random() * expressions.length)];
      processedText = `${expression} ${processedText}`;
    }

    // Add natural fillers occasionally
    if (Math.random() < 0.2) {
      const fillers = ['well', 'you know', 'I mean', 'honestly', 'actually'];
      const filler = fillers[Math.floor(Math.random() * fillers.length)];
      processedText = `${filler}, ${processedText}`;
    }

    return processedText;
  }

  // Get emotional expressions based on emotional state
  private getEmotionalExpressions(emotionalState: AdvancedEmotionalState): string[] {
    const { primaryEmotion, emotionalIntensity } = emotionalState;

    const expressions: { [key: string]: string[] } = {
      joy: ['*smiles warmly*', '*laughs gently*', '*voice lights up*'],
      sadness: ['*sighs softly*', '*voice softens*', '*gentle*'],
      anxiety: ['*calmly*', '*reassuring*', '*softly*'],
      anger: ['*patiently*', '*calmly*', '*understanding*'],
      crisis: ['*urgently*', '*caring*', '*immediately*'],
      neutral: ['*warmly*', '*kindly*', '*gently*']
    };

    return expressions[primaryEmotion] || expressions.neutral;
  }

  // Generate SSML for enhanced speech synthesis
  generateSSML(text: string, voiceSettings: EVI3VoiceSettings): string {
    let ssml = `<speak>`;
    
    // Add prosody for emotional modulation
    if (voiceSettings.emotionalModulation) {
      const rate = Math.round(voiceSettings.speed * 100);
      const pitch = voiceSettings.pitch > 1 ? `+${Math.round((voiceSettings.pitch - 1) * 20)}%` : `${Math.round((voiceSettings.pitch - 1) * 20)}%`;
      const volume = voiceSettings.volume > 1 ? 'loud' : voiceSettings.volume < 0.9 ? 'soft' : 'medium';
      
      ssml += `<prosody rate="${rate}%" pitch="${pitch}" volume="${volume}">`;
    }

    // Add natural pauses
    if (voiceSettings.naturalPauses) {
      text = text.replace(/\.\.\./g, '<break time="300ms"/>');
      text = text.replace(/\./g, '<break time="200ms"/>');
      text = text.replace(/,/g, '<break time="100ms"/>');
    }

    // Add emphasis for important words
    text = text.replace(/\*\*(.*?)\*\*/g, '<emphasis>$1</emphasis>');
    text = text.replace(/\*(.*?)\*/g, '<prosody pitch="+10%">$1</prosody>');

    ssml += text;

    if (voiceSettings.emotionalModulation) {
      ssml += `</prosody>`;
    }

    ssml += `</speak>`;
    return ssml;
  }

  // Track conversation metrics
  trackConversationMetrics(responseTime: number, wasInterrupted: boolean = false) {
    this.responseLatency.push(responseTime);
    if (this.responseLatency.length > 10) {
      this.responseLatency.shift();
    }

    if (wasInterrupted) {
      this.interruptionCount++;
    }

    // Update personality evolution based on interaction success
    const avgResponseTime = this.responseLatency.reduce((a, b) => a + b, 0) / this.responseLatency.length;
    const interactionSuccess = avgResponseTime < 2000 && this.interruptionCount < 3;
    
    this.evolvePersonality(interactionSuccess);
  }

  // Personality evolution based on interaction success
  private evolvePersonality(interactionSuccess: boolean) {
    const evolutionKeys = ['empathy', 'responsiveness', 'naturalness', 'emotionalIntelligence'];
    
    evolutionKeys.forEach(key => {
      const currentValue = this.personalityEvolution.get(key) || 0.5;
      const evolution = interactionSuccess ? 0.02 : -0.01;
      const newValue = Math.max(0, Math.min(1, currentValue + evolution));
      this.personalityEvolution.set(key, newValue);
    });

    console.log('🧠 Personality evolution:', {
      success: interactionSuccess,
      empathy: this.personalityEvolution.get('empathy'),
      responsiveness: this.personalityEvolution.get('responsiveness'),
      naturalness: this.personalityEvolution.get('naturalness'),
      emotionalIntelligence: this.personalityEvolution.get('emotionalIntelligence')
    });
  }

  // Get conversation insights
  getConversationInsights(): any {
    const recentEmotions = this.emotionalHistory.slice(-5);
    const avgPleasure = recentEmotions.reduce((sum, e) => sum + e.pleasure, 0) / recentEmotions.length;
    const avgEngagement = recentEmotions.reduce((sum, e) => sum + e.engagement, 0) / recentEmotions.length;
    const avgResponseTime = this.responseLatency.reduce((a, b) => a + b, 0) / this.responseLatency.length;

    return {
      emotionalTrend: avgPleasure > 0.3 ? 'positive' : avgPleasure < -0.3 ? 'negative' : 'neutral',
      engagementLevel: avgEngagement > 0.7 ? 'high' : avgEngagement > 0.4 ? 'medium' : 'low',
      averageResponseTime: Math.round(avgResponseTime),
      interruptionRate: this.interruptionCount / Math.max(1, this.responseLatency.length),
      personalityEvolution: Object.fromEntries(this.personalityEvolution),
      needsAttention: avgEngagement < 0.3 || avgPleasure < -0.5,
      crisisRisk: recentEmotions.some(e => e.crisisLevel !== 'none')
    };
  }

  // Get current emotional state
  getCurrentEmotionalState(): AdvancedEmotionalState {
    return this.currentEmotionalState;
  }

  // Set speaking state
  setSpeakingState(isSpeaking: boolean) {
    this.isSpeaking = isSpeaking;
  }

  // Get speaking state
  getSpeakingState(): boolean {
    return this.isSpeaking;
  }
}

export default EVI3VoiceSystem;
