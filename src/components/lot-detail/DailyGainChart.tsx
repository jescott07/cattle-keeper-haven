
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeighingRecord } from '@/lib/types';
import { format, differenceInDays } from 'date-fns';
import { TrendingUp } from 'lucide-react';

interface DailyGainChartProps {
  weighings: WeighingRecord[];
  showFullChart?: boolean;
}

export function DailyGainChart({ weighings, showFullChart = false }: DailyGainChartProps) {
  const [timeRange, setTimeRange] = useState<'all' | '30' | '90' | '180'>('all');
  
  const dailyGainData = useMemo(() => {
    if (weighings.length < 2) return [];
    
    // Sort weighings by date
    const sortedWeighings = [...weighings].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Calculate daily gain between consecutive weighings
    const gainData = [];
    
    for (let i = 1; i < sortedWeighings.length; i++) {
      const prev = sortedWeighings[i - 1];
      const current = sortedWeighings[i];
      
      const daysBetween = differenceInDays(current.date, prev.date);
      if (daysBetween <= 0) continue; // Skip if dates are the same or out of order
      
      const weightDiff = current.averageWeight - prev.averageWeight;
      const dailyGain = weightDiff / daysBetween;
      
      gainData.push({
        date: current.date,
        displayDate: format(current.date, 'MMM d, yyyy'),
        dailyGain: parseFloat(dailyGain.toFixed(3)),
        period: `${daysBetween} days`
      });
    }
    
    // Filter by time range if needed
    if (timeRange !== 'all') {
      const daysToFilter = parseInt(timeRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToFilter);
      
      return gainData.filter(item => item.date > cutoffDate);
    }
    
    return gainData;
  }, [weighings, timeRange]);
  
  const averageDailyGain = useMemo(() => {
    if (dailyGainData.length === 0) return 0;
    
    const total = dailyGainData.reduce((sum, item) => sum + item.dailyGain, 0);
    return total / dailyGainData.length;
  }, [dailyGainData]);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Daily Weight Gain
        </CardTitle>
        
        {dailyGainData.length > 0 && (
          <Select 
            value={timeRange} 
            onValueChange={(value) => setTimeRange(value as any)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 180 days</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        {dailyGainData.length > 0 ? (
          <>
            <div className="mb-4">
              <div className="text-2xl font-bold">{averageDailyGain.toFixed(2)} kg</div>
              <div className="text-sm text-muted-foreground">Average daily gain</div>
            </div>
            
            <div className={showFullChart ? "h-[400px]" : "h-[200px]"}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyGainData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis 
                    domain={[0, 'dataMax + 0.2']}
                    tickFormatter={(value) => `${value.toFixed(1)}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} kg/day`, 'Daily Gain']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="dailyGain" 
                    stroke="#059669" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Not enough weighing data to calculate daily gain</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
