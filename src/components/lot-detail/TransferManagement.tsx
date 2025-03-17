
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ArrowLeftRight, ChevronRight, Calendar } from 'lucide-react';

interface TransferManagementProps {
  initialLotId?: string;
  onTransferComplete?: () => void;
}

export function TransferManagement({ initialLotId, onTransferComplete }: TransferManagementProps) {
  const { toast } = useToast();
  const lots = useStore((state) => state.lots);
  const addWeighingRecord = useStore((state) => state.addWeighingRecord);
  const updateLot = useStore((state) => state.updateLot);
  
  const [isScheduled, setIsScheduled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const activeLots = lots.filter(lot => lot.status === 'active' && (!initialLotId || lot.id !== initialLotId));
  const sourceLot = initialLotId ? lots.find(lot => lot.id === initialLotId) : null;
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      fromLotId: initialLotId || '',
      toLotId: '',
      numberOfAnimals: 1,
      averageWeight: sourceLot?.averageWeight || 0,
      scheduledDate: format(new Date(), 'yyyy-MM-dd'),
      notes: ''
    }
  });
  
  const selectedFromLotId = watch('fromLotId');
  const selectedToLotId = watch('toLotId');
  const numberOfAnimals = watch('numberOfAnimals');
  const selectedFromLot = selectedFromLotId ? lots.find(lot => lot.id === selectedFromLotId) : null;
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const transferDate = new Date(data.scheduledDate);
      
      if (!isScheduled) {
        // Execute transfer immediately
        // 1. Create weighing record with transfer information
        addWeighingRecord({
          date: transferDate,
          lotId: data.fromLotId,
          numberOfAnimals: Number(data.numberOfAnimals),
          totalWeight: Number(data.numberOfAnimals) * Number(data.averageWeight),
          averageWeight: Number(data.averageWeight),
          destinationLotId: data.toLotId,
          notes: data.notes
        });
        
        // 2. Update source lot - reduce animal count
        const fromLot = lots.find(lot => lot.id === data.fromLotId);
        if (fromLot) {
          updateLot(data.fromLotId, {
            numberOfAnimals: Math.max(0, fromLot.numberOfAnimals - Number(data.numberOfAnimals))
          });
        }
        
        // 3. Update destination lot - increase animal count
        const toLot = lots.find(lot => lot.id === data.toLotId);
        if (toLot) {
          updateLot(data.toLotId, {
            numberOfAnimals: toLot.numberOfAnimals + Number(data.numberOfAnimals)
          });
        }
      }
      
      toast({
        title: isScheduled ? 'Transfer Scheduled' : 'Transfer Completed',
        description: isScheduled 
          ? `Transfer scheduled for ${format(transferDate, 'MMM d, yyyy')}` 
          : `${data.numberOfAnimals} animals have been transferred successfully`,
      });
      
      // Reset form and call completion callback if provided
      reset();
      if (onTransferComplete) {
        onTransferComplete();
      }
    } catch (error) {
      console.error('Error executing transfer:', error);
      toast({
        title: 'Error',
        description: 'Failed to transfer animals. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fromLotId">Source Lot</Label>
        <Select 
          value={selectedFromLotId} 
          onValueChange={(value) => setValue('fromLotId', value)}
          disabled={initialLotId !== undefined}
        >
          <SelectTrigger id="fromLotId">
            <SelectValue placeholder="Select source lot" />
          </SelectTrigger>
          <SelectContent>
            {lots.filter(lot => lot.status === 'active').map((lot) => (
              <SelectItem key={lot.id} value={lot.id}>
                {lot.name} ({lot.numberOfAnimals} animals)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.fromLotId && (
          <p className="text-sm text-destructive">{errors.fromLotId.message}</p>
        )}
      </div>
      
      <div className="flex justify-center py-2">
        <ChevronRight className="h-6 w-6 text-muted-foreground" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="toLotId">Destination Lot</Label>
        <Select 
          value={selectedToLotId} 
          onValueChange={(value) => setValue('toLotId', value)}
        >
          <SelectTrigger id="toLotId">
            <SelectValue placeholder="Select destination lot" />
          </SelectTrigger>
          <SelectContent>
            {activeLots.map((lot) => (
              <SelectItem key={lot.id} value={lot.id}>
                {lot.name} ({lot.numberOfAnimals} animals)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.toLotId && (
          <p className="text-sm text-destructive">{errors.toLotId.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numberOfAnimals">Number of Animals</Label>
          <Input
            id="numberOfAnimals"
            type="number"
            min="1"
            max={selectedFromLot?.numberOfAnimals || 1}
            {...register('numberOfAnimals', { 
              required: 'Required',
              min: {
                value: 1,
                message: 'At least 1 animal'
              },
              max: {
                value: selectedFromLot?.numberOfAnimals || 1,
                message: 'Cannot exceed available animals'
              }
            })}
          />
          {errors.numberOfAnimals && (
            <p className="text-sm text-destructive">{errors.numberOfAnimals.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="averageWeight">Average Weight (kg)</Label>
          <Input
            id="averageWeight"
            type="number"
            min="1"
            {...register('averageWeight', { 
              required: 'Required',
              min: {
                value: 1,
                message: 'Min weight 1 kg'
              }
            })}
          />
          {errors.averageWeight && (
            <p className="text-sm text-destructive">{errors.averageWeight.message}</p>
          )}
        </div>
      </div>
      
      <div className="pt-4 pb-2">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="scheduledDate">Transfer date</Label>
            <div className="flex items-center gap-2">
              <Label htmlFor="isScheduled" className="text-sm">Schedule for future date</Label>
              <Switch 
                id="isScheduled" 
                checked={isScheduled} 
                onCheckedChange={setIsScheduled} 
              />
            </div>
          </div>
          <div className="relative">
            <Input
              id="scheduledDate"
              type="date"
              {...register('scheduledDate', { required: 'Date is required' })}
            />
            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        {errors.scheduledDate && (
          <p className="text-sm text-destructive">{errors.scheduledDate.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes about this transfer..."
          {...register('notes')}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={
          isSubmitting || 
          !selectedFromLotId || 
          !selectedToLotId ||
          selectedFromLotId === selectedToLotId ||
          numberOfAnimals < 1 ||
          (selectedFromLot && numberOfAnimals > selectedFromLot.numberOfAnimals)
        }
      >
        {isScheduled ? 'Schedule Transfer' : 'Complete Transfer Now'}
      </Button>
      
      {selectedFromLotId === selectedToLotId && selectedToLotId && (
        <p className="text-sm text-destructive text-center">
          Source and destination lots cannot be the same
        </p>
      )}
      
      {selectedFromLot && numberOfAnimals > selectedFromLot.numberOfAnimals && (
        <p className="text-sm text-destructive text-center">
          Cannot transfer more animals than available in source lot
        </p>
      )}
    </form>
  );
}
