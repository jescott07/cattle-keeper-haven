
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wheat, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DietManagement } from './DietManagement';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getUnitLabel } from '@/lib/constants';

interface NutritionHistoryProps {
  lotId: string;
}

export function NutritionHistory({ lotId }: NutritionHistoryProps) {
  const [isDietDialogOpen, setIsDietDialogOpen] = useState(false);
  const dietRecords = useStore(state => 
    state.dietRecords.filter(record => record.lotId === lotId) || []
  );
  const inventory = useStore(state => state.inventory);

  // Get item name from inventory
  const getItemName = (itemId: string) => {
    const item = inventory.find(item => item.id === itemId);
    return item ? item.name : 'Unknown Item';
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
