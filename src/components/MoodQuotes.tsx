import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Quote } from 'lucide-react';

type Emotion = 'happy' | 'sad' | 'surprised' | 'neutral' | 'angry';

interface MoodQuotesProps {
  currentMood: Emotion;
}

const moodQuotes: Record<Emotion, string[]> = {
  happy: [
    "Your smile is contagious. Keep spreading joy!",
    "Happiness looks beautiful on you.",
    "You're radiating positive energy today!",
  ],
  sad: [
    "It's okay to feel this way. Tomorrow is a new day.",
    "Your feelings are valid. Take your time to heal.",
    "Even the darkest night will end and the sun will rise.",
  ],
  angry: [
    "Take a deep breath. You're in control of your emotions.",
    "Channel this energy into something positive.",
    "Anger is temporary. Peace is your true nature.",
  ],
  surprised: [
    "Life is full of wonderful surprises!",
    "Stay curious and open to new experiences.",
    "Your sense of wonder makes life exciting!",
  ],
  neutral: [
    "Balance is the key to inner peace.",
    "You're exactly where you need to be.",
    "Calmness is a superpower.",
  ],
};

const MoodQuotes = ({ currentMood }: MoodQuotesProps) => {
  const [quote, setQuote] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices.slice(0, 5));
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    const quotes = moodQuotes[currentMood];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
    
    speakQuote(randomQuote);
  }, [currentMood]);

  const speakQuote = (text: string) => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (availableVoices[selectedVoice]) {
      utterance.voice = availableVoices[selectedVoice];
    }
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      speakQuote(quote);
    }
  };

  return (
    <motion.div 
      className="glass-panel p-6 lg:p-8 card-hover"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center">
            <Quote className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-foreground">Mood Message</h2>
            <p className="text-sm text-muted-foreground">Personalized affirmation</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSpeak}
          className="h-10 w-10 rounded-xl hover:bg-muted/40 transition-colors"
        >
          {isSpeaking ? (
            <Volume2 className="h-5 w-5 text-foreground" />
          ) : (
            <VolumeX className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.blockquote
          key={quote}
          className="text-xl md:text-2xl font-light text-foreground/90 leading-relaxed mb-8 pl-6 border-l-2 border-muted-foreground/30"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4 }}
        >
          {quote}
        </motion.blockquote>
      </AnimatePresence>

      <div className="space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Select Voice
        </p>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4].map((index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedVoice(index)}
              className={`
                h-9 px-4 rounded-full text-xs font-medium transition-all
                ${selectedVoice === index 
                  ? 'bg-foreground text-background hover:bg-foreground/90' 
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-border/30'
                }
              `}
            >
              Voice {index + 1}
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MoodQuotes;
