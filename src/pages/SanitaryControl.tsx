
import { useState } from 'react';
import { Plus, Scissors, Search, X } from 'lucide-react';
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
import { SanitaryTreatmentForm } from '@/components/sanitary-control/SanitaryTreatmentForm';
import { SanitaryTreatmentCard } from '@/components/sanitary-control/SanitaryTreatmentCard';
import { useToast } from '@/components/ui/use-toast';

export default function SanitaryControl() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const sanitaryTreatments = useStore((state) => state.sanitaryTreatments || []);
  
  // Filter by search query
  const filteredTreatments = sanitaryTreatments.filter(treatment => 
    treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    treatment.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTreatmentAdded = () => {
    setDialogOpen(false);
    toast({
      title: "Treatment Recorded",
      description: "The sanitary treatment has been successfully recorded.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sanitary Control</h1>
            <p className="text-muted-foreground mt-1">Manage all sanitary treatments and interventions.</p>
          </div>
          
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Record Treatment
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative flex-1 mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search treatments..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Treatment Cards */}
        {filteredTreatments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTreatments.map((treatment) => (
              <SanitaryTreatmentCard key={treatment.id} treatment={treatment} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 border rounded-lg bg-card">
            <Scissors className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium mb-2">No treatments recorded yet</h3>
            <p className="text-muted-foreground mb-6">
              Record your first sanitary treatment to keep track of animal health interventions.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Record First Treatment
            </Button>
          </div>
        )}

        {/* Add Treatment Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Sanitary Treatment</DialogTitle>
            </DialogHeader>
            <SanitaryTreatmentForm onTreatmentAdded={handleTreatmentAdded} />
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
