// Clean Conversation Service for ZOXAA
import ApiService, { ChatMessage } from './ApiService';

export interface ConversationMessage {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface ConversationState {
  messages: ConversationMessage[];
  isActive: boolean;
  isLoading: boolean;
}

export class ConversationService {
  private apiService: ApiService;
  private messages: ConversationMessage[] = [];
  private isActive = false;
  private isLoading = false;
  private systemPrompt: string;
  
  constructor(apiService: ApiService, systemPrompt?: string) {
    this.apiService = apiService;
    this.systemPrompt = systemPrompt || `You are ZOXAA, a friendly AI companion. Keep responses short, natural, and conversational.`;
  }
  
  // Start conversation
  async start(): Promise<void> {
    this.isActive = true;
    this.messages = [];
    
    // Add greeting
    const greeting = "Hey! I'm ZOXAA. How are you feeling today?";
    this.addMessage('ai', greeting);
    
    return this.speak(greeting);
  }
  
  // Stop conversation
  stop(): void {
    this.isActive = false;
    this.messages = [];
  }
  
  // Process user input
  async processUserInput(text: string): Promise<void> {
    if (!this.isActive) return;
    
    // Add user message
    this.addMessage('user', text);
    
    // Get AI response
    await this.getAIResponse(text);
  }
  
  // Process audio input
  async processAudioInput(audioBlob: Blob): Promise<void> {
    if (!this.isActive) return;
    
    try {
      this.setLoading(true);
      
      // Convert audio to base64
      const audioData = await this.apiService.blobToBase64(audioBlob);
      
      // Send to STT
      const sttResponse = await this.apiService.stt({
        audioData,
        audioFormat: 'webm'
      });
      
      const userText = sttResponse.text;
      
      if (userText && userText.trim()) {
        await this.processUserInput(userText);
      }
      
    } catch (error) {
      console.error('Audio processing error:', error);
      this.addMessage('ai', "I'm having trouble understanding. Could you try again?");
    } finally {
      this.setLoading(false);
    }
  }
  
  // Get AI response
  private async getAIResponse(userText: string): Promise<void> {
    try {
      this.setLoading(true);
      
      // Prepare chat messages
      const chatMessages: ChatMessage[] = [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: userText }
      ];
      
      // Get response from AI
      const response = await this.apiService.chat(chatMessages, this.systemPrompt);
      const aiResponse = response.response;
      
      // Add AI message
      this.addMessage('ai', aiResponse);
      
      // Speak the response
      await this.speak(aiResponse);
      
    } catch (error) {
      console.error('AI response error:', error);
      const fallbackResponse = "I'm having trouble connecting right now, but I'm here for you.";
      this.addMessage('ai', fallbackResponse);
      await this.speak(fallbackResponse);
    } finally {
      this.setLoading(false);
    }
  }
  
  // Speak text
  private async speak(text: string): Promise<void> {
    try {
      const audioBlob = await this.apiService.tts({
        text,
        voice: 'nova',
        speed: 1.1,
        pitch: 1.0,
        volume: 1.0,
        emotion: 'friendly',
        ssml: false,
        emotionalModulation: true
      });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = reject;
        audio.play().catch(reject);
      });
      
    } catch (error) {
      console.error('TTS error:', error);
    }
  }
  
  // Add message to conversation
  private addMessage(type: 'user' | 'ai', text: string): void {
    const message: ConversationMessage = {
      id: Date.now().toString(),
      type,
      text,
      timestamp: Date.now()
    };
    
    this.messages.push(message);
  }
  
  // Set loading state
  private setLoading(loading: boolean): void {
    this.isLoading = loading;
  }
  
  // Get conversation state
  getState(): ConversationState {
    return {
      messages: [...this.messages],
      isActive: this.isActive,
      isLoading: this.isLoading
    };
  }
  
  // Get messages
  getMessages(): ConversationMessage[] {
    return [...this.messages];
  }
  
  // Check if conversation is active
  isConversationActive(): boolean {
    return this.isActive;
  }
}

export default ConversationService;
