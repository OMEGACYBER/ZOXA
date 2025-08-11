// Advanced Voice Prosodic Analysis - EVI3 Level
// Real-time voice emotion detection and crisis analysis

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

export class AdvancedVoiceProsodyAnalyzer {
  private voiceMetricsHistory: AdvancedVoiceMetrics[] = [];

  constructor() {
    console.log('🎤 Advanced Voice Prosody Analyzer initialized');
  }

  // Analyze voice prosody from audio data
  analyzeVoiceProsody(audioData: Float32Array): AdvancedVoiceMetrics {
    if (!audioData || audioData.length === 0) {
      return this.getDefaultVoiceMetrics();
    }

    // Calculate basic audio statistics
    const mean = audioData.reduce((a, b) => a + b, 0) / audioData.length;
    const variance = audioData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / audioData.length;
    const stdDev = Math.sqrt(variance);
    
    // Analyze pitch variation
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
        stability: 1 - tremor
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

  // Voice-only crisis detection
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

  // Real-time voice emotion streaming
  getVoiceEmotionStream(audioData: Float32Array): {
    voiceMetrics: AdvancedVoiceMetrics;
    crisisLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  } {
    const voiceMetrics = this.analyzeVoiceProsody(audioData);
    const crisisLevel = this.detectVoiceCrisis(audioData);
    
    // Calculate confidence based on voice stability
    const confidence = 1 - voiceMetrics.voiceCharacteristics.tremor;

    return {
      voiceMetrics,
      crisisLevel,
      confidence
    };
  }

  // Helper methods for voice analysis
  private calculatePitchVariation(audioData: Float32Array): number {
    const chunks = this.chunkArray(audioData, 1024);
    const pitchValues = chunks.map(chunk => {
      const mean = chunk.reduce((a, b) => a + b, 0) / chunk.length;
      return Math.abs(mean);
    });
    
    const variance = this.calculateVariance(pitchValues);
    return Math.min(1, variance * 10);
  }

  private calculateRhythm(audioData: Float32Array): number {
    const amplitudeChanges = [];
    for (let i = 1; i < audioData.length; i++) {
      amplitudeChanges.push(Math.abs(audioData[i] - audioData[i-1]));
    }
    
    const rhythmScore = amplitudeChanges.reduce((a, b) => a + b, 0) / amplitudeChanges.length;
    return Math.min(1, rhythmScore * 5);
  }

  private calculateTempo(audioData: Float32Array): number {
    const zeroCrossings = this.countZeroCrossings(audioData);
    const tempo = zeroCrossings / audioData.length;
    return Math.min(1, tempo * 100);
  }

  private detectVoiceTremor(audioData: Float32Array): number {
    const chunks = this.chunkArray(audioData, 512);
    const tremorScores = chunks.map(chunk => {
      const variance = this.calculateVariance(chunk);
      return variance;
    });
    
    const avgTremor = tremorScores.reduce((a, b) => a + b, 0) / tremorScores.length;
    return Math.min(1, avgTremor * 20);
  }

  private calculateVoiceClarity(audioData: Float32Array): number {
    const signal = audioData.reduce((a, b) => a + Math.abs(b), 0) / audioData.length;
    const noise = this.calculateVariance(audioData);
    const clarity = signal / (noise + 0.001);
    return Math.min(1, clarity);
  }

  private detectBreathiness(audioData: Float32Array): number {
    const lowFreq = audioData.filter((_, i) => i % 4 === 0);
    const breathiness = lowFreq.reduce((a, b) => a + Math.abs(b), 0) / lowFreq.length;
    return Math.min(1, breathiness * 2);
  }

  private calculateVoiceStress(audioData: Float32Array): number {
    const tremor = this.detectVoiceTremor(audioData);
    const pitchInstability = this.calculatePitchInstability(audioData);
    const volumeInconsistency = this.calculateVolumeInconsistency(audioData);
    
    return (tremor + pitchInstability + volumeInconsistency) / 3;
  }

  private calculateBreathIrregularity(audioData: Float32Array): number {
    const chunks = this.chunkArray(audioData, 1024);
    const breathPatterns = chunks.map(chunk => {
      const breath = chunk.filter((_, i) => i % 4 === 0);
      return breath.reduce((a, b) => a + Math.abs(b), 0) / breath.length;
    });
    
    const irregularity = this.calculateVariance(breathPatterns);
    return Math.min(1, irregularity * 5);
  }

  private calculatePitchInstability(audioData: Float32Array): number {
    const chunks = this.chunkArray(audioData, 512);
    const pitchValues = chunks.map(chunk => {
      const mean = chunk.reduce((a, b) => a + b, 0) / chunk.length;
      return Math.abs(mean);
    });
    
    const instability = this.calculateVariance(pitchValues);
    return Math.min(1, instability * 10);
  }

  private calculateVolumeInconsistency(audioData: Float32Array): number {
    const chunks = this.chunkArray(audioData, 256);
    const volumes = chunks.map(chunk => {
      return chunk.reduce((a, b) => a + Math.abs(b), 0) / chunk.length;
    });
    
    const inconsistency = this.calculateVariance(volumes);
    return Math.min(1, inconsistency * 5);
  }

  private calculateResonance(audioData: Float32Array): number {
    const signal = audioData.reduce((a, b) => a + Math.abs(b), 0) / audioData.length;
    const clarity = this.calculateVoiceClarity(audioData);
    return (signal + clarity) / 2;
  }

  private extractStressPatterns(audioData: Float32Array): number[] {
    const chunks = this.chunkArray(audioData, 256);
    return chunks.map(chunk => {
      const stress = chunk.reduce((a, b) => a + Math.abs(b), 0) / chunk.length;
      return Math.min(1, stress * 2);
    }).slice(0, 10);
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
}

export default AdvancedVoiceProsodyAnalyzer;
