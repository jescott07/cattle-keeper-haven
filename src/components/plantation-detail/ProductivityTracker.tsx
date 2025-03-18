
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// This is a placeholder component to be expanded in the future with full productivity tracking functionality

interface ProductivityTrackerProps {
  plantationId: string;
}

export function ProductivityTracker({ plantationId }: ProductivityTrackerProps) {
  const [isAddProductivityDialogOpen, setIsAddProductivityDialogOpen] = useState(false);
  const plantation = useStore(state => state.plantations.find(p => p.id === plantationId));
  const productivityRecords = useStore(state => state.productivityRecords.filter(r => r.plantationId === plantationId));
  
  if (!plantation) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Productivity Tracking</h2>
        <Button onClick={() => setIsAddProductivityDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Health Check
        </Button>
      </div>
      
      <div className="text-center py-12">
        <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">
          This is a placeholder for the full productivity tracking functionality.
        </p>
        <p className="text-muted-foreground">
          In the complete implementation, you'll be able to record plant health, 
          track growth stages, upload images, and analyze productivity trends.
        </p>
      </div>
    </div>
  );
}
