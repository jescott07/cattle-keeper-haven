
import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { WeighingSessionSummary } from './WeighingSessionSummary';
import { ArrowLeft, ArrowRight, Info, Plus, Trash } from 'lucide-react';
import { BreedType } from '@/lib/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { TransferCriteria, TransferCriterion } from './TransferCriteria';

interface ManagerTransferCriterion {
  id: string;
  weightValue: number;
  destinationLotId: string;
  condition: 'greater-than' | 'less-than-or-equal';
}

const WeighingManager = () => {
  const { toast } = useToast();
  const addLot = useStore((state) => state.addLot);
  const addWeighingRecord = useStore((state) => state.addWeighingRecord);
  const lots = useStore(state => state.lots);
  
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [transferCriteria, setTransferCriteria] = useState<ManagerTransferCriterion[]>([]);
  const [animalWeights, setAnimalWeights] = useState<number[]>([]);
  const [animalBreeds, setAnimalBreeds] = useState<BreedType[]>([]);
  const [animalNotes, setAnimalNotes] = useState<string[]>([]);
  const [animalDestinations, setAnimalDestinations] = useState<string[]>([]);
  const [currentAnimalIndex, setCurrentAnimalIndex] = useState<number>(0);
  const [showSummary, setShowSummary] = useState(false);
  const [newLotName, setNewLotName] = useState<string>('');
  const [isCreatingNewLot, setIsCreatingNewLot] = useState(false);
  const [isWeighing, setIsWeighing] = useState(false);
  const [creatingDestinationLot, setCreatingDestinationLot] = useState<string | null>(null);
  const [isNewLot, setIsNewLot] = useState(false);
  
  const activeLots = lots.filter(lot => lot.status === 'active');
  const selectedLot = selectedLotId ? lots.find(lot => lot.id === selectedLotId) : null;
  
  const handleSelectLot = (value: string) => {
    if (value === 'new-lot') {
      setIsCreatingNewLot(true);
      setSelectedLotId('');
      return;
    }
    
    setSelectedLotId(value);
    setIsCreatingNewLot(false);
  };
  
  const handleCreateNewLot = () => {
    if (!newLotName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the new lot",
        variant: "destructive",
      });
      return;
    }
    
    const newLotId = `lot-${Date.now()}`;
    
    addLot({
      id: newLotId,
      name: newLotName,
      numberOfAnimals: 0,
      source: "other",
      status: "active",
      purchaseDate: new Date(),
      currentPastureId: ""
    });
    
    toast({
      title: "Success",
      description: `New lot "${newLotName}" created`
    });
    
    setSelectedLotId(newLotId);
    setNewLotName('');
    setIsCreatingNewLot(false);
  };

  const handleCriteriaChange = (newCriteria: TransferCriterion[]) => {
    setTransferCriteria(newCriteria.map(criterion => ({
      id: criterion.id,
      weightValue: typeof criterion.weightValue === 'string' 
        ? parseFloat(criterion.weightValue) || 0 // Convert to number and handle NaN
        : criterion.weightValue,
      destinationLotId: criterion.destinationLotId,
      condition: criterion.condition
    })));
  };
  
  const handleCreateDestinationLot = (lotName: string) => {
    if (!lotName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the new lot",
        variant: "destructive",
      });
      return;
    }
    
    const newLotId = `lot-${Date.now()}`;
    
    addLot({
      id: newLotId,
      name: lotName,
      numberOfAnimals: 0,
      source: "other",
      status: "active",
      purchaseDate: new Date(),
      currentPastureId: ""
    });
    
    toast({
      title: "Success",
      description: `New lot "${lotName}" created`
    });
    
    return newLotId;
  };
  
  const handleStartWeighing = () => {
    if (!selectedLot) {
      toast({
        title: "Error",
        description: "Please select a lot to weigh",
        variant: "destructive",
      });
      return;
    }

    // Check if this is a new lot (0 animals) or existing lot (>=1 animals)
    const isNewEmptyLot = selectedLot.numberOfAnimals === 0;
    setIsNewLot(isNewEmptyLot);

    if (isNewEmptyLot) {
      // For new lots, start with one empty record
      setAnimalWeights([0]);
      setAnimalBreeds([selectedLot?.breed || 'nelore']);
      setAnimalNotes(['']);
      setAnimalDestinations(['']);
    } else {
      // For existing lots, create an array with the number of animals in the lot
      const weights = Array(selectedLot.numberOfAnimals).fill(0);
      const breeds = Array(selectedLot.numberOfAnimals).fill(selectedLot?.breed || 'nelore');
      const notes = Array(selectedLot.numberOfAnimals).fill('');
      const destinations = Array(selectedLot.numberOfAnimals).fill('');
      
      setAnimalWeights(weights);
      setAnimalBreeds(breeds);
      setAnimalNotes(notes);
      setAnimalDestinations(destinations);
    }
    
    setCurrentAnimalIndex(0);
    setIsWeighing(true);
  };
  
  const getDestinationLotForWeight = (weight: number): string => {
    if (weight <= 0 || transferCriteria.length === 0) return '';
    
    const sortedCriteria = [...transferCriteria].sort((a, b) => {
      return a.weightValue - b.weightValue;
    });
    
    let destinationLotId = '';
    
    for (const criterion of sortedCriteria) {
      if (criterion.condition === 'greater-than' && weight > criterion.weightValue) {
        destinationLotId = criterion.destinationLotId;
      } else if (criterion.condition === 'less-than-or-equal' && weight <= criterion.weightValue) {
        destinationLotId = criterion.destinationLotId;
        break;
      }
    }
    
    return destinationLotId;
  };
  
  const findMatchingCriterionForWeight = (weight: number): ManagerTransferCriterion | null => {
    if (weight <= 0 || transferCriteria.length === 0) return null;
    
    const sortedCriteria = [...transferCriteria].sort((a, b) => {
      return a.weightValue - b.weightValue;
    });
    
    for (const criterion of sortedCriteria) {
      if (criterion.condition === 'greater-than' && weight > criterion.weightValue) {
        return criterion;
      } else if (criterion.condition === 'less-than-or-equal' && weight <= criterion.weightValue) {
        return criterion;
      }
    }
    
    return null;
  };
  
  const updateWeight = (weight: number, breed: BreedType, notes: string) => {
    let newWeights = [...animalWeights];
    newWeights[currentAnimalIndex] = weight;
    setAnimalWeights(newWeights);
    
    let newBreeds = [...animalBreeds];
    newBreeds[currentAnimalIndex] = breed;
    setAnimalBreeds(newBreeds);
    
    let newNotes = [...animalNotes];
    newNotes[currentAnimalIndex] = notes;
    setAnimalNotes(newNotes);
    
    if (weight > 0) {
      const destinationLotId = getDestinationLotForWeight(weight);
      
      let newDestinations = [...animalDestinations];
      newDestinations[currentAnimalIndex] = destinationLotId;
      setAnimalDestinations(newDestinations);
    }
  };
  
  const updateLot = useStore(state => state.updateLot);
  
  const nextAnimal = () => {
    if (animalWeights[currentAnimalIndex] <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid weight before proceeding",
        variant: "destructive",
      });
      return;
    }
    
    // For new lots, always add a new animal record when going to the next
    if (isNewLot || currentAnimalIndex === animalWeights.length - 1) {
      setAnimalWeights([...animalWeights, 0]);
      setAnimalBreeds([...animalBreeds, selectedLot?.breed || 'nelore']);
      setAnimalNotes([...animalNotes, '']);
      setAnimalDestinations([...animalDestinations, '']);
    }
    
    // Check if we're at the last animal for existing lots
    if (!isNewLot && currentAnimalIndex === animalWeights.length - 1) {
      // For existing lots, if we're on the last animal, finish the weighing automatically
      const allAnimalsWeighed = animalWeights.every(weight => weight > 0);
      if (allAnimalsWeighed) {
        finishWeighing();
        return;
      }
    }
    
    setCurrentAnimalIndex(currentAnimalIndex + 1);
  };
  
  const previousAnimal = () => {
    if (currentAnimalIndex > 0) {
      setCurrentAnimalIndex(currentAnimalIndex - 1);
    }
  };
  
  const skipAnimal = () => {
    // Add the animal with an estimated weight (0)
    if (isNewLot) {
      // For new lots, always add a new animal when skipping
      setAnimalWeights([...animalWeights, 0]);
      setAnimalBreeds([...animalBreeds, selectedLot?.breed || 'nelore']);
      setAnimalNotes([...animalNotes, '']);
      setAnimalDestinations([...animalDestinations, '']);
      setCurrentAnimalIndex(currentAnimalIndex + 1);
    } else {
      // For existing lots, just move to the next animal if possible
      if (currentAnimalIndex < animalWeights.length - 1) {
        setCurrentAnimalIndex(currentAnimalIndex + 1);
      } else {
        // Check if all animals have been processed
        finishWeighing();
      }
    }
  };
  
  const finishWeighing = () => {
    if (!selectedLot) return;
    
    const validAnimalIndices = animalWeights.map((w, idx) => w > 0 ? idx : -1).filter(idx => idx !== -1);
    
    if (validAnimalIndices.length === 0) {
      toast({
        title: "Error",
        description: "No weights recorded",
        variant: "destructive",
      });
      return;
    }
    
    const validWeights = validAnimalIndices.map(idx => animalWeights[idx]);
    const validBreeds = validAnimalIndices.map(idx => animalBreeds[idx]);
    const validNotes = validAnimalIndices.map(idx => animalNotes[idx]);
    const validDestinations = validAnimalIndices.map(idx => animalDestinations[idx]);
    
    const avgWeight = validWeights.reduce((sum, w) => sum + w, 0) / validWeights.length;
    
    const destinationLots: Record<string, {count: number, totalWeight: number}> = {};
    
    for (let i = 0; i < validWeights.length; i++) {
      const weight = validWeights[i];
      const destinationId = validDestinations[i] || '';
      
      if (!destinationLots[destinationId]) {
        destinationLots[destinationId] = { count: 0, totalWeight: 0 };
      }
      
      destinationLots[destinationId].count++;
      destinationLots[destinationId].totalWeight += weight;
    }
    
    addWeighingRecord({
      date: new Date(),
      lotId: selectedLotId,
      numberOfAnimals: validWeights.length,
      totalWeight: validWeights.reduce((sum, w) => sum + w, 0),
      averageWeight: avgWeight,
      notes: `Weighed ${validWeights.length} animals. Transfers recorded to ${Object.keys(destinationLots).length} destination lots.`
    });
    
    toast({
      title: "Success",
      description: `Weighing record created for ${validWeights.length} animals`
    });
    
    // Update the lot with the new animal count if it was a new lot
    const newAnimalCount = isNewLot ? animalWeights.length : selectedLot.numberOfAnimals;
    
    updateLot(selectedLotId, {
      numberOfAnimals: newAnimalCount,
      averageWeight: avgWeight
    });
    
    // For the summary, include all animals (weighed and estimated)
    setShowSummary(true);
  };
  
  const resetWeighing = () => {
    setSelectedLotId('');
    setAnimalWeights([]);
    setAnimalBreeds([]);
    setAnimalNotes([]);
    setAnimalDestinations([]);
    setTransferCriteria([]);
    setShowSummary(false);
    setIsWeighing(false);
    setIsCreatingNewLot(false);
    setCurrentAnimalIndex(0);
    setIsNewLot(false);
  };
  
  if (showSummary) {
    return (
      <WeighingSessionSummary 
        weights={animalWeights}
        date={new Date()}
        onNewSession={resetWeighing}
        totalAnimals={animalWeights.length}
        isPartialWeighing={false}
        animalBreeds={animalBreeds}
        animalNotes={animalNotes}
        animalDestinations={animalDestinations}
        transferCriteria={transferCriteria}
        lots={lots}
      />
    );
  }
  
  if (isWeighing) {
    const validWeights = animalWeights.filter(w => w > 0);
    const currentWeight = animalWeights[currentAnimalIndex] || 0;
    const currentBreed = animalBreeds[currentAnimalIndex] || selectedLot?.breed || 'nelore';
    const currentNotes = animalNotes[currentAnimalIndex] || '';
    const currentDestination = animalDestinations[currentAnimalIndex] || '';
    
    const matchingCriterion = findMatchingCriterionForWeight(currentWeight);
    
    const destinationLot = currentDestination 
      ? lots.find(lot => lot.id === currentDestination) 
      : null;
      
    return (
      <div className="max-w-md mx-auto bg-background shadow-sm rounded-lg">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <button 
              onClick={() => setIsWeighing(false)}
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Lot Selection
            </button>
            <Badge variant="outline">
              Animal {currentAnimalIndex + 1} of {isNewLot ? "∞" : animalWeights.length}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold">Record Weight</h1>
          <p className="text-muted-foreground">
            Recording weights for lot: {selectedLot?.name}
            {isNewLot && " (New lot - session will continue until manually ended)"}
          </p>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              placeholder="Enter weight"
              value={currentWeight || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                updateWeight(value, currentBreed, currentNotes);
              }}
            />
          </div>
          
          <div>
            <Label htmlFor="breed">Breed</Label>
            <Select 
              value={currentBreed}
              onValueChange={(value) => {
                let newBreeds = [...animalBreeds];
                newBreeds[currentAnimalIndex] = value as BreedType;
                setAnimalBreeds(newBreeds);
              }}
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
          
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes for this animal"
              value={currentNotes}
              onChange={(e) => {
                let newNotes = [...animalNotes];
                newNotes[currentAnimalIndex] = e.target.value;
                setAnimalNotes(newNotes);
              }}
            />
          </div>
          
          {currentWeight > 0 && (
            <div className="border p-3 rounded-md bg-muted/30">
              <Label>Transfer Destination</Label>
              {destinationLot ? (
                <>
                  <div className="flex items-center mt-1 gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                    <div className="font-medium">
                      {destinationLot.name}
                    </div>
                  </div>
                  {matchingCriterion && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {matchingCriterion.condition === 'greater-than' 
                        ? `Weight > ${matchingCriterion.weightValue}kg`
                        : `Weight ≤ ${matchingCriterion.weightValue}kg`}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground mt-1">
                  Animal will remain in current lot
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={previousAnimal}
              disabled={currentAnimalIndex === 0}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button 
              onClick={nextAnimal}
              disabled={currentWeight <= 0}
              className="flex items-center justify-center"
            >
              Next
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={skipAnimal}
            variant="ghost"
            className="w-full"
          >
            Skip Animal
          </Button>
          <Button 
            onClick={finishWeighing} 
            variant="secondary"
            className="w-full"
            disabled={validWeights.length === 0}
          >
            End Session
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Weighing Session</CardTitle>
        <CardDescription>
          Weigh and transfer animals to new lots based on weight criteria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="lotId">Select Lot to Weigh</Label>
          {isCreatingNewLot ? (
            <div className="flex gap-2">
              <Input
                placeholder="New lot name"
                value={newLotName}
                onChange={(e) => setNewLotName(e.target.value)}
                autoFocus
              />
              <Button 
                onClick={handleCreateNewLot}
                disabled={!newLotName.trim()}
              >
                Create
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsCreatingNewLot(false);
                  setNewLotName('');
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Select onValueChange={handleSelectLot} value={selectedLotId}>
              <SelectTrigger id="lotId">
                <SelectValue placeholder="Select a lot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-lot">Create new lot</SelectItem>
                {activeLots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.name} ({lot.numberOfAnimals} animals)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <TransferCriteria 
          criteria={transferCriteria}
          onChange={handleCriteriaChange}
          availableLots={lots}
          onCreateLot={handleCreateDestinationLot}
        />
        
        <Button 
          onClick={handleStartWeighing}
          className="w-full mt-4"
          disabled={!selectedLotId}
        >
          Start Weighing Session
        </Button>
      </CardContent>
    </Card>
  );
};

export default WeighingManager;

