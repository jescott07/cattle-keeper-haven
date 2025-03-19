
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit, Calendar, ArrowLeft, ListChecks, PlusCircle, DollarSign, Package, Clipboard, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '@/lib/store';
import { PlantationStatus, PlantationType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { EditPlantationDatesForm } from '@/components/plantation-detail/EditPlantationDatesForm';
import { AddPlantationTaskForm } from '@/components/plantation-detail/AddPlantationTaskForm';
import { RecordHarvestForm } from '@/components/plantation-detail/RecordHarvestForm';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PlantationDetail = () => {
  const { plantationId } = useParams<{ plantationId: string }>();
  const { toast } = useToast();
  const [isEditDatesOpen, setIsEditDatesOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isRecordHarvestOpen, setIsRecordHarvestOpen] = useState(false);
  
  // Get plantation data from store
  const plantation = useStore(state => state.plantations.find(p => p.id === plantationId));
  const plantationTasks = useStore(state => state.plantationTasks.filter(t => t.plantationId === plantationId));
  const completedTasks = plantationTasks.filter(t => t.status === 'completed');
  const scheduledTasks = plantationTasks.filter(t => t.status === 'scheduled');
  const harvestRecords = useStore(state => state.harvestRecords.filter(h => h.plantationId === plantationId));
  const updatePlantationTask = useStore(state => state.updatePlantationTask);
  const inventory = useStore(state => state.inventory);
  const updateInventoryItem = useStore(state => state.updateInventoryItem);
  const addInventoryItem = useStore(state => state.addInventoryItem);
  
  // Calculate total expenses from tasks and other plantation costs
  const calculateTotalExpenses = () => {
    // Add up all task costs
    const taskCosts = plantationTasks.reduce((total, task) => {
      return total + (task.cost || 0);
    }, 0);
    
    // Add plantation seed costs if available
    const seedCosts = plantation?.seedCost || 0;
    
    return taskCosts + seedCosts;
  };
  
  // Handle task completion with inventory integration
  const handleCompleteTask = (taskId: string) => {
    const task = plantationTasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    // If task uses inventory item, process it
    if (task.inventoryItemId && !task.inventoryItemProcessed) {
      const inventoryItem = inventory.find(item => item.id === task.inventoryItemId);
      
      if (inventoryItem && task.inventoryItemQuantity) {
        // Check if we have enough inventory
        if (inventoryItem.quantity < task.inventoryItemQuantity) {
          toast({
            title: "Not enough inventory",
            description: `You only have ${inventoryItem.quantity} units of ${inventoryItem.name} available.`,
            variant: "destructive"
          });
          return;
        }
        
        // Update inventory quantity
        const newQuantity = inventoryItem.quantity - task.inventoryItemQuantity;
        updateInventoryItem(inventoryItem.id, { quantity: newQuantity });
      }
    }
    
    // Mark task as completed and processed
    updatePlantationTask(taskId, { 
      status: 'completed', 
      inventoryItemProcessed: task.inventoryItemId ? true : undefined 
    });
    
    toast({
      title: "Task completed",
      description: "The task has been marked as completed and inventory updated."
    });
  };
  
  // If plantation not found, show error message
  if (!plantation) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/plantations" className="hover:underline flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Plantations
          </Link>
        </div>
        <div className="text-center text-muted-foreground">
          Plantation not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container pb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Link to="/plantations" className="hover:underline flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Plantations
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{plantation?.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{plantation?.type}</Badge>
            <Badge>{plantation?.status}</Badge>
            <Badge variant="outline">{plantation?.areaInHectares} Hectares</Badge>
          </div>
        </div>
        <Button onClick={() => setIsEditDatesOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Dates
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              Planting Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {plantation?.plantingDate ? format(new Date(plantation.plantingDate), 'PPP') : 'Not set'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              Estimated Harvest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {plantation?.estimatedHarvestDate ? format(new Date(plantation.estimatedHarvestDate), 'PPP') : 'Not set'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              ${calculateTotalExpenses().toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Card */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-bold">Tasks</CardTitle>
            <Button size="sm" onClick={() => setIsAddTaskOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[500px]">
            {scheduledTasks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <Clipboard className="h-4 w-4 mr-2" />
                  Scheduled Tasks
                </h3>
                <div className="space-y-3">
                  {scheduledTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="border rounded-lg p-3 bg-muted/5 hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">{task.title}</span>
                          <div className="text-sm text-muted-foreground mt-1 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(task.date), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                            {task.type}
                          </span>
                          {task.cost && task.cost > 0 && (
                            <span className="text-xs bg-amber-50 text-amber-800 rounded-full px-2 py-0.5">
                              ${task.cost.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {task.description && (
                        <div className="text-sm mt-2 text-muted-foreground">
                          {task.description.substring(0, 100)}
                          {task.description.length > 100 ? '...' : ''}
                        </div>
                      )}
                      
                      {task.inventoryItemId && (
                        <div className="text-xs mt-2 text-amber-600 flex items-center">
                          <Package className="h-3 w-3 mr-1" />
                          Uses {task.inventoryItemQuantity} units of inventory
                        </div>
                      )}
                      
                      <div className="mt-3 flex justify-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Complete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed Tasks
                </h3>
                <div className="space-y-3">
                  {completedTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="border rounded-lg p-3 bg-green-50/30"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{task.title}</span>
                        <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                          {task.type}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(task.date), 'MMM d, yyyy')}
                      </div>
                      
                      {task.cost && task.cost > 0 && (
                        <div className="text-xs mt-1 text-amber-800">
                          Cost: ${task.cost.toFixed(2)}
                        </div>
                      )}
                      
                      {task.inventoryItemId && task.inventoryItemProcessed && (
                        <div className="text-xs mt-1 text-green-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Inventory used
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {scheduledTasks.length === 0 && completedTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tasks have been added yet
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Harvests Card */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-bold">Harvests</CardTitle>
            <Button size="sm" onClick={() => setIsRecordHarvestOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Record Harvest
            </Button>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[500px]">
            {harvestRecords.length > 0 ? (
              <div className="space-y-3">
                {harvestRecords.map(harvest => (
                  <div 
                    key={harvest.id} 
                    className="border rounded-lg p-3 bg-muted/5 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {format(new Date(harvest.harvestDate), 'MMM d, yyyy')}
                      </span>
                      {harvest.quality && (
                        <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                          Quality: {harvest.quality}/10
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total yield:</span> 
                        <span className="font-medium ml-1">{harvest.yield} kg</span>
                      </div>
                      {harvest.yieldPerHectare && (
                        <div>
                          <span className="text-muted-foreground">Per hectare:</span> 
                          <span className="font-medium ml-1">{harvest.yieldPerHectare} kg</span>
                        </div>
                      )}
                      {harvest.expenses && (
                        <div>
                          <span className="text-muted-foreground">Expenses:</span> 
                          <span className="font-medium ml-1">${harvest.expenses}</span>
                        </div>
                      )}
                    </div>
                    
                    {harvest.addedToInventory && (
                      <div className="text-xs mt-2 text-green-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Added to inventory
                      </div>
                    )}
                    
                    {harvest.notes && (
                      <div className="text-xs mt-2 text-muted-foreground border-t pt-2">
                        {harvest.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No harvests have been recorded yet
              </div>
            )}
            
            {plantation?.actualYield && plantation.actualYield > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-100">
                <div className="font-medium text-green-800">
                  Total Harvest: {plantation.actualYield} kg
                </div>
                {plantation.actualYieldPerHectare && (
                  <div className="text-sm text-green-700">
                    {plantation.actualYieldPerHectare} kg per hectare
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Expenses Card */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              <DollarSign className="h-5 w-5 inline mr-1" />
              Expenses
            </CardTitle>
            <CardDescription>
              Tracking all costs for this plantation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="border-b pb-3">
                <h3 className="text-sm font-medium mb-1">Plantation Setup</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Seed cost:</span> 
                    <span className="font-medium ml-1">${plantation.seedCost || 0}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Seeds per hectare:</span> 
                    <span className="font-medium ml-1">{plantation.seedsPerHectare || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-b pb-3">
                <h3 className="text-sm font-medium mb-1">Task Expenses</h3>
                <div className="space-y-1.5">
                  {plantationTasks.filter(t => t.cost && t.cost > 0).map(task => (
                    <div key={task.id} className="flex justify-between text-sm">
                      <span>{task.title}</span>
                      <span className="font-medium">${task.cost?.toFixed(2)}</span>
                    </div>
                  ))}
                  
                  {plantationTasks.filter(t => t.cost && t.cost > 0).length === 0 && (
                    <div className="text-sm text-muted-foreground">No task expenses recorded</div>
                  )}
                </div>
              </div>
              
              <div className="border-b pb-3">
                <h3 className="text-sm font-medium mb-1">Harvest Expenses</h3>
                <div className="space-y-1.5">
                  {harvestRecords.filter(h => h.expenses && h.expenses > 0).map(harvest => (
                    <div key={harvest.id} className="flex justify-between text-sm">
                      <span>Harvest on {format(new Date(harvest.harvestDate), 'MMM d, yyyy')}</span>
                      <span className="font-medium">${harvest.expenses?.toFixed(2)}</span>
                    </div>
                  ))}
                  
                  {harvestRecords.filter(h => h.expenses && h.expenses > 0).length === 0 && (
                    <div className="text-sm text-muted-foreground">No harvest expenses recorded</div>
                  )}
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between">
                  <h3 className="font-semibold">Total Expenses</h3>
                  <span className="font-bold text-lg">
                    ${calculateTotalExpenses().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Dates Dialog */}
      <Dialog open={isEditDatesOpen} onOpenChange={setIsEditDatesOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Plantation Dates</DialogTitle>
            <DialogDescription>
              Update the planting and estimated harvest dates for this plantation.
            </DialogDescription>
          </DialogHeader>
          <EditPlantationDatesForm 
            plantation={plantation} 
            onSuccess={() => setIsEditDatesOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Schedule a new task for this plantation
            </DialogDescription>
          </DialogHeader>
          <AddPlantationTaskForm 
            plantationId={plantationId!} 
            onSuccess={() => setIsAddTaskOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Record Harvest Dialog */}
      <Dialog open={isRecordHarvestOpen} onOpenChange={setIsRecordHarvestOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Record Harvest</DialogTitle>
            <DialogDescription>
              Record a harvest for this plantation
            </DialogDescription>
          </DialogHeader>
          <RecordHarvestForm 
            plantationId={plantationId!} 
            plantationArea={plantation.areaInHectares || 0}
            onSuccess={() => setIsRecordHarvestOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlantationDetail;
