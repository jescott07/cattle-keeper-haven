
import { format } from 'date-fns';
import { Syringe, Calendar, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { SanitaryTreatment } from '@/lib/types';

interface SanitaryTreatmentCardProps {
  treatment: SanitaryTreatment;
}

export function SanitaryTreatmentCard({ treatment }: SanitaryTreatmentCardProps) {
  const lots = useStore(state => state.lots);
  const inventoryItems = useStore(state => state.inventoryItems);
  
  // Get lot names
  const lotNames = treatment.lotIds.map(lotId => {
    const lot = lots.find(l => l.id === lotId);
    return lot ? lot.name : 'Unknown Lot';
  }).join(', ');
  
  // Get medication name if available
  const medicationName = treatment.inventoryItemId 
    ? inventoryItems.find(item => item.id === treatment.inventoryItemId)?.name || 'Unknown Medication'
    : null;
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Badge className="bg-blue-500/10 text-blue-500 h-6 gap-1">
            <Syringe className="h-3 w-3" />
            {treatment.treatmentType}
          </Badge>
          
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(treatment.date), 'MMM d, yyyy')}
          </Badge>
        </div>
        
        <CardTitle className="text-lg mt-2">{treatment.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 pb-2 flex-grow">
        <div className="flex items-center gap-2 text-sm mt-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{lotNames}</span>
        </div>
        
        {medicationName && (
          <div className="mt-2">
            <Badge variant="secondary">{medicationName}</Badge>
          </div>
        )}
        
        {treatment.notes && (
          <div className="mt-3 text-sm text-muted-foreground line-clamp-3">
            {treatment.notes}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-2">
        <Button variant="outline" size="sm" className="w-full gap-2">
          <FileText className="h-4 w-4" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
