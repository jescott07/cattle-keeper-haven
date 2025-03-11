import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TransferCriterion } from './TransferCriteria';
import { Check, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BreedType } from '@/lib/types';

export interface AnimalRecord {
  id: string;
  weight: number;
  weightAt30: number;
  breed: BreedType;
  observations: string;
  originLotId: string;
  destinationLotId: string;
}

interface AnimalWeighingRecordProps {
  onRecordSave: (record: AnimalRecord) => void;
  originLotId: string;
  sourceLotName: string;
  transferCriteria: TransferCriterion[];
  defaultBreed?: BreedType;
}

export function AnimalWeighingRecord({
  onRecordSave,
  originLotId,
  sourceLotName,
  transferCriteria,
  defaultBreed = 'nelore'
}: AnimalWeighingRecordProps) {
  const [weight, setWeight] = useState<number | null>(null);
  const [breed, setBreed] = useState<BreedType>(defaultBreed);
  const [observations, setObservations] = useState('');

  const calculateDestinationLot = (weight: number): string => {
    if (!weight || transferCriteria.length === 0) return originLotId;

    for (const criterion of transferCriteria) {
      if (
        (criterion.condition === 'less-than-or-equal' && weight <= criterion.weightValue) ||
        (criterion.condition === 'greater-than' && weight > criterion.weightValue)
      ) {
        return criterion.destinationLotId;
      }
    }
    
    return originLotId;
  };

  const handleWeightChange = (value: string) => {
    const numValue = parseFloat(value);
    setWeight(isNaN(numValue) ? null : numValue);
  };

  const handleBreedChange = (value: string) => {
    setBreed(value as BreedType);
  };

  const handleSaveRecord = () => {
    if (weight === null) return;
    
    const destinationLotId = calculateDestinationLot(weight);
    
    onRecordSave({
      id: `animal-${Date.now()}`,
      weight,
      weightAt30: parseFloat((weight / 30).toFixed(2)),
      breed,
      observations,
      originLotId,
      destinationLotId
    });

    // Reset form for next animal
    setWeight(null);
    setObservations('');
    // Keep the breed the same for consecutive animals
  };

  const destinationLotId = weight !== null ? calculateDestinationLot(weight) : originLotId;
  const isTransferred = destinationLotId !== originLotId;

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            min="0"
            value={weight === null ? '' : weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            placeholder="Enter weight"
            autoFocus
          />
          {weight !== null && (
            <p className="text-sm text-muted-foreground mt-1">
              @ {(weight / 30).toFixed(2)}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="breed">Breed</Label>
          <Select 
            value={breed} 
            onValueChange={handleBreedChange}
          >
            <SelectTrigger id="breed">
              <SelectValue placeholder="Select breed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nelore">Nelore</SelectItem>
              <SelectItem value="anelorada">Anelorada</SelectItem>
              <SelectItem value="cruzamento-industrial">Cruzamento Industrial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="observations">Observations</Label>
        <Textarea
          id="observations"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Any additional notes"
        />
      </div>
      
      {weight !== null && (
        <div className={`p-3 rounded-md flex items-center justify-between ${isTransferred ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
          <div className="flex items-center gap-2">
            <div className="font-medium">
              Lot {sourceLotName}
            </div>
            {isTransferred && (
              <>
                <ArrowRight className="h-4 w-4" />
                <div className="font-medium">
                  Transfer to new lot
                </div>
              </>
            )}
          </div>
          <div>
            {weight} kg ({(weight / 30).toFixed(2)} @)
          </div>
        </div>
      )}
      
      <Button 
        type="button" 
        className="w-full gap-2"
        onClick={handleSaveRecord}
        disabled={weight === null}
      >
        <Check className="h-4 w-4" />
        Record Animal
      </Button>
    </div>
  );
}
