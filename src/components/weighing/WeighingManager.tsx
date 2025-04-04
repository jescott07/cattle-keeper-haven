
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
import { AnimalWeighingRecord } from './AnimalWeighingRecord';
import { WeighingSessionSummary } from './WeighingSessionSummary';
import { Info, Plus, Trash } from 'lucide-react';
import { BreedType } from '@/lib/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface TransferCriterion {
  id: string;
  weightValue: number;
  destinationLotId: string;
  condition?: 'less-than-or-equal' | 'greater-than';
}

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

  const handleAddCriterion = () => {
    setTransferCriteria([
      ...transferCriteria,
      {
        id: `criterion-${Date.now()}`,
        weightValue: 0,
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
      newCriteria.sort((a, b) => a.weightValue - b.weightValue);
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

    // For a newly created empty lot, we'll start with an empty array
    // and add animals as they're weighed
    setAnimalWeights([]);
    setAnimalBreeds([]);
    setAnimalNotes([]);
    setAnimalDestinations([]);
    
    setIsWeighing(true);
  };
  
  const updateWeight = (index: number, weight: number, breed?: BreedType, notes?: string) => {
    // Ensure arrays have enough elements
    const ensureArraySize = (arr: any[], value: any) => {
      const newArr = [...arr];
      while (newArr.length <= index) {
        newArr.push(value);
      }
      return newArr;
    };

    let newWeights = ensureArraySize([...animalWeights], 0);
    newWeights[index] = weight;
    setAnimalWeights(newWeights);
    
    if (breed) {
      let newBreeds = ensureArraySize([...animalBreeds], selectedLot?.breed || 'nelore');
      newBreeds[index] = breed;
      setAnimalBreeds(newBreeds);
    }
    
    if (notes !== undefined) {
      let newNotes = ensureArraySize([...animalNotes], '');
      newNotes[index] = notes || '';
      setAnimalNotes(newNotes);
    }
    
    if (weight > 0 && transferCriteria.length > 0) {
      const sortedCriteria = [...transferCriteria].sort((a, b) => a.weightValue - b.weightValue);
      let destinationLotId = '';
      
      for (const criterion of sortedCriteria) {
        if (weight >= criterion.weightValue) {
          destinationLotId = criterion.destinationLotId;
        } else {
          break;
        }
      }
      
      let newDestinations = ensureArraySize([...animalDestinations], '');
      newDestinations[index] = destinationLotId;
      setAnimalDestinations(newDestinations);
    }

    // If this is a newly created lot, update the number of animals
    if (selectedLot && selectedLot.numberOfAnimals === 0) {
      // We're adding a new animal, so update the lot size
      const totalAnimals = Math.max(index + 1, animalWeights.length);
      updateLot(selectedLotId, {
        numberOfAnimals: totalAnimals
      });
    }
  };
  
  const updateLot = useStore(state => state.updateLot);
  
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
    
    const avgWeight = validWeights.reduce((sum, w) => sum + w, 0) / validWeights.length;
    
    const destinationLots: Record<string, {count: number, totalWeight: number}> = {};
    
    for (let i = 0; i < animalWeights.length; i++) {
      const weight = animalWeights[i] > 0 ? animalWeights[i] : avgWeight;
      const destinationId = animalDestinations[i] || '';
      
      if (!destinationLots[destinationId]) {
        destinationLots[destinationId] = { count: 0, totalWeight: 0 };
      }
      
      destinationLots[destinationId].count++;
      destinationLots[destinationId].totalWeight += weight;
    }
    
    addWeighingRecord({
      date: new Date(),
      lotId: selectedLotId,
      numberOfAnimals: animalWeights.length,
      totalWeight: animalWeights.reduce((sum, w) => sum + (w > 0 ? w : avgWeight), 0),
      averageWeight: avgWeight,
      notes: `Weighed ${validWeights.length} of ${animalWeights.length} animals. Transfers recorded to ${Object.keys(destinationLots).length} destination lots.`
    });
    
    toast({
      title: "Success",
      description: `Weighing record created for ${validWeights.length} animals`
    });
    
    // Update the lot with the final number of animals and average weight
    updateLot(selectedLotId, {
      numberOfAnimals: animalWeights.length,
      averageWeight: avgWeight
    });
    
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
  };
  
  const addAnimalRecord = () => {
    setAnimalWeights([...animalWeights, 0]);
    setAnimalBreeds([...animalBreeds, selectedLot?.breed || 'nelore']);
    setAnimalNotes([...animalNotes, '']);
    setAnimalDestinations([...animalDestinations, '']);
    
    // If this is a newly created lot, update the number of animals
    if (selectedLot && selectedLot.numberOfAnimals === 0) {
      updateLot(selectedLotId, {
        numberOfAnimals: animalWeights.length + 1
      });
    }
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
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Weighing Session</h2>
          <Button variant="outline" onClick={resetWeighing}>Cancel</Button>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-muted-foreground">
            Recording weights for lot: {selectedLot?.name}
          </p>
          <Badge variant="outline" className="ml-2">
            {validWeights.length} of {animalWeights.length} weighed
          </Badge>
        </div>
        
        <div className="grid gap-4 mb-8">
          {animalWeights.length === 0 ? (
            <div className="flex justify-center p-6">
              <Button onClick={addAnimalRecord}>
                <Plus className="h-4 w-4 mr-2" />
                Add Animal
              </Button>
            </div>
          ) : (
            <>
              {animalWeights.map((weight, index) => (
                <AnimalWeighingRecord
                  key={index}
                  onRecordSave={(record) => {
                    updateWeight(
                      index, 
                      record.weight, 
                      record.breed, 
                      record.notes
                    );
                  }}
                  originLotId=""
                  sourceLotName={`Animal ${index + 1}`}
                  transferCriteria={[]}
                  defaultBreed={selectedLot?.breed || 'nelore'}
                />
              ))}
              
              <div className="flex justify-center">
                <Button onClick={addAnimalRecord} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Animal
                </Button>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-6">
          <Button 
            onClick={finishWeighing}
            className="w-full"
            disabled={validWeights.length === 0}
          >
            Complete Weighing Session
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
                {activeLots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.name} ({lot.numberOfAnimals} animals)
                  </SelectItem>
                ))}
                <SelectItem value="new-lot">
                  <div className="flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create new lot</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Transfer Criteria</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddCriterion}
              className="gap-1 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Threshold
            </Button>
          </div>
          
          <div className="bg-muted/40 p-4 rounded-md">
            <p className="text-sm text-muted-foreground mb-3">
              Define weight thresholds for transfers. Animals will be transferred based on these thresholds:
            </p>
            
            {transferCriteria.length === 0 ? (
              <div className="text-center py-3 text-sm text-muted-foreground">
                No transfer criteria defined. All animals will remain in the current lot.
              </div>
            ) : (
              <div className="space-y-3">
                {sortedCriteria.map((criterion, index) => {
                  const prevValue = index > 0 ? sortedCriteria[index - 1].weightValue : null;
                  
                  return (
                    <div key={criterion.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <div className="flex items-center gap-1 text-sm">
                          {prevValue !== null ? (
                            <>
                              <span className="text-muted-foreground">&lt;</span>
                              <span className="text-muted-foreground">{prevValue}</span>
                              <span className="text-muted-foreground mx-1">and</span>
                            </>
                          ) : null}
                          <span>≥</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={criterion.weightValue}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              handleCriterionChange(criterion.id, 'weightValue', value);
                            }}
                            className="w-20"
                            key={`weight-input-${criterion.id}`}
                          />
                          <span>kg</span>
                        </div>
                      </div>
                      
                      <div className="col-span-1 text-center">→</div>
                      <div className="col-span-5">
                        <Select
                          value={criterion.destinationLotId}
                          onValueChange={(value) => handleCriterionChange(
                            criterion.id, 
                            'destinationLotId', 
                            value
                          )}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Destination lot" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={selectedLotId}>(Current Lot)</SelectItem>
                            {lots.filter(lot => lot.id !== selectedLotId).map(lot => (
                              <SelectItem key={lot.id} value={lot.id}>
                                {lot.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="create-new">
                              <div className="flex items-center gap-1">
                                <Plus className="h-3.5 w-3.5" />
                                <span>Create new lot</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCriterion(criterion.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {criterion.destinationLotId === 'create-new' && (
                        <div className="col-span-12 mt-2 flex gap-2">
                          <Input
                            placeholder="New lot name"
                            value={newLotName}
                            onChange={(e) => setNewLotName(e.target.value)}
                          />
                          <Button 
                            size="sm"
                            onClick={() => {
                              if (newLotName.trim()) {
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
                                handleCriterionChange(criterion.id, 'destinationLotId', newLotId);
                                setNewLotName('');
                                toast({
                                  title: "Success",
                                  description: `New lot "${newLotName}" created`
                                });
                              }
                            }}
                            disabled={!newLotName.trim()}
                          >
                            Create
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {transferCriteria.length > 0 && (
              <div className="flex items-start gap-2 mt-4 p-3 bg-muted rounded-md text-sm">
                <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Animals will be assigned to destination lots based on weight thresholds.
                  Animals with weight greater than or equal to the threshold will be transferred to the selected lot.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleStartWeighing}
          disabled={!selectedLotId && !isCreatingNewLot}
          className="w-full"
        >
          Start Weighing
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WeighingManager;
