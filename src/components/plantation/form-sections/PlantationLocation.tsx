
import { Control } from 'react-hook-form';
import { useStore } from '@/lib/store';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PlantationFormValues } from '../AddPlantationForm';

interface PlantationLocationProps {
  control: Control<PlantationFormValues>;
}

export function PlantationLocation({ control }: PlantationLocationProps) {
  const pastures = useStore((state) => state.pastures);
  
  // Only render if pastures exist
  if (pastures.length === 0) {
    return null;
  }
  
  return (
    <FormField
      control={control}
      name="pastureId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Pasture Location (Optional)</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || undefined}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a pasture (optional)" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {/* Removed the empty string SelectItem and use null instead */}
              <SelectItem value="none">None</SelectItem>
              {pastures.map((pasture) => (
                <SelectItem key={pasture.id} value={pasture.id}>
                  {pasture.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            If this plantation is on a specific pasture, select it here.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
