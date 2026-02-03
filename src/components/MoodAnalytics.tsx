import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';

interface MoodData {
  date: string;
  happy: number;
  sad: number;
  angry: number;
  surprised: number;
  neutral: number;
}

const moodColors = {
  happy: { stroke: 'hsl(48 100% 67%)', fill: 'hsl(48 100% 67% / 0.1)' },
  sad: { stroke: 'hsl(210 70% 55%)', fill: 'hsl(210 70% 55% / 0.1)' },
  angry: { stroke: 'hsl(0 65% 55%)', fill: 'hsl(0 65% 55% / 0.1)' },
  surprised: { stroke: 'hsl(280 80% 68%)', fill: 'hsl(280 80% 68% / 0.1)' },
  neutral: { stroke: 'hsl(220 10% 60%)', fill: 'hsl(220 10% 60% / 0.1)' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel-elevated p-4 rounded-xl border border-border/50">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.stroke }}
              />
              <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
              <span className="text-foreground font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const MoodAnalytics = () => {
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const [maxValue, setMaxValue] = useState<number>(10);

  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem('moodHistory');
      if (stored) {
        const allData = JSON.parse(stored);
        setMoodData(allData);
        
        if (allData.length > 0) {
          const max = allData.reduce((acc: number, day: MoodData) => {
            const dayMax = Math.max(day.happy, day.sad, day.angry, day.surprised, day.neutral);
            return Math.max(acc, dayMax);
          }, 0);
          
          setMaxValue(Math.max(Math.ceil(max * 1.2), 5));
        } else {
          setMaxValue(5);
        }
      } else {
        setMoodData([]);
        setMaxValue(5);
      }
    };
    
    loadData();
    
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

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
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-foreground">Weekly Analytics</h2>
            <p className="text-sm text-muted-foreground">Your emotional patterns</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/30">
          <Activity className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">Live Data</span>
        </div>
      </div>
      
      {moodData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-72 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground font-light mb-1">No data yet</p>
          <p className="text-sm text-muted-foreground/60">Start using the app to track your emotions</p>
        </div>
      ) : (
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={moodData}>
              <defs>
                {Object.entries(moodColors).map(([key, value]) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={value.stroke} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={value.stroke} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(0 0% 20%)" 
                opacity={0.3}
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                stroke="hsl(0 0% 45%)"
                style={{ fontSize: '11px', fontWeight: '400' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(0 0% 20%)' }}
              />
              <YAxis 
                stroke="hsl(0 0% 45%)"
                style={{ fontSize: '11px', fontWeight: '400' }}
                domain={[0, maxValue]}
                allowDataOverflow={false}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '12px', 
                  fontWeight: '400',
                  paddingTop: '20px'
                }} 
                iconType="circle"
                iconSize={8}
              />
              {Object.entries(moodColors).map(([key, value]) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={value.stroke}
                  fill={`url(#gradient-${key})`}
                  strokeWidth={2}
                  dot={{ fill: value.stroke, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(0 0% 100%)' }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default MoodAnalytics;
