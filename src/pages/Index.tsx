import { useState } from 'react';
import { motion } from 'framer-motion';
import FaceCapture from '@/components/FaceCapture';
import MoodDashboard from '@/components/MoodDashboard';
import BujjiOrb from '@/components/BujjiOrb';

type Emotion = 'happy' | 'sad' | 'surprised' | 'neutral' | 'angry';

const Index = () => {
  const [currentMood, setCurrentMood] = useState<Emotion>('neutral');
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div className="min-h-screen relative bg-background">
      {/* Subtle mesh gradient background */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, hsl(0 0% 12%) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 80% 70%, hsl(0 0% 10%) 0%, transparent 60%)
            `,
          }}
        />
        {/* Subtle dot grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header 
          className="text-center pt-16 pb-6 px-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 backdrop-blur-xl border border-border/50 mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground/60 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-foreground/80" />
            </span>
            <span className="text-[11px] font-medium text-muted-foreground tracking-widest uppercase">
              System Online
            </span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-3 tracking-tighter">
            <span className="text-gradient">VibeCraft</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-light max-w-md mx-auto leading-relaxed">
            Emotion intelligence through neural face analysis
          </p>
        </motion.header>

        {/* Face Capture — Center */}
        <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-64">
          <FaceCapture 
            onEmotionCaptured={setCurrentMood}
            onScanningChange={setIsScanning}
          />
        </div>
      </div>

      {/* Bottom Dashboard */}
      <MoodDashboard currentMood={currentMood} />

      {/* Assistant */}
      <BujjiOrb />
    </div>
  );
};

export default Index;
