
import { useState } from 'react';
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
import { BreedType, Lot } from '@/lib/types';
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
}

// Define the AnimalRecord type to include notes property
interface AnimalRecord {
  weight: number;
  breed: BreedType;
  notes?: string; // Make notes optional
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
  
  const activeLots = lots.filter(lot => lot.status === 'active');
  const selectedLot = selectedLotId ? lots.find(lot => lot.id === selectedLotId) : null;
  
  const handleSelectLot = (value: string) => {
    if (value === 'new-lot') {
      // User selected to create a new lot
      return;
    }
    
    setSelectedLotId(value);
    
    if (value) {
      const lot = lots.find(l => l.id === value);
      if (lot) {
        setAnimalWeights(Array(lot.numberOfAnimals).fill(0));
        setAnimalBreeds(Array(lot.numberOfAnimals).fill(lot.breed || 'nelore'));
        setAnimalNotes(Array(lot.numberOfAnimals).fill(''));
        setAnimalDestinations(Array(lot.numberOfAnimals).fill(''));
      }
    }
  };
  
  const handleCreateNewLot = (name: string) => {
    const newLotId = `lot-${Date.now()}`;
    
    // Fixed: Removed 'id' from the object passed to addLot as it's excluded in the type
    addLot({
      name,
      numberOfAnimals: 0, // Will be populated as animals are transferred
      source: "other",
      status: "active",
      purchaseDate: new Date(),
      currentPastureId: "",
      syncStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      plannedTransfers: []
    });
    
    toast({
      title: "Success",
      description: `New lot "${name}" created`
    });
    
    return newLotId;
  };

