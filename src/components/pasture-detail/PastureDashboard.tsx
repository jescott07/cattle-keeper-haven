
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pasture, Lot } from '@/lib/types';
import { useStore } from '@/lib/store';
import { BarChart, MapPin, Droplet, Ruler, Gauge, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PastureDashboardProps {
  pasture: Pasture;
}

const PastureDashboard = ({ pasture }: PastureDashboardProps) => {
  const lots = useStore(state => state.lots);
  const lotsInPasture = lots.filter(lot => lot.currentPastureId === pasture.id);
  const totalAnimals = lotsInPasture.reduce((sum, lot) => sum + lot.numberOfAnimals, 0);
  
  // Get the latest evaluation, if any
  const latestEvaluation = pasture.evaluations.length > 0 
    ? [...pasture.evaluations].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0] 
    : null;
    
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Info Card */}
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
        
        {/* Current Occupancy Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart className="h-4 w-4 text-primary" />
              Current Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Animals:</span>
                <span className="font-medium">{totalAnimals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Number of Lots:</span>
                <span className="font-medium">{lotsInPasture.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stocking Rate:</span>
                <span className="font-medium">
                  {pasture.sizeInHectares > 0 
                    ? (totalAnimals / pasture.sizeInHectares).toFixed(2) 
                    : '0'} animals/ha
                </span>
              </div>
              
              {lotsInPasture.length > 0 ? (
                <div className="border-t mt-4 pt-2">
                  <p className="text-sm font-medium mb-2">Lots in this pasture:</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {lotsInPasture.map(lot => (
                      <div key={lot.id} className="flex justify-between text-sm">
                        <span>{lot.name}</span>
                        <span className="font-medium">{lot.numberOfAnimals} animals</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 text-muted-foreground text-sm">
                  No lots currently in this pasture
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Latest Quality Card */}
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
      </div>
      
      {/* Notes Section */}
      {pasture.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{pasture.notes}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Status Alerts Section */}
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
    </div>
  );
};

export default PastureDashboard;
