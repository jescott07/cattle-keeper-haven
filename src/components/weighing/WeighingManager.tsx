
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
import { TransferCriterion } from './TransferCriteria';

const WeighingManager = () => {
  const { toast } = useToast();
  const addLot = useStore((state) => state.addLot);
  const addWeighingRecord = useStore((state) => state.addWeighingRecord);
  const lots = useStore(state => state.lots);
  
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [transferCriteria, setTransferCriteria] = useState<TransferCriterion[]>([]);
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

  const handleAddCriterion = () => {
    setTransferCriteria([
      ...transferCriteria,
      {
        id: `criterion-${Date.now()}`,
        weightValue: 0,
        condition: 'greater-than' as const,
        destinationLotId: ''
      }
    ]);
  };
  
  const handleRemoveCriterion = (id: string) => {
    setTransferCriteria(transferCriteria.filter(c => c.id !== id));
  };
  
  const handleCriterionChange = (
    id: string, 
    field: keyof TransferCriterion, 
    value: string | number
  ) => {
    const newCriteria = transferCriteria.map(c => {
      if (c.id === id) {
        return { ...c, [field]: value };
      }
      return c;
    });
    
    if (field === 'weightValue') {
      // Sort criteria by weight value (need to convert to number for comparison)
      newCriteria.sort((a, b) => {
        const aValue = typeof a.weightValue === 'number' ? a.weightValue : parseFloat(a.weightValue.toString() || '0');
        const bValue = typeof b.weightValue === 'number' ? b.weightValue : parseFloat(b.weightValue.toString() || '0');
        return aValue - bValue;
      });
    }
    
    setTransferCriteria(newCriteria);
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

    setAnimalWeights([0]);
    setAnimalBreeds([selectedLot?.breed || 'nelore']);
    setAnimalNotes(['']);
    setAnimalDestinations(['']);
    setCurrentAnimalIndex(0);
    
    setIsWeighing(true);
  };
  
  // This function determines which destination lot to use based on weight
  const getDestinationLotForWeight = (weight: number): string => {
    if (weight <= 0 || transferCriteria.length === 0) return '';
    
    const sortedCriteria = [...transferCriteria].sort((a, b) => {
      const aValue = typeof a.weightValue === 'number' ? a.weightValue : parseFloat(a.weightValue.toString() || '0');
      const bValue = typeof b.weightValue === 'number' ? b.weightValue : parseFloat(b.weightValue.toString() || '0');
      return aValue - bValue;
    });
    
    let destinationLotId = '';
    
    for (const criterion of sortedCriteria) {
      const criterionWeight = typeof criterion.weightValue === 'number' 
        ? criterion.weightValue 
        : parseFloat(criterion.weightValue.toString() || '0');
        
      // For 'greater-than' condition, set the destination if weight is greater than the criterion
      if (criterion.condition === 'greater-than' && weight > criterionWeight) {
        destinationLotId = criterion.destinationLotId;
      }
      // For 'less-than-or-equal' condition, set the destination if weight is less than or equal to the criterion
      else if (criterion.condition === 'less-than-or-equal' && weight <= criterionWeight) {
        destinationLotId = criterion.destinationLotId;
        break; // Stop at the first matching less-than-or-equal criterion
      }
    }
    
    return destinationLotId;
  };
  
  // Function to find matching criterion for a weight
  const findMatchingCriterionForWeight = (weight: number): TransferCriterion | null => {
    if (weight <= 0 || transferCriteria.length === 0) return null;
    
    const sortedCriteria = [...transferCriteria].sort((a, b) => {
      const aValue = typeof a.weightValue === 'number' ? a.weightValue : parseFloat(a.weightValue.toString() || '0');
      const bValue = typeof b.weightValue === 'number' ? b.weightValue : parseFloat(b.weightValue.toString() || '0');
      return aValue - bValue;
    });
    
    for (const criterion of sortedCriteria) {
      const criterionWeight = typeof criterion.weightValue === 'number' 
        ? criterion.weightValue 
        : parseFloat(criterion.weightValue.toString() || '0');
        
      if (criterion.condition === 'greater-than' && weight > criterionWeight) {
        return criterion;
      } else if (criterion.condition === 'less-than-or-equal' && weight <= criterionWeight) {
        return criterion;
        // Break not needed here since we're returning
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
    
    // Automatically determine destination lot based on weight criteria
    const destinationLotId = getDestinationLotForWeight(weight);
    
    let newDestinations = [...animalDestinations];
    newDestinations[currentAnimalIndex] = destinationLotId;
    setAnimalDestinations(newDestinations);
  };
  
  const updateLot = useStore(state => state.updateLot);
  
  const nextAnimal = () => {
    // Save current animal
    if (animalWeights[currentAnimalIndex] <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid weight before proceeding",
        variant: "destructive",
      });
      return;
    }
    
    // Move to next animal (create a new one if needed)
    if (currentAnimalIndex === animalWeights.length - 1) {
      // Add a new animal
      setAnimalWeights([...animalWeights, 0]);
      setAnimalBreeds([...animalBreeds, selectedLot?.breed || 'nelore']);
      setAnimalNotes([...animalNotes, '']);
      setAnimalDestinations([...animalDestinations, '']);
    }
    
    setCurrentAnimalIndex(currentAnimalIndex + 1);
  };
  
  const previousAnimal = () => {
    if (currentAnimalIndex > 0) {
      setCurrentAnimalIndex(currentAnimalIndex - 1);
    }
  };
  
  const skipAnimal = () => {
    if (currentAnimalIndex < animalWeights.length - 1) {
      // Move to next existing animal
      setCurrentAnimalIndex(currentAnimalIndex + 1);
    } else {
      // Add a new animal
      setAnimalWeights([...animalWeights, 0]);
      setAnimalBreeds([...animalBreeds, selectedLot?.breed || 'nelore']);
      setAnimalNotes([...animalNotes, '']);
      setAnimalDestinations([...animalDestinations, '']);
      setCurrentAnimalIndex(currentAnimalIndex + 1);
    }
  };
  
  const finishWeighing = () => {
    if (!selectedLot) return;
    
    // Filter out skipped animals (weight <= 0)
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
    
    updateLot(selectedLotId, {
      numberOfAnimals: validWeights.length,
      averageWeight: avgWeight
    });
    
    // Clean up animal data to include only valid entries
    setAnimalWeights(validWeights);
    setAnimalBreeds(validBreeds);
    setAnimalNotes(validNotes);
    setAnimalDestinations(validDestinations);
    
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
  };
  
  const handleCreateDestinationLot = (criterionId: string) => {
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
    
    handleCriterionChange(criterionId, 'destinationLotId', newLotId);
    
    toast({
      title: "Success",
      description: `New lot "${newLotName}" created`
    });
    
    setNewLotName('');
    setCreatingDestinationLot(null);
  };
  
  // Immediate update of destination when weight changes (for UI display)
  useEffect(() => {
    if (isWeighing && animalWeights[currentAnimalIndex] > 0) {
      const destinationLotId = getDestinationLotForWeight(animalWeights[currentAnimalIndex]);
      
      let newDestinations = [...animalDestinations];
      newDestinations[currentAnimalIndex] = destinationLotId;
      setAnimalDestinations(newDestinations);
    }
  }, [animalWeights, currentAnimalIndex, transferCriteria]);
  
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
    
    // Find the matching criterion for the current weight
    const matchingCriterion = findMatchingCriterionForWeight(currentWeight);
    
    // Get destination lot information
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
              Animal {currentAnimalIndex + 1} of {animalWeights.length}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold">Record Weight</h1>
          <p className="text-muted-foreground">
            Recording weights for lot: {selectedLot?.name}
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
  
  const sortedCriteria = [...transferCriteria].sort((a, b) => a.weightValue - b.weightValue);
  
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
          <div className="flex justify-between items-center">
            <Label>Transfer Criteria (Optional)</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddCriterion}
            >
              Add Rule
            </Button>
          </div>
          
          {sortedCriteria.length > 0 ? (
            <div className="space-y-4">
              {sortedCriteria.map((criterion) => (
                <div key={criterion.id} className="grid grid-cols-12 gap-2 items-end border p-3 rounded-md relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6"
                    onClick={() => handleRemoveCriterion(criterion.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                  
                  <div className="col-span-5">
                    <Label htmlFor={`weight-${criterion.id}`}>Weight Threshold</Label>
                    <Input 
                      id={`weight-${criterion.id}`}
                      type="number"
                      min="0"
                      placeholder="e.g., 300"
                      value={criterion.weightValue}
                      onChange={(e) => handleCriterionChange(
                        criterion.id, 
                        'weightValue', 
                        parseFloat(e.target.value) || 0
                      )}
                    />
                  </div>
                  
                  <div className="col-span-7">
                    <Label htmlFor={`destination-${criterion.id}`}>Destination Lot</Label>
                    {creatingDestinationLot === criterion.id ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="New lot name"
                          value={newLotName}
                          onChange={(e) => setNewLotName(e.target.value)}
                          autoFocus
                        />
                        <Button 
                          size="sm"
                          onClick={() => handleCreateDestinationLot(criterion.id)}
                          disabled={!newLotName.trim()}
                        >
                          Add
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCreatingDestinationLot(null);
                            setNewLotName('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Select 
                        value={criterion.destinationLotId} 
                        onValueChange={(value) => {
                          if (value === "new-destination-lot") {
                            setCreatingDestinationLot(criterion.id);
                            setNewLotName('');
                          } else {
                            handleCriterionChange(criterion.id, 'destinationLotId', value);
                          }
                        }}
                      >
                        <SelectTrigger id={`destination-${criterion.id}`}>
                          <SelectValue placeholder="Select destination lot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new-destination-lot">Create new lot</SelectItem>
                          {lots.map((lot) => (
                            <SelectItem key={lot.id} value={lot.id}>
                              {lot.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 border border-dashed rounded-md">
              <p className="text-muted-foreground">
                No transfer criteria defined. Add a rule to automatically sort animals by weight.
              </p>
            </div>
          )}
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
