
import { Control, Controller, FieldErrors, UseFormRegister } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InventoryType } from '@/lib/types';
import { STANDARD_UNITS } from '@/lib/constants';

interface InventoryBasicFieldsProps {
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors;
  setValue: any;
  isTemplate?: boolean;
}

export function InventoryBasicFields({ 
  register, 
  errors, 
  setValue, 
  control,
  isTemplate = false 
}: InventoryBasicFieldsProps) {
  const nameId = isTemplate ? "name-template" : "name";
  const typeId = isTemplate ? "type-template" : "type";
  const quantityId = isTemplate ? "quantity-template" : "quantity";
  const unitId = isTemplate ? "unit-template" : "unit";
  const costId = isTemplate ? "costPerUnit-template" : "costPerUnit";
  const purchaseDateId = isTemplate ? "purchaseDate-template" : "purchaseDate";
  const expiryDateId = isTemplate ? "expiryDate-template" : "expiryDate";
  const notesId = isTemplate ? "notes-template" : "notes";

  return (
    <>
      {!isTemplate && (
        <div className="space-y-2">
          <Label htmlFor={nameId}>Item Name</Label>
          <Input
            id={nameId}
            placeholder="Enter item name"
            {...register('name', { required: 'Item name is required' })}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
        </div>
      )}
      
      {!isTemplate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={typeId}>Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={(value) => setValue('type', value)} 
                  value={field.value}
                >
                  <SelectTrigger id={typeId}>
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
            <Label htmlFor={costId}>Cost Per Unit</Label>
            <Input
              id={costId}
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
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={quantityId}>Quantity</Label>
          <Input
            id={quantityId}
            type="number"
            min="0"
            step="0.01"
            {...register('quantity', { 
              required: 'Quantity is required',
              min: { value: 0, message: 'Quantity cannot be negative' }
            })}
          />
          {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message as string}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={unitId}>Unit</Label>
          <Controller
            name="unit"
            control={control}
            defaultValue="kg"
            render={({ field }) => (
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <SelectTrigger id={unitId}>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {STANDARD_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.unit && <p className="text-sm text-destructive">{errors.unit.message as string}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={purchaseDateId}>Purchase Date (Optional)</Label>
          <Input
            id={purchaseDateId}
            type="date"
            {...register('purchaseDate')}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={expiryDateId}>Expiry Date (Optional)</Label>
          <Input
            id={expiryDateId}
            type="date"
            {...register('expiryDate')}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={notesId}>Notes (Optional)</Label>
        <Textarea
          id={notesId}
          placeholder="Enter any additional notes"
          className="min-h-[80px]"
          {...register('notes')}
        />
      </div>
    </>
  );
}
