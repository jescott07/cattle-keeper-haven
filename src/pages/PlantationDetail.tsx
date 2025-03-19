
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Calendar, 
  Edit,
  PlusCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlantationDashboard } from '@/components/plantation-detail/PlantationDashboard';
import { PlantationExpenseTracker } from '@/components/plantation-detail/PlantationExpenseTracker';
import { PestControlTracker } from '@/components/plantation-detail/PestControlTracker';
import { ProductivityTracker } from '@/components/plantation-detail/ProductivityTracker';
import { PlantationMaintenanceTracker } from '@/components/plantation-detail/PlantationMaintenanceTracker';
import { PlantationSchedule } from '@/components/plantation-detail/PlantationSchedule';
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
  const [dialogType, setDialogType] = useState<'harvest' | 'edit'>('edit');

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

  const openEditDialog = () => {
    setDialogType('edit');
    setDialogOpen(true);
  };

  const openHarvestDialog = () => {
    setDialogType('harvest');
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

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="w-full justify-start mb-6 overflow-x-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="pests">Pest Control</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <PlantationDashboard plantationId={plantation.id} />
          </TabsContent>
          
          <TabsContent value="schedule">
            <PlantationSchedule plantationId={plantation.id} />
          </TabsContent>
          
          <TabsContent value="expenses">
            <PlantationExpenseTracker plantationId={plantation.id} />
          </TabsContent>
          
          <TabsContent value="pests">
            <PestControlTracker plantationId={plantation.id} />
          </TabsContent>
          
          <TabsContent value="maintenance">
            <PlantationMaintenanceTracker plantationId={plantation.id} />
          </TabsContent>
          
          <TabsContent value="productivity">
            <ProductivityTracker plantationId={plantation.id} />
          </TabsContent>
        </Tabs>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogType === 'edit' ? 'Edit Plantation Details' : 'Record Harvest'}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                {dialogType === 'edit' 
                  ? 'Edit functionality will be implemented in future updates.'
                  : 'Harvest recording functionality will be implemented in future updates.'}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
