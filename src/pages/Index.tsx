import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FaceEmotionMP from '@/components/FaceEmotionMP';
import BujjiOrb from '@/components/BujjiOrb';
import MoodAnalytics from '@/components/MoodAnalytics';
import MoodQuotes from '@/components/MoodQuotes';
import GenerationPanel from '@/components/GenerationPanel';

type Emotion = 'happy' | 'sad' | 'surprised' | 'neutral' | 'angry';

const Index = () => {
  const [currentMood, setCurrentMood] = useState<Emotion>('neutral');

  const moodAccents: Record<Emotion, { gradient: string; glow: string }> = {
    happy: {
      gradient: 'radial-gradient(ellipse at 50% 0%, hsl(48 100% 67% / 0.12) 0%, transparent 50%)',
      glow: 'hsl(48 100% 67% / 0.15)',
    },
    sad: {
      gradient: 'radial-gradient(ellipse at 50% 0%, hsl(210 70% 55% / 0.12) 0%, transparent 50%)',
      glow: 'hsl(210 70% 55% / 0.15)',
    },
    angry: {
      gradient: 'radial-gradient(ellipse at 50% 0%, hsl(0 65% 55% / 0.12) 0%, transparent 50%)',
      glow: 'hsl(0 65% 55% / 0.15)',
    },
    surprised: {
      gradient: 'radial-gradient(ellipse at 50% 0%, hsl(280 80% 68% / 0.12) 0%, transparent 50%)',
      glow: 'hsl(280 80% 68% / 0.15)',
    },
    neutral: {
      gradient: 'radial-gradient(ellipse at 50% 0%, hsl(220 10% 54% / 0.08) 0%, transparent 50%)',
      glow: 'hsl(220 10% 54% / 0.10)',
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Ambient Background */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        animate={{ 
          background: moodAccents[currentMood].gradient,
          opacity: 1 
        }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
      
      {/* Subtle Grid */}
      <div className="fixed inset-0 minimal-grid opacity-50 pointer-events-none" />
      
      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header 
          className="text-center pt-16 pb-12 px-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/30 backdrop-blur-md border border-border/30 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
              Live Detection Active
            </span>
          </motion.div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extralight mb-4 text-gradient tracking-tight">
            VibeCraft
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-light max-w-md mx-auto leading-relaxed">
            Real-time emotion intelligence powered by advanced facial recognition
          </p>
        </motion.header>

        {/* Main Grid */}
        <div className="flex-1 container mx-auto px-4 md:px-6 pb-32">
          <motion.div 
            className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Emotion Detection */}
            <FaceEmotionMP onEmotionDetected={setCurrentMood} />

            {/* Generation Panel */}
            <GenerationPanel currentMood={currentMood} />
          </motion.div>

          {/* Mood Quotes */}
          <motion.div 
            className="max-w-7xl mx-auto mt-6 lg:mt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <MoodQuotes currentMood={currentMood} />
          </motion.div>

          {/* Analytics */}
          <motion.div 
            className="max-w-7xl mx-auto mt-6 lg:mt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <MoodAnalytics />
          </motion.div>
        </div>
        
        {/* Footer */}
        <motion.footer 
          className="py-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-xs text-muted-foreground/50 font-light tracking-wide">
            Built with precision • Powered by MediaPipe
          </p>
        </motion.footer>
      </div>

      {/* Bujji Orb Assistant */}
      <BujjiOrb />
    </div>
  );
};

export default Index;
