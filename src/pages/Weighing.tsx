
import { useState } from 'react';
import { Weight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { PageHeader } from '@/components/ui/page-header';
import { WeighingOptions } from '@/components/weighing/WeighingOptions';
import { ManualWeighing } from '@/components/weighing/ManualWeighing';
import WeighingManager from '@/components/weighing/WeighingManager';
import { useStore } from '@/lib/store';

const Weighing = () => {
  const [mode, setMode] = useState<'select' | 'manual' | 'automatic'>('select');
  const weighings = useStore(state => state.weighings);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <PageHeader
            heading="Registros de Pesagem"
            subheading="Acompanhe e gerencie pesagens e transferências de gado"
            icon={<Weight className="h-8 w-8 text-primary" />}
            className="mb-4"
          />
          
          {mode === 'select' && (
            <WeighingOptions 
              onSelectManual={() => setMode('manual')}
              onSelectAutomatic={() => setMode('automatic')}
            />
          )}
          
          {mode === 'manual' && (
            <ManualWeighing 
              onBack={() => setMode('select')}
            />
          )}
          
          {mode === 'automatic' && (
            <div className="animate-fade-in">
              <div className="mb-4">
                <button 
                  onClick={() => setMode('select')}
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  Voltar às opções
                </button>
              </div>
              <WeighingManager />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Weighing;
