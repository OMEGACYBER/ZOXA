// Advanced Voice Analysis System - EVI3 Level
// Real-time emotional intelligence and voice processing

export interface AdvancedEmotionalState {
  pleasure: number;      // -1 to 1 (negative to positive)
  arousal: number;       // 0 to 1 (calm to excited)
  dominance: number;     // -1 to 1 (submissive to dominant)
  confidence: number;    // 0 to 1 (uncertain to confident)
  stress: number;        // 0 to 1 (relaxed to stressed)
  empathy: number;       // 0 to 1 (low to high empathy)
  engagement: number;    // 0 to 1 (disengaged to fully engaged)
  trust: number;         // 0 to 1 (distrustful to trusting)
  primaryEmotion: string;
  secondaryEmotion: string;
  emotionalIntensity: number;
  emotionalStability: number;
  conversationalFlow: number;
  crisisLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface VoiceQualityMetrics {
  clarity: number;       // 0 to 1 (unclear to crystal clear)
  volume: number;        // 0 to 1 (quiet to loud)
  pace: number;          // 0 to 1 (slow to fast)
  pitch: number;         // 0 to 1 (low to high)
  emotion: number;       // 0 to 1 (flat to expressive)
  naturalness: number;   // 0 to 1 (robotic to human-like)
  engagement: number;    // 0 to 1 (boring to engaging)
  warmth: number;        // 0 to 1 (cold to warm)
}

// NEW: Advanced Prosodic Analysis Interface
export interface AdvancedVoiceMetrics {
  prosody: {
    intonation: number;        // Voice pitch changes (-1 to 1)
    stressPatterns: number[];  // Word emphasis patterns
    rhythm: number;           // Speech rhythm (0 to 1)
    tempo: number;            // Speaking speed (0 to 1)
    pitchVariation: number;   // Pitch variation range
  };
  voiceCharacteristics: {
    tremor: number;           // Voice shaking (0 to 1)
    clarity: number;          // Voice clarity (0 to 1)
    resonance: number;        // Voice resonance (0 to 1)
    breathiness: number;      // Breath in voice (0 to 1)
    stability: number;        // Voice stability (0 to 1)
  };
  crisisIndicators: {
    voiceStress: number;      // Voice stress level (0 to 1)
    breathIrregularity: number; // Breath pattern irregularity (0 to 1)
    voiceTremor: number;      // Voice tremor intensity (0 to 1)
    pitchInstability: number; // Pitch instability (0 to 1)
    volumeInconsistency: number; // Volume inconsistency (0 to 1)
  };
}

export class EVI3VoiceAnalyzer {
  private emotionalHistory: AdvancedEmotionalState[] = [];
  private voiceQualityHistory: VoiceQualityMetrics[] = [];
  private voiceMetricsHistory: AdvancedVoiceMetrics[] = [];

  constructor() {
    // Production mode: No debug output to users
    // console.log('🎤 EVI3 Voice Analyzer initialized with advanced prosodic analysis');
  }

