
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Lot } from '@/lib/types';

// Schema for sale form validation
const saleFormSchema = z.object({
  saleDate: z.date({
    required_error: "A sale date is required.",
  }),
  numberOfAnimals: z.coerce.number()
    .min(1, "Must sell at least one animal")
    .refine(val => Number.isInteger(val), {
      message: "Number of animals must be a whole number",
    }),
  finalWeight: z.coerce.number()
    .min(0, "Weight cannot be negative"),
  pricePerArroba: z.coerce.number()
    .min(0, "Price per arroba cannot be negative"),
  totalValue: z.coerce.number()
    .min(0, "Total value cannot be negative"),
  buyer: z.string()
    .min(2, "Buyer name must be at least 2 characters")
    .max(100, "Buyer name cannot exceed 100 characters"),
  notes: z.string().optional(),
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

interface SaleManagementProps {
  initialLotId: string;
  onSaleComplete: () => void;
}

export const SaleManagement = ({ initialLotId, onSaleComplete }: SaleManagementProps) => {
  const { toast } = useToast();
  const lot = useStore(state => state.lots.find(l => l.id === initialLotId));
  const updateLot = useStore(state => state.updateLot);
  const addSaleRecord = useStore(state => state.addSaleRecord);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      saleDate: new Date(),
      numberOfAnimals: lot?.numberOfAnimals || 0,
      finalWeight: 0,
      pricePerArroba: 0,
      totalValue: 0,
      buyer: '',
      notes: '',
    },
  });

  const numberOfAnimals = form.watch('numberOfAnimals');
  const finalWeight = form.watch('finalWeight');
  const pricePerArroba = form.watch('pricePerArroba');
  const totalValue = form.watch('totalValue');

  // Calculate total value when weight and price change
  React.useEffect(() => {
    if (isCalculating) return;
    
    setIsCalculating(true);
    if (finalWeight > 0 && pricePerArroba > 0) {
      const arrobas = finalWeight / 30; // convert kg to arrobas
      const calculatedValue = arrobas * pricePerArroba;
      form.setValue('totalValue', Math.round(calculatedValue * 100) / 100);
    }
    setIsCalculating(false);
  }, [finalWeight, pricePerArroba, form, isCalculating]);

  // Recalculate price per arroba when total value changes
  React.useEffect(() => {
    if (isCalculating) return;
    
    setIsCalculating(true);
    if (finalWeight > 0 && totalValue > 0) {
      const arrobas = finalWeight / 30; // convert kg to arrobas
      if (arrobas > 0) {
        const calculatedPricePerArroba = totalValue / arrobas;
        form.setValue('pricePerArroba', Math.round(calculatedPricePerArroba * 100) / 100);
      }
    }
    setIsCalculating(false);
  }, [totalValue, finalWeight, form, isCalculating]);

  const onSubmit = (data: SaleFormValues) => {
    if (!lot) {
      toast({
        title: "Error",
        description: "Lot not found",
        variant: "destructive",
      });
      return;
    }

    // Create sale record
    addSaleRecord({
      lotId: lot.id,
      date: data.saleDate,
      numberOfAnimals: data.numberOfAnimals,
      finalWeight: data.finalWeight,
      pricePerArroba: data.pricePerArroba,
      totalValue: data.totalValue,
      buyer: data.buyer,
      notes: data.notes || '',
    });

    // Update lot data
    const remainingAnimals = Math.max(0, lot.numberOfAnimals - data.numberOfAnimals);
    
    const lotUpdate: Partial<Lot> = {
      numberOfAnimals: remainingAnimals,
    };

    // If all animals are sold, update status to 'sold'
    if (remainingAnimals === 0) {
      lotUpdate.status = 'sold';
    }

    updateLot(lot.id, lotUpdate);

    toast({
      title: "Sale Registered",
      description: `Successfully registered sale of ${data.numberOfAnimals} animals`,
    });

    onSaleComplete();
  };

  if (!lot) {
    return <div>Lot not found</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="saleDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Sale Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numberOfAnimals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Animals</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    max={lot.numberOfAnimals}
                  />
                </FormControl>
                <FormDescription>
                  Max: {lot.numberOfAnimals} animals
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="finalWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Final Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormDescription>
                  Total weight of animals being sold
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pricePerArroba"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per Arroba</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormDescription>
                  Price per arroba (30kg)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Value</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormDescription>
                  {finalWeight > 0 ? `${(finalWeight / 30).toFixed(2)} arrobas` : 'Total sale value'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="buyer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buyer</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Name of the buyer
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormDescription>
                Any additional information about this sale
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4 text-sm">
          <div className="font-medium">Summary:</div>
          <div className="mt-1">
            <span className="text-muted-foreground">Animals:</span> {numberOfAnimals}
          </div>
          <div>
            <span className="text-muted-foreground">Weight:</span> {finalWeight} kg ({(finalWeight / 30).toFixed(2)} arrobas)
          </div>
          <div>
            <span className="text-muted-foreground">Price:</span> {pricePerArroba} per arroba
          </div>
          <div className="mt-1 text-lg font-semibold">
            Total: {totalValue.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </div>
        </div>

        <Button type="submit" className="w-full">Register Sale</Button>
      </form>
    </Form>
  );
};
