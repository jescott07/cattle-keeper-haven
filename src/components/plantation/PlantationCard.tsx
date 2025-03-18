
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Sprout, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plantation, PlantationStatus } from '@/lib/types';

const statusColors: Record<PlantationStatus, string> = {
  'planned': 'bg-blue-100 text-blue-800',
  'planted': 'bg-green-100 text-green-800',
  'growing': 'bg-emerald-100 text-emerald-800',
  'harvested': 'bg-purple-100 text-purple-800',
  'failed': 'bg-red-100 text-red-800'
};

interface PlantationCardProps {
  plantation: Plantation;
}

export function PlantationCard({ plantation }: PlantationCardProps) {
  const navigate = useNavigate();
  
  const statusColor = statusColors[plantation.status] || 'bg-gray-100 text-gray-800';
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5" />
            {plantation.name}
          </CardTitle>
          <Badge className={statusColor}>
            {plantation.status.charAt(0).toUpperCase() + plantation.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>
              {plantation.areaInHectares} hectares
              {plantation.pastureId && ' (on pasture)'}
            </span>
          </div>
          
          {plantation.plantingDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                Planted: {format(new Date(plantation.plantingDate), 'MMM d, yyyy')}
              </span>
            </div>
          )}
          
          {plantation.estimatedHarvestDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                Harvest: {format(new Date(plantation.estimatedHarvestDate), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full gap-1"
          onClick={() => navigate(`/plantations/${plantation.id}`)}
        >
          View Details
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
