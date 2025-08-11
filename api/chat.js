import { OpenAI } from 'openai';
import { checkRateLimit, getClientIp } from './_lib/rateLimit';

export default async function handler(req, res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Enable CORS with restrictions
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://zoxaa.vercel.app',
    'https://zoxaa-ai.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting (distributed via Upstash when configured)
  const clientIP = getClientIp(req);
  const allowed = await checkRateLimit(clientIP, 60, 10);
  if (!allowed) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      details: 'Too many requests. Please try again later.'
    });
  }

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

    const allMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: allMessages,
      temperature: 0.7,
      max_tokens: 300,
      presence_penalty: 0.05,
      frequency_penalty: 0.05,
    });

    const response = completion.choices[0].message.content;

    res.json({ response });
  } catch (error) {
    console.error('❌ Chat API error:', error);
    if (error.message?.includes('401')) return res.status(401).json({ error: 'Invalid API key', details: 'Please check your OpenAI API key' });
    if (error.message?.includes('429')) return res.status(429).json({ error: 'Rate limit exceeded', details: 'Please try again later' });
    res.status(500).json({ error: 'Failed to generate response', details: error.message });
  }
} 