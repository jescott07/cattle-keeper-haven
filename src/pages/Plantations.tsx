
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { PlantationCard } from '@/components/plantation/PlantationCard';
import { AddPlantationForm } from '@/components/plantation/AddPlantationForm';

export default function Plantations() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const plantations = useStore((state) => state.plantations);

  const openDialog = () => {
    console.log('Opening dialog...');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    console.log('Closing dialog...');
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Plantations</h1>
          <Button onClick={openDialog} type="button" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Plantation
          </Button>
        </div>

        {plantations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plantations.map((plantation) => (
              <PlantationCard key={plantation.id} plantation={plantation} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 border rounded-lg bg-card">
            <h3 className="text-xl font-medium mb-2">No plantations yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your first plantation to start tracking your crops and their productivity.
            </p>
            <Button onClick={openDialog} type="button" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add First Plantation
            </Button>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Plantation</DialogTitle>
            </DialogHeader>
            <AddPlantationForm onPlantationAdded={closeDialog} />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
