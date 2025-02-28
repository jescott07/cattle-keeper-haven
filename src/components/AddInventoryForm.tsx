
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { useStore } from '@/lib/store';
import { InventoryItem, InventoryType } from '@/lib/types';

interface AddInventoryFormProps {
  item?: InventoryItem;
  onSuccess: () => void;
}

type FormData = {
  name: string;
  type: InventoryType;
  quantity: number;
  unit: string;
  purchaseDate?: string;
  expiryDate?: string;
  costPerUnit: number;
  notes?: string;
};

export function AddInventoryForm({ item, onSuccess }: AddInventoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const addInventoryItem = useStore(state => state.addInventoryItem);
  const updateInventoryItem = useStore(state => state.updateInventoryItem);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: item?.name || '',
      type: item?.type || 'feed',
      quantity: item?.quantity || 0,
      unit: item?.unit || 'kg',
      purchaseDate: item?.purchaseDate ? format(new Date(item.purchaseDate), 'yyyy-MM-dd') : undefined,
      expiryDate: item?.expiryDate ? format(new Date(item.expiryDate), 'yyyy-MM-dd') : undefined,
      costPerUnit: item?.costPerUnit || 0,
      notes: item?.notes || ''
    }
  });
  
  // Set values for type with useEffect
  useEffect(() => {
    if (item) {
      setValue('type', item.type);
    }
  }, [item, setValue]);
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const inventoryData = {
        name: data.name,
        type: data.type,
        quantity: Number(data.quantity),
        unit: data.unit,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        costPerUnit: Number(data.costPerUnit),
        notes: data.notes
      };
      
      if (item) {
        // Update existing item
        updateInventoryItem(item.id, inventoryData);
      } else {
        // Add new item
        addInventoryItem(inventoryData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving inventory item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Item Name</Label>
          <Input
            id="name"
            placeholder="Enter item name"
            {...register('name', { required: 'Item name is required' })}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select 
              onValueChange={(value) => setValue('type', value as InventoryType)} 
              defaultValue={item?.type || 'feed'}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feed">Feed</SelectItem>
                <SelectItem value="mineral">Mineral</SelectItem>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="costPerUnit">Cost Per Unit</Label>
            <Input
              id="costPerUnit"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              {...register('costPerUnit', { 
                required: 'Cost is required',
                min: { value: 0, message: 'Cost cannot be negative' }
              })}
            />
            {errors.costPerUnit && <p className="text-sm text-destructive">{errors.costPerUnit.message}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="0.01"
              {...register('quantity', { 
                required: 'Quantity is required',
                min: { value: 0, message: 'Quantity cannot be negative' }
              })}
            />
            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              placeholder="e.g., kg, liters, pieces"
              {...register('unit', { required: 'Unit is required' })}
            />
            {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date (Optional)</Label>
            <Input
              id="purchaseDate"
              type="date"
              {...register('purchaseDate')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
            <Input
              id="expiryDate"
              type="date"
              {...register('expiryDate')}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Enter any additional notes"
            className="min-h-[80px]"
            {...register('notes')}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {item ? 'Update Item' : 'Add Item'}
        </Button>
      </DialogFooter>
    </form>
  );
}
