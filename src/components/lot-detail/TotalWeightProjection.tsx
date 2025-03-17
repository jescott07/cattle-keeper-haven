
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
    
    // Sort weighings by date, oldest first
    const sortedWeighings = [...lotWeighings].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Group weighings by date
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
    
    // For total weight calculation, we need to account for animal count changes over time
    const animalCounts = new Map();
    
    // Start with the current number of animals at the current date
    animalCounts.set(format(new Date(), 'yyyy-MM-dd'), lot.numberOfAnimals);
    
    // Add animal counts at the time of each transfer
    if (lot.plannedTransfers) {
      const completedTransfers = lot.plannedTransfers.filter(t => t.completed);
      
      completedTransfers.forEach(transfer => {
        const date = transfer.completedDate || transfer.scheduledDate;
        const dateKey = format(date, 'yyyy-MM-dd');
        
        // This is a simplified approach - in a real app, you'd track the exact number of animals transferred
        // Here we're assuming the transfer involves all animals in the lot
        animalCounts.set(dateKey, lot.numberOfAnimals);
      });
    }
    
    // Create chart data with total weight projection based on animal counts
    return uniqueWeighings.map(weighing => {
      const dateKey = format(weighing.date, 'yyyy-MM-dd');
      
      // Find the closest animal count date that's not after this weighing date
      const relevantDates = Array.from(animalCounts.keys())
        .filter(d => new Date(d) <= weighing.date)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      const closestDateKey = relevantDates[0] || format(new Date(), 'yyyy-MM-dd');
      const animalCount = animalCounts.get(closestDateKey) || lot.numberOfAnimals;
      
      const totalWeight = weighing.averageWeight * animalCount;
      
      return {
        date: format(weighing.date, 'MMM d, yyyy'),
        totalWeight: Math.round(totalWeight),
        averageWeight: Math.round(weighing.averageWeight),
        animalCount
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
