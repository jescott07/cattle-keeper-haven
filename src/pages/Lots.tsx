
import { useState } from 'react';
import { Bull, Plus, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LotCard } from '@/components/LotCard';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useStore } from '@/lib/store';
import { Lot, LotStatus } from '@/lib/types';

const Lots = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LotStatus | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);

  const lots = useStore(state => state.lots);
  const pastures = useStore(state => state.pastures);

  // Filter by search query and status
  const filteredLots = lots.filter(lot => {
    const matchesSearch = lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (lot.breed || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (lot.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lot.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getPastureName = (pastureId: string) => {
    const pasture = pastures.find(p => p.id === pastureId);
    return pasture ? pasture.name : 'Unknown Pasture';
  };

  const handleEditLot = (lot: Lot) => {
    setSelectedLot(lot);
    setIsAddDialogOpen(true);
  };

  const handleViewLotDetail = (lot: Lot) => {
    // In a more complete app, we would navigate to a detail page
    // For now, we'll just open the edit dialog
    setSelectedLot(lot);
    setIsAddDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in animate-slide-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cattle Lots</h1>
            <p className="text-muted-foreground mt-1">Manage your animal groups.</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Lot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{selectedLot ? 'Edit Lot' : 'Add New Lot'}</DialogTitle>
                <DialogDescription>
                  {selectedLot 
                    ? 'Update the details for this lot.' 
                    : 'Enter the details for the new lot.'}
                </DialogDescription>
              </DialogHeader>
              
              {/* In a complete app, this would be a form component */}
              <div className="py-4">
                <p className="text-center text-muted-foreground">
                  Form would go here in a complete implementation
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lots..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-[180px]">
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as LotStatus | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="treatment">Treatment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Lot Cards */}
        {filteredLots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLots.map(lot => (
              <LotCard
                key={lot.id}
                lot={lot}
                pastureName={getPastureName(lot.currentPastureId)}
                onEdit={handleEditLot}
                onViewDetail={handleViewLotDetail}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-background">
            <Bull className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            
            {lots.length === 0 ? (
              <div>
                <h3 className="text-lg font-medium">No lots yet</h3>
                <p className="text-muted-foreground mt-1">Add your first lot to get started.</p>
                <Button 
                  variant="outline" 
                  className="mt-4 gap-2"
                  onClick={() => {
                    setSelectedLot(null);
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add New Lot
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium">No matching lots</h3>
                <p className="text-muted-foreground mt-1">Try changing your search or filter.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Lots;
