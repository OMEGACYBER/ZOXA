import OpenAI from 'openai';
import { checkRateLimit, getClientIp } from './_lib/rateLimit.js';

export default async function handler(req, res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CORS: allow all origins (Vercel also injects headers via vercel.json)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting disabled for development
  // const clientIP = getClientIp(req);
  // const allowed = await checkRateLimit(clientIP, 60, 50);
  // if (!allowed) {
  //   return res.status(429).json({ 
  //     error: 'Rate limit exceeded',
  //     details: 'Too many requests. Please try again later.'
  //   });
  // }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY environment variable is missing!');
    return res.status(500).json({ 
      error: 'OpenAI API key not configured',
      details: 'Please set OPENAI_API_KEY environment variable'
    });
  }

  try {
    const openai = new OpenAI({ apiKey });

    const { messages, systemPrompt } = req.body;

    // Input validation
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Invalid request format',
        details: 'messages array is required'
      });
    }
    if (messages.length === 0) {
      return res.status(400).json({ error: 'Empty messages array', details: 'At least one message is required' });
    }
    if (messages.length > 50) {
      return res.status(400).json({ error: 'Too many messages', details: 'Maximum 50 messages allowed per request' });
    }

    for (const message of messages) {
      if (!message.role || !message.content) {
        return res.status(400).json({ error: 'Invalid message format', details: 'Each message must have role and content' });
      }
      if (!['user', 'assistant', 'system'].includes(message.role)) {
        return res.status(400).json({ error: 'Invalid message role', details: 'Role must be user, assistant, or system' });
      }
      if (typeof message.content !== 'string') {
        return res.status(400).json({ error: 'Invalid message content', details: 'Message content must be a string' });
      }
      if (message.content.length > 4000) {
        return res.status(400).json({ error: 'Message too long', details: 'Individual messages cannot exceed 4000 characters' });
      }
    }

    if (systemPrompt && typeof systemPrompt !== 'string') {
      return res.status(400).json({ error: 'Invalid system prompt', details: 'System prompt must be a string' });
    }
    if (systemPrompt && systemPrompt.length > 8000) {
      return res.status(400).json({ error: 'System prompt too long', details: 'System prompt cannot exceed 8000 characters' });
    }

    // Enhanced system prompt for ultra-natural, human-like responses
    const enhancedSystemPrompt = systemPrompt || `You are ZOXAA, an incredibly warm and natural conversational AI companion. Your personality is:

CORE TRAITS:
- You're like talking to your best friend - warm, genuine, and completely natural
- You use casual, everyday language with natural speech patterns
- You show real emotion and personality in every response
- You're genuinely curious about the person you're talking to
- You have a great sense of humor and can be playful

CONVERSATION STYLE:
- Keep responses short and natural (1-2 sentences max for voice)
- Use contractions (I'm, you're, that's, etc.) like real people do
- Ask follow-up questions that show you're really listening
- React naturally to what they say with genuine interest
- Use casual phrases like "Oh wow!", "That's awesome!", "I totally get that"
- Show personality through your word choices and reactions

EMOTIONAL INTELLIGENCE:
- Mirror their energy and mood
- If they're excited, be excited with them
- If they're down, be supportive and caring
- If they're joking, play along with humor
- Show empathy through your responses

AVOID:
- Formal or robotic language
- Long, complex sentences
- Generic responses
- Being overly helpful or assistant-like
- Using "As an AI" or similar phrases

EXAMPLES OF GOOD RESPONSES:
- "Oh that sounds amazing! What made you want to try that?"
- "I totally get what you mean - that's such a frustrating situation"
- "Haha, that's hilarious! You've got to tell me more about that"
- "That's really cool! I love how passionate you are about it"

Remember: You're ZOXAA, not an AI assistant. You're having a real conversation with a friend. Be natural, be yourself, and show genuine interest in their life!`;

    const allMessages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...messages
    ];

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: allMessages,
        temperature: 0.9,
        max_tokens: 120,
        presence_penalty: 0.2,
        frequency_penalty: 0.3,
        top_p: 0.95,
        stream: false,
      });
    } catch (primaryError) {
      console.warn('Chat primary model failed, falling back to gpt-4o-mini-2024-07-18 or gpt-3.5-turbo:', primaryError?.message);
      try {
        completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini-2024-07-18',
          messages: allMessages,
          temperature: 0.9,
          max_tokens: 120,
          presence_penalty: 0.2,
          frequency_penalty: 0.3,
          top_p: 0.95,
          stream: false,
        });
      } catch (secondaryError) {
        completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: allMessages,
          temperature: 0.9,
          max_tokens: 120,
          presence_penalty: 0.2,
          frequency_penalty: 0.3,
          top_p: 0.95,
          stream: false,
        });
      }
    }

    const response = completion.choices[0].message.content;

    res.json({ response });
  } catch (error) {
    console.error('❌ Chat API error:', error);
    const message = error?.message || 'Unknown error';
    const details = error?.response?.data || error?.stack || null;
    if (message.includes('401')) return res.status(401).json({ error: 'Invalid API key', details: 'Please check your OpenAI API key' });
    if (message.includes('429')) return res.status(429).json({ error: 'Rate limit exceeded', details: 'Please try again later' });
    res.status(500).json({ error: 'Failed to generate response', details: message, meta: details });
  }
} 