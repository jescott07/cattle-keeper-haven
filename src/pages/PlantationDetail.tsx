
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '@/lib/store';
import { PlantationStatus, PlantationType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditPlantationDatesForm } from '@/components/plantation-detail/EditPlantationDatesForm';
import { AddPlantationTaskForm } from '@/components/plantation-detail/AddPlantationTaskForm';
import { RecordHarvestForm } from '@/components/plantation-detail/RecordHarvestForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PlantationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDatesOpen, setIsEditDatesOpen] = useState(false);

  const plantation = useStore(state => state.plantations.find(p => p.id === id));
  const plantationTasks = useStore(state => state.plantationTasks.filter(t => t.plantationId === id));
  const completedTasks = plantationTasks.filter(t => t.status === 'completed');
  const scheduledTasks = plantationTasks.filter(t => t.status === 'scheduled');
  const harvestRecords = useStore(state => state.harvestRecords.filter(h => h.plantationId === id));
  
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isRecordHarvestOpen, setIsRecordHarvestOpen] = useState(false);
  
  useEffect(() => {
    if (plantation) {
      setIsLoading(false);
    }
  }, [plantation]);

  const calculateTotalExpenses = () => {
    return 5200;
  };

  if (!plantation && !isLoading) {
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

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/plantations" className="hover:underline flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Plantations
          </Link>
        </div>
        <div className="text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Loading plantation details...
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
          </div>
        </div>
        <Button onClick={() => setIsEditDatesOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Dates
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Area</CardTitle>
          </CardHeader>
          <CardContent>
            {plantation?.areaInHectares} Hectares
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Planting Date</CardTitle>
          </CardHeader>
          <CardContent>
            {plantation?.plantingDate ? format(new Date(plantation.plantingDate), 'PPP') : 'Not set'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            ${calculateTotalExpenses()}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4 h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Tasks</h3>
              <Button size="sm" onClick={() => setIsAddTaskOpen(true)}>
                Add Task
              </Button>
            </div>
            
            {scheduledTasks.length > 0 && (
              <>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Scheduled</h4>
                <div className="space-y-2 mb-4">
                  {scheduledTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="border rounded-md p-3 bg-muted/10 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{task.title}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                          {task.type}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {new Date(task.date).toLocaleDateString()}
                      </div>
                      {task.inventoryItemId && (
                        <div className="text-xs mt-1 text-amber-600">
                          Uses inventory item • {task.inventoryItemQuantity} units
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {completedTasks.length > 0 && (
              <>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Completed</h4>
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="border rounded-md p-3 bg-muted/5"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{task.title}</span>
                        <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                          {task.type}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {new Date(task.date).toLocaleDateString()}
                      </div>
                      {task.inventoryItemId && task.inventoryItemProcessed && (
                        <div className="text-xs mt-1 text-green-600">
                          Inventory used • {task.inventoryItemQuantity} units
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {scheduledTasks.length === 0 && completedTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tasks have been added yet
              </div>
            )}
          </div>
        </div>
        
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4 h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Harvests</h3>
              <Button size="sm" onClick={() => setIsRecordHarvestOpen(true)}>
                Record Harvest
              </Button>
            </div>
            
            {harvestRecords.length > 0 ? (
              <div className="space-y-3">
                {harvestRecords.map(harvest => (
                  <div 
                    key={harvest.id} 
                    className="border rounded-md p-3 bg-muted/10 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {new Date(harvest.harvestDate).toLocaleDateString()}
                      </span>
                      {harvest.quality && (
                        <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                          Quality: {harvest.quality}/10
                        </span>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
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
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                        Added to inventory
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
          </div>
        </div>
        
        <div className="col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">
                ${calculateTotalExpenses()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={isEditDatesOpen} onOpenChange={setIsEditDatesOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Plantation Dates</DialogTitle>
            <DialogDescription>
              Update the planting and estimated harvest dates for this plantation.
            </DialogDescription>
          </DialogHeader>
          <EditPlantationDatesForm 
            plantation={plantation!} 
            onSuccess={() => setIsEditDatesOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Schedule a new task for this plantation
            </DialogDescription>
          </DialogHeader>
          <AddPlantationTaskForm 
            plantationId={id!} 
            onSuccess={() => setIsAddTaskOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRecordHarvestOpen} onOpenChange={setIsRecordHarvestOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Record Harvest</DialogTitle>
            <DialogDescription>
              Record a harvest for this plantation
            </DialogDescription>
          </DialogHeader>
          <RecordHarvestForm 
            plantationId={id!} 
            plantationArea={plantation?.areaInHectares || 0}
            onSuccess={() => setIsRecordHarvestOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlantationDetail;
