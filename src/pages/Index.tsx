import { useState } from 'react';
import { motion } from 'framer-motion';
import Scene3D from '@/components/Scene3D';
import FaceCapture from '@/components/FaceCapture';
import HUDPanel from '@/components/HUDPanel';
import MoodDashboard from '@/components/MoodDashboard';

type Emotion = 'happy' | 'sad' | 'surprised' | 'neutral' | 'angry';

const Index = () => {
  const [currentMood, setCurrentMood] = useState<Emotion>('neutral');
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* 3D Background Scene */}
      <Scene3D currentMood={currentMood} isScanning={isScanning} />

      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/90 pointer-events-none z-[1]" />

      {/* Scanlines effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-[2] opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header 
          className="text-center pt-12 pb-8 px-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/20 backdrop-blur-xl border border-border/30 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-xs font-medium text-cyan-400 tracking-wider uppercase">
              System Online
            </span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tighter">
            <span className="text-gradient">VibeCraft</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-light max-w-lg mx-auto">
            Advanced emotion intelligence with neural face analysis
          </p>
        </motion.header>

        {/* HUD Panels */}
        <HUDPanel position="left" currentMood={currentMood} isScanning={isScanning} />
        <HUDPanel position="right" currentMood={currentMood} isScanning={isScanning} />

        {/* Face Capture - Center */}
        <div className="flex-1 flex items-center justify-center px-4 pb-48">
          <FaceCapture 
            onEmotionCaptured={setCurrentMood}
            onScanningChange={setIsScanning}
          />
        </div>
      </div>

      {/* Bottom Dashboard */}
      <MoodDashboard currentMood={currentMood} />
    </div>
  );
};

export default Index;
