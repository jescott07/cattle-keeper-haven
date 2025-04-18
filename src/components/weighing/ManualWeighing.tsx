import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Check, ArrowRight, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { BreedType } from '@/lib/types';
import { WeighingSessionSummary } from './WeighingSessionSummary';
import { v4 as uuidv4 } from 'uuid';

interface ManualWeighingProps {
  onBack: () => void;
}

export function ManualWeighing({ onBack }: ManualWeighingProps) {
  const { toast } = useToast();
  const lots = useStore(state => state.lots);
  const addLot = useStore(state => state.addLot);
  const addWeighingRecord = useStore(state => state.addWeighingRecord);
  
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [newLotName, setNewLotName] = useState<string>('');
  const [isCreatingNewLot, setIsCreatingNewLot] = useState<boolean>(false);
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
  const [skippedAnimals, setSkippedAnimals] = useState<number[]>([]);
  const [isNewLot, setIsNewLot] = useState(false);
  
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
      setSkippedAnimals([]);
      setIsNewLot(totalAnimals === 0);
    }
  }, [selectedLotId, selectedLot]);

  const handleLotChange = (value: string) => {
    if (value === 'create-new') {
      setIsCreatingNewLot(true);
      setSelectedLotId('');
    } else {
      setSelectedLotId(value);
      setIsCreatingNewLot(false);
    }
  };

  const createNewLot = () => {
    if (!newLotName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid lot name",
        variant: "destructive",
      });
      return;
    }
    
    addLot({
      name: newLotName.trim(),
      numberOfAnimals: 0,
      status: 'active',
      currentPastureId: null,
      source: 'other',
      purchaseDate: new Date(),
      breed: 'nelore'
    });

    setTimeout(() => {
      const newLot = lots.find(lot => lot.name === newLotName.trim());
      if (newLot) {
        setSelectedLotId(newLot.id);
        setIsNewLot(true);
      }
    }, 100);
    
    setNewLotName('');
    setIsCreatingNewLot(false);
    setAnimalWeights([]);
    setAnimalBreeds([]);
    setAnimalNotes([]);
    setCurrentAnimalIndex(0);
    setWeighedAnimalsCount(0);
    setSkippedAnimals([]);
    
    toast({
      title: "Success",
      description: `Lot "${newLotName.trim()}" created. You can now start weighing animals.`,
    });
  };

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

    let newWeights = [...animalWeights];
    let newBreeds = [...animalBreeds];
    let newNotes = [...animalNotes];
    
    if (selectedLot) {
      if (isNewLot || currentAnimalIndex >= animalWeights.length) {
        newWeights.push(weight);
        newBreeds.push(currentBreed);
        newNotes.push(currentNotes);

        useStore.getState().updateLot(selectedLot.id, {
          numberOfAnimals: isNewLot ? newWeights.length : currentAnimalIndex + 1
        });
      } else {
        if (currentAnimalIndex >= newWeights.length) {
          newWeights = [...newWeights, ...Array(currentAnimalIndex - newWeights.length + 1).fill(0)];
          newBreeds = [...newBreeds, ...Array(currentAnimalIndex - newBreeds.length + 1).fill(currentBreed)];
          newNotes = [...newNotes, ...Array(currentAnimalIndex - newNotes.length + 1).fill('')];
        }
        
        newWeights[currentAnimalIndex] = weight;
        newBreeds[currentAnimalIndex] = currentBreed;
        newNotes[currentAnimalIndex] = currentNotes;
      }
    }
    
    setAnimalWeights(newWeights);
    setAnimalBreeds(newBreeds);
    setAnimalNotes(newNotes);
    setWeighedAnimalsCount(weighedAnimalsCount + 1);
    
    setCurrentWeight('');
    setCurrentNotes('');
    
    const nextAnimalIndex = currentAnimalIndex + 1;
    setCurrentAnimalIndex(nextAnimalIndex);
    
    if (!isNewLot && selectedLot && nextAnimalIndex >= selectedLot.numberOfAnimals && newWeights.some(w => w > 0)) {
      finishWeighingSession();
    }
  };

  const skipAnimal = () => {
    let newSkippedAnimals = [...skippedAnimals, currentAnimalIndex];
    setSkippedAnimals(newSkippedAnimals);
    
    let newWeights = [...animalWeights];
    let newBreeds = [...animalBreeds];
    let newNotes = [...animalNotes];
    
    if (isNewLot) {
      newWeights.push(0);
      newBreeds.push(currentBreed);
      newNotes.push(currentNotes);
      
      if (selectedLot) {
        useStore.getState().updateLot(selectedLot.id, {
          numberOfAnimals: newWeights.length
        });
      }
    } else if (currentAnimalIndex >= newWeights.length) {
      newWeights = [...newWeights, ...Array(currentAnimalIndex - newWeights.length + 1).fill(0)];
      newBreeds = [...newBreeds, ...Array(currentAnimalIndex - newBreeds.length + 1).fill(currentBreed)];
      newNotes = [...newNotes, ...Array(currentAnimalIndex - newNotes.length + 1).fill('')];
      
      if (selectedLot && selectedLot.numberOfAnimals <= currentAnimalIndex) {
        useStore.getState().updateLot(selectedLot.id, {
          numberOfAnimals: currentAnimalIndex + 1
        });
      }
    }
    
    setAnimalWeights(newWeights);
    setAnimalBreeds(newBreeds);
    setAnimalNotes(newNotes);
    setPartialWeighing(true);
    setCurrentWeight('');
    setCurrentNotes('');
    
    const nextAnimalIndex = currentAnimalIndex + 1;
    setCurrentAnimalIndex(nextAnimalIndex);
    
    if (!isNewLot && selectedLot && nextAnimalIndex >= selectedLot.numberOfAnimals && animalWeights.some(w => w > 0)) {
      finishWeighingSession();
    }
  };

  const finishWeighingSession = () => {
    if (!selectedLot) return;
    
    const validAnimalRecords = isNewLot 
      ? animalWeights.filter((_, index) => index < animalWeights.length)
      : animalWeights;
      
    const validWeights = validAnimalRecords.filter(w => w > 0);
    const totalWeighed = validWeights.length;
    
    if (totalWeighed === 0 && skippedAnimals.length === 0) {
      toast({
        title: "No weights recorded",
        description: "Please record at least one animal weight or skip some animals",
        variant: "destructive",
      });
      return;
    }
    
    const totalWeight = validWeights.reduce((sum, weight) => sum + weight, 0);
    const averageWeight = totalWeighed > 0 ? totalWeight / totalWeighed : 0;
    
    const totalAnimals = isNewLot 
      ? validAnimalRecords.length
      : Math.max(selectedLot.numberOfAnimals, animalWeights.length, currentAnimalIndex);
    
    const nonWeighedAnimals = totalAnimals - totalWeighed;
    const estimatedTotalWeight = totalWeight + (nonWeighedAnimals * averageWeight);
    
    addWeighingRecord({
      date: new Date(),
      lotId: selectedLotId,
      numberOfAnimals: totalAnimals,
      totalWeight: estimatedTotalWeight,
      averageWeight: totalAnimals > 0 ? estimatedTotalWeight / totalAnimals : 0,
      notes: `Manual weighing of ${totalWeighed} animals (${nonWeighedAnimals} estimated at average weight)`
    });
    
    if (averageWeight > 0) {
      useStore.getState().updateLot(selectedLot.id, {
        numberOfAnimals: totalAnimals,
        averageWeight: averageWeight
      });
    } else {
      useStore.getState().updateLot(selectedLot.id, {
        numberOfAnimals: totalAnimals
      });
    }
    
    let message = `Successfully recorded weights for ${totalWeighed} animals`;
    if (nonWeighedAnimals > 0) {
      message += `. ${nonWeighedAnimals} animals were estimated at the average weight (${averageWeight > 0 ? averageWeight.toFixed(1) : '0'} kg)`;
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
    setSkippedAnimals([]);
    setIsNewLot(false);
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

  if (!selectedLotId && !isCreatingNewLot) {
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
          <CardDescription>Choose a lot of animals to start weighing or create a new one</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lotId">Lot</Label>
            <Select onValueChange={handleLotChange}>
              <SelectTrigger id="lotId">
                <SelectValue placeholder="Select a lot or create new" />
              </SelectTrigger>
              <SelectContent>
                {activeLots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.name} ({lot.numberOfAnimals} animals)
                  </SelectItem>
                ))}
                <SelectItem value="create-new">
                  <div className="flex items-center">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create new lot
                  </div>
                </SelectItem>
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

  if (isCreatingNewLot) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsCreatingNewLot(false)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Lot Selection
            </Button>
          </div>
          <CardTitle className="mt-4">Create New Lot</CardTitle>
          <CardDescription>Enter details for the new lot</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newLotName">Lot Name</Label>
            <Input
              id="newLotName"
              value={newLotName}
              onChange={(e) => setNewLotName(e.target.value)}
              placeholder="Enter name for the new lot"
              autoFocus
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={createNewLot}
            disabled={!newLotName.trim()}
            className="w-full"
          >
            Create Lot & Start Weighing
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
            {isNewLot ? (
              `Animal ${currentAnimalIndex + 1}`
            ) : (
              `Animal ${currentAnimalIndex + 1} of ${selectedLot?.numberOfAnimals || weighedAnimalsCount + skippedAnimals.length + 1}`
            )}
          </span>
        </div>
        <CardTitle className="mt-4">Record Weight</CardTitle>
        <CardDescription>
          Recording weights for lot: {selectedLot?.name}
          {weighedAnimalsCount > 0 && (
            <span className="block mt-1 text-sm">
              {weighedAnimalsCount} animals weighed, {skippedAnimals.length} skipped
              {isNewLot && <span> - continue adding as many animals as needed</span>}
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
          {isNewLot ? "Finish Adding Animals" : "End Session"}
        </Button>
      </CardFooter>
    </Card>
  );
}
