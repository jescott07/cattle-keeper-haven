
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useStore } from '@/lib/store';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryItem, InventoryType, InventoryItemProperty } from '@/lib/types';
import { InventoryBasicFields } from './inventory/InventoryBasicFields';
import { InventoryProperties } from './inventory/InventoryProperties';
import { InventoryTemplateSelector } from './inventory/InventoryTemplateSelector';

interface AddInventoryFormProps {
  item?: InventoryItem;
  onSuccess: () => void;
}

type FormData = {
  name: string;
  type: InventoryType;
  quantity: number;
  unit: string;
  purchaseDate?: string;
  expiryDate?: string;
  costPerUnit: number;
  notes?: string;
  templateId?: string;
  properties: {
    id: string;
    name: string;
    value: string;
    unit: string;
    propertyType: 'min' | 'max' | 'exact';
  }[];
};

export function AddInventoryForm({ item, onSuccess }: AddInventoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('manual');
  const [selectedTemplate, setSelectedTemplate] = useState<InventoryItem | null>(null);
  
  const addInventoryItem = useStore(state => state.addInventoryItem);
  const updateInventoryItem = useStore(state => state.updateInventoryItem);
  const addInventoryTemplate = useStore(state => state.addInventoryTemplate);
  const inventory = useStore(state => state.inventory);
  const templates = useStore(state => state.inventoryTemplates);
  
  const { register, handleSubmit, setValue, control, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: item?.name || '',
      type: item?.type || 'feed',
      quantity: item?.quantity || 0,
      unit: item?.unit || 'kg',
      purchaseDate: item?.purchaseDate ? format(new Date(item.purchaseDate), 'yyyy-MM-dd') : undefined,
      expiryDate: item?.expiryDate ? format(new Date(item.expiryDate), 'yyyy-MM-dd') : undefined,
      costPerUnit: item?.costPerUnit || 0,
      notes: item?.notes || '',
      templateId: item?.templateId,
      properties: item?.properties || []
    }
  });
  
  // Set values for type with useEffect
  useEffect(() => {
    if (item) {
      setValue('type', item.type);
    }
  }, [item, setValue]);
  
  const watchedName = watch('name');
  const watchedType = watch('type');
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const properties: InventoryItemProperty[] = data.properties.map(prop => ({
        id: prop.id || uuidv4(),
        name: prop.name,
        value: prop.value,
        unit: prop.unit,
        propertyType: prop.propertyType
      }));
      
      const inventoryData = {
        name: data.name,
        type: data.type,
        quantity: Number(data.quantity),
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
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSaveAsTemplate = () => {
    if (!watchedName) return;
    
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
  };
  
  const handleSelectTemplate = (template: InventoryItem) => {
    setSelectedTemplate(template);
    setValue('name', template.name);
    setValue('type', template.type);
    setValue('templateId', template.id);
    
    // Reset the properties array and add the template properties
    setValue('properties', []);
    template.properties.forEach(prop => {
      // Add each property to the properties array
      setValue('properties', [...watch('properties'), {
        id: uuidv4(),
        name: prop.name,
        value: prop.value,
        unit: prop.unit,
        propertyType: prop.propertyType
      }]);
    });
    
    setActiveTab('template');
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="template">From Template</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-4 py-4">
          <InventoryBasicFields 
            register={register} 
            control={control} 
            errors={errors} 
            setValue={setValue} 
          />
          
          <Separator />
          
          <InventoryProperties 
            control={control} 
            register={register} 
            setValue={setValue} 
            onSaveTemplate={handleSaveAsTemplate} 
          />
        </TabsContent>
        
        <TabsContent value="template" className="space-y-4 py-4">
          <InventoryTemplateSelector
            selectedTemplate={selectedTemplate}
            templates={inventory}
            onSelectTemplate={handleSelectTemplate}
          />
          
          {selectedTemplate && (
            <>
              <InventoryBasicFields 
                register={register} 
                control={control} 
                errors={errors} 
                setValue={setValue} 
                isTemplate
              />
              
              <div className="space-y-2">
                <InventoryProperties 
                  control={control}
                  register={register}
                  setValue={setValue}
                  readOnly
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
      
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={isSubmitting}>
          {item ? 'Update Item' : 'Add Item'}
        </Button>
      </DialogFooter>
    </form>
  );
}
