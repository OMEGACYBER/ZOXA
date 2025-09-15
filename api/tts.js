import OpenAI from 'openai';
import { checkRateLimit, getClientIp } from './_lib/rateLimit.js';
import crypto from 'crypto';

// Simple in-memory cache for TTS responses
const ttsCache = new Map();
const CACHE_MAX_SIZE = 1000; // Maximum number of cached responses
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientIP = getClientIp(req);
  const allowed = await checkRateLimit(clientIP, 60, 8); // 8 requests per minute for TTS
  if (!allowed) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      details: 'Too many text-to-speech requests. Please try again later.'
    });
  }

  // Check if API key is available
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY environment variable is missing!');
    return res.status(500).json({ 
      error: 'OpenAI API key not configured',
      details: 'Please set OPENAI_API_KEY environment variable'
    });
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey
    });

    const { 
      text, 
      voice = 'nova', 
      speed = 1.1, // Slightly faster for better responsiveness
      pitch = 1.0,
      volume = 1.0,
      emotion = 'neutral', 
      ssml = false,
      naturalPauses = false, // Disable for speed
      emotionalModulation = true // Enable for better human-like voice
    } = req.body;

    // Fast input validation
    if (!text || typeof text !== 'string' || text.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid text',
        details: 'Text is required and must be a non-empty string'
      });
    }

    // Optimized length check for better performance
    if (text.length > 300) {
      return res.status(400).json({
        error: 'Text too long',
        details: 'Text must be less than 300 characters for optimal voice generation speed'
      });
    }

    // Minimal text processing for maximum speed
    let processedText = text.trim();

    console.log('🎤 Generating TTS with OpenAI:', {
      voice,
      textLength: processedText.length
    });

    // Create cache key for this request
    const cacheKey = crypto.createHash('md5')
      .update(`${processedText}-${voice}-${speed}-${pitch}-${volume}-${emotion}`)
      .digest('hex');

    // Check cache first
    if (ttsCache.has(cacheKey)) {
      const cached = ttsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('🎤 TTS Cache HIT:', cacheKey.substring(0, 8));
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', cached.audioBuffer.length);
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=172800'); // 24h cache
        res.setHeader('X-Cache', 'HIT');
        return res.send(cached.audioBuffer);
      } else {
        ttsCache.delete(cacheKey); // Remove expired cache
      }
    }

    console.log('🎤 TTS Cache MISS:', cacheKey.substring(0, 8));

    // Add emotional context to text for better voice modulation
    let enhancedText = processedText;
    if (emotionalModulation && emotion !== 'neutral') {
      enhancedText = `[${emotion} tone] ${processedText}`;
    }

    // Use widely available TTS model; prefer gpt-4o-mini-tts, fallback to tts-1
    let response;
    try {
      response = await openai.audio.speech.create({
        model: 'gpt-4o-mini-tts',
        voice: voice,
        input: enhancedText,
        response_format: 'mp3',
        speed: 1.1
      });
    } catch (primaryError) {
      console.warn('TTS primary model failed, falling back to tts-1:', primaryError?.message);
      response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voice,
        input: enhancedText,
        response_format: 'mp3',
        speed: 1.1
      });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    // Cache the response
    if (ttsCache.size >= CACHE_MAX_SIZE) {
      // Remove oldest entries when cache is full
      const firstKey = ttsCache.keys().next().value;
      ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, {
      audioBuffer,
      timestamp: Date.now()
    });

    // Return audio as binary data with optimized caching and compression
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=7200'); // Better caching strategy
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader('X-Cache', 'MISS');
    res.send(audioBuffer);

  } catch (error) {
    console.error('❌ TTS API error:', error);
    const message = error?.message || 'Unknown error';
    const details = error?.response?.data || error?.stack || null;
    if (message.includes('401')) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        details: 'Please check your OpenAI API key'
      });
    }
    if (message.includes('429')) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        details: 'Please try again later'
      });
    }
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: message,
      meta: details
    });
  }
}

// Helper function to generate SSML for emotional modulation
function generateSimpleSSML(text, speed, pitch, volume, emotion) {
  // Convert speed to prosody rate
  const speedValue = speed >= 1.0 ? `+${Math.round((speed - 1) * 100)}%` : `${Math.round((speed - 1) * 100)}%`;
  const pitchValue = Math.round((pitch - 1) * 100);
  const volumeValue = Math.round((volume - 1) * 20);

  // Emotional enhancements based on emotion
  let emotionalEnhancements = '';
  switch (emotion.toLowerCase()) {
    case 'happy':
      emotionalEnhancements = '<prosody rate="+5%" pitch="+5%">';
      break;
    case 'sad':
      emotionalEnhancements = '<prosody rate="-10%" pitch="-5%">';
      break;
    case 'excited':
      emotionalEnhancements = '<prosody rate="+15%" pitch="+10%">';
      break;
    case 'calm':
      emotionalEnhancements = '<prosody rate="-5%" pitch="-2%">';
      break;
    case 'concerned':
      emotionalEnhancements = '<prosody rate="-8%" pitch="-3%">';
      break;
    case 'angry':
      emotionalEnhancements = '<prosody rate="+10%" pitch="+8%">';
      break;
    case 'fear':
      emotionalEnhancements = '<prosody rate="+5%" pitch="+12%">';
      break;
    case 'surprise':
      emotionalEnhancements = '<prosody rate="+8%" pitch="+15%">';
      break;
    case 'disgust':
      emotionalEnhancements = '<prosody rate="-5%" pitch="-8%">';
      break;
    case 'contempt':
      emotionalEnhancements = '<prosody rate="-15%" pitch="-5%">';
      break;
    case 'relief':
      emotionalEnhancements = '<prosody rate="-5%" pitch="+2%">';
      break;
    case 'pride':
      emotionalEnhancements = '<prosody rate="+5%" pitch="+8%">';
      break;
    case 'shame':
      emotionalEnhancements = '<prosody rate="-10%" pitch="-8%">';
      break;
    case 'sarcasm':
      emotionalEnhancements = '<prosody rate="+10%" pitch="+12%">';
      break;
    default:
      emotionalEnhancements = '';
  }

  if (emotionalEnhancements) {
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
      <prosody rate="${speedValue}" pitch="${pitchValue}%" volume="${volumeValue}dB">
        ${emotionalEnhancements}${text}</prosody>
      </prosody>
    </speak>`;
  } else {
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
      <prosody rate="${speedValue}" pitch="${pitchValue}%" volume="${volumeValue}dB">
        ${text}
      </prosody>
    </speak>`;
  }
} 