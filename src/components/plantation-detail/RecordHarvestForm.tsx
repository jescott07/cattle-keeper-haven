
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Package, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { InventoryProperties } from '@/components/inventory/InventoryProperties';
import { v4 as uuidv4 } from 'uuid';
import { InventoryFormValues, InventoryItemProperty } from '@/lib/types';

// Here's the key modification: ensuring that all properties in the schema are required
const inventoryItemPropertySchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
  unit: z.string(),
  propertyType: z.enum(['min', 'max', 'exact'])
});

const formSchema = z.object({
  harvestDate: z.date(),
  yield: z.coerce.number().positive({ message: "Yield must be positive" }),
  yieldPerHectare: z.coerce.number().nonnegative().optional(),
  quality: z.coerce.number().min(1).max(10).optional(),
  expenses: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional(),
  addToInventory: z.boolean().default(true),
  inventoryName: z.string().optional(),
  inventoryUnit: z.string().optional(),
  properties: z.array(inventoryItemPropertySchema).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface RecordHarvestFormProps {
  plantationId: string;
  plantationArea: number;
  onSuccess: () => void;
}

export function RecordHarvestForm({ plantationId, plantationArea, onSuccess }: RecordHarvestFormProps) {
  const { toast } = useToast();
  const addHarvestRecord = useStore(state => state.addHarvestRecord);
  const updatePlantation = useStore(state => state.updatePlantation);
  const addInventoryItem = useStore(state => state.addInventoryItem);
  const inventory = useStore(state => state.inventory);
  const plantation = useStore(state => state.plantations.find(p => p.id === plantationId));
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      harvestDate: new Date(),
      yield: 0,
      yieldPerHectare: undefined,
      quality: 7,
      expenses: undefined,
      notes: '',
      addToInventory: true,
      inventoryName: plantation?.name ? `Harvest - ${plantation.name}` : 'Harvest',
      inventoryUnit: 'kg',
      properties: [],
    },
  });

  const totalYield = form.watch('yield');
  const addToInventory = form.watch('addToInventory');
  
  useEffect(() => {
    if (totalYield && plantationArea > 0) {
      const yieldPerHectare = Math.round((totalYield / plantationArea) * 100) / 100;
      form.setValue('yieldPerHectare', yieldPerHectare);
    }
  }, [totalYield, plantationArea, form]);

  function onSubmit(values: FormValues) {
    const harvestId = uuidv4();
    
    const newHarvestRecord = {
      id: harvestId,
      plantationId,
      harvestDate: values.harvestDate,
      yield: values.yield,
      yieldPerHectare: values.yieldPerHectare,
      quality: values.quality,
      expenses: values.expenses,
      notes: values.notes,
      addedToInventory: values.addToInventory,
    };
    
    if (values.addToInventory) {
      const inventoryName = values.inventoryName || `Harvest - ${plantation?.name || 'Unknown'}`;
      
      const existingItem = inventory.find(item => 
        item.name === inventoryName && 
        item.purchaseDate && 
        format(new Date(item.purchaseDate), 'PP') === format(values.harvestDate, 'PP')
      );
      
      if (existingItem) {
        toast({
          title: "Duplicate harvest detected",
          description: "A harvest with the same name and date already exists in inventory. It was not added again.",
          variant: "destructive"
        });
      } else {
        // Ensure all property objects have required fields
        const validProperties: InventoryItemProperty[] = values.properties.map(prop => ({
          id: prop.id || uuidv4(),
          name: prop.name || '',
          value: prop.value || '',
          unit: prop.unit || 'g/kg',
          propertyType: prop.propertyType || 'min'
        }));
        
        addInventoryItem({
          name: inventoryName,
          type: 'other',
          quantity: values.yield,
          unit: values.inventoryUnit || 'kg',
          costPerUnit: values.expenses ? (values.expenses / values.yield) : 0,
          purchaseDate: values.harvestDate,
          notes: `Harvest from ${plantation?.name} on ${format(values.harvestDate, 'PP')}`,
          properties: validProperties,
        });
      }
    }
    
    addHarvestRecord(newHarvestRecord);
    
    updatePlantation(plantationId, {
      status: 'harvested',
      actualHarvestDate: values.harvestDate,
      actualYield: (plantation?.actualYield || 0) + values.yield,
      actualYieldPerHectare: values.yieldPerHectare,
    });
    
    toast({
      title: "Harvest recorded",
      description: values.addToInventory 
        ? "The harvest data has been saved and added to inventory."
        : "The harvest data has been saved.",
    });
    
    onSuccess();
  }

  // Create an adapter to handle the different form types between InventoryProperties and our form
  const createAdapter = () => {
    const registerAdapter = (name: string) => {
      if (name.startsWith('properties.')) {
        return form.register(name as any);
      }
      
      const validFields = ['harvestDate', 'yield', 'yieldPerHectare', 'quality', 
                           'expenses', 'notes', 'addToInventory', 'inventoryName', 
                           'inventoryUnit', 'properties'];
      
      if (validFields.includes(name)) {
        return form.register(name as any);
      }
      
      return form.register(name as any);
    };
    
    const setValueAdapter = (name: string, value: any) => {
      if (name.startsWith('properties.')) {
        form.setValue(name as any, value);
      } else {
        const validFields = ['harvestDate', 'yield', 'yieldPerHectare', 'quality', 
                            'expenses', 'notes', 'addToInventory', 'inventoryName', 
                            'inventoryUnit', 'properties'];
        
        if (validFields.includes(name)) {
          form.setValue(name as any, value);
        }
      }
    };
    
    return {
      register: registerAdapter,
      setValue: setValueAdapter
    };
  };

  const { register, setValue } = createAdapter();

  const handlePropertyAdd = () => {
    const currentProperties = form.getValues('properties') || [];
    
    form.setValue('properties', [
      ...currentProperties,
      {
        id: uuidv4(), // Ensure ID is always set
        name: '',
        value: '',
        unit: 'g/kg',
        propertyType: 'min' as const
      }
    ]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="harvestDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Harvest Date</FormLabel>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="yield"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Yield (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0" 
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      const value = parseFloat(e.target.value);
                      if (value && plantationArea > 0) {
                        const yieldPerHectare = Math.round((value / plantationArea) * 100) / 100;
                        form.setValue('yieldPerHectare', yieldPerHectare);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="yieldPerHectare"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yield per Hectare (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0" 
                    {...field}
                    value={field.value || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="quality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quality (1-10)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    max="10"
                    placeholder="7" 
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
            name="expenses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harvest Expenses ($)</FormLabel>
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
        
        <div className="border p-4 rounded-md bg-muted/10">
          <FormField
            control={form.control}
            name="addToInventory"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="flex items-center">
                    <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                    Add harvest to inventory
                  </FormLabel>
                  <FormDescription>
                    The harvest will be added as an inventory item
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {addToInventory && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="inventoryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inventory Item Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="inventoryUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <FormLabel>Properties</FormLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePropertyAdd}
                    className="gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Property
                  </Button>
                </div>
                
                <InventoryProperties 
                  control={form.control as any} 
                  register={register as any}
                  setValue={setValue as any}
                />
              </div>
            </div>
          )}
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional notes about the harvest..."
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
          <Button type="submit">Record Harvest</Button>
        </div>
      </form>
    </Form>
  );
}
