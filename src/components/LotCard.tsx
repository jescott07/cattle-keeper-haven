
import { useState } from 'react';
import { Beef, Calendar, PackagePlus, MapPin, AlertCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lot, LotStatus } from '@/lib/types';

interface LotCardProps {
  lot: Lot;
  pastureName: string;
  onEdit: (lot: Lot) => void;
  onViewDetail: (lot: Lot) => void;
}

// Status color mapping
const statusColorMap: Record<LotStatus, { bg: string; text: string; icon: JSX.Element }> = {
  'active': { 
    bg: 'bg-emerald-500/10', 
    text: 'text-emerald-500', 
    icon: <Beef className="h-4 w-4" />
  },
  'sold': { 
    bg: 'bg-blue-500/10', 
    text: 'text-blue-500', 
    icon: <PackagePlus className="h-4 w-4" />
  },
  'treatment': { 
    bg: 'bg-amber-500/10', 
    text: 'text-amber-500', 
    icon: <AlertCircle className="h-4 w-4" />
  }
};

export const LotCard = ({ lot, pastureName, onEdit, onViewDetail }: LotCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const { bg, text, icon } = statusColorMap[lot.status];
  
  return (
    <Card 
      className="overflow-hidden card-hover-effect"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-4 pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Badge className={`${bg} ${text} h-6`}>
              {icon}
              <span className="ml-1 capitalize">{lot.status}</span>
            </Badge>
            
            {lot.averageWeight && (
              <Badge variant="outline" className="h-6 gap-1">
                <span className="text-xs font-normal">~</span>
                {Math.round(lot.averageWeight)} kg
              </Badge>
            )}
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(lot.purchaseDate, 'MMM d, yyyy')}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Purchase Date</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <CardTitle className="text-lg mt-1 flex items-center gap-2">
          {lot.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 pb-2">
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Beef className="h-4 w-4" />
            <span>{lot.numberOfAnimals} animals</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{pastureName}</span>
          </div>
        </div>
        
        {lot.breed && (
          <div className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Breed: </span>
            {lot.breed}
          </div>
        )}
        
        {lot.notes && (
          <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {lot.notes}
          </div>
        )}
      </CardContent>
      
      <CardFooter className={`p-4 pt-2 grid grid-cols-2 gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <Button variant="outline" size="sm" onClick={() => onEdit(lot)}>
          Edit
        </Button>
        <Button size="sm" onClick={() => onViewDetail(lot)}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Details
        </Button>
      </CardFooter>
    </Card>
  );
};
