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
    <Card className="glass-panel p-6 premium-glow">
      <h2 className="text-xl font-light mb-6 text-foreground">Weekly Analytics</h2>
      
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={moodData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(0 0% 60%)"
              style={{ fontSize: '11px', fontWeight: '300' }}
            />
            <YAxis 
              stroke="hsl(0 0% 60%)"
              style={{ fontSize: '11px', fontWeight: '300' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0 0% 10%)', 
                border: '1px solid hsl(0 0% 18%)',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '300' }} />
            <Line 
              type="monotone" 
              dataKey="happy" 
              stroke="hsl(45 95% 65%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(45 95% 65%)', r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="sad" 
              stroke="hsl(210 70% 60%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(210 70% 60%)', r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="angry" 
              stroke="hsl(0 75% 60%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(0 75% 60%)', r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="surprised" 
              stroke="hsl(280 90% 65%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(280 90% 65%)', r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="neutral" 
              stroke="hsl(0 0% 50%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(0 0% 50%)', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default MoodAnalytics;
