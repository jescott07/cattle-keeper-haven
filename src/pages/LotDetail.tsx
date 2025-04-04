
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash, Scale, ArrowLeftRight, TreePine, CircleDollarSign, Skull, Wheat } from 'lucide-react';
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
import { PastureTransfer } from '@/components/pasture-management/PastureTransfer';
import { TransferManagement } from '@/components/lot-detail/TransferManagement';
import { DeathHistory } from '@/components/lot-detail/DeathHistory';
import { SaleHistory } from '@/components/lot-detail/SaleHistory';
import { SaleManagement } from '@/components/lot-detail/SaleManagement';
import { MortalityTracker } from '@/components/lot-detail/MortalityTracker';
import { DietManagement } from '@/components/lot-detail/DietManagement';
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

export default function LotDetail() {
  const { lotId } = useParams<{ lotId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPastureTransferDialogOpen, setIsPastureTransferDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isMortalityDialogOpen, setIsMortalityDialogOpen] = useState(false);
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [isDietDialogOpen, setIsDietDialogOpen] = useState(false);
  
  const lot = useStore(state => state.lots.find(l => l.id === lotId));
  const weighings = useStore(state => state.weighings.filter(w => w.lotId === lotId));
  const pastures = useStore(state => state.pastures);
  const removeLot = useStore(state => state.removeLot);
  
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
  
  const handleDelete = () => {
    if (lotId) {
      removeLot(lotId);
      toast({
        title: "Lot Deleted",
        description: "The lot has been permanently deleted",
      });
      navigate('/lots');
    }
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
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsEditDialogOpen(true)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Lot
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => navigate('/weighing')}
            >
              <Scale className="h-4 w-4" />
              Go to Weighing
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setIsPastureTransferDialogOpen(true)}
            >
              <TreePine className="h-4 w-4" />
              Pasture Management
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setIsTransferDialogOpen(true)}
            >
              <ArrowLeftRight className="h-4 w-4" />
              Transfer Management
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setIsMortalityDialogOpen(true)}
            >
              <Skull className="h-4 w-4" />
              Record Mortality
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setIsDietDialogOpen(true)}
            >
              <Wheat className="h-4 w-4" />
              Manage Diet
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-green-600 border-green-200 hover:text-green-700 hover:bg-green-50 hover:border-green-300"
              onClick={() => setIsSaleDialogOpen(true)}
              disabled={lot.status === 'sold' || lot.numberOfAnimals === 0}
            >
              <CircleDollarSign className="h-4 w-4" />
              Register Sale
            </Button>
          </div>
          
          {/* Removed Tabs component and now showing content directly */}
          <div className="mt-6">
            <div className="bg-card rounded-lg p-6 border mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Weight Analysis</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimalEvolution lotId={lot.id} />
                <TotalWeightProjection lotId={lot.id} />
                <WeightDistribution weighings={weighings} showFullChart />
                <DailyGainChart weighings={weighings} showFullChart />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <PastureHistory lotId={lot.id} />
              <TransferHistory lotId={lot.id} showFullHistory />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <DeathHistory lotId={lot.id} />
              <NutritionHistory lotId={lot.id} />
            </div>

            <div className="mb-8">
              <SaleHistory lotId={lot.id} />
            </div>
          </div>
          
          <div className="flex justify-center mt-12 pt-6 border-t">
            <Button 
              variant="destructive" 
              className="gap-2" 
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash className="h-4 w-4" />
              Delete Lot
            </Button>
          </div>
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
      
      <Dialog open={isPastureTransferDialogOpen} onOpenChange={setIsPastureTransferDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5" />
              Pasture Management
            </DialogTitle>
          </DialogHeader>
          <PastureTransfer initialLotId={lot.id} onTransferComplete={() => setIsPastureTransferDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Transfer Management
            </DialogTitle>
          </DialogHeader>
          <TransferManagement initialLotId={lot.id} onTransferComplete={() => setIsTransferDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isMortalityDialogOpen} onOpenChange={setIsMortalityDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Skull className="h-5 w-5" />
              Record Mortality
            </DialogTitle>
          </DialogHeader>
          <MortalityTracker lotId={lot.id} onMortalityAdded={() => setIsMortalityDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isDietDialogOpen} onOpenChange={setIsDietDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wheat className="h-5 w-5" />
              Diet Management
            </DialogTitle>
          </DialogHeader>
          <DietManagement lotId={lot.id} onComplete={() => setIsDietDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isSaleDialogOpen} onOpenChange={setIsSaleDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5" />
              Register Sale
            </DialogTitle>
          </DialogHeader>
          <SaleManagement initialLotId={lot.id} onSaleComplete={() => setIsSaleDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this lot?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lot
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
}
