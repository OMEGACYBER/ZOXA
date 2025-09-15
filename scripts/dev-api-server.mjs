import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import health from '../api/health.js';
import tts from '../api/tts.js';
import stt from '../api/stt.js';
import chat from '../api/chat.js';

// Warn if OPENAI_API_KEY not present for local dev clarity
if (!process.env.OPENAI_API_KEY) {
  console.warn('[dev-api] OPENAI_API_KEY is not set in your environment. .env.local or .env missing? TTS/STT will fail.');
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.all('/api/health', async (req, res) => {
  try {
    await health(req, res);
  } catch (e) {
    console.error('Local /api/health error:', e);
    res.status(500).json({ error: 'Local health error', details: e?.message });
  }
});

app.all('/api/chat', async (req, res) => {
  try {
    await chat(req, res);
  } catch (e) {
    console.error('Local /api/chat error:', e);
    res.status(500).json({ error: 'Local chat error', details: e?.message });
  }
});

app.all('/api/tts', async (req, res) => {
  try {
    await tts(req, res);
  } catch (e) {
    console.error('Local /api/tts error:', e);
    res.status(500).json({ error: 'Local TTS error', details: e?.message });
  }
});

app.all('/api/stt', async (req, res) => {
  try {
    await stt(req, res);
  } catch (e) {
    console.error('Local /api/stt error:', e);
    res.status(500).json({ error: 'Local STT error', details: e?.message });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Local API server running at http://localhost:${PORT}`);
});
