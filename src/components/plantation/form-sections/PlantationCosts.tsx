
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { PlantationFormValues } from '../AddPlantationForm';

interface PlantationCostsProps {
  control: Control<PlantationFormValues>;
}

export function PlantationCosts({ control }: PlantationCostsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="seedCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seed Cost</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="Optional" 
                  {...field} 
                  value={field.value === undefined ? '' : field.value} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="seedsPerHectare"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seeds per Hectare</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  placeholder="Optional" 
                  {...field} 
                  value={field.value === undefined ? '' : field.value} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="expectedYieldPerHectare"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Expected Yield per Hectare</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0" 
                step="0.1" 
                placeholder="Optional" 
                {...field} 
                value={field.value === undefined ? '' : field.value} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
