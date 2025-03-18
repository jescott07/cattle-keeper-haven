
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { format, isFuture, isPast, isToday } from 'date-fns';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EditPlantationDatesForm } from './EditPlantationDatesForm';

interface PlantationScheduleProps {
  plantationId: string;
}

export function PlantationSchedule({ plantationId }: PlantationScheduleProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const plantation = useStore(state => state.plantations.find(p => p.id === plantationId));
  const maintenances = useStore(state => 
    state.plantationMaintenances
      .filter(m => m.plantationId === plantationId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  );
  
  if (!plantation) return null;
  
  // Filter maintenances by status
  const upcomingMaintenances = maintenances.filter(m => 
    (isFuture(new Date(m.date)) || isToday(new Date(m.date))) && 
    m.type !== 'harvesting' && 
    m.type !== 'planting'
  );
  
  const pastMaintenances = maintenances.filter(m => 
    isPast(new Date(m.date)) && !isToday(new Date(m.date)) &&
    m.type !== 'harvesting' && 
    m.type !== 'planting'
  );
  
  // Create an array of important dates
  const importantDates = [];
  
  if (plantation.plantingDate) {
    importantDates.push({
      id: 'planting',
      date: new Date(plantation.plantingDate),
      title: 'Planting Date',
      type: 'planting',
      isPast: isPast(new Date(plantation.plantingDate)) && !isToday(new Date(plantation.plantingDate)),
      isToday: isToday(new Date(plantation.plantingDate))
    });
  }
  
  if (plantation.estimatedHarvestDate) {
    importantDates.push({
      id: 'harvest',
      date: new Date(plantation.estimatedHarvestDate),
      title: 'Estimated Harvest Date',
      type: 'harvesting',
      isPast: isPast(new Date(plantation.estimatedHarvestDate)) && !isToday(new Date(plantation.estimatedHarvestDate)),
      isToday: isToday(new Date(plantation.estimatedHarvestDate))
    });
  }
  
  if (plantation.actualHarvestDate) {
    importantDates.push({
      id: 'actual-harvest',
      date: new Date(plantation.actualHarvestDate),
      title: 'Actual Harvest Date',
      type: 'harvesting',
      isPast: true,
      isToday: false
    });
  }
  
  // Sort by date
  importantDates.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Plantation Schedule</h2>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          Update Dates
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Important Dates
          </CardTitle>
          <CardDescription>
            Key milestones for your plantation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {importantDates.length > 0 ? (
            <div className="space-y-4">
              {importantDates.map((date) => (
                <div key={date.id} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {date.isPast ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : date.isToday ? (
                      <Clock className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Calendar className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium">{date.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(date.date, 'MMMM d, yyyy')}
                    </div>
                  </div>
                  <div>
                    <Badge variant={date.isPast ? "outline" : "secondary"}>
                      {date.isPast ? "Completed" : date.isToday ? "Today" : "Upcoming"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No dates have been set for this plantation.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsEditDialogOpen(true)}
              >
                Set Dates
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingMaintenances.length > 0 ? (
              <div className="space-y-4">
                {upcomingMaintenances.map((maintenance) => (
                  <div key={maintenance.id} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <Clock className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium">{maintenance.description}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(maintenance.date), 'MMMM d, yyyy')}
                      </div>
                      {maintenance.notes && (
                        <div className="text-sm mt-1">{maintenance.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No upcoming tasks scheduled.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Completed Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pastMaintenances.length > 0 ? (
              <div className="space-y-4">
                {pastMaintenances.slice(0, 5).map((maintenance) => (
                  <div key={maintenance.id} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium">{maintenance.description}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(maintenance.date), 'MMMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                ))}
                
                {pastMaintenances.length > 5 && (
                  <div className="text-center mt-2">
                    <Button variant="link" className="text-sm">
                      View all {pastMaintenances.length} completed tasks
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No completed tasks yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Plantation Dates</DialogTitle>
          </DialogHeader>
          <EditPlantationDatesForm 
            plantation={plantation} 
            onSuccess={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
