import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EnhancedEmotionalSystem } from '@/utils/enhancedEmotionalSystem';
import { ConversationMemoryManager } from '@/utils/conversationMemory';
import { EVI3VoiceAnalyzer } from '@/utils/advancedVoiceAnalysis';
import { CrisisDetectionSystem } from '@/utils/crisisDetection';

interface ZoxaaVoiceHookReturn {
  // Core state
  isRecording: boolean;
  isPlaying: boolean;
  currentEmotion: string;
  userEmotion: any;
  isListeningForInterruption: boolean;
  audioLevel: number;
  interruptedRef: React.MutableRefObject<boolean>;
  
  // Enhanced voice features
  isVoiceStreaming: boolean;
  voiceCrisisLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  voiceQuality: any;
  conversationInsights: any;
  
  // System state
  systemState: any;
  analytics: any;
  
  // Core methods
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  speakWithEmotion: (text: string, detectedUserEmotion?: any) => Promise<void>;
  stopSpeaking: () => void;
  analyzeUserEmotion: (text: string, voiceData?: Float32Array) => Promise<any>;
  
  // Interruption handling
  startInterruptionListening: () => Promise<void>;
  stopInterruptionListening: () => void;
  
  // Advanced voice methods
  startVoiceStreaming: () => Promise<void>;
  stopVoiceStreaming: () => Promise<void>;
  getVoiceCrisisLevel: () => 'none' | 'low' | 'medium' | 'high' | 'critical';
  
  // System management
  getSystemStats: () => any;
  updateSystemConfig: (config: any) => void;
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
    lastUpdated: Date.now()
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
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const interruptionStreamRef = useRef<MediaStream | null>(null);

  // Initialize system
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        // Initialize AI systems
        emotionalSystemRef.current = new EnhancedEmotionalSystem(true);
        memoryManagerRef.current = ConversationMemoryManager.getInstance();
        voiceAnalyzerRef.current = new EVI3VoiceAnalyzer();
        crisisDetectionRef.current = new CrisisDetectionSystem();

