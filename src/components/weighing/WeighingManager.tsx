import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransferCriteria, TransferCriterion } from './TransferCriteria';
import { AnimalWeighingRecord, AnimalRecord } from './AnimalWeighingRecord';
import { WeighingSessionSummary } from './WeighingSessionSummary';
import { Calendar, Weight, Check, FileText, Save } from 'lucide-react';
import { format } from 'date-fns';

export function WeighingManager() {
  const { toast } = useToast();
  const lots = useStore(state => state.lots);
  const addLot = useStore(state => state.addLot);
  const addWeighingRecord = useStore(state => state.addWeighingRecord);
  const updateLot = useStore(state => state.updateLot);

  const [activeTab, setActiveTab] = useState('setup');
  const [selectedLotId, setSelectedLotId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [transferCriteria, setTransferCriteria] = useState<TransferCriterion[]>([]);
  const [animalRecords, setAnimalRecords] = useState<AnimalRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);

  // Create a mapping of lot IDs to lot names for easier lookup
  const lotMap = new Map<string, string>();
  lots.forEach(lot => lotMap.set(lot.id, lot.name));

  // Get selected lot
  const selectedLot = lots.find(lot => lot.id === selectedLotId);

  const handleAddLot = (lotName: string) => {
    const now = new Date();
    addLot({
      name: lotName,
      numberOfAnimals: 0,
      source: 'other',
      status: 'active',
      purchaseDate: now,
      currentPastureId: '',
    });
    
    toast({
      title: 'Lot Created',
      description: `Lot "${lotName}" has been created`,
    });
  };

  const handleRecordAnimal = (record: AnimalRecord) => {
    setAnimalRecords([...animalRecords, record]);
    
    toast({
      description: `Animal recorded: ${record.weight} kg (${record.weightAt30} @)`,
    });
  };

  const handleFinishSession = () => {
    setIsSubmitting(true);
    
    try {
      // Group records by lot for bulk updates
      const lotUpdates = new Map<string, number>();
      
      animalRecords.forEach(record => {
        // Count animals in each destination lot
        const count = lotUpdates.get(record.destinationLotId) || 0;
        lotUpdates.set(record.destinationLotId, count + 1);
        
        // Add individual weighing record to store
        addWeighingRecord({
          date: new Date(date),
          lotId: record.originLotId,
          numberOfAnimals: 1,
          totalWeight: record.weight,
          averageWeight: record.weight,
          destinationLotId: record.destinationLotId !== record.originLotId 
            ? record.destinationLotId 
            : undefined,
          notes: `Breed: ${record.breed}${record.observations ? ` | ${record.observations}` : ''}`
        });
      });
      
      // Update lot counts based on transfers
      if (selectedLot) {
        // Calculate the number of animals remaining in the original lot
        const remainingInOrigin = animalRecords.filter(
          r => r.destinationLotId === r.originLotId
        ).length;
        
        // If we're transferring all animals out, keep the original count
        // Otherwise adjust to the number staying
        if (remainingInOrigin > 0) {
          updateLot(selectedLotId, {
            numberOfAnimals: remainingInOrigin,
          });
        }
        
        // Update destination lots
        lotUpdates.forEach((count, lotId) => {
          if (lotId !== selectedLotId) {
            const destLot = lots.find(lot => lot.id === lotId);
            if (destLot) {
              updateLot(lotId, {
                numberOfAnimals: destLot.numberOfAnimals + count,
              });
            }
          }
        });
      }
      
      toast({
        title: 'Session Complete',
        description: `${animalRecords.length} animals processed successfully`,
      });
      
      setSessionFinished(true);
    } catch (error) {
      console.error('Error saving weighing session:', error);
      toast({
        title: 'Error',
        description: 'Failed to save weighing session',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setActiveTab('setup');
    setSelectedLotId('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTransferCriteria([]);
    setAnimalRecords([]);
    setSessionFinished(false);
  };

  // Start a new session when setup is complete
  const handleStartSession = () => {
    if (!selectedLotId) {
      toast({
        title: 'Missing Information',
        description: 'Please select a lot to continue',
        variant: 'destructive',
      });
      return;
    }
    
    setActiveTab('weighing');
  };

  // For the results tab to be enabled
  const canViewResults = animalRecords.length > 0;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="setup" disabled={sessionFinished}>Setup</TabsTrigger>
          <TabsTrigger value="weighing" disabled={!selectedLotId || sessionFinished}>Weighing</TabsTrigger>
          <TabsTrigger value="results" disabled={!canViewResults}>Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Weight className="h-5 w-5" />
                Session Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lot">Source Lot</Label>
                  <Select onValueChange={setSelectedLotId} value={selectedLotId}>
                    <SelectTrigger id="lot">
                      <SelectValue placeholder="Select a lot" />
                    </SelectTrigger>
                    <SelectContent>
                      {lots.map((lot) => (
                        <SelectItem key={lot.id} value={lot.id}>
                          {lot.name} ({lot.numberOfAnimals} animals)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
              
              <TransferCriteria
                criteria={transferCriteria}
                onChange={setTransferCriteria}
                availableLots={lots}
                onCreateLot={handleAddLot}
              />
              
              <Button 
                className="w-full mt-4"
                onClick={handleStartSession}
                disabled={!selectedLotId}
              >
                Start Weighing Session
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weighing">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Record Animals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <AnimalWeighingRecord
                    onRecordSave={handleRecordAnimal}
                    originLotId={selectedLotId}
                    sourceLotName={selectedLot?.name || ''}
                    transferCriteria={transferCriteria}
                    defaultBreed={selectedLot?.breed as BreedType || 'nelore'}
                  />
                </div>
                
                <div>
                  <WeighingSessionSummary
                    records={animalRecords}
                    lots={lotMap}
                  />
                  
                  {animalRecords.length > 0 && (
                    <Button 
                      className="w-full mt-4 gap-2"
                      onClick={handleFinishSession}
                      disabled={isSubmitting}
                    >
                      <Save className="h-4 w-4" />
                      Finish Session & Save
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Check className="h-5 w-5" />
                Session Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <WeighingSessionSummary
                  records={animalRecords}
                  lots={lotMap}
                />
                
                <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-700">
                  <p className="font-medium">Weighing session saved successfully!</p>
                  <p className="text-sm mt-1">All animal records and lot transfers have been processed.</p>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleReset}
                >
                  Start New Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
