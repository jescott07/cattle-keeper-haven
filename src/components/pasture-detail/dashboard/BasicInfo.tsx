
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Pasture } from '@/lib/types';
import { format } from 'date-fns';

interface BasicInfoProps {
  pasture: Pasture;
}

const BasicInfo = ({ pasture }: BasicInfoProps) => {
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-emerald-500';
      case 'good': return 'text-green-500';
      case 'fair': return 'text-amber-500';
      case 'poor': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Size:</span>
            <span className="font-medium">{pasture.sizeInHectares} hectares</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Grass Type:</span>
            <span className="font-medium capitalize">{pasture.grassType.replace('-', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Water Source:</span>
            <span className="font-medium capitalize">{pasture.waterSource.replace('-', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fence Condition:</span>
            <span className={`font-medium capitalize ${getConditionColor(pasture.fenceCondition)}`}>
              {pasture.fenceCondition}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">{format(new Date(pasture.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfo;
