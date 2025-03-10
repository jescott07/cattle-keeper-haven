
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { useStore } from '@/lib/store';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Search, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InventoryItem, InventoryType, InventoryItemProperty } from '@/lib/types';

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
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<InventoryItem | null>(null);
  
  const addInventoryItem = useStore(state => state.addInventoryItem);
  const updateInventoryItem = useStore(state => state.updateInventoryItem);
  const addInventoryTemplate = useStore(state => state.addInventoryTemplate);
  const inventory = useStore(state => state.inventory);
  const templates = useStore(state => state.inventoryTemplates);
  
  const { register, handleSubmit, setValue, control, watch, formState: { errors } } = useForm<FormData>({
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
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "properties"
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
    
    const propertyValues = fields.map(field => ({
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
    
    // Clear existing properties
    while (fields.length > 0) {
      remove(0);
    }
    
    // Add template properties
    template.properties.forEach(prop => {
      append({
        id: uuidv4(),
        name: prop.name,
        value: prop.value,
        unit: prop.unit,
        propertyType: prop.propertyType
      });
    });
    
    setShowTemplateDialog(false);
  };
  
  const handlePropertyAdd = () => {
    append({
      id: uuidv4(),
      name: '',
      value: '',
      unit: 'g/kg',
      propertyType: 'min'
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="template">From Template</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-4 py-4">
          {/* Manual form fields */}
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              placeholder="Enter item name"
              {...register('name', { required: 'Item name is required' })}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                onValueChange={(value) => setValue('type', value as InventoryType)} 
                defaultValue={item?.type || 'feed'}
              >
                <SelectTrigger id="type">
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
              {errors.costPerUnit && <p className="text-sm text-destructive">{errors.costPerUnit.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Quantity cannot be negative' }
                })}
              />
              {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                placeholder="e.g., kg, liters, pieces"
                {...register('unit', { required: 'Unit is required' })}
              />
              {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date (Optional)</Label>
              <Input
                id="purchaseDate"
                type="date"
                {...register('purchaseDate')}
              />
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
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Properties</Label>
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
            
            {fields.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No properties added yet. Click "Add Property" to start.
              </div>
            )}
            
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4">
                  <Input
                    placeholder="Property name"
                    {...register(`properties.${index}.name` as const, { required: true })}
                  />
                </div>
                
                <div className="col-span-3">
                  <Input
                    placeholder="Value"
                    {...register(`properties.${index}.value` as const, { required: true })}
                  />
                </div>
                
                <div className="col-span-2">
                  <Input
                    placeholder="Unit"
                    {...register(`properties.${index}.unit` as const, { required: true })}
                  />
                </div>
                
                <div className="col-span-2">
                  <Select 
                    defaultValue={field.propertyType}
                    onValueChange={(value) => setValue(`properties.${index}.propertyType` as const, value as 'min' | 'max' | 'exact')} 
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="min">Mín</SelectItem>
                      <SelectItem value="max">Máx</SelectItem>
                      <SelectItem value="exact">Exato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-1">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => remove(index)}
                    className="h-9 w-9"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {fields.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveAsTemplate}
                className="mt-2"
              >
                Save as Template
              </Button>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="template" className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Item Template</Label>
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between items-center">
                  <span>{selectedTemplate ? selectedTemplate.name : 'Select Template'}</span>
                  <Search className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Item Template</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[400px] pr-4">
                  {templates.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                      <h3 className="text-lg font-medium">No templates yet</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create a template by filling out the manual form and clicking "Save as Template"
                      </p>
                    </div>
                  )}
                  <div className="grid gap-2 py-2">
                    {inventory.map(template => (
                      <Card 
                        key={template.id} 
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{template.name}</h3>
                            <Badge>{template.type}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {template.properties.length} properties
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
          
          {selectedTemplate && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity-template">Quantity</Label>
                  <Input
                    id="quantity-template"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('quantity', { 
                      required: 'Quantity is required',
                      min: { value: 0, message: 'Quantity cannot be negative' }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="costPerUnit-template">Cost Per Unit</Label>
                  <Input
                    id="costPerUnit-template"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register('costPerUnit', { 
                      required: 'Cost is required',
                      min: { value: 0, message: 'Cost cannot be negative' }
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate-template">Purchase Date (Optional)</Label>
                  <Input
                    id="purchaseDate-template"
                    type="date"
                    {...register('purchaseDate')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiryDate-template">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate-template"
                    type="date"
                    {...register('expiryDate')}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes-template">Notes (Optional)</Label>
                <Textarea
                  id="notes-template"
                  placeholder="Enter any additional notes"
                  className="min-h-[80px]"
                  {...register('notes')}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Template Properties</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex justify-between p-2 bg-accent/30 rounded-md">
                      <div>
                        <span className="font-medium">{field.name}</span>: {field.value} {field.unit}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {field.propertyType === 'min' ? 'Mín' : 
                         field.propertyType === 'max' ? 'Máx' : ''}
                      </Badge>
                    </div>
                  ))}
                </div>
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
