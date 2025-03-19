
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';

// Schema for form validation
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  treatmentType: z.string().min(1, { message: 'Treatment type is required.' }),
  date: z.date(),
  lotIds: z.array(z.string()).min(1, { message: 'At least one lot must be selected.' }),
  inventoryItemId: z.string().optional(),
  notes: z.string().optional(),
});

export type SanitaryTreatmentFormValues = z.infer<typeof formSchema>;

interface SanitaryTreatmentFormProps {
  onTreatmentAdded: () => void;
}

export function SanitaryTreatmentForm({ onTreatmentAdded }: SanitaryTreatmentFormProps) {
  const [selectedLots, setSelectedLots] = useState<string[]>([]);
  
  const addSanitaryTreatment = useStore((state) => state.addSanitaryTreatment);
  const lots = useStore((state) => state.lots);
  const inventoryItems = useStore((state) => 
    state.inventoryItems.filter(item => item.type === 'medication')
  );
  
  const form = useForm<SanitaryTreatmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      treatmentType: '',
      date: new Date(),
      lotIds: [],
      notes: '',
    },
  });

  const handleLotToggle = (lotId: string) => {
    setSelectedLots(prev => {
      const isSelected = prev.includes(lotId);
      const newSelection = isSelected
        ? prev.filter(id => id !== lotId)
        : [...prev, lotId];
      
      form.setValue('lotIds', newSelection);
      return newSelection;
    });
  };

  function onSubmit(values: SanitaryTreatmentFormValues) {
    try {
      addSanitaryTreatment({
        name: values.name,
        treatmentType: values.treatmentType,
        date: values.date,
        lotIds: values.lotIds,
        inventoryItemId: values.inventoryItemId,
        notes: values.notes,
      });
      
      onTreatmentAdded();
    } catch (error) {
      console.error("Error adding sanitary treatment:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Treatment Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter treatment name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Treatment Type */}
        <FormField
          control={form.control}
          name="treatmentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select treatment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="vaccination">Vaccination</SelectItem>
                  <SelectItem value="deworming">Deworming</SelectItem>
                  <SelectItem value="antibiotics">Antibiotics</SelectItem>
                  <SelectItem value="vitamins">Vitamins</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Treatment Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Treatment Date</FormLabel>
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
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Lot Selection */}
        <FormField
          control={form.control}
          name="lotIds"
          render={() => (
            <FormItem>
              <FormLabel>Select Lots</FormLabel>
              <div className="border rounded-md p-3 space-y-2">
                {lots.length > 0 ? (
                  lots.map((lot) => (
                    <div key={lot.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lot-${lot.id}`}
                        checked={selectedLots.includes(lot.id)}
                        onCheckedChange={() => handleLotToggle(lot.id)}
                      />
                      <label
                        htmlFor={`lot-${lot.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {lot.name} ({lot.numberOfAnimals} animals)
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No lots available</p>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Medication Selection (Optional) */}
        <FormField
          control={form.control}
          name="inventoryItemId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medication (Optional)</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select medication" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {inventoryItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.quantity} {item.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter any additional notes"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">Record Treatment</Button>
      </form>
    </Form>
  );
}
