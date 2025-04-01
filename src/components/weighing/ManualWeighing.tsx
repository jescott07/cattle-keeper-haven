
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Check, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BreedType } from '@/lib/types';
import { WeighingSessionSummary } from './WeighingSessionSummary';

interface ManualWeighingProps {
  onBack: () => void;
}

export function ManualWeighing({ onBack }: ManualWeighingProps) {
  const { toast } = useToast();
  const lots = useStore(state => state.lots);
  const addWeighingRecord = useStore(state => state.addWeighingRecord);
  
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [animalWeights, setAnimalWeights] = useState<number[]>([]);
  const [animalBreeds, setAnimalBreeds] = useState<BreedType[]>([]);
  const [animalNotes, setAnimalNotes] = useState<string[]>([]);
  const [currentAnimalIndex, setCurrentAnimalIndex] = useState(0);
  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [currentBreed, setCurrentBreed] = useState<BreedType>('nelore');
  const [currentNotes, setCurrentNotes] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [partialWeighing, setPartialWeighing] = useState(false);
  const [weighedAnimalsCount, setWeighedAnimalsCount] = useState(0);
  
  const selectedLot = selectedLotId ? lots.find(lot => lot.id === selectedLotId) : null;
  const activeLots = lots.filter(lot => lot.status === 'active');
  
  useEffect(() => {
    if (selectedLot) {
      const totalAnimals = selectedLot.numberOfAnimals;
      setAnimalWeights(Array(totalAnimals).fill(0));
      setAnimalBreeds(Array(totalAnimals).fill(selectedLot.breed || 'nelore'));
      setAnimalNotes(Array(totalAnimals).fill(''));
      setCurrentWeight('');
      setCurrentBreed(selectedLot.breed || 'nelore');
      setCurrentNotes('');
      setCurrentAnimalIndex(0);
      setWeighedAnimalsCount(0);
      setPartialWeighing(false);
    }
  }, [selectedLotId, selectedLot]);

  useEffect(() => {
    if (selectedLot && currentAnimalIndex >= selectedLot.numberOfAnimals) {
      finishWeighingSession();
    }
  }, [currentAnimalIndex, selectedLot]);

  const recordCurrentAnimal = () => {
    const weight = parseFloat(currentWeight);
    if (isNaN(weight) || weight <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }

    const newWeights = [...animalWeights];
    const newBreeds = [...animalBreeds];
    const newNotes = [...animalNotes];
    
    newWeights[currentAnimalIndex] = weight;
    newBreeds[currentAnimalIndex] = currentBreed;
    newNotes[currentAnimalIndex] = currentNotes;
    
    setAnimalWeights(newWeights);
    setAnimalBreeds(newBreeds);
    setAnimalNotes(newNotes);
    setWeighedAnimalsCount(weighedAnimalsCount + 1);
    
    setCurrentWeight('');
    setCurrentNotes('');
    
    setCurrentAnimalIndex(currentAnimalIndex + 1);
  };

  const skipAnimal = () => {
    setCurrentAnimalIndex(currentAnimalIndex + 1);
    setPartialWeighing(true);
  };

  const finishWeighingSession = () => {
    if (!selectedLot) return;
    
    const validWeights = animalWeights.filter(w => w > 0);
    const totalWeighed = validWeights.length;
    
    if (totalWeighed === 0) {
      toast({
        title: "No weights recorded",
        description: "Please record at least one animal weight",
        variant: "destructive",
      });
      return;
    }
    
    const totalWeight = validWeights.reduce((sum, weight) => sum + weight, 0);
    const averageWeight = totalWeight / totalWeighed;
    
    const totalAnimals = selectedLot.numberOfAnimals;
    const nonWeighedAnimals = totalAnimals - totalWeighed;
    
    const estimatedTotalWeight = totalWeight + (nonWeighedAnimals * averageWeight);
    
    addWeighingRecord({
      date: new Date(),
      lotId: selectedLotId,
      numberOfAnimals: totalAnimals,
      totalWeight: estimatedTotalWeight,
      averageWeight: estimatedTotalWeight / totalAnimals,
      notes: `Manual weighing of ${totalWeighed} animals (${nonWeighedAnimals} estimated at average weight)`
    });
    
    let message = `Successfully recorded weights for ${totalWeighed} animals`;
    if (nonWeighedAnimals > 0) {
      message += `. ${nonWeighedAnimals} animals were estimated at the average weight (${averageWeight.toFixed(1)} kg)`;
    }
    
    toast({
      title: "Weighing complete",
      description: message,
    });
    
    setShowSummary(true);
  };

  const resetWeighing = () => {
    setSelectedLotId('');
    setAnimalWeights([]);
    setAnimalBreeds([]);
    setAnimalNotes([]);
    setCurrentAnimalIndex(0);
    setCurrentWeight('');
    setCurrentBreed('nelore');
    setCurrentNotes('');
    setShowSummary(false);
    setPartialWeighing(false);
    setWeighedAnimalsCount(0);
  };

  if (showSummary) {
    return (
      <WeighingSessionSummary 
        weights={animalWeights}
        date={new Date()}
        onNewSession={resetWeighing}
        totalAnimals={selectedLot?.numberOfAnimals || 0}
        isPartialWeighing={partialWeighing}
        animalBreeds={animalBreeds}
        animalNotes={animalNotes}
      />
    );
  }

  if (!selectedLotId) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </div>
          <CardTitle className="mt-4">Select Lot to Weigh</CardTitle>
          <CardDescription>Choose a lot of animals to start weighing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lotId">Lot</Label>
            <Select onValueChange={setSelectedLotId}>
              <SelectTrigger id="lotId">
                <SelectValue placeholder="Select a lot" />
              </SelectTrigger>
              <SelectContent>
                {activeLots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.name} ({lot.numberOfAnimals} animals)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => {}} // This button is disabled until a lot is selected
            disabled={!selectedLotId}
            className="w-full"
          >
            Start Weighing Session
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedLotId('')}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Lot Selection
          </Button>
          <span className="text-sm text-muted-foreground">
            Animal {currentAnimalIndex + 1} of {selectedLot?.numberOfAnimals}
          </span>
        </div>
        <CardTitle className="mt-4">Record Weight</CardTitle>
        <CardDescription>
          Recording weights for lot: {selectedLot?.name}
          {weighedAnimalsCount > 0 && (
            <span className="block mt-1 text-sm">
              {weighedAnimalsCount} animals weighed so far
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            min="0"
            value={currentWeight}
            onChange={(e) => setCurrentWeight(e.target.value)}
            placeholder="Enter weight"
            autoFocus
          />
          {currentWeight && !isNaN(parseFloat(currentWeight)) && parseFloat(currentWeight) > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              @ {(parseFloat(currentWeight) / 30).toFixed(2)} arrobas
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="breed">Breed</Label>
          <Select 
            value={currentBreed} 
            onValueChange={(value) => setCurrentBreed(value as BreedType)}
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
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={currentNotes}
            onChange={(e) => setCurrentNotes(e.target.value)}
            placeholder="Any additional notes for this animal"
            rows={2}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => skipAnimal()}
          >
            Skip Animal
          </Button>
          <Button 
            className="flex-1"
            onClick={recordCurrentAnimal}
            disabled={!currentWeight || isNaN(parseFloat(currentWeight)) || parseFloat(currentWeight) <= 0}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Next Animal
          </Button>
        </div>
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={finishWeighingSession}
        >
          End Session
        </Button>
      </CardFooter>
    </Card>
  );
}
