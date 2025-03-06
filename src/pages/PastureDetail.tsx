
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, BarChart2, FileText, TestTube, Wrench } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useStore } from '@/lib/store';
import { Pasture } from '@/lib/types';
import PastureDashboard from '@/components/pasture-detail/PastureDashboard';
import PastureQualityTracker from '@/components/pasture-detail/PastureQualityTracker';
import PastureSoilAnalysis from '@/components/pasture-detail/PastureSoilAnalysis';
import PastureMaintenanceTracker from '@/components/pasture-detail/PastureMaintenanceTracker';
import { useToast } from '@/hooks/use-toast';

const PastureDetail = () => {
  const { pastureId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pasture, setPasture] = useState<Pasture | null>(null);
  
  const allPastures = useStore(state => state.pastures);
  
  useEffect(() => {
    // Find the pasture with the matching ID
    const foundPasture = allPastures.find(p => p.id === pastureId);
    
    if (foundPasture) {
      setPasture(foundPasture);
    } else {
      toast({
        title: "Pasture not found",
        description: "The pasture you're looking for doesn't exist.",
        variant: "destructive"
      });
      navigate('/pastures');
    }
  }, [pastureId, allPastures, navigate, toast]);
  
  if (!pasture) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in animate-slide-in">
        <div className="flex flex-col gap-6">
          {/* Header with back button and pasture name */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/pastures')}
              aria-label="Back to pastures"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{pasture.name}</h1>
              <p className="text-muted-foreground">
                {pasture.sizeInHectares} hectares • {pasture.grassType.replace('-', ' ')}
              </p>
            </div>
          </div>
          
          {/* Tabs for different sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart2 className="h-4 w-4" />
                <span className="hidden md:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="quality" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">Quality Tracking</span>
              </TabsTrigger>
              <TabsTrigger value="soil-analysis" className="gap-2">
                <TestTube className="h-4 w-4" />
                <span className="hidden md:inline">Soil Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="gap-2">
                <Wrench className="h-4 w-4" />
                <span className="hidden md:inline">Maintenance</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-2">
              <PastureDashboard pasture={pasture} />
            </TabsContent>
            
            <TabsContent value="quality" className="mt-2">
              <PastureQualityTracker pasture={pasture} />
            </TabsContent>
            
            <TabsContent value="soil-analysis" className="mt-2">
              <PastureSoilAnalysis pastureId={pasture.id} />
            </TabsContent>
            
            <TabsContent value="maintenance" className="mt-2">
              <PastureMaintenanceTracker pastureId={pasture.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default PastureDetail;
