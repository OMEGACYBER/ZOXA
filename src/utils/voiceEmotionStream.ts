// Real-time Voice Emotion Streaming - EVI3 Level
// Continuous voice emotion monitoring and streaming

import { AdvancedVoiceMetrics } from './advancedVoiceProsody';
import { AdvancedEmotionalState } from './advancedVoiceAnalysis';

export interface VoiceEmotionStreamData {
  timestamp: number;
  voiceMetrics: AdvancedVoiceMetrics;
  emotionalState: AdvancedEmotionalState;
  crisisLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  streamId: string;
}

export interface VoiceEmotionStreamConfig {
  sampleRate: number;
  bufferSize: number;
  analysisInterval: number;
  enableCrisisDetection: boolean;
  enableRealTimeStreaming: boolean;
}

export class VoiceEmotionStream {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private isStreaming = false;
  private streamId: string;
  private config: VoiceEmotionStreamConfig;
  private prosodyAnalyzer: any; // Will be imported from advancedVoiceProsody
  private emotionHistory: VoiceEmotionStreamData[] = [];
  private listeners: ((data: VoiceEmotionStreamData) => void)[] = [];

  constructor(config: Partial<VoiceEmotionStreamConfig> = {}) {
    this.config = {
      sampleRate: 44100,
      bufferSize: 2048,
      analysisInterval: 100, // 100ms intervals
      enableCrisisDetection: true,
      enableRealTimeStreaming: true,
      ...config
    };
    
    this.streamId = this.generateStreamId();
    console.log('🎤 Voice Emotion Stream initialized');
  }

  // Start real-time voice emotion streaming
  async startStreaming(): Promise<void> {
    try {
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Initialize audio context
      this.audioContext = new AudioContext({
        sampleRate: this.config.sampleRate
      });

      // Create audio nodes
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      
      // Configure analyser
      this.analyser.fftSize = this.config.bufferSize;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // Connect nodes
      this.microphone.connect(this.analyser);
      
      // Start analysis loop
      this.isStreaming = true;
      this.startAnalysisLoop();
      
      console.log('🎤 Voice emotion streaming started');
    } catch (error) {
      console.error('Failed to start voice emotion streaming:', error);
      throw error;
    }
  }

  // Stop real-time voice emotion streaming
  stopStreaming(): void {
    this.isStreaming = false;
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.microphone = null;
    this.analyser = null;
    
    console.log('🎤 Voice emotion streaming stopped');
  }

