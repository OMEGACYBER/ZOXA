import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useZoxaaVoice from "@/hooks/useZoxaaVoice";
import { useMobileVoicePermissions } from "@/hooks/useMobileVoicePermissions";

// Real-time conversation is now handled by useZoxaaVoice hook

const VoiceChat: React.FC = () => {
  const [callActive, setCallActiveState] = useState(false);
  const [zoxaaResponse, setZoxaaResponse] = useState('');
  const hasGreetedRef = useRef(false);
  
  const { toast } = useToast();
  const { permissions, requestMicrophonePermission, isReady } = useMobileVoicePermissions();
  
  const {
    isRecording,
    isPlaying,
    startRecording,
    speakWithEmotion,
    speakFastGreeting,
    handleUserSpeech,
    setCallActive: setHookCallActive,
    setOnUserSpeech,
    cleanupVoiceSystem,
    audioLevel,
    currentEmotion,
    userEmotion,
    interruptedRef,
    isListeningForInterruption,
    isVoiceStreaming,
    voiceCrisisLevel,
    voiceQuality,
    conversationInsights,
    systemState,
    analytics,
    startVoiceStreaming,
    stopVoiceStreaming,
    getVoiceCrisisLevel,
    getSystemStats,
    updateSystemConfig,
  } = useZoxaaVoice();

  const startCall = async () => {
    console.log('🚀 Starting call...');
    
    // Check microphone permissions first
    if (permissions.microphone !== 'granted') {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        console.log('❌ Microphone permission denied');
        toast({
          title: "Permission Required",
          description: "Please allow microphone access to start voice chat",
          variant: "destructive"
        });
        return;
      }
    }

    // Check if API server is available
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error('API server not responding');
      }
    } catch (error) {
      console.warn('⚠️ API server not available:', error);
      toast({
        title: "API Server Unavailable",
        description: "Please start the backend server with 'npm run dev:api'",
        variant: "destructive"
      });
      return;
    }
    
    console.log('✅ Setting call active to true');
    setCallActiveState(true);
    setHookCallActive(true);
    hasGreetedRef.current = false;
    
    // Set up real-time conversation callback
    setOnUserSpeech((userText: string, aiResponse: string) => {
      console.log('📞 User said:', userText);
      console.log('🤖 ZOXAA responded:', aiResponse);
      setZoxaaResponse(aiResponse);
    });

    toast({
      title: "Call Started",
      description: "ZOXAA is ready to chat with you ✨"
    });

    try {
      console.log('🎤 Starting recording...');
      await startRecording();
      console.log('✅ Recording started successfully');
      
      // Generate and speak dynamic greeting
      await generateAndSpeakDynamicGreeting();
      hasGreetedRef.current = true;
      
      // 🚨 REMOVED: Test conversation flow - now waits for real user input
      console.log('✅ Call started successfully - waiting for real user voice input');
      
    } catch (error) {
      console.error('❌ Failed to start recording or speak greeting:', error);
      // Don't end the call on error, just log it
    }
  };

  // Generate dynamic greeting using OpenAI - optimized for speed
  const generateAndSpeakDynamicGreeting = async () => {
    try {
      console.log('🗣️ Generating dynamic greeting...');
      
      // Use a simple, fast greeting instead of complex AI generation
      const greetings = [
        "Hey! I'm ZOXAA. How are you feeling today?",
        "Hi there! I'm ZOXAA. What's on your mind?",
        "Hello! I'm ZOXAA. How can I help you?",
        "Hey! I'm ZOXAA. What would you like to talk about?",
        "Hi! I'm ZOXAA. How are you doing?"
      ];
      
      // Pick a random greeting for variety
      const greetingText = greetings[Math.floor(Math.random() * greetings.length)];
      
      console.log('🗣️ Speaking greeting...');
      await speakWithEmotion(greetingText);
      console.log('✅ Greeting spoken successfully');
      setZoxaaResponse(greetingText);
      
    } catch (error) {
      console.error('Failed to generate greeting:', error);
      // Fallback greeting
      const fallbackGreeting = "Hey! I'm ZOXAA. How are you feeling right now?";
      console.log('🗣️ Speaking fallback greeting...');
      await speakWithEmotion(fallbackGreeting);
      console.log('✅ Fallback greeting spoken successfully');
      setZoxaaResponse(fallbackGreeting);
    }
  };

  const endCall = async () => {
    console.log('🔚 Ending call...');
    setCallActiveState(false);
    setHookCallActive(false);
    hasGreetedRef.current = false;
    setZoxaaResponse('');
    
    // Comprehensive cleanup of voice system
    await cleanupVoiceSystem();
    
    toast({
      title: "Call Ended",
      description: "Thank you for chatting with ZOXAA 💙"
    });
  };

  // The real-time conversation is now handled by useZoxaaVoice hook
  // Just need to ensure recording restarts after ZOXAA finishes speaking
  useEffect(() => {
    if (callActive && !isPlaying && !isRecording && hasGreetedRef.current) {
      console.log('🔄 Restarting recording after ZOXAA finished speaking...');
      const timer = setTimeout(() => {
        startRecording().catch((err) => {
          console.error('Failed to restart recording:', err);
        });
      }, 100); // Faster restart for better conversation flow
      return () => clearTimeout(timer);
    }
  }, [callActive, isPlaying, isRecording, hasGreetedRef.current, startRecording]);

  // Cleanup voice system when component unmounts
  useEffect(() => {
    return () => {
      if (callActive) {
        console.log('🧹 Cleaning up voice system on component unmount');
        cleanupVoiceSystem().catch((error) => {
          console.error('Error during cleanup:', error);
        });
      }
    };
  }, [callActive, cleanupVoiceSystem]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col safe-area-inset">
      {/* Mobile-optimized header */}
      <div className="flex-none p-6 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">ZOXAA</h1>
        <p className="text-gray-300">Your AI Voice Companion</p>
        </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-8">
        <div className="max-w-sm mx-auto w-full space-y-6">

          {/* Microphone Permission Status */}
          {permissions.microphone !== 'granted' && !callActive && isReady && (
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-300 mb-1">Microphone Access Required</h3>
                  <p className="text-sm text-amber-200/80">
                    {permissions.microphone === 'denied' 
                      ? 'Please allow microphone access in your browser settings to use voice features.'
                      : 'ZOXAA needs microphone access to hear your voice.'
                    }
                    {permissions.isNative && (
                      <span className="block mt-1 text-xs">Running in native app mode</span>
                    )}
                  </p>
                </div>
              </div>
              {(permissions.microphone === 'prompt' || permissions.microphone === 'checking') && (
                <Button
                  onClick={requestMicrophonePermission}
                  disabled={permissions.isRequesting}
                  size="lg"
                  className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {permissions.isRequesting ? 'Requesting...' : 'Allow Microphone Access'}
                </Button>
              )}
            </div>
          )}

          {/* Voice Status Display */}
          {callActive && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-blue-300">Voice Call Active</h3>
              </div>
              <p className="text-sm text-blue-200/80">
                Just speak naturally - ZOXAA will hear and respond automatically.
              </p>
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
          </div>
          )}

          {/* Large Call Button */}
          <div className="flex justify-center">
            {callActive ? (
              <Button
                onClick={endCall}
                size="lg"
                className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl"
              >
                <PhoneOff className="w-8 h-8" />
              </Button>
            ) : (
              <Button
                onClick={startCall}
                size="lg"
                className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-2xl border-4 border-white/20"
                disabled={permissions.microphone === 'denied'}
              >
                <Phone className="w-8 h-8" />
              </Button>
            )}
        </div>

          {/* Status Text */}
          <div className="text-center">
          {callActive ? (
              <div className="space-y-2">
                <p className="text-lg text-gray-300">Connected to ZOXAA</p>
                <p className="text-sm text-gray-400">Tap the red button to end the call</p>
                {zoxaaResponse && (
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mt-4">
                    <p className="text-sm text-purple-200">💬 {zoxaaResponse}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg text-gray-300">Ready to Start</p>
                <p className="text-sm text-gray-400">Tap the button to begin your conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceChat; 