import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { useStore } from '@/lib/store';
import { Lot, AnimalSource, LotStatus, BreedType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface AddLotFormProps {
  lot?: Lot;
  onSuccess: () => void;
}

interface BreedCount {
  breed: BreedType;
  count: number;
}

type FormData = {
  name: string;
  totalAnimals: number;
  source: AnimalSource;
  status: LotStatus;
  purchaseDate: string;
  currentPastureId: string;
  notes?: string;
};

export function AddLotForm({ lot, onSuccess }: AddLotFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [breedCounts, setBreedCounts] = useState<BreedCount[]>([]);
  const [currentBreed, setCurrentBreed] = useState<BreedType>('nelore');
  const [currentCount, setCurrentCount] = useState<number>(0);
  
  const addLot = useStore(state => state.addLot);
  const updateLot = useStore(state => state.updateLot);
  const pastures = useStore(state => state.pastures);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: lot?.name || '',
      totalAnimals: lot?.numberOfAnimals || 0,
      source: lot?.source || 'auction',
      status: lot?.status || 'active',
      purchaseDate: lot?.purchaseDate ? format(new Date(lot.purchaseDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      currentPastureId: lot?.currentPastureId || '',
      notes: lot?.notes || ''
    }
  });

  const calculateTotalAnimals = () => {
    return breedCounts.reduce((sum, item) => sum + item.count, 0);
  };
  
  useEffect(() => {
    if (lot) {
      setValue('source', lot.source);
      setValue('status', lot.status);
      setValue('currentPastureId', lot.currentPastureId);
      
      if (lot.notes) {
        const breedRegex = /(\d+)\s+(nelore|anelorada|cruzamento-industrial)/gi;
        const breeds: BreedCount[] = [];
        let match;
        
        while ((match = breedRegex.exec(lot.notes)) !== null) {
          breeds.push({
            count: parseInt(match[1]),
            breed: match[2].toLowerCase() as BreedType
          });
        }
        
        if (breeds.length > 0) {
          setBreedCounts(breeds);
        } else if (lot.breed) {
          setBreedCounts([{ breed: lot.breed, count: lot.numberOfAnimals }]);
        }
      } else if (lot.breed) {
        setBreedCounts([{ breed: lot.breed, count: lot.numberOfAnimals }]);
      }
    }
  }, [lot, setValue]);
  
  const handleAddBreed = () => {
    if (currentCount <= 0) return;
    
    const existingIndex = breedCounts.findIndex(b => b.breed === currentBreed);
    
    if (existingIndex >= 0) {
      const updatedBreeds = [...breedCounts];
      updatedBreeds[existingIndex] = {
        ...updatedBreeds[existingIndex],
        count: updatedBreeds[existingIndex].count + currentCount
      };
      setBreedCounts(updatedBreeds);
    } else {
      setBreedCounts([...breedCounts, { breed: currentBreed, count: currentCount }]);
    }
    
    setValue('totalAnimals', calculateTotalAnimals() + currentCount);
    
    setCurrentCount(0);
  };
  
  const handleRemoveBreed = (index: number) => {
    const removedCount = breedCounts[index].count;
    setBreedCounts(breedCounts.filter((_, i) => i !== index));
    setValue('totalAnimals', calculateTotalAnimals() - removedCount);
  };
  
  const formatBreedName = (breed: BreedType): string => {
    switch (breed) {
      case 'nelore':
        return 'Nelore';
      case 'anelorada':
        return 'Anelorada';
      case 'cruzamento-industrial':
        return 'Cruzamento Industrial';
      default:
        return breed;
    }
  };
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const breedNotes = breedCounts.length > 0 
        ? breedCounts.map(b => `${b.count} ${formatBreedName(b.breed)}`).join(', ')
        : '';
        
      const combinedNotes = breedNotes 
        ? (data.notes ? `${breedNotes}. ${data.notes}` : breedNotes)
        : data.notes;
      
      let mainBreed: BreedType | undefined = undefined;
      if (breedCounts.length > 0) {
        mainBreed = breedCounts.reduce(
          (max, item) => item.count > max.count ? item : max, 
          breedCounts[0]
        ).breed;
      }
      
      if (lot) {
        updateLot(lot.id, {
          name: data.name,
          numberOfAnimals: data.totalAnimals,
          source: data.source,
          status: data.status,
          purchaseDate: new Date(data.purchaseDate),
          currentPastureId: data.currentPastureId,
          breed: mainBreed,
          notes: combinedNotes
        });
      } else {
        addLot({
          name: data.name,
          numberOfAnimals: data.totalAnimals,
          source: data.source,
          status: data.status,
          purchaseDate: new Date(data.purchaseDate),
          currentPastureId: data.currentPastureId,
          breed: mainBreed,
          notes: combinedNotes
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving lot:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Lot Name</Label>
          <Input
            id="name"
            placeholder="Enter lot name"
            {...register('name', { required: 'Lot name is required' })}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label>Breed Composition</Label>
          <div className="flex items-center gap-2">
            <Select 
              value={currentBreed} 
              onValueChange={(value) => setCurrentBreed(value as BreedType)}
            >
              <SelectTrigger id="breed" className="flex-1">
                <SelectValue placeholder="Select breed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nelore">Nelore</SelectItem>
                <SelectItem value="anelorada">Anelorada</SelectItem>
                <SelectItem value="cruzamento-industrial">Cruzamento Industrial</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="number"
              min="1"
              placeholder="Count"
              value={currentCount || ''}
              onChange={(e) => setCurrentCount(parseInt(e.target.value) || 0)}
              className="w-24"
            />
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddBreed}
              disabled={currentCount <= 0}
              className="whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Breed
            </Button>
          </div>
          
          {breedCounts.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {breedCounts.map((item, index) => (
                <Badge key={index} variant="secondary" className="gap-1 pr-1">
                  {item.count} {formatBreedName(item.breed)}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => handleRemoveBreed(index)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalAnimals">Total Animals</Label>
            <Input
              id="totalAnimals"
              type="number"
              min="1"
              readOnly={breedCounts.length > 0}
              className={breedCounts.length > 0 ? "bg-muted" : ""}
              {...register('totalAnimals', { 
                required: 'Number of animals is required',
                min: { value: 1, message: 'Must have at least 1 animal' }
              })}
            />
            {errors.totalAnimals && <p className="text-sm text-destructive">{errors.totalAnimals.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select 
              onValueChange={(value) => setValue('source', value as AnimalSource)} 
              defaultValue={lot?.source || 'auction'}
            >
              <SelectTrigger id="source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auction">Auction</SelectItem>
                <SelectItem value="another-farmer">Another Farmer</SelectItem>
                <SelectItem value="born-on-farm">Born on Farm</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              onValueChange={(value) => setValue('status', value as LotStatus)} 
              defaultValue={lot?.status || 'active'}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="treatment">Treatment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase/Entry Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              {...register('purchaseDate', { required: 'Date is required' })}
            />
            {errors.purchaseDate && <p className="text-sm text-destructive">{errors.purchaseDate.message}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currentPastureId">Current Pasture</Label>
          <Select 
            onValueChange={(value) => setValue('currentPastureId', value)} 
            defaultValue={lot?.currentPastureId || ''}
          >
            <SelectTrigger id="currentPastureId">
              <SelectValue placeholder="Select pasture" />
            </SelectTrigger>
            <SelectContent>
              {pastures.map(pasture => (
                <SelectItem key={pasture.id} value={pasture.id}>
                  {pasture.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.currentPastureId && <p className="text-sm text-destructive">{errors.currentPastureId.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Enter any additional notes"
            className="min-h-[100px]"
            {...register('notes')}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {lot ? 'Update Lot' : 'Add Lot'}
        </Button>
      </DialogFooter>
    </form>
  );
}
