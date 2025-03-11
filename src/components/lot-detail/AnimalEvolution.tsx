import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeighingRecord } from '@/lib/types';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp } from 'lucide-react';

interface AnimalEvolutionProps {
  lotId: string;
}

export function AnimalEvolution({ lotId }: AnimalEvolutionProps) {
  const weighings = useStore(state => state.weighings);
  const lots = useStore(state => state.lots);
  
  const lot = useMemo(() => 
    lots.find(l => l.id === lotId),
  [lots, lotId]);
  
  const lotWeighings = useMemo(() => 
    weighings.filter(w => w.lotId === lotId),
  [weighings, lotId]);
  
  const chartData = useMemo(() => {
    if (lotWeighings.length === 0) return [];
    
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
    
    // Create chart data with the actual number of animals in the lot at each weighing date
    return uniqueWeighings.map(weighing => {
      // Find the lot state at the time of this weighing
      const lotAtTime = lots.find(l => l.id === lotId);
      
      return {
        date: format(weighing.date, 'MMM d, yyyy'),
        animals: weighing.numberOfAnimals,
        weight: Math.round(weighing.averageWeight)
      };
    });
  }, [lotWeighings, lots, lotId]);
  
  const initialAnimalCount = useMemo(() => {
    if (chartData.length > 0) {
      return chartData[0].animals;
    }
    return 0;
  }, [chartData]);
  
  const latestAnimalCount = useMemo(() => {
    if (chartData.length > 0) {
      return chartData[chartData.length - 1].animals;
    }
    return 0;
  }, [chartData]);
  
  const animalsChange = latestAnimalCount - initialAnimalCount;
  const percentChange = initialAnimalCount > 0 
    ? Math.round((animalsChange / initialAnimalCount) * 100) 
    : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Animal Count Evolution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-2xl font-bold">{latestAnimalCount}</div>
                <div className="text-sm text-muted-foreground">Current animals</div>
              </div>
              
              <div className={`text-sm flex items-center gap-1 ${
                animalsChange > 0 ? 'text-green-600' : 
                animalsChange < 0 ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                <TrendingUp className={`h-4 w-4 ${animalsChange < 0 ? 'rotate-180' : ''}`} />
                <span>{animalsChange > 0 ? '+' : ''}{animalsChange}</span>
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
                    tickFormatter={(value) => {
                      return format(new Date(value), 'MMM d');
                    }}
                  />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip 
                    formatter={(value, name) => [value, name === 'animals' ? 'Animals' : 'Avg. Weight (kg)']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="animals" 
                    stroke="#2563eb" 
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
