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
    const loadData = () => {
      const stored = localStorage.getItem('moodHistory');
      if (stored) {
        setMoodData(JSON.parse(stored));
      } else {
        // Initialize with empty data for the last 7 days
        const sampleData: MoodData[] = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          sampleData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            happy: 0,
            sad: 0,
            angry: 0,
            surprised: 0,
            neutral: 0,
          });
        }
        
        setMoodData(sampleData);
        localStorage.setItem('moodHistory', JSON.stringify(sampleData));
      }
    };
    
    loadData();
    
    // Refresh data every 5 seconds to show updates
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
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
              stroke="hsl(0 0% 85%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(0 0% 85%)', r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="sad" 
              stroke="hsl(0 0% 35%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(0 0% 35%)', r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="angry" 
              stroke="hsl(0 0% 25%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(0 0% 25%)', r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="surprised" 
              stroke="hsl(0 0% 75%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(0 0% 75%)', r: 3 }}
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
