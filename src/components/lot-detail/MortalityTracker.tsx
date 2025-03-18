
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { BreedType, MortalityCause } from '@/lib/types';

interface MortalityTrackerProps {
  lotId: string;
  onMortalityAdded?: () => void;
}

export function MortalityTracker({ lotId, onMortalityAdded }: MortalityTrackerProps) {
  const { toast } = useToast();
  const lot = useStore(state => state.lots.find(l => l.id === lotId));
  const addMortalityRecord = useStore(state => state.addMortalityRecord);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      cause: 'unknown' as MortalityCause,
      breed: lot?.breed || 'nelore',
      notes: ''
    }
  });
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      if (!lot) throw new Error("Lot not found");
      if (lot.numberOfAnimals <= 0) throw new Error("No animals in lot");
      
      // Create new mortality record
      addMortalityRecord({
        lotId,
        date: new Date(data.date),
        cause: data.cause as MortalityCause,
        breed: data.breed as BreedType,
        notes: data.notes
      });
      
      toast({
        title: 'Mortality Recorded',
        description: 'Animal mortality has been recorded and lot count updated',
      });
      
      reset();
      
      if (onMortalityAdded) {
        onMortalityAdded();
      }
    } catch (error) {
      console.error('Error recording mortality:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to record mortality',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date of Death</Label>
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
      
      <div className="space-y-2">
        <Label htmlFor="cause">Cause of Death</Label>
        <Select 
          defaultValue="unknown"
          onValueChange={(value) => register('cause').onChange({ target: { value } })}
        >
          <SelectTrigger id="cause">
            <SelectValue placeholder="Select cause" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="disease">Disease</SelectItem>
            <SelectItem value="injury">Injury</SelectItem>
            <SelectItem value="predator">Predator</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.cause && (
          <p className="text-sm text-destructive">{errors.cause.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="breed">Breed</Label>
        <Select 
          defaultValue={lot?.breed || 'nelore'}
          onValueChange={(value) => register('breed').onChange({ target: { value } })}
        >
          <SelectTrigger id="breed">
            <SelectValue placeholder="Select breed" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nelore">Nelore</SelectItem>
            <SelectItem value="anelorada">Anelorada</SelectItem>
            <SelectItem value="cruzamento-industrial">Cruzamento Industrial</SelectItem>
          </SelectContent>
        </Select>
        {errors.breed && (
          <p className="text-sm text-destructive">{errors.breed.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional information about the cause of death..."
          {...register('notes')}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting || !lot || lot.numberOfAnimals <= 0}
      >
        Record Mortality
      </Button>
      
      {lot && lot.numberOfAnimals <= 0 && (
        <p className="text-sm text-destructive text-center">
          No animals available in this lot
        </p>
      )}
    </form>
  );
}
