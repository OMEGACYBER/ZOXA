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

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

    const { audioData, audioFormat = 'mp3' } = req.body || {};
    if (!audioData || !audioFormat) {
      return res.status(400).json({ 
        error: 'Invalid request format',
        details: 'audioData and audioFormat are required'
      });
    }

    const supportedFormats = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
    if (!supportedFormats.includes(audioFormat)) {
      return res.status(400).json({
        error: 'Unsupported audio format',
        details: `Supported formats: ${supportedFormats.join(', ')}`
      });
    }

    if (typeof audioData !== 'string') {
      return res.status(400).json({
        error: 'Invalid audio data',
        details: 'Audio data must be a base64 string'
      });
    }

    let audioBuffer;
    try {
      audioBuffer = Buffer.from(audioData, 'base64');
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid audio data',
        details: 'Audio data must be base64 encoded'
      });
    }

    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioBuffer.length > maxSize) {
      return res.status(400).json({
        error: 'Audio file too large',
        details: `Maximum size is 25MB, received ${(audioBuffer.length / 1024 / 1024).toFixed(2)}MB`
      });
    }

    const minSize = 1024; // 1KB
    if (audioBuffer.length < minSize) {
      return res.status(400).json({
        error: 'Audio file too small',
        details: 'Audio file must be at least 1KB'
      });
    }

    console.log('🎤 Processing STT request:', {
      format: audioFormat,
      size: `${(audioBuffer.length / 1024).toFixed(2)}KB`
    });

    // Use Blob for Node18+ compatibility
    const blob = new Blob([audioBuffer], { type: `audio/${audioFormat}` });

    const transcription = await openai.audio.transcriptions.create({
      file: blob,
      model: 'whisper-1',
      language: 'en',
      response_format: 'json',
      temperature: 0.2
    });

    res.json({
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
      confidence: transcription.confidence || null
    });

  } catch (error) {
    console.error('❌ STT API error:', error);
    if (error.message?.includes('401')) return res.status(401).json({ error: 'Invalid API key', details: 'Please check your OpenAI API key' });
    if (error.message?.includes('429')) return res.status(429).json({ error: 'Rate limit exceeded', details: 'Please try again later' });
    if (error.message?.includes('file')) return res.status(400).json({ error: 'Invalid audio file', details: 'Please check the audio format and data' });
    res.status(500).json({ error: 'Failed to transcribe audio', details: error.message });
  }
}
