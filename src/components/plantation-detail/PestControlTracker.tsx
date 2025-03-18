
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Bug, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// This is a placeholder component to be expanded in the future with full pest control functionality

interface PestControlTrackerProps {
  plantationId: string;
}

export function PestControlTracker({ plantationId }: PestControlTrackerProps) {
  const [isAddPestControlDialogOpen, setIsAddPestControlDialogOpen] = useState(false);
  const plantation = useStore(state => state.plantations.find(p => p.id === plantationId));
  const pestControls = useStore(state => state.pestControls.filter(p => p.plantationId === plantationId));
  
  if (!plantation) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Pest Control</h2>
        <Button onClick={() => setIsAddPestControlDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Record Pest Control
        </Button>
      </div>
      
      <div className="text-center py-12">
        <Bug className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">
          This is a placeholder for the full pest control tracking functionality.
        </p>
        <p className="text-muted-foreground">
          In the complete implementation, you'll be able to record pest sightings,
          track treatments, monitor effectiveness, and receive recommendations.
        </p>
      </div>
    </div>
  );
}
