
import React, { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { WeighingSessionSummary } from './WeighingSessionSummary';
import { TransferCriteria, TransferCriterion } from './TransferCriteria';
import { ArrowRight, ChevronLeft, Plus, Trash } from 'lucide-react';
import { BreedType } from '@/lib/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface AnimalRecord {
  weight: number;
  breed: BreedType;
  notes?: string;
  isEstimated: boolean;
  isEditing: boolean;
  destinationLotId?: string;
}

const WeighingManager = () => {
  const { toast } = useToast();
  const addLot = useStore((state) => state.addLot);
  const addWeighingRecord = useStore((state) => state.addWeighingRecord);
  const lots = useStore(state => state.lots);
  const updateLot = useStore(state => state.updateLot);
  
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [transferCriteria, setTransferCriteria] = useState<TransferCriterion[]>([]);
  const [animalWeights, setAnimalWeights] = useState<number[]>([]);
  const [animalBreeds, setAnimalBreeds] = useState<BreedType[]>([]);
  const [animalNotes, setAnimalNotes] = useState<string[]>([]);
  const [animalDestinations, setAnimalDestinations] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [newLotName, setNewLotName] = useState<string>('');
  const [isCreatingNewLot, setIsCreatingNewLot] = useState(false);
  const [isWeighing, setIsWeighing] = useState(false);
  const [creatingDestinationLot, setCreatingDestinationLot] = useState<string | null>(null);
  
  // New states for the individual animal weighing interface
  const [currentAnimalIndex, setCurrentAnimalIndex] = useState(0);
  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [currentBreed, setCurrentBreed] = useState<BreedType>('nelore');
  const [currentNotes, setCurrentNotes] = useState('');
  const [weighedAnimalsCount, setWeighedAnimalsCount] = useState(0);
  
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

  const handleCreateLot = (lotName: string) => {
    if (!lotName.trim()) return;
    
    const newLotId = `lot-${Date.now()}`;
    
    addLot({
      // Remove the explicit id property as it's already handled by the store
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

    // Reset all data for a new weighing session
    setAnimalWeights([]);
    setAnimalBreeds([]);
    setAnimalNotes([]);
    setAnimalDestinations([]);
    setCurrentAnimalIndex(0);
    setCurrentWeight('');
    setCurrentBreed(selectedLot.breed || 'nelore');
    setCurrentNotes('');
    setWeighedAnimalsCount(0);
    
    setIsWeighing(true);
  };
  
  const getDestinationLotForWeight = (weight: number): string => {
    if (!weight || transferCriteria.length === 0) return '';
    
    // Sort criteria for consistent evaluation
    const sortedCriteria = [...transferCriteria].sort((a, b) => {
      const weightA = typeof a.weightValue === 'string' ? parseFloat(a.weightValue) : a.weightValue;
      const weightB = typeof b.weightValue === 'string' ? parseFloat(b.weightValue) : b.weightValue;
      return weightA - weightB;
    });
    
    let destinationLotId = '';
    
    for (const criterion of sortedCriteria) {
      const criterionWeight = typeof criterion.weightValue === 'string' 
        ? parseFloat(criterion.weightValue) 
        : criterion.weightValue;
      
      if (!isNaN(criterionWeight)) {
        if (criterion.condition === 'greater-than' && weight > criterionWeight) {
          destinationLotId = criterion.destinationLotId;
        } else if (criterion.condition === 'less-than-or-equal' && weight <= criterionWeight) {
          destinationLotId = criterion.destinationLotId;
          break; // For less-than-or-equal, we want the first match
        }
      }
    }
    
    return destinationLotId;
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

    // Create new arrays with the current animal data
    const newWeights = [...animalWeights];
    const newBreeds = [...animalBreeds];
    const newNotes = [...animalNotes];
    const newDestinations = [...animalDestinations];
    
    // Calculate destination lot based on weight criteria
    const destinationLotId = getDestinationLotForWeight(weight);
    
    // Update the arrays at the current index
    newWeights[currentAnimalIndex] = weight;
    newBreeds[currentAnimalIndex] = currentBreed;
    newNotes[currentAnimalIndex] = currentNotes;
    newDestinations[currentAnimalIndex] = destinationLotId;
    
    setAnimalWeights(newWeights);
    setAnimalBreeds(newBreeds);
    setAnimalNotes(newNotes);
    setAnimalDestinations(newDestinations);
    setWeighedAnimalsCount(weighedAnimalsCount + 1);
    
    // Reset for next animal
    setCurrentWeight('');
    setCurrentNotes('');
    setCurrentAnimalIndex(currentAnimalIndex + 1);

    if (selectedLot && selectedLot.numberOfAnimals === 0) {
      updateLot(selectedLotId, {
        numberOfAnimals: newWeights.length
      });
    }
  };
  
  const skipAnimal = () => {
    setCurrentAnimalIndex(currentAnimalIndex + 1);
  };
  
  const finishWeighing = () => {
    if (!selectedLot) return;
    
    const validWeights = animalWeights.filter(w => w > 0);
    if (validWeights.length === 0) {
      toast({
        title: "Error",
        description: "No weights recorded",
        variant: "destructive",
      });
      return;
    }
    
    const totalWeighed = validWeights.length;
    const totalWeight = validWeights.reduce((sum, weight) => sum + weight, 0);
    const avgWeight = totalWeight / totalWeighed;
    
    // Prepare destination lots statistics for transfers
    const destinationLots: Record<string, {count: number, totalWeight: number}> = {};
    
    for (let i = 0; i < animalWeights.length; i++) {
      if (animalWeights[i] <= 0) continue; // Skip unweighed animals
      
      const destinationId = animalDestinations[i] || '';
      
      if (!destinationLots[destinationId]) {
        destinationLots[destinationId] = { count: 0, totalWeight: 0 };
      }
      
      destinationLots[destinationId].count++;
      destinationLots[destinationId].totalWeight += animalWeights[i];
    }
    
    // Record the weighing session
    addWeighingRecord({
      date: new Date(),
      lotId: selectedLotId,
      numberOfAnimals: totalWeighed,
      totalWeight: totalWeight,
      averageWeight: avgWeight,
      notes: `Weighed ${totalWeighed} animals. Transfers recorded to ${Object.keys(destinationLots).length - (destinationLots[''] ? 1 : 0)} destination lots.`
    });
    
    toast({
      title: "Success",
      description: `Weighing record created for ${totalWeighed} animals`
    });
    
    // Update the source lot with new average weight
    updateLot(selectedLotId, {
      averageWeight: avgWeight
    });
    
    // Show the summary
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
    setCurrentWeight('');
    setCurrentBreed('nelore');
    setCurrentNotes('');
    setWeighedAnimalsCount(0);
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
    // Get the destination lot name if available
    const destinationWeight = currentWeight ? parseFloat(currentWeight) : 0;
    const destinationLotId = destinationWeight > 0 ? getDestinationLotForWeight(destinationWeight) : '';
    const destinationLot = destinationLotId ? lots.find(lot => lot.id === destinationLotId) : null;
    
    // Calculate arrobas (assuming 1 arroba = 15kg, but using 30kg as in your app)
    const arrobas = destinationWeight > 0 ? (destinationWeight / 30).toFixed(2) : '';
    
    // Determine if this animal will be transferred
    const isTransferred = destinationLotId !== '' && destinationLotId !== selectedLotId;

    return (
      <Card className="w-full max-w-2xl mx-auto animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsWeighing(false)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Lot Selection
            </Button>
            <span className="text-sm text-muted-foreground">
              Animal {currentAnimalIndex + 1} of {selectedLot ? (selectedLot.numberOfAnimals || '∞') : '?'}
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
                @ {arrobas} arrobas
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
          
          {destinationWeight > 0 && transferCriteria.length > 0 && (
            <div className={`p-3 rounded-md flex items-center justify-between ${isTransferred ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
              <div className="flex items-center gap-2">
                <div className="font-medium">
                  {selectedLot?.name || 'Current lot'}
                </div>
                {isTransferred && (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    <div className="font-medium">
                      {destinationLot?.name || 'New lot'}
                    </div>
                  </>
                )}
              </div>
              <div>
                {destinationWeight} kg ({arrobas} @)
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={skipAnimal}
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
            onClick={finishWeighing}
            disabled={weighedAnimalsCount === 0}
          >
            End Session
          </Button>
        </CardFooter>
      </Card>
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
        
        <div className="space-y-4">
          <TransferCriteria
            criteria={transferCriteria}
            onChange={setTransferCriteria}
            availableLots={lots}
            onCreateLot={handleCreateLot}
          />
        </div>
        
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
