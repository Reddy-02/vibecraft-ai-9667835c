import { motion } from 'framer-motion';
import { Activity, Cpu, Wifi, Battery, Shield } from 'lucide-react';

type Emotion = 'happy' | 'sad' | 'surprised' | 'neutral' | 'angry';

interface HUDPanelProps {
  position: 'left' | 'right';
  currentMood: Emotion;
  isScanning: boolean;
}

const emotionColors: Record<Emotion, string> = {
  happy: '#FFD700',
  sad: '#4A90D9',
  angry: '#E85454',
  surprised: '#C471ED',
  neutral: '#8B9DC3',
};

const HUDPanel = ({ position, currentMood, isScanning }: HUDPanelProps) => {
  const color = emotionColors[currentMood];

  const leftContent = (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Neural Engine</p>
            <p className="text-sm font-medium text-foreground">MediaPipe v0.10</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Connection</p>
            <p className="text-sm font-medium text-emerald-400">Stable</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Privacy</p>
            <p className="text-sm font-medium text-foreground">Local Only</p>
          </div>
        </div>
      </div>

      {/* Waveform */}
      <div className="mt-6 pt-4 border-t border-border/30">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Neural Activity</p>
        <div className="flex items-end gap-1 h-12">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-current rounded-t"
              style={{ color }}
              animate={{
                height: isScanning 
                  ? `${Math.random() * 100}%` 
                  : `${20 + Math.sin(i * 0.5) * 15}%`,
              }}
              transition={{ duration: 0.2, repeat: isScanning ? Infinity : 0, repeatType: 'reverse' }}
            />
          ))}
        </div>
      </div>
    </>
  );

  const rightContent = (
    <>
      <div className="space-y-4">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Current State</p>
          <div 
            className="text-2xl font-bold tracking-tight capitalize"
            style={{ color }}
          >
            {currentMood}
          </div>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Confidence</p>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: '0%' }}
              animate={{ width: isScanning ? '60%' : '95%' }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-right text-xs text-muted-foreground mt-1">
            {isScanning ? '60%' : '95%'}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">System Status</p>
          <div className="space-y-2">
            {['Face Detection', 'Emotion Analysis', 'Data Processing'].map((item, i) => (
              <div key={item} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item}</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400">Active</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Battery */}
      <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Battery className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">System Power</span>
        </div>
        <span className="text-xs text-emerald-400">100%</span>
      </div>
    </>
  );

  return (
    <motion.div
      className={`hidden lg:block fixed top-1/2 -translate-y-1/2 w-64 z-20 ${
        position === 'left' ? 'left-6' : 'right-6'
      }`}
      initial={{ opacity: 0, x: position === 'left' ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <div className="glass-panel p-5 border-glow">
        {position === 'left' ? leftContent : rightContent}
      </div>
    </motion.div>
  );
};

export default HUDPanel;
