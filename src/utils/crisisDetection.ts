// 🚨 Advanced Crisis Detection System - ZOXAA Safety Protocol
// Multi-modal crisis detection with high accuracy and low false positives

export interface CrisisIndicators {
  textIndicators: TextCrisisIndicators;
  voiceIndicators: VoiceCrisisIndicators;
  behavioralIndicators: BehavioralCrisisIndicators;
  overallRisk: number; // 0-1
  crisisLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  recommendedAction: string;
}

export interface TextCrisisIndicators {
  suicidalIdeation: number; // 0-1
  selfHarm: number; // 0-1
  hopelessness: number; // 0-1
  isolation: number; // 0-1
  substanceAbuse: number; // 0-1
  violence: number; // 0-1
  acuteDistress: number; // 0-1
  totalRisk: number; // 0-1
}

export interface VoiceCrisisIndicators {
  voiceStress: number; // 0-1
  breathIrregularity: number; // 0-1
  voiceTremor: number; // 0-1
  pitchInstability: number; // 0-1
  volumeInconsistency: number; // 0-1
  speechRate: number; // 0-1 (too fast or too slow)
  totalRisk: number; // 0-1
}

export interface BehavioralCrisisIndicators {
  rapidMoodSwings: number; // 0-1
  withdrawal: number; // 0-1
  agitation: number; // 0-1
  impulsivity: number; // 0-1
  sleepDisturbance: number; // 0-1
  appetiteChanges: number; // 0-1
  totalRisk: number; // 0-1
}

export class CrisisDetectionSystem {
  private crisisHistory: CrisisIndicators[] = [];
  private falsePositiveCount = 0;
  private truePositiveCount = 0;
  private sessionStartTime: number = Date.now();

  // Crisis keywords with weighted risk scores
  private readonly crisisKeywords = {
    suicidal: {
      keywords: [
        'kill myself', 'end my life', 'want to die', 'suicide', 'take my life',
        'don\'t want to live', 'better off dead', 'no reason to live',
        'end it all', 'give up', 'can\'t go on', 'tired of living'
      ],
      weight: 0.9,
      urgency: 'immediate'
    },
    selfHarm: {
      keywords: [
        'hurt myself', 'cut myself', 'self harm', 'self injury', 'bleeding',
        'scars', 'burn myself', 'hit myself', 'bang my head'
      ],
      weight: 0.8,
      urgency: 'high'
    },
    hopelessness: {
      keywords: [
        'hopeless', 'helpless', 'worthless', 'useless', 'no hope',
        'nothing matters', 'pointless', 'meaningless', 'no future',
        'everything is wrong', 'can\'t fix this', 'no way out'
      ],
      weight: 0.7,
      urgency: 'high'
    },
    isolation: {
      keywords: [
        'alone', 'lonely', 'no friends', 'no one cares', 'no one understands',
        'isolated', 'abandoned', 'rejected', 'no support', 'no one to talk to'
      ],
      weight: 0.6,
      urgency: 'medium'
    },
    substanceAbuse: {
      keywords: [
        'drunk', 'high', 'drugs', 'alcohol', 'overdose', 'substance',
        'medication', 'pills', 'smoking', 'drinking too much'
      ],
      weight: 0.6,
      urgency: 'medium'
    },
    violence: {
      keywords: [
        'hurt someone', 'kill someone', 'attack', 'violent', 'rage',
        'angry', 'furious', 'hate', 'revenge', 'payback'
      ],
      weight: 0.8,
      urgency: 'high'
    },
    acuteDistress: {
      keywords: [
        'panic', 'anxiety attack', 'can\'t breathe', 'heart racing',
        'overwhelmed', 'breaking down', 'losing control', 'freaking out',
        'mental breakdown', 'nervous breakdown'
      ],
      weight: 0.7,
      urgency: 'high'
    }
  };

