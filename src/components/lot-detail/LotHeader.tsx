
import { format } from 'date-fns';
import { Beef, Calendar, MapPin, Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lot, LotStatus } from '@/lib/types';
import { extractBreedCounts } from './utils/lotUtils';

interface LotHeaderProps {
  lot: Lot;
  pastureName: string;
}

// Status color mapping
const statusColorMap: Record<LotStatus, { bg: string; text: string }> = {
  'active': { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  'sold': { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  'treatment': { bg: 'bg-amber-500/10', text: 'text-amber-500' }
};

export function LotHeader({ lot, pastureName }: LotHeaderProps) {
  const { bg, text } = statusColorMap[lot.status];
  const breedCounts = extractBreedCounts(lot);
  
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Badge className={`${bg} ${text} h-6`}>
            <span className="capitalize">{lot.status}</span>
          </Badge>
          
          {lot.averageWeight && (
            <Badge variant="outline" className="h-6 gap-1">
              <Scale className="h-3 w-3" />
              ~{Math.round(lot.averageWeight)} kg
            </Badge>
          )}
        </div>
        
        <h1 className="text-3xl font-bold mt-1">{lot.name}</h1>
      </div>
      
      <Card>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Animals</div>
            <div className="flex items-center gap-1.5">
              <Beef className="h-4 w-4 text-primary" />
              <span className="font-medium">{lot.numberOfAnimals}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Current Pasture</div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">{pastureName}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Purchase Date</div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">{format(lot.purchaseDate, 'MMM d, yyyy')}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Breed Composition</div>
            <div className="flex flex-wrap gap-1">
              {breedCounts.length > 0 ? (
                breedCounts.map((breed, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {breed.count} {breed.breedName}
                  </Badge>
                ))
              ) : (
                lot.breed ? <span className="font-medium">{lot.breed}</span> : <span>Not specified</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
