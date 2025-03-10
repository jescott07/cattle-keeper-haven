import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TransferCriterion } from './TransferCriteria';
import { Check, ArrowRight } from 'lucide-react';

export interface AnimalRecord {
  id: string;
  weight: number;
  weightAt30: number;
  breed: string;
  observations: string;
  originLotId: string;
  destinationLotId: string;
}

interface AnimalWeighingRecordProps {
  onRecordSave: (record: AnimalRecord) => void;
  originLotId: string;
  sourceLotName: string;
  transferCriteria: TransferCriterion[];
  breeds: string[];
  onAddBreed: (breed: string) => void;
}

export function AnimalWeighingRecord({
  onRecordSave,
  originLotId,
  sourceLotName,
  transferCriteria,
  breeds,
  onAddBreed
}: AnimalWeighingRecordProps) {
  const [weight, setWeight] = useState<number | null>(null);
  const [breed, setBreed] = useState('');
  const [observations, setObservations] = useState('');
  const [newBreed, setNewBreed] = useState('');
  const [showAddBreed, setShowAddBreed] = useState(false);

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

  const handleAddBreed = () => {
    if (newBreed.trim()) {
      onAddBreed(newBreed.trim());
      setBreed(newBreed.trim());
      setNewBreed('');
      setShowAddBreed(false);
    }
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
          {showAddBreed ? (
            <div className="flex gap-2">
              <Input
                value={newBreed}
                onChange={(e) => setNewBreed(e.target.value)}
                placeholder="New breed name"
              />
              <Button 
                type="button" 
                onClick={handleAddBreed}
                disabled={!newBreed.trim()}
              >
                Add
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select breed</option>
                {breeds.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowAddBreed(true)}
              >
                New
              </Button>
            </div>
          )}
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
        disabled={weight === null || !breed}
      >
        <Check className="h-4 w-4" />
        Record Animal
      </Button>
    </div>
  );
}
