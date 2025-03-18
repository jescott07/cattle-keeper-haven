
import { useMemo, useState } from 'react';
import { Skull, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MortalityTracker } from './MortalityTracker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [isMortalityDialogOpen, setIsMortalityDialogOpen] = useState(false);
  
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
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Skull className="h-5 w-5" />
          Death History
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => setIsMortalityDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Mortality
        </Button>
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

      <Dialog open={isMortalityDialogOpen} onOpenChange={setIsMortalityDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Skull className="h-5 w-5" />
              Record Mortality
            </DialogTitle>
          </DialogHeader>
          <MortalityTracker lotId={lotId} onMortalityAdded={() => setIsMortalityDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
