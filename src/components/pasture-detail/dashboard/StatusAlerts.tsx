
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { Pasture, PastureEvaluation } from '@/lib/types';

interface StatusAlertsProps {
  pasture: Pasture;
  latestEvaluation: PastureEvaluation | null;
}

const StatusAlerts = ({ pasture, latestEvaluation }: StatusAlertsProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Status Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pasture.fenceCondition === 'poor' && (
            <div className="flex items-start gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Fence needs repair</p>
                <p className="text-sm text-muted-foreground">Fence condition is marked as poor and may need immediate attention.</p>
              </div>
            </div>
          )}
          
          {pasture.fenceCondition === 'fair' && (
            <div className="flex items-start gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Fence maintenance recommended</p>
                <p className="text-sm text-muted-foreground">Fence condition is marked as fair and should be inspected.</p>
              </div>
            </div>
          )}
          
          {latestEvaluation && latestEvaluation.grassColor === 'yellow' && (
            <div className="flex items-start gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Grass health concerns</p>
                <p className="text-sm text-muted-foreground">The grass appears yellow, which may indicate drought stress or nutrient deficiency.</p>
              </div>
            </div>
          )}
          
          {latestEvaluation && latestEvaluation.grassColor === 'brown' && (
            <div className="flex items-start gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Poor grass health</p>
                <p className="text-sm text-muted-foreground">The grass is brown, indicating possible severe drought or overgrazing.</p>
              </div>
            </div>
          )}
          
          {pasture.fenceCondition !== 'poor' && pasture.fenceCondition !== 'fair' && 
           (!latestEvaluation || (latestEvaluation.grassColor !== 'yellow' && latestEvaluation.grassColor !== 'brown')) && (
            <div className="flex items-start gap-2 text-green-500">
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">No urgent issues detected</p>
                <p className="text-sm text-muted-foreground">Current pasture conditions appear normal.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusAlerts;
