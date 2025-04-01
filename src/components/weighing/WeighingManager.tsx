
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { addDays, format } from 'date-fns';
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
import { useToast } from '@/hooks/use-toast';
import { TransferCriteria, TransferCriterion } from './TransferCriteria';
import { AnimalWeighingRecord } from './AnimalWeighingRecord';
import { WeighingSessionSummary } from './WeighingSessionSummary';
import { Info } from 'lucide-react';

const WeighingManager = () => {
  const { toast } = useToast();
  const addLot = useStore((state) => state.addLot);
  const addWeighingRecord = useStore((state) => state.addWeighingRecord);
  const [activeTab, setActiveTab] = useState<'weighing' | 'transfer'>('weighing');
  const [numberOfAnimals, setNumberOfAnimals] = useState(0);
  const [actualNumToWeigh, setActualNumToWeigh] = useState(0);
  const [animalWeights, setAnimalWeights] = useState<number[]>([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [lotName, setLotName] = useState('');
  const lots = useStore(state => state.lots);
  const [transferCriteria, setTransferCriteria] = useState<TransferCriterion[]>([]);
  
  const createNewLot = () => {
    if (!lotName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for the new lot",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate average weight for measured animals
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
    
    const newLot = {
      name: lotName,
      numberOfAnimals: numberOfAnimals,
      averageWeight: avgWeight,
      source: "other" as const,
      status: "active" as const,
      purchaseDate: new Date(),
      currentPastureId: "",
      plannedTransfers: []
    };
    
    addLot(newLot);
    
    toast({
      title: "Success",
      description: `New lot "${lotName}" created with ${numberOfAnimals} animals`,
    });
  };
  
  const recordWeighing = () => {
    // Calculate average weight for measured animals
    const validWeights = animalWeights.filter(w => w > 0);
    if (validWeights.length === 0) {
      toast({
        title: "Error",
        description: "No weights recorded",
        variant: "destructive",
      });
      return;
    }
    
    const totalWeight = validWeights.reduce((sum, weight) => sum + weight, 0);
    const avgWeight = totalWeight / validWeights.length;
    
    // Calculate total estimated weight
    const nonWeighedAnimals = numberOfAnimals - validWeights.length;
    const estimatedAdditionalWeight = nonWeighedAnimals * avgWeight;
    const totalEstimatedWeight = totalWeight + estimatedAdditionalWeight;
    
    const weighingRecord = {
      date: new Date(),
      lotId: "", // This would be selected in a real app
      numberOfAnimals: numberOfAnimals,
      totalWeight: totalEstimatedWeight,
      averageWeight: avgWeight,
      destinationLotId: selectedDestinationId || undefined,
      notes: `Weighed ${validWeights.length} animals. ${nonWeighedAnimals > 0 ? `${nonWeighedAnimals} animals estimated at average weight.` : ''}`
    };
    
    addWeighingRecord(weighingRecord);
    
    toast({
      title: "Success",
      description: `Weighing record created for ${validWeights.length} animals${nonWeighedAnimals > 0 ? `, with ${nonWeighedAnimals} animals estimated at average weight` : ''}`,
    });
    
    setShowSummary(true);
  };
  
  const handleStartWeighing = () => {
    if (numberOfAnimals <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number of animals",
        variant: "destructive",
      });
      return;
    }
    
    // Ask how many animals will actually be weighed
    setActualNumToWeigh(numberOfAnimals);
    
    // Initialize weights array based on how many will be weighed
    setAnimalWeights(Array(actualNumToWeigh).fill(0));
  };
  
  const updateWeight = (index: number, weight: number) => {
    const newWeights = [...animalWeights];
    newWeights[index] = weight;
    setAnimalWeights(newWeights);
  };
  
  const resetWeighing = () => {
    setAnimalWeights([]);
    setNumberOfAnimals(0);
    setActualNumToWeigh(0);
    setSelectedDestinationId('');
    setShowSummary(false);
    setLotName('');
  };
  
  const handleCreateLot = (name: string) => {
    const newLotId = `lot-${Date.now()}`;
    return newLotId;
  };
  
  if (showSummary) {
    return (
      <WeighingSessionSummary 
        weights={animalWeights.filter(w => w > 0)}
        date={new Date()}
        onNewSession={resetWeighing}
        totalAnimals={numberOfAnimals}
        isPartialWeighing={animalWeights.filter(w => w > 0).length < numberOfAnimals}
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
            Recording weights for {actualNumToWeigh} of {numberOfAnimals} animals
          </p>
          <Badge variant="outline" className="ml-2">
            {validWeights.length} of {actualNumToWeigh} weighed
          </Badge>
        </div>
        
        <div className="grid gap-4 mb-8">
          {animalWeights.map((weight, index) => (
            <AnimalWeighingRecord
              key={index}
              onRecordSave={(record) => {
                updateWeight(index, record.weight);
              }}
              originLotId=""
              sourceLotName={`Animal ${index + 1}`}
              transferCriteria={transferCriteria}
              defaultBreed="nelore"
            />
          ))}
        </div>
        
        <div className="mt-6 flex gap-4 items-center">
          <Button 
            onClick={recordWeighing}
            className="w-full"
          >
            Record Weighing
          </Button>
          
          {activeTab === 'transfer' && (
            <Button 
              onClick={createNewLot}
              variant="outline"
              className="w-full"
              disabled={!lotName.trim()}
            >
              Create New Lot
            </Button>
          )}
        </div>
        
        {activeTab === 'transfer' && (
          <div className="mt-4">
            <Label htmlFor="lot-name">New Lot Name</Label>
            <Input
              id="lot-name"
              value={lotName}
              onChange={(e) => setLotName(e.target.value)}
              placeholder="Enter lot name"
              className="mt-1"
            />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Weighing Session</CardTitle>
        <CardDescription>
          {activeTab === 'weighing' 
            ? 'Record weights for a group of animals'
            : 'Weigh and transfer animals to a new lot'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4 bg-muted rounded-md p-1">
          <Button
            variant={activeTab === 'weighing' ? 'default' : 'ghost'}
            className="flex-1 rounded-sm"
            onClick={() => setActiveTab('weighing')}
          >
            Simple Weighing
          </Button>
          <Button
            variant={activeTab === 'transfer' ? 'default' : 'ghost'}
            className="flex-1 rounded-sm"
            onClick={() => setActiveTab('transfer')}
          >
            Transfer
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totalAnimals">Total Number of Animals in Lot</Label>
            <Input
              id="totalAnimals"
              type="number"
              min="1"
              value={numberOfAnimals || ''}
              onChange={(e) => setNumberOfAnimals(parseInt(e.target.value) || 0)}
              placeholder="Enter total number of animals"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="animalsToWeigh">Number of Animals to Weigh</Label>
            <Input
              id="animalsToWeigh"
              type="number"
              min="1"
              max={numberOfAnimals || 1}
              value={actualNumToWeigh || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setActualNumToWeigh(Math.min(value, numberOfAnimals));
              }}
              placeholder="Enter number of animals to weigh"
              disabled={!numberOfAnimals}
            />
            {numberOfAnimals > 0 && actualNumToWeigh < numberOfAnimals && actualNumToWeigh > 0 && (
              <div className="flex items-start gap-2 mt-2 p-3 bg-muted rounded-md text-sm">
                <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  You'll weigh {actualNumToWeigh} of {numberOfAnimals} animals. 
                  The system will estimate the weight of the remaining {numberOfAnimals - actualNumToWeigh} animals 
                  using the average weight of measured animals.
                </p>
              </div>
            )}
          </div>
          
          {activeTab === 'transfer' && (
            <TransferCriteria 
              criteria={transferCriteria}
              onChange={setTransferCriteria}
              availableLots={lots}
              onCreateLot={handleCreateLot}
            />
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleStartWeighing}
          disabled={numberOfAnimals <= 0 || actualNumToWeigh <= 0}
          className="w-full"
        >
          Start Weighing
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WeighingManager;
