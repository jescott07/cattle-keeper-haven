
import { useState } from 'react';
import { ArrowRight, Check, Edit2, Save } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { BreedType, Lot } from '@/lib/types';

interface TransferCriterion {
  id: string;
  weightValue: number;
  destinationLotId: string;
}

interface WeighingSessionSummaryProps {
  weights: number[];
  date: Date;
  onNewSession: () => void;
  totalAnimals: number;
  isPartialWeighing: boolean;
  animalBreeds: BreedType[];
  animalNotes: string[];
  animalDestinations?: string[];
  transferCriteria?: TransferCriterion[];
  lots?: Lot[];
}

interface AnimalRecord {
  index: number;
  weight: number;
  isEstimated: boolean;
  breed: BreedType;
  notes: string;
  isEditing: boolean;
  destinationLotId?: string;
}

export function WeighingSessionSummary({ 
  weights, 
  date, 
  onNewSession, 
  totalAnimals, 
  isPartialWeighing,
  animalBreeds,
  animalNotes,
  animalDestinations = [],
  transferCriteria = [],
  lots = []
}: WeighingSessionSummaryProps) {
  // Calculate statistics
  const validWeights = weights.filter(w => w > 0);
  const weighedCount = validWeights.length;
  const estimatedCount = totalAnimals - weighedCount;
  const totalWeight = validWeights.reduce((sum, w) => sum + w, 0);
  const averageWeight = weighedCount > 0 ? totalWeight / weighedCount : 0;
  const estimatedTotalWeight = totalWeight + (estimatedCount * averageWeight);
  
  // Calculate per-breed statistics
  const breedStats: Record<string, {
    count: number,
    totalWeight: number,
    averageWeight: number
  }> = {};
  
  for (let i = 0; i < validWeights.length; i++) {
    const breed = animalBreeds[i] || 'nelore';
    if (!breedStats[breed]) {
      breedStats[breed] = { count: 0, totalWeight: 0, averageWeight: 0 };
    }
    breedStats[breed].count++;
    breedStats[breed].totalWeight += validWeights[i];
  }
  
  Object.keys(breedStats).forEach(breed => {
    breedStats[breed].averageWeight = breedStats[breed].totalWeight / breedStats[breed].count;
  });
  
  // Calculate destination statistics
  const destinationStats: Record<string, {
    count: number,
    totalWeight: number,
    averageWeight: number
  }> = {};
  
  if (animalDestinations && animalDestinations.length > 0) {
    for (let i = 0; i < weights.length; i++) {
      const destinationId = animalDestinations[i] || '';
      const weight = weights[i] > 0 ? weights[i] : averageWeight; // Use actual or average weight
      
      if (!destinationStats[destinationId]) {
        destinationStats[destinationId] = { count: 0, totalWeight: 0, averageWeight: 0 };
      }
      
      destinationStats[destinationId].count++;
      destinationStats[destinationId].totalWeight += weight;
    }
    
    Object.keys(destinationStats).forEach(dest => {
      destinationStats[dest].averageWeight = destinationStats[dest].totalWeight / destinationStats[dest].count;
    });
  }
  
  // Initialize animal records for the table
  const initialAnimalRecords: AnimalRecord[] = [];
  for (let i = 0; i < totalAnimals; i++) {
    const isRecordedWeight = i < weights.length && weights[i] > 0;
    
    initialAnimalRecords.push({
      index: i,
      weight: isRecordedWeight ? weights[i] : averageWeight,
      isEstimated: !isRecordedWeight,
      breed: animalBreeds[i] || 'nelore',
      notes: animalNotes[i] || '',
      isEditing: false,
      destinationLotId: animalDestinations[i] || ''
    });
  }
  
  const [animalRecords, setAnimalRecords] = useState<AnimalRecord[]>(initialAnimalRecords);
  
  const handleEditWeight = (index: number) => {
    setAnimalRecords(records => 
      records.map((record, i) => 
        i === index ? { ...record, isEditing: true } : record
      )
    );
  };
  
  const handleSaveWeight = (index: number, newWeight: number) => {
    setAnimalRecords(records => 
      records.map((record, i) => 
        i === index ? { ...record, weight: newWeight, isEstimated: false, isEditing: false } : record
      )
    );
    
    // Recalculate average and update estimated weights
    const newRecords = [...animalRecords];
    newRecords[index].weight = newWeight;
    newRecords[index].isEstimated = false;
    newRecords[index].isEditing = false;
    
    const newValidWeights = newRecords.filter(r => !r.isEstimated).map(r => r.weight);
    const newAverage = newValidWeights.reduce((sum, w) => sum + w, 0) / newValidWeights.length;
    
    // Update all estimated weights with new average
    const finalRecords = newRecords.map(record => 
      record.isEstimated ? { ...record, weight: newAverage } : record
    );
    
    setAnimalRecords(finalRecords);
  };
  
  const getDestinationLotName = (lotId: string) => {
    if (!lotId) return 'Current lot';
    const lot = lots.find(l => l.id === lotId);
    return lot ? lot.name : 'Unknown lot';
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weighing Session Summary</span>
          <Badge variant="outline">
            {format(date, 'PPP')}
          </Badge>
        </CardTitle>
        <CardDescription>
          {weighedCount} animals weighed ({(weighedCount / totalAnimals * 100).toFixed(1)}% of total)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Session statistics */}
        <div className="bg-muted p-4 rounded-md space-y-3">
          <h3 className="font-medium text-base">Session Statistics</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Animals</p>
              <p className="text-lg font-semibold">{totalAnimals}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Weighed</p>
              <p className="text-lg font-semibold">{weighedCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated</p>
              <p className="text-lg font-semibold">{estimatedCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Weight</p>
              <p className="text-lg font-semibold">{averageWeight.toFixed(1)} kg</p>
            </div>
          </div>
          
          <div className="border-t border-border pt-2 mt-2">
            <p className="text-sm text-muted-foreground mb-2">Average Weight by Breed</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(breedStats).map(([breed, stats]) => (
                <div key={breed} className="flex justify-between">
                  <span className="capitalize">{breed.replace('-', ' ')}</span>
                  <span>
                    {stats.averageWeight.toFixed(1)} kg ({stats.count} animals)
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Transfer summary */}
          {Object.keys(destinationStats).length > 1 && (
            <div className="border-t border-border pt-2 mt-2">
              <p className="text-sm text-muted-foreground mb-2">Transfers</p>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(destinationStats).map(([destId, stats]) => (
                  <div key={destId} className="flex justify-between">
                    <span>{getDestinationLotName(destId)}</span>
                    <span>
                      {stats.count} animals ({stats.averageWeight.toFixed(1)} kg avg)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Animal records table */}
        <div>
          <h3 className="font-medium text-base mb-3">Animal Records</h3>
          
          <div className="border rounded-md">
            <Table>
              <TableCaption>
                All animals in this weighing session
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Status</TableHead>
                  {animalDestinations.length > 0 && (
                    <TableHead>Transfer</TableHead>
                  )}
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animalRecords.map((animal) => (
                  <TableRow key={animal.index}>
                    <TableCell className="font-medium">
                      {animal.index + 1}
                    </TableCell>
                    <TableCell>
                      {animal.isEditing ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            className="w-24"
                            defaultValue={animal.weight}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const value = parseFloat((e.target as HTMLInputElement).value);
                                if (!isNaN(value) && value > 0) {
                                  handleSaveWeight(animal.index, value);
                                }
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const input = document.querySelector(
                                `input[type="number"][value="${animal.weight}"]`
                              ) as HTMLInputElement;
                              const value = parseFloat(input.value);
                              if (!isNaN(value) && value > 0) {
                                handleSaveWeight(animal.index, value);
                              }
                            }}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span>
                          {animal.weight.toFixed(1)}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({(animal.weight / 30).toFixed(2)} @)
                          </span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">
                      {animal.breed.replace('-', ' ')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={animal.isEstimated ? "outline" : "default"}>
                        {animal.isEstimated ? "Estimated" : "Weighed"}
                      </Badge>
                    </TableCell>
                    {animalDestinations.length > 0 && (
                      <TableCell>
                        {animal.destinationLotId ? (
                          <div className="flex items-center">
                            <ArrowRight className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{getDestinationLotName(animal.destinationLotId)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No transfer</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {animal.notes ? animal.notes : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!animal.isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditWeight(animal.index)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={onNewSession}
          className="w-full gap-2"
        >
          <Check className="h-4 w-4" />
          Start New Session
        </Button>
      </CardFooter>
    </Card>
  );
}
