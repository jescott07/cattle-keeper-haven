
import { useState } from 'react';
import { Wheat } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DietManagement } from './DietManagement';
import { format, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getUnitLabel, convertUnits } from '@/lib/constants';

interface NutritionHistoryProps {
  lotId: string;
}

export function NutritionHistory({ lotId }: NutritionHistoryProps) {
  const [isDietDialogOpen, setIsDietDialogOpen] = useState(false);
  const dietRecords = useStore(state => 
    state.dietRecords.filter(record => record.lotId === lotId) || []
  );
  const inventory = useStore(state => state.inventory);
  const lots = useStore(state => state.lots);

  const lot = lots.find(l => l.id === lotId);

  const getItemName = (itemId: string) => {
    const item = inventory.find(item => item.id === itemId);
    return item ? item.name : 'Unknown Item';
  };

  const calculateTotalConsumption = (record: any) => {
    const today = new Date();
    const endDate = new Date(record.endDate);
    const startDate = new Date(record.startDate);
    
    const calculationEndDate = endDate > today ? today : endDate;
    
    if (startDate > today) {
      return { 
        totalConsumption: 0, 
        activeDays: 0 
      };
    }
    
    const daysActive = differenceInDays(calculationEndDate, startDate) + 1;
    
    const activeDays = Math.max(0, daysActive);
    
    const totalConsumptionInOriginalUnit = record.totalQuantity * activeDays;
    
    const totalConsumptionInKg = convertUnits(
      totalConsumptionInOriginalUnit, 
      record.unit, 
      'kg'
    );
    
    return { 
      totalConsumption: totalConsumptionInKg,
      activeDays: activeDays
    };
  };

  return (
    <div className="bg-card rounded-lg p-6 border h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Wheat className="h-5 w-5" />
          Nutrition History
        </h2>
      </div>
      
      {dietRecords.length > 0 ? (
        <div className="space-y-3">
          {dietRecords.map((record) => {
            const { totalConsumption, activeDays } = calculateTotalConsumption(record);
            
            return (
              <div key={record.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{getItemName(record.inventoryItemId)}</div>
                  <Badge variant="outline">
                    {format(new Date(record.startDate), 'MMM d')} - {format(new Date(record.endDate), 'MMM d, yyyy')}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  <div>
                    <span className="text-muted-foreground">Per animal:</span>{' '}
                    <span className="font-medium">
                      {record.displayQuantityPerAnimal || record.quantityPerAnimal} {getUnitLabel(record.unit)}/day
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>{' '}
                    <span className="font-medium">{record.totalQuantity} {getUnitLabel(record.unit)}/day</span>
                  </div>
                </div>
                
                <div className="mt-2 p-2 bg-muted/30 rounded-md space-y-1">
                  <div>
                    <span className="text-sm font-medium">Total consumption:</span>{' '}
                    <span className="text-sm">
                      {totalConsumption.toFixed(2)} kg
                      {new Date(record.endDate) > new Date() ? ' (ongoing)' : ' (completed)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Active days:</span>{' '}
                    <span className="text-sm">
                      {activeDays} {activeDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
                
                {record.notes && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {record.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No diet records available for this lot</p>
        </div>
      )}

      <Dialog open={isDietDialogOpen} onOpenChange={setIsDietDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wheat className="h-5 w-5" />
              Diet Management
            </DialogTitle>
          </DialogHeader>
          <DietManagement lotId={lotId} onComplete={() => setIsDietDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
