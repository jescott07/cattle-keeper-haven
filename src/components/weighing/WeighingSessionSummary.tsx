
import { useState } from 'react';
import { AnimalRecord } from './AnimalWeighingRecord';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ListFilter, Info, Edit, Check, X, Table, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BreedType } from '@/lib/types';

interface Animal {
  id: number;
  weight: number;
  breed: BreedType;
  notes?: string;
  isWeighed: boolean;
}

interface WeighingSessionSummaryProps {
  weights: number[];
  date: Date;
  onNewSession: () => void;
  totalAnimals?: number;
  isPartialWeighing?: boolean;
  animalBreeds?: BreedType[];
  animalNotes?: string[];
}

export function WeighingSessionSummary({ 
  weights, 
  date, 
  onNewSession, 
  totalAnimals = 0,
  isPartialWeighing = false,
  animalBreeds = [],
  animalNotes = []
}: WeighingSessionSummaryProps) {
  if (weights.length === 0) {
    return null;
  }
  
  // Calculate statistics
  const weighedAnimals = weights.length;
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const avgWeight = totalWeight / weighedAnimals;
  
  // Calculate non-weighed animals statistics
  const nonWeighedAnimals = totalAnimals ? totalAnimals - weighedAnimals : 0;
  const estimatedWeight = nonWeighedAnimals * avgWeight;
  const totalEstimatedWeight = totalWeight + estimatedWeight;
  const showPartialInfo = isPartialWeighing || (totalAnimals > 0 && weighedAnimals < totalAnimals);
  
  // Prepare animal data
  const [animals, setAnimals] = useState<Animal[]>(() => {
    const animalsList: Animal[] = [];
    
    // Add animals with recorded weights
    for (let i = 0; i < weights.length; i++) {
      animalsList.push({
        id: i,
        weight: weights[i],
        breed: animalBreeds[i] || 'nelore',
        notes: animalNotes?.[i] || '',
        isWeighed: true
      });
    }
    
    // Add animals without recorded weights (if partial weighing)
    if (totalAnimals && totalAnimals > weights.length) {
      for (let i = weights.length; i < totalAnimals; i++) {
        animalsList.push({
          id: i,
          weight: avgWeight, // Use average weight for non-weighed animals
          breed: 'nelore', // Default breed
          notes: 'Not weighed - using average weight',
          isWeighed: false
        });
      }
    }
    
    return animalsList;
  });
  
  // Track if we're in edit mode
  const [editMode, setEditMode] = useState(false);
  // Track which animal we're editing
  const [editingAnimalId, setEditingAnimalId] = useState<number | null>(null);
  // Values for the animal being edited
  const [editWeight, setEditWeight] = useState<string>('');
  const [editBreed, setEditBreed] = useState<BreedType>('nelore');
  const [showAnimalTable, setShowAnimalTable] = useState(true);
  
  // Calculate breed statistics
  const breedStats = animals.reduce((stats: Record<string, { count: number, totalWeight: number }>, animal) => {
    const breed = animal.breed;
    if (!stats[breed]) {
      stats[breed] = { count: 0, totalWeight: 0 };
    }
    stats[breed].count += 1;
    stats[breed].totalWeight += animal.weight;
    return stats;
  }, {});
  
  // Calculate average weight by breed
  const breedAverages = Object.entries(breedStats).map(([breed, { count, totalWeight }]) => ({
    breed,
    count,
    averageWeight: totalWeight / count
  }));
  
  const startEditing = (animal: Animal) => {
    setEditingAnimalId(animal.id);
    setEditWeight(animal.weight.toString());
    setEditBreed(animal.breed);
  };
  
  const saveEdit = () => {
    if (editingAnimalId === null) return;
    
    const updatedAnimals = animals.map(animal => {
      if (animal.id === editingAnimalId) {
        return {
          ...animal,
          weight: parseFloat(editWeight) || animal.weight,
          breed: editBreed,
          isWeighed: true, // Mark as weighed if edited
        };
      }
      return animal;
    });
    
    setAnimals(updatedAnimals);
    setEditingAnimalId(null);
    
    // Recalculate statistics after edit
    const weighedAnimalsList = updatedAnimals.filter(a => a.isWeighed);
    const newAvgWeight = weighedAnimalsList.reduce((sum, a) => sum + a.weight, 0) / weighedAnimalsList.length;
    
    // Update non-weighed animals with new average
    const finalAnimals = updatedAnimals.map(animal => {
      if (!animal.isWeighed) {
        return {
          ...animal,
          weight: newAvgWeight
        };
      }
      return animal;
    });
    
    setAnimals(finalAnimals);
  };
  
  const cancelEdit = () => {
    setEditingAnimalId(null);
  };
  
  // Recalculate summary statistics based on current animal data
  const recalculatedStats = animals.reduce(
    (stats, animal) => {
      stats.totalWeight += animal.weight;
      if (animal.isWeighed) {
        stats.weighedCount += 1;
        stats.weighedWeight += animal.weight;
      } else {
        stats.nonWeighedCount += 1;
        stats.estimatedWeight += animal.weight;
      }
      return stats;
    },
    { totalWeight: 0, weighedCount: 0, weighedWeight: 0, nonWeighedCount: 0, estimatedWeight: 0 }
  );
  
  const currentAvgWeight = recalculatedStats.weighedCount 
    ? recalculatedStats.weighedWeight / recalculatedStats.weighedCount 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ListFilter className="h-5 w-5" />
          Session Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General summary stats cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-accent/30 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Weighed Animals</p>
            <p className="text-2xl font-semibold">{recalculatedStats.weighedCount}</p>
            {showPartialInfo && totalAnimals > 0 && (
              <p className="text-xs text-muted-foreground">of {totalAnimals} total</p>
            )}
          </div>
          <div className="p-3 bg-accent/30 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Average Weight</p>
            <p className="text-2xl font-semibold">{currentAvgWeight.toFixed(1)} kg</p>
            <p className="text-xs text-muted-foreground">({(currentAvgWeight / 30).toFixed(2)} @)</p>
          </div>
          <div className="p-3 bg-accent/30 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Total Weight</p>
            <p className="text-2xl font-semibold">{recalculatedStats.totalWeight.toFixed(1)} kg</p>
          </div>
        </div>
        
        {/* Breed statistics */}
        <div className="border border-border rounded-md overflow-hidden">
          <div className="bg-muted/60 p-3 border-b border-border flex justify-between items-center">
            <h3 className="font-medium">Breed Statistics</h3>
          </div>
          <div className="divide-y divide-border">
            {breedAverages.map(({ breed, count, averageWeight }) => (
              <div key={breed} className="flex justify-between px-4 py-2">
                <span className="capitalize">{breed.replace('-', ' ')}</span>
                <div className="text-right">
                  <span className="font-medium">{count} animals</span>
                  <span className="text-muted-foreground text-sm ml-2">
                    (avg: {averageWeight.toFixed(1)} kg)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Partial weighing explanation */}
        {showPartialInfo && (
          <div className="bg-muted/50 p-4 rounded-md border border-border">
            <div className="flex gap-2 items-start mb-3">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <span className="font-medium">Partial weighing detected.</span> The system uses the average weight of measured animals 
                to estimate the weight of non-measured animals.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-2 bg-background/80 rounded border border-border text-center">
                <p className="text-xs text-muted-foreground">Non-weighed Animals</p>
                <p className="text-xl font-medium">{recalculatedStats.nonWeighedCount}</p>
              </div>
              <div className="p-2 bg-background/80 rounded border border-border text-center">
                <p className="text-xs text-muted-foreground">Estimated Additional Weight</p>
                <p className="text-xl font-medium">{recalculatedStats.estimatedWeight.toFixed(1)} kg</p>
              </div>
            </div>
            
            <div className="mt-4 p-2 bg-primary/10 rounded-md border border-primary/20 text-center">
              <p className="text-sm text-muted-foreground">Total Estimated Lot Weight</p>
              <p className="text-2xl font-semibold">{recalculatedStats.totalWeight.toFixed(1)} kg</p>
            </div>
          </div>
        )}
        
        {/* Animal-by-animal detailed table */}
        <div className="border border-border rounded-md overflow-hidden">
          <div 
            className="bg-muted/60 p-3 border-b border-border flex justify-between items-center cursor-pointer"
            onClick={() => setShowAnimalTable(!showAnimalTable)}
          >
            <div className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              <h3 className="font-medium">Animal Details</h3>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {showAnimalTable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          
          {showAnimalTable && (
            <>
              <div className="flex justify-end p-2 bg-background">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "Done Editing" : "Edit Weights"}
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/40">
                    <tr className="text-left">
                      <th className="px-4 py-2 font-medium text-sm">#</th>
                      <th className="px-4 py-2 font-medium text-sm">Weight (kg)</th>
                      <th className="px-4 py-2 font-medium text-sm">Breed</th>
                      <th className="px-4 py-2 font-medium text-sm">Status</th>
                      {editMode && <th className="px-4 py-2 font-medium text-sm">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {animals.map((animal, index) => (
                      <tr key={animal.id} className={`${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'} ${!animal.isWeighed ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
                        <td className="px-4 py-2 text-sm">Animal {animal.id + 1}</td>
                        
                        {editingAnimalId === animal.id ? (
                          <>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                value={editWeight}
                                onChange={(e) => setEditWeight(e.target.value)}
                                className="w-24 h-8 text-sm"
                                step="0.1"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Select 
                                value={editBreed} 
                                onValueChange={setEditBreed as (value: string) => void}
                              >
                                <SelectTrigger className="w-36 h-8 text-sm">
                                  <SelectValue placeholder="Select breed" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="nelore">Nelore</SelectItem>
                                  <SelectItem value="anelorada">Anelorada</SelectItem>
                                  <SelectItem value="cruzamento-industrial">Cruzamento Industrial</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {animal.isWeighed ? 'Weighed' : 'Estimated'}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={saveEdit}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={cancelEdit}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2 text-sm">
                              {animal.weight.toFixed(1)} kg
                              <span className="text-xs text-muted-foreground ml-1">
                                ({(animal.weight / 30).toFixed(2)} @)
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm capitalize">
                              {animal.breed.replace('-', ' ')}
                            </td>
                            <td className="px-4 py-2">
                              {animal.isWeighed ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                                  Weighed
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
                                  Estimated
                                </Badge>
                              )}
                            </td>
                            {editMode && (
                              <td className="px-4 py-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => startEditing(animal)}
                                  disabled={editingAnimalId !== null}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </td>
                            )}
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-center mt-6">
          <Button 
            onClick={onNewSession}
            className="px-4 py-2"
          >
            Start New Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
