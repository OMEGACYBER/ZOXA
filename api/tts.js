import OpenAI from 'openai';

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

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
      speed = 1.0, 
      pitch = 1.0,
      volume = 1.0,
      emotion = 'neutral', 
      ssml = false,
      naturalPauses = true,
      emotionalModulation = true
    } = req.body;

    // Input validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request format',
        details: 'text parameter is required and must be a string'
      });
    }

    if (text.length === 0) {
      return res.status(400).json({
        error: 'Empty text',
        details: 'Text cannot be empty'
      });
    }

    if (text.length > 4000) {
      return res.status(400).json({
        error: 'Text too long',
        details: 'Text must be less than 4000 characters for mobile compatibility'
      });
    }

    // Validate voice parameter
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    if (!validVoices.includes(voice)) {
      return res.status(400).json({
        error: 'Invalid voice',
        details: `Voice must be one of: ${validVoices.join(', ')}`
      });
    }

    // Validate numeric parameters
    if (typeof speed !== 'number' || speed < 0.25 || speed > 4.0) {
      return res.status(400).json({
        error: 'Invalid speed',
        details: 'Speed must be a number between 0.25 and 4.0'
      });
    }

    if (typeof pitch !== 'number' || pitch < 0.5 || pitch > 2.0) {
      return res.status(400).json({
        error: 'Invalid pitch',
        details: 'Pitch must be a number between 0.5 and 2.0'
      });
    }

    if (typeof volume !== 'number' || volume < 0.0 || volume > 2.0) {
      return res.status(400).json({
        error: 'Invalid volume',
        details: 'Volume must be a number between 0.0 and 2.0'
      });
    }

    // Simple text processing - no emotional analysis here
    let processedText = text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\*[^*]*\*/g, '') // Remove action tags like *smiles*, *laughs*, etc.
      .trim();

    // Generate SSML if requested by Voice Intelligence system
    let finalText = processedText;
    if (ssml && emotionalModulation) {
      finalText = generateSimpleSSML(processedText, speed, pitch, volume, emotion);
    }

    console.log('🎤 Generating TTS with OpenAI:', {
      voice,
      speed,
      pitch,
      volume,
      emotion,
      ssml,
      textLength: finalText.length
    });

    const response = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: voice,
      input: finalText,
      response_format: 'mp3',
      speed: Math.max(0.25, Math.min(4.0, speed))
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    // Return audio as binary data
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(audioBuffer);

  } catch (error) {
    console.error('❌ TTS API error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('401')) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        details: 'Please check your OpenAI API key'
      });
    }
    
    if (error.message.includes('429')) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        details: 'Please try again later'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error.message 
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