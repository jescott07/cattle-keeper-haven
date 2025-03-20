
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Form } from '@/components/ui/form';
import { TaskBasicDetails } from './form-sections/TaskBasicDetails';
import { TaskDateAndCost } from './form-sections/TaskDateAndCost';
import { InventorySelector } from './form-sections/InventorySelector';
import { TaskDescription } from './form-sections/TaskDescription';

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  type: z.enum(['pest-control', 'fertilization', 'irrigation', 'weeding', 'other']),
  date: z.date(),
  status: z.enum(['scheduled', 'completed', 'canceled']),
  description: z.string().optional(),
  cost: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional(),
  inventoryItemId: z.string().optional(),
  inventoryItemQuantity: z.coerce.number().nonnegative().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface AddPlantationTaskFormProps {
  plantationId: string;
  onSuccess: () => void;
}

export function AddPlantationTaskForm({ plantationId, onSuccess }: AddPlantationTaskFormProps) {
  const { toast } = useToast();
  const addPlantationTask = useStore(state => state.addPlantationTask);
  const inventory = useStore(state => state.inventory);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      type: 'other',
      date: new Date(),
      status: 'scheduled',
      description: '',
      cost: undefined,
      notes: '',
      inventoryItemId: undefined,
      inventoryItemQuantity: 1,
    },
  });

  // Get the selected inventory item
  const selectedInventoryItemId = form.watch('inventoryItemId');
  const selectedInventoryItem = React.useMemo(() => 
    inventory.find(item => item.id === selectedInventoryItemId), 
    [inventory, selectedInventoryItemId]
  );

  function onSubmit(values: FormValues) {
    // Validate that inventory quantity is available
    if (values.inventoryItemId && values.inventoryItemQuantity) {
      const inventoryItem = inventory.find(item => item.id === values.inventoryItemId);
      if (inventoryItem && values.inventoryItemQuantity > inventoryItem.quantity) {
        toast({
          title: "Not enough inventory",
          description: `Only ${inventoryItem.quantity} ${inventoryItem.unit} available.`,
          variant: "destructive"
        });
        return;
      }
    }

    // Create the new task
    const newTask = {
      plantationId,
      title: values.title,
      type: values.type,
      date: values.date,
      status: values.status,
      description: values.description,
      cost: values.cost,
      notes: values.notes,
      inventoryItemId: values.inventoryItemId,
      inventoryItemQuantity: values.inventoryItemQuantity,
    };
    
    addPlantationTask(newTask);
    
    toast({
      title: "Task added",
      description: values.status === 'completed' 
        ? "The task has been recorded as completed." 
        : "The task has been scheduled for this plantation.",
    });
    
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TaskBasicDetails form={form} />
        <TaskDateAndCost form={form} />
        <InventorySelector 
          form={form} 
          inventory={inventory} 
          selectedInventoryItem={selectedInventoryItem} 
        />
        <TaskDescription form={form} />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit">Save Task</Button>
        </div>
      </form>
    </Form>
  );
}
