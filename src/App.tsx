import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Lots from "./pages/Lots";
import LotDetail from "./pages/LotDetail";
import Inventory from "./pages/Inventory";
import InventoryItemDetail from "./pages/InventoryItemDetail";
import Pastures from "./pages/Pastures";
import PastureDetail from "./pages/PastureDetail"; 
import Weighing from "./pages/Weighing";
import Plantations from "./pages/Plantations";
import PlantationDetail from "./pages/PlantationDetail";
import NotFound from "./pages/NotFound";
import SanitaryControl from './pages/SanitaryControl';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/lots" element={<Lots />} />
          <Route path="/lots/:lotId" element={<LotDetail />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/:itemId" element={<InventoryItemDetail />} />
          <Route path="/pastures" element={<Pastures />} />
          <Route path="/pastures/:pastureId" element={<PastureDetail />} />
          <Route path="/weighing" element={<Weighing />} />
          <Route path="/plantations" element={<Plantations />} />
          <Route path="/plantations/:plantationId" element={<PlantationDetail />} />
          <Route path="/sanitary-control" element={<SanitaryControl />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
