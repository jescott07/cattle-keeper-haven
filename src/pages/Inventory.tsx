
import { useState } from 'react';
import { Package, Plus, Search, FilterX } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InventoryItem } from '@/components/InventoryItem';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem as InventoryItemType, InventoryType } from '@/lib/types';
import { AddInventoryForm } from '@/components/AddInventoryForm';

const Inventory = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<InventoryType | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemType | null>(null);

  const inventory = useStore(state => state.inventory);
  const removeInventoryItem = useStore(state => state.removeInventoryItem);

  // Filter by search query and type
  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleEditItem = (item: InventoryItemType) => {
    setSelectedItem(item);
    setIsAddDialogOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    removeInventoryItem(id);
    toast({
      title: 'Item Removed',
      description: 'The inventory item has been removed.',
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
  };
  
  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
    setSelectedItem(null);
    toast({
      title: selectedItem ? "Item Updated" : "Item Added",
      description: selectedItem 
        ? "The inventory item has been updated successfully."
        : "A new inventory item has been added successfully."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in animate-slide-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground mt-1">Manage feed, supplies and equipment.</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Inventory Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{selectedItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                <DialogDescription>
                  {selectedItem 
                    ? 'Update the details for this inventory item.' 
                    : 'Enter the details for the new inventory item.'}
                </DialogDescription>
              </DialogHeader>
              
              <AddInventoryForm 
                item={selectedItem || undefined} 
                onSuccess={handleFormSuccess} 
              />
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-[180px]">
            <Select 
              value={typeFilter} 
              onValueChange={(value) => setTypeFilter(value as InventoryType | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="feed">Feed</SelectItem>
                <SelectItem value="mineral">Mineral</SelectItem>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Inventory Items */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <InventoryItem
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-background">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            
            {inventory.length === 0 ? (
              <div>
                <h3 className="text-lg font-medium">No inventory items yet</h3>
                <p className="text-muted-foreground mt-1">Add your first item to get started.</p>
                <Button 
                  variant="outline" 
                  className="mt-4 gap-2"
                  onClick={() => {
                    setSelectedItem(null);
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Inventory Item
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium">No matching items</h3>
                <p className="text-muted-foreground mt-1">Try changing your search or filter.</p>
                <Button 
                  variant="outline" 
                  className="mt-4 gap-2"
                  onClick={clearFilters}
                >
                  <FilterX className="h-4 w-4" />
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

export default Inventory;
