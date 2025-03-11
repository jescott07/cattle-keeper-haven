
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TreePine } from 'lucide-react';
import { useStore } from '@/lib/store';

interface PastureHistoryProps {
  lotId: string;
}

export function PastureHistory({ lotId }: PastureHistoryProps) {
  const lot = useStore(state => state.lots.find(l => l.id === lotId));
  const pastures = useStore(state => state.pastures);
  
  const currentPastureName = useMemo(() => {
    if (!lot) return 'Unknown';
    const pasture = pastures.find(p => p.id === lot.currentPastureId);
    return pasture ? pasture.name : 'Unknown';
  }, [lot, pastures]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TreePine className="h-5 w-5" />
          Pasture History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid place-content-center h-[300px] text-center">
          <div className="text-muted-foreground">
            <p>Current Pasture: <span className="font-medium text-foreground">{currentPastureName}</span></p>
            <p className="mt-4">Pasture management will be available in future updates</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
