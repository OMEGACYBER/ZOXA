// 🎵 Voice Prosody Analyzer - Real-time voice analysis for emotional detection
// Simple, fast prosody extractor (Float32Array PCM frames). Use WebAudio client for best accuracy.

export type ProsodyFrame = {
  t: number;
  pitchHz?: number | null;
  rms: number;
  zcr: number;
  breathiness?: number;
  loudnessDb?: number;
  emotionalIndicators?: {
    stress: number;
    excitement: number;
    calmness: number;
    intensity: number;
  };
};

export class VoiceProsodyAnalyzer {
  sampleRate: number;
  frameSize: number;
  hopSize: number;

  constructor(sampleRate = 16000, frameSize = 1024, hopSize = 512) {
    this.sampleRate = sampleRate;
    this.frameSize = frameSize;
    this.hopSize = hopSize;
  }

  protected rms(frame: Float32Array) {
    let s = 0;
    for (let i = 0; i < frame.length; i++) s += frame[i] * frame[i];
    return Math.sqrt(s / frame.length);
  }

  protected zcr(frame: Float32Array) {
    let z = 0;
    for (let i = 1; i < frame.length; i++) {
      if ((frame[i - 1] >= 0 && frame[i] < 0) || (frame[i - 1] < 0 && frame[i] >= 0)) z++;
    }
    return z / frame.length;
  }

  protected detectPitch(frame: Float32Array) {
    // Simple autocorr pitch (fast). Replace with pitchfinder or WASM-based algorithm in prod.
    const sr = this.sampleRate;
    const len = frame.length;
    let minLag = Math.floor(sr / 400);
    const maxLag = Math.floor(sr / 80);
    if (minLag < 2) minLag = 2;
    let bestLag = -1;
    let best = -1e9;
    
    for (let lag = minLag; lag <= maxLag; lag++) {
      let val = 0;
      for (let i = 0; i < len - lag; i++) val += frame[i] * frame[i + lag];
      if (val > best) {
        best = val;
        bestLag = lag;
      }
    }
    
    if (bestLag <= 0) return null;
    return sr / bestLag;
  }

  protected analyzeEmotionalIndicators(frame: Float32Array, pitchHz: number | null, rms: number, zcr: number) {
    // Analyze emotional indicators from voice characteristics
    const stress = Math.min(1, Math.max(0, zcr * 3)); // Higher ZCR indicates stress
    const excitement = Math.min(1, Math.max(0, rms * 2)); // Higher RMS indicates excitement
    const calmness = Math.min(1, Math.max(0, 1 - stress - excitement * 0.5));
    const intensity = Math.min(1, Math.max(0, (stress + excitement) / 2));

    return {
      stress,
      excitement,
      calmness,
      intensity
    };
  }

  analyzeChunk(chunk: Float32Array, t0 = 0): ProsodyFrame[] {
    const out: ProsodyFrame[] = [];
    
    for (let off = 0; off + this.frameSize <= chunk.length; off += this.hopSize) {
      const frame = chunk.subarray(off, off + this.frameSize);
      const t = t0 + off / this.sampleRate;
      const rms = this.rms(frame);
      const zcr = this.zcr(frame);
      const pitchHz = this.detectPitch(frame);
      const loudnessDb = 20 * Math.log10(Math.max(1e-6, rms));
      const breathiness = Math.min(1, Math.max(0, zcr * 5)); // heuristic
      const emotionalIndicators = this.analyzeEmotionalIndicators(frame, pitchHz, rms, zcr);

      out.push({
        t,
        pitchHz,
        rms,
        zcr,
        breathiness,
        loudnessDb,
        emotionalIndicators
      });
    }
    
    return out;
  }

  // 🎭 Convert prosody frames to emotional confidence scores
  convertToEmotionalConfidence(frames: ProsodyFrame[]): Array<{emotion: string, confidence: number, intensity: number}> {
    if (frames.length === 0) return [];

    const avgStress = frames.reduce((sum, f) => sum + (f.emotionalIndicators?.stress || 0), 0) / frames.length;
    const avgExcitement = frames.reduce((sum, f) => sum + (f.emotionalIndicators?.excitement || 0), 0) / frames.length;
    const avgCalmness = frames.reduce((sum, f) => sum + (f.emotionalIndicators?.calmness || 0), 0) / frames.length;
    const avgIntensity = frames.reduce((sum, f) => sum + (f.emotionalIndicators?.intensity || 0), 0) / frames.length;

    const emotions: Array<{emotion: string, confidence: number, intensity: number}> = [];

    // Map voice characteristics to emotions
    if (avgExcitement > 0.6) {
      emotions.push({ emotion: 'joy', confidence: avgExcitement, intensity: avgIntensity });
    }
    if (avgStress > 0.6) {
      emotions.push({ emotion: 'anxiety', confidence: avgStress, intensity: avgIntensity });
    }
    if (avgCalmness > 0.7) {
      emotions.push({ emotion: 'relief', confidence: avgCalmness, intensity: avgIntensity });
    }
    if (avgIntensity > 0.8 && avgStress > 0.5) {
      emotions.push({ emotion: 'anger', confidence: avgIntensity, intensity: avgIntensity });
    }

    return emotions.sort((a, b) => b.confidence - a.confidence);
  }
}

export default VoiceProsodyAnalyzer;
