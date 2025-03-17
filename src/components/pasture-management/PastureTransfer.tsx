
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Move } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { PasturePlanning } from '@/lib/types';
import { Switch } from '@/components/ui/switch';

interface PastureTransferProps {
  initialLotId?: string;
  onTransferComplete?: () => void;
}

export function PastureTransfer({ initialLotId, onTransferComplete }: PastureTransferProps) {
  const { toast } = useToast();
  const [selectedLotId, setSelectedLotId] = useState(initialLotId || '');
  const [selectedPastureId, setSelectedPastureId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [isScheduledTransfer, setIsScheduledTransfer] = useState(false);

  const lots = useStore(state => state.lots);
  const pastures = useStore(state => state.pastures);
  const updateLot = useStore(state => state.updateLot);

  const activeLots = lots.filter(lot => lot.status === 'active');

  // Effect to set the selected lot when initialLotId changes
  useEffect(() => {
    if (initialLotId) {
      setSelectedLotId(initialLotId);
    }
  }, [initialLotId]);

  const handleTransfer = () => {
    if (!selectedLotId || !selectedPastureId) {
      toast({
        title: "Missing Information",
        description: "Please select both a lot and a destination pasture.",
        variant: "destructive"
      });
      return;
    }

    const lot = lots.find(l => l.id === selectedLotId);
    if (!lot) return;

    if (lot.currentPastureId === selectedPastureId && !isScheduledTransfer) {
      toast({
        title: "Invalid Transfer",
        description: "The lot is already in this pasture.",
        variant: "destructive"
      });
      return;
    }

    const plannedTransfer: PasturePlanning = {
      lotId: selectedLotId,
      fromPastureId: lot.currentPastureId,
      toPastureId: selectedPastureId,
      scheduledDate: new Date(scheduledDate),
      completed: !isScheduledTransfer,
      completedDate: isScheduledTransfer ? undefined : new Date(),
      notes: notes
    };

    // Update lot with the transfer
    updateLot(selectedLotId, {
      // Only update current pasture if it's an immediate transfer
      ...(isScheduledTransfer ? {} : { currentPastureId: selectedPastureId }),
      plannedTransfers: [
        ...(lot.plannedTransfers || []),
        plannedTransfer
      ]
    });

    toast({
      title: isScheduledTransfer ? "Management Scheduled" : "Management Complete",
      description: isScheduledTransfer 
        ? `The pasture change has been scheduled for ${format(new Date(scheduledDate), 'MMMM d, yyyy')}.`
        : "The lot has been moved to the new pasture successfully."
    });

    // Reset form
    if (!initialLotId) {
      setSelectedLotId('');
    }
    setSelectedPastureId('');
    setNotes('');
    setIsScheduledTransfer(false);
    
    // Call the callback if provided
    if (onTransferComplete) {
      onTransferComplete();
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2">
          <Label htmlFor="lot">Select Lot</Label>
          <Select 
            value={selectedLotId} 
            onValueChange={setSelectedLotId}
            disabled={!!initialLotId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a lot" />
            </SelectTrigger>
            <SelectContent>
              {activeLots.map(lot => (
                <SelectItem key={lot.id} value={lot.id}>
                  {lot.name} ({lot.numberOfAnimals} animals)
                  {lot.currentPastureId && ` - Current: ${
                    pastures.find(p => p.id === lot.currentPastureId)?.name || 'Unknown'
                  }`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pasture">Destination Pasture</Label>
          <Select value={selectedPastureId} onValueChange={setSelectedPastureId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a pasture" />
            </SelectTrigger>
            <SelectContent>
              {pastures.map(pasture => (
                <SelectItem key={pasture.id} value={pasture.id}>
                  {pasture.name} ({pasture.sizeInHectares} ha)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="date">
              {isScheduledTransfer ? "Scheduled Date" : "Transfer Date"}
            </Label>
            <div className="flex items-center gap-2">
              <Switch
                id="schedule-transfer"
                checked={isScheduledTransfer}
                onCheckedChange={setIsScheduledTransfer}
              />
              <Label htmlFor="schedule-transfer" className="cursor-pointer text-sm">
                Schedule for future
              </Label>
            </div>
          </div>
          <div className="relative">
            <Input
              id="date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any relevant notes about this pasture change"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button 
          className="w-full" 
          onClick={handleTransfer}
          disabled={!selectedLotId || !selectedPastureId}
        >
          {isScheduledTransfer ? "Schedule Management" : "Complete Management"}
        </Button>
      </CardContent>
    </Card>
  );
}
