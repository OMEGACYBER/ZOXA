import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mobile-optimized voice chat component
const MobileVoiceChat: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', text: string}>>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  // Start recording with mobile-optimized settings
  const startRecording = async () => {
    if (isRecording || isPlaying || isProcessing) return;
    
    try {
      console.log('🎤 Starting mobile recording...');
      
      // Mobile-optimized audio settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Lower sample rate for mobile
          channelCount: 1, // Mono for mobile efficiency
          latency: 0.01 // Low latency for mobile
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
      
      // Set up MediaRecorder with mobile-optimized settings
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      mediaRecorderRef.current = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 128000 // Lower bitrate for mobile
      });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          await processAudio();
        }
      };
      
      // Start recording in smaller chunks for mobile
      mediaRecorderRef.current.start(500); // 500ms chunks for mobile
      setIsRecording(true);
      console.log('✅ Mobile recording started');
      
    } catch (error) {
      console.error('❌ Failed to start mobile recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
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
    setAudioLevel(0);
    console.log('🛑 Mobile recording stopped');
  };

  // Process recorded audio
  const processAudio = async () => {
    try {
      console.log('🎵 Processing mobile audio...');
      setIsProcessing(true);
      
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      audioChunksRef.current = [];
      
      // Convert to base64
      const base64Audio = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(audioBlob);
      });
      
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
          if (isCallActive && !isPlaying) {
            startRecording();
          }
        }, 300); // Faster restart for mobile
      }
      
    } catch (error) {
      console.error('❌ Mobile audio processing error:', error);
      // Restart recording on error
      setTimeout(() => {
        if (isCallActive && !isPlaying) {
          startRecording();
        }
      }, 500);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get AI response with mobile-optimized context
  const getAIResponse = async (userText: string) => {
    try {
      console.log('🤖 Getting AI response...');
      
      // Create conversation context (shorter for mobile)
      const conversationHistory = messages.slice(-3); // Keep last 3 messages for mobile
      const messagesForAPI = [
        { role: 'system', content: `You are ZOXAA, a friendly, empathetic AI companion. You should:
- Respond naturally and conversationally like a real person
- Show genuine interest and empathy
- Keep responses concise (1-2 sentences for mobile)
- Ask follow-up questions to keep the conversation flowing
- Use casual, friendly language
- Be supportive and encouraging
- Remember you're on mobile - keep responses short and engaging` },
        ...conversationHistory.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: userText }
      ];
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesForAPI,
          systemPrompt: `You are ZOXAA, a friendly, empathetic AI companion. Respond naturally and conversationally. Keep responses concise for mobile.`
        })
      });
      
      if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`);
      }
      
      const result = await response.json();
      const aiResponse = result.response;
      
      console.log('🤖 AI response:', aiResponse);
      setMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
      
      // Speak the response
      await speakResponse(aiResponse);
      
    } catch (error) {
      console.error('❌ AI response error:', error);
      const fallbackResponse = "I'm having trouble connecting right now, but I'm here for you. Could you try again?";
      setMessages(prev => [...prev, { type: 'ai', text: fallbackResponse }]);
      await speakResponse(fallbackResponse);
    }
  };

  // Speak AI response with mobile optimization
  const speakResponse = async (text: string) => {
    if (isMuted) {
      console.log('🔇 Audio muted, skipping TTS');
      // Still restart recording even if muted
      if (isCallActive) {
        setTimeout(() => {
          if (isCallActive && !isRecording) {
            startRecording();
          }
        }, 300);
      }
      return;
    }

    try {
      console.log('🗣️ Speaking mobile response...');
      setIsPlaying(true);
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          voice: 'nova',
          speed: 1.0, // Natural speed
          pitch: 1.0,
          volume: 1.0,
          emotion: 'friendly',
          ssml: false,
          emotionalModulation: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsPlaying(false);
        
        // Automatically restart recording after ZOXAA finishes speaking
        if (isCallActive) {
          console.log('🔄 Auto-restarting mobile recording after ZOXAA spoke...');
          autoRestartTimeoutRef.current = setTimeout(() => {
            if (isCallActive && !isRecording) {
              startRecording();
            }
          }, 200); // Faster restart for mobile
        }
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('❌ Mobile TTS error:', error);
      setIsPlaying(false);
      // Restart recording even if TTS fails
      if (isCallActive) {
        setTimeout(() => startRecording(), 300);
      }
    }
  };

  // Start call
  const startCall = async () => {
    console.log('🚀 Starting mobile call...');
    setIsCallActive(true);
    setMessages([]);
    
    // Get greeting from API instead of hardcoding
    try {
      console.log('🤖 Getting mobile greeting from API...');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Start our conversation with a friendly greeting.' }],
          systemPrompt: `You are ZOXAA, a friendly, empathetic AI companion. You should:
