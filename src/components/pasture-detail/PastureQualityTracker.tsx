
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, FileText, Plus, Activity } from 'lucide-react';
import { Pasture, GrassColor } from '@/lib/types';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PastureQualityTrackerProps {
  pasture: Pasture;
}

const PastureQualityTracker = ({ pasture }: PastureQualityTrackerProps) => {
  const { toast } = useToast();
  const updatePasture = useStore(state => state.updatePasture);
  const addPastureEvaluation = useStore(state => state.addPastureEvaluation);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [date, setDate] = useState<Date>(new Date());
  const [ndviValue, setNdviValue] = useState<string>('');
  const [grassColor, setGrassColor] = useState<GrassColor>('green');
  const [grassHeight, setGrassHeight] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // Get sorted evaluations (newest first)
  const sortedEvaluations = [...pasture.evaluations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const handleSubmit = () => {
    if (!date || !grassColor || !grassHeight) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    const heightInCm = parseFloat(grassHeight);
    if (isNaN(heightInCm)) {
      toast({
        title: "Invalid grass height",
        description: "Please enter a valid number for grass height.",
        variant: "destructive"
      });
      return;
    }
    
    // Parse NDVI value if provided
    let ndvi: number | undefined = undefined;
    if (ndviValue) {
      ndvi = parseFloat(ndviValue);
      if (isNaN(ndvi) || ndvi < 0 || ndvi > 1) {
        toast({
          title: "Invalid NDVI value",
          description: "NDVI value should be between 0 and 1.",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Add the evaluation
    addPastureEvaluation(pasture.id, {
      date,
      ndviValue: ndvi,
      grassColor,
      grassHeightCm: heightInCm,
      notes: notes.trim() || undefined
    });
    
    toast({
      title: "Evaluation added",
      description: "Pasture quality evaluation has been recorded."
    });
    
    // Reset form
    setDate(new Date());
    setNdviValue('');
    setGrassColor('green');
    setGrassHeight('');
    setNotes('');
    setDialogOpen(false);
  };
  
  const getGrassColorDisplay = (color: GrassColor) => {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.replace('-', '') }} />
        <span className="capitalize">{color.replace('-', ' ')}</span>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Quality Tracking</h2>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Evaluation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Pasture Quality</DialogTitle>
              <DialogDescription>
                Enter details about the current condition of your pasture.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Measurement Date */}
              <div className="grid gap-2">
                <Label htmlFor="date">Measurement Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Grass Color */}
              <div className="grid gap-2">
                <Label htmlFor="grassColor">Grass Color</Label>
                <Select
                  value={grassColor}
                  onValueChange={(value) => setGrassColor(value as GrassColor)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grass color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deep-green">{getGrassColorDisplay('deep-green')}</SelectItem>
                    <SelectItem value="green">{getGrassColorDisplay('green')}</SelectItem>
                    <SelectItem value="yellow-green">{getGrassColorDisplay('yellow-green')}</SelectItem>
                    <SelectItem value="yellow">{getGrassColorDisplay('yellow')}</SelectItem>
                    <SelectItem value="brown">{getGrassColorDisplay('brown')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Grass Height */}
              <div className="grid gap-2">
                <Label htmlFor="grassHeight">Grass Height (cm)</Label>
                <Input
                  id="grassHeight"
                  placeholder="Enter height in cm"
                  type="number"
                  step="0.1"
                  min="0"
                  value={grassHeight}
                  onChange={(e) => setGrassHeight(e.target.value)}
                />
              </div>
              
              {/* NDVI Value (Optional) */}
              <div className="grid gap-2">
                <Label htmlFor="ndviValue">NDVI Value (Optional)</Label>
                <Input
                  id="ndviValue"
                  placeholder="0.0 - 1.0"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={ndviValue}
                  onChange={(e) => setNdviValue(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Normalized Difference Vegetation Index value (0-1)
                </p>
              </div>
              
              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional observations"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Save Evaluation</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Evaluations List */}
      {sortedEvaluations.length > 0 ? (
        <div className="grid gap-4">
          {sortedEvaluations.map((evaluation, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Evaluation from {format(new Date(evaluation.date), "MMM d, yyyy")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Grass Color</div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: evaluation.grassColor.replace('-', '') }} />
                      <span className="capitalize font-medium">{evaluation.grassColor.replace('-', ' ')}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Grass Height</div>
                    <div className="font-medium">{evaluation.grassHeightCm} cm</div>
                  </div>
                  
                  {evaluation.ndviValue !== undefined && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">NDVI Value</div>
                      <div className="font-medium">{evaluation.ndviValue.toFixed(2)}</div>
                    </div>
                  )}
                </div>
                
                {evaluation.notes && (
                  <div className="mt-4 space-y-1">
                    <div className="text-sm text-muted-foreground">Notes</div>
                    <div className="text-sm">{evaluation.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Activity className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No evaluations yet</h3>
            <p className="text-muted-foreground mb-6">
              Start tracking pasture quality by adding your first evaluation.
            </p>
            <Button 
              onClick={() => setDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add First Evaluation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PastureQualityTracker;
