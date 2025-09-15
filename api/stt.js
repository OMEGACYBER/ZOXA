import OpenAI from 'openai';
import { promises as fs } from 'node:fs';
import { createReadStream } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
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

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limiting disabled for development
  // const clientIP = getClientIp(req);
  // const allowed = await checkRateLimit(clientIP, 60, 100);
  // if (!allowed) {
  //   return res.status(429).json({ 
  //     error: 'Rate limit exceeded',
  //     details: 'Too many speech-to-text requests. Please try again later.'
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

    // Allow very short utterances (~250ms) in dev; OpenAI handles small files.
    const minSize = 256; // bytes
    if (audioBuffer.length < minSize) {
      return res.status(400).json({
        error: 'Audio file too small',
        details: `Audio file length ${audioBuffer.length} bytes is less than minimum ${minSize} bytes`,
      });
    }

    console.log('🎤 Processing STT request:', {
      format: audioFormat,
      size: `${(audioBuffer.length / 1024).toFixed(2)}KB`
    });

    // Write to a temp file to ensure proper multipart upload semantics
    const tmpDir = os.tmpdir();
    const filename = `speech-${crypto.randomUUID()}.${audioFormat}`;
    const filepath = path.join(tmpDir, filename);
    await fs.writeFile(filepath, audioBuffer);
    
    let transcription;
    try {
      transcription = await openai.audio.transcriptions.create({
        file: createReadStream(filepath),
        model: 'whisper-1',
        language: 'en',
        response_format: 'json',
        temperature: 0.0,
        prompt: 'This is a conversation with ZOXAA, an AI companion. The speech may contain casual language, emotions, and natural conversation patterns.'
      });
    } finally {
      // Best-effort cleanup
      try { await fs.unlink(filepath); } catch {}
    }

    res.json({
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
      confidence: transcription.confidence || null
    });

  } catch (error) {
    console.error('❌ STT API error:', error);
    const message = error?.message || 'Unknown error';
    const details = error?.response?.data || error?.stack || null;
    if (message.includes('401')) return res.status(401).json({ error: 'Invalid API key', details: 'Please check your OpenAI API key' });
    if (message.includes('429')) return res.status(429).json({ error: 'Rate limit exceeded', details: 'Please try again later' });
    if (message.toLowerCase().includes('file') || message.toLowerCase().includes('format')) {
      return res.status(400).json({ error: 'Invalid audio file', details: message });
    }
    res.status(500).json({ error: 'Failed to transcribe audio', details: message, meta: details });
  }
}
