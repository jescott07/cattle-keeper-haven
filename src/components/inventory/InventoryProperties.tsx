
import { useFieldArray, Control, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface InventoryPropertiesProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  readOnly?: boolean;
  onSaveTemplate?: () => void;
}

export function InventoryProperties({ 
  control, 
  register, 
  setValue, 
  readOnly = false,
  onSaveTemplate 
}: InventoryPropertiesProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "properties"
  });

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Properties</Label>
        {!readOnly && (
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
        )}
      </div>
      
      {fields.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No properties added yet. {!readOnly && "Click \"Add Property\" to start."}
        </div>
      )}
      
      {readOnly ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {fields.map((field) => (
            <div key={field.id} className="flex justify-between p-2 bg-accent/30 rounded-md">
              <div>
                <span className="font-medium">{field.name}</span>: {field.value} {field.unit}
              </div>
              <Badge variant="outline" className="text-xs">
                {field.propertyType === 'min' ? 'Mín' : 
                 field.propertyType === 'max' ? 'Máx' : 'Exato'}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        fields.map((field, index) => (
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
        ))
      )}
      
      {fields.length > 0 && !readOnly && onSaveTemplate && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSaveTemplate}
          className="mt-2"
        >
          Save as Template
        </Button>
      )}
    </div>
  );
}
