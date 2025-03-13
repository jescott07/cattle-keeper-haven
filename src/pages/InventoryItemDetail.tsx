
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { typeColorMap } from '@/components/InventoryItem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddInventoryForm } from '@/components/AddInventoryForm';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const InventoryItemDetail = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const inventory = useStore(state => state.inventory);
  const removeInventoryItem = useStore(state => state.removeInventoryItem);
  const item = inventory.find(item => item.id === itemId);
  
  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Button variant="outline" className="mb-6" onClick={() => navigate('/inventory')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold">Item not found</h1>
            <p className="text-muted-foreground mt-2">The inventory item you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    );
  }
  
  const { bg, text, icon } = typeColorMap[item.type];

  const handleFormSuccess = () => {
    setIsEditDialogOpen(false);
    toast({
      title: "Item Updated",
      description: "The inventory item has been updated successfully."
    });
  };
  
  const handleDelete = () => {
    if (itemId) {
      removeInventoryItem(itemId);
      toast({
        title: "Item Deleted",
        description: "The inventory item has been permanently deleted",
      });
      navigate('/inventory');
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigate('/inventory')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Button>
          
          <Button 
            className="gap-2"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4" />
            Edit Item
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Badge className={`${bg} ${text} h-6`}>
              {icon}
              <span className="ml-1 capitalize">{item.type}</span>
            </Badge>
            {item.templateId && (
              <Badge variant="outline">Template-based</Badge>
            )}
          </div>
          
          <h1 className="text-3xl font-bold">{item.name}</h1>
          
          <div className="flex flex-wrap gap-3 mt-2">
            <div className="text-sm text-muted-foreground">
              Quantity: <span className="font-medium text-foreground">{item.quantity} {item.unit}</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Cost: <span className="font-medium text-foreground">${item.costPerUnit.toFixed(2)} per {item.unit}</span>
            </div>
            
            {item.purchaseDate && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Purchased: <span className="font-medium text-foreground">{format(new Date(item.purchaseDate), 'MMM d, yyyy')}</span>
              </div>
            )}
            
            {item.expiryDate && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Expires: <span className="font-medium text-foreground">{format(new Date(item.expiryDate), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
        
        {item.notes && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.notes}</p>
            </CardContent>
          </Card>
        )}
        
        {item.properties && item.properties.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Detailed Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {item.properties.map((property) => (
                <Card key={property.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-medium">{property.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {property.propertyType === 'min' ? 'Mín' : 
                         property.propertyType === 'max' ? 'Máx' : ''}
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold">
                      {property.value} {property.unit}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        <Separator className="my-6" />
        
        <div className="text-sm text-muted-foreground mb-10">
          <div>Created: {format(new Date(item.createdAt), 'MMM d, yyyy')}</div>
          <div>Last Updated: {format(new Date(item.updatedAt), 'MMM d, yyyy')}</div>
        </div>
        
        <div className="flex justify-center mt-8 pt-6 border-t">
          <Button 
            variant="destructive" 
            className="gap-2" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash className="h-4 w-4" />
            Delete Item
          </Button>
        </div>
      </main>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <AddInventoryForm 
            item={item} 
            onSuccess={handleFormSuccess} 
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the inventory item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InventoryItemDetail;
