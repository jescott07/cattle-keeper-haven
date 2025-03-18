
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { 
  Sprout, 
  Calendar, 
  Leaf, 
  MapPin, 
  TrendingUp,
  DollarSign,
  Bug,
  Wrench
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PlantationDashboardProps {
  plantationId: string;
}

export function PlantationDashboard({ plantationId }: PlantationDashboardProps) {
  const plantation = useStore(state => state.plantations.find(p => p.id === plantationId));
  const expenses = useStore(state => state.plantationExpenses.filter(e => e.plantationId === plantationId));
  const pestControls = useStore(state => state.pestControls.filter(p => p.plantationId === plantationId));
  const maintenances = useStore(state => state.plantationMaintenances.filter(m => m.plantationId === plantationId));
  const productivityRecords = useStore(state => state.productivityRecords.filter(r => r.plantationId === plantationId));
  const pasture = plantation?.pastureId ? useStore(state => state.pastures.find(p => p.id === plantation.pastureId)) : null;

  if (!plantation) return null;

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0) + (plantation.seedCost || 0);
  // Calculate expenses per hectare
  const expensePerHectare = plantation.areaInHectares > 0 
    ? totalExpenses / plantation.areaInHectares 
    : 0;

  // Get latest productivity record
  const latestProductivityRecord = productivityRecords.length > 0 
    ? productivityRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
    : null;

  // Status color mapping
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'planned': 'bg-blue-100 text-blue-800',
      'planted': 'bg-green-100 text-green-800',
      'growing': 'bg-emerald-100 text-emerald-800',
      'harvested': 'bg-purple-100 text-purple-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sprout className="h-5 w-5" />
                Basic Information
              </span>
              <Badge className={getStatusColor(plantation.status)}>
                {plantation.status.charAt(0).toUpperCase() + plantation.status.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex items-start">
                <dt className="w-1/3 flex items-center gap-2 text-muted-foreground">
                  <Leaf className="h-4 w-4" />
                  <span>Type</span>
                </dt>
                <dd className="w-2/3">
                  {plantation.type.charAt(0).toUpperCase() + plantation.type.slice(1)}
                </dd>
              </div>
              
              <div className="flex items-start">
                <dt className="w-1/3 flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Area</span>
                </dt>
                <dd className="w-2/3">
                  {plantation.areaInHectares} hectares
                  {pasture && (
                    <span className="block text-sm text-muted-foreground">
                      Located in: {pasture.name}
                    </span>
                  )}
                </dd>
              </div>
              
              {plantation.plantingDate && (
                <div className="flex items-start">
                  <dt className="w-1/3 flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Planted</span>
                  </dt>
                  <dd className="w-2/3">
                    {format(new Date(plantation.plantingDate), 'MMM d, yyyy')}
                  </dd>
                </div>
              )}
              
              {plantation.estimatedHarvestDate && (
                <div className="flex items-start">
                  <dt className="w-1/3 flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Harvest</span>
                  </dt>
                  <dd className="w-2/3">
                    {format(new Date(plantation.estimatedHarvestDate), 'MMM d, yyyy')}
                  </dd>
                </div>
              )}
              
              {plantation.expectedYieldPerHectare && (
                <div className="flex items-start">
                  <dt className="w-1/3 flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Expected Yield</span>
                  </dt>
                  <dd className="w-2/3">
                    {plantation.expectedYieldPerHectare} per hectare
                  </dd>
                </div>
              )}
              
              {plantation.notes && (
                <div className="flex items-start mt-4 pt-4 border-t">
                  <dt className="w-1/3 text-muted-foreground">Notes</dt>
                  <dd className="w-2/3">{plantation.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  ${expensePerHectare.toFixed(2)} per hectare
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Pest Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pestControls.length}</div>
                <p className="text-xs text-muted-foreground">
                  {pestControls.length > 0 
                    ? `Last: ${format(new Date(pestControls[0].date), 'MMM d')}`
                    : 'No records yet'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{maintenances.length}</div>
                <p className="text-xs text-muted-foreground">
                  {maintenances.length > 0 
                    ? `Last: ${format(new Date(maintenances[0].date), 'MMM d')}`
                    : 'No records yet'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Health Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestProductivityRecord ? (
                  <>
                    <div className="text-2xl font-bold">{latestProductivityRecord.plantHealth}/10</div>
                    <p className="text-xs text-muted-foreground">
                      Last check: {format(new Date(latestProductivityRecord.date), 'MMM d')}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground">No health checks yet</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
