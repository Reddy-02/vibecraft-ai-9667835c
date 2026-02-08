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
  happy: { primary: 'hsl(48, 100%, 55%)', gradient: 'url(#gradient-happy)' },
  sad: { primary: 'hsl(210, 80%, 55%)', gradient: 'url(#gradient-sad)' },
  angry: { primary: 'hsl(0, 75%, 55%)', gradient: 'url(#gradient-angry)' },
  surprised: { primary: 'hsl(280, 85%, 65%)', gradient: 'url(#gradient-surprised)' },
  neutral: { primary: 'hsl(0, 0%, 55%)', gradient: 'url(#gradient-neutral)' },
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
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <div className="glass-panel-elevated border-t border-border/40 mx-4 mb-4 rounded-2xl overflow-hidden">
        {/* Toggle Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-accent/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center border border-border/40">
              <Sparkles className="w-4 h-4 text-foreground/60" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-foreground">Mood Insights</h3>
              <p className="text-[11px] text-muted-foreground">Analytics & Affirmations</p>
            </div>
          </div>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
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
              <div className="px-5 pb-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Quote Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Quote className="w-3.5 h-3.5 text-muted-foreground" />
                    <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                      Affirmation
                    </h4>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    <motion.blockquote
                      key={quote}
                      className="text-base font-light text-foreground/90 leading-relaxed"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                    >
                      "{quote}"
                    </motion.blockquote>
                  </AnimatePresence>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={speakQuote}
                    className="h-8 px-3 rounded-lg bg-secondary/50 hover:bg-accent/50 text-xs"
                  >
                    {isSpeaking ? (
                      <><Volume2 className="w-3.5 h-3.5 mr-1.5" /> Speaking…</>
                    ) : (
                      <><VolumeX className="w-3.5 h-3.5 mr-1.5" /> Listen</>
                    )}
                  </Button>
                </div>

                {/* Chart Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                    <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                      Today's Patterns
                    </h4>
                  </div>

                  {moodData.length === 0 ? (
                    <div className="h-28 flex items-center justify-center text-xs text-muted-foreground">
                      No data yet. Scan your face to start tracking.
                    </div>
                  ) : (
                    <div className="h-28">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={moodData}>
                          <defs>
                            {Object.entries(moodColors).map(([key, value]) => (
                              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={value.primary} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={value.primary} stopOpacity={0} />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" opacity={0.4} vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="hsl(0 0% 35%)" 
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
                              strokeWidth={1.5}
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