  const handleAddCriterion = () => {
    // Get the highest weight value from existing criteria
    const highestWeightValue = transferCriteria.length > 0 
      ? Math.max(...transferCriteria.map(c => c.weightValue))
      : 0;
      
    // Default next weight is 100kg more than highest (or 200 if first)
    const defaultNextWeight = highestWeightValue + (highestWeightValue > 0 ? 100 : 200);
    
    setTransferCriteria([
      ...transferCriteria,
      {
        id: `criterion-${Date.now()}`,
        weightValue: defaultNextWeight,
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
    
    // Sort the criteria by weight value (ascending)
    newCriteria.sort((a, b) => a.weightValue - b.weightValue);
    
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

    // Proceed with the selected lot's number of animals
    const totalAnimals = selectedLot.numberOfAnimals;
    setAnimalWeights(Array(totalAnimals).fill(0));
    setAnimalBreeds(Array(totalAnimals).fill(selectedLot.breed || 'nelore'));
    setAnimalNotes(Array(totalAnimals).fill(''));
    setAnimalDestinations(Array(totalAnimals).fill(''));
  };
  
  const updateWeight = (index: number, weight: number, breed?: BreedType, notes?: string) => {
    const newWeights = [...animalWeights];
    newWeights[index] = weight;
    setAnimalWeights(newWeights);
    
    if (breed) {
      const newBreeds = [...animalBreeds];
      newBreeds[index] = breed;
      setAnimalBreeds(newBreeds);
    }
    
    if (notes) {
      const newNotes = [...animalNotes];
      newNotes[index] = notes || '';
      setAnimalNotes(newNotes);
    }
    
    // Determine destination lot based on transfer criteria
    if (weight > 0 && transferCriteria.length > 0) {
      const sortedCriteria = [...transferCriteria].sort((a, b) => a.weightValue - b.weightValue);
      
      // Find the appropriate destination based on weight thresholds
      let destinationLotId = '';
      
      for (let i = 0; i < sortedCriteria.length; i++) {
        const criterion = sortedCriteria[i];
        const nextCriterion = sortedCriteria[i + 1];
        
        // If this is the last criterion, or weight is less than next threshold
        if (i === sortedCriteria.length - 1 || weight <= nextCriterion.weightValue) {
          if (weight <= criterion.weightValue) {
            destinationLotId = criterion.destinationLotId;
            break;
          }
        }
      }
      
      // If weight is greater than all criteria thresholds
      if (!destinationLotId && sortedCriteria.length > 0) {
        destinationLotId = sortedCriteria[sortedCriteria.length - 1].destinationLotId;
      }
      
      const newDestinations = [...animalDestinations];
      newDestinations[index] = destinationLotId;
      setAnimalDestinations(newDestinations);
    }
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
    
    // Average weight of actually weighed animals
    const avgWeight = validWeights.reduce((sum, w) => sum + w, 0) / validWeights.length;
    
    // For each destination lot, track how many animals and total weight
    const destinationLots: Record<string, {count: number, totalWeight: number}> = {};
    
    // Process animal records with destinations
    for (let i = 0; i < animalWeights.length; i++) {
      const weight = animalWeights[i] > 0 ? animalWeights[i] : avgWeight; // Use measured weight or average
      const destinationId = animalDestinations[i] || '';
      
      if (!destinationLots[destinationId]) {
        destinationLots[destinationId] = { count: 0, totalWeight: 0 };
      }
      
      destinationLots[destinationId].count++;
      destinationLots[destinationId].totalWeight += weight;
    }
    
    // Record the weighing
    addWeighingRecord({
      date: new Date(),
      lotId: selectedLotId,
      numberOfAnimals: selectedLot.numberOfAnimals,
      totalWeight: animalWeights.reduce((sum, w) => sum + (w > 0 ? w : avgWeight), 0),
      averageWeight: avgWeight,
      notes: `Weighed ${validWeights.length} of ${selectedLot.numberOfAnimals} animals. Transfers recorded to ${Object.keys(destinationLots).length} destination lots.`
    });
    
    toast({
      title: "Success",
      description: `Weighing record created for ${validWeights.length} animals`
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
  };
  
  if (showSummary) {
    return (
      <WeighingSessionSummary 
        weights={animalWeights}
        date={new Date()}
        onNewSession={resetWeighing}
        totalAnimals={selectedLot?.numberOfAnimals || 0}
        isPartialWeighing={animalWeights.filter(w => w > 0).length < (selectedLot?.numberOfAnimals || 0)}
        animalBreeds={animalBreeds}
        animalNotes={animalNotes}
        animalDestinations={animalDestinations}
        transferCriteria={transferCriteria}
        lots={lots}
      />
    );
  }
  
  if (animalWeights.length > 0) {
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
          {animalWeights.map((weight, index) => (
            <AnimalWeighingRecord
              key={index}
              onRecordSave={(record) => {
                updateWeight(
                  index, 
                  record.weight, 
                  record.breed, 
                  // Fixed: Use optional chaining to safely access notes property
                  record.notes
                );
              }}
              originLotId=""
              sourceLotName={`Animal ${index + 1}`}
              transferCriteria={[]}
              defaultBreed={selectedLot?.breed || 'nelore'}
            />
          ))}
        </div>
        
        <div className="mt-6">
          <Button 
            onClick={finishWeighing}
            className="w-full"
          >
            Complete Weighing Session
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
          
          {selectedLotId === 'new-lot' && (
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="New lot name"
                value={newLotName}
                onChange={(e) => setNewLotName(e.target.value)}
              />
              <Button 
                onClick={() => {
                  if (newLotName.trim()) {
                    const newLotId = handleCreateNewLot(newLotName);
                    setSelectedLotId(newLotId);
                    setNewLotName('');
                  }
                }}
                disabled={!newLotName.trim()}
              >
                Create
              </Button>
            </div>
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
              className="gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Weight Threshold
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
                {transferCriteria.map((criterion, index) => {
                  // Calculate the range display
                  let rangeDisplay = '';
                  if (index === 0) {
                    rangeDisplay = `≤ ${criterion.weightValue} kg`;
                  } else if (index === transferCriteria.length - 1) {
                    rangeDisplay = `> ${transferCriteria[index-1].weightValue} kg`;
                  } else {
                    rangeDisplay = `> ${transferCriteria[index-1].weightValue} kg and ≤ ${criterion.weightValue} kg`;
                  }
                  
                  return (
                    <div key={criterion.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5 text-sm">
                        {rangeDisplay}
                      </div>
                      <div className="col-span-2 text-center">→</div>
                      <div className="col-span-4">
                        <Select
                          value={criterion.destinationLotId}
                          onValueChange={(value) => handleCriterionChange(
                            criterion.id, 
                            'destinationLotId', 
                            value
                          )}
                        >
                          <SelectTrigger>
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
                        
                        {criterion.destinationLotId === 'create-new' && (
                          <div className="mt-2 flex gap-2">
                            <Input
                              placeholder="New lot name"
                              value={newLotName}
                              onChange={(e) => setNewLotName(e.target.value)}
                            />
                            <Button 
                              size="sm"
                              onClick={() => {
                                if (newLotName.trim()) {
                                  const newLotId = handleCreateNewLot(newLotName);
                                  handleCriterionChange(criterion.id, 'destinationLotId', newLotId);
                                  setNewLotName('');
                                }
                              }}
                              disabled={!newLotName.trim()}
                            >
                              Create
                            </Button>
                          </div>
                        )}
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
                      
                      {/* Weight threshold input */}
                      {index < transferCriteria.length - 1 ? (
                        <div className="col-span-12 flex gap-2 items-center mt-1">
                          <Label className="text-sm">Weight threshold:</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={criterion.weightValue || ''}
                            onChange={(e) => handleCriterionChange(
                              criterion.id, 
                              'weightValue', 
                              parseFloat(e.target.value) || 0
                            )}
                            placeholder="Weight (kg)"
                            className="w-32"
                          />
                          <span className="text-sm text-muted-foreground">kg</span>
                        </div>
                      ) : (
                        <div className="col-span-12">
                          <p className="text-xs text-muted-foreground mt-1">
                            All animals over {transferCriteria[index-1]?.weightValue || 0} kg will go to this lot
                          </p>
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
                  Animals will be automatically assigned to destination lots based on weight thresholds.
                  You can review and modify these assignments in the summary after weighing.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleStartWeighing}
          disabled={!selectedLotId || selectedLotId === 'new-lot' || !selectedLot}
          className="w-full"
        >
          Start Weighing
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WeighingManager;
