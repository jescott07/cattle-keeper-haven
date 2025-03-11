import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeighingRecord } from '@/lib/types';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale } from 'lucide-react';

interface TotalWeightProjectionProps {
  lotId: string;
}

export function TotalWeightProjection({ lotId }: TotalWeightProjectionProps) {
  const weighings = useStore(state => state.weighings);
  const lots = useStore(state => state.lots);
  
  const lot = useMemo(() => 
    lots.find(l => l.id === lotId),
  [lots, lotId]);
  
  const lotWeighings = useMemo(() => 
    weighings.filter(w => w.lotId === lotId),
  [weighings, lotId]);
  
  const chartData = useMemo(() => {
    if (!lot || lotWeighings.length === 0) return [];
    
    // Sort weighings by date
    const sortedWeighings = [...lotWeighings].sort((a, b) => a.date.getTime() - b.date.getTime());
    
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
    
    // Create chart data with total weight projection
    return uniqueWeighings.map(weighing => {
      const totalWeight = weighing.averageWeight * lot.numberOfAnimals;
      
      return {
        date: format(weighing.date, 'MMM d, yyyy'),
        totalWeight: Math.round(totalWeight),
        averageWeight: Math.round(weighing.averageWeight)
      };
    });
  }, [lotWeighings, lot]);
  
  const latestTotalWeight = useMemo(() => {
    if (chartData.length > 0) {
      return chartData[chartData.length - 1].totalWeight;
    }
    return 0;
  }, [chartData]);
  
  const initialTotalWeight = useMemo(() => {
    if (chartData.length > 0) {
      return chartData[0].totalWeight;
    }
    return 0;
  }, [chartData]);
  
  const weightChange = latestTotalWeight - initialTotalWeight;
  const percentChange = initialTotalWeight > 0 
    ? Math.round((weightChange / initialTotalWeight) * 100) 
    : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Total Weight Projection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-2xl font-bold">{latestTotalWeight.toLocaleString()} kg</div>
                <div className="text-sm text-muted-foreground">Current total weight</div>
              </div>
              
              <div className={`text-sm flex items-center gap-1 ${
                weightChange > 0 ? 'text-green-600' : 
                weightChange < 0 ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                <Scale className="h-4 w-4" />
                <span>{weightChange > 0 ? '+' : ''}{weightChange.toLocaleString()} kg</span>
                <span>({percentChange > 0 ? '+' : ''}{percentChange}%)</span>
              </div>
            </div>
            
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString()} kg`, 'Total Weight']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalWeight" 
                    stroke="#8884d8" 
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
            <p>No weighing data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
