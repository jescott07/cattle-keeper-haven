
import { useState } from 'react';
import { MapPin, Plus, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PastureCard } from '@/components/PastureCard';
import { useStore } from '@/lib/store';
import { Pasture } from '@/lib/types';
import { AddPastureForm } from '@/components/AddPastureForm';
import { useToast } from '@/hooks/use-toast';

const Pastures = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPasture, setSelectedPasture] = useState<Pasture | null>(null);

  const pastures = useStore(state => state.pastures);

  // Filter by search query
  const filteredPastures = pastures.filter(pasture => 
    pasture.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pasture.grassType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pasture.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditPasture = (pasture: Pasture) => {
    setSelectedPasture(pasture);
    setIsAddDialogOpen(true);
  };
  
  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
    setSelectedPasture(null);
    toast({
      title: selectedPasture ? "Pasture Updated" : "Pasture Added",
      description: selectedPasture 
        ? "The pasture has been updated successfully."
        : "A new pasture has been added successfully."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in animate-slide-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pastures</h1>
            <p className="text-muted-foreground mt-1">Manage your grazing lands.</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => {
                setSelectedPasture(null);
                setIsAddDialogOpen(true);
              }}>
                <Plus className="h-4 w-4" />
                Add New Pasture
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{selectedPasture ? 'Edit Pasture' : 'Add New Pasture'}</DialogTitle>
                <DialogDescription>
                  {selectedPasture 
                    ? 'Update the details for this pasture.' 
                    : 'Enter the details for the new pasture.'}
                </DialogDescription>
              </DialogHeader>
              
              <AddPastureForm 
                pasture={selectedPasture || undefined} 
                onSuccess={handleFormSuccess} 
              />
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pastures..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Pasture Cards */}
        {filteredPastures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPastures.map(pasture => (
              <PastureCard
                key={pasture.id}
                pasture={pasture}
                onEdit={handleEditPasture}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-background">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            
            {pastures.length === 0 ? (
              <div>
                <h3 className="text-lg font-medium">No pastures yet</h3>
                <p className="text-muted-foreground mt-1">Add your first pasture to get started.</p>
                <Button 
                  variant="outline" 
                  className="mt-4 gap-2"
                  onClick={() => {
                    setSelectedPasture(null);
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add New Pasture
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium">No matching pastures</h3>
                <p className="text-muted-foreground mt-1">Try changing your search.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Pastures;
