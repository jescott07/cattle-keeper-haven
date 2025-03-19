
import { Control } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { PlantationFormValues } from '../AddPlantationForm';

interface PlantationNotesProps {
  control: Control<PlantationFormValues>;
}

export function PlantationNotes({ control }: PlantationNotesProps) {
  return (
    <FormField
      control={control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea placeholder="Additional information about this plantation..." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
