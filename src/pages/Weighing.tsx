
import { useState } from 'react';
import { Weight } from 'lucide-react';
import Navbar from '@/components/Navbar';
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Weighing Records</h1>
          <p className="text-muted-foreground mt-1">Track and manage cattle weights and transfers.</p>
        </div>
        
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
                Back to options
              </button>
            </div>
            <WeighingManager />
          </div>
        )}
      </main>
    </div>
  );
};

export default Weighing;
