import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

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

const voiceNames = ['Google US English', 'Google UK English Female', 'Google UK English Male', 'Microsoft Zira', 'Microsoft David'];

const MoodQuotes = ({ currentMood }: MoodQuotesProps) => {
  const [quote, setQuote] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices.slice(0, 5)); // Get first 5 voices
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    const quotes = moodQuotes[currentMood];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
    
    // Auto-play with selected voice
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
    <Card className="glass-panel p-6 premium-glow">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-xl font-light text-foreground">Mood Message</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSpeak}
          className="h-8 w-8"
        >
          {isSpeaking ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
      </div>

      <p className="text-foreground/90 text-lg font-light leading-relaxed mb-6">
        "{quote}"
      </p>

      <div className="space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Select Voice</p>
        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 4].map((index) => (
            <Button
              key={index}
              variant={selectedVoice === index ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedVoice(index)}
              className="text-xs h-9"
            >
              Voice {index + 1}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default MoodQuotes;
