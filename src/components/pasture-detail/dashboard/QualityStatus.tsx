
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Gauge } from 'lucide-react';
import { PastureEvaluation } from '@/lib/types';
import { format } from 'date-fns';

interface QualityStatusProps {
  latestEvaluation: PastureEvaluation | null;
}

const QualityStatus = ({ latestEvaluation }: QualityStatusProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          Latest Quality Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {latestEvaluation ? (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Evaluated:</span>
              <span className="font-medium">{format(new Date(latestEvaluation.date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Grass Height:</span>
              <span className="font-medium">{latestEvaluation.grassHeightCm} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Grass Color:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: latestEvaluation.grassColor.replace('-', '') }} />
                <span className="font-medium capitalize">{latestEvaluation.grassColor.replace('-', ' ')}</span>
              </div>
            </div>
            {latestEvaluation.ndviValue && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">NDVI Value:</span>
                <span className="font-medium">{latestEvaluation.ndviValue.toFixed(2)}</span>
              </div>
            )}
            
            {latestEvaluation.notes && (
              <div className="border-t mt-4 pt-2">
                <p className="text-sm text-muted-foreground">Notes:</p>
                <p className="text-sm mt-1">{latestEvaluation.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <Activity className="h-8 w-8 mb-2 opacity-50" />
            <p>No quality evaluations yet</p>
            <p className="text-sm">Add one in the Quality Tracking tab</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QualityStatus;
