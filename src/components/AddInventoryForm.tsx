
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useStore } from '@/lib/store';
import { Separator } from '@/components/ui/separator';
import { FileUp, PackagePlus } from 'lucide-react';
import { InventoryItem, InventoryType, InventoryItemProperty, InventoryItemTemplate, InventoryFormValues } from '@/lib/types';
import { InventoryBasicFields } from './inventory/InventoryBasicFields';
import { InventoryProperties } from './inventory/InventoryProperties';
import { InventoryTemplateSelector } from './inventory/InventoryTemplateSelector';
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface AddInventoryFormProps {
  item?: InventoryItem;
  onSuccess: () => void;
}

export function AddInventoryForm({ item, onSuccess }: AddInventoryFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<InventoryItemTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState(false);
  
  const addInventoryItem = useStore(state => state.addInventoryItem);
  const updateInventoryItem = useStore(state => state.updateInventoryItem);
  const addInventoryTemplate = useStore(state => state.addInventoryTemplate);
  const updateInventoryTemplate = useStore(state => state.updateInventoryTemplate);
  const inventoryTemplates = useStore(state => state.inventoryTemplates);
  
  const { register, handleSubmit, setValue, control, watch, reset, formState: { errors } } = useForm<InventoryFormValues>({
    defaultValues: {
      name: item?.name || '',
      type: item?.type || 'feed',
      quantity: item?.quantity || 1, // Default quantity is 1 item
      unit: item?.unit || 'kg',
      purchaseDate: item?.purchaseDate ? format(new Date(item.purchaseDate), 'yyyy-MM-dd') : undefined,
      expiryDate: item?.expiryDate ? format(new Date(item.expiryDate), 'yyyy-MM-dd') : undefined,
      costPerUnit: item?.costPerUnit || 0,
      notes: item?.notes || '',
      templateId: item?.templateId,
      properties: item?.properties || [],
      itemAmount: 1, // New field for the number of items
    }
  });
  
  useEffect(() => {
    if (item) {
      setValue('type', item.type);
    }
  }, [item, setValue]);
  
  const watchedName = watch('name');
  const watchedType = watch('type');
  const watchedItemAmount = watch('itemAmount');
  
  const onSubmit = async (data: InventoryFormValues) => {
    setIsSubmitting(true);
    
    try {
      // If we're editing a template, update it
      if (editingTemplate && selectedTemplate) {
        const properties: InventoryItemProperty[] = data.properties.map(prop => ({
          id: prop.id || uuidv4(),
          name: prop.name,
          value: prop.value,
          unit: prop.unit,
          propertyType: prop.propertyType
        }));
        
        updateInventoryTemplate(selectedTemplate.id, {
          name: data.name,
          type: data.type,
          properties
        });
        
        toast({
          title: "Success",
          description: "Template updated successfully",
        });
        
        setEditingTemplate(false);
        setSelectedTemplate(null);
        setIsAddingTemplate(false);
        onSuccess();
        return;
      }
      
      const properties: InventoryItemProperty[] = data.properties.map(prop => ({
        id: prop.id || uuidv4(),
        name: prop.name,
        value: prop.value,
        unit: prop.unit,
        propertyType: prop.propertyType
      }));
      
      // Calculate actual inventory quantity (number of items × item quantity)
      // This assumes the template or main item has a quantity property showing the "per item" amount
      const totalQuantity = Number(data.itemAmount) * Number(data.quantity);
      
      const inventoryData = {
        name: data.name,
        type: data.type,
        quantity: totalQuantity,
        unit: data.unit,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        costPerUnit: Number(data.costPerUnit),
        notes: data.notes,
        templateId: data.templateId,
        properties
      };
      
      if (item) {
        // Update existing item
        updateInventoryItem(item.id, inventoryData);
      } else {
        // Add new item
        addInventoryItem(inventoryData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to save inventory item",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSaveAsTemplate = () => {
    if (!watchedName) {
      toast({
        title: "Error",
        description: "Please provide a name for the template",
        variant: "destructive"
      });
      return;
    }
    
    const properties = watch('properties');
    const propertyValues = properties.map(field => ({
      id: field.id,
      name: field.name,
      value: field.value,
      unit: field.unit,
      propertyType: field.propertyType
    }));
    
    addInventoryTemplate({
      name: watchedName,
      type: watchedType,
      properties: propertyValues
    });
    
    toast({
      title: "Success",
      description: "Template saved successfully",
    });
    
    setIsAddingTemplate(false);
  };
  
  const handleSelectTemplate = (template: InventoryItemTemplate) => {
    setSelectedTemplate(template);
    setValue('name', template.name);
    setValue('type', template.type);
    setValue('templateId', template.id);
    
    // Reset the properties array and add the template properties
    const templateProperties = template.properties?.map(prop => ({
      id: uuidv4(),
      name: prop.name,
      value: prop.value,
      unit: prop.unit,
      propertyType: prop.propertyType
    })) || [];
    
    setValue('properties', templateProperties);
  };
  
  const handleEditTemplate = (template: InventoryItemTemplate) => {
    setEditingTemplate(true);
    setSelectedTemplate(template);
    setIsAddingTemplate(true);
    reset({
      name: template.name,
      type: template.type,
      quantity: 0,
      unit: 'kg',
      costPerUnit: 0,
      itemAmount: 1,
      properties: template.properties.map(prop => ({
        id: prop.id,
        name: prop.name,
        value: prop.value,
        unit: prop.unit,
        propertyType: prop.propertyType
      }))
    });
  };
  
  // If we're in template mode, show only template creation UI
  if (isAddingTemplate) {
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name-template">Template Name</Label>
            <Input
              id="name-template"
              placeholder="Enter template name"
              {...register('name', { required: 'Template name is required' })}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type-template">Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={(value) => setValue('type', value as InventoryType)} 
                  value={field.value}
                >
                  <SelectTrigger id="type-template">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feed">Feed</SelectItem>
                    <SelectItem value="mineral">Mineral</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity-template">Unit Amount</Label>
            <Input
              id="quantity-template"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 25 for a 25kg bag"
              {...register('quantity', { 
                required: 'Quantity is required',
                min: { value: 0, message: 'Quantity cannot be negative' }
              })}
            />
            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message as string}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit-template">Unit</Label>
            <Input
              id="unit-template"
              placeholder="e.g., kg, liters, pieces"
              {...register('unit', { required: 'Unit is required' })}
            />
            {errors.unit && <p className="text-sm text-destructive">{errors.unit.message as string}</p>}
          </div>
          
          <Separator />
          
          <InventoryProperties 
            control={control} 
            register={register} 
            setValue={setValue} 
          />
        </div>
        
        <DialogFooter className="mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setIsAddingTemplate(false);
              setEditingTemplate(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {editingTemplate ? 'Update Template' : 'Save Template'}
          </Button>
        </DialogFooter>
      </form>
    );
  }
  
  // Normal item addition mode
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4 py-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Item Details</h3>
          <Button 
            type="button" 
            variant="outline" 
            className="gap-2" 
            onClick={() => setIsAddingTemplate(true)}
          >
            <FileUp className="h-4 w-4" />
            Add Template
          </Button>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="space-y-2">
            <InventoryTemplateSelector
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
              onEditTemplate={handleEditTemplate}
            />
          </div>
          
          {selectedTemplate ? (
            <>
              <div className="p-4 border rounded-md bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{selectedTemplate.name}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedTemplate(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Type: {selectedTemplate.type}</p>
                
                {selectedTemplate.properties.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <p className="text-sm font-medium">Properties:</p>
                    {selectedTemplate.properties.map(prop => (
                      <p key={prop.id} className="text-xs text-muted-foreground">
                        {prop.name}: {prop.value} {prop.unit}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemAmount">Number of Items</Label>
                  <Input
                    id="itemAmount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="How many of this item?"
                    {...register('itemAmount', { 
                      required: 'Number of items is required',
                      min: { value: 1, message: 'Must add at least one item' },
                      valueAsNumber: true
                    })}
                  />
                  {errors.itemAmount && <p className="text-sm text-destructive">{errors.itemAmount.message as string}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="costPerUnit">Cost Per Unit</Label>
                  <Input
                    id="costPerUnit"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register('costPerUnit', { 
                      required: 'Cost is required',
                      min: { value: 0, message: 'Cost cannot be negative' }
                    })}
                  />
                  {errors.costPerUnit && <p className="text-sm text-destructive">{errors.costPerUnit.message as string}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    {...register('purchaseDate', {
                      required: 'Purchase date is required'
                    })}
                  />
                  {errors.purchaseDate && <p className="text-sm text-destructive">{errors.purchaseDate.message as string}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    {...register('expiryDate')}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional notes"
                  className="min-h-[80px]"
                  {...register('notes')}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-md">
              <PackagePlus className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="font-medium">Select a template to add inventory</p>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Templates help you quickly add items with predefined properties
              </p>
              <Button 
                variant="outline" 
                className="mt-4 gap-2" 
                onClick={() => setIsAddingTemplate(true)}
              >
                <FileUp className="h-4 w-4" />
                Create New Template
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={isSubmitting || !selectedTemplate}>
          {item ? 'Update Item' : 'Add Item'}
        </Button>
      </DialogFooter>
    </form>
  );
}
