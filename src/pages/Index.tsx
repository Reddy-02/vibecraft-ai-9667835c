import { useState } from 'react';
import Particles from '@/components/Particles';
import FaceEmotionMP from '@/components/FaceEmotionMP';
import BujjiOrb from '@/components/BujjiOrb';
import MoodAnalytics from '@/components/MoodAnalytics';
import GenerationPanel from '@/components/GenerationPanel';

type Emotion = 'happy' | 'sad' | 'surprised' | 'neutral' | 'angry';

const Index = () => {
  const [currentMood, setCurrentMood] = useState<Emotion>('neutral');

  const moodGradients: Record<Emotion, string> = {
    happy: 'radial-gradient(circle at 50% 50%, hsl(45 100% 60% / 0.15), transparent 70%)',
    sad: 'radial-gradient(circle at 50% 50%, hsl(210 80% 60% / 0.15), transparent 70%)',
    angry: 'radial-gradient(circle at 50% 50%, hsl(0 80% 60% / 0.15), transparent 70%)',
    surprised: 'radial-gradient(circle at 50% 50%, hsl(280 100% 70% / 0.15), transparent 70%)',
    neutral: 'radial-gradient(circle at 50% 50%, hsl(240 5% 50% / 0.15), transparent 70%)',
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Particles Background */}
      <Particles />

      {/* Mood-Adaptive Background */}
      <div
        className="fixed inset-0 transition-all duration-1000 pointer-events-none"
        style={{ background: moodGradients[currentMood] }}
      />

      {/* Hologram Grid Overlay */}
      <div className="fixed inset-0 hologram-grid opacity-10 pointer-events-none" />

      {/* Scan Line Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent animate-scan-line" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
            VibeCraft Advanced
          </h1>
          <p className="text-lg text-muted-foreground">
            AI-Powered Emotion Detection & Mood Enhancement System
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Emotion Detection */}
          <FaceEmotionMP onEmotionDetected={setCurrentMood} />

          {/* Generation Panel */}
          <GenerationPanel currentMood={currentMood} />
        </div>

        {/* Analytics */}
        <MoodAnalytics />
      </div>

      {/* Bujji Orb Assistant */}
      <BujjiOrb />
    </div>
  );
};

export default Index;
