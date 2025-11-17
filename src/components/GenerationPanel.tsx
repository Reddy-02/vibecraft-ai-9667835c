import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Image as ImageIcon, MessageSquare, Volume2 } from 'lucide-react';
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

    // Simulate generation
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
          'It\'s okay to feel this way. You\'re not alone.',
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
      
      // Auto-play first affirmation
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

  return (
    <Card className="glass-panel p-6 relative overflow-hidden premium-glow h-full">
      <div className="relative z-10">
        <h2 className="text-xl font-light mb-6 text-foreground">Enhancement</h2>

        <Button
          onClick={generateContent}
          disabled={isGenerating}
          className="w-full mb-6 bg-primary hover:bg-primary/90 text-primary-foreground font-light py-6 text-base premium-glow-strong transition-all"
        >
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </Button>

        {wallpaperUrl && (
          <div className="mb-6">
            <h3 className="text-sm font-light mb-3 text-muted-foreground uppercase tracking-wider">Mood Wallpaper</h3>
            <img
              src={wallpaperUrl}
              alt="Generated mood wallpaper"
              className="w-full rounded-lg border border-border/50"
            />
          </div>
        )}

        {affirmations.length > 0 && (
          <div>
            <h3 className="text-sm font-light mb-3 text-muted-foreground uppercase tracking-wider">Affirmations</h3>
            <div className="space-y-3">
              {affirmations.map((affirmation, index) => (
                <div
                  key={index}
                  className="p-4 bg-card/50 backdrop-blur-sm rounded-lg flex items-start gap-3 border border-border/30"
                >
                  <span className="text-xl opacity-60">{index === 0 ? '🌟' : index === 1 ? '💫' : '✨'}</span>
                  <div className="flex-1">
                    <p className="text-foreground text-sm">{affirmation}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakAffirmation(affirmation)}
                    className="shrink-0 hover:bg-primary/10"
                  >
                    🔊
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GenerationPanel;
