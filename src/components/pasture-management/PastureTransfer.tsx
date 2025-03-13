
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { PasturePlanning } from '@/lib/types';

export function PastureTransfer() {
  const { toast } = useToast();
  const [selectedLotId, setSelectedLotId] = useState('');
  const [selectedPastureId, setSelectedPastureId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  const lots = useStore(state => state.lots);
  const pastures = useStore(state => state.pastures);
  const updateLot = useStore(state => state.updateLot);

  const activeLots = lots.filter(lot => lot.status === 'active');

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

    if (lot.currentPastureId === selectedPastureId) {
      toast({
        title: "Invalid Transfer",
        description: "The lot is already in this pasture.",
        variant: "destructive"
      });
      return;
    }

    // Update the lot's current pasture
    updateLot(selectedLotId, {
      currentPastureId: selectedPastureId,
      plannedTransfers: [
        ...(lot.plannedTransfers || []),
        {
          lotId: selectedLotId,
          fromPastureId: lot.currentPastureId,
          toPastureId: selectedPastureId,
          scheduledDate: new Date(scheduledDate),
          completed: true,
          completedDate: new Date(),
          notes: notes
        }
      ]
    });

    toast({
      title: "Transfer Complete",
      description: "The lot has been moved to the new pasture successfully."
    });

    // Reset form
    setSelectedLotId('');
    setSelectedPastureId('');
    setNotes('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Lots Between Pastures</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lot">Select Lot</Label>
          <Select value={selectedLotId} onValueChange={setSelectedLotId}>
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
          <Label htmlFor="date">Transfer Date</Label>
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
            placeholder="Add any relevant notes about this transfer"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button 
          className="w-full" 
          onClick={handleTransfer}
          disabled={!selectedLotId || !selectedPastureId}
        >
          Complete Transfer
        </Button>
      </CardContent>
    </Card>
  );
}