  // NEW: Advanced prosodic analysis from audio data
  analyzeVoiceProsody(audioData: Float32Array): AdvancedVoiceMetrics {
    if (!audioData || audioData.length === 0) {
      return this.getDefaultVoiceMetrics();
    }

    // Calculate basic audio statistics
    const mean = audioData.reduce((a, b) => a + b, 0) / audioData.length;
    const variance = audioData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / audioData.length;
    const stdDev = Math.sqrt(variance);
    
    // Analyze pitch variation (simplified FFT-like analysis)
    const pitchVariation = this.calculatePitchVariation(audioData);
    
    // Analyze rhythm and tempo
    const rhythm = this.calculateRhythm(audioData);
    const tempo = this.calculateTempo(audioData);
    
    // Analyze voice characteristics
    const tremor = this.detectVoiceTremor(audioData);
    const clarity = this.calculateVoiceClarity(audioData);
    const breathiness = this.detectBreathiness(audioData);
    
    // Calculate crisis indicators
    const voiceStress = this.calculateVoiceStress(audioData);
    const breathIrregularity = this.calculateBreathIrregularity(audioData);
    const pitchInstability = this.calculatePitchInstability(audioData);
    const volumeInconsistency = this.calculateVolumeInconsistency(audioData);

    const metrics: AdvancedVoiceMetrics = {
      prosody: {
        intonation: Math.max(-1, Math.min(1, (pitchVariation - 0.5) * 2)),
        stressPatterns: this.extractStressPatterns(audioData),
        rhythm: rhythm,
        tempo: tempo,
        pitchVariation: pitchVariation
      },
      voiceCharacteristics: {
        tremor: tremor,
        clarity: clarity,
        resonance: this.calculateResonance(audioData),
        breathiness: breathiness,
        stability: 1 - tremor // Inverse of tremor
      },
      crisisIndicators: {
        voiceStress: voiceStress,
        breathIrregularity: breathIrregularity,
        voiceTremor: tremor,
        pitchInstability: pitchInstability,
        volumeInconsistency: volumeInconsistency
      }
    };

    // Store in history
    this.voiceMetricsHistory.push(metrics);
    if (this.voiceMetricsHistory.length > 50) {
      this.voiceMetricsHistory.shift();
    }

    return metrics;
  }

  // NEW: Voice-only crisis detection
  detectVoiceCrisis(audioData: Float32Array): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    const metrics = this.analyzeVoiceProsody(audioData);
    const { voiceStress, breathIrregularity, voiceTremor, pitchInstability, volumeInconsistency } = metrics.crisisIndicators;

    // Crisis scoring algorithm
    let crisisScore = 0;
    
    if (voiceStress > 0.8) crisisScore += 3;
    else if (voiceStress > 0.6) crisisScore += 2;
    else if (voiceStress > 0.4) crisisScore += 1;

    if (breathIrregularity > 0.7) crisisScore += 3;
    else if (breathIrregularity > 0.5) crisisScore += 2;
    else if (breathIrregularity > 0.3) crisisScore += 1;

    if (voiceTremor > 0.7) crisisScore += 3;
    else if (voiceTremor > 0.5) crisisScore += 2;
    else if (voiceTremor > 0.3) crisisScore += 1;

    if (pitchInstability > 0.6) crisisScore += 2;
    else if (pitchInstability > 0.4) crisisScore += 1;

    if (volumeInconsistency > 0.6) crisisScore += 2;
    else if (volumeInconsistency > 0.4) crisisScore += 1;

    // Determine crisis level
    if (crisisScore >= 8) return 'critical';
    if (crisisScore >= 6) return 'high';
    if (crisisScore >= 4) return 'medium';
    if (crisisScore >= 2) return 'low';
    return 'none';
  }

  // NEW: Real-time voice emotion streaming
  getVoiceEmotionStream(audioData: Float32Array): {
    emotionalState: AdvancedEmotionalState;
    voiceMetrics: AdvancedVoiceMetrics;
    crisisLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  } {
    const voiceMetrics = this.analyzeVoiceProsody(audioData);
    const crisisLevel = this.detectVoiceCrisis(audioData);
    
    // Convert voice metrics to emotional state
    const emotionalState = this.convertVoiceToEmotion(voiceMetrics, crisisLevel);
    
    // Calculate confidence based on voice stability
    const confidence = 1 - voiceMetrics.voiceCharacteristics.tremor;

    return {
      emotionalState,
      voiceMetrics,
      crisisLevel,
      confidence
    };
  }

