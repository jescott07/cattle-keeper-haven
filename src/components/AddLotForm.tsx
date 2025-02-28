
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
import { Lot, AnimalSource, LotStatus } from '@/lib/types';

interface AddLotFormProps {
  lot?: Lot;
  onSuccess: () => void;
}

type FormData = {
  name: string;
  numberOfAnimals: number;
  source: AnimalSource;
  status: LotStatus;
  purchaseDate: string;
  currentPastureId: string;
  breed?: string;
  notes?: string;
};

export function AddLotForm({ lot, onSuccess }: AddLotFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const addLot = useStore(state => state.addLot);
  const updateLot = useStore(state => state.updateLot);
  const pastures = useStore(state => state.pastures);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: lot?.name || '',
      numberOfAnimals: lot?.numberOfAnimals || 0,
      source: lot?.source || 'auction',
      status: lot?.status || 'active',
      purchaseDate: lot?.purchaseDate ? format(new Date(lot.purchaseDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      currentPastureId: lot?.currentPastureId || '',
      breed: lot?.breed || '',
      notes: lot?.notes || ''
    }
  });
  
  // Set values for source and status with useEffect
  useEffect(() => {
    if (lot) {
      setValue('source', lot.source);
      setValue('status', lot.status);
      setValue('currentPastureId', lot.currentPastureId);
    }
  }, [lot, setValue]);
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      if (lot) {
        // Update existing lot
        updateLot(lot.id, {
          name: data.name,
          numberOfAnimals: Number(data.numberOfAnimals),
          source: data.source,
          status: data.status,
          purchaseDate: new Date(data.purchaseDate),
          currentPastureId: data.currentPastureId,
          breed: data.breed,
          notes: data.notes
        });
      } else {
        // Add new lot
        addLot({
          name: data.name,
          numberOfAnimals: Number(data.numberOfAnimals),
          source: data.source,
          status: data.status,
          purchaseDate: new Date(data.purchaseDate),
          currentPastureId: data.currentPastureId,
          breed: data.breed,
          notes: data.notes
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving lot:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Lot Name</Label>
          <Input
            id="name"
            placeholder="Enter lot name"
            {...register('name', { required: 'Lot name is required' })}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numberOfAnimals">Number of Animals</Label>
            <Input
              id="numberOfAnimals"
              type="number"
              min="1"
              {...register('numberOfAnimals', { 
                required: 'Number of animals is required',
                min: { value: 1, message: 'Must have at least 1 animal' }
              })}
            />
            {errors.numberOfAnimals && <p className="text-sm text-destructive">{errors.numberOfAnimals.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="breed">Breed (Optional)</Label>
            <Input
              id="breed"
              placeholder="Enter breed"
              {...register('breed')}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select 
              onValueChange={(value) => setValue('source', value as AnimalSource)} 
              defaultValue={lot?.source || 'auction'}
            >
              <SelectTrigger id="source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auction">Auction</SelectItem>
                <SelectItem value="another-farmer">Another Farmer</SelectItem>
                <SelectItem value="born-on-farm">Born on Farm</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              onValueChange={(value) => setValue('status', value as LotStatus)} 
              defaultValue={lot?.status || 'active'}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="treatment">Treatment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase/Entry Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              {...register('purchaseDate', { required: 'Date is required' })}
            />
            {errors.purchaseDate && <p className="text-sm text-destructive">{errors.purchaseDate.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currentPastureId">Current Pasture</Label>
            <Select 
              onValueChange={(value) => setValue('currentPastureId', value)} 
              defaultValue={lot?.currentPastureId || ''}
            >
              <SelectTrigger id="currentPastureId">
                <SelectValue placeholder="Select pasture" />
              </SelectTrigger>
              <SelectContent>
                {pastures.map(pasture => (
                  <SelectItem key={pasture.id} value={pasture.id}>
                    {pasture.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.currentPastureId && <p className="text-sm text-destructive">{errors.currentPastureId.message}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Enter any additional notes"
            className="min-h-[100px]"
            {...register('notes')}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {lot ? 'Update Lot' : 'Add Lot'}
        </Button>
      </DialogFooter>
    </form>
  );
}
