
import { AnimalRecord } from './AnimalWeighingRecord';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ListFilter, Info } from 'lucide-react';

interface WeighingSessionSummaryProps {
  weights: number[];
  date: Date;
  onNewSession: () => void;
  totalAnimals?: number;
  isPartialWeighing?: boolean;
}

export function WeighingSessionSummary({ 
  weights, 
  date, 
  onNewSession, 
  totalAnimals = 0,
  isPartialWeighing = false
}: WeighingSessionSummaryProps) {
  if (weights.length === 0) {
    return null;
  }
  
  // Calculate statistics
  const weighedAnimals = weights.length;
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const avgWeight = totalWeight / weighedAnimals;
  
  // Calculate non-weighed animals statistics
  const nonWeighedAnimals = totalAnimals ? totalAnimals - weighedAnimals : 0;
  const estimatedWeight = nonWeighedAnimals * avgWeight;
  const totalEstimatedWeight = totalWeight + estimatedWeight;
  const showPartialInfo = isPartialWeighing || (totalAnimals > 0 && weighedAnimals < totalAnimals);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ListFilter className="h-5 w-5" />
          Session Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-accent/30 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Weighed Animals</p>
            <p className="text-2xl font-semibold">{weighedAnimals}</p>
            {showPartialInfo && totalAnimals > 0 && (
              <p className="text-xs text-muted-foreground">of {totalAnimals} total</p>
            )}
          </div>
          <div className="p-3 bg-accent/30 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Average Weight</p>
            <p className="text-2xl font-semibold">{avgWeight.toFixed(1)} kg</p>
            <p className="text-xs text-muted-foreground">({(avgWeight / 30).toFixed(2)} @)</p>
          </div>
          <div className="p-3 bg-accent/30 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Measured Weight</p>
            <p className="text-2xl font-semibold">{totalWeight.toFixed(1)} kg</p>
          </div>
        </div>
        
        {showPartialInfo && (
          <div className="bg-muted/50 p-4 rounded-md border border-border">
            <div className="flex gap-2 items-start mb-3">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <span className="font-medium">Partial weighing detected.</span> The system uses the average weight of measured animals 
                to estimate the weight of non-measured animals.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-2 bg-background/80 rounded border border-border text-center">
                <p className="text-xs text-muted-foreground">Non-weighed Animals</p>
                <p className="text-xl font-medium">{nonWeighedAnimals}</p>
              </div>
              <div className="p-2 bg-background/80 rounded border border-border text-center">
                <p className="text-xs text-muted-foreground">Estimated Additional Weight</p>
                <p className="text-xl font-medium">{estimatedWeight.toFixed(1)} kg</p>
              </div>
            </div>
            
            <div className="mt-4 p-2 bg-primary/10 rounded-md border border-primary/20 text-center">
              <p className="text-sm text-muted-foreground">Total Estimated Lot Weight</p>
              <p className="text-2xl font-semibold">{totalEstimatedWeight.toFixed(1)} kg</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-center mt-6">
          <button 
            onClick={onNewSession}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Start New Session
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
