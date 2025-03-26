
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { v4 as uuidv4 } from 'uuid';
import { UNIT_CONVERSION_FACTORS, convertUnits } from '@/lib/constants';

interface DietManagementProps {
  lotId: string;
  onComplete?: () => void;
}

// Add this to types.ts later
interface DietRecord {
  id: string;
  lotId: string;
  inventoryItemId: string;
  startDate: Date;
  endDate: Date;
  quantityPerAnimal: number; // Always in grams
  displayQuantityPerAnimal: number; // In the selected item's unit for display
  totalQuantity: number; // In the selected item's unit
  unit: string;
  notes?: string;
  lastConsumptionDate?: Date; // Track when the last consumption was deducted
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'error';
}

export function DietManagement({ lotId, onComplete }: DietManagementProps) {
  const { toast } = useToast();
  const lot = useStore(state => state.lots.find(l => l.id === lotId));
  const inventory = useStore(state => state.inventory.filter(item => item.quantity > 0));
  const addDietRecord = useStore(state => state.addDietRecord || (() => {}));
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInventoryPopoverOpen, setIsInventoryPopoverOpen] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days later
      inventoryItemId: '',
      quantityPerAnimal: '', // This will always be in grams
      notes: ''
    }
  });
  
  const watchQuantityPerAnimal = watch('quantityPerAnimal');
  const watchInventoryItemId = watch('inventoryItemId');
  
  // Filter inventory items based on search
  const filteredInventory = inventorySearch.trim() === '' 
    ? inventory 
    : inventory.filter(item => 
        item.name.toLowerCase().includes(inventorySearch.toLowerCase())
      );
  
  // Calculate total quantity based on quantity per animal and current animal count
  const calculateTotalQuantity = () => {
    if (!lot || !watchQuantityPerAnimal || !selectedItem) return 0;
    
    const qtyPerAnimal = parseFloat(watchQuantityPerAnimal.toString());
    if (isNaN(qtyPerAnimal)) return 0;
    
    // Get the total in grams
    const totalInGrams = qtyPerAnimal * lot.numberOfAnimals;
    
    // Convert from grams to the selected item's unit for display
    return convertUnits(totalInGrams, 'g', selectedItem.unit);
  };
  
  // When inventory item changes, update the selected item
  useEffect(() => {
    if (watchInventoryItemId) {
      const item = inventory.find(i => i.id === watchInventoryItemId);
      setSelectedItem(item || null);
    } else {
      setSelectedItem(null);
    }
  }, [watchInventoryItemId, inventory]);
  
  // Calculate the display quantity per animal in the original item unit
  const getDisplayQuantityPerAnimal = () => {
    if (!watchQuantityPerAnimal || !selectedItem) return '';
    
    const qtyPerAnimal = parseFloat(watchQuantityPerAnimal.toString());
    if (isNaN(qtyPerAnimal)) return '';
    
    // Convert from grams to the selected item's unit for display
    const displayQty = convertUnits(qtyPerAnimal, 'g', selectedItem.unit);
    return displayQty.toFixed(4);
  };
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      if (!lot) throw new Error("Lot not found");
      if (!selectedItem) throw new Error("No inventory item selected");
      
      const quantityPerAnimalInGrams = parseFloat(data.quantityPerAnimal);
      if (isNaN(quantityPerAnimalInGrams) || quantityPerAnimalInGrams <= 0) {
        throw new Error("Invalid quantity per animal");
      }
      
      // Convert to the original unit for display
      const displayQuantityPerAnimal = convertUnits(
        quantityPerAnimalInGrams,
        'g',
        selectedItem.unit
      );
      
      // Calculate total quantity in the original unit
      const totalQuantity = calculateTotalQuantity();
      
      // Create new diet record
      const dietRecord: DietRecord = {
        id: uuidv4(),
        lotId,
        inventoryItemId: data.inventoryItemId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        quantityPerAnimal: quantityPerAnimalInGrams, // Stored in grams
        displayQuantityPerAnimal, // Stored in original unit for display
        totalQuantity,
        unit: selectedItem.unit,
        notes: data.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: 'pending'
      };
      
      addDietRecord(dietRecord);
      
      // If the start date is today, deduct the first day's consumption from inventory
      if (new Date(data.startDate).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)) {
        // The consumption will be applied by the useEffect in NutritionHistory
        dietRecord.lastConsumptionDate = new Date();
      }
      
      toast({
        title: 'Diet Plan Added',
        description: `Diet plan for ${selectedItem.name} has been added to the lot`,
      });
      
      reset();
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error adding diet:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add diet plan',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle inventory item selection
  const handleSelectInventoryItem = (itemId: string) => {
    setValue("inventoryItemId", itemId);
    setIsInventoryPopoverOpen(false);
  };

  // Check if the selected item has enough quantity for the diet plan
  const hasEnoughInventory = () => {
    if (!selectedItem || !lot) return true;
    
    const totalQuantity = calculateTotalQuantity();
    return selectedItem.quantity >= totalQuantity;
  };

  // Display a warning if not enough inventory
  const inventoryWarning = () => {
    if (!selectedItem || hasEnoughInventory()) return null;
    
    return (
      <div className="text-amber-600 text-sm mt-1">
        Warning: The selected item's quantity may not be sufficient for the entire diet period.
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Date Range for Diet */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <div className="relative">
            <Input
              id="startDate"
              type="date"
              {...register('startDate', { required: 'Start date is required' })}
            />
            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <div className="relative">
            <Input
              id="endDate"
              type="date"
              {...register('endDate', { required: 'End date is required' })}
            />
            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          )}
        </div>
      </div>
      
      {/* Inventory Item Selection */}
      <div className="space-y-2">
        <Label htmlFor="inventoryItem">Select Inventory Item</Label>
        <Popover open={isInventoryPopoverOpen} onOpenChange={setIsInventoryPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
              onClick={() => setIsInventoryPopoverOpen(true)}
              type="button"
            >
              {selectedItem ? (
                selectedItem.name
              ) : (
                "Select an item from inventory"
              )}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[300px] p-0" 
            align="start"
            sideOffset={8}
          >
            <Command>
              <CommandInput 
                placeholder="Search inventory..." 
                value={inventorySearch}
                onValueChange={setInventorySearch}
              />
              <CommandList className="max-h-[200px] overflow-y-auto">
                <CommandEmpty>No items found.</CommandEmpty>
                <CommandGroup>
                  {filteredInventory.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => handleSelectInventoryItem(item.id)}
                      className="flex justify-between items-center py-3 px-2 cursor-pointer"
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.quantity} {item.unit} available
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.inventoryItemId && (
          <p className="text-sm text-destructive">{errors.inventoryItemId.message}</p>
        )}
      </div>
      
      {/* Quantity per animal */}
      {selectedItem && (
        <div className="space-y-2">
          <Label htmlFor="quantityPerAnimal">
            Quantity per animal per day (grams)
          </Label>
          <Input
            id="quantityPerAnimal"
            type="number"
            step="0.0001"
            min="0.0001"
            placeholder="Enter amount in grams"
            {...register('quantityPerAnimal', { 
              required: 'Quantity is required',
              min: { value: 0.0001, message: 'Must be greater than 0' }
            })}
          />
          {errors.quantityPerAnimal && (
            <p className="text-sm text-destructive">{errors.quantityPerAnimal.message}</p>
          )}
          
          {/* Show unit conversion info */}
          <p className="text-xs text-muted-foreground">
            Always enter the amount in grams, regardless of the item's unit.
          </p>
          
          {/* Display converted quantity */}
          {watchQuantityPerAnimal && lot && selectedItem && !isNaN(parseFloat(watchQuantityPerAnimal.toString())) && (
            <div className="mt-4 p-3 bg-muted/30 rounded-md">
              <div className="text-sm">
                <span className="font-medium">In original unit:</span>{' '}
                {getDisplayQuantityPerAnimal()} {selectedItem.unit} per animal per day
              </div>
              <div className="text-sm mt-1">
                <span className="font-medium">Total quantity per day:</span>{' '}
                {calculateTotalQuantity().toFixed(4)} {selectedItem.unit}
              </div>
              <div className="text-sm mt-1">
                <span className="font-medium">Available in inventory:</span>{' '}
                {selectedItem.quantity.toFixed(4)} {selectedItem.unit}
              </div>
              {inventoryWarning()}
              <div className="text-xs text-muted-foreground mt-1">
                Based on {lot.numberOfAnimals} animals in the lot
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional information about this diet plan..."
          {...register('notes')}
        />
      </div>
      
      {/* Submit button */}
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting || !lot || !selectedItem || !watchQuantityPerAnimal}
      >
        Add Diet Plan
      </Button>
    </form>
  );
}
