
import { useState, useEffect } from 'react';
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
import { TreePine, ChevronRight, Calendar } from 'lucide-react';

interface PastureTransferProps {
  initialLotId?: string;
  onTransferComplete?: () => void;
}

export function PastureTransfer({ initialLotId, onTransferComplete }: PastureTransferProps) {
  const { toast } = useToast();
  const lots = useStore((state) => state.lots);
  const pastures = useStore((state) => state.pastures);
  const schedulePastureTransfer = useStore((state) => state.schedulePastureTransfer);
  
  const [isScheduled, setIsScheduled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const activeLots = lots.filter(lot => lot.status === 'active');
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      lotId: initialLotId || '',
      fromPastureId: '',
      toPastureId: '',
      scheduledDate: format(new Date(), 'yyyy-MM-dd'),
      notes: ''
    }
  });
  
  const selectedLotId = watch('lotId');
  const selectedLot = selectedLotId ? lots.find(lot => lot.id === selectedLotId) : null;
  
  // When lot is selected, set the current pasture as source
  useEffect(() => {
    if (selectedLot && selectedLot.currentPastureId) {
      setValue('fromPastureId', selectedLot.currentPastureId);
    }
  }, [selectedLotId, selectedLot, setValue]);
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // Schedule the transfer
      await schedulePastureTransfer({
        lotId: data.lotId,
        fromPastureId: data.fromPastureId,
        toPastureId: data.toPastureId,
        scheduledDate: new Date(data.scheduledDate),
        completed: !isScheduled, // If not scheduled, mark as completed immediately
        notes: data.notes
      });
      
      toast({
        title: isScheduled ? 'Transfer Scheduled' : 'Transfer Completed',
        description: isScheduled 
          ? `Transfer scheduled for ${format(new Date(data.scheduledDate), 'MMM d, yyyy')}` 
          : 'Transfer has been completed successfully',
      });
      
      // Reset form and call completion callback if provided
      reset();
      if (onTransferComplete) {
        onTransferComplete();
      }
    } catch (error) {
      console.error('Error scheduling transfer:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule transfer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="lotId">Lot</Label>
        <Select 
          value={selectedLotId} 
          onValueChange={(value) => setValue('lotId', value)}
          disabled={initialLotId !== undefined}
        >
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
      
      <div className="flex items-center gap-2 pt-4 pb-2">
        <TreePine className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">Pasture Information</span>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fromPastureId">Current Pasture</Label>
        <Select 
          value={watch('fromPastureId')} 
          onValueChange={(value) => setValue('fromPastureId', value)}
        >
          <SelectTrigger id="fromPastureId">
            <SelectValue placeholder="Select source pasture" />
          </SelectTrigger>
          <SelectContent>
            {pastures.map((pasture) => (
              <SelectItem key={pasture.id} value={pasture.id}>
                {pasture.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.fromPastureId && (
          <p className="text-sm text-destructive">{errors.fromPastureId.message}</p>
        )}
      </div>
      
      <div className="flex justify-center py-2">
        <ChevronRight className="h-6 w-6 text-muted-foreground" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="toPastureId">Destination Pasture</Label>
        <Select 
          value={watch('toPastureId')} 
          onValueChange={(value) => setValue('toPastureId', value)}
        >
          <SelectTrigger id="toPastureId">
            <SelectValue placeholder="Select destination pasture" />
          </SelectTrigger>
          <SelectContent>
            {pastures.map((pasture) => (
              <SelectItem key={pasture.id} value={pasture.id}>
                {pasture.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.toPastureId && (
          <p className="text-sm text-destructive">{errors.toPastureId.message}</p>
        )}
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
          !selectedLotId || 
          !watch('fromPastureId') || 
          !watch('toPastureId') ||
          watch('fromPastureId') === watch('toPastureId')
        }
      >
        {isScheduled ? 'Schedule Transfer' : 'Complete Transfer Now'}
      </Button>
      
      {watch('fromPastureId') === watch('toPastureId') && watch('toPastureId') && (
        <p className="text-sm text-destructive text-center">
          Source and destination pastures cannot be the same
        </p>
      )}
    </form>
  );
}
