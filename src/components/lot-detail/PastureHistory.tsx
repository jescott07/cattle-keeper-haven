
import { useMemo } from 'react';
import { TreePine, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface PastureHistoryProps {
  lotId: string;
}

export function PastureHistory({ lotId }: PastureHistoryProps) {
  const lot = useStore(state => state.lots.find(l => l.id === lotId));
  const pastures = useStore(state => state.pastures);
  
  const pastureHistory = useMemo(() => {
    if (!lot || !lot.plannedTransfers) return [];
    
    // Only include completed transfers
    const completedTransfers = lot.plannedTransfers.filter(transfer => transfer.completed);
    
    // Sort by completion date, most recent first
    return completedTransfers.sort((a, b) => {
      const dateA = a.completedDate?.getTime() || a.scheduledDate.getTime();
      const dateB = b.completedDate?.getTime() || b.scheduledDate.getTime();
      return dateB - dateA;
    });
  }, [lot]);
  
  const getPastureName = (pastureId?: string) => {
    if (!pastureId) return 'Unknown';
    const pasture = pastures.find(p => p.id === pastureId);
    return pasture ? pasture.name : 'Unknown';
  };
  
  return (
    <div className="bg-card rounded-lg p-6 border h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <TreePine className="h-5 w-5" />
          Pasture History
        </h2>
      </div>
      
      {pastureHistory.length > 0 ? (
        <div className="space-y-3">
          {pastureHistory.map((transfer, index) => {
            const completedDate = transfer.completedDate || transfer.scheduledDate;
            
            return (
              <div key={index} className="border rounded-md p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Completed</Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(completedDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-medium">
                        {getPastureName(transfer.fromPastureId)}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                      <span className="font-medium">
                        {getPastureName(transfer.toPastureId)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {transfer.notes && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {transfer.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No pasture history available for this lot</p>
        </div>
      )}
    </div>
  );
}
