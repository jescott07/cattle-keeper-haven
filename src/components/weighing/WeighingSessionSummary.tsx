
import { AnimalRecord } from './AnimalWeighingRecord';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ListFilter } from 'lucide-react';

interface WeighingSessionSummaryProps {
  weights: number[];
  date: Date;
  onNewSession: () => void;
}

export function WeighingSessionSummary({ weights, date, onNewSession }: WeighingSessionSummaryProps) {
  if (weights.length === 0) {
    return null;
  }
  
  // Calculate statistics
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const avgWeight = totalWeight / weights.length;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ListFilter className="h-5 w-5" />
          Session Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-accent/30 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Total Animals</p>
            <p className="text-2xl font-semibold">{weights.length}</p>
          </div>
          <div className="p-3 bg-accent/30 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Average Weight</p>
            <p className="text-2xl font-semibold">{avgWeight.toFixed(1)} kg</p>
            <p className="text-xs text-muted-foreground">({(avgWeight / 30).toFixed(2)} @)</p>
          </div>
          <div className="p-3 bg-accent/30 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Total Weight</p>
            <p className="text-2xl font-semibold">{totalWeight.toFixed(1)} kg</p>
          </div>
        </div>
        
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
