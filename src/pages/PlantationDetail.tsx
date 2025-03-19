import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Calendar, 
  Edit,
  PlusCircle,
  List,
  Wheat,
  DollarSign,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlantationStatus } from '@/lib/types';

const statusColors: Record<PlantationStatus, string> = {
  'planned': 'bg-blue-100 text-blue-800',
  'planted': 'bg-green-100 text-green-800',
  'growing': 'bg-emerald-100 text-emerald-800',
  'harvested': 'bg-purple-100 text-purple-800',
  'failed': 'bg-red-100 text-red-800'
};

export default function PlantationDetail() {
  const { plantationId } = useParams<{ plantationId: string }>();
  const navigate = useNavigate();
  const plantation = useStore((state) => 
    state.plantations.find((p) => p.id === plantationId)
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'harvest' | 'edit' | 'task'>('edit');
  
  const expenses = useStore(state => 
    state.plantationExpenses.filter(e => e.plantationId === plantationId)
  );
  const maintenances = useStore(state => 
    state.plantationMaintenances.filter(m => m.plantationId === plantationId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );
  const pestControls = useStore(state => 
    state.pestControls.filter(p => p.plantationId === plantationId)
  );
  const productivityRecords = useStore(state => 
    state.productivityRecords.filter(r => r.plantationId === plantationId)
  );
  const pasture = plantation?.pastureId ? 
    useStore(state => state.pastures.find(p => p.id === plantation.pastureId)) : null;

  if (!plantation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto p-4 py-8">
          <Button 
            variant="outline" 
            className="mb-6" 
            onClick={() => navigate('/plantations')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Plantations
          </Button>
          <div className="text-center p-12 border rounded-lg">
            <h3 className="text-xl font-medium mb-2">Plantation not found</h3>
            <p className="text-muted-foreground">
              The plantation you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0) + (plantation.seedCost || 0);

  const openEditDialog = () => {
    setDialogType('edit');
    setDialogOpen(true);
  };

  const openHarvestDialog = () => {
    setDialogType('harvest');
    setDialogOpen(true);
  };
  
  const openTaskDialog = () => {
    setDialogType('task');
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-4 py-8">
        <Button 
          variant="outline" 
          className="mb-6" 
          onClick={() => navigate('/plantations')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Plantations
        </Button>

        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{plantation.name}</h1>
              <Badge className={statusColors[plantation.status]}>
                {plantation.status.charAt(0).toUpperCase() + plantation.status.slice(1)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                {plantation.type.charAt(0).toUpperCase() + plantation.type.slice(1)}
              </span>
              <span>•</span>
              <span>{plantation.areaInHectares} hectares</span>
              {plantation.plantingDate && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(plantation.plantingDate), 'MMM d, yyyy')}
                  </span>
                </>
              )}
              {pasture && (
                <>
                  <span>•</span>
                  <span>Located in: {pasture.name}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              onClick={openEditDialog}
            >
              <Edit className="h-4 w-4" />
              Edit Details
            </Button>
            {plantation.status === 'growing' && (
              <Button 
                size="sm"
                className="flex items-center gap-2"
                onClick={openHarvestDialog}
              >
                <PlusCircle className="h-4 w-4" />
                Record Harvest
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">
                  <List className="h-5 w-5 inline mr-2" />
                  Tasks
                </CardTitle>
                <CardDescription>Scheduled and completed tasks</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={openTaskDialog}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              {maintenances.length > 0 || pestControls.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Upcoming Tasks</h3>
                    {maintenances.filter(m => new Date(m.date) >= new Date()).length > 0 ? (
                      maintenances
                        .filter(m => new Date(m.date) >= new Date())
                        .slice(0, 3)
                        .map(task => (
                          <div key={task.id} className="flex items-start gap-3 mb-3 pb-3 border-b last:border-0">
                            <Clock className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                            <div>
                              <div className="font-medium">{task.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(task.date), 'MMM d, yyyy')}
                                {task.type && <span className="ml-2">• {task.type}</span>}
                              </div>
                              {task.notes && <div className="text-sm mt-1">{task.notes}</div>}
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No upcoming tasks scheduled</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Completed Tasks</h3>
                    {maintenances.filter(m => new Date(m.date) < new Date()).length > 0 || pestControls.length > 0 ? (
                      <div className="space-y-3">
                        {maintenances
                          .filter(m => new Date(m.date) < new Date())
                          .slice(0, 3)
                          .map(task => (
                            <div key={task.id} className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                              <div>
                                <div className="font-medium">{task.description}</div>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(task.date), 'MMM d, yyyy')}
                                </div>
                              </div>
                            </div>
                          ))}
                        
                        {pestControls.slice(0, 2).map(pest => (
                          <div key={pest.id} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                            <div>
                              <div className="font-medium">Pest Control: {pest.pestType}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(pest.date), 'MMM d, yyyy')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No completed tasks yet</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-3">No tasks have been scheduled yet</p>
                  <Button variant="outline" onClick={openTaskDialog}>
                    Schedule First Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">
                  <Wheat className="h-5 w-5 inline mr-2" />
                  Harvests
                </CardTitle>
                <CardDescription>Harvest records and productivity</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={openHarvestDialog}
                disabled={plantation.status !== 'growing'}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Record Harvest
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              {plantation.actualHarvestDate ? (
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <div className="font-medium text-lg mb-2">
                      Primary Harvest
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Date</div>
                        <div>{format(new Date(plantation.actualHarvestDate), 'MMM d, yyyy')}</div>
                      </div>
                      {plantation.actualYield && (
                        <div>
                          <div className="text-muted-foreground">Yield</div>
                          <div>{plantation.actualYield} kg</div>
                        </div>
                      )}
                      {plantation.expectedYieldPerHectare && (
                        <div>
                          <div className="text-muted-foreground">Expected Yield/hectare</div>
                          <div>{plantation.expectedYieldPerHectare} kg</div>
                        </div>
                      )}
                      {productivityRecords.length > 0 && (
                        <div>
                          <div className="text-muted-foreground">Health Score (last)</div>
                          <div>{productivityRecords[0].plantHealth}/10</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-3">
                    No harvest records yet
                    {plantation.status !== 'growing' && ' (Plantation is not in growing state)'}
                  </p>
                  {plantation.status === 'growing' && (
                    <Button variant="outline" onClick={openHarvestDialog}>
                      Record First Harvest
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">
                  <DollarSign className="h-5 w-5 inline mr-2" />
                  Expenses
                </CardTitle>
                <CardDescription>Total costs and expense breakdown</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="mb-6">
                <div className="text-3xl font-bold">${totalExpenses.toFixed(2)}</div>
                <p className="text-muted-foreground">
                  ${(plantation.areaInHectares > 0 ? totalExpenses / plantation.areaInHectares : 0).toFixed(2)} per hectare
                </p>
              </div>
              
              {expenses.length > 0 || plantation.seedCost ? (
                <div className="space-y-4">
                  {plantation.seedCost > 0 && (
                    <div className="flex justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">Seed Cost</div>
                        <div className="text-sm text-muted-foreground">Initial investment</div>
                      </div>
                      <div className="font-medium">${plantation.seedCost.toFixed(2)}</div>
                    </div>
                  )}
                  
                  {expenses.map(expense => (
                    <div key={expense.id} className="flex justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(expense.date), 'MMM d, yyyy')}
                          {expense.category && <span className="ml-2">• {expense.category}</span>}
                        </div>
                      </div>
                      <div className="font-medium">${expense.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-3">No expenses recorded yet</p>
                  <Button variant="outline">Record First Expense</Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Plantation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-muted-foreground mb-1">Type</dt>
                  <dd>{plantation.type.charAt(0).toUpperCase() + plantation.type.slice(1)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground mb-1">Area</dt>
                  <dd>{plantation.areaInHectares} hectares</dd>
                </div>
                {plantation.plantingDate && (
                  <div>
                    <dt className="text-muted-foreground mb-1">Planting Date</dt>
                    <dd>{format(new Date(plantation.plantingDate), 'MMMM d, yyyy')}</dd>
                  </div>
                )}
                {plantation.estimatedHarvestDate && (
                  <div>
                    <dt className="text-muted-foreground mb-1">Estimated Harvest Date</dt>
                    <dd>{format(new Date(plantation.estimatedHarvestDate), 'MMMM d, yyyy')}</dd>
                  </div>
                )}
                {pasture && (
                  <div>
                    <dt className="text-muted-foreground mb-1">Location</dt>
                    <dd>{pasture.name}</dd>
                  </div>
                )}
                {plantation.notes && (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground mb-1">Notes</dt>
                    <dd>{plantation.notes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogType === 'edit' && 'Edit Plantation Details'}
                {dialogType === 'harvest' && 'Record Harvest'}
                {dialogType === 'task' && 'Schedule Task'}
              </DialogTitle>
              <DialogDescription>
                {dialogType === 'edit' && 'Update the details of your plantation.'}
                {dialogType === 'harvest' && 'Record harvest results and productivity data.'}
                {dialogType === 'task' && 'Schedule a maintenance task for your plantation.'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                {dialogType === 'edit' 
                  ? 'Edit functionality will be implemented in future updates.'
                  : dialogType === 'harvest'
                  ? 'Harvest recording functionality will be implemented in future updates.'
                  : 'Task scheduling functionality will be implemented in future updates.'}
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
