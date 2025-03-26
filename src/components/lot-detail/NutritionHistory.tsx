
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wheat, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DietManagement } from './DietManagement';
import { format, differenceInDays, min } from 'date-fns';
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

  // Get lot information for animal count
  const lot = lots.find(l => l.id === lotId);

  // Get item name from inventory
  const getItemName = (itemId: string) => {
    const item = inventory.find(item => item.id === itemId);
    return item ? item.name : 'Unknown Item';
  };

  // Calculate total consumption for a diet (in kg)
  const calculateTotalConsumption = (record: any) => {
    const today = new Date();
    const endDate = new Date(record.endDate);
    const startDate = new Date(record.startDate);
    
    // Determine which date to use for calculation (today or end date, whichever comes first)
    const calculationEndDate = endDate > today ? today : endDate;
    
    // Check if start date is in the future
    if (startDate > today) {
      return 0; // Diet hasn't started yet
    }
    
    // Calculate days the diet has been active until now or end date
    const daysActive = differenceInDays(calculationEndDate, startDate) + 1;
    
    // Use positive days only (in case of data errors)
    const activeDays = Math.max(0, daysActive);
    
    // Calculate total consumption in original unit
    const totalConsumptionInOriginalUnit = record.totalQuantity * activeDays;
    
    // Convert to kg for display
    const totalConsumptionInKg = convertUnits(
      totalConsumptionInOriginalUnit, 
      record.unit, 
      'kg'
    );
    
    return totalConsumptionInKg;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wheat className="h-5 w-5" />
            Nutrition History
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setIsDietDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Diet
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {dietRecords.length > 0 ? (
          <div className="space-y-3">
            {dietRecords.map((record) => (
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
                
                <div className="mt-2 p-2 bg-muted/30 rounded-md">
                  <span className="text-sm font-medium">Total consumption:</span>{' '}
                  <span className="text-sm">
                    {calculateTotalConsumption(record).toFixed(2)} kg
                    {new Date(record.endDate) > new Date() ? ' (ongoing)' : ' (completed)'}
                  </span>
                </div>
                
                {record.notes && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {record.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No diet records available for this lot</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2"
              onClick={() => setIsDietDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Diet
            </Button>
          </div>
        )}
      </CardContent>

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
    </Card>
  );
}
