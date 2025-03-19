
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
import TransferCriteria from './TransferCriteria';
import AnimalWeighingRecord from './AnimalWeighingRecord';
import WeighingSessionSummary from './WeighingSessionSummary';

const WeighingManager = () => {
  const { toast } = useToast();
  const addLot = useStore((state) => state.addLot);
  const addWeighingRecord = useStore((state) => state.addWeighingRecord);
  const [activeTab, setActiveTab] = useState<'weighing' | 'transfer'>('weighing');
  const [numberOfAnimals, setNumberOfAnimals] = useState(0);
  const [animalWeights, setAnimalWeights] = useState<number[]>([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [lotName, setLotName] = useState('');
  
  // Create a new lot from the weighing if needed
  const createNewLot = () => {
    if (!lotName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for the new lot",
        variant: "destructive",
      });
      return;
    }
    
    const newLot = {
      name: lotName,
      numberOfAnimals: animalWeights.length,
      source: "other" as const,
      status: "active" as const,
      purchaseDate: new Date(),
      currentPastureId: "",
      plannedTransfers: []
    };
    
    addLot(newLot);
    
    toast({
      title: "Success",
      description: `New lot "${lotName}" created with ${animalWeights.length} animals`,
    });
  };
  
  // Record the weighing session
  const recordWeighing = () => {
    if (animalWeights.length === 0) {
      toast({
        title: "Error",
        description: "No weights recorded",
        variant: "destructive",
      });
      return;
    }
    
    const totalWeight = animalWeights.reduce((sum, weight) => sum + weight, 0);
    const averageWeight = totalWeight / animalWeights.length;
    
    const weighingRecord = {
      date: new Date(),
      lotId: "", // This would be selected in a real app
      numberOfAnimals: animalWeights.length,
      totalWeight,
      averageWeight,
      destinationLotId: selectedDestinationId || undefined,
      notes: `Weighed ${animalWeights.length} animals`
    };
    
    addWeighingRecord(weighingRecord);
    
    toast({
      title: "Success",
      description: `Weighing record created for ${animalWeights.length} animals`,
    });
    
    // Show summary after recording
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
    
    // Initialize the array with zeros
    setAnimalWeights(Array(numberOfAnimals).fill(0));
  };
  
  const updateWeight = (index: number, weight: number) => {
    const newWeights = [...animalWeights];
    newWeights[index] = weight;
    setAnimalWeights(newWeights);
  };
  
  const resetWeighing = () => {
    setAnimalWeights([]);
    setNumberOfAnimals(0);
    setSelectedDestinationId('');
    setShowSummary(false);
    setLotName('');
  };
  
  // If showing summary, render the summary component
  if (showSummary) {
    return (
      <WeighingSessionSummary 
        weights={animalWeights}
        date={new Date()}
        onNewSession={resetWeighing}
      />
    );
  }
  
  // If the weights array is initialized but not all weights are entered yet
  if (animalWeights.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Weighing Session</h2>
          <Button variant="outline" onClick={resetWeighing}>Cancel</Button>
        </div>
        
        <div className="grid gap-4 mb-8">
          {animalWeights.map((weight, index) => (
            <AnimalWeighingRecord
              key={index}
              animalNumber={index + 1}
              weight={weight}
              onChange={(newWeight) => updateWeight(index, newWeight)}
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
  
  // Initial state: setup the weighing session
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
            <Label htmlFor="animals">Number of Animals</Label>
            <Input
              id="animals"
              type="number"
              min="1"
              value={numberOfAnimals || ''}
              onChange={(e) => setNumberOfAnimals(parseInt(e.target.value) || 0)}
              placeholder="Enter number of animals"
            />
          </div>
          
          {activeTab === 'transfer' && (
            <TransferCriteria 
              onDestinationSelected={setSelectedDestinationId}
            />
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleStartWeighing}
          disabled={numberOfAnimals <= 0}
          className="w-full"
        >
          Start Weighing
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WeighingManager;
