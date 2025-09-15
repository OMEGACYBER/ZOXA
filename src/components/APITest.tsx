import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const APITest: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<string>('Testing...');
  const [chatStatus, setChatStatus] = useState<string>('Not tested');
  const [ttsStatus, setTtsStatus] = useState<string>('Not tested');
  const [sttStatus, setSttStatus] = useState<string>('Not tested');
  const [chatResponse, setChatResponse] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');

  // Test health endpoint
  const testHealth = async () => {
    try {
      setHealthStatus('Testing...');
      console.log('🔍 Testing health endpoint...');
      
      const response = await fetch('/api/health');
      console.log('📡 Health response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Health data:', data);
        setHealthStatus(`✅ OK - ${data.message}`);
      } else {
        const errorText = await response.text();
        console.error('❌ Health error:', errorText);
        setHealthStatus(`❌ Error - ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Health test failed:', error);
      setHealthStatus(`❌ Failed - ${error.message}`);
    }
  };

  // Test chat endpoint
  const testChat = async () => {
    try {
      setChatStatus('Testing...');
      console.log('🔍 Testing chat endpoint...');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello, this is a test message.' }]
        })
      });
      
      console.log('📡 Chat response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Chat response:', data);
        setChatResponse(data.response);
        setChatStatus(`✅ OK - Response received`);
      } else {
        const errorText = await response.text();
        console.error('❌ Chat error:', errorText);
        setChatStatus(`❌ Error - ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Chat test failed:', error);
      setChatStatus(`❌ Failed - ${error.message}`);
    }
  };

  // Test TTS endpoint
  const testTTS = async () => {
    try {
      setTtsStatus('Testing...');
      console.log('🔍 Testing TTS endpoint...');
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Hello, this is a test of the text to speech system.',
          voice: 'nova',
          speed: 1.0,
          pitch: 1.0,
          volume: 1.0,
          emotion: 'neutral'
        })
      });
      
      console.log('📡 TTS response status:', response.status);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('✅ TTS blob received:', blob.size, 'bytes');
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setTtsStatus(`✅ OK - Audio generated (${blob.size} bytes)`);
      } else {
        const errorText = await response.text();
        console.error('❌ TTS error:', errorText);
        setTtsStatus(`❌ Error - ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ TTS test failed:', error);
      setTtsStatus(`❌ Failed - ${error.message}`);
    }
  };

  // Test STT endpoint (simulated)
  const testSTT = async () => {
    try {
      setSttStatus('Testing...');
      console.log('🔍 Testing STT endpoint...');
      
      // Create a simple test audio blob (this is just for testing the endpoint)
      const testAudioData = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      
      const response = await fetch('/api/stt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: testAudioData.split(',')[1], // Remove data URL prefix
          audioFormat: 'wav'
        })
      });
      
      console.log('📡 STT response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ STT response:', data);
        setSttStatus(`✅ OK - Transcription: "${data.text}"`);
      } else {
        const errorText = await response.text();
        console.error('❌ STT error:', errorText);
        setSttStatus(`❌ Error - ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ STT test failed:', error);
      setSttStatus(`❌ Failed - ${error.message}`);
    }
  };

  // Test all endpoints
  const testAll = async () => {
    console.log('🚀 Starting comprehensive API test...');
    await testHealth();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testChat();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testTTS();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testSTT();
  };

  // Auto-test on mount
  useEffect(() => {
    testAll();
  }, [testAll]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          ZOXAA API Test Suite
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Health Test */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Health Check</h3>
            <p className="text-gray-300 mb-4">{healthStatus}</p>
            <Button onClick={testHealth} className="w-full">
              Test Health
            </Button>
          </Card>

          {/* Chat Test */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Chat API</h3>
            <p className="text-gray-300 mb-4">{chatStatus}</p>
            {chatResponse && (
              <div className="bg-gray-700 p-3 rounded mb-4">
                <p className="text-sm text-gray-300">Response:</p>
                <p className="text-white">{chatResponse}</p>
              </div>
            )}
            <Button onClick={testChat} className="w-full">
              Test Chat
            </Button>
          </Card>

          {/* TTS Test */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Text-to-Speech</h3>
            <p className="text-gray-300 mb-4">{ttsStatus}</p>
            {audioUrl && (
              <div className="mb-4">
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            <Button onClick={testTTS} className="w-full">
              Test TTS
            </Button>
          </Card>

          {/* STT Test */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Speech-to-Text</h3>
            <p className="text-gray-300 mb-4">{sttStatus}</p>
            <Button onClick={testSTT} className="w-full">
              Test STT
            </Button>
          </Card>
        </div>

        {/* Test All Button */}
        <div className="mt-8 text-center">
          <Button onClick={testAll} size="lg" className="bg-purple-600 hover:bg-purple-700">
            Test All APIs
          </Button>
        </div>

        {/* Debug Info */}
        <Card className="mt-8 p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Debug Information</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p>Frontend URL: {window.location.origin}</p>
            <p>API Proxy: /api → http://localhost:3001</p>
            <p>Environment: {import.meta.env.MODE}</p>
            <p>OpenAI API Key: {process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default APITest;
