
import { useState, useEffect } from 'react';
import { Wheat } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DietManagement } from './DietManagement';
import { format, differenceInDays, isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getUnitLabel, convertUnits } from '@/lib/constants';
import { Button } from '@/components/ui/button';

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
  const updateInventoryItem = useStore(state => state.updateInventoryItem);

  const lot = lots.find(l => l.id === lotId);

  // Effect to update inventory based on daily consumption
  useEffect(() => {
    if (!lot) return;
    
    const today = new Date();
    
    // Process each active diet record
    dietRecords.forEach(record => {
      const startDate = new Date(record.startDate);
      const endDate = new Date(record.endDate);
      
      // Skip if diet hasn't started yet or has ended
      if (startDate > today || endDate < today) return;
      
      // Only process if today's consumption hasn't been deducted yet
      if (record.lastConsumptionDate && isToday(new Date(record.lastConsumptionDate))) return;
      
      // Find the inventory item
      const inventoryItem = inventory.find(item => item.id === record.inventoryItemId);
      if (!inventoryItem) return;
      
      // Calculate today's consumption in the inventory item's unit
      const dailyConsumptionInKg = record.totalQuantity * (record.unit === 'kg' ? 1 : convertUnits(1, record.unit, 'kg'));
      const dailyConsumptionInItemUnit = convertUnits(dailyConsumptionInKg, 'kg', inventoryItem.unit);
      
      // Update the inventory with reduced quantity
      const newQuantity = Math.max(0, inventoryItem.quantity - dailyConsumptionInItemUnit);
      
      // Update inventory item
      updateInventoryItem(inventoryItem.id, {
        quantity: newQuantity
      });
      
      // Update diet record with lastConsumptionDate
      // This is handled by the store, not directly in this component
      const recordUpdate = {
        ...record,
        lastConsumptionDate: today
      };
      useStore.getState().updateDietRecord(record.id, recordUpdate);
    });
  }, [dietRecords, inventory, lot, updateInventoryItem]);

  const getItemName = (itemId: string) => {
    const item = inventory.find(item => item.id === itemId);
    return item ? item.name : 'Unknown Item';
  };

  const getItemDetails = (itemId: string) => {
    const item = inventory.find(item => item.id === itemId);
    if (!item) return { name: 'Unknown Item', quantity: 0, unit: '' };
    return {
      name: item.name,
      quantity: item.quantity,
      unit: item.unit
    };
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
        <Button size="sm" onClick={() => setIsDietDialogOpen(true)}>
          Manage Diet
        </Button>
      </div>
      
      {dietRecords.length > 0 ? (
        <div className="space-y-3">
          {dietRecords.map((record) => {
            const { totalConsumption, activeDays } = calculateTotalConsumption(record);
            const itemDetails = getItemDetails(record.inventoryItemId);
            
            return (
              <div key={record.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{itemDetails.name}</div>
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
                  <div>
                    <span className="text-sm font-medium">Inventory remaining:</span>{' '}
                    <span className="text-sm">
                      {itemDetails.quantity.toFixed(2)} {getUnitLabel(itemDetails.unit)}
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
