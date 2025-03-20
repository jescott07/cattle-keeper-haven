
import React from 'react';
import { Search } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { InventoryItem } from '@/lib/types';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../AddPlantationTaskForm';

interface InventorySelectorProps {
  form: UseFormReturn<FormValues>;
  inventory: InventoryItem[];
  selectedInventoryItem: InventoryItem | undefined;
}

export function InventorySelector({ form, inventory, selectedInventoryItem }: InventorySelectorProps) {
  const [isInventoryOpen, setIsInventoryOpen] = React.useState(false);
  const [inventorySearch, setInventorySearch] = React.useState('');
  
  // Filter inventory items based on search
  const filteredInventory = React.useMemo(() => {
    if (!inventorySearch.trim()) return inventory.filter(item => item.quantity > 0);
    
    return inventory.filter(item => 
      item.name.toLowerCase().includes(inventorySearch.toLowerCase()) &&
      item.quantity > 0 // Only show items with stock
    );
  }, [inventory, inventorySearch]);

  // Handle inventory item selection
  const handleSelectInventoryItem = (itemId: string) => {
    form.setValue("inventoryItemId", itemId);
    setIsInventoryOpen(false);
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setInventorySearch(value);
  };

  const selectedInventoryItemId = form.watch('inventoryItemId');

  return (
    <div className="space-y-6 border p-4 rounded-md bg-muted/10">
      <h3 className="text-md font-medium">Inventory Usage</h3>
      
      <FormField
        control={form.control}
        name="inventoryItemId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select Inventory Item (optional)</FormLabel>
            <Popover 
              open={isInventoryOpen} 
              onOpenChange={setIsInventoryOpen}
            >
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={`w-full justify-between ${!field.value ? "text-muted-foreground" : ""}`}
                    onClick={() => setIsInventoryOpen(true)}
                    type="button"
                  >
                    {field.value ? (
                      selectedInventoryItem?.name
                    ) : (
                      "Select an item"
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[300px] p-0" 
                sideOffset={4}
                align="start"
                style={{ zIndex: 9999 }}
              >
                <Command>
                  <CommandInput
                    placeholder="Search inventory..."
                    className="h-9"
                    value={inventorySearch}
                    onValueChange={handleSearchChange}
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
                            {item.quantity} {item.unit}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {selectedInventoryItemId && (
        <FormField
          control={form.control}
          name="inventoryItemQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity to Use</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number" 
                    min="1"
                    max={selectedInventoryItem?.quantity.toString()}
                    step="1"
                    {...field} 
                  />
                  <span className="text-sm text-muted-foreground">
                    / {selectedInventoryItem?.quantity} {selectedInventoryItem?.unit}
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