- Respond naturally and conversationally like a real person
- Show genuine interest and empathy
- Keep responses concise (1-2 sentences for mobile)
- Ask follow-up questions to keep the conversation flowing
- Use casual, friendly language
- Be supportive and encouraging
- Remember you're on mobile - keep responses short and engaging

For the greeting, be warm, friendly, and ask how the person is feeling today.`
        })
      });
      
      if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`);
      }
      
      const result = await response.json();
      const greeting = result.response;
      
      console.log('🤖 Mobile greeting from API:', greeting);
      setMessages([{ type: 'ai', text: greeting }]);
      
      // Speak greeting
      await speakResponse(greeting);
      
      toast({
        title: "Call Started",
        description: "ZOXAA is ready to chat with you ✨"
      });
      
    } catch (error) {
      console.error('❌ Failed to get mobile greeting:', error);
      
      // Fallback greeting if API fails
      const fallbackGreeting = "Hey! I'm ZOXAA. How are you feeling today?";
      setMessages([{ type: 'ai', text: fallbackGreeting }]);
      
      toast({
        title: "Call Started",
        description: "ZOXAA is ready to chat with you ✨"
      });
      
      // Try to speak the fallback greeting
      try {
        await speakResponse(fallbackGreeting);
      } catch (ttsError) {
        console.error('❌ TTS failed for mobile greeting:', ttsError);
      }
    }
  };

  // End call
  const endCall = () => {
    console.log('🔚 Ending mobile call...');
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
    
    toast({
      title: "Call Ended",
      description: "Thank you for chatting with ZOXAA 💙"
    });
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Audio Unmuted" : "Audio Muted",
      description: isMuted ? "ZOXAA will speak again" : "ZOXAA is now muted"
    });
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col safe-area-inset">
      {/* Mobile Header */}
      <div className="flex-none p-4 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
          ZOXAA
        </h1>
        <p className="text-gray-300 text-sm">Your AI Voice Companion</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-4 pb-6">
        <div className="max-w-sm mx-auto w-full space-y-4">
          
          {/* Call Status */}
          {isCallActive && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-blue-300 text-sm">Voice Call Active</h3>
              </div>
              
              {/* Audio Level Indicator */}
              {audioLevel > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-700/50 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-400 h-1 rounded-full transition-all duration-100"
                      style={{width: `${Math.min(audioLevel * 100, 100)}%`}}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Audio Level</p>
                </div>
              )}
              
              <p className="text-xs text-blue-200/80 mt-2">
                {isProcessing ? 'Processing...' : 
                 isRecording ? 'Listening...' : 
                 isPlaying ? 'ZOXAA is speaking...' : 
                 'Ready to listen'}
              </p>
            </div>
          )}

          {/* Call Controls */}
          <div className="flex justify-center space-x-3">
            {/* Main Call Button */}
            {isCallActive ? (
              <Button
                onClick={endCall}
                size="lg"
                className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
                disabled={isPlaying}
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            ) : (
              <Button
                onClick={startCall}
                size="lg"
                className="w-24 h-24 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
              >
                <Phone className="w-6 h-6" />
              </Button>
            )}
            
            {/* Mute Button (when call is active) */}
            {isCallActive && (
              <Button
                onClick={toggleMute}
                size="sm"
                variant={isMuted ? "destructive" : "secondary"}
                className="w-12 h-12 rounded-full"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            )}
          </div>

          {/* Messages */}
          {messages.length > 0 && (
            <div className="bg-gray-800/20 border border-gray-700/30 rounded-xl p-3 max-h-48 overflow-y-auto">
              <h3 className="font-semibold text-gray-300 mb-2 text-sm">Conversation</h3>
              {messages.map((message, index) => (
                <div key={index} className={`mb-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-2 rounded-lg max-w-xs text-sm ${
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
            <div className="text-center text-gray-400 text-xs">
              <p>Tap the green button to start chatting with ZOXAA</p>
              <p className="mt-1">Optimized for mobile voice conversations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileVoiceChat;
