
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { PlantationType, PlantationStatus } from '@/lib/types';
import { BasicPlantationDetails } from './form-sections/BasicPlantationDetails';
import { PlantationDates } from './form-sections/PlantationDates';
import { PlantationCosts } from './form-sections/PlantationCosts';
import { PlantationLocation } from './form-sections/PlantationLocation';
import { PlantationNotes } from './form-sections/PlantationNotes';

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

export type PlantationFormValues = z.infer<typeof formSchema>;

interface AddPlantationFormProps {
  onPlantationAdded: () => void;
}

export function AddPlantationForm({ onPlantationAdded }: AddPlantationFormProps) {
  const { toast } = useToast();
  const addPlantation = useStore((state) => state.addPlantation);
  
  const form = useForm<PlantationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'corn',
      areaInHectares: 1,
      status: 'planned',
      seedCost: undefined,
      seedsPerHectare: undefined,
      expectedYieldPerHectare: undefined,
      pastureId: undefined,
      notes: '',
    },
  });

  function onSubmit(values: PlantationFormValues) {
    try {
      // If pastureId is 'none', convert it to undefined
      const pastureId = values.pastureId === 'none' ? undefined : values.pastureId;
      
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
        pastureId: pastureId,
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
        <BasicPlantationDetails control={form.control} />
        <PlantationDates control={form.control} />
        <PlantationCosts control={form.control} />
        <PlantationLocation control={form.control} />
        <PlantationNotes control={form.control} />
        
        <Button type="submit" className="w-full">Add Plantation</Button>
      </form>
    </Form>
  );
}
