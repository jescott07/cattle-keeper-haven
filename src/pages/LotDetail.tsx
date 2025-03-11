import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit } from 'lucide-react';
import { LotHeader } from '@/components/lot-detail/LotHeader';
import { AnimalEvolution } from '@/components/lot-detail/AnimalEvolution';
import { WeightDistribution } from '@/components/lot-detail/WeightDistribution';
import { DailyGainChart } from '@/components/lot-detail/DailyGainChart';
import { PastureHistory } from '@/components/lot-detail/PastureHistory';
import { NutritionHistory } from '@/components/lot-detail/NutritionHistory';
import { TransferHistory } from '@/components/lot-detail/TransferHistory';
import { TotalWeightProjection } from '@/components/lot-detail/TotalWeightProjection';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddLotForm } from '@/components/AddLotForm';
import { useToast } from '@/hooks/use-toast';

export default function LotDetail() {
  const { lotId } = useParams<{ lotId: string }>();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const lot = useStore(state => state.lots.find(l => l.id === lotId));
  const weighings = useStore(state => state.weighings.filter(w => w.lotId === lotId));
  const pastures = useStore(state => state.pastures);
  
  useEffect(() => {
    if (!lot) {
      toast({
        title: "Lot not found",
        description: "The requested lot could not be found",
        variant: "destructive"
      });
    }
  }, [lot, toast]);
  
  const getPastureName = (id: string) => {
    const pasture = pastures.find(p => p.id === id);
    return pasture ? pasture.name : 'Unknown';
  };
  
  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    toast({
      title: "Lot Updated",
      description: "Lot details have been updated successfully"
    });
  };
  
  if (!lot) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold">Lot Not Found</h1>
            <p className="mt-2 text-muted-foreground">The requested lot could not be found.</p>
            <Button asChild className="mt-4">
              <Link to="/lots">Back to Lots</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <Button variant="ghost" asChild className="mb-2 -ml-3 gap-1">
                <Link to="/lots">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Lots
                </Link>
              </Button>
              
              <LotHeader 
                lot={lot} 
                pastureName={getPastureName(lot.currentPastureId || '')} 
              />
            </div>
            
            <Button 
              onClick={() => setIsEditDialogOpen(true)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Lot
            </Button>
          </div>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mt-6"
          >
            <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="weights">Weights</TabsTrigger>
              <TabsTrigger value="transfers">Transfers</TabsTrigger>
              <TabsTrigger value="daily-gain">Daily Gain</TabsTrigger>
              <TabsTrigger value="pastures">Pastures</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimalEvolution lotId={lot.id} />
                <TotalWeightProjection lotId={lot.id} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WeightDistribution weighings={weighings} />
                <DailyGainChart weighings={weighings} />
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <DailyGainPerAnimalChart weighings={weighings} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TransferHistory lotId={lot.id} /> 
                <PastureHistory lotId={lot.id} />
              </div>
            </TabsContent>
            
            <TabsContent value="weights" className="mt-6">
              <WeightDistribution weighings={weighings} showFullChart />
            </TabsContent>
            
            <TabsContent value="transfers" className="mt-6">
              <TransferHistory lotId={lot.id} showFullHistory />
            </TabsContent>
            
            <TabsContent value="daily-gain" className="mt-6 space-y-6">
              <DailyGainChart weighings={weighings} showFullChart />
              <DailyGainPerAnimalChart weighings={weighings} showFullChart />
            </TabsContent>
            
            <TabsContent value="pastures" className="mt-6">
              <PastureHistory lotId={lot.id} />
            </TabsContent>
            
            <TabsContent value="nutrition" className="mt-6">
              <NutritionHistory lotId={lot.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lot</DialogTitle>
          </DialogHeader>
          <AddLotForm lot={lot} onSuccess={handleEditSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
