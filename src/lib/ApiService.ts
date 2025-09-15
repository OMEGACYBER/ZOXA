// Clean API Service for ZOXAA
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  response: string;
}

export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
  emotion?: string;
  ssml?: boolean;
  emotionalModulation?: boolean;
}

export interface STTRequest {
  audioData: string;
  audioFormat: string;
}

export interface STTResponse {
  text: string;
}

export class ApiService {
  private baseUrl: string;
  
  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }
  
  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: number }> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }
  
  // Chat with AI
  async chat(messages: ChatMessage[], systemPrompt?: string): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt })
    });
    
    if (!response.ok) {
      throw new Error(`Chat API error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Text-to-Speech
  async tts(request: TTSRequest): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`TTS API error: ${response.statusText}`);
    }
    
    return response.blob();
  }
  
  // Speech-to-Text
  async stt(request: STTRequest): Promise<STTResponse> {
    const response = await fetch(`${this.baseUrl}/api/stt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`STT API error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Convert blob to base64
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export default ApiService;
