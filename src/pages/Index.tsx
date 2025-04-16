
import { useEffect, useState } from 'react';
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
  BarChart,
  Check,
  AlertTriangle,
  Tractor,
  SunMedium,
  CloudRain,
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

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
  
  // Simulated weather data
  const [weather, setWeather] = useState({
    temperature: Math.floor(Math.random() * 10) + 25,
    condition: Math.random() > 0.5 ? 'sunny' : 'rainy',
    humidity: Math.floor(Math.random() * 20) + 60,
    forecast: [
      { day: 'Hoje', temp: Math.floor(Math.random() * 10) + 25, condition: 'sunny' },
      { day: 'Amanhã', temp: Math.floor(Math.random() * 10) + 24, condition: 'cloudy' },
      { day: 'Seg', temp: Math.floor(Math.random() * 10) + 23, condition: 'rainy' },
    ]
  });

  // Simulate recent activities
  const recentActivities = [
    { id: 1, type: 'weighing', date: new Date(Date.now() - 3600000 * 2), description: 'Pesagem concluída: Lote 1' },
    { id: 2, type: 'pasture', date: new Date(Date.now() - 3600000 * 8), description: 'Transferência: Lote 2 para Pasto A' },
    { id: 3, type: 'inventory', date: new Date(Date.now() - 3600000 * 24), description: 'Baixa de estoque: Ração Premium' },
  ];
  
  // Helper function to format relative time
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    return format(date, 'dd/MM/yyyy');
  };
  
  // Render appropriate weather icon
  const renderWeatherIcon = (condition) => {
    switch(condition) {
      case 'sunny': return <SunMedium className="h-6 w-6 text-amber-500" />;
      case 'rainy': return <CloudRain className="h-6 w-6 text-blue-500" />;
      default: return <SunMedium className="h-6 w-6 text-amber-500" />;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral da sua operação de pecuária.</p>
          </div>
          
          {/* Weather Card */}
          <Card className="w-full sm:w-auto bg-gradient-to-r from-sky-500/10 to-blue-500/5 border-sky-500/20">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                {renderWeatherIcon(weather.condition)}
                <div>
                  <div className="font-medium">{weather.temperature}°C</div>
                  <div className="text-xs text-muted-foreground">
                    Umidade: {weather.humidity}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Farm Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="card-hover-effect card-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Total de Animais</span>
                <Beef className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value">{farmSummary.totalAnimals}</div>
              <div className="stat-label">
                Em {farmSummary.activeLots} lotes ativos
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover-effect">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Área de Pastagem</span>
                <MapPin className="h-4 w-4 text-pasture" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value">{farmSummary.totalPastureArea} ha</div>
              <div className="stat-label">
                Em {farmSummary.totalPastures} pastos
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover-effect">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Valor de Inventário</span>
                <Package className="h-4 w-4 text-cattle" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value">R$ {farmSummary.inventoryValue.toFixed(2)}</div>
              <div className="stat-label">
                {inventory.length} itens em estoque
              </div>
            </CardContent>
          </Card>
          
          <Card className={`card-hover-effect ${farmSummary.pendingSyncs > 0 ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/30' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/30'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Pendente de Sincronização</span>
                <div className={`h-2 w-2 rounded-full ${farmSummary.pendingSyncs > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value">{farmSummary.pendingSyncs}</div>
              <div className="stat-label">
                Registros pendentes de sincronização
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity and Farm Health */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          <Card className="card-hover-effect col-span-1 md:col-span-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className={`mt-0.5 p-1.5 rounded-full 
                    ${activity.type === 'weighing' ? 'bg-primary/10 text-primary' : 
                    activity.type === 'pasture' ? 'bg-pasture/10 text-pasture' : 
                    'bg-cattle/10 text-cattle'}`}>
                    {activity.type === 'weighing' ? <Weight className="h-4 w-4" /> : 
                     activity.type === 'pasture' ? <MapPin className="h-4 w-4" /> : 
                     <Package className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{activity.description}</div>
                    <div className="text-sm text-muted-foreground">{formatRelativeTime(activity.date)}</div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full flex items-center justify-center gap-1">
                Ver todas as atividades
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="card-hover-effect col-span-1 md:col-span-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Tractor className="h-5 w-5 text-primary" />
                Saúde da Fazenda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b pb-3">
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium">Saúde do Rebanho</span>
                  <Badge variant="outline" className="pasture-healthy">Bom</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="border-b pb-3">
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium">Qualidade das Pastagens</span>
                  <Badge variant="outline" className="pasture-warning">Atenção</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium">Nível de Estoque</span>
                  <Badge variant="outline" className="pasture-danger">Crítico</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Weighings */}
          <Card className="card-hover-effect">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Weight className="h-5 w-5 text-primary" />
                Últimas Pesagens
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
                          <div className="font-medium">{lot?.name || 'Lote Desconhecido'}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(weighing.date), 'dd/MM/yyyy')}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-right">
                            {weighing.averageWeight != null ? weighing.averageWeight.toFixed(1) : '0.0'} kg
                          </div>
                          <div className="text-sm flex items-center justify-end gap-1">
                            {weighing.numberOfAnimals} animais
                            <ArrowUp className="h-3 w-3 text-emerald-500" />
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
                  <p>Nenhum registro de pesagem</p>
                  <p className="text-sm mt-1">Adicione registros de pesagem para visualizá-los aqui</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/weighing">Ver todas as pesagens</Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Low Stock Alert */}
          <Card className="card-hover-effect">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Itens com Estoque Baixo
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
                        <div className="font-medium text-right flex items-center justify-end gap-1">
                          {item.quantity < 10 && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                          {item.quantity} {item.unit}
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                          R$ {(item.quantity * (item.costPerUnit || 0)).toFixed(2)}
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
                  <p>Nenhum item no inventário</p>
                  <p className="text-sm mt-1">Adicione itens para controlar seu estoque</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/inventory">Gerenciar inventário</Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Active Pastures */}
          <Card className="card-hover-effect">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Pastagens Ativas
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
                          <div className="font-medium text-right flex items-center justify-end gap-1">
                            {totalAnimals} 
                            <Beef className="h-3 w-3 text-cattle" />
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
                  <p>Nenhuma pastagem cadastrada</p>
                  <p className="text-sm mt-1">Adicione pastagens para gerenciar seu terreno</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/pastures">Ver todas as pastagens</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
