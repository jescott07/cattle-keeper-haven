
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Wrench, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// This is a placeholder component to be expanded in the future with full maintenance tracking functionality

interface PlantationMaintenanceTrackerProps {
  plantationId: string;
}

export function PlantationMaintenanceTracker({ plantationId }: PlantationMaintenanceTrackerProps) {
  const [isAddMaintenanceDialogOpen, setIsAddMaintenanceDialogOpen] = useState(false);
  const plantation = useStore(state => state.plantations.find(p => p.id === plantationId));
  const maintenances = useStore(state => state.plantationMaintenances.filter(m => m.plantationId === plantationId));
  
  if (!plantation) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Maintenance Records</h2>
        <Button onClick={() => setIsAddMaintenanceDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Schedule Maintenance
        </Button>
      </div>
      
      <div className="text-center py-12">
        <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">
          This is a placeholder for the full maintenance tracking functionality.
        </p>
        <p className="text-muted-foreground">
          In the complete implementation, you'll be able to schedule and track maintenance tasks,
          record costs, set reminders, and view maintenance history.
        </p>
      </div>
    </div>
  );
}
