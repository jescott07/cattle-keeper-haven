
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeighingRecord } from '@/lib/types';
import { format, differenceInDays, subDays } from 'date-fns';
import { TrendingUp } from 'lucide-react';
import { useStore } from '@/lib/store';

interface DailyGainChartProps {
  weighings: WeighingRecord[];
  showFullChart?: boolean;
}

export function DailyGainChart({ weighings, showFullChart = false }: DailyGainChartProps) {
  const [timeRange, setTimeRange] = useState<'all' | '30' | '90' | '180'>('all');
  const lots = useStore(state => state.lots);
  
  const dailyGainData = useMemo(() => {
    if (weighings.length < 2) return [];
    
    // Find the lot to get the current total number of animals
    const lotId = weighings[0]?.lotId;
    const currentLot = lots.find(lot => lot.id === lotId);
    if (!currentLot) return [];
    
    // Sort weighings by date
    const sortedWeighings = [...weighings].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Group weighings by date to avoid duplicates
    const dateMap = new Map();
    
    // Process each weighing record
    sortedWeighings.forEach(weighing => {
      const dateKey = format(weighing.date, 'yyyy-MM-dd');
      
      // Only keep the latest record for each date
      if (!dateMap.has(dateKey) || dateMap.get(dateKey).date < weighing.date) {
        dateMap.set(dateKey, weighing);
      }
    });
    
    // Convert map to array and sort by date
    const uniqueWeighings = Array.from(dateMap.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Calculate daily gain between consecutive weighings
    const gainData = [];
    
    for (let i = 1; i < uniqueWeighings.length; i++) {
      const prev = uniqueWeighings[i - 1];
      const current = uniqueWeighings[i];
      
      const daysBetween = differenceInDays(current.date, prev.date);
      if (daysBetween <= 0) continue; // Skip if dates are the same or out of order
      
      // Calculate total weights
      const prevTotalWeight = prev.averageWeight * currentLot.numberOfAnimals;
      const currentTotalWeight = current.averageWeight * currentLot.numberOfAnimals;
      
      // Calculate total weight difference and daily gain
      const totalWeightDiff = currentTotalWeight - prevTotalWeight;
      const dailyGain = totalWeightDiff / daysBetween;
      
      // Calculate the date range string for display
      const fromDate = format(prev.date, 'MMM d');
      const toDate = format(current.date, 'MMM d');
      
      gainData.push({
        date: current.date,
        displayDate: `${fromDate} → ${toDate}`,
        dailyGain: parseFloat(dailyGain.toFixed(2)),
        period: `${daysBetween} days`
      });
    }
    
    // Filter by time range if needed
    if (timeRange !== 'all') {
      const daysToFilter = parseInt(timeRange);
      const cutoffDate = subDays(new Date(), daysToFilter);
      
      return gainData.filter(item => item.date >= cutoffDate);
    }
    
    return gainData;
  }, [weighings, timeRange, lots]);
  
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
                  />
                  <YAxis 
                    domain={[0, 'auto']}
                    tickFormatter={(value) => `${value.toFixed(1)}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${Number(value).toFixed(2)} kg/day`, 'Daily Gain']}
                    labelFormatter={(label) => `Period: ${label}`}
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