  // Enhanced emotional analysis with voice data
  analyzeEmotionalState(text: string, audioData?: Float32Array): AdvancedEmotionalState {
    const lowerText = text.toLowerCase();
    
    // Enhanced emotional keyword patterns with intensity scoring
    const emotionPatterns = {
      joy: {
        keywords: ['happy', 'joy', 'excited', 'thrilled', 'amazing', 'wonderful', 'fantastic', 'great', 'love', 'blessed', 'grateful'],
        intensity: 0.8,
        pleasure: 0.9,
        arousal: 0.7,
        dominance: 0.6
      },
      contentment: {
        keywords: ['content', 'peaceful', 'calm', 'serene', 'satisfied', 'fulfilled', 'at ease', 'comfortable'],
        intensity: 0.6,
        pleasure: 0.7,
        arousal: 0.3,
        dominance: 0.5
      },
      sadness: {
        keywords: ['sad', 'depressed', 'down', 'lonely', 'hurt', 'crying', 'tears', 'empty', 'hopeless', 'worthless', 'miserable'],
        intensity: 0.8,
        pleasure: -0.8,
        arousal: 0.2,
        dominance: -0.3
      },
      anxiety: {
        keywords: ['anxious', 'worried', 'scared', 'nervous', 'panic', 'stress', 'overwhelmed', 'tense', 'afraid', 'fearful'],
        intensity: 0.7,
        pleasure: -0.6,
        arousal: 0.8,
        dominance: -0.4
      },
      anger: {
        keywords: ['angry', 'mad', 'furious', 'pissed', 'hate', 'annoyed', 'frustrated', 'rage', 'irritated', 'livid'],
        intensity: 0.8,
        pleasure: -0.4,
        arousal: 0.9,
        dominance: 0.2
      }
    };

    // Analyze text for emotional indicators
    const maxIntensity = 0;
    const detectedEmotion = 'neutral';
    let emotionalState: AdvancedEmotionalState = {
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

    // NEW: If audio data is available, use voice analysis
    if (audioData && audioData.length > 0) {
      const voiceAnalysis = this.getVoiceEmotionStream(audioData);
      emotionalState = voiceAnalysis.emotionalState;
      emotionalState.crisisLevel = voiceAnalysis.crisisLevel as 'none' | 'low' | 'medium' | 'high' | 'critical';
      
      // Combine text and voice analysis
      const textAnalysis = this.analyzeTextEmotion(lowerText, emotionPatterns);
      emotionalState = this.combineTextAndVoiceAnalysis(textAnalysis, voiceAnalysis);
      } else {
      // Fallback to text-only analysis
      const textAnalysis = this.analyzeTextEmotion(lowerText, emotionPatterns);
      emotionalState = textAnalysis;
    }

    // Update emotional history
    this.emotionalHistory.push(emotionalState);
    if (this.emotionalHistory.length > 20) {
      this.emotionalHistory.shift();
    }

    // Calculate emotional stability
    emotionalState.emotionalStability = this.calculateEmotionalStability();

    return emotionalState;
  }

  // Helper methods for voice analysis
  private calculatePitchVariation(audioData: Float32Array): number {
    // Simplified pitch variation calculation
    const chunks = this.chunkArray(audioData, 1024);
    const pitchValues = chunks.map(chunk => {
      const mean = chunk.reduce((a, b) => a + b, 0) / chunk.length;
      return Math.abs(mean);
    });
    
    const variance = this.calculateVariance(pitchValues);
    return Math.min(1, variance * 10); // Normalize to 0-1
  }

  private calculateRhythm(audioData: Float32Array): number {
    // Simplified rhythm calculation based on amplitude variations
    const amplitudeChanges = [];
    for (let i = 1; i < audioData.length; i++) {
      amplitudeChanges.push(Math.abs(audioData[i] - audioData[i-1]));
    }
    
    const rhythmScore = amplitudeChanges.reduce((a, b) => a + b, 0) / amplitudeChanges.length;
    return Math.min(1, rhythmScore * 5);
  }

  private calculateTempo(audioData: Float32Array): number {
    // Simplified tempo calculation
    const zeroCrossings = this.countZeroCrossings(audioData);
    const tempo = zeroCrossings / audioData.length;
    return Math.min(1, tempo * 100);
  }

  private detectVoiceTremor(audioData: Float32Array): number {
    // Detect voice tremor through frequency analysis
    const chunks = this.chunkArray(audioData, 512);
    const tremorScores = chunks.map(chunk => {
      const variance = this.calculateVariance(Array.from(chunk));
      return variance;
    });
    
    const avgTremor = tremorScores.reduce((a, b) => a + b, 0) / tremorScores.length;
    return Math.min(1, avgTremor * 20);
  }

  private calculateVoiceClarity(audioData: Float32Array): number {
    // Calculate voice clarity based on signal-to-noise ratio
    const signal = audioData.reduce((a, b) => a + Math.abs(b), 0) / audioData.length;
    const noise = this.calculateVariance(Array.from(audioData));
    const clarity = signal / (noise + 0.001);
    return Math.min(1, clarity);
  }

  private detectBreathiness(audioData: Float32Array): number {
    // Detect breathiness through low-frequency analysis
    const lowFreq = audioData.filter((_, i) => i % 4 === 0);
    const breathiness = lowFreq.reduce((a, b) => a + Math.abs(b), 0) / lowFreq.length;
    return Math.min(1, breathiness * 2);
  }

  private calculateVoiceStress(audioData: Float32Array): number {
    // Calculate voice stress through multiple indicators
    const tremor = this.detectVoiceTremor(audioData);
    const pitchInstability = this.calculatePitchInstability(audioData);
    const volumeInconsistency = this.calculateVolumeInconsistency(audioData);
    
    return (tremor + pitchInstability + volumeInconsistency) / 3;
  }

  private calculateBreathIrregularity(audioData: Float32Array): number {
    // Calculate breath pattern irregularity
    const breathiness = this.detectBreathiness(audioData);
    const chunks = this.chunkArray(audioData, 1024);
    const breathPatterns = chunks.map(chunk => {
      const breath = chunk.filter((_, i) => i % 4 === 0);
      return breath.reduce((a, b) => a + Math.abs(b), 0) / breath.length;
    });
    
    const irregularity = this.calculateVariance(breathPatterns);
    return Math.min(1, irregularity * 5);
  }

  private calculatePitchInstability(audioData: Float32Array): number {
    // Calculate pitch instability
    const pitchVariation = this.calculatePitchVariation(audioData);
    const chunks = this.chunkArray(audioData, 512);
    const pitchValues = chunks.map(chunk => {
      const mean = chunk.reduce((a, b) => a + b, 0) / chunk.length;
      return Math.abs(mean);
    });
    
    const instability = this.calculateVariance(pitchValues);
    return Math.min(1, instability * 10);
  }

  private calculateVolumeInconsistency(audioData: Float32Array): number {
    // Calculate volume inconsistency
    const chunks = this.chunkArray(audioData, 256);
    const volumes = chunks.map(chunk => {
      return chunk.reduce((a, b) => a + Math.abs(b), 0) / chunk.length;
    });
    
    const inconsistency = this.calculateVariance(volumes);
    return Math.min(1, inconsistency * 5);
  }

  private calculateResonance(audioData: Float32Array): number {
    // Calculate voice resonance
    const signal = audioData.reduce((a, b) => a + Math.abs(b), 0) / audioData.length;
    const clarity = this.calculateVoiceClarity(audioData);
    return (signal + clarity) / 2;
  }

  private extractStressPatterns(audioData: Float32Array): number[] {
    // Extract stress patterns (simplified)
    const chunks = this.chunkArray(audioData, 256);
    return chunks.map(chunk => {
      const stress = chunk.reduce((a, b) => a + Math.abs(b), 0) / chunk.length;
      return Math.min(1, stress * 2);
    }).slice(0, 10); // Return first 10 stress patterns
  }

  private convertVoiceToEmotion(voiceMetrics: AdvancedVoiceMetrics, crisisLevel: string): AdvancedEmotionalState {
    const { prosody, voiceCharacteristics, crisisIndicators } = voiceMetrics;
    
    // Convert voice metrics to emotional dimensions
    const pleasure = 0.5 + (prosody.intonation * 0.3) - (crisisIndicators.voiceStress * 0.4);
    const arousal = 0.5 + (prosody.tempo * 0.4) + (crisisIndicators.voiceStress * 0.3);
    const dominance = 0.5 + (voiceCharacteristics.clarity * 0.3) - (crisisIndicators.voiceTremor * 0.4);
    const confidence = 0.5 + (voiceCharacteristics.stability * 0.4) - (crisisIndicators.pitchInstability * 0.3);
    const stress = crisisIndicators.voiceStress;
    
    // Determine primary emotion from voice characteristics
    let primaryEmotion = 'neutral';
    if (crisisLevel === 'critical') primaryEmotion = 'crisis';
    else if (stress > 0.7) primaryEmotion = 'anxiety';
    else if (pleasure > 0.7) primaryEmotion = 'joy';
    else if (pleasure < 0.3) primaryEmotion = 'sadness';
    else if (arousal > 0.7) primaryEmotion = 'excited';

      return {
      pleasure: Math.max(-1, Math.min(1, pleasure)),
      arousal: Math.max(0, Math.min(1, arousal)),
      dominance: Math.max(-1, Math.min(1, dominance)),
      confidence: Math.max(0, Math.min(1, confidence)),
      stress: Math.max(0, Math.min(1, stress)),
      empathy: 0.5,
      engagement: 0.5 + (prosody.rhythm * 0.3),
      trust: 0.5 + (voiceCharacteristics.stability * 0.3),
      primaryEmotion,
      secondaryEmotion: 'neutral',
      emotionalIntensity: Math.max(0.5, (stress + arousal) / 2),
      emotionalStability: voiceCharacteristics.stability,
      conversationalFlow: 0.5 + (prosody.rhythm * 0.2),
      crisisLevel: crisisLevel as any
    };
  }

  private combineTextAndVoiceAnalysis(textAnalysis: AdvancedEmotionalState, voiceAnalysis: { emotionalState: AdvancedEmotionalState; crisisLevel: string }): AdvancedEmotionalState {
    // Combine text and voice analysis with voice having higher weight for real-time accuracy
    const voiceWeight = 0.7;
    const textWeight = 0.3;
    
      return {
      pleasure: (textAnalysis.pleasure * textWeight) + (voiceAnalysis.emotionalState.pleasure * voiceWeight),
      arousal: (textAnalysis.arousal * textWeight) + (voiceAnalysis.emotionalState.arousal * voiceWeight),
      dominance: (textAnalysis.dominance * textWeight) + (voiceAnalysis.emotionalState.dominance * voiceWeight),
      confidence: (textAnalysis.confidence * textWeight) + (voiceAnalysis.emotionalState.confidence * voiceWeight),
      stress: (textAnalysis.stress * textWeight) + (voiceAnalysis.emotionalState.stress * voiceWeight),
      empathy: textAnalysis.empathy,
      engagement: (textAnalysis.engagement * textWeight) + (voiceAnalysis.emotionalState.engagement * voiceWeight),
      trust: (textAnalysis.trust * textWeight) + (voiceAnalysis.emotionalState.trust * voiceWeight),
      primaryEmotion: voiceAnalysis.crisisLevel === 'critical' ? 'crisis' : textAnalysis.primaryEmotion,
      secondaryEmotion: textAnalysis.secondaryEmotion,
      emotionalIntensity: (textAnalysis.emotionalIntensity * textWeight) + (voiceAnalysis.emotionalState.emotionalIntensity * voiceWeight),
      emotionalStability: voiceAnalysis.emotionalState.emotionalStability,
      conversationalFlow: (textAnalysis.conversationalFlow * textWeight) + (voiceAnalysis.emotionalState.conversationalFlow * voiceWeight),
      crisisLevel: voiceAnalysis.crisisLevel as 'none' | 'low' | 'medium' | 'high' | 'critical'
    };
  }

  private analyzeTextEmotion(text: string, patterns: Record<string, EmotionPattern>): AdvancedEmotionalState {
    let maxIntensity = 0;
    let detectedEmotion = 'neutral';
    let emotionalState: AdvancedEmotionalState = {
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

    Object.entries(patterns).forEach(([emotion, pattern]: [string, EmotionPattern]) => {
      const keywordMatches = pattern.keywords.filter((keyword: string) => text.includes(keyword)).length;
      if (keywordMatches > 0) {
        const intensity = pattern.intensity * (keywordMatches / pattern.keywords.length);
        if (intensity > maxIntensity) {
          maxIntensity = intensity;
          detectedEmotion = emotion;
          emotionalState = {
            ...emotionalState,
            pleasure: pattern.pleasure,
            arousal: pattern.arousal,
            dominance: pattern.dominance,
            primaryEmotion: emotion,
            emotionalIntensity: intensity
          };
        }
      }
    });

    // Crisis detection from text
    const crisisKeywords = ['kill myself', 'want to die', 'end it all', 'suicide', 'hurt myself', 'no reason to live'];
    const hasCrisisKeywords = crisisKeywords.some(keyword => text.includes(keyword));
    if (hasCrisisKeywords) {
      emotionalState.crisisLevel = 'critical';
      emotionalState.primaryEmotion = 'crisis';
    }

    return emotionalState;
  }

  private getDefaultVoiceMetrics(): AdvancedVoiceMetrics {
    return {
      prosody: {
        intonation: 0,
        stressPatterns: [],
        rhythm: 0.5,
        tempo: 0.5,
        pitchVariation: 0.5
      },
      voiceCharacteristics: {
        tremor: 0,
        clarity: 0.5,
        resonance: 0.5,
        breathiness: 0,
        stability: 1
      },
      crisisIndicators: {
        voiceStress: 0,
        breathIrregularity: 0,
        voiceTremor: 0,
        pitchInstability: 0,
        volumeInconsistency: 0
      }
    };
  }

  // Utility methods
  private chunkArray(array: Float32Array, size: number): Float32Array[] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private countZeroCrossings(array: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < array.length; i++) {
      if ((array[i] >= 0 && array[i-1] < 0) || (array[i] < 0 && array[i-1] >= 0)) {
        crossings++;
      }
    }
    return crossings;
  }

  private calculateEmotionalStability(): number {
    if (this.emotionalHistory.length < 2) return 0.5;
    
    const recentEmotions = this.emotionalHistory.slice(-5);
    const pleasureVariance = this.calculateVariance(recentEmotions.map(e => e.pleasure));
    const arousalVariance = this.calculateVariance(recentEmotions.map(e => e.arousal));
    
    const stability = 1 - ((pleasureVariance + arousalVariance) / 2);
    return Math.max(0, Math.min(1, stability));
  }

  // Get optimal voice settings based on emotional state
  getOptimalVoiceSettings(emotionalState: AdvancedEmotionalState) {
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
      emotion
    };
  }

  // Get conversational response style
  getResponseStyle(emotionalState: AdvancedEmotionalState): ResponseStyle {
    const { primaryEmotion, emotionalIntensity, crisisLevel } = emotionalState;
    
    let tone = 'neutral';
    let length = 'medium';
    let style = 'conversational';
    let urgency = 'normal';

    if (crisisLevel === 'critical') {
      tone = 'urgent';
      length = 'short';
      style = 'crisis';
      urgency = 'immediate';
    } else if (primaryEmotion === 'sadness' && emotionalIntensity > 0.7) {
      tone = 'gentle';
      length = 'medium';
      style = 'supportive';
      urgency = 'high';
    } else if (primaryEmotion === 'joy' && emotionalIntensity > 0.7) {
      tone = 'enthusiastic';
      length = 'short';
      style = 'celebratory';
      urgency = 'normal';
    }

    return { tone, length, style, urgency };
  }
}

export default EVI3VoiceAnalyzer;

// Add type definition for emotion patterns
interface EmotionPattern {
  keywords: string[];
  intensity: number;
  pleasure: number;
  arousal: number;
  dominance: number;
}

// Add type definition for response style
interface ResponseStyle {
  tone: string;
  length: string;
  style: string;
  urgency: string;
}
