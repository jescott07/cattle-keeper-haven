
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { TaskType, TaskStatus } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

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

type FormValues = z.infer<typeof formSchema>;

interface AddPlantationTaskFormProps {
  plantationId: string;
  onSuccess: () => void;
}

export function AddPlantationTaskForm({ plantationId, onSuccess }: AddPlantationTaskFormProps) {
  const { toast } = useToast();
  const addPlantationTask = useStore(state => state.addPlantationTask);
  const inventory = useStore(state => state.inventory);
  const [isInventoryOpen, setIsInventoryOpen] = React.useState(false);
  const [inventorySearch, setInventorySearch] = React.useState('');
  
  // Filter inventory items based on search
  const filteredInventory = React.useMemo(() => {
    if (!inventorySearch.trim()) return inventory.filter(item => item.quantity > 0);
    
    return inventory.filter(item => 
      item.name.toLowerCase().includes(inventorySearch.toLowerCase()) &&
      item.quantity > 0 // Only show items with stock
    );
  }, [inventory, inventorySearch]);
  
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

    // Ensure all required fields have values
    const newTask = {
      plantationId,
      title: values.title,
      type: values.type,  // Ensure required fields are explicitly assigned
      date: values.date,  // Ensure required fields are explicitly assigned
      status: values.status, // Ensure required fields are explicitly assigned
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

  const handleSelectInventoryItem = (itemId: string) => {
    form.setValue("inventoryItemId", itemId);
    setIsInventoryOpen(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Spray insecticide..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pest-control">Pest Control</SelectItem>
                    <SelectItem value="fertilization">Fertilization</SelectItem>
                    <SelectItem value="irrigation">Irrigation</SelectItem>
                    <SelectItem value="weeding">Weeding</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Task Date</FormLabel>
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
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost (optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-6 border p-4 rounded-md bg-muted/10">
          <h3 className="text-md font-medium">Inventory Usage</h3>
          
          <FormField
            control={form.control}
            name="inventoryItemId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Inventory Item (optional)</FormLabel>
                <Popover open={isInventoryOpen} onOpenChange={setIsInventoryOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={`w-full justify-between ${!field.value ? "text-muted-foreground" : ""}`}
                        onClick={() => setIsInventoryOpen(true)}
                      >
                        {field.value ? (
                          selectedInventoryItem?.name
                        ) : (
                          "Select an item"
                        )}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search inventory..."
                        className="h-9"
                        value={inventorySearch}
                        onValueChange={setInventorySearch}
                      />
                      <CommandList>
                        <CommandEmpty>No items found.</CommandEmpty>
                        <CommandGroup>
                          {filteredInventory.map((item) => (
                            <CommandItem
                              key={item.id}
                              value={item.id}
                              onSelect={() => handleSelectInventoryItem(item.id)}
                              className="cursor-pointer"
                            >
                              <span className="flex-1">{item.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {item.quantity} {item.unit}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {selectedInventoryItemId && (
            <FormField
              control={form.control}
              name="inventoryItemQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity to Use</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="number" 
                        min="1"
                        max={selectedInventoryItem?.quantity.toString()}
                        step="1"
                        {...field} 
                      />
                      <span className="text-sm text-muted-foreground">
                        / {selectedInventoryItem?.quantity} {selectedInventoryItem?.unit}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the task details..."
                  className="resize-none" 
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional notes..."
                  className="resize-none" 
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
