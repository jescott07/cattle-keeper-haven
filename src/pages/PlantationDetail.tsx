
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { PlantationDashboard } from '@/components/plantation-detail/PlantationDashboard';
import { PlantationExpenseTracker } from '@/components/plantation-detail/PlantationExpenseTracker';
import { PestControlTracker } from '@/components/plantation-detail/PestControlTracker';
import { ProductivityTracker } from '@/components/plantation-detail/ProductivityTracker';
import { PlantationMaintenanceTracker } from '@/components/plantation-detail/PlantationMaintenanceTracker';
import { PlantationSchedule } from '@/components/plantation-detail/PlantationSchedule';

export default function PlantationDetail() {
  const { plantationId } = useParams<{ plantationId: string }>();
  const navigate = useNavigate();
  const plantation = useStore((state) => 
    state.plantations.find((p) => p.id === plantationId)
  );

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

        <h1 className="text-3xl font-bold mb-6">{plantation.name}</h1>

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
      </main>
    </div>
  );
}
