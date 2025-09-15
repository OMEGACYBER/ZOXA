import React from 'react';
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useZoxaaCore from "@/hooks/useZoxaaCore";

// Production-ready Voice Chat Component
const ProductionVoiceChat: React.FC = () => {
  const { toast } = useToast();
  
  const {
    isCallActive,
    isRecording,
    isPlaying,
    isLoading,
    messages,
    audioLevel,
    startCall,
    endCall,
    startRecording,
    stopRecording
  } = useZoxaaCore();

  const handleStartCall = async () => {
    try {
      await startCall();
      toast({
        title: "Call Started",
        description: "ZOXAA is ready to chat with you ✨"
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      toast({
        title: "Call Failed",
        description: "Could not start the call. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEndCall = () => {
    endCall();
    toast({
      title: "Call Ended",
      description: "Thank you for chatting with ZOXAA 💙"
    });
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not start recording. Please check microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const handleStopRecording = async () => {
    try {
      await stopRecording();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

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
              
              {/* Status Text */}
              <p className="text-sm text-blue-200/80 mt-3">
                {isLoading ? 'Processing...' : 
                 isRecording ? 'Listening...' : 
                 isPlaying ? 'ZOXAA is speaking...' : 
                 'Ready to listen'}
              </p>
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center justify-center mt-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span className="ml-2 text-sm text-blue-300">Processing...</span>
                </div>
              )}
            </div>
          )}

          {/* Call Controls */}
          <div className="flex justify-center space-x-4">
            {/* Main Call Button */}
            {isCallActive ? (
              <Button
                onClick={handleEndCall}
                size="lg"
                className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
                disabled={isLoading}
              >
                <PhoneOff className="w-8 h-8" />
              </Button>
            ) : (
              <Button
                onClick={handleStartCall}
                size="lg"
                className="w-32 h-32 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
              >
                <Phone className="w-8 h-8" />
              </Button>
            )}
            
            {/* Recording Controls (when call is active) */}
            {isCallActive && (
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  size="sm"
                  variant={isRecording ? "destructive" : "secondary"}
                  className="w-12 h-12 rounded-full"
                  disabled={isLoading || isPlaying}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>

          {/* Messages */}
          {messages.length > 0 && (
            <div className="bg-gray-800/20 border border-gray-700/30 rounded-xl p-4 max-h-64 overflow-y-auto">
              <h3 className="font-semibold text-gray-300 mb-3">Conversation</h3>
              {messages.map((message) => (
                <div key={message.id} className={`mb-3 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-xs ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-200'
                  }`}>
                    {message.text}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Instructions */}
          {!isCallActive && (
            <div className="text-center text-gray-400 text-sm">
              <p>Tap the green button to start chatting with ZOXAA</p>
              <p className="mt-1">Make sure your microphone is enabled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionVoiceChat;
