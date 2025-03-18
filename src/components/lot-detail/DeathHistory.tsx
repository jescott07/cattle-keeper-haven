
import { useMemo } from 'react';
import { Skull } from 'lucide-react';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface DeathHistoryProps {
  lotId: string;
}

type MortalityCause = 'disease' | 'injury' | 'predator' | 'unknown' | 'other';

interface MortalityRecord {
  id: string;
  lotId: string;
  date: Date;
  cause: MortalityCause;
  breed: string;
  notes?: string;
  createdAt: Date;
}

export function DeathHistory({ lotId }: DeathHistoryProps) {
  const lot = useStore(state => state.lots.find(l => l.id === lotId));
  
  // For now, we'll simulate mortality records since they're not in the main store
  // In a real app, these would come from the global store
  const mortalityRecords: MortalityRecord[] = [];
  
  // Sort mortality records by date, most recent first
  const sortedRecords = useMemo(() => {
    return [...mortalityRecords]
      .filter(record => record.lotId === lotId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [mortalityRecords, lotId]);
  
  return (
    <div className="bg-card rounded-lg p-6 border h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Death History</h2>
      </div>
      
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Skull className="h-5 w-5" />
          <h3 className="text-lg font-medium">Death History</h3>
        </div>
        
        {sortedRecords.length > 0 ? (
          <div className="space-y-3">
            {sortedRecords.map((record) => (
              <div key={record.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {record.cause.charAt(0).toUpperCase() + record.cause.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(record.date, 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    {record.notes && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {record.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No death history available for this lot</p>
          </div>
        )}
      </div>
    </div>
  );
}
