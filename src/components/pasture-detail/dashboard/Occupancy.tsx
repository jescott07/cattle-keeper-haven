
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from 'lucide-react';
import { Lot } from '@/lib/types';

interface OccupancyProps {
  lots: Lot[];
  pastureSize: number;
}

const Occupancy = ({ lots, pastureSize }: OccupancyProps) => {
  const totalAnimals = lots.reduce((sum, lot) => sum + lot.numberOfAnimals, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart className="h-4 w-4 text-primary" />
          Current Occupancy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Animals:</span>
            <span className="font-medium">{totalAnimals}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Number of Lots:</span>
            <span className="font-medium">{lots.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stocking Rate:</span>
            <span className="font-medium">
              {pastureSize > 0 
                ? (totalAnimals / pastureSize).toFixed(2) 
                : '0'} animals/ha
            </span>
          </div>
          
          {lots.length > 0 ? (
            <div className="border-t mt-4 pt-2">
              <p className="text-sm font-medium mb-2">Lots in this pasture:</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {lots.map(lot => (
                  <div key={lot.id} className="flex justify-between text-sm">
                    <span>{lot.name}</span>
                    <span className="font-medium">{lot.numberOfAnimals} animals</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-2 text-muted-foreground text-sm">
              No lots currently in this pasture
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Occupancy;
