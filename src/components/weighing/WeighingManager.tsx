
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
import { ArrowLeft, ArrowRight, Info, Plus, Trash, Syringe, Check } from 'lucide-react';
import { BreedType, HealthRecordType, ApplicationRoute } from '@/lib/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { TransferCriteria, TransferCriterion } from './TransferCriteria';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ManagerTransferCriterion {
  id: string;
  weightValue: number;
  destinationLotId: string;
  condition: 'greater-than' | 'less-than-or-equal';
}

interface DestinationLotData {
  count: number;
  totalWeight: number;
}

interface HealthRecord {
  enabled: boolean;
  type: HealthRecordType;
  title: string;
  description: string;
  applicationRoute?: ApplicationRoute;
  medicationId?: string;
  dosage?: number;
  dosageUnit?: string;
  technician?: string;
  notes?: string;
}

const WeighingManager = () => {
  const { toast } = useToast();
  const addLot = useStore((state) => state.addLot);
  const addWeighingRecord = useStore((state) => state.addWeighingRecord);
  const addHealthRecord = useStore((state) => state.addHealthRecord);
  const updateLot = useStore((state) => state.updateLot);
  const lots = useStore(state => state.lots);
  const inventory = useStore(state => state.inventory || []);
  const medicationItems = inventory.filter(item => item.type === 'medication');
  
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [transferCriteria, setTransferCriteria] = useState<ManagerTransferCriterion[]>([]);
  const [animalWeights, setAnimalWeights] = useState<number[]>([]);
  const [animalBreeds, setAnimalBreeds] = useState<BreedType[]>([]);
  const [animalNotes, setAnimalNotes] = useState<string[]>([]);
  const [animalDestinations, setAnimalDestinations] = useState<string[]>([]);
  const [animalHealthRecords, setAnimalHealthRecords] = useState<boolean[]>([]);
  const [currentAnimalIndex, setCurrentAnimalIndex] = useState<number>(0);
  const [showSummary, setShowSummary] = useState(false);
  const [newLotName, setNewLotName] = useState<string>('');
  const [isCreatingNewLot, setIsCreatingNewLot] = useState(false);
  const [isWeighing, setIsWeighing] = useState(false);
  const [creatingDestinationLot, setCreatingDestinationLot] = useState<string | null>(null);
  const [isNewLot, setIsNewLot] = useState(false);
  
  const [healthRecordConfig, setHealthRecordConfig] = useState<HealthRecord>({
    enabled: false,
    type: 'vaccination',
    title: '',
    description: '',
    applicationRoute: 'injection',
  });
  
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

  const handleCriteriaChange = (newCriteria: TransferCriterion[]) => {
    setTransferCriteria(newCriteria.map(criterion => ({
      id: criterion.id,
      weightValue: typeof criterion.weightValue === 'string' 
        ? parseFloat(criterion.weightValue) || 0
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
      name: lotName,
      numberOfAnimals: 0,
      source: "other",
      status: "active",
      purchaseDate: new Date(),
      currentPastureId: ""
    });
    
    toast({
      title: "Success",
      description: `New lot \"${lotName}\" created`
    });
    
    return newLotId;
  };
  
  const handleStartWeighing = () => {
    if (!selectedLot) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um lote para pesar",
        variant: "destructive",
      });
      return;
    }

    const isNewEmptyLot = selectedLot.numberOfAnimals === 0;
    setIsNewLot(isNewEmptyLot);

    if (isNewEmptyLot) {
      setAnimalWeights([0]);
      setAnimalBreeds([selectedLot?.breed || 'nelore']);
      setAnimalNotes(['']);
      setAnimalDestinations(['']);
      setAnimalHealthRecords([false]);
    } else {
      const weights = Array(selectedLot.numberOfAnimals).fill(0);
      const breeds = Array(selectedLot.numberOfAnimals).fill(selectedLot?.breed || 'nelore');
      const notes = Array(selectedLot.numberOfAnimals).fill('');
      const destinations = Array(selectedLot.numberOfAnimals).fill('');
      const healthRecords = Array(selectedLot.numberOfAnimals).fill(false);
      
      setAnimalWeights(weights);
      setAnimalBreeds(breeds);
      setAnimalNotes(notes);
      setAnimalDestinations(destinations);
      setAnimalHealthRecords(healthRecords);
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

  const toggleHealthRecord = () => {
    let newHealthRecords = [...animalHealthRecords];
    newHealthRecords[currentAnimalIndex] = !newHealthRecords[currentAnimalIndex];
    setAnimalHealthRecords(newHealthRecords);
  };
  
  const nextAnimal = () => {
    if (animalWeights[currentAnimalIndex] <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um peso válido antes de continuar",
        variant: "destructive",
      });
      return;
    }
    
    if (isNewLot) {
      setAnimalWeights([...animalWeights, 0]);
      setAnimalBreeds([...animalBreeds, selectedLot?.breed || 'nelore']);
      setAnimalNotes([...animalNotes, '']);
      setAnimalDestinations([...animalDestinations, '']);
      setAnimalHealthRecords([...animalHealthRecords, false]);
      setCurrentAnimalIndex(currentAnimalIndex + 1);
      return;
    }
    
    if (currentAnimalIndex === animalWeights.length - 1) {
      finishWeighing();
      return;
    }
    
    setCurrentAnimalIndex(currentAnimalIndex + 1);
  };
  
  const previousAnimal = () => {
    if (currentAnimalIndex > 0) {
      setCurrentAnimalIndex(currentAnimalIndex - 1);
    }
  };
  
  const skipAnimal = () => {
    if (isNewLot) {
      setAnimalWeights([...animalWeights, 0]);
      setAnimalBreeds([...animalBreeds, selectedLot?.breed || 'nelore']);
      setAnimalNotes([...animalNotes, '']);
      setAnimalDestinations([...animalDestinations, '']);
      setAnimalHealthRecords([...animalHealthRecords, false]);
      setCurrentAnimalIndex(currentAnimalIndex + 1);
    } else {
      if (currentAnimalIndex < animalWeights.length - 1) {
        setCurrentAnimalIndex(currentAnimalIndex + 1);
      } else {
        finishWeighing();
      }
    }
  };
  
  const finishWeighing = () => {
    if (!selectedLot) return;
    
    const validAnimalIndices = animalWeights
      .map((w, idx) => w > 0 ? idx : -1)
      .filter(idx => idx !== -1);
    
    if (validAnimalIndices.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum peso registrado",
        variant: "destructive",
      });
      return;
    }
    
    const validWeights = validAnimalIndices.map(idx => animalWeights[idx]);
    const validBreeds = validAnimalIndices.map(idx => animalBreeds[idx]);
    const validNotes = validAnimalIndices.map(idx => animalNotes[idx]);
    const validDestinations = validAnimalIndices.map(idx => animalDestinations[idx]);
    const validHealthRecords = validAnimalIndices.map(idx => animalHealthRecords[idx]);
    
    const avgWeight = validWeights.reduce((sum, w) => sum + w, 0) / validWeights.length;
    
    const destinationLots: Record<string, DestinationLotData> = {};
    
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
      notes: `Pesados ${validWeights.length} animais. Transferências registradas para ${Object.keys(destinationLots).filter(id => id && id !== selectedLotId).length} lotes de destino.`
    });
    
    if (healthRecordConfig.enabled && validHealthRecords.some(record => record)) {
      const animalsWithHealthRecord = validHealthRecords.filter(Boolean).length;
      
      if (animalsWithHealthRecord > 0) {
        addHealthRecord({
          lotId: selectedLotId,
          date: new Date(),
          type: healthRecordConfig.type,
          title: healthRecordConfig.title || `${healthRecordConfig.type === 'vaccination' ? 'Vacinação' : 'Medicação'} durante pesagem`,
          description: healthRecordConfig.description,
          applicationRoute: healthRecordConfig.applicationRoute,
          medicationId: healthRecordConfig.medicationId,
          dosage: healthRecordConfig.dosage,
          dosageUnit: healthRecordConfig.dosageUnit,
          appliedToAll: false,
          numberOfAnimals: animalsWithHealthRecord,
          technician: healthRecordConfig.technician,
          notes: healthRecordConfig.notes || `Registro de saúde durante sessão de pesagem em ${new Date().toLocaleDateString()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: 'pending',
          id: `health-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
        
        toast({
          title: "Sucesso",
          description: `Registro de saúde criado para ${animalsWithHealthRecord} animais`
        });
      }
    }
    
    Object.entries(destinationLots).forEach(([destLotId, data]) => {
      if (destLotId && destLotId !== selectedLotId) {
        addWeighingRecord({
          date: new Date(),
          lotId: destLotId,
          destinationLotId: selectedLotId,
          numberOfAnimals: data.count,
          totalWeight: data.totalWeight,
          averageWeight: data.totalWeight / data.count,
          notes: `Recebidos ${data.count} animais do lote ${selectedLot?.name}`
        });
        
        const destLot = lots.find(lot => lot.id === destLotId);
        if (destLot) {
          const currentCount = destLot.numberOfAnimals || 0;
          const currentTotalWeight = (destLot.averageWeight || 0) * currentCount;
          const newTotalWeight = currentTotalWeight + data.totalWeight;
          const newCount = currentCount + data.count;
          
          updateLot(destLotId, {
            numberOfAnimals: newCount,
            averageWeight: newTotalWeight / newCount
          });
        }
      }
    });
    
    if (isNewLot) {
      updateLot(selectedLotId, {
        numberOfAnimals: validWeights.length,
        averageWeight: avgWeight
      });
    } else {
      // Fixed: Properly destructuring the array elements in the reduce function
      const transferredAnimalsCount = Object.entries(destinationLots)
        .filter(([destId, _]) => destId !== selectedLotId && destId !== '')
        .reduce((sum, [_, data]) => sum + data.count, 0);
        
      const newAnimalCount = selectedLot.numberOfAnimals - transferredAnimalsCount;
      
      if (transferredAnimalsCount > 0) {
        // Fixed: Properly destructuring the array elements in the reduce function
        const remainingWeight = (selectedLot.averageWeight || 0) * selectedLot.numberOfAnimals - 
          Object.entries(destinationLots)
            .filter(([destId, _]) => destId !== selectedLotId && destId !== '')
            .reduce((sum, [_, data]) => sum + data.totalWeight, 0);
            
        const newAvgWeight = newAnimalCount > 0 ? remainingWeight / newAnimalCount : 0;
        
        updateLot(selectedLotId, {
          numberOfAnimals: Math.max(0, newAnimalCount),
          averageWeight: newAvgWeight
        });
      }
    }
    
    toast({
      title: "Sucesso",
      description: `Registro de pesagem criado para ${validWeights.length} animais`
    });
    
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
    setAnimalHealthRecords([]);
    setTransferCriteria([]);
    setShowSummary(false);
    setIsWeighing(false);
    setIsCreatingNewLot(false);
    setCurrentAnimalIndex(0);
    setIsNewLot(false);
    setHealthRecordConfig({
      enabled: false,
      type: 'vaccination',
      title: '',
      description: '',
      applicationRoute: 'injection',
    });
  };
  
  const activeLots = lots.filter(lot => lot.status === 'active');
  const selectedLot = selectedLotId ? lots.find(lot => lot.id === selectedLotId) : null;
  
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
    const currentHealthRecord = animalHealthRecords[currentAnimalIndex] || false;
    
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
              Voltar à Seleção de Lote
            </button>
            <Badge variant="outline">
              Animal {currentAnimalIndex + 1} de {isNewLot ? "∞" : animalWeights.length}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold">Registrar Peso</h1>
          <p className="text-muted-foreground">
            Registrando pesos para lote: {selectedLot?.name}
            {isNewLot && " (Novo lote - sessão continuará até ser encerrada manualmente)"}
          </p>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              placeholder="Digite o peso"
              value={currentWeight || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                updateWeight(value, currentBreed, currentNotes);
              }}
            />
          </div>
          
          <div>
            <Label htmlFor="breed">Raça</Label>
            <Select 
              value={currentBreed}
              onValueChange={(value) => {
                let newBreeds = [...animalBreeds];
                newBreeds[currentAnimalIndex] = value as BreedType;
                setAnimalBreeds(newBreeds);
              }}
            >
              <SelectTrigger id="breed">
                <SelectValue placeholder="Selecione a raça" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nelore">Nelore</SelectItem>
                <SelectItem value="anelorada">Anelorada</SelectItem>
                <SelectItem value="cruzamento-industrial">Cruzamento Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="notes">Observações (Opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Quaisquer observações adicionais para este animal"
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
              <Label>Destino da Transferência</Label>
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
                        ? `Peso > ${matchingCriterion.weightValue}kg`
                        : `Peso ≤ ${matchingCriterion.weightValue}kg`}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground mt-1">
                  Animal permanecerá no lote atual
                </div>
              )}
            </div>
          )}
          
          {healthRecordConfig.enabled && (
            <div className="border p-3 rounded-md bg-muted/30">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox 
                  id="health-record" 
                  checked={currentHealthRecord}
                  onCheckedChange={toggleHealthRecord}
                />
                <Label htmlFor="health-record" className="flex items-center gap-1 cursor-pointer">
                  <Syringe className="h-4 w-4 text-primary" />
                  {healthRecordConfig.type === 'vaccination' ? 'Vacinar' : 'Medicar'} este animal
                </Label>
              </div>
              
              {currentHealthRecord && (
                <p className="text-xs text-muted-foreground">
                  {healthRecordConfig.title || `${healthRecordConfig.type === 'vaccination' ? 'Vacinação' : 'Medicação'} a ser aplicada`}
                  {healthRecordConfig.medicationId && ` - ID: ${healthRecordConfig.medicationId}`}
                </p>
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
              Anterior
            </Button>
            <Button 
              onClick={nextAnimal}
              disabled={currentWeight <= 0}
              className="flex items-center justify-center"
            >
              Próximo
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={skipAnimal}
            variant="ghost"
            className="w-full"
          >
            Pular Animal
          </Button>
          <Button 
            onClick={finishWeighing} 
            variant="secondary"
            className="w-full"
            disabled={validWeights.length === 0}
          >
            Finalizar Sessão
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Sessão de Pesagem</CardTitle>
        <CardDescription>
          Pese e transfira animais para novos lotes com base em critérios de peso
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="lotId">Selecione o Lote para Pesar</Label>
          {isCreatingNewLot ? (
            <div className="flex gap-2">
              <Input
                placeholder="Nome do novo lote"
                value={newLotName}
                onChange={(e) => setNewLotName(e.target.value)}
                autoFocus
              />
              <Button 
                onClick={handleCreateNewLot}
                disabled={!newLotName.trim()}
              >
                Criar
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsCreatingNewLot(false);
                  setNewLotName('');
                }}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Select onValueChange={handleSelectLot} value={selectedLotId}>
              <SelectTrigger id="lotId">
                <SelectValue placeholder="Selecione um lote" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-lot">Criar novo lote</SelectItem>
                {activeLots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.name} ({lot.numberOfAnimals} animais)
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
        
        <div className="border rounded-md p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enable-health-record" 
              checked={healthRecordConfig.enabled}
              onCheckedChange={(checked) => {
                setHealthRecordConfig({
                  ...healthRecordConfig,
                  enabled: checked === true
                });
              }}
            />
            <Label 
              htmlFor="enable-health-record" 
              className="font-medium cursor-pointer flex items-center gap-2"
            >
              <Syringe className="h-5 w-5 text-primary" />
              Registrar saúde durante pesagem
            </Label>
          </div>
          
          {healthRecordConfig.enabled && (
            <div className="space-y-4 pl-6 mt-2 animate-fade-in">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="health-type">Tipo</Label>
                  <Select 
                    value={healthRecordConfig.type}
                    onValueChange={(value) => setHealthRecordConfig({
                      ...healthRecordConfig,
                      type: value as HealthRecordType
                    })}
                  >
                    <SelectTrigger id="health-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vaccination">Vacinação</SelectItem>
                      <SelectItem value="medication">Medicação</SelectItem>
                      <SelectItem value="examination">Exame</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="application-route">Via de Aplicação</Label>
                  <Select 
                    value={healthRecordConfig.applicationRoute}
                    onValueChange={(value) => setHealthRecordConfig({
                      ...healthRecordConfig,
                      applicationRoute: value as ApplicationRoute
                    })}
                  >
                    <SelectTrigger id="application-route">
                      <SelectValue placeholder="Selecione a via" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oral">Oral</SelectItem>
                      <SelectItem value="injection">Injeção</SelectItem>
                      <SelectItem value="topical">Tópica</SelectItem>
                      <SelectItem value="intravenous">Intravenosa</SelectItem>
                      <SelectItem value="other">Outra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="health-title">Título</Label>
                <Input 
                  id="health-title"
                  placeholder={`${healthRecordConfig.type === 'vaccination' ? 'Vacinação' : 'Medicação'} durante pesagem`}
                  value={healthRecordConfig.title}
                  onChange={(e) => setHealthRecordConfig({
                    ...healthRecordConfig,
                    title: e.target.value
                  })}
                />
              </div>
              
              {(healthRecordConfig.type === 'vaccination' || healthRecordConfig.type === 'medication') && (
                <div className="space-y-2">
                  <Label htmlFor="medication">Medicamento</Label>
                  <Select 
                    value={healthRecordConfig.medicationId}
                    onValueChange={(value) => setHealthRecordConfig({
                      ...healthRecordConfig,
                      medicationId: value
                    })}
                  >
                    <SelectTrigger id="medication">
                      <SelectValue placeholder="Selecione um medicamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicationItems.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nenhum medicamento cadastrado
                        </SelectItem>
                      ) : medicationItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosagem</Label>
                  <Input 
                    id="dosage"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Quantidade"
                    value={healthRecordConfig.dosage || ''}
                    onChange={(e) => setHealthRecordConfig({
                      ...healthRecordConfig,
                      dosage: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dosage-unit">Unidade</Label>
                  <Input 
                    id="dosage-unit"
                    placeholder="ml, mg, etc."
                    value={healthRecordConfig.dosageUnit || ''}
                    onChange={(e) => setHealthRecordConfig({
                      ...healthRecordConfig,
                      dosageUnit: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="technician">Responsável/Técnico</Label>
                <Input 
                  id="technician"
                  placeholder="Nome do responsável"
                  value={healthRecordConfig.technician || ''}
                  onChange={(e) => setHealthRecordConfig({
                    ...healthRecordConfig,
                    technician: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="health-notes">Observações</Label>
                <Textarea 
                  id="health-notes"
                  placeholder="Observações adicionais"
                  value={healthRecordConfig.notes || ''}
                  onChange={(e) => setHealthRecordConfig({
                    ...healthRecordConfig,
                    notes: e.target.value
                  })}
                />
              </div>
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleStartWeighing}
          className="w-full mt-4"
          disabled={!selectedLotId}
        >
          Iniciar Sessão de Pesagem
        </Button>
      </CardContent>
    </Card>
  );
};

export default WeighingManager;
