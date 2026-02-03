import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Quote, Volume2, VolumeX, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Emotion = 'happy' | 'sad' | 'surprised' | 'neutral' | 'angry';

interface MoodDashboardProps {
  currentMood: Emotion;
}

const moodColors: Record<Emotion, { primary: string; gradient: string }> = {
  happy: { primary: '#FFD700', gradient: 'url(#gradient-happy)' },
  sad: { primary: '#4A90D9', gradient: 'url(#gradient-sad)' },
  angry: { primary: '#E85454', gradient: 'url(#gradient-angry)' },
  surprised: { primary: '#C471ED', gradient: 'url(#gradient-surprised)' },
  neutral: { primary: '#8B9DC3', gradient: 'url(#gradient-neutral)' },
};

const moodQuotes: Record<Emotion, string[]> = {
  happy: [
    "Your joy creates ripples of positivity around you.",
    "Happiness is your natural state. Embrace it fully.",
    "Your smile has the power to brighten someone's day.",
  ],
  sad: [
    "This feeling is temporary. The sun will rise again.",
    "It's okay to feel. Your emotions make you human.",
    "Every storm runs out of rain. Stay strong.",
  ],
  angry: [
    "Take a breath. You have the power to choose peace.",
    "Channel this energy into positive transformation.",
    "Anger is a signal. Listen to what it's telling you.",
  ],
  surprised: [
    "Life is full of beautiful unexpected moments.",
    "Stay curious. The universe loves to surprise us.",
    "Wonder is the beginning of wisdom.",
  ],
  neutral: [
    "Balance is a powerful state of being.",
    "In stillness, we find our center.",
    "Calmness is your superpower. Use it wisely.",
  ],
};

const MoodDashboard = ({ currentMood }: MoodDashboardProps) => {
  const [expanded, setExpanded] = useState(true);
  const [quote, setQuote] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [moodData, setMoodData] = useState<any[]>([]);

  useEffect(() => {
    const quotes = moodQuotes[currentMood];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [currentMood]);

  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem('moodHistory');
      if (stored) {
        setMoodData(JSON.parse(stored));
      }
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const speakQuote = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(quote);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel-elevated p-3 rounded-xl border border-border/50">
          <p className="text-xs font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke }} />
              <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
              <span className="text-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-30"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      <div className="glass-panel-elevated border-t border-border/50 mx-4 mb-4 rounded-2xl overflow-hidden">
        {/* Toggle Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: `${moodColors[currentMood].primary}20` }}>
              <Sparkles className="w-5 h-5" style={{ color: moodColors[currentMood].primary }} />
            </div>
            <div className="text-left">
              <h3 className="text-base font-semibold text-foreground">Mood Insights</h3>
              <p className="text-xs text-muted-foreground">Analytics & Affirmations</p>
            </div>
          </div>
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quote Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Quote className="w-4 h-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Affirmation
                    </h4>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    <motion.blockquote
                      key={quote}
                      className="text-lg font-light text-foreground leading-relaxed"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      "{quote}"
                    </motion.blockquote>
                  </AnimatePresence>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={speakQuote}
                    className="h-9 px-4 rounded-full bg-muted/30 hover:bg-muted/50"
                  >
                    {isSpeaking ? (
                      <><Volume2 className="w-4 h-4 mr-2" /> Speaking...</>
                    ) : (
                      <><VolumeX className="w-4 h-4 mr-2" /> Listen</>
                    )}
                  </Button>
                </div>

                {/* Chart Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Today's Patterns
                    </h4>
                  </div>

                  {moodData.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
                      No data yet. Scan your face to start tracking.
                    </div>
                  ) : (
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={moodData}>
                          <defs>
                            {Object.entries(moodColors).map(([key, value]) => (
                              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={value.primary} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={value.primary} stopOpacity={0} />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" opacity={0.3} vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="hsl(0 0% 40%)" 
                            style={{ fontSize: '10px' }}
                            tickLine={false}
                          />
                          <YAxis hide />
                          <Tooltip content={<CustomTooltip />} />
                          {Object.entries(moodColors).map(([key, value]) => (
                            <Area
                              key={key}
                              type="monotone"
                              dataKey={key}
                              stroke={value.primary}
                              fill={value.gradient}
                              strokeWidth={2}
                            />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MoodDashboard;
