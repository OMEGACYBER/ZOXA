// ZOXAA Voice Hook - Ultra-optimized for real-time conversation
import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EnhancedEmotionalSystem } from '@/utils/enhancedEmotionalSystem';
import { ConversationMemoryManager } from '@/utils/conversationMemory';
import { EVI3VoiceAnalyzer } from '@/utils/advancedVoiceAnalysis';
import { CrisisDetectionSystem } from '@/utils/crisisDetection';
import { useCrisis } from '@/components/crisis/CrisisProvider';
import { ZOXAA_VOICE_SYSTEM_PROMPT } from '@/utils/systemPrompts';

interface ZoxaaVoiceHookReturn {
  // Core state
  isRecording: boolean;
  isPlaying: boolean;
  currentEmotion: string;
  userEmotion: unknown;
  isListeningForInterruption: boolean;
  audioLevel: number;
  interruptedRef: React.MutableRefObject<boolean>;
  
  // Enhanced voice features
  isVoiceStreaming: boolean;
  voiceCrisisLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  voiceQuality: unknown;
  conversationInsights: unknown;
  
  // System state
  systemState: unknown;
  analytics: unknown;
  
  // Core methods
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  speakWithEmotion: (text: string, detectedUserEmotion?: unknown) => Promise<void>;
  speakFastGreeting: () => Promise<void>;
  cacheGreeting: () => Promise<void>;
  stopSpeaking: () => void;
  analyzeUserEmotion: (text: string, voiceData?: Float32Array) => Promise<unknown>;
  handleUserSpeech: (text: string) => Promise<void>;
  
  // Interruption handling
  startInterruptionListening: () => Promise<void>;
  stopInterruptionListening: () => void;
  
  // Advanced voice methods
  startVoiceStreaming: () => Promise<void>;
  stopVoiceStreaming: () => Promise<void>;
  getVoiceCrisisLevel: () => 'none' | 'low' | 'medium' | 'high' | 'critical';
  
  // System management
  getSystemStats: () => unknown;
  updateSystemConfig: (config: unknown) => void;
  setCallActive: (active: boolean) => void;
  setOnUserSpeech: (callback: (userText: string, aiResponse: string) => void) => void;
  cleanupVoiceSystem: () => Promise<void>;
}