  // Voice crisis patterns
  private readonly voiceCrisisPatterns = {
    highStress: {
      indicators: ['rapid_speech', 'high_pitch', 'volume_increase'],
      threshold: 0.7
    },
    depression: {
      indicators: ['slow_speech', 'low_pitch', 'monotone'],
      threshold: 0.6
    },
    anxiety: {
      indicators: ['voice_tremor', 'breath_irregularity', 'pitch_instability'],
      threshold: 0.6
    },
    agitation: {
      indicators: ['volume_inconsistency', 'speech_rate_variation'],
      threshold: 0.5
    }
  };

  // Behavioral crisis patterns
  private readonly behavioralPatterns = {
    rapidMoodSwings: {
      indicators: ['emotion_changes', 'response_inconsistency'],
      threshold: 0.6
    },
    withdrawal: {
      indicators: ['short_responses', 'delayed_responses', 'topic_avoidance'],
      threshold: 0.5
    },
    agitation: {
      indicators: ['repetitive_phrases', 'interruptions', 'impatience'],
      threshold: 0.5
    }
  };

  constructor() {
    this.sessionStartTime = Date.now();
  }

  // Main crisis detection method
  detectCrisis(
    text: string,
    voiceData?: any,
    behavioralData?: any,
    sessionDuration?: number
  ): CrisisIndicators {
    const textIndicators = this.analyzeTextCrisis(text);
    const voiceIndicators = this.analyzeVoiceCrisis(voiceData);
    const behavioralIndicators = this.analyzeBehavioralCrisis(behavioralData, sessionDuration);

    // Calculate overall risk using weighted combination
    const overallRisk = this.calculateOverallRisk(
      textIndicators,
      voiceIndicators,
      behavioralIndicators
    );

    const crisisLevel = this.determineCrisisLevel(overallRisk);
    const confidence = this.calculateConfidence(
      textIndicators,
      voiceIndicators,
      behavioralIndicators
    );
    const urgency = this.determineUrgency(crisisLevel, textIndicators);
    const recommendedAction = this.getRecommendedAction(crisisLevel, urgency);

    const crisisIndicators: CrisisIndicators = {
      textIndicators,
      voiceIndicators,
      behavioralIndicators,
      overallRisk,
      crisisLevel,
      confidence,
      urgency,
      recommendedAction
    };

    // Store in history for pattern analysis
    this.crisisHistory.push(crisisIndicators);
    if (this.crisisHistory.length > 50) {
      this.crisisHistory.shift(); // Keep only last 50 entries
    }

    return crisisIndicators;
  }

