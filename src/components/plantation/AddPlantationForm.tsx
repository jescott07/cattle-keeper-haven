
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '@/lib/store';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlantationType, PlantationStatus } from '@/lib/types';

const plantationTypes: PlantationType[] = ['corn', 'soybean', 'grass', 'wheat', 'silage', 'other'];
const plantationStatuses: PlantationStatus[] = ['planned', 'planted', 'growing', 'harvested', 'failed'];

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  type: z.enum(['corn', 'soybean', 'grass', 'wheat', 'silage', 'other']),
  areaInHectares: z.coerce.number().positive({ message: 'Area must be a positive number.' }),
  status: z.enum(['planned', 'planted', 'growing', 'harvested', 'failed']),
  plantingDate: z.date().optional(),
  estimatedHarvestDate: z.date().optional(),
  seedCost: z.coerce.number().nonnegative().optional(),
  seedsPerHectare: z.coerce.number().nonnegative().optional(),
  expectedYieldPerHectare: z.coerce.number().nonnegative().optional(),
  pastureId: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddPlantationFormProps {
  onPlantationAdded: () => void;
}

export function AddPlantationForm({ onPlantationAdded }: AddPlantationFormProps) {
  const { toast } = useToast();
  const addPlantation = useStore((state) => state.addPlantation);
  const pastures = useStore((state) => state.pastures);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'corn',
      areaInHectares: 1,
      status: 'planned',
      seedCost: undefined,
      seedsPerHectare: undefined,
      expectedYieldPerHectare: undefined,
      notes: '',
    },
  });

  function onSubmit(values: FormValues) {
    try {
      addPlantation({
        name: values.name,
        type: values.type,
        areaInHectares: values.areaInHectares,
        status: values.status,
        plantingDate: values.plantingDate,
        estimatedHarvestDate: values.estimatedHarvestDate,
        seedCost: values.seedCost,
        seedsPerHectare: values.seedsPerHectare,
        expectedYieldPerHectare: values.expectedYieldPerHectare,
        pastureId: values.pastureId || undefined,
        notes: values.notes || '',
      });

      toast({
        title: "Plantation created",
        description: `${values.name} has been added to your plantations.`,
      });

      onPlantationAdded();
    } catch (error) {
      console.error("Error adding plantation:", error);
      toast({
        title: "Error creating plantation",
        description: "There was a problem adding your plantation. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Summer Corn 2023" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {plantationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {plantationStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="areaInHectares"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area (hectares)</FormLabel>
              <FormControl>
                <Input type="number" min="0.1" step="0.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="plantingDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Planting Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
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
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimatedHarvestDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Estimated Harvest Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
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
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="seedCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seed Cost</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" placeholder="Optional" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seedsPerHectare"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seeds per Hectare</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="Optional" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="expectedYieldPerHectare"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Yield per Hectare</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.1" placeholder="Optional" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {pastures.length > 0 && (
          <FormField
            control={form.control}
            name="pastureId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pasture Location (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pasture (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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
        )}

        <FormField
          control={form.control}
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

        <Button type="submit" className="w-full">Add Plantation</Button>
      </form>
    </Form>
  );
}
