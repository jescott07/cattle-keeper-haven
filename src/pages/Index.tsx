
import { useEffect } from 'react';
import { 
  LayoutDashboard, 
  Beef, 
  Package, 
  MapPin, 
  Weight, 
  ArrowUp, 
  ArrowDown,
  Calendar,
  Clock,
  BarChart
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/lib/store';

const Index = () => {
  const getFarmSummary = useStore(state => state.getFarmSummary);
  const farmSummary = getFarmSummary();
  const lots = useStore(state => state.lots);
  const pastures = useStore(state => state.pastures);
  const weighings = useStore(state => state.weighings);
  const inventory = useStore(state => state.inventory);
  const consumptions = useStore(state => state.consumptions);
  
  // Sort weighings by date, most recent first
  const recentWeighings = [...weighings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  
  // Inventory with lowest stock (by percentage of usual amount)
  const lowStockItems = inventory
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 3);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in animate-slide-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your cattle management operation.</p>
        </div>
        
        {/* Farm Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="card-hover-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
              <Beef className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{farmSummary.totalAnimals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {farmSummary.activeLots} active lots
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pasture Area</CardTitle>
              <MapPin className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{farmSummary.totalPastureArea} ha</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {farmSummary.totalPastures} pastures
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <Package className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${farmSummary.inventoryValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {inventory.length} items in stock
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Sync</CardTitle>
              <div className={`h-2 w-2 rounded-full ${farmSummary.pendingSyncs > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{farmSummary.pendingSyncs}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pending data synchronization
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Weighings */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Weight className="h-5 w-5" />
                Latest Weighings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentWeighings.length > 0 ? (
                <div className="space-y-4">
                  {recentWeighings.map(weighing => {
                    const lot = lots.find(l => l.id === weighing.lotId);
                    return (
                      <div key={weighing.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div>
                          <div className="font-medium">{lot?.name || 'Unknown Lot'}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(weighing.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-right">{weighing.averageWeight.toFixed(1)} kg avg</div>
                          <div className="text-sm text-muted-foreground text-right">
                            {weighing.numberOfAnimals} animals
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="text-4xl mb-3">
                    <Weight className="h-12 w-12 mx-auto text-muted-foreground/30" />
                  </div>
                  <p>No weighing records yet</p>
                  <p className="text-sm mt-1">Add weighing records to see them here</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Low Stock Alert */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Package className="h-5 w-5" />
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems.length > 0 ? (
                <div className="space-y-4">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {item.type}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-right">
                          {item.quantity} {item.unit}
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                          ${(item.quantity * item.costPerUnit).toFixed(2)} value
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="text-4xl mb-3">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/30" />
                  </div>
                  <p>No inventory items yet</p>
                  <p className="text-sm mt-1">Add items to track your inventory</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Active Pastures */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Active Pastures
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pastures.length > 0 ? (
                <div className="space-y-4">
                  {pastures.slice(0, 3).map(pasture => {
                    const lotsInPasture = lots.filter(l => l.currentPastureId === pasture.id);
                    const totalAnimals = lotsInPasture.reduce((sum, lot) => sum + lot.numberOfAnimals, 0);
                    
                    return (
                      <div key={pasture.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div>
                          <div className="font-medium">{pasture.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {pasture.grassType.replace('-', ' ')}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-right">
                            {totalAnimals} animals
                          </div>
                          <div className="text-sm text-muted-foreground text-right">
                            {pasture.sizeInHectares} hectares
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="text-4xl mb-3">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30" />
                  </div>
                  <p>No pastures yet</p>
                  <p className="text-sm mt-1">Add pastures to manage your land</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
