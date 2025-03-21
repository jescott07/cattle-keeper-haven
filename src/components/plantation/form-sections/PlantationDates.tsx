
import { Control } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { PlantationFormValues } from '../AddPlantationForm';

interface PlantationDatesProps {
  control: Control<PlantationFormValues>;
}

export function PlantationDates({ control }: PlantationDatesProps) {
  return (
    <FormField
      control={control}
      name="plantingDate"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Planting Date</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className="w-full pl-3 text-left font-normal"
                  type="button"
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span className="text-muted-foreground">Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[9999]" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => date < new Date("1900-01-01")}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
