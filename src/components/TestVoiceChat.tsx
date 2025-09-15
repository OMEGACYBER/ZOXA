import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Simple test component to verify ZOXAA is working
const TestVoiceChat: React.FC = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', text: string}>>([]);
  const { toast } = useToast();

  const startCall = async () => {
    try {
      console.log('🚀 Starting test call...');
      
      // Test API health
      const healthResponse = await fetch('/api/health');
      if (!healthResponse.ok) {
        throw new Error('API not responding');
      }
      
      setIsCallActive(true);
      setMessages([]);
      
      // Add greeting
      const greeting = "Hey! I'm ZOXAA. How are you feeling today?";
      setMessages([{ type: 'ai', text: greeting }]);
      
      toast({
        title: "Test Call Started",
        description: "ZOXAA is ready for testing ✨"
      });
      
      console.log('✅ Test call started successfully');
      
    } catch (error) {
      console.error('❌ Test call failed:', error);
      toast({
        title: "Test Failed",
        description: "Could not start test call. Check API server.",
        variant: "destructive"
      });
    }
  };

  const endCall = () => {
    console.log('🔚 Ending test call...');
    setIsCallActive(false);
    setMessages([]);
    
    toast({
      title: "Test Call Ended",
      description: "Test completed successfully 💙"
    });
  };

  const testChat = async () => {
    try {
      const testMessage = "Hello ZOXAA, this is a test message.";
      setMessages(prev => [...prev, { type: 'user', text: testMessage }]);
      
      // Test chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: testMessage }],
          systemPrompt: `You are ZOXAA, a friendly AI companion. Keep responses short, natural, and conversational.`
        })
      });
      
      if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`);
      }
      
      const result = await response.json();
      const aiResponse = result.response;
      
      setMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
      
      toast({
        title: "Chat Test Success",
        description: "ZOXAA responded correctly! 🎉"
      });
      
    } catch (error) {
      console.error('❌ Chat test failed:', error);
      toast({
        title: "Chat Test Failed",
        description: "Could not get AI response.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex-none p-6 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          ZOXAA TEST
        </h1>
        <p className="text-gray-300">Testing ZOXAA System</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-8">
        <div className="max-w-sm mx-auto w-full space-y-6">
          
          {/* Status */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${isCallActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <h3 className="font-semibold text-blue-300">
                {isCallActive ? 'Test Active' : 'Ready for Testing'}
              </h3>
            </div>
            <p className="text-sm text-blue-200/80">
              {isCallActive ? 'ZOXAA is ready for testing' : 'Click start to begin testing'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {isCallActive ? (
              <>
                <Button
                  onClick={endCall}
                  size="lg"
                  className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
                >
                  <PhoneOff className="w-8 h-8" />
                </Button>
                <Button
                  onClick={testChat}
                  size="lg"
                  className="w-32 h-32 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                  Test Chat
                </Button>
              </>
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

          {/* Messages */}
          {messages.length > 0 && (
            <div className="bg-gray-800/20 border border-gray-700/30 rounded-xl p-4 max-h-64 overflow-y-auto">
              <h3 className="font-semibold text-gray-300 mb-3">Test Conversation</h3>
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
              <p>This is a test component to verify ZOXAA is working</p>
              <p className="mt-1">Click start to test the system</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestVoiceChat;
