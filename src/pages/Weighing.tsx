
import { useState } from 'react';
import { Weight, Plus, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { WeighingForm } from '@/components/WeighingForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/lib/store';

const Weighing = () => {
  const weighings = useStore(state => state.weighings);
  const lots = useStore(state => state.lots);
  
  // Sort weighings by date, most recent first
  const recentWeighings = [...weighings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in animate-slide-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Weighing Records</h1>
          <p className="text-muted-foreground mt-1">Track and manage cattle weights and transfers.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weighing Form */}
          <div className="lg:col-span-1">
            <WeighingForm />
          </div>
          
          {/* Recent Weighings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Weight className="h-5 w-5" />
                  Recent Weighings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentWeighings.length > 0 ? (
                  <div className="divide-y">
                    {recentWeighings.map(weighing => {
                      const lot = lots.find(l => l.id === weighing.lotId);
                      const destinationLot = weighing.destinationLotId
                        ? lots.find(l => l.id === weighing.destinationLotId)
                        : null;
                      
                      return (
                        <div key={weighing.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{lot?.name || 'Unknown Lot'}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(weighing.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{weighing.totalWeight.toFixed(1)} kg total</div>
                              <div className="text-sm text-muted-foreground">
                                {weighing.averageWeight.toFixed(1)} kg avg • {weighing.numberOfAnimals} animals
                              </div>
                            </div>
                          </div>
                          
                          {destinationLot && (
                            <div className="bg-muted/30 px-3 py-2 rounded text-sm mt-2">
                              <span className="font-medium">Transfer: </span>
                              {weighing.numberOfAnimals} animals transferred to {destinationLot.name}
                            </div>
                          )}
                          
                          {weighing.notes && (
                            <div className="text-sm text-muted-foreground mt-2">{weighing.notes}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Weight className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p>No weighing records yet</p>
                    <p className="text-sm mt-1">Use the form to add your first record</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Weighing;
