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

    setAnimalWeights([]);
    setAnimalBreeds([]);
    setAnimalNotes([]);
    setAnimalDestinations([]);
    
    setIsWeighing(true);
  };
  
  const updateWeight = (index: number, weight: number, breed?: BreedType, notes?: string) => {
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

    if (selectedLot && selectedLot.numberOfAnimals === 0) {
      updateLot(selectedLotId, {
        numberOfAnimals: animalWeights.length + 1
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
    
    if (selectedLot && selectedLot.numberOfAnimals === 0) {
      updateLot(selectedLotId, {
        numberOfAnimals: animalWeights.length + 1
      });
    }
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
