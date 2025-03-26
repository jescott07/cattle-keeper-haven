
import { useMemo } from 'react';
import { ArrowLeftRight, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';

interface TransferHistoryProps {
  lotId: string;
  showFullHistory?: boolean;
}

export function TransferHistory({ lotId, showFullHistory = false }: TransferHistoryProps) {
  const weighings = useStore(state => state.weighings);
  const lots = useStore(state => state.lots);
  
  const transfers = useMemo(() => {
    // Get all transfers involving this lot (as source or destination)
    const allTransfers = weighings.filter(w => 
      (w.lotId === lotId && w.destinationLotId && w.destinationLotId !== lotId) || // Outgoing
      (w.destinationLotId === lotId && w.lotId !== lotId) // Incoming
    );
    
    // Sort by date, most recent first
    return allTransfers.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [weighings, lotId]);
  
  const displayTransfers = showFullHistory ? transfers : transfers.slice(0, 3);
  
  const getLotName = (id: string) => {
    const lot = lots.find(l => l.id === id);
    return lot ? lot.name : 'Unknown Lot';
  };
  
  return (
    <div className="rounded-lg p-6 border h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          Transfer History
        </h2>
      </div>
      
      {displayTransfers.length > 0 ? (
        <div className="space-y-3">
          {displayTransfers.map(transfer => {
            const isOutgoing = transfer.lotId === lotId;
            const directionLot = isOutgoing ? transfer.destinationLotId! : transfer.lotId;
            
            return (
              <div key={transfer.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isOutgoing ? "destructive" : "default"}>
                        {isOutgoing ? 'Outgoing' : 'Incoming'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(transfer.date, 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-medium">
                        {isOutgoing ? getLotName(lotId) : getLotName(transfer.lotId)}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                      <span className="font-medium">
                        {isOutgoing ? getLotName(directionLot) : getLotName(lotId)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">{transfer.numberOfAnimals} animals</div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round(transfer.averageWeight)} kg avg.
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
          
          {!showFullHistory && transfers.length > 3 && (
            <div className="text-center text-sm text-muted-foreground">
              + {transfers.length - 3} more transfers
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No transfers found for this lot</p>
        </div>
      )}
    </div>
  );
}
