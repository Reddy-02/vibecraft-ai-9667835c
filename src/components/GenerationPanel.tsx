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
    <Card className="glass-panel p-6 relative overflow-hidden">
      <div className="absolute inset-0 hologram-grid opacity-20" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neon-purple">Auto Generation</h2>
          <Button
            onClick={generateContent}
            disabled={isGenerating}
            className="bg-gradient-to-r from-neon-purple to-neon-pink neon-glow"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Now'}
          </Button>
        </div>

        {wallpaperUrl && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-neon-cyan" />
              <h3 className="font-semibold">Mood Wallpaper</h3>
            </div>
            <div className="rounded-lg overflow-hidden border-2 border-neon-purple/30">
              <img
                src={wallpaperUrl}
                alt="Mood wallpaper"
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        )}

        {affirmations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-neon-cyan" />
              <h3 className="font-semibold">Your Affirmations</h3>
            </div>
            {affirmations.map((affirmation, idx) => (
              <div
                key={idx}
                className="glass-panel p-4 rounded-lg border border-neon-cyan/30 flex items-center justify-between group"
              >
                <p className="text-sm flex-1">{affirmation}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => speakAffirmation(affirmation)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Volume2 className="w-4 h-4 text-neon-cyan" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default GenerationPanel;
