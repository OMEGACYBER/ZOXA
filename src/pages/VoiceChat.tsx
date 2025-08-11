import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useZoxaaVoice from "@/hooks/useZoxaaVoice";
import { useZoxaaChat } from "@/hooks/useZoxaaChat";

// Add local chat API helper
async function chatWithZoxaaAPI(userText: string, systemPrompt: string): Promise<string> {
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: userText }], systemPrompt })
  });
  const data = await resp.json();
  return data.response || '';
}

const VoiceChat: React.FC = () => {
  const [callActive, setCallActive] = useState(false);
  const [zoxaaResponse, setZoxaaResponse] = useState('');
  const hasGreetedRef = useRef(false);
  
  const { toast } = useToast();
  const { chatWithZoxaa } = useZoxaaChat();
  
  const {
    isRecording,
    isPlaying,
    startRecording,
    stopRecording,
    speakWithEmotion,
    analyzeUserEmotion,
    interruptedRef,
    audioLevel
  } = useZoxaaVoice();

  const startCall = async () => {
    setCallActive(true);
    hasGreetedRef.current = false;
    toast({
      title: "Call Started",
      description: "ZOXAA is ready to chat with you ✨"
    });

    try {
      await startRecording();
      
      // Speak brief greeting while recording continues
      const greeting = "Hey! I'm ZOXAA. How are you feeling right now?";
      await speakWithEmotion(greeting);
      setZoxaaResponse(greeting);
      hasGreetedRef.current = true;
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const endCall = () => {
    setCallActive(false);
    hasGreetedRef.current = false;
    setZoxaaResponse('');
    
    if (isRecording) {
      stopRecording().catch(() => {});
    }
    
    toast({
      title: "Call Ended",
      description: "Thank you for chatting with ZOXAA 💙"
    });
  };

  const handleUserSpeech = async (transcribedText: string) => {
    if (!transcribedText.trim()) return;

    try {
      if (!hasGreetedRef.current) {
        hasGreetedRef.current = true;
      }
      
      // Analyze user emotion to drive voice behavior
      const detectedEmotion = await analyzeUserEmotion(transcribedText);
      
      // Simple ZOXAA system prompt
      const simplePrompt = `You are ZOXAA, a warm and caring AI companion. Keep responses natural and conversational (1-2 sentences max). Be supportive and friendly.`;

      const response = await chatWithZoxaaAPI(transcribedText, simplePrompt);
      
      if (response && response.trim()) {
        await speakWithEmotion(response, detectedEmotion);
        setZoxaaResponse(response);
      } else {
        const fallback = "I hear you, and I'm here for you. Tell me more about what's on your mind.";
        await speakWithEmotion(fallback, detectedEmotion);
        setZoxaaResponse(fallback);
      }
      
    } catch (error) {
      console.error('Error processing user speech:', error);
      toast({
        title: "Error",
        description: "I couldn't process that. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Continuous recording - restart after ZOXAA finishes speaking
  useEffect(() => {
    if (callActive && !isPlaying && !isRecording && hasGreetedRef.current) {
      const timer = setTimeout(() => {
        startRecording().catch((err) => {
          console.error('Failed to restart recording:', err);
        });
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [callActive, isPlaying, isRecording, hasGreetedRef.current, startRecording]);

  // Real-time pause detection tuned for more natural flow
  useEffect(() => {
    if (callActive && isRecording && !isPlaying) {
      let silenceTimer: NodeJS.Timeout | null = null;
      let hasSpoken = false;
      let consecutiveSilence = 0;
      
      const checkForSpeech = () => {
        const currentLevel = audioLevel;
        
        // Detect if user is speaking (audio level above threshold)
        if (currentLevel > 0.12) {
          hasSpoken = true;
          consecutiveSilence = 0;
          
          if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
          }
        } else if (hasSpoken) {
          consecutiveSilence++;
          
          // Process after ~350ms of silence
          if (consecutiveSilence >= 4 && !silenceTimer) {
            silenceTimer = setTimeout(async () => {
              try {
                const transcribedText = await stopRecording();
                if (transcribedText && transcribedText.trim()) {
                  if (interruptedRef?.current) {
                    interruptedRef.current = false;
                    await handleUserSpeech(`Oh okay, so ${transcribedText}`);
                  } else {
                    await handleUserSpeech(transcribedText);
                  }
                }
                setTimeout(() => {
                  if (callActive && !isRecording) {
                    startRecording().catch(() => {});
                  }
                }, 120);
              } catch (err) {
                console.error('Failed to process speech:', err);
                setTimeout(() => {
                  if (callActive && !isRecording) {
                    startRecording().catch(() => {});
                  }
                }, 120);
              }
            }, 350);
          }
        }
      };
      
      const interval = setInterval(checkForSpeech, 90);
      
      return () => {
        clearInterval(interval);
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }
      };
    }
  }, [callActive, isRecording, isPlaying, stopRecording, startRecording, interruptedRef, audioLevel]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Simple Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ZOXAA</h1>
          <p className="text-gray-600">Your AI Companion</p>
        </div>

        {/* Main Call Interface */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Simple Status Display */}
          <div className="text-center space-y-2">
            {callActive ? (
              <>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  {isRecording && <Mic className="w-4 h-4 text-red-500 animate-pulse" />}
                  {isPlaying && <Volume2 className="w-4 h-4 text-blue-500 animate-pulse" />}
                  <span>
                    {isRecording ? "Listening..." : isPlaying ? "ZOXAA is speaking..." : "Ready"}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Tap to start your conversation</p>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex justify-center">
            {callActive ? (
              <Button
                onClick={endCall}
                size="lg"
                variant="destructive"
                className="px-8 py-4 rounded-full"
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                End Call
              </Button>
            ) : (
              <Button
                onClick={startCall}
                size="lg"
                variant="default"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Phone className="w-5 h-5 mr-2" />
                Start Call
              </Button>
            )}
          </div>
        </div>

        {/* Simple Instructions */}
        <div className="text-center text-sm text-gray-500">
          {callActive ? (
            <p>Just talk naturally - ZOXAA will respond automatically</p>
          ) : (
            <p>Start a voice conversation with your AI companion</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceChat; 