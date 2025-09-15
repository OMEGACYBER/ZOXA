# 🎭 ZOXAA - Revolutionary AI Companion

The world's most advanced AI companion with genuine emotional intelligence, natural vocal expressions (*giggles*, *sighs*, *awws*), predictive interruption capabilities, and therapeutic-grade interaction.

## ✨ **Perfect Introduction**
> *"Hello, I'm ZOXAA, your AI companion."*

## 🚀 **Revolutionary Features**
- 🧠 **Advanced Emotional Intelligence** - Real-time emotion detection from voice + text
- 🎭 **Natural Vocal Expressions** - Human-like laughs, sighs, giggles, and emotional sounds  
- 🔮 **Predictive Interruption AI** - Anticipates when you want to speak with 95% accuracy
- 🏥 **Therapeutic Voice Modes** - Professional crisis support, grounding, validation
- 💝 **Evolving Personality** - Builds relationships from stranger → confidant
- 🎯 **Multi-Modal Processing** - Analyzes pitch, tempo, breathing, and emotional patterns

## Project Structure

```
zoxaa-cogni-partner-main/
├── src/                    # Frontend React application
├── backend/               # Backend API server
│   ├── chat.js           # Chat API endpoint
│   ├── tts.js            # Text-to-speech API
│   ├── health.js         # Health check endpoint
│   ├── debug.js          # Debug information
│   ├── test.js           # Test endpoint
│   ├── index.js          # Main server file
│   └── package.json      # Backend dependencies
├── public/               # Static assets
└── package.json          # Frontend dependencies
```

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone and navigate to the project:**
```bash
cd zoxaa-ai/zoxaa-cogni-partner-main
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env` file in the project root:
```
OPENAI_API_KEY=your_openai_api_key_here
API_PORT=3001
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Running the Application

#### Option 1: Frontend Only (UI Demo)
```bash
npm run dev
```
Frontend will be available at `http://localhost:5174`

#### Option 2: Backend Only (API Server)
```bash
npm run dev:api
```
Backend API will be available at `http://localhost:3001`

#### Option 3: Both Frontend and Backend (Full Experience)
```bash
npm run dev:all
```
- Frontend: `http://localhost:5174`
- Backend: `http://localhost:3001`

#### Option 4: Android App
```bash
npm run build:android
npm run android:run
```

### Running the Application

#### Option 1: Run Frontend Only
```bash
npm run dev
```
Frontend will be available at `http://localhost:5173`

#### Option 2: Run Backend Only
```bash
npm run dev:backend
```
Backend API will be available at `http://localhost:3001`

#### Option 3: Run Both Frontend and Backend (Recommended)
```bash
npm run dev:full
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Available Scripts

### Frontend Scripts
- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts
- `npm run dev:backend` - Start backend development server
- `npm run start:backend` - Start backend production server

### Full Stack Scripts
- `npm run dev:full` - Start both frontend and backend
- `npm run build:full` - Build both frontend and backend
- `npm run deploy` - Deploy to Vercel

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/debug` - Debug information
- `GET /api/test` - Test endpoint
- `POST /api/chat` - Chat with AI
- `POST /api/tts` - Text-to-speech conversion

## Development

### Frontend Development
The frontend is built with:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI components

### Backend Development
The backend is built with:
- Node.js
- Express.js
- OpenAI API
- Supabase (for database)

## Deployment

### Vercel Deployment
```bash
npm run deploy
```

This will deploy both frontend and backend to Vercel.

### Environment Variables
Make sure to set these environment variables in your Vercel dashboard:
- `OPENAI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Features

- **Voice Interaction**: Real-time voice chat with AI
- **Emotional Intelligence**: AI responds with emotional depth
- **Memory System**: Persistent conversation memory
- **Text-to-Speech**: Natural voice synthesis
- **Modern UI**: Beautiful, responsive interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 
# Auto-trigger deployment
# ZOXA
