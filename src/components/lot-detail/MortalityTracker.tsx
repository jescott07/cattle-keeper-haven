
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Skull, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { BreedType } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MortalityTrackerProps {
  lotId: string;
  onMortalityAdded?: () => void;
}

type MortalityCause = 'disease' | 'injury' | 'predator' | 'unknown' | 'other';

interface MortalityRecord {
  id: string;
  lotId: string;
  date: Date;
  cause: MortalityCause;
  breed: BreedType;
  notes?: string;
  createdAt: Date;
}

export function MortalityTracker({ lotId, onMortalityAdded }: MortalityTrackerProps) {
  const { toast } = useToast();
  const lot = useStore(state => state.lots.find(l => l.id === lotId));
  const updateLot = useStore(state => state.updateLot);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For now, we'll simulate mortality records since they're not in the main store
  // In a real app, these would come from the global store
  const [mortalityRecords, setMortalityRecords] = useState<MortalityRecord[]>([]);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      cause: 'unknown' as MortalityCause,
      breed: lot?.breed || 'nelore',
      notes: ''
    }
  });
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      if (!lot) throw new Error("Lot not found");
      if (lot.numberOfAnimals <= 0) throw new Error("No animals in lot");
      
      // Create new mortality record
      const newRecord: MortalityRecord = {
        id: crypto.randomUUID(),
        lotId,
        date: new Date(data.date),
        cause: data.cause,
        breed: data.breed,
        notes: data.notes,
        createdAt: new Date()
      };
      
      // Add to our local state (in a real app, would add to the global store)
      setMortalityRecords(prev => [...prev, newRecord]);
      
      // Update lot count
      updateLot(lotId, {
        numberOfAnimals: Math.max(0, lot.numberOfAnimals - 1)
      });
      
      toast({
        title: 'Mortality Recorded',
        description: 'Animal mortality has been recorded and lot count updated',
      });
      
      reset();
      
      if (onMortalityAdded) {
        onMortalityAdded();
      }
    } catch (error) {
      console.error('Error recording mortality:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to record mortality',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate mortality data for chart
  const chartData = () => {
    const monthlyData = new Map<string, number>();
    
    // Initialize with last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = format(monthDate, 'MMM yyyy');
      monthlyData.set(monthKey, 0);
    }
    
    // Count mortalities by month
    mortalityRecords.forEach(record => {
      const monthKey = format(record.date, 'MMM yyyy');
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
    });
    
    return Array.from(monthlyData.entries()).map(([month, count]) => ({
      month,
      count
    }));
  };
  
  // Group mortality records by cause
  const mortalityByCause = () => {
    const causes = new Map<MortalityCause, number>();
    
    mortalityRecords.forEach(record => {
      causes.set(record.cause, (causes.get(record.cause) || 0) + 1);
    });
    
    return Array.from(causes.entries()).map(([cause, count]) => ({
      cause,
      count
    }));
  };
  
  const totalMortalities = mortalityRecords.length;
  
  // Check if component is rendered in dialog
  const isDialogMode = !!onMortalityAdded;
  
  if (isDialogMode) {
    // Render only the form when in dialog mode
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date of Death</Label>
          <div className="relative">
            <Input
              id="date"
              type="date"
              {...register('date', { required: 'Date is required' })}
            />
            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cause">Cause of Death</Label>
          <Select 
            defaultValue="unknown"
            onValueChange={(value) => register('cause').onChange({ target: { value } })}
          >
            <SelectTrigger id="cause">
              <SelectValue placeholder="Select cause" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disease">Disease</SelectItem>
              <SelectItem value="injury">Injury</SelectItem>
              <SelectItem value="predator">Predator</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.cause && (
            <p className="text-sm text-destructive">{errors.cause.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="breed">Breed</Label>
          <Select 
            defaultValue={lot?.breed || 'nelore'}
            onValueChange={(value) => register('breed').onChange({ target: { value } })}
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
          {errors.breed && (
            <p className="text-sm text-destructive">{errors.breed.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional information about the cause of death..."
            {...register('notes')}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || !lot || lot.numberOfAnimals <= 0}
        >
          Record Mortality
        </Button>
        
        {lot && lot.numberOfAnimals <= 0 && (
          <p className="text-sm text-destructive text-center">
            No animals available in this lot
          </p>
        )}
      </form>
    );
  }
  
  // Normal card display for the main page
  return (
    <div className="bg-card rounded-lg p-6 border h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Skull className="h-5 w-5" />
          Mortality Tracking
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={onMortalityAdded}
        >
          <Plus className="h-4 w-4" />
          Add Mortality
        </Button>
      </div>
      
      {totalMortalities > 0 ? (
        <>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total recorded mortalities:</span>
            <span className="font-medium">{totalMortalities}</span>
          </div>
          
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" name="Mortalities" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-medium mb-2">Mortality Causes</h4>
            <div className="space-y-1">
              {mortalityByCause().map(({ cause, count }) => (
                <div key={cause} className="flex justify-between text-sm">
                  <span className="capitalize">{cause.replace('-', ' ')}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No mortality records for this lot</p>
          <p className="text-sm mt-1">Click "Add Mortality" to record animal deaths</p>
        </div>
      )}
    </div>
  );
}
