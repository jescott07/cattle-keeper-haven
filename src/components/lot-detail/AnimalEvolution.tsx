
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
      // Make sure we have valid Date objects before getting time
      const dateA = a.completedDate ? new Date(a.completedDate) : new Date(a.scheduledDate);
      const dateB = b.completedDate ? new Date(b.completedDate) : new Date(b.scheduledDate);
      
      // Check if dates are valid
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      
      return dateB.getTime() - dateA.getTime();
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
      // Make sure we have a valid Date object for the transfer date
      let transferDate;
      try {
        transferDate = transfer.completedDate ? 
          new Date(transfer.completedDate) : 
          new Date(transfer.scheduledDate);
          
        // Skip if invalid date
        if (isNaN(transferDate.getTime())) {
          console.warn('Invalid transfer date, skipping:', transfer);
          continue;
        }
      } catch (e) {
        console.warn('Error processing transfer date, skipping:', transfer, e);
        continue;
      }
      
      // Determine if this was incoming or outgoing
      if (transfer.toPastureId === lot.currentPastureId) {
        // This was an incoming transfer, so before this, we had fewer animals
        animalCount -= transfer.animalCount || lot.numberOfAnimals;
      } else if (transfer.fromPastureId === lot.currentPastureId) {
        // This was an outgoing transfer, so before this, we had more animals
        animalCount += transfer.animalCount || lot.numberOfAnimals;
      }
      
      timeline.push({
        date: transferDate,
        animalCount,
        formattedDate: format(transferDate, 'MMM d, yyyy')
      });
    }
    
    // Sort by date, oldest first
    return timeline.sort((a, b) => {
      try {
        // Ensure we have valid Date objects
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        
        // Verify the dates are valid before calling getTime()
        if (isNaN(dateA.getTime())) {
          console.warn('Invalid date found:', a.date);
          return -1; // Place invalid dates at the beginning
        }
        
        if (isNaN(dateB.getTime())) {
          console.warn('Invalid date found:', b.date);
          return 1; // Place invalid dates at the beginning
        }
        
        return dateA.getTime() - dateB.getTime();
      } catch (e) {
        console.error('Error comparing dates:', e, a.date, b.date);
        return 0; // Keep order unchanged if error occurs
      }
    });
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
