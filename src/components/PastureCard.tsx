
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { MapPin, Droplet, Ruler, Edit, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Pasture, FenceCondition } from '@/lib/types';

interface PastureCardProps {
  pasture: Pasture;
  onEdit: (pasture: Pasture) => void;
  onViewDetail: (pasture: Pasture) => void;
}

// Fence condition color mapping
const fenceColorMap: Record<FenceCondition, { bg: string; text: string }> = {
  'excellent': { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  'good': { bg: 'bg-green-500/10', text: 'text-green-500' },
  'fair': { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  'poor': { bg: 'bg-red-500/10', text: 'text-red-500' }
};

export const PastureCard = ({ pasture, onEdit, onViewDetail }: PastureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const { bg, text } = fenceColorMap[pasture.fenceCondition];
  
  const latestEvaluation = pasture.evaluations.length > 0 
    ? pasture.evaluations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
    : null;
  
  return (
    <Card 
      className="overflow-hidden card-hover-effect"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-4 pb-3">
        <div className="flex justify-between items-start">
          <Badge className={`${bg} ${text} h-6`}>
            <span className="capitalize">Fence: {pasture.fenceCondition}</span>
          </Badge>
          
          <Badge variant="outline" className="h-6 gap-1">
            <Ruler className="h-3 w-3" />
            {pasture.sizeInHectares} ha
          </Badge>
        </div>
        
        <CardTitle className="text-lg mt-1 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent" />
          {pasture.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 pb-2">
        <div className="text-sm grid grid-cols-2 gap-x-2 gap-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Droplet className="h-4 w-4" />
            <span className="capitalize">{pasture.waterSource.replace('-', ' ')}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="capitalize">Grass: {pasture.grassType.replace('-', ' ')}</span>
          </div>
          
          {latestEvaluation && (
            <>
              <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: latestEvaluation.grassColor.replace('-', '') }} />
                <span className="capitalize">
                  {latestEvaluation.grassColor.replace('-', ' ')} · {latestEvaluation.grassHeightCm} cm
                </span>
              </div>
            </>
          )}
        </div>
        
        {pasture.notes && (
          <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {pasture.notes}
          </div>
        )}
      </CardContent>
      
      <CardFooter className={`p-4 pt-2 grid grid-cols-2 gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => onEdit(pasture)}
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
        
        <Button 
          size="sm" 
          className="gap-2"
          onClick={() => onViewDetail(pasture)}
        >
          <ExternalLink className="h-4 w-4" />
          Details
        </Button>
      </CardFooter>
    </Card>
  );
};
