import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

interface MoodData {
  date: string;
  happy: number;
  sad: number;
  angry: number;
  surprised: number;
  neutral: number;
}

const MoodAnalytics = () => {
  const [moodData, setMoodData] = useState<MoodData[]>([]);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('moodHistory');
    if (stored) {
      setMoodData(JSON.parse(stored));
    } else {
      // Generate sample data for demo
      const sampleData: MoodData[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        sampleData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          happy: Math.floor(Math.random() * 30) + 20,
          sad: Math.floor(Math.random() * 20) + 5,
          angry: Math.floor(Math.random() * 15) + 5,
          surprised: Math.floor(Math.random() * 25) + 10,
          neutral: Math.floor(Math.random() * 30) + 15,
        });
      }
      
      setMoodData(sampleData);
      localStorage.setItem('moodHistory', JSON.stringify(sampleData));
    }
  }, []);

  return (
    <Card className="glass-panel p-6 relative overflow-hidden">
      <div className="absolute inset-0 hologram-grid opacity-20" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-6 h-6 text-neon-cyan" />
          <h2 className="text-2xl font-bold text-neon-purple">7-Day Mood Analytics</h2>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={moodData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
            <YAxis stroke="hsl(var(--foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="happy"
              stroke="hsl(var(--mood-happy))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--mood-happy))', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="sad"
              stroke="hsl(var(--mood-sad))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--mood-sad))', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="angry"
              stroke="hsl(var(--mood-angry))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--mood-angry))', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="surprised"
              stroke="hsl(var(--mood-surprised))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--mood-surprised))', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="neutral"
              stroke="hsl(var(--mood-neutral))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--mood-neutral))', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default MoodAnalytics;
