import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeighingRecord } from '@/lib/types';
import { format, differenceInDays, subDays, startOfDay } from 'date-fns';
import { Scale } from 'lucide-react';
import { useStore } from '@/lib/store';

interface DailyGainPerAnimalChartProps {
  weighings: WeighingRecord[];
  showFullChart?: boolean;
}

export function DailyGainPerAnimalChart({ weighings, showFullChart = false }: DailyGainPerAnimalChartProps) {
  const [timeRange, setTimeRange] = useState<'all' | '30' | '90' | '180'>('all');
  
  const dailyGainData = useMemo(() => {
    if (weighings.length < 2) return [];
    
    // Sort weighings by date
    const sortedWeighings = [...weighings].sort((a, b) => {
      return startOfDay(a.date).getTime() - startOfDay(b.date).getTime();
    });
    
    // Group weighings by date to avoid duplicates
    const dateMap = new Map();
    
    // Process each weighing record
    sortedWeighings.forEach(weighing => {
      const dateKey = format(startOfDay(weighing.date), 'yyyy-MM-dd');
      
      // Only keep the latest record for each date
      if (!dateMap.has(dateKey) || dateMap.get(dateKey).date < weighing.date) {
        dateMap.set(dateKey, weighing);
      }
    });
    
    // Convert map to array and sort by date
    const uniqueWeighings = Array.from(dateMap.values())
      .sort((a, b) => startOfDay(a.date).getTime() - startOfDay(b.date).getTime());
    
    // Calculate daily gain between consecutive weighings
    const gainData = [];
    
    for (let i = 1; i < uniqueWeighings.length; i++) {
      const prev = uniqueWeighings[i - 1];
      const current = uniqueWeighings[i];
      
      const prevDate = startOfDay(prev.date);
      const currentDate = startOfDay(current.date);
      
      const daysBetween = differenceInDays(currentDate, prevDate);
      if (daysBetween <= 0) continue; // Skip if dates are the same or out of order
      
      // Calculate using actual number of animals at each weighing
      const prevTotalWeight = prev.averageWeight * prev.numberOfAnimals;
      const currentTotalWeight = current.averageWeight * current.numberOfAnimals;
      
      // Calculate total weight difference and daily gain per animal
      const totalWeightDiff = currentTotalWeight - prevTotalWeight;
      // Use the average number of animals between the two dates
      const avgNumberOfAnimals = (prev.numberOfAnimals + current.numberOfAnimals) / 2;
      const dailyGainPerAnimal = (totalWeightDiff / daysBetween) / avgNumberOfAnimals;
      
      const fromDate = format(prevDate, 'MMM d');
      const toDate = format(currentDate, 'MMM d');
      
      gainData.push({
        date: currentDate,
        displayDate: `${fromDate} → ${toDate}`,
        dailyGain: parseFloat(dailyGainPerAnimal.toFixed(2)),
        period: `${daysBetween} days`,
        animalsDiff: current.numberOfAnimals - prev.numberOfAnimals
      });
    }
    
    // Filter by time range if needed
    if (timeRange !== 'all') {
      const daysToFilter = parseInt(timeRange);
      const cutoffDate = subDays(new Date(), daysToFilter);
      return gainData.filter(item => item.date >= cutoffDate);
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
          <Scale className="h-5 w-5" />
          Daily Weight Gain Per Animal
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
              <div className="text-sm text-muted-foreground">Average daily gain per animal</div>
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
                    formatter={(value) => [`${Number(value).toFixed(2)} kg/day`, 'Daily Gain Per Animal']}
                    labelFormatter={(label, data) => {
                      const entry = data[0]?.payload;
                      const animalChange = entry?.animalsDiff;
                      const animalText = animalChange > 0 ? `+${animalChange}` : animalChange;
                      return `Period: ${label}\nAnimal change: ${animalText}`;
                    }}
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
            <p>Not enough weighing data to calculate daily gain per animal</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
