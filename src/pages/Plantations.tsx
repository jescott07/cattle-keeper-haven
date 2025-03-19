
import { useState } from 'react';
import { Plus, Trees } from 'lucide-react';
import { useStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

export default function Plantations() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const plantations = useStore((state) => state.plantations || []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Plantations</h1>
            <p className="text-muted-foreground mt-1">Manage your plantation areas.</p>
          </div>
          
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Plantation
          </Button>
        </div>

        {plantations.length === 0 ? (
          <div className="text-center p-12 border rounded-lg bg-card">
            <Trees className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium mb-2">No plantations added yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your first plantation to start tracking your crops.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Plantation
            </Button>
          </div>
        ) : (
          <div className="text-center p-12 border rounded-lg bg-card">
            <p>Plantation management functionality will be implemented soon.</p>
          </div>
        )}

        {/* Add Plantation Dialog - Placeholder */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Plantation</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p>Plantation form will be implemented soon.</p>
              <Button 
                className="w-full mt-4" 
                onClick={() => {
                  setDialogOpen(false);
                  toast({
                    title: "Not yet implemented",
                    description: "Plantation functionality will be available soon.",
                  });
                }}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