  // Add listener for real-time emotion updates
  addListener(callback: (data: VoiceEmotionStreamData) => void): void {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback: (data: VoiceEmotionStreamData) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Get emotion history
  getEmotionHistory(): VoiceEmotionStreamData[] {
    return [...this.emotionHistory];
  }

  // Get current emotional state
  getCurrentEmotionalState(): VoiceEmotionStreamData | null {
    return this.emotionHistory.length > 0 
      ? this.emotionHistory[this.emotionHistory.length - 1] 
      : null;
  }

  // Get crisis alerts
  getCrisisAlerts(): VoiceEmotionStreamData[] {
    return this.emotionHistory.filter(data => 
      data.crisisLevel === 'high' || data.crisisLevel === 'critical'
    );
  }

  // Get voice metrics history
  getVoiceMetricsHistory(): AdvancedVoiceMetrics[] {
    return this.emotionHistory.map(data => data.voiceMetrics);
  }

  // Private methods
  private startAnalysisLoop(): void {
    if (!this.analyser || !this.isStreaming) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    const analyze = () => {
      if (!this.isStreaming || !this.analyser) return;

      // Get frequency data
      this.analyser.getFloatFrequencyData(dataArray);
      
      // Convert to time domain data for analysis
      const timeData = new Float32Array(bufferLength);
      this.analyser.getFloatTimeDomainData(timeData);
      
      // Analyze voice prosody
      const voiceMetrics = this.analyzeVoiceProsody(timeData);
      
      // Detect crisis level
      const crisisLevel = this.detectCrisisLevel(voiceMetrics);
      
      // Convert to emotional state
      const emotionalState = this.convertVoiceToEmotion(voiceMetrics, crisisLevel);
      
      // Calculate confidence
      const confidence = this.calculateConfidence(voiceMetrics);
      
      // Create stream data
      const streamData: VoiceEmotionStreamData = {
        timestamp: Date.now(),
        voiceMetrics,
        emotionalState,
        crisisLevel,
        confidence,
        streamId: this.streamId
      };
      
      // Store in history
      this.emotionHistory.push(streamData);
      if (this.emotionHistory.length > 1000) {
        this.emotionHistory.shift();
      }
      
      // Notify listeners
      this.notifyListeners(streamData);
      
      // Continue analysis loop
      setTimeout(analyze, this.config.analysisInterval);
    };

    analyze();
  }

  private analyzeVoiceProsody(audioData: Float32Array): AdvancedVoiceMetrics {
    // This would use the AdvancedVoiceProsodyAnalyzer
    // For now, return simplified metrics
    const mean = audioData.reduce((a, b) => a + b, 0) / audioData.length;
    const variance = audioData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / audioData.length;
    
    return {
      prosody: {
        intonation: Math.max(-1, Math.min(1, (variance - 0.5) * 2)),
        stressPatterns: this.extractStressPatterns(audioData),
        rhythm: this.calculateRhythm(audioData),
        tempo: this.calculateTempo(audioData),
        pitchVariation: Math.min(1, variance * 10)
      },
      voiceCharacteristics: {
        tremor: Math.min(1, variance * 20),
        clarity: this.calculateClarity(audioData),
        resonance: this.calculateResonance(audioData),
        breathiness: this.detectBreathiness(audioData),
        stability: Math.max(0, 1 - variance * 20)
      },
      crisisIndicators: {
        voiceStress: Math.min(1, variance * 15),
        breathIrregularity: this.calculateBreathIrregularity(audioData),
        voiceTremor: Math.min(1, variance * 20),
        pitchInstability: Math.min(1, variance * 10),
        volumeInconsistency: this.calculateVolumeInconsistency(audioData)
      }
    };
  }

  private detectCrisisLevel(voiceMetrics: AdvancedVoiceMetrics): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    const { voiceStress, breathIrregularity, voiceTremor, pitchInstability, volumeInconsistency } = voiceMetrics.crisisIndicators;

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

    if (crisisScore >= 8) return 'critical';
    if (crisisScore >= 6) return 'high';
    if (crisisScore >= 4) return 'medium';
    if (crisisScore >= 2) return 'low';
    return 'none';
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

  private calculateConfidence(voiceMetrics: AdvancedVoiceMetrics): number {
    return 1 - voiceMetrics.voiceCharacteristics.tremor;
  }

  private notifyListeners(data: VoiceEmotionStreamData): void {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in voice emotion stream listener:', error);
      }
    });
  }

  // Helper methods for voice analysis
  private extractStressPatterns(audioData: Float32Array): number[] {
    const chunks = this.chunkArray(audioData, 256);
    return chunks.map(chunk => {
      const stress = chunk.reduce((a, b) => a + Math.abs(b), 0) / chunk.length;
      return Math.min(1, stress * 2);
    }).slice(0, 10);
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

  private calculateClarity(audioData: Float32Array): number {
    const signal = audioData.reduce((a, b) => a + Math.abs(b), 0) / audioData.length;
    const noise = this.calculateVariance(audioData);
    const clarity = signal / (noise + 0.001);
    return Math.min(1, clarity);
  }

  private calculateResonance(audioData: Float32Array): number {
    const signal = audioData.reduce((a, b) => a + Math.abs(b), 0) / audioData.length;
    const clarity = this.calculateClarity(audioData);
    return (signal + clarity) / 2;
  }

  private detectBreathiness(audioData: Float32Array): number {
    const lowFreq = audioData.filter((_, i) => i % 4 === 0);
    const breathiness = lowFreq.reduce((a, b) => a + Math.abs(b), 0) / lowFreq.length;
    return Math.min(1, breathiness * 2);
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

  private calculateVolumeInconsistency(audioData: Float32Array): number {
    const chunks = this.chunkArray(audioData, 256);
    const volumes = chunks.map(chunk => {
      return chunk.reduce((a, b) => a + Math.abs(b), 0) / chunk.length;
    });
    
    const inconsistency = this.calculateVariance(volumes);
    return Math.min(1, inconsistency * 5);
  }

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

  private generateStreamId(): string {
    return `voice-emotion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default VoiceEmotionStream;
