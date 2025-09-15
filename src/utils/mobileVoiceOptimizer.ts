import { Capacitor } from '@capacitor/core';

export interface MobileVoiceConfig {
  sampleRate: number;
  bufferSize: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  channelCount: number;
  latency: number;
}

export class MobileVoiceOptimizer {
  private static instance: MobileVoiceOptimizer;
  private config: MobileVoiceConfig;
  private isNative: boolean;

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.config = this.getOptimalConfig();
  }

  public static getInstance(): MobileVoiceOptimizer {
    if (!MobileVoiceOptimizer.instance) {
      MobileVoiceOptimizer.instance = new MobileVoiceOptimizer();
    }
    return MobileVoiceOptimizer.instance;
  }

  private getOptimalConfig(): MobileVoiceConfig {
    if (this.isNative) {
      // Native mobile app optimizations
      return {
        sampleRate: 16000,     // Optimal for speech recognition
        bufferSize: 1024,      // Smaller buffer for lower latency
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,       // Mono for performance
        latency: 0.05          // 50ms latency target
      };
    } else {
      // Web browser optimizations
      return {
        sampleRate: 44100,     // Standard web audio
        bufferSize: 2048,      // Standard buffer size
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
        latency: 0.1           // 100ms latency for web
      };
    }
  }

  public getMediaConstraints(): MediaStreamConstraints {
    return {
      audio: {
        echoCancellation: this.config.echoCancellation,
        noiseSuppression: this.config.noiseSuppression,
        autoGainControl: this.config.autoGainControl,
        sampleRate: this.config.sampleRate,
        channelCount: this.config.channelCount,
        // Mobile-specific constraints
        ...(this.isNative && {
          googEchoCancellation: true,
          googNoiseSuppression: true,
          googAutoGainControl: true,
          googHighpassFilter: true,
          googAudioMirroring: false
        })
      }
    };
  }

  public getAudioContextOptions(): AudioContextOptions {
    return {
      sampleRate: this.config.sampleRate,
      latencyHint: this.isNative ? 'interactive' : 'balanced'
    };
  }

  public optimizeForMobile(audioContext: AudioContext): void {
    if (this.isNative) {
      // Mobile-specific optimizations
      try {
        // Suspend/resume to optimize battery
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            audioContext.suspend();
          } else {
            audioContext.resume();
          }
        });

        // Optimize for low power mode
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
      } catch (error) {
        console.warn('Mobile optimization failed:', error);
      }
    }
  }

  public createOptimizedProcessor(audioContext: AudioContext, inputNode: AudioNode): ScriptProcessorNode {
    const processor = audioContext.createScriptProcessor(
      this.config.bufferSize,
      this.config.channelCount,
      this.config.channelCount
    );

    // Mobile-specific processing optimizations
    if (this.isNative) {
      processor.onaudioprocess = (event) => {
        // Optimized processing for mobile
        const inputBuffer = event.inputBuffer;
        const outputBuffer = event.outputBuffer;
        
        for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
          const inputData = inputBuffer.getChannelData(channel);
          const outputData = outputBuffer.getChannelData(channel);
          
          // Simple pass-through with minimal processing
          for (let sample = 0; sample < inputBuffer.length; sample++) {
            outputData[sample] = inputData[sample];
          }
        }
      };
    }

    return processor;
  }

  public getPerformanceMetrics() {
    return {
      isNative: this.isNative,
      config: this.config,
      platform: Capacitor.getPlatform(),
      optimizationLevel: this.isNative ? 'high' : 'standard'
    };
  }

  public adjustForBatteryLevel(batteryLevel: number): void {
    if (this.isNative && batteryLevel < 0.2) {
      // Low battery optimizations
      this.config.sampleRate = 8000;  // Lower quality for battery saving
      this.config.bufferSize = 2048;  // Larger buffer to reduce CPU usage
      console.log('🔋 Switched to low-power voice mode');
    }
  }

  public optimizeForNetwork(connectionType: string): void {
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      // Ultra-low bandwidth optimizations
      this.config.sampleRate = 8000;
      console.log('📶 Switched to low-bandwidth voice mode');
    }
  }
}

export const mobileVoiceOptimizer = MobileVoiceOptimizer.getInstance();
