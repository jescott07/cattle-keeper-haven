
import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeighingRecord } from '@/lib/types';
import { format } from 'date-fns';
import { Scale } from 'lucide-react';

interface WeightDistributionProps {
  weighings: WeighingRecord[];
  showFullChart?: boolean;
}

export function WeightDistribution({ weighings, showFullChart = false }: WeightDistributionProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const sortedWeighings = useMemo(() => {
    return [...weighings].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [weighings]);
  
  // Create a list of unique dates for the dropdown
  const uniqueDates = useMemo(() => {
    const dateMap = new Map<string, WeighingRecord>();
    
    // Use Map to ensure only unique dates are included
    sortedWeighings.forEach(weighing => {
      const dateStr = format(weighing.date, 'yyyy-MM-dd');
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, weighing);
      }
    });
    
    return Array.from(dateMap.values());
  }, [sortedWeighings]);
  
  // Set default selection to the most recent record
  useEffect(() => {
    if (uniqueDates.length > 0 && !selectedDate) {
      setSelectedDate(format(uniqueDates[0].date, 'yyyy-MM-dd'));
    }
  }, [uniqueDates, selectedDate]);
  
  const weightRanges = useMemo(() => {
    if (weighings.length === 0 || !selectedDate) return [];
    
    // Filter weighings by the selected date or use all if 'all' is selected
    const filteredWeights = weighings
      .filter(w => selectedDate === 'all' || format(w.date, 'yyyy-MM-dd') === selectedDate)
      .flatMap(w => {
        // Create mock data based on average weight
        const avgWeight = w.averageWeight;
        const mockWeights = [];
        
        // Create a normal distribution around the average weight
        for (let i = 0; i < w.numberOfAnimals; i++) {
          // Add some random variation (±15%)
          const variation = (Math.random() - 0.5) * 0.3;
          mockWeights.push(avgWeight * (1 + variation));
        }
        
        return mockWeights.map(weight => ({
          weight: Math.round(weight),
          date: format(w.date, 'yyyy-MM-dd')
        }));
      });
    
    // Group weights by range
    const ranges: Record<string, number> = {};
    const step = 30; // 30kg ranges
    
    filteredWeights.forEach(item => {
      const rangeStart = Math.floor(item.weight / step) * step;
      const rangeKey = `${rangeStart}-${rangeStart + step}`;
      
      ranges[rangeKey] = (ranges[rangeKey] || 0) + 1;
    });
    
    return Object.entries(ranges)
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => {
        const aStart = parseInt(a.range.split('-')[0]);
        const bStart = parseInt(b.range.split('-')[0]);
        return aStart - bStart;
      });
  }, [weighings, selectedDate]);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Weight Distribution
        </CardTitle>
        
        {uniqueDates.length > 0 && (
          <Select 
            value={selectedDate} 
            onValueChange={setSelectedDate}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All records</SelectItem>
              {uniqueDates.map((weighing) => (
                <SelectItem 
                  key={weighing.id} 
                  value={format(weighing.date, 'yyyy-MM-dd')}
                >
                  {format(weighing.date, 'MMM d, yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        {weightRanges.length > 0 ? (
          <div className={showFullChart ? "h-[400px]" : "h-[200px]"}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weightRanges}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="range" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} animals`, 'Count']}
                  labelFormatter={(label) => `${label} kg`}
                />
                <Bar 
                  dataKey="count" 
                  name="Animals" 
                  fill="#8884d8" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No weighing data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