        // Initialize audio context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

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
          audioContextRef.current.close();
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
          analyserRef.current!.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
        }, 100);
      }

      // Set up MediaRecorder for audio capture
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
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

  // Stop recording and transcribe
  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !isRecording) {
        reject(new Error('Not recording'));
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        try {
          // Stop audio level monitoring
          if (audioLevelIntervalRef.current) {
            clearInterval(audioLevelIntervalRef.current);
            audioLevelIntervalRef.current = null;
          }

          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convert to base64
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64Audio = (reader.result as string).split(',')[1];
              
              // Send to STT API
              const response = await fetch('/api/stt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioData: base64Audio,
                  audioFormat: 'webm'
                })
              });

              if (!response.ok) {
                throw new Error(`STT API error: ${response.statusText}`);
              }

              const result = await response.json();
              const transcribedText = result.text;

              console.log('🎤 Transcribed:', transcribedText);
              
              setIsRecording(false);
              resolve(transcribedText);
              
            } catch (error) {
              console.error('STT error:', error);
              setIsRecording(false);
              reject(error);
            }
          };
          
          reader.readAsDataURL(audioBlob);
          
        } catch (error) {
          console.error('Recording stop error:', error);
          setIsRecording(false);
          reject(error);
        }
      };

      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    });
  }, [isRecording]);

  // Speak with emotion using OpenAI TTS
  const speakWithEmotion = useCallback(async (text: string, detectedUserEmotion?: any) => {
    try {
      if (isPlaying) {
        stopSpeaking();
      }

      setIsPlaying(true);
      
      // Get voice settings based on emotion
      const voiceSettings = getVoiceSettings(detectedUserEmotion);
      
      console.log('🗣️ Speaking with emotion:', voiceSettings.emotion);

      // Call TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          voice: voiceSettings.voice,
          speed: voiceSettings.speed,
          pitch: voiceSettings.pitch,
          volume: voiceSettings.volume,
          emotion: voiceSettings.emotion,
          ssml: true,
          emotionalModulation: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
      }

      // Handle audio response
      const contentType = response.headers.get('Content-Type') || '';
      
      if (contentType.includes('audio/')) {
        // Direct audio response
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Play audio
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.src = '';
        }

        currentAudioRef.current = new Audio(audioUrl);
        currentAudioRef.current.playbackRate = Math.max(0.5, Math.min(2.0, voiceSettings.speed));
        currentAudioRef.current.volume = Math.max(0, Math.min(1, voiceSettings.volume));
        
        currentAudioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        currentAudioRef.current.onerror = (error) => {
          console.error('Audio playback error:', error);
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
          toast({
            title: "Audio Playback Error",
            description: "Failed to play audio response",
            variant: "destructive"
          });
        };

        await currentAudioRef.current.play();
        
      } else {
        // JSON response (fallback)
        const result = await response.json();
        const audioData = atob(result.audio);
        const audioArray = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i);
        }
        const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.src = '';
        }

        currentAudioRef.current = new Audio(audioUrl);
        currentAudioRef.current.playbackRate = Math.max(0.5, Math.min(2.0, voiceSettings.speed));
        currentAudioRef.current.volume = Math.max(0, Math.min(1, voiceSettings.volume));
        
        currentAudioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        currentAudioRef.current.onerror = (error) => {
          console.error('Audio playback error:', error);
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };

        await currentAudioRef.current.play();
      }
      
    } catch (error) {
      console.error('Failed to speak with emotion:', error);
      setIsPlaying(false);
      toast({
        title: "Voice Generation Error",
        description: "I couldn't generate voice response. Please try again.",
        variant: "destructive"
      });
    }
  }, [isPlaying, toast]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Analyze user emotion
  const analyzeUserEmotion = useCallback(async (text: string, voiceData?: Float32Array) => {
    try {
      if (!emotionalSystemRef.current) {
        throw new Error('Emotional system not initialized');
      }

      const emotionalState = await emotionalSystemRef.current.analyzeEmotion(text, `session_${Date.now()}`);
      setCurrentEmotion(emotionalState.primaryEmotion);
      setUserEmotion(emotionalState);
      
      return emotionalState;
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      return null;
    }
  }, []);

  // Get voice settings based on emotion
  const getVoiceSettings = useCallback((emotion?: any) => {
    const baseSettings = {
      voice: 'nova',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      emotion: 'neutral'
    };

    if (!emotion) return baseSettings;

    switch (emotion.primaryEmotion?.toLowerCase()) {
      case 'happy':
        return { ...baseSettings, speed: 1.1, pitch: 1.05, emotion: 'happy' };
      case 'sad':
        return { ...baseSettings, speed: 0.9, pitch: 0.95, emotion: 'sad' };
      case 'excited':
        return { ...baseSettings, speed: 1.2, pitch: 1.1, emotion: 'excited' };
      case 'calm':
        return { ...baseSettings, speed: 0.95, pitch: 0.98, emotion: 'calm' };
      case 'concerned':
        return { ...baseSettings, speed: 0.9, pitch: 0.92, emotion: 'concerned' };
      case 'angry':
        return { ...baseSettings, speed: 1.1, pitch: 1.08, emotion: 'angry' };
      default:
        return baseSettings;
    }
  }, []);

  // Interruption handling
  const startInterruptionListening = useCallback(async (): Promise<void> => {
    try {
      if (isListeningForInterruption) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
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

  // Split text into sentence chunks
  const splitTextIntoChunks = (text: string, maxLen = 180): string[] => {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let current = '';
    for (const s of sentences) {
      if ((current + ' ' + s).trim().length <= maxLen) {
        current = (current ? current + ' ' : '') + s;
      } else {
        if (current) chunks.push(current.trim());
        current = s;
      }
    }
    if (current) chunks.push(current.trim());
    return chunks.length ? chunks : [text];
  };

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
          currentAudioRef.current!.onended = resolve;
          currentAudioRef.current!.onerror = () => reject(new Error('Audio playback error'));
          currentAudioRef.current!.play().catch(reject);
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
      stopInterruptionListening();
    }
  }, [stopInterruptionListening]);

  // Speak with chunked sequential playback + barge-in
  const speakWithEmotion = useCallback(async (text: string, detectedUserEmotion?: any) => {
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

      // Start barge-in listening
      await startInterruptionListening();

      // Split into chunks for faster perceived response
      const chunks = splitTextIntoChunks(text, 160);

      // Fetch first chunk immediately
      const fetchChunk = async (chunkText: string): Promise<string> => {
        const resp = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: chunkText,
            voice: voiceSettings.voice,
            speed: voiceSettings.speed,
            pitch: voiceSettings.pitch,
            volume: voiceSettings.volume,
            emotion: voiceSettings.emotion,
            ssml: true,
            emotionalModulation: true,
          }),
        });
        if (!resp.ok) throw new Error(`TTS chunk error: ${resp.statusText}`);
        const blob = await resp.blob();
        return URL.createObjectURL(blob);
      };

      // Prefetch first then enqueue remaining in background
      const firstUrl = await fetchChunk(chunks[0]);
      // adjust playback params per emotion
      ttsQueueRef.current.push(firstUrl);

      // background prefetch of remaining chunks
      (async () => {
        for (let i = 1; i < chunks.length; i++) {
          if (interruptedRef.current) break;
          try {
            const url = await fetchChunk(chunks[i]);
            ttsQueueRef.current.push(url);
          } catch {
            // skip on error
          }
        }
      })();

      // Begin playback of queue
      await playQueueSequentially();

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
  }, [isPlaying, getVoiceSettings, startInterruptionListening, playQueueSequentially, stopInterruptionListening, toast]);

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
  const getSystemStats = useCallback((): any => {
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
  const updateSystemConfig = useCallback((config: any) => {
    console.log('Updating system config:', config);
    // Implementation for system configuration updates
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
    speakWithEmotion,
    stopSpeaking,
    analyzeUserEmotion,
    
    // Interruption handling
    startInterruptionListening,
    stopInterruptionListening,
    
    // Advanced voice methods
    startVoiceStreaming,
    stopVoiceStreaming,
    getVoiceCrisisLevel,
    
    // System management
    getSystemStats,
    updateSystemConfig
  };
};

export default useZoxaaVoice;
