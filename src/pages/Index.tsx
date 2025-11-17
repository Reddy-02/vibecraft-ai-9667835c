import { useState } from 'react';
import Particles from '@/components/Particles';
import FaceEmotionMP from '@/components/FaceEmotionMP';
import BujjiOrb from '@/components/BujjiOrb';
import MoodAnalytics from '@/components/MoodAnalytics';
import MoodQuotes from '@/components/MoodQuotes';
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
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Subtle Background Effects */}
      <div
        className="fixed inset-0 transition-all duration-1000 pointer-events-none opacity-30"
        style={{ background: moodGradients[currentMood] }}
      />

      {/* Minimal Grid */}
      <div className="fixed inset-0 minimal-grid opacity-40 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center pt-12 pb-8 px-4">
          <h1 className="text-5xl md:text-6xl font-light mb-3 text-foreground tracking-tight">
            VibeCraft
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            Emotion Detection & Mood Enhancement
          </p>
        </header>

        {/* Main Grid */}
        <div className="flex-1 container mx-auto px-4 pb-24">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emotion Detection */}
            <FaceEmotionMP onEmotionDetected={setCurrentMood} />

            {/* Generation Panel */}
            <GenerationPanel currentMood={currentMood} />
          </div>

          {/* Mood Quotes */}
          <div className="max-w-7xl mx-auto mt-6">
            <MoodQuotes currentMood={currentMood} />
          </div>

          {/* Analytics */}
          <div className="max-w-7xl mx-auto mt-6">
            <MoodAnalytics />
          </div>
        </div>
      </div>

      {/* Bujji Orb Assistant */}
      <BujjiOrb />
    </div>
  );
};

export default Index;
