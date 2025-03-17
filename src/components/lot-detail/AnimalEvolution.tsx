
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
    if (!lot || !lot.plannedTransfers) return [];
    
    // Start with the current number of animals
    const currentAnimalCount = lot.numberOfAnimals;
    
    // Get all completed transfers (in or out)
    const completedTransfers = [...(lot.plannedTransfers || [])].filter(t => t.completed);
    
    // Sort by completion date, most recent first
    const sortedTransfers = completedTransfers.sort((a, b) => {
      const dateA = a.completedDate?.getTime() || a.scheduledDate.getTime();
      const dateB = b.completedDate?.getTime() || b.scheduledDate.getTime();
      return dateB - dateA;
    });
    
    // Create a timeline of animal count changes
    let animalCount = currentAnimalCount;
    const timeline = [{
      date: new Date(),
      animalCount: animalCount,
      formattedDate: format(new Date(), 'MMM d, yyyy')
    }];
    
    // Go back in time and recalculate animal count at each transfer point
    for (const transfer of sortedTransfers) {
      const date = transfer.completedDate || transfer.scheduledDate;
      
      // Determine if this was incoming or outgoing
      if (transfer.toPastureId === lot.currentPastureId) {
        // This was an incoming transfer, so before this, we had fewer animals
        animalCount -= lot.numberOfAnimals; // This is simplified and would need real transfer counts
      } else if (transfer.fromPastureId === lot.currentPastureId) {
        // This was an outgoing transfer, so before this, we had more animals
        animalCount += lot.numberOfAnimals; // This is simplified and would need real transfer counts
      }
      
      timeline.push({
        date,
        animalCount,
        formattedDate: format(date, 'MMM d, yyyy')
      });
    }
    
    // Sort by date, oldest first
    return timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [lot]);
  
  const initialAnimalCount = useMemo(() => {
    if (chartData.length > 0) {
      return chartData[0].animalCount;
    }
    // Return current animal count if no history instead of 0
    return lot?.numberOfAnimals || 0;
  }, [chartData, lot]);
  
  const latestAnimalCount = useMemo(() => {
    if (chartData.length > 0) {
      return chartData[chartData.length - 1].animalCount;
    }
    return lot?.numberOfAnimals || 0;
  }, [chartData, lot]);
  
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
        {chartData.length > 0 || lot ? (
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
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip 
                    formatter={(value, name) => [value, name === 'animalCount' ? 'Animals' : '']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="animalCount" 
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
            <p>No animal count evolution data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
