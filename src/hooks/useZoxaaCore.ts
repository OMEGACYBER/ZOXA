// Clean React hook for ZOXAA core functionality
import { useState, useRef, useEffect, useCallback } from 'react';
import VoiceService from '../lib/VoiceService';
import ApiService from '../lib/ApiService';
import ConversationService, { ConversationMessage } from '../lib/ConversationService';

export interface ZoxaaCoreState {
  isCallActive: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  messages: ConversationMessage[];
  audioLevel: number;
}

export interface ZoxaaCoreActions {
  startCall: () => Promise<void>;
  endCall: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}

export const useZoxaaCore = (): ZoxaaCoreState & ZoxaaCoreActions => {
  // State
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Services
  const voiceServiceRef = useRef<VoiceService | null>(null);
  const apiServiceRef = useRef<ApiService | null>(null);
  const conversationServiceRef = useRef<ConversationService | null>(null);
  
  // Audio level monitoring
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Initialize services
  useEffect(() => {
    apiServiceRef.current = new ApiService();
    voiceServiceRef.current = new VoiceService();
    conversationServiceRef.current = new ConversationService(apiServiceRef.current);
    
    return () => {
      voiceServiceRef.current?.destroy();
    };
  }, []);
  
  // Start audio level monitoring
  const startAudioLevelMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      audioLevelIntervalRef.current = setInterval(() => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAudioLevel(average / 255);
        }
      }, 100);
      
    } catch (error) {
      console.error('Failed to start audio level monitoring:', error);
    }
  }, []);
  
  // Stop audio level monitoring
  const stopAudioLevelMonitoring = useCallback(() => {
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setAudioLevel(0);
  }, []);
  
  // Start call
  const startCall = useCallback(async () => {
    try {
      console.log('🚀 Starting ZOXAA call...');
      
      // Check API health
      await apiServiceRef.current?.healthCheck();
      
      // Start conversation
      await conversationServiceRef.current?.start();
      
      // Start audio level monitoring
      await startAudioLevelMonitoring();
      
      setIsCallActive(true);
      
      // Update messages from conversation service
      const state = conversationServiceRef.current?.getState();
      if (state) {
        setMessages(state.messages);
      }
      
      console.log('✅ Call started successfully');
      
    } catch (error) {
      console.error('❌ Failed to start call:', error);
      throw error;
    }
  }, [startAudioLevelMonitoring]);
  
  // End call
  const endCall = useCallback(() => {
    console.log('🔚 Ending ZOXAA call...');
    
    setIsCallActive(false);
    setIsRecording(false);
    setIsPlaying(false);
    setIsLoading(false);
    setMessages([]);
    setAudioLevel(0);
    
    // Stop services
    conversationServiceRef.current?.stop();
    voiceServiceRef.current?.stopRecording();
    stopAudioLevelMonitoring();
    
    console.log('✅ Call ended');
  }, [stopAudioLevelMonitoring]);
  
  // Process recorded audio
  const processRecordedAudio = useCallback(async (audioBlob?: Blob) => {
    if (!audioBlob) return;
    
    try {
      setIsLoading(true);
      
      await conversationServiceRef.current?.processAudioInput(audioBlob);
      
      // Update messages
      const state = conversationServiceRef.current?.getState();
      if (state) {
        setMessages(state.messages);
        setIsLoading(state.isLoading);
      }
      
    } catch (error) {
      console.error('❌ Audio processing error:', error);
      setIsLoading(false);
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isCallActive) return;
    
    try {
      console.log('🎤 Starting recording...');
      
      await voiceServiceRef.current?.startRecording();
      setIsRecording(true);
      
      // Set up recording stop handler
      const checkRecording = setInterval(() => {
        const state = voiceServiceRef.current?.getState();
        if (state && !state.isRecording) {
          clearInterval(checkRecording);
          setIsRecording(false);
          
          // Process the recorded audio
          processRecordedAudio();
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      throw error;
    }
  }, [isCallActive, processRecordedAudio]);
  
  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      console.log('🛑 Stopping recording...');
      
      const audioBlob = await voiceServiceRef.current?.stopRecording();
      setIsRecording(false);
      
      if (audioBlob) {
        await processRecordedAudio(audioBlob);
      }
      
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      setIsRecording(false);
    }
  }, [processRecordedAudio]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);
  
  return {
    // State
    isCallActive,
    isRecording,
    isPlaying,
    isLoading,
    messages,
    audioLevel,
    
    // Actions
    startCall,
    endCall,
    startRecording,
    stopRecording
  };
};

export default useZoxaaCore;
