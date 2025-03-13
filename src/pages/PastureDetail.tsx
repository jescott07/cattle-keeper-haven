
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, BarChart2, FileText, TestTube, Wrench, Edit, Trash } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useStore } from '@/lib/store';
import { Pasture } from '@/lib/types';
import PastureDashboard from '@/components/pasture-detail/PastureDashboard';
import PastureQualityTracker from '@/components/pasture-detail/PastureQualityTracker';
import PastureSoilAnalysis from '@/components/pasture-detail/PastureSoilAnalysis';
import PastureMaintenanceTracker from '@/components/pasture-detail/PastureMaintenanceTracker';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddPastureForm } from '@/components/AddPastureForm';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PastureDetail = () => {
  const { pastureId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pasture, setPasture] = useState<Pasture | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const allPastures = useStore(state => state.pastures);
  const removePasture = useStore(state => state.removePasture);
  
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
  
  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    toast({
      title: "Pasture Updated",
      description: "Pasture details have been updated successfully"
    });
  };
  
  const handleDelete = () => {
    if (pastureId) {
      removePasture(pastureId);
      toast({
        title: "Pasture Deleted",
        description: "The pasture has been permanently deleted",
      });
      navigate('/pastures');
    }
  };
  
  if (!pasture) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in animate-slide-in">
        <div className="flex flex-col gap-6">
          {/* Header with back button and pasture name */}
          <div className="flex items-center justify-between">
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
            
            <Button 
              onClick={() => setIsEditDialogOpen(true)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Pasture
            </Button>
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
          
          <div className="flex justify-center mt-8 pt-6 border-t">
            <Button 
              variant="destructive" 
              className="gap-2" 
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash className="h-4 w-4" />
              Delete Pasture
            </Button>
          </div>
        </div>
      </main>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pasture</DialogTitle>
          </DialogHeader>
          <AddPastureForm pasture={pasture} onSuccess={handleEditSuccess} />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this pasture?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the pasture
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PastureDetail;
