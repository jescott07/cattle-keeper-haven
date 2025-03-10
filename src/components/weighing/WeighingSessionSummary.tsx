
import { AnimalRecord } from './AnimalWeighingRecord';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ListFilter } from 'lucide-react';

interface WeighingSessionSummaryProps {
  records: AnimalRecord[];
  lots: Map<string, string>; // Map of lot IDs to lot names
}

export function WeighingSessionSummary({ records, lots }: WeighingSessionSummaryProps) {
  if (records.length === 0) {
    return null;
  }
  
  const recordsByLot = new Map<string, AnimalRecord[]>();
  const transfers = new Map<string, AnimalRecord[]>();
  
  // Group records by destination lot
  records.forEach(record => {
    const lotRecords = recordsByLot.get(record.destinationLotId) || [];
    lotRecords.push(record);
    recordsByLot.set(record.destinationLotId, lotRecords);
    
    // Track transfers
    if (record.originLotId !== record.destinationLotId) {
      const transferRecords = transfers.get(record.destinationLotId) || [];
      transferRecords.push(record);
      transfers.set(record.destinationLotId, transferRecords);
    }
  });
  
  // Calculate statistics
  const totalWeight = records.reduce((sum, r) => sum + r.weight, 0);
  const avgWeight = totalWeight / records.length;
  const totalTransfers = records.filter(r => r.originLotId !== r.destinationLotId).length;
  
  // Group by breed
  const breedCounts = new Map<string, number>();
  records.forEach(record => {
    const count = breedCounts.get(record.breed) || 0;
    breedCounts.set(record.breed, count + 1);
  });
  
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
            <p className="text-2xl font-semibold">{records.length}</p>
          </div>
          <div className="p-3 bg-accent/30 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Average Weight</p>
            <p className="text-2xl font-semibold">{avgWeight.toFixed(1)} kg</p>
            <p className="text-xs text-muted-foreground">({(avgWeight / 30).toFixed(2)} @)</p>
          </div>
          <div className="p-3 bg-accent/30 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Transfers</p>
            <p className="text-2xl font-semibold">{totalTransfers}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">By Breed</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(breedCounts.entries()).map(([breed, count]) => (
              <Badge key={breed} variant="outline" className="text-xs">
                {breed}: {count} animals
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium">By Destination Lot</h3>
          {Array.from(recordsByLot.entries()).map(([lotId, lotRecords]) => {
            const lotName = lots.get(lotId) || lotId;
            const isTransferLot = transfers.has(lotId);
            const lotWeight = lotRecords.reduce((sum, r) => sum + r.weight, 0);
            const lotAvgWeight = lotWeight / lotRecords.length;
            
            return (
              <div key={lotId} className={`p-3 rounded-md ${isTransferLot ? 'bg-blue-50' : 'bg-accent/20'}`}>
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium flex items-center gap-1">
                    {isTransferLot && <ArrowRight className="h-4 w-4 text-blue-500" />}
                    Lot {lotName}
                  </div>
                  <Badge variant="outline">{lotRecords.length} animals</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Average: {lotAvgWeight.toFixed(1)} kg ({(lotAvgWeight / 30).toFixed(2)} @)
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
