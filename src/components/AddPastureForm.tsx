
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { useStore } from '@/lib/store';
import { Pasture, WaterSourceType, FenceCondition, GrassType } from '@/lib/types';

interface AddPastureFormProps {
  pasture?: Pasture;
  onSuccess: () => void;
}

type FormData = {
  name: string;
  waterSource: WaterSourceType;
  sizeInHectares: number;
  fenceCondition: FenceCondition;
  grassType: GrassType;
  notes?: string;
};

export function AddPastureForm({ pasture, onSuccess }: AddPastureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const addPasture = useStore(state => state.addPasture);
  const updatePasture = useStore(state => state.updatePasture);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: pasture?.name || '',
      waterSource: pasture?.waterSource || 'well',
      sizeInHectares: pasture?.sizeInHectares || 0,
      fenceCondition: pasture?.fenceCondition || 'good',
      grassType: pasture?.grassType || 'bermuda',
      notes: pasture?.notes || ''
    }
  });
  
  // Set values for selects with useEffect
  useEffect(() => {
    if (pasture) {
      setValue('waterSource', pasture.waterSource);
      setValue('fenceCondition', pasture.fenceCondition);
      setValue('grassType', pasture.grassType);
    }
  }, [pasture, setValue]);
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      if (pasture) {
        // Update existing pasture
        updatePasture(pasture.id, {
          name: data.name,
          waterSource: data.waterSource,
          sizeInHectares: Number(data.sizeInHectares),
          fenceCondition: data.fenceCondition,
          grassType: data.grassType,
          notes: data.notes
        });
      } else {
        // Add new pasture
        addPasture({
          name: data.name,
          waterSource: data.waterSource,
          sizeInHectares: Number(data.sizeInHectares),
          fenceCondition: data.fenceCondition,
          grassType: data.grassType,
          notes: data.notes,
          evaluations: [] // Add this to fix the type error
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving pasture:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Pasture Name</Label>
          <Input
            id="name"
            placeholder="Enter pasture name"
            {...register('name', { required: 'Pasture name is required' })}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sizeInHectares">Size (hectares)</Label>
            <Input
              id="sizeInHectares"
              type="number"
              min="0.1"
              step="0.1"
              {...register('sizeInHectares', { 
                required: 'Size is required',
                min: { value: 0.1, message: 'Size must be greater than 0' }
              })}
            />
            {errors.sizeInHectares && <p className="text-sm text-destructive">{errors.sizeInHectares.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="waterSource">Water Source</Label>
            <Select 
              onValueChange={(value) => setValue('waterSource', value as WaterSourceType)} 
              defaultValue={pasture?.waterSource || 'well'}
            >
              <SelectTrigger id="waterSource">
                <SelectValue placeholder="Select water source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="river">River</SelectItem>
                <SelectItem value="well">Well</SelectItem>
                <SelectItem value="lake">Lake</SelectItem>
                <SelectItem value="tank">Tank</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fenceCondition">Fence Condition</Label>
            <Select 
              onValueChange={(value) => setValue('fenceCondition', value as FenceCondition)} 
              defaultValue={pasture?.fenceCondition || 'good'}
            >
              <SelectTrigger id="fenceCondition">
                <SelectValue placeholder="Select fence condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="grassType">Grass Type</Label>
            <Select 
              onValueChange={(value) => setValue('grassType', value as GrassType)} 
              defaultValue={pasture?.grassType || 'bermuda'}
            >
              <SelectTrigger id="grassType">
                <SelectValue placeholder="Select grass type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bermuda">Bermuda</SelectItem>
                <SelectItem value="fescue">Fescue</SelectItem>
                <SelectItem value="bluegrass">Bluegrass</SelectItem>
                <SelectItem value="ryegrass">Ryegrass</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Enter any additional information about this pasture"
            className="min-h-[80px]"
            {...register('notes')}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {pasture ? 'Update Pasture' : 'Add Pasture'}
        </Button>
      </DialogFooter>
    </form>
  );
}