export const useZoxaaVoice = (): ZoxaaVoiceHookReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [userEmotion, setUserEmotion] = useState<any>({
    primaryEmotion: 'neutral',
    emotionalIntensity: 0.5,
    confidence: 0.5,
    conversationHistory: [],
    userPreferences: new Map(),
  });
  const [isListeningForInterruption, setIsListeningForInterruption] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isVoiceStreaming, setIsVoiceStreaming] = useState(false);
  const [voiceCrisisLevel, setVoiceCrisisLevel] = useState<'none' | 'low' | 'medium' | 'high' | 'critical'>('none');
  
  const { reportCrisis } = useCrisis();
  const [voiceQuality, setVoiceQuality] = useState<any>({
    clarity: 0.8,
    stability: 0.7,
    emotionalAccuracy: 0.6,
    timestamp: Date.now()
  });
  const [conversationInsights, setConversationInsights] = useState<any>({
    engagement: 0.7,
      emotionalTrend: 'stable',
      topicContext: '',
    responseQuality: 0.8
  });
  const [systemState, setSystemState] = useState<any>({
    isInitialized: false,
    isHealthy: true,
    lastError: null,
    uptime: 0
  });
  const [analytics, setAnalytics] = useState<any>({
    totalInteractions: 0,
    averageResponseTime: 0,
    successRate: 0.95,
    lastUpdated: Date.now(),
    // Enhanced performance metrics
    audioLatency: 0,
    emotionAccuracy: 0,
    cacheHitRate: 0,
    errorRate: 0,
    batteryUsage: 0,
    networkEfficiency: 0
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const emotionalSystemRef = useRef<EnhancedEmotionalSystem | null>(null);
  const memoryManagerRef = useRef<ConversationMemoryManager | null>(null);
  const voiceAnalyzerRef = useRef<EVI3VoiceAnalyzer | null>(null);
  const crisisDetectionRef = useRef<CrisisDetectionSystem | null>(null);
  const interruptedRef = useRef(false);
  const onUserSpeechRef = useRef<((userText: string, aiResponse: string) => void) | null>(null);
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const interruptionStreamRef = useRef<MediaStream | null>(null);

  // Define missing variables using useRef to maintain state across renders
  const hasSpokenRef = useRef(false);
  const consecutiveSilenceRef = useRef(0);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callActiveRef = useRef(false);
  const isStoppingRecordingRef = useRef(false);

  // Pre-cached greeting for instant response
  const cachedGreetingRef = useRef<string | null>(null);
  const isGreetingCachedRef = useRef(false);
  
  // Emotion caching system for instant responses
  const emotionCacheRef = useRef<Map<string, any>>(new Map());
  const emotionCacheTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const EMOTION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // Retry logic with exponential backoff
  const retryWithBackoff = useCallback(async (fn: Function, maxRetries = 3, baseDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        const delay = Math.pow(2, i) * baseDelay;
        console.log(`🔄 Retry ${i + 1}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, []);
  
  // Adaptive quality based on network conditions
  const getAdaptiveQuality = useCallback(() => {
    const connection = (navigator as any).connection;
    if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
      return { maxTokens: 80, speed: 1.3, sampleRate: 8000 };
    } else if (connection?.effectiveType === '3g') {
      return { maxTokens: 120, speed: 1.2, sampleRate: 16000 };
    } else {
      return { maxTokens: 180, speed: 1.1, sampleRate: 16000 };
    }
  }, []);

  // Cache greeting on initialization
  const cacheGreeting = useCallback(async () => {
    try {
      console.log('🗣️ Caching greeting for instant response...');
      const greetingText = "Hey! I'm ZOXAA. How are you feeling?";
      
      const resp = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: greetingText,
          voice: 'nova',
          speed: 1.2,
          pitch: 1.0,
          volume: 1.0,
          emotion: 'friendly',
          ssml: false,
          emotionalModulation: false,
        }),
      });
      
      if (!resp.ok) throw new Error(`TTS error: ${resp.statusText}`);
      const blob = await resp.blob();
      const audioUrl = URL.createObjectURL(blob);
      cachedGreetingRef.current = audioUrl;
      isGreetingCachedRef.current = true;
      console.log('✅ Greeting cached successfully');
    } catch (error) {
      console.error('❌ Failed to cache greeting:', error);
    }
  }, []);

  // Helper function to determine if speech is likely complete
  const isLikelyCompleteThought = (text: string): boolean => {
    const trimmedText = text.trim();
    
    // If very short, likely incomplete
    if (trimmedText.length < 3) return false;
    
    // Check for common sentence endings
    const endsWithPeriod = trimmedText.endsWith('.');
    const endsWithQuestion = trimmedText.endsWith('?');
    const endsWithExclamation = trimmedText.endsWith('!');
    
    // Check for natural pause indicators
    const hasNaturalPause = trimmedText.includes(',') || 
                           trimmedText.includes(';') || 
                           trimmedText.includes(':') ||
                           trimmedText.includes('...');
    
    // If ends with punctuation, likely complete
    if (endsWithPeriod || endsWithQuestion || endsWithExclamation) return true;
    
    // If has natural pause and is longer than 10 characters, likely complete
    if (hasNaturalPause && trimmedText.length > 10) return true;
    
    // If longer than 20 characters without punctuation, assume complete
    if (trimmedText.length > 20) return true;
    
    return false;
  };

  // Performance monitoring for real-time optimization
  const performanceMetricsRef = useRef({
    ttsGenerationTime: 0,
    speechDetectionTime: 0,
    totalResponseTime: 0,
    audioProcessingTime: 0,
    lastInteractionTime: 0
  });

  // Enhanced performance tracking
  const trackPerformance = useCallback((metric: string, startTime: number) => {
    const duration = Date.now() - startTime;
    performanceMetricsRef.current[metric as keyof typeof performanceMetricsRef.current] = duration;
    
    // Log performance for optimization
    if (duration > 100) { // Only log slow operations
      console.log(`⚡ Performance: ${metric} took ${duration}ms`);
    }
    
    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      averageResponseTime: (prev.averageResponseTime + duration) / 2,
      lastUpdated: Date.now()
    }));
  }, []);

  // Optimized audio processing for Vercel Edge Functions
  const processAudioOptimized = useCallback(async (audioBlob: Blob): Promise<string> => {
    const startTime = Date.now();
    
    try {
      // Convert to base64 with optimized encoding
      const base64Audio = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(audioBlob);
      });

      // Determine format from MIME type
      const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
      const audioFormat = mimeType.includes('webm') ? 'webm' : 
                         mimeType.includes('mp4') ? 'mp4' : 
                         mimeType.includes('ogg') ? 'ogg' : 'webm';

      // Send to STT API with optimized payload
      const response = await fetch('/api/stt', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache' // Ensure fresh processing
        },
        body: JSON.stringify({
          audioData: base64Audio,
          audioFormat: audioFormat
        })
      });

      if (!response.ok) {
        throw new Error(`STT API error: ${response.statusText}`);
      }

      const result = await response.json();
      const transcribedText = result.text;

      trackPerformance('audioProcessingTime', startTime);
      return transcribedText;

    } catch (error) {
      console.error('Optimized audio processing error:', error);
      throw error;
    }
  }, [trackPerformance]);

  // Real-time health monitoring
  const startHealthMonitoring = useCallback(() => {
    const healthInterval = setInterval(() => {
      try {
        const health = {
          audioContext: audioContextRef.current?.state,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
          networkLatency: 0, // Will be measured on next API call
          batteryLevel: 0, // Will be measured if available
          cacheSize: emotionCacheRef.current.size,
          systemUptime: Date.now() - (systemState.uptime || Date.now())
        };
        
        // Auto-resume suspended audio context
        if (health.audioContext === 'suspended' && audioContextRef.current) {
          audioContextRef.current.resume();
          console.log('🔄 Auto-resumed suspended AudioContext');
        }
        
        // Monitor memory usage
        if (health.memoryUsage > 50 * 1024 * 1024) { // 50MB threshold
          console.warn('⚠️ High memory usage detected:', Math.round(health.memoryUsage / 1024 / 1024), 'MB');
        }
        
        // Update system state
        setSystemState(prev => ({
          ...prev,
          isHealthy: health.audioContext === 'running',
          lastError: health.audioContext === 'suspended' ? 'AudioContext suspended' : null,
          uptime: health.systemUptime
        }));
        
      } catch (error) {
        console.error('Health monitoring error:', error);
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(healthInterval);
  }, [systemState.uptime]);

  // Initialize system
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        console.log('🎤 Initializing ZOXAA Voice System...');
        
        // Initialize AI systems
        emotionalSystemRef.current = new EnhancedEmotionalSystem(true);
        memoryManagerRef.current = ConversationMemoryManager.getInstance();
        voiceAnalyzerRef.current = new EVI3VoiceAnalyzer();
        crisisDetectionRef.current = new CrisisDetectionSystem();
        
        // Initialize audio context
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          console.log('🎤 AudioContext initialized:', !!audioContextRef.current);
        }
        
        // Initialize analyzer node
        if (!analyserRef.current && audioContextRef.current) {
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          console.log('🎤 AnalyserNode initialized:', !!analyserRef.current);
        }
        
        // Cache greeting for instant response
        await cacheGreeting();
        
        // Start real-time health monitoring
        startHealthMonitoring();
        
        setSystemState(prev => ({ ...prev, isInitialized: true }));
        console.log('🎤 ZOXAA Voice System initialized successfully');
      } catch (error) {
        console.error('Failed to initialize voice system:', error);
        setSystemState(prev => ({ 
          ...prev, 
          isInitialized: false, 
          isHealthy: false, 
          lastError: error.message 
        }));
        
        toast({
          title: "Voice System Error",
          description: "Failed to initialize voice capabilities",
          variant: "destructive"
        });
      }
    };
    
    initializeSystem();
    
    return () => {
      // Cleanup on unmount
      try {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.src = '';
          currentAudioRef.current = null;
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        if (audioLevelIntervalRef.current) {
          clearInterval(audioLevelIntervalRef.current);
        }
        if (audioContextRef.current) {
          // Check if AudioContext is not already closed
          if (audioContextRef.current.state !== 'closed') {
            try {
              // Use .then() instead of await for non-async function
              audioContextRef.current.close().catch((error) => {
                console.warn('AudioContext close error:', error);
              });
            } catch (error) {
              console.warn('AudioContext close error:', error);
            }
          }
        }
        // Cleanup emotional system if needed
        if (emotionalSystemRef.current) {
          // Cleanup will be handled by garbage collection
        }
      } catch (e) {
        console.warn('Cleanup error:', e);
      }
    };
  }, [toast]);

  // Start recording with microphone
  const startRecording = useCallback(async (): Promise<void> => {
    try {
      if (isRecording) {
        console.log('Already recording');
        return;
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });

      // Set up audio analysis for level monitoring
      if (audioContextRef.current && analyserRef.current) {
        microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
        microphoneRef.current.connect(analyserRef.current);
        
        // Monitor audio levels
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        audioLevelIntervalRef.current = setInterval(() => {
          // Stop processing if call is not active
          if (!callActiveRef.current) {
            console.log('🎤 Stopping audio monitoring - call not active');
            if (audioLevelIntervalRef.current) {
              clearInterval(audioLevelIntervalRef.current);
              audioLevelIntervalRef.current = null;
            }
            return;
          }
          
          analyserRef.current!.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const level = average / 255;
          setAudioLevel(level);
          
          // Debug: Log audio level more frequently and show raw data
          if (Math.random() < 0.3) { // ~30% chance = ~every 50ms
            const maxLevel = Math.max(...dataArray) / 255;
            const minLevel = Math.min(...dataArray) / 255;
            console.log('🎤 Audio level:', level.toFixed(3), 'Max:', maxLevel.toFixed(3), 'Min:', minLevel.toFixed(3), 'Average:', average);
          }

          // Simple speech detection - the main process
          if (level > 0.005) { // Even lower threshold for testing
            if (!hasSpokenRef.current) {
              console.log('🎤 Speech detected! Level:', level.toFixed(3));
            }
            hasSpokenRef.current = true;
            consecutiveSilenceRef.current = 0;
            
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
          } else if (hasSpokenRef.current) {
            consecutiveSilenceRef.current++;
            
            // Debug silence counting
            if (consecutiveSilenceRef.current % 2 === 0) { // Log every 2nd silence
              console.log('🎤 Silence count:', consecutiveSilenceRef.current, 'Level:', level.toFixed(3));
            }
            
            // Process after shorter silence for testing (50ms)
            if (consecutiveSilenceRef.current >= 3 && !silenceTimerRef.current) { // 3 * 16ms = ~50ms
              console.log('🎤 Processing speech after silence...');
              silenceTimerRef.current = setTimeout(async () => {
                try {
                  console.log('🎤 Starting transcription...');
                  const transcribedText = await stopRecording();
                  if (!callActiveRef.current) {
                    console.log('🎤 Ignoring transcription - call ended');
                    return;
                  }
                  
                  if (transcribedText && transcribedText.trim()) {
                    console.log('🎤 User said:', transcribedText);
                    
                    // Process the speech
                    if (interruptedRef?.current) {
                      interruptedRef.current = false;
                      await handleUserSpeech(`Oh okay, so ${transcribedText}`);
                    } else {
                      await handleUserSpeech(transcribedText);
                    }
                  } else {
                    console.log('🎤 No transcription received, restarting recording...');
                  }
                  
                  // Restart recording after processing
                  setTimeout(() => {
                    if (callActiveRef.current && !isRecording) {
                      console.log('🎤 Restarting recording after processing...');
                      startRecording().catch((err) => {
                        console.error('Failed to restart recording:', err);
                      });
                    }
                  }, 50); // Faster restart
                } catch (err) {
                  console.error('Failed to process speech:', err);
                  // Restart recording on error
                  setTimeout(() => {
                    if (callActiveRef.current && !isRecording) {
                      console.log('🎤 Restarting recording after error...');
                      startRecording().catch(() => {});
                    }
                  }, 50);
                }
              }, 50); // Faster processing delay for testing
            }
          }
        }, 16); // Normal monitoring interval
      }

      // Set up MediaRecorder for audio capture
      // Try different MIME types for best compatibility
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus'
      ];
      
      let selectedMimeType = null;
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      
      if (!selectedMimeType) {
        throw new Error('No supported audio MIME type found');
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: selectedMimeType
      });

      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      console.log('🎤 Recording started');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
      throw error;
    }
  }, [isRecording, toast]);

  // Correct try-catch block syntax in stopRecording
  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Prevent multiple simultaneous stopRecording calls
      if (isStoppingRecordingRef.current) {
        console.warn('StopRecording already in progress, ignoring duplicate call');
        reject(new Error('Already stopping recording'));
        return;
      }

      // More robust check - only check if MediaRecorder exists and is in recording state
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
        console.warn('StopRecording called but not actively recording:', {
          hasMediaRecorder: !!mediaRecorderRef.current,
          recorderState: mediaRecorderRef.current?.state,
          isRecordingState: isRecording
        });
        reject(new Error('Not recording'));
        return;
      }

      isStoppingRecordingRef.current = true;

      mediaRecorderRef.current.onstop = async () => {
        try {
          // Stop audio level monitoring
          if (audioLevelIntervalRef.current) {
            clearInterval(audioLevelIntervalRef.current);
            audioLevelIntervalRef.current = null;
          }

          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
          });
          
          // Debug: Log audio data size and format
          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const audioFormat = mimeType.includes('webm') ? 'webm' : 
                            mimeType.includes('mp4') ? 'mp4' : 
                            mimeType.includes('ogg') ? 'ogg' : 'webm';
          console.log('🎤 Audio data size:', audioBlob.size, 'Format:', audioFormat);
          
          // Use optimized audio processing
          const transcribedText = await processAudioOptimized(audioBlob);

          console.log('🎤 Transcribed:', transcribedText);
          
          setIsRecording(false);
          isStoppingRecordingRef.current = false;
          resolve(transcribedText);
          
        } catch (error) {
          console.error('Recording stop error:', error);
          setIsRecording(false);
          isStoppingRecordingRef.current = false;
          reject(error);
        }
      };

      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    });
  }, [isRecording, processAudioOptimized]);

  // NOTE: Legacy single-shot TTS speakWithEmotion removed in favor of advanced chunked/barge-in version.

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Analyze user emotion with caching for instant responses
  const analyzeUserEmotion = useCallback(async (text: string, voiceData?: Float32Array) => {
    try {
      if (!emotionalSystemRef.current) {
        throw new Error('Emotional system not initialized');
      }

      // Check cache first for instant response
      const cacheKey = `${text.substring(0, 50)}_${voiceData ? 'voice' : 'text'}`;
      const cachedEmotion = emotionCacheRef.current.get(cacheKey);
      
      if (cachedEmotion) {
        console.log('⚡ Using cached emotion analysis:', cachedEmotion.primaryEmotion);
        setCurrentEmotion(cachedEmotion.primaryEmotion);
        setUserEmotion(cachedEmotion);
        return cachedEmotion;
      }

      // Analyze emotion if not cached
      const emotionalState = await emotionalSystemRef.current.analyzeEmotion(text, `session_${Date.now()}`);
      
      // Cache the result
      emotionCacheRef.current.set(cacheKey, emotionalState);
      
      // Set cache timeout for cleanup
      const timeout = setTimeout(() => {
        emotionCacheRef.current.delete(cacheKey);
        emotionCacheTimeoutRef.current.delete(cacheKey);
      }, EMOTION_CACHE_DURATION);
      
      emotionCacheTimeoutRef.current.set(cacheKey, timeout);
      
      setCurrentEmotion(emotionalState.primaryEmotion);
      setUserEmotion(emotionalState);
      
      return emotionalState;
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      return null;
    }
  }, []);



  // Enhanced voice settings based on emotion for better human-like responses
  const getVoiceSettings = useCallback((emotion?: unknown) => {
    const baseSettings = {
      voice: 'nova',
      speed: 1.1, // Slightly faster base speed for better responsiveness
      pitch: 1.0,
      volume: 1.0,
      emotion: 'neutral'
    };

    if (!emotion) return baseSettings;

    // Enhanced emotional voice mapping for more human-like responses
    switch (emotion.primaryEmotion?.toLowerCase()) {
      case 'happy':
        return { ...baseSettings, speed: 1.15, pitch: 1.08, emotion: 'happy' };
      case 'sad':
        return { ...baseSettings, speed: 0.95, pitch: 0.92, emotion: 'sad' };
      case 'excited':
        return { ...baseSettings, speed: 1.25, pitch: 1.12, emotion: 'excited' };
      case 'calm':
        return { ...baseSettings, speed: 1.05, pitch: 0.98, emotion: 'calm' };
      case 'concerned':
        return { ...baseSettings, speed: 0.98, pitch: 0.95, emotion: 'concerned' };
      case 'angry':
        return { ...baseSettings, speed: 1.12, pitch: 1.1, emotion: 'angry' };
      case 'surprised':
        return { ...baseSettings, speed: 1.2, pitch: 1.15, emotion: 'surprised' };
      case 'fear':
        return { ...baseSettings, speed: 1.08, pitch: 1.18, emotion: 'fear' };
      case 'disgust':
        return { ...baseSettings, speed: 0.9, pitch: 0.88, emotion: 'disgust' };
      case 'pride':
        return { ...baseSettings, speed: 1.18, pitch: 1.1, emotion: 'pride' };
      case 'relief':
        return { ...baseSettings, speed: 1.02, pitch: 1.02, emotion: 'relief' };
      default:
        return baseSettings;
    }
  }, []);

  // Interruption handling
  const startInterruptionListening = useCallback(async (): Promise<void> => {
    try {
      if (isListeningForInterruption) return;
      
      // If we're already recording, the recording system handles audio level monitoring
      // so we don't need separate interruption listening
      if (isRecording) {
        console.log('🎤 Skipping interruption listening - already recording');
        return;
      }
      
      // Try to reuse existing recording stream if available
      let stream: MediaStream;
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        stream = mediaRecorderRef.current.stream;
        console.log('🎤 Reusing existing recording stream for interruption listening');
      } else {
        // Use mobile-optimized audio constraints
      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000, // Lower for mobile performance
        channelCount: 1, // Mono for efficiency
      };
      
      stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
        console.log('🎤 Created new stream for interruption listening');
      }
      interruptionStreamRef.current = stream;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      setIsListeningForInterruption(true);
      
      const loop = () => {
        if (!isListeningForInterruption) return;
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(average / 255);
        // If user speaks while we are playing audio, barge-in
        if (isPlaying && average / 255 > 0.18) {
          interruptedRef.current = true;
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.src = '';
            currentAudioRef.current = null;
          }
          setIsPlaying(false);
          // stop listening after interruption detected
          if (interruptionStreamRef.current) {
            interruptionStreamRef.current.getTracks().forEach(t => t.stop());
            interruptionStreamRef.current = null;
          }
          setIsListeningForInterruption(false);
          return;
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    } catch (e) {
      console.warn('Interruption listening unavailable:', e);
    }
  }, [isListeningForInterruption, isPlaying]);

  const stopInterruptionListening = useCallback(() => {
    setIsListeningForInterruption(false);
    if (interruptionStreamRef.current) {
      interruptionStreamRef.current.getTracks().forEach(t => t.stop());
      interruptionStreamRef.current = null;
    }
    interruptedRef.current = false;
  }, []);

  // Split text into optimized chunks for streaming TTS
  const splitTextIntoChunks = (text: string, maxLen = 80): string[] => {
    // Optimized sentence splitting for streaming
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    
    for (const sentence of sentences) {
      if (sentence.trim().length === 0) continue;
      
      // If sentence is short enough, keep it as one chunk
      if (sentence.trim().length <= maxLen) {
        chunks.push(sentence.trim());
      } else {
        // Smart word splitting for optimal streaming
        const words = sentence.split(' ');
        let currentChunk = '';
        
        for (const word of words) {
          if ((currentChunk + ' ' + word).trim().length <= maxLen) {
            currentChunk = (currentChunk + ' ' + word).trim();
          } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = word;
          }
        }
        
        if (currentChunk) chunks.push(currentChunk);
      }
    }
    
    return chunks.length ? chunks : [text];
  };
  
  // Streaming TTS implementation for faster response
  const streamTTS = useCallback(async (text: string, emotion?: unknown) => {
    try {
      const chunks = splitTextIntoChunks(text, 60); // Smaller chunks for streaming
      console.log('🎵 Streaming TTS with', chunks.length, 'chunks');
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        // Skip empty chunks
        if (!chunk.trim()) continue;
        
        // Generate TTS for this chunk
        const voiceSettings = getVoiceSettings(emotion);
        const adaptiveQuality = getAdaptiveQuality();
        
        const resp = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: chunk,
            voice: voiceSettings.voice,
            speed: voiceSettings.speed * adaptiveQuality.speed,
            pitch: voiceSettings.pitch,
            volume: voiceSettings.volume,
            emotion: voiceSettings.emotion,
            ssml: false,
            emotionalModulation: true,
          }),
        });
        
        if (!resp.ok) throw new Error(`TTS error: ${resp.statusText}`);
        const blob = await resp.blob();
        const audioUrl = URL.createObjectURL(blob);
        
        // Play chunk immediately
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
        
        // Small delay between chunks for natural flow
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      console.log('✅ Streaming TTS completed');
    } catch (error) {
      console.error('❌ Streaming TTS error:', error);
      throw error;
    }
  }, [getVoiceSettings, getAdaptiveQuality]);

  // Queue for sequential playback of chunks
  const ttsQueueRef = useRef<string[]>([]);
  const isPlayingQueueRef = useRef(false);

  const playQueueSequentially = useCallback(async () => {
    if (isPlayingQueueRef.current) return;
    isPlayingQueueRef.current = true;
    try {
      while (ttsQueueRef.current.length > 0) {
        const audioUrl = ttsQueueRef.current.shift()!;
        if (!audioUrl) break;
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.src = '';
        }
        currentAudioRef.current = new Audio(audioUrl);
        currentAudioRef.current.playbackRate = Math.max(0.5, Math.min(2.0,  (currentAudioRef.current.playbackRate || 1)));
        currentAudioRef.current.volume = Math.max(0, Math.min(1, (currentAudioRef.current.volume || 1)));
        await new Promise<void>((resolve, reject) => {
          const audioEl = currentAudioRef.current!;
          const handleEnded = () => {
            audioEl.removeEventListener('ended', handleEnded);
            audioEl.removeEventListener('error', handleError);
            resolve();
          };
          const handleError = () => {
            audioEl.removeEventListener('ended', handleEnded);
            audioEl.removeEventListener('error', handleError);
            reject(new Error('Audio playback error'));
          };
          audioEl.addEventListener('ended', handleEnded);
          audioEl.addEventListener('error', handleError);
          audioEl.play().catch(reject);
        });
        URL.revokeObjectURL(audioUrl);
        if (interruptedRef.current) {
          ttsQueueRef.current = [];
          break;
        }
      }
    } catch (e) {
      console.warn('Queue playback error:', e);
    } finally {
      isPlayingQueueRef.current = false;
      setIsPlaying(false);
      // Only stop interruption listening if we're not recording
      if (!isRecording) {
        stopInterruptionListening();
      }
    }
  }, [stopInterruptionListening, isRecording]);

  // Enhanced TTS with streaming capabilities
  const speakWithEmotionEnhanced = useCallback(async (text: string, detectedUserEmotion?: unknown) => {
    const startTime = Date.now();
    
    try {
      // If already playing, stop and reset
      if (isPlaying) {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.src = '';
        }
        setIsPlaying(false);
      }

      setIsPlaying(true);
      const voiceSettings = getVoiceSettings(detectedUserEmotion);

      // Start barge-in listening only if not already recording
      if (!isRecording) {
        await startInterruptionListening();
      }

      // Use streaming TTS for faster response
      if (text.length > 100) {
        console.log('🎵 Using streaming TTS for long response');
        await streamTTS(text, detectedUserEmotion);
      } else {
        // Use regular TTS for short responses
        const adaptiveQuality = getAdaptiveQuality();
        const resp = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text,
            voice: voiceSettings.voice,
            speed: voiceSettings.speed * adaptiveQuality.speed,
            pitch: voiceSettings.pitch,
            volume: voiceSettings.volume,
            emotion: voiceSettings.emotion,
            ssml: false,
            emotionalModulation: true, // Enable for better human-like voice
          }),
        });
        
        if (!resp.ok) throw new Error(`TTS error: ${resp.statusText}`);
        const blob = await resp.blob();
        const audioUrl = URL.createObjectURL(blob);
        
        // Optimized audio playback with better error handling
        const audio = new Audio(audioUrl);
        audio.preload = 'auto';
        audio.volume = 1.0;
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsPlaying(false);
        };
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          URL.revokeObjectURL(audioUrl);
          setIsPlaying(false);
        };
        audio.onloadstart = () => {
          console.log('🎵 Audio loading started');
        };
        audio.oncanplay = () => {
          console.log('🎵 Audio ready to play');
        };
        
        await audio.play();
      }
      
      trackPerformance('totalResponseTime', startTime);
      
    } catch (error) {
      console.error('Failed to speak with emotion:', error);
      setIsPlaying(false);
      stopInterruptionListening();
      toast({
        title: 'Voice Generation Error',
        description: 'I could not generate a voice response. Please try again.',
        variant: 'destructive'
      });
    }
  }, [isPlaying, getVoiceSettings, startInterruptionListening, stopInterruptionListening, toast, isRecording, trackPerformance, streamTTS, getAdaptiveQuality]);

  // Helper function to play individual audio chunks
  const playAudioChunk = async (audioUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = '';
      }
      
      currentAudioRef.current = new Audio(audioUrl);
      currentAudioRef.current.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      currentAudioRef.current.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Audio playback error'));
      };
      currentAudioRef.current.play().catch(reject);
    });
  };

  // Fast greeting system for instant response
  const speakFastGreeting = useCallback(async () => {
    try {
      console.log('🗣️ Speaking fast greeting...');
      setIsPlaying(true);
      
      // Use cached greeting if available for instant response
      if (isGreetingCachedRef.current && cachedGreetingRef.current) {
        console.log('🗣️ Using cached greeting for instant response...');
        const audio = new Audio(cachedGreetingRef.current);
        audio.onended = () => {
          setIsPlaying(false);
        };
        audio.onerror = () => {
          setIsPlaying(false);
        };
        await audio.play();
        console.log('✅ Cached greeting played instantly');
        return;
      }
      
      // Generate dynamic greeting using OpenAI API
      console.log('🗣️ Generating dynamic greeting with OpenAI...');
      let greetingText = "Hey! I'm ZOXAA. How are you feeling?"; // Default fallback
      
      try {
        const greetingResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Give me a warm, friendly greeting as ZOXAA. Keep it short and natural, like a real friend saying hello.' }],
            systemPrompt: ZOXAA_VOICE_SYSTEM_PROMPT
          })
        });

        if (!greetingResponse.ok) {
          throw new Error(`Greeting API error: ${greetingResponse.statusText}`);
        }

        const greetingData = await greetingResponse.json();
        greetingText = greetingData.response || "Hey! I'm ZOXAA. How are you feeling?";
        console.log('🗣️ Dynamic greeting generated:', greetingText);
      } catch (error) {
        console.error('❌ Failed to generate dynamic greeting, using fallback:', error);
      }
      
      // Use the fastest TTS settings
      const resp = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: greetingText,
          voice: 'nova', // Fast voice
          speed: 1.2, // Slightly faster
          pitch: 1.0,
          volume: 1.0,
          emotion: 'friendly',
          ssml: false,
          emotionalModulation: true, // Enable for better human-like voice
        }),
      });
      
      if (!resp.ok) throw new Error(`TTS error: ${resp.statusText}`);
      const blob = await resp.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      // Play immediately
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsPlaying(false);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setIsPlaying(false);
      };
      
      await audio.play();
      console.log('✅ Fast greeting spoken successfully');
      
    } catch (error) {
      console.error('❌ Failed to speak fast greeting:', error);
      setIsPlaying(false);
    }
  }, []);

  // Predictive response system for faster conversation
  const predictResponse = useCallback(async (userText: string) => {
    try {
      // Start generating response in background while user might still be speaking
      const responsePromise = fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: userText }], 
          systemPrompt: ZOXAA_VOICE_SYSTEM_PROMPT
        })
      });

      // Wait a bit to see if user continues speaking
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // If user is still speaking, wait for complete speech
      if (hasSpokenRef.current) {
        console.log('🎤 User still speaking, waiting for complete speech...');
        return null; // Will be handled by complete speech
      }
      
      // User finished speaking, use the predicted response
      const response = await responsePromise;
      if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Predictive response error:', error);
      return null;
    }
  }, []);

  // Handle user speech with emotion analysis and real-time chat
  const handleUserSpeech = useCallback(async (text: string) => {
    // Don't process speech if call is not active
    if (!callActiveRef.current) {
      console.log('🎤 Ignoring user speech - call not active');
      return;
    }
    
    try {
      console.log('🎤 Handling user speech:', text);
      
      // Double-check call is still active before proceeding
      if (!callActiveRef.current) {
        console.log('🎤 Call ended during processing, stopping');
        return;
      }
      
      // Analyze user emotion from speech
      const emotion = await analyzeUserEmotion(text);
      
      // Update analytics
      setAnalytics(prev => ({
        ...prev,
        totalInteractions: prev.totalInteractions + 1,
        lastUpdated: Date.now()
      }));
      
      // Update conversation memory if available
      if (memoryManagerRef.current) {
        memoryManagerRef.current.updateMemory('default_user', {
          message: text,
          emotion: emotion?.primaryEmotion || 'neutral',
          emotionalIntensity: emotion?.emotionalIntensity || 0.5,
          topics: [text] // Simple topic extraction
        });
      }
      
      // Analyze voice patterns if available
      if (voiceAnalyzerRef.current) {
        const emotionalState = voiceAnalyzerRef.current.analyzeEmotionalState(text);
        console.log('🎤 Voice emotional state:', emotionalState);
      }
      
      // Check for crisis indicators
      let crisisResult = { crisisLevel: 'none' as 'none' | 'low' | 'medium' | 'high' | 'critical' };
      if (crisisDetectionRef.current) {
        crisisResult = crisisDetectionRef.current.detectCrisis(text);
        if (crisisResult.crisisLevel !== 'none') {
          setVoiceCrisisLevel(crisisResult.crisisLevel as 'none' | 'low' | 'medium' | 'high' | 'critical');
          console.warn('🚨 Crisis level detected:', crisisResult);
          
          // Extract indicators from the crisis result
          const indicators: string[] = [];
          if ((crisisResult as any).textIndicators) {
            const textIndicators = (crisisResult as any).textIndicators;
            if (textIndicators.suicidalIdeation > 0.3) indicators.push('Suicidal ideation detected');
            if (textIndicators.selfHarm > 0.3) indicators.push('Self-harm references');
            if (textIndicators.hopelessness > 0.5) indicators.push('Expressions of hopelessness');
            if (textIndicators.isolation > 0.4) indicators.push('Social isolation mentioned');
            if (textIndicators.acuteDistress > 0.6) indicators.push('Acute emotional distress');
          }
          
          // Report crisis through voice interaction
          reportCrisis(
            crisisResult.crisisLevel as any,
            indicators.length > 0 ? indicators : ['Crisis indicators detected in voice'],
            text
          );
        }
      }

      // Check again before generating AI response
      if (!callActiveRef.current) {
        console.log('🎤 Call ended before AI response generation, stopping');
        return;
      }
      
      // Generate AI response using chat API
      try {
        console.log('🤖 Generating AI response for:', text);
        const systemPrompt = ZOXAA_VOICE_SYSTEM_PROMPT;

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: [{ role: 'user', content: text }], 
            systemPrompt 
          })
        });

        if (!response.ok) {
          throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = data.response || "I hear you, and I'm here for you.";

        console.log('🤖 AI Response received:', aiResponse);

        // Check again before speaking
        if (!callActiveRef.current) {
          console.log('🎤 Call ended before speaking response, stopping');
          return;
        }

        // Speak the AI response with appropriate emotion
        console.log('🗣️ Speaking AI response...');
        await speakWithEmotionEnhanced(aiResponse, emotion);

        console.log('🤖 AI Response:', aiResponse);
        
        // Call onUserSpeech callback if provided and call is still active
        if (onUserSpeechRef.current && callActiveRef.current) {
          onUserSpeechRef.current(text, aiResponse);
        }

      } catch (chatError) {
        console.error('Error getting AI response:', chatError);
        
        // Don't speak fallback response if call has ended
        if (!callActiveRef.current) {
          console.log('🎤 Call ended during error handling, stopping');
          return;
        }
        
        const fallbackResponse = "I'm having trouble connecting right now, but I'm here for you.";
        await speakWithEmotionEnhanced(fallbackResponse, emotion);
        
        if (onUserSpeechRef.current && callActiveRef.current) {
          onUserSpeechRef.current(text, fallbackResponse);
        }
      }
      
    } catch (error) {
      console.error('Error handling user speech:', error);
    }
  }, [analyzeUserEmotion, speakWithEmotionEnhanced]);

  // Voice streaming
  const startVoiceStreaming = useCallback(async (): Promise<void> => {
    try {
      setIsVoiceStreaming(true);
      await startInterruptionListening();
      
      toast({
        title: "Voice Intelligence Streaming Active",
        description: "Real-time voice emotion analysis enabled"
      });
      
    } catch (error) {
      console.error('Failed to start voice streaming:', error);
      setIsVoiceStreaming(false);
      toast({
        title: "Voice Streaming Error",
        description: "Could not start real-time voice analysis",
        variant: "destructive"
      });
    }
  }, [startInterruptionListening, toast]);

  const stopVoiceStreaming = useCallback(async (): Promise<void> => {
    setIsVoiceStreaming(false);
    stopInterruptionListening();
  }, [stopInterruptionListening]);

  // Get voice crisis level
  const getVoiceCrisisLevel = useCallback((): 'none' | 'low' | 'medium' | 'high' | 'critical' => {
    return voiceCrisisLevel;
  }, [voiceCrisisLevel]);

  // Get system statistics
  const getSystemStats = useCallback((): unknown => {
    if (!emotionalSystemRef.current) {
      return { error: 'System not initialized' };
    }
    
    return {
      isInitialized: true,
      isHealthy: true,
      totalInteractions: analytics.totalInteractions,
      successRate: analytics.successRate
    };
  }, [analytics]);

  // Update system configuration
  const updateSystemConfig = useCallback((config: unknown) => {
    console.log('Updating system config:', config);
    // Implementation for system configuration updates
  }, []);

  // Set call active state
  const setCallActive = useCallback((active: boolean) => {
    callActiveRef.current = active;
    console.log('🎤 Call active state changed:', active);
  }, []);

  // Set callback for user speech events
  const setOnUserSpeech = useCallback((callback: (userText: string, aiResponse: string) => void) => {
    onUserSpeechRef.current = callback;
  }, []);

  // Comprehensive cleanup of voice system with cache management
  const cleanupVoiceSystem = useCallback(async () => {
    try {
      console.log('🧹 Cleaning up voice system...');
      
      // Stop all media streams
      if (microphoneRef.current) {
        microphoneRef.current.disconnect();
        microphoneRef.current = null;
      }
      
      // Stop current audio playback
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = '';
        currentAudioRef.current = null;
      }
      
      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      // Clear intervals
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
        audioLevelIntervalRef.current = null;
      }
      
      // Close AudioContext safely
      if (audioContextRef.current) {
        // Check if AudioContext is not already closed
        if (audioContextRef.current.state !== 'closed') {
          try {
            await audioContextRef.current.close();
          } catch (error) {
            console.warn('AudioContext close error:', error);
          }
        }
      }
      
      // Clear emotion cache and timeouts
      emotionCacheRef.current.clear();
      emotionCacheTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      emotionCacheTimeoutRef.current.clear();
      
      // Clear greeting cache
      if (cachedGreetingRef.current) {
        URL.revokeObjectURL(cachedGreetingRef.current);
        cachedGreetingRef.current = null;
        isGreetingCachedRef.current = false;
      }
      
      // Reset state
      setIsRecording(false);
      setIsPlaying(false);
      setAudioLevel(0);
      hasSpokenRef.current = false;
      consecutiveSilenceRef.current = 0;
      interruptedRef.current = false;
      
      // Clear timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      console.log('✅ Voice system cleaned up successfully');
    } catch (error) {
      console.error('❌ Error during voice system cleanup:', error);
    }
  }, []);

  return {
    // Core state
    isRecording,
    isPlaying,
    currentEmotion,
    userEmotion,
    isListeningForInterruption,
    audioLevel,
    interruptedRef,
    
    // Enhanced voice features
    isVoiceStreaming,
    voiceCrisisLevel,
    voiceQuality,
    conversationInsights,
    
    // System state
    systemState,
    analytics,
    
    // Core methods
    startRecording,
    stopRecording,
    speakWithEmotion: speakWithEmotionEnhanced, // Changed to use the enhanced version
    speakFastGreeting,
    cacheGreeting,
    stopSpeaking,
    analyzeUserEmotion,
    handleUserSpeech,
    
    // Interruption handling
    startInterruptionListening,
    stopInterruptionListening,
    
    // Advanced voice methods
    startVoiceStreaming,
    stopVoiceStreaming,
    getVoiceCrisisLevel,
    
    // System management
    getSystemStats,
    updateSystemConfig,
    setCallActive,
    setOnUserSpeech,
    cleanupVoiceSystem
  };
};

// Default export for the ZOXAA Voice Hook
export default useZoxaaVoice;
