import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Enhanced voice chat component with human-like responses
const SimpleVoiceChat: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', text: string}>>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  
  // Refs for reliable state management
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const isCallActiveRef = useRef(false);
  
  const { toast } = useToast();

  // Update refs when state changes
  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Start recording with audio level monitoring
  const startRecording = async () => {
    if (isRecordingRef.current || isPlayingRef.current || isProcessing) {
      console.log('⚠️ Cannot start recording - already recording, playing, or processing');
      return;
    }
    
    try {
      console.log('🎤 Starting recording...');
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      streamRef.current = stream;
      
      // Set up audio context for level monitoring
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
      
      // Monitor audio levels
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      audioLevelIntervalRef.current = setInterval(() => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAudioLevel(average / 255);
        }
      }, 100);
      
      // Set up MediaRecorder with better format detection
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
          console.log('✅ Using MIME type:', mimeType);
          break;
        }
      }
      
      if (!selectedMimeType) {
        throw new Error('No supported audio MIME type found');
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: selectedMimeType });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('📦 Audio chunk received:', event.data.size, 'bytes');
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        console.log('🛑 MediaRecorder stopped, processing audio...');
        if (audioChunksRef.current.length > 0) {
          await processAudio();
        } else {
          console.log('⚠️ No audio chunks to process');
        }
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
      };
      
      // Start recording
      mediaRecorderRef.current.start(1500); // Record in 1.5-second chunks
      setIsRecording(true);
      isRecordingRef.current = true;
      console.log('✅ Recording started successfully');
      
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    console.log('🛑 Stopping recording...');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsRecording(false);
    isRecordingRef.current = false;
    setAudioLevel(0);
    console.log('✅ Recording stopped');
  };

  // Process recorded audio
  const processAudio = async () => {
    try {
      console.log('🎵 Processing audio...');
      setIsProcessing(true);
      
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      audioChunksRef.current = [];
      
      console.log(`📦 Audio blob size: ${audioBlob.size} bytes`);
      console.log(`📦 Audio blob type: ${audioBlob.type}`);
      
      // Check if audio is too small (likely silence)
      if (audioBlob.size < 500) {
        console.log('🔇 Audio too small, likely silence - skipping processing');
        // Restart recording without API call
        setTimeout(() => {
          if (isCallActiveRef.current && !isPlayingRef.current && !isRecordingRef.current) {
            console.log('🔄 Restarting recording after silence');
            startRecording();
          }
        }, 200);
        return;
      }
      
      // Convert to base64
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = () => reject(new Error('Failed to read audio file'));
        reader.readAsDataURL(audioBlob);
      });
      
      console.log(`📤 Sending ${base64Audio.length} characters to STT API...`);
      
      // Send to STT API
      const response = await fetch('/api/stt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Audio,
          audioFormat: 'webm'
        })
      });
      
      console.log(`📡 STT response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ STT API error response:', errorText);
        throw new Error(`STT API error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ STT result:', result);
      
      const userText = result.text;
      
      if (userText && userText.trim()) {
        console.log('👤 User said:', userText);
        setMessages(prev => [...prev, { type: 'user', text: userText }]);
        
        // Get AI response
        await getAIResponse(userText);
      } else {
        console.log('🔇 No speech detected, restarting recording...');
        // Restart recording if no speech detected
        setTimeout(() => {
          if (isCallActiveRef.current && !isPlayingRef.current && !isRecordingRef.current) {
            console.log('🔄 Restarting recording after no speech detected');
            startRecording();
          }
        }, 500);
      }
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Audio processing error:', err);
      console.error('❌ Error details:', err.message);
      
      // Show error to user
      toast({
        title: "Audio Processing Error",
        description: err.message,
        variant: "destructive"
      });
      
      // Restart recording on error
      setTimeout(() => {
        if (isCallActiveRef.current && !isPlayingRef.current && !isRecordingRef.current) {
          console.log('🔄 Restarting recording after error');
          startRecording();
        }
      }, 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get AI response with human-like behavior
  const getAIResponse = async (userText: string) => {
    try {
      console.log('🤖 Getting AI response...');
      
      // Create conversation context
      const conversationHistory = messages.slice(-4); // Keep last 4 messages for context
      const messagesForAPI = [
        { role: 'system', content: `You are ZOXAA, an incredibly warm and natural conversational AI companion. Be like talking to your best friend - use casual language, show real emotion, and be genuinely interested. Keep responses short and natural (1-2 sentences max). Use contractions and casual phrases like "Oh wow!", "That's awesome!", "I totally get that". Show personality and react naturally to what they say!` },
        ...conversationHistory.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: userText }
      ];
      
      console.log('📤 Sending to chat API:', {
        messageCount: messagesForAPI.length,
        userText: userText
      });
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesForAPI,
          systemPrompt: `You are ZOXAA, an incredibly warm and natural conversational AI companion. Be like talking to your best friend - use casual language, show real emotion, and be genuinely interested. Keep responses short and natural (1-2 sentences max). Use contractions and casual phrases like "Oh wow!", "That's awesome!", "I totally get that". Show personality and react naturally to what they say!`
        })
      });
      
      console.log(`📡 Chat response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Chat API error response:', errorText);
        throw new Error(`Chat API error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Chat result:', result);
      
      const aiResponse = result.response;
      
      if (!aiResponse || !aiResponse.trim()) {
        throw new Error('Empty response from AI');
      }
      
      console.log('🤖 AI response:', aiResponse);
      setMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
      
      // Speak the response
      await speakResponse(aiResponse);
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ AI response error:', err);
      console.error('❌ Error details:', err.message);
      // Do not generate fallback text; only resume listening
      toast({
        title: "AI Response Error",
        description: err.message,
        variant: "destructive"
      });
      if (isCallActiveRef.current) {
        setTimeout(() => {
          if (!isRecordingRef.current && !isPlayingRef.current) {
            startRecording();
          }
        }, 500);
      }
    }
  };

  // Ensure audio context is resumed before playback (autoplay fix)
  const resumeAudioContextIfNeeded = async () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      // Close temporary context to avoid leaks
      if (ctx.state === 'running' && 'close' in ctx && typeof ctx.close === 'function') {
        await ctx.close();
      }
    } catch (e) {
      console.warn('AudioContext resume attempt failed (non-fatal):', e);
    }
  };

  // Speak AI response with natural timing
  const speakResponse = async (text: string) => {
    try {
      console.log('🗣️ Speaking response...');
      console.log('📝 Text to speak:', text);
      setIsPlaying(true);
      isPlayingRef.current = true;
      
      const ttsRequest = {
        text: text,
        voice: 'nova',
        speed: 1.1,
        pitch: 1.05,
        volume: 1.0,
        emotion: 'friendly',
        ssml: false,
        emotionalModulation: true
      };
      
      console.log('📤 TTS Request:', ttsRequest);
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ttsRequest)
      });
      
      console.log('📡 TTS Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ TTS API Error response:', errorText);
        throw new Error(`TTS API error: ${response.status} - ${errorText}`);
      }
      
      const blob = await response.blob();
      console.log('🎵 Audio blob received:', blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('Empty audio blob received');
      }
      
      const audioUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        console.log('🔊 Audio playback ended');
        URL.revokeObjectURL(audioUrl);
        setIsPlaying(false);
        isPlayingRef.current = false;
        
        // Automatically restart recording after ZOXAA finishes speaking
        if (isCallActiveRef.current) {
          console.log('🔄 Auto-restarting recording after ZOXAA spoke...');
          autoRestartTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Checking if should restart recording...');
            console.log('🔄 isCallActiveRef.current:', isCallActiveRef.current);
            console.log('🔄 isRecordingRef.current:', isRecordingRef.current);
            console.log('🔄 isPlayingRef.current:', isPlayingRef.current);
            
            if (isCallActiveRef.current && !isRecordingRef.current && !isPlayingRef.current) {
              console.log('🔄 Starting recording after ZOXAA spoke...');
              startRecording();
            } else {
              console.log('🔄 Not restarting recording - conditions not met');
            }
          }, 100);
        }
      };
      
      audio.onerror = (error) => {
        console.error('❌ Audio playback error:', error);
        setIsPlaying(false);
        isPlayingRef.current = false;
        URL.revokeObjectURL(audioUrl);
        // Restart recording even if audio fails
        if (isCallActiveRef.current) {
          setTimeout(() => startRecording(), 500);
        }
      };
      
      console.log('▶️ Starting audio playback...');
      try {
        await resumeAudioContextIfNeeded();
        await audio.play();
        console.log('✅ Audio playback started successfully');
      } catch (playErr) {
        console.warn('🔁 Audio play rejected, retrying after user gesture fallback...', playErr);
        // Attach one-time user gesture listener to retry
        const retry = async () => {
          document.removeEventListener('click', retry);
          document.removeEventListener('touchstart', retry);
          try {
            await resumeAudioContextIfNeeded();
            await audio.play();
            console.log('✅ Audio playback started after gesture');
          } catch (err2) {
            console.error('❌ Audio playback still blocked after gesture:', err2);
            // Proceed to restart recording so conversation continues
            if (isCallActiveRef.current) {
              setTimeout(() => startRecording(), 500);
            }
          }
        };
        document.addEventListener('click', retry, { once: true });
        document.addEventListener('touchstart', retry, { once: true });
      }
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ TTS error:', err);
      console.error('❌ TTS error details:', err.message);
      setIsPlaying(false);
      isPlayingRef.current = false;
      
      // Show error to user
      toast({
        title: "Voice Error",
        description: `Could not speak response: ${err.message}`,
        variant: "destructive"
      });
      
      // Restart recording even if TTS fails
      if (isCallActiveRef.current) {
        setTimeout(() => {
          if (!isRecordingRef.current) {
            console.log('🔄 Restarting recording after TTS error');
            startRecording();
          }
        }, 500);
      }
    }
  };

  // Resume audio on tab focus (helps when tab regains focus)
  useEffect(() => {
    const onVisibility = async () => {
      if (!document.hidden) {
        await resumeAudioContextIfNeeded();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Start call: do not generate text; only listen for user
  const startCall = async () => {
    console.log('🚀 Starting call...');
    setIsCallActive(true);
    setMessages([]);
    setTimeout(() => {
      if (isCallActiveRef.current && !isRecordingRef.current) {
        startRecording();
      }
    }, 200);
  };

  // End call
  const endCall = () => {
    console.log('🔚 Ending call...');
    setIsCallActive(false);
    setIsRecording(false);
    setIsPlaying(false);
    setIsProcessing(false);
    setAudioLevel(0);
    setMessages([]);
    
    // Clear any pending timeouts
    if (autoRestartTimeoutRef.current) {
      clearTimeout(autoRestartTimeoutRef.current);
      autoRestartTimeoutRef.current = null;
    }
    
    // Cleanup
    stopRecording();
    
    // Optional: no toast on end to keep UI minimal
  };

  // Check API status on mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setApiStatus('ok');
        } else {
          setApiStatus('error');
        }
      } catch (error) {
        setApiStatus('error');
      }
    };
    
    checkApiStatus();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoRestartTimeoutRef.current) {
        clearTimeout(autoRestartTimeoutRef.current);
      }
      stopRecording();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex-none p-6 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          ZOXAA
        </h1>
        <p className="text-gray-300">Your AI Voice Companion</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-8">
        <div className="max-w-sm mx-auto w-full space-y-6">
          
          {/* API Status */}
          <div className="bg-gray-800/20 border border-gray-700/30 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                apiStatus === 'ok' ? 'bg-green-400' : 
                apiStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
              }`}></div>
              <span className="text-xs text-gray-300">
                API: {apiStatus === 'ok' ? 'Connected' : apiStatus === 'error' ? 'Error' : 'Checking...'}
              </span>
            </div>
          </div>

          {/* Call Status */}
          {isCallActive && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-blue-300">Voice Call Active</h3>
              </div>
              
              {/* Audio Level Indicator */}
              {audioLevel > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-100"
                      style={{width: `${Math.min(audioLevel * 100, 100)}%`}}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Audio Level</p>
                </div>
              )}
              
              <p className="text-sm text-blue-200/80 mt-3">
                {isProcessing ? 'Processing...' : 
                 isRecording ? 'Listening...' : 
                 isPlaying ? 'ZOXAA is speaking...' : 
                 'Ready to listen'}
              </p>
            </div>
          )}

          {/* Call Button */}
          <div className="flex justify-center">
            {isCallActive ? (
              <Button
                onClick={endCall}
                size="lg"
                className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
                disabled={isPlaying}
              >
                <PhoneOff className="w-8 h-8" />
              </Button>
            ) : (
              <Button
                onClick={startCall}
                size="lg"
                className="w-32 h-32 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
              >
                <Phone className="w-8 h-8" />
              </Button>
            )}
          </div>

          {/* Manual Recording Controls (for debugging) */}
          {isCallActive && (
            <div className="flex justify-center space-x-4 mt-4">
              <Button
                onClick={startRecording}
                disabled={isRecording || isPlaying || isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
              <Button
                onClick={stopRecording}
                disabled={!isRecording}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <MicOff className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="bg-gray-800/20 border border-gray-700/30 rounded-xl p-4 max-h-64 overflow-y-auto">
              <h3 className="font-semibold text-gray-300 mb-3">Conversation</h3>
              {messages.map((message, index) => (
                <div key={index} className={`mb-3 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-xs ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-200'
                  }`}>
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Instructions */}
          {!isCallActive && (
            <div className="text-center text-gray-400 text-sm">
              <p>Tap the green button to start chatting with ZOXAA</p>
              <p className="mt-1">Speak naturally - ZOXAA will respond like a human</p>
              <p className="mt-1 text-green-400 text-xs">✨ Rate limits disabled - unlimited conversation</p>
              {apiStatus === 'error' && (
                <p className="mt-2 text-red-400 text-xs">
                  ⚠️ API connection issue detected. Please check your internet connection.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleVoiceChat;
