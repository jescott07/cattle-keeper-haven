
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Weight, Calendar, FileText, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Lot } from '@/lib/types';

interface WeighingFormData {
  lotId: string;
  date: string;
  numberOfAnimals: number;
  totalWeight: number;
  destinationLotId: string;
  notes: string;
}

export const WeighingForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const lots = useStore((state) => state.lots);
  const addWeighingRecord = useStore((state) => state.addWeighingRecord);
  const updateLot = useStore((state) => state.updateLot);
  
  const activeLots = lots.filter(lot => lot.status === 'active');
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<WeighingFormData>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      numberOfAnimals: 0,
      totalWeight: 0,
      notes: ''
    }
  });
  
  const selectedLotId = watch('lotId');
  const selectedLot = selectedLotId ? lots.find(lot => lot.id === selectedLotId) : null;
  const numberOfAnimals = watch('numberOfAnimals');
  const totalWeight = watch('totalWeight');
  
  // Calculate average weight
  const averageWeight = numberOfAnimals > 0 ? totalWeight / numberOfAnimals : 0;
  
  // When lot is selected, set default number of animals
  const handleLotChange = (value: string) => {
    setValue('lotId', value);
    const lot = lots.find(lot => lot.id === value);
    if (lot) {
      setValue('numberOfAnimals', lot.numberOfAnimals);
    }
  };
  
  const onSubmit = (data: WeighingFormData) => {
    setIsSubmitting(true);
    
    try {
      const selectedLot = lots.find(lot => lot.id === data.lotId);
      
      if (!selectedLot) {
        toast({
          title: 'Error',
          description: 'Selected lot not found.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      // Add weighing record
      addWeighingRecord({
        date: new Date(data.date),
        lotId: data.lotId,
        numberOfAnimals: data.numberOfAnimals,
        totalWeight: data.totalWeight,
        averageWeight: data.totalWeight / data.numberOfAnimals,
        destinationLotId: data.destinationLotId || undefined,
        notes: data.notes
      });
      
      // Update lot with new average weight
      updateLot(data.lotId, {
        averageWeight: data.totalWeight / data.numberOfAnimals
      });
      
      // If destination lot is selected and different from source lot,
      // handle the transfer logic here
      if (data.destinationLotId && data.destinationLotId !== data.lotId) {
        // Only transfer if not all animals are being transferred
        if (data.numberOfAnimals < selectedLot.numberOfAnimals) {
          // Update source lot
          updateLot(data.lotId, {
            numberOfAnimals: selectedLot.numberOfAnimals - data.numberOfAnimals
          });
          
          // Update destination lot
          const destinationLot = lots.find(lot => lot.id === data.destinationLotId);
          if (destinationLot) {
            updateLot(data.destinationLotId, {
              numberOfAnimals: destinationLot.numberOfAnimals + data.numberOfAnimals
            });
          }
        } else {
          // If all animals are being transferred, update with a direct replacement
          updateLot(data.lotId, {
            currentPastureId: destinationLot?.currentPastureId || selectedLot.currentPastureId
          });
        }
      }
      
      toast({
        title: 'Success',
        description: 'Weighing record added successfully.',
      });
      
      // Reset form
      reset();
    } catch (error) {
      console.error('Error adding weighing record:', error);
      toast({
        title: 'Error',
        description: 'Failed to add weighing record.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Weight className="h-5 w-5" />
          Record Weighing
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lotId">Lot</Label>
              <Select onValueChange={handleLotChange}>
                <SelectTrigger id="lotId">
                  <SelectValue placeholder="Select a lot" />
                </SelectTrigger>
                <SelectContent>
                  {activeLots.map((lot) => (
                    <SelectItem key={lot.id} value={lot.id}>
                      {lot.name} ({lot.numberOfAnimals} animals)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.lotId && (
                <p className="text-sm text-destructive">{errors.lotId.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  {...register('date', { required: 'Date is required' })}
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfAnimals">Number of Animals</Label>
              <Input
                id="numberOfAnimals"
                type="number"
                {...register('numberOfAnimals', { 
                  required: 'Number of animals is required',
                  min: {
                    value: 1,
                    message: 'Must be at least 1'
                  },
                  max: {
                    value: selectedLot?.numberOfAnimals || 0,
                    message: `Cannot exceed lot total (${selectedLot?.numberOfAnimals || 0})`
                  }
                })}
              />
              {errors.numberOfAnimals && (
                <p className="text-sm text-destructive">{errors.numberOfAnimals.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalWeight">Total Weight (kg)</Label>
              <Input
                id="totalWeight"
                type="number"
                step="0.1"
                {...register('totalWeight', { 
                  required: 'Total weight is required',
                  min: {
                    value: 0.1,
                    message: 'Must be greater than 0'
                  }
                })}
              />
              {errors.totalWeight && (
                <p className="text-sm text-destructive">{errors.totalWeight.message}</p>
              )}
              
              {numberOfAnimals > 0 && totalWeight > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Average: {averageWeight.toFixed(1)} kg per animal
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="destinationLotId">Transfer to Lot (Optional)</Label>
            <Select onValueChange={(value) => setValue('destinationLotId', value)}>
              <SelectTrigger id="destinationLotId">
                <SelectValue placeholder="Select destination lot (if transferring)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No transfer</SelectItem>
                {lots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.name} {lot.id === selectedLotId ? '(Current)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <div className="relative">
              <Textarea
                id="notes"
                placeholder="Add any notes about this weighing..."
                {...register('notes')}
                className="min-h-[80px]"
              />
              <FileText className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full gap-2"
            disabled={isSubmitting || !selectedLotId}
          >
            <Check className="h-4 w-4" />
            Record Weighing
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