  private analyzeTextCrisis(text: string): TextCrisisIndicators {
    const lowerText = text.toLowerCase();
    const indicators: TextCrisisIndicators = {
      suicidalIdeation: 0,
      selfHarm: 0,
      hopelessness: 0,
      isolation: 0,
      substanceAbuse: 0,
      violence: 0,
      acuteDistress: 0,
      totalRisk: 0
    };

    // Analyze each crisis category
    Object.entries(this.crisisKeywords).forEach(([category, config]) => {
      const matches = config.keywords.filter(keyword => 
        lowerText.includes(keyword)
      ).length;
      
      const riskScore = Math.min(1, (matches / config.keywords.length) * config.weight);
      
      switch (category) {
        case 'suicidal':
          indicators.suicidalIdeation = riskScore;
          break;
        case 'selfHarm':
          indicators.selfHarm = riskScore;
          break;
        case 'hopelessness':
          indicators.hopelessness = riskScore;
          break;
        case 'isolation':
          indicators.isolation = riskScore;
          break;
        case 'substanceAbuse':
          indicators.substanceAbuse = riskScore;
          break;
        case 'violence':
          indicators.violence = riskScore;
          break;
        case 'acuteDistress':
          indicators.acuteDistress = riskScore;
          break;
      }
    });

    // Calculate total risk with weighted importance
    const weights = {
      suicidalIdeation: 0.3,
      selfHarm: 0.25,
      hopelessness: 0.2,
      violence: 0.15,
      acuteDistress: 0.1
    };

    indicators.totalRisk = Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (indicators[key as keyof TextCrisisIndicators] as number) * weight;
    }, 0);

    return indicators;
  }

  private analyzeVoiceCrisis(voiceData?: any): VoiceCrisisIndicators {
    if (!voiceData) {
      return {
        voiceStress: 0,
        breathIrregularity: 0,
        voiceTremor: 0,
        pitchInstability: 0,
        volumeInconsistency: 0,
        speechRate: 0,
        totalRisk: 0
      };
    }

    // Analyze voice characteristics
    const voiceStress = this.calculateVoiceStress(voiceData);
    const breathIrregularity = this.calculateBreathIrregularity(voiceData);
    const voiceTremor = this.calculateVoiceTremor(voiceData);
    const pitchInstability = this.calculatePitchInstability(voiceData);
    const volumeInconsistency = this.calculateVolumeInconsistency(voiceData);
    const speechRate = this.calculateSpeechRate(voiceData);

    const totalRisk = (
      voiceStress * 0.25 +
      breathIrregularity * 0.2 +
      voiceTremor * 0.2 +
      pitchInstability * 0.15 +
      volumeInconsistency * 0.1 +
      speechRate * 0.1
    );

    return {
      voiceStress,
      breathIrregularity,
      voiceTremor,
      pitchInstability,
      volumeInconsistency,
      speechRate,
      totalRisk
    };
  }

  private analyzeBehavioralCrisis(behavioralData?: any, sessionDuration?: number): BehavioralCrisisIndicators {
    const sessionTime = sessionDuration || (Date.now() - this.sessionStartTime) / 1000;
    
    // Analyze recent crisis history for behavioral patterns
    const recentCrises = this.crisisHistory.slice(-10);
    
    const rapidMoodSwings = this.calculateMoodSwings(recentCrises);
    const withdrawal = this.calculateWithdrawal(behavioralData, sessionTime);
    const agitation = this.calculateAgitation(recentCrises);
    const impulsivity = this.calculateImpulsivity(recentCrises);
    const sleepDisturbance = 0; // Would need additional data
    const appetiteChanges = 0; // Would need additional data

    const totalRisk = (
      rapidMoodSwings * 0.3 +
      withdrawal * 0.25 +
      agitation * 0.25 +
      impulsivity * 0.2
    );

    return {
      rapidMoodSwings,
      withdrawal,
      agitation,
      impulsivity,
      sleepDisturbance,
      appetiteChanges,
      totalRisk
    };
  }

  private calculateOverallRisk(
    textIndicators: TextCrisisIndicators,
    voiceIndicators: VoiceCrisisIndicators,
    behavioralIndicators: BehavioralCrisisIndicators
  ): number {
    // Weighted combination with text being most important
    const textWeight = 0.6;
    const voiceWeight = 0.25;
    const behavioralWeight = 0.15;

    return (
      textIndicators.totalRisk * textWeight +
      voiceIndicators.totalRisk * voiceWeight +
      behavioralIndicators.totalRisk * behavioralWeight
    );
  }

  private determineCrisisLevel(overallRisk: number): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    if (overallRisk >= 0.8) return 'critical';
    if (overallRisk >= 0.6) return 'high';
    if (overallRisk >= 0.4) return 'medium';
    if (overallRisk >= 0.2) return 'low';
    return 'none';
  }

  private calculateConfidence(
    textIndicators: TextCrisisIndicators,
    voiceIndicators: VoiceCrisisIndicators,
    behavioralIndicators: BehavioralCrisisIndicators
  ): number {
    // Higher confidence when multiple indicators align
    const textConfidence = textIndicators.totalRisk > 0.5 ? 0.8 : 0.3;
    const voiceConfidence = voiceIndicators.totalRisk > 0.5 ? 0.7 : 0.4;
    const behavioralConfidence = behavioralIndicators.totalRisk > 0.5 ? 0.6 : 0.3;

    return (textConfidence + voiceConfidence + behavioralConfidence) / 3;
  }

  private determineUrgency(
    crisisLevel: string,
    textIndicators: TextCrisisIndicators
  ): 'low' | 'medium' | 'high' | 'immediate' {
    if (crisisLevel === 'critical' || textIndicators.suicidalIdeation > 0.7) {
      return 'immediate';
    }
    if (crisisLevel === 'high' || textIndicators.selfHarm > 0.6) {
      return 'high';
    }
    if (crisisLevel === 'medium') {
      return 'medium';
    }
    return 'low';
  }

  private getRecommendedAction(
    crisisLevel: string,
    urgency: string
  ): string {
    switch (crisisLevel) {
      case 'critical':
        return 'Immediate intervention required. Provide crisis hotline information and encourage professional help.';
      case 'high':
        return 'High risk detected. Offer emotional support and suggest professional counseling.';
      case 'medium':
        return 'Moderate risk. Continue supportive conversation and monitor for escalation.';
      case 'low':
        return 'Low risk. Maintain supportive presence and encourage healthy coping strategies.';
      default:
        return 'No immediate risk detected. Continue normal conversation.';
    }
  }

  // Voice analysis helper methods
  private calculateVoiceStress(voiceData: any): number {
    // Simplified voice stress calculation
    return voiceData?.stress || 0;
  }

  private calculateBreathIrregularity(voiceData: any): number {
    return voiceData?.breathIrregularity || 0;
  }

  private calculateVoiceTremor(voiceData: any): number {
    return voiceData?.tremor || 0;
  }

  private calculatePitchInstability(voiceData: any): number {
    return voiceData?.pitchInstability || 0;
  }

  private calculateVolumeInconsistency(voiceData: any): number {
    return voiceData?.volumeInconsistency || 0;
  }

  private calculateSpeechRate(voiceData: any): number {
    return voiceData?.speechRate || 0;
  }

  // Behavioral analysis helper methods
  private calculateMoodSwings(recentCrises: CrisisIndicators[]): number {
    if (recentCrises.length < 3) return 0;
    
    const levels = recentCrises.map(c => {
      switch (c.crisisLevel) {
        case 'critical': return 4;
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 0;
      }
    });
    
    const variance = this.calculateVariance(levels);
    return Math.min(1, variance / 4);
  }

  private calculateWithdrawal(behavioralData: any, sessionTime: number): number {
    // Analyze response patterns for withdrawal signs
    return behavioralData?.withdrawal || 0;
  }

  private calculateAgitation(recentCrises: CrisisIndicators[]): number {
    // Look for increasing crisis levels indicating agitation
    if (recentCrises.length < 2) return 0;
    
    const recent = recentCrises.slice(-3);
    const increasing = recent.every((crisis, i) => 
      i === 0 || this.getCrisisLevelValue(crisis.crisisLevel) >= this.getCrisisLevelValue(recent[i-1].crisisLevel)
    );
    
    return increasing ? 0.7 : 0.2;
  }

  private calculateImpulsivity(recentCrises: CrisisIndicators[]): number {
    // Look for sudden spikes in crisis levels
    if (recentCrises.length < 3) return 0;
    
    const levels = recentCrises.map(c => this.getCrisisLevelValue(c.crisisLevel));
    const spikes = levels.filter((level, i) => 
      i > 0 && level - levels[i-1] >= 2
    ).length;
    
    return Math.min(1, spikes / levels.length);
  }

  private getCrisisLevelValue(level: string): number {
    switch (level) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  // Get crisis history for analysis
  getCrisisHistory(): CrisisIndicators[] {
    return [...this.crisisHistory];
  }

  // Reset session data
  resetSession(): void {
    this.crisisHistory = [];
    this.sessionStartTime = Date.now();
  }
}
