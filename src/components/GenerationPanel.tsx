import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Volume2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GenerationPanelProps {
  currentMood: string;
}

const GenerationPanel = ({ currentMood }: GenerationPanelProps) => {
  const [affirmations, setAffirmations] = useState<string[]>([]);
  const [wallpaperUrl, setWallpaperUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContent = async () => {
    setIsGenerating(true);
    toast.info('Generating mood-based content...');

    setTimeout(() => {
      const moodAffirmations: Record<string, string[]> = {
        happy: [
          'Your joy radiates and inspires others!',
          'Happiness looks beautiful on you.',
          'Keep spreading those positive vibes!',
        ],
        sad: [
          'This feeling is temporary, brighter days are ahead.',
          'You are stronger than you know.',
          "It's okay to feel this way. You're not alone.",
        ],
        angry: [
          'Your feelings are valid. Take a deep breath.',
          'Channel this energy into positive change.',
          'You have the power to choose peace.',
        ],
        surprised: [
          'Life is full of wonderful surprises!',
          'Embrace the unexpected moments.',
          'Your sense of wonder is beautiful.',
        ],
        neutral: [
          'Balance is a powerful state of being.',
          'You are exactly where you need to be.',
          'Calmness is your superpower.',
        ],
      };

      const selectedAffirmations = moodAffirmations[currentMood] || moodAffirmations.neutral;
      setAffirmations(selectedAffirmations);
      setWallpaperUrl(`https://picsum.photos/800/600?random=${Date.now()}`);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(selectedAffirmations[0]);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }

      setIsGenerating(false);
      toast.success('Content generated!');
    }, 2000);
  };

  const speakAffirmation = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="glass-panel p-6 lg:p-8 relative overflow-hidden h-full card-hover"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-medium text-foreground mb-1">Enhancement</h2>
            <p className="text-sm text-muted-foreground">AI-powered mood content</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/30">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium capitalize">{currentMood}</span>
          </div>
        </div>

        <Button
          onClick={generateContent}
          disabled={isGenerating}
          className="w-full mb-6 btn-premium text-primary-foreground font-medium py-6 text-sm tracking-wide rounded-xl"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>

        <AnimatePresence mode="wait">
          {wallpaperUrl && (
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Mood Wallpaper
                </h3>
              </div>
              <div className="relative rounded-2xl overflow-hidden group">
                <img
                  src={wallpaperUrl}
                  alt="Generated mood wallpaper"
                  className="w-full rounded-2xl transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {affirmations.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Affirmations
              </h3>
              <div className="space-y-3">
                {affirmations.map((affirmation, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="group p-4 bg-card/40 backdrop-blur-sm rounded-xl flex items-start gap-4 border border-border/20 hover:border-border/40 transition-colors"
                  >
                    <span className="text-xl opacity-70 group-hover:opacity-100 transition-opacity">
                      {index === 0 ? '✦' : index === 1 ? '◆' : '●'}
                    </span>
                    <p className="flex-1 text-sm text-foreground/90 leading-relaxed">
                      {affirmation}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakAffirmation(affirmation)}
                      className="shrink-0 h-8 w-8 p-0 opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default GenerationPanel;
