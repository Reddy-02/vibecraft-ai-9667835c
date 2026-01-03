# VibeCraft

A premium mood detection and analytics application built with React, featuring real-time facial emotion recognition powered by MediaPipe.

## Features

- **Real-time Emotion Detection** - Uses MediaPipe's face landmark detection to analyze facial expressions
- **Mood Analytics** - Dynamic weekly chart tracking your emotional patterns
- **AI Assistant (Bujji)** - Interactive orb companion with mood-aware responses
- **Motivational Quotes** - Curated quotes based on your current mood
- **Premium Design** - Minimal black and white aesthetic

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Emotion Detection**: MediaPipe Tasks Vision
- **Charts**: Recharts
- **Routing**: React Router DOM

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── AssistantPanel.tsx    # Bujji AI assistant panel
│   ├── BujjiOrb.tsx          # Animated orb companion
│   ├── FaceEmotionMP.tsx     # MediaPipe emotion detection
│   ├── GenerationPanel.tsx   # Content generation panel
│   ├── MoodAnalytics.tsx     # Weekly mood chart
│   ├── MoodQuotes.tsx        # Mood-based quotes
│   └── ui/                   # shadcn/ui components
├── pages/
│   └── Index.tsx             # Main application page
└── index.css                 # Global styles & design tokens
```

## How It Works

1. Grant camera access when prompted
2. The app analyzes your facial expressions in real-time
3. Detected moods are tracked and displayed in the analytics chart
4. Bujji responds to your emotional state with appropriate messages
5. Quotes update based on your current mood

## License

MIT
