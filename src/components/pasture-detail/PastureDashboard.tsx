
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pasture, Lot, SoilAnalysis, MaintenanceRecord } from '@/lib/types';
import { useStore } from '@/lib/store';
import { BarChart, MapPin, Droplet, Ruler, Gauge, Activity, AlertTriangle, CheckCircle, ChartPieIcon, LineChart } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart as RechartsBarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PastureDashboardProps {
  pasture: Pasture;
}

const PastureDashboard = ({ pasture }: PastureDashboardProps) => {
  const lots = useStore(state => state.lots);
  const soilAnalyses = useStore(state => state.soilAnalyses).filter(a => a.pastureId === pasture.id);
  const maintenanceRecords = useStore(state => state.maintenanceRecords).filter(r => r.pastureId === pasture.id);
  
  const lotsInPasture = lots.filter(lot => lot.currentPastureId === pasture.id);
  const totalAnimals = lotsInPasture.reduce((sum, lot) => sum + lot.numberOfAnimals, 0);
  
  // Get the latest evaluation, if any
  const latestEvaluation = pasture.evaluations.length > 0 
    ? [...pasture.evaluations].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0] 
    : null;
    
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-emerald-500';
      case 'good': return 'text-green-500';
      case 'fair': return 'text-amber-500';
      case 'poor': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  // Prepare data for quality tracking chart
  const prepareQualityData = () => {
    if (!pasture.evaluations || pasture.evaluations.length === 0) return [];
    
    // Sort evaluations by date (oldest to newest)
    const sortedEvaluations = [...pasture.evaluations].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sortedEvaluations.map(evaluation => {
      // Map grass color to a numeric value for the chart
      const colorMap = {
        'deep-green': 5,
        'green': 4,
        'yellow-green': 3,
        'yellow': 2,
        'brown': 1
      };
      
      return {
        date: format(new Date(evaluation.date), 'MMM d'),
        height: evaluation.grassHeightCm,
        ndvi: evaluation.ndviValue !== undefined ? evaluation.ndviValue : null,
        color: colorMap[evaluation.grassColor as keyof typeof colorMap] || 0,
        colorName: evaluation.grassColor.replace('-', ' ')
      };
    });
  };

  // Prepare data for soil analysis chart
  const prepareSoilAnalysisData = () => {
    if (!soilAnalyses || soilAnalyses.length === 0) return [];
    
    // Sort analyses by date (oldest to newest)
    const sortedAnalyses = [...soilAnalyses].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sortedAnalyses.map(analysis => ({
      date: format(new Date(analysis.date), 'MMM d, yy'),
      pH: analysis.properties.ph,
      P: analysis.properties.phosphorus,
      K: analysis.properties.potassium,
      Ca: analysis.properties.calcium,
      Mg: analysis.properties.magnesium,
      S: analysis.properties.sulfur || 0
    }));
  };

  // Prepare data for maintenance tracking chart
  const prepareMaintenanceData = () => {
    if (!maintenanceRecords || maintenanceRecords.length === 0) return { timeline: [], costs: [] };
    
    // Count maintenance by type
    const typeCount = maintenanceRecords.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {} as {[key: string]: number});
    
    // Prepare timeline data
    // Group by month-year
    const monthlyData: {[key: string]: {[key: string]: number}} = {};
    
    maintenanceRecords.forEach(record => {
      const monthYear = format(new Date(record.date), 'MMM yy');
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {};
      }
      const type = record.type;
      monthlyData[monthYear][type] = (monthlyData[monthYear][type] || 0) + 1;
    });
    
    // Convert to array for recharts
    const timelineData = Object.entries(monthlyData).map(([monthYear, types]) => {
      return {
        month: monthYear,
        ...types
      };
    }).sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Prepare cost data (sum costs by month)
    const costData = maintenanceRecords
      .filter(record => record.cost !== undefined)
      .reduce((acc, record) => {
        const monthYear = format(new Date(record.date), 'MMM yy');
        if (!acc[monthYear]) {
          acc[monthYear] = 0;
        }
        acc[monthYear] += record.cost || 0;
        return acc;
      }, {} as {[key: string]: number});
    
    // Convert to array for recharts
    const costChartData = Object.entries(costData).map(([month, cost]) => ({
      month,
      cost
    })).sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
    
    return {
      timeline: timelineData,
      costs: costChartData
    };
  };
  
  const qualityData = prepareQualityData();
  const soilData = prepareSoilAnalysisData();
  const maintenanceData = prepareMaintenanceData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Info Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium">{pasture.sizeInHectares} hectares</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Grass Type:</span>
                <span className="font-medium capitalize">{pasture.grassType.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Water Source:</span>
                <span className="font-medium capitalize">{pasture.waterSource.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fence Condition:</span>
                <span className={`font-medium capitalize ${getConditionColor(pasture.fenceCondition)}`}>
                  {pasture.fenceCondition}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">{format(new Date(pasture.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Current Occupancy Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart className="h-4 w-4 text-primary" />
              Current Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Animals:</span>
                <span className="font-medium">{totalAnimals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Number of Lots:</span>
                <span className="font-medium">{lotsInPasture.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stocking Rate:</span>
                <span className="font-medium">
                  {pasture.sizeInHectares > 0 
                    ? (totalAnimals / pasture.sizeInHectares).toFixed(2) 
                    : '0'} animals/ha
                </span>
              </div>
              
              {lotsInPasture.length > 0 ? (
                <div className="border-t mt-4 pt-2">
                  <p className="text-sm font-medium mb-2">Lots in this pasture:</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {lotsInPasture.map(lot => (
                      <div key={lot.id} className="flex justify-between text-sm">
                        <span>{lot.name}</span>
                        <span className="font-medium">{lot.numberOfAnimals} animals</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 text-muted-foreground text-sm">
                  No lots currently in this pasture
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Latest Quality Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              Latest Quality Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestEvaluation ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Evaluated:</span>
                  <span className="font-medium">{format(new Date(latestEvaluation.date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grass Height:</span>
                  <span className="font-medium">{latestEvaluation.grassHeightCm} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grass Color:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: latestEvaluation.grassColor.replace('-', '') }} />
                    <span className="font-medium capitalize">{latestEvaluation.grassColor.replace('-', ' ')}</span>
                  </div>
                </div>
                {latestEvaluation.ndviValue && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NDVI Value:</span>
                    <span className="font-medium">{latestEvaluation.ndviValue.toFixed(2)}</span>
                  </div>
                )}
                
                {latestEvaluation.notes && (
                  <div className="border-t mt-4 pt-2">
                    <p className="text-sm text-muted-foreground">Notes:</p>
                    <p className="text-sm mt-1">{latestEvaluation.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <Activity className="h-8 w-8 mb-2 opacity-50" />
                <p>No quality evaluations yet</p>
                <p className="text-sm">Add one in the Quality Tracking tab</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Data Trend Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            Data Trends
          </CardTitle>
          <CardDescription>
            Track the evolution of pasture quality, soil composition, and maintenance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quality" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
              <TabsTrigger value="soil">Soil Analysis</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quality">
              {qualityData.length > 1 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={qualityData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                      <RechartsTooltip 
                        formatter={(value, name) => {
                          if (name === 'color') {
                            // Convert numeric value back to color name
                            const entry = qualityData.find(e => e.date === (value as any)?.date);
                            return [entry?.colorName || '', 'Grass Color'];
                          }
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="height" 
                        name="Grass Height (cm)"
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                      {qualityData.some(d => d.ndvi !== null) && (
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="ndvi" 
                          name="NDVI Value"
                          stroke="#82ca9d" 
                        />
                      )}
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="color" 
                        name="Grass Color"
                        stroke="#ff7300" 
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ChartPieIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>Not enough quality data to display trends.</p>
                  <p className="text-sm">Add at least two quality evaluations to see the chart.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="soil">
              {soilData.length > 1 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={soilData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="pH" stroke="#8884d8" />
                      <Line type="monotone" dataKey="P" name="Phosphorus" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="K" name="Potassium" stroke="#ffc658" />
                      <Line type="monotone" dataKey="Ca" name="Calcium" stroke="#ff8042" />
                      <Line type="monotone" dataKey="Mg" name="Magnesium" stroke="#0088fe" />
                      <Line type="monotone" dataKey="S" name="Sulfur" stroke="#00C49F" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ChartPieIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>Not enough soil analysis data to display trends.</p>
                  <p className="text-sm">Add at least two soil analyses to see the chart.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="maintenance">
              {maintenanceData.timeline.length > 1 ? (
                <div className="space-y-6">
                  <div className="h-72">
                    <h3 className="text-base font-medium mb-2">Maintenance Activities by Month</h3>
                    <ResponsiveContainer width="100%" height="90%">
                      <RechartsBarChart
                        data={maintenanceData.timeline}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="fertilization" name="Fertilization" fill="#8884d8" />
                        <Bar dataKey="weed-control" name="Weed Control" fill="#82ca9d" />
                        <Bar dataKey="fence-repair" name="Fence Repair" fill="#ffc658" />
                        <Bar dataKey="water-system-check" name="Water System" fill="#ff8042" />
                        <Bar dataKey="seeding" name="Seeding" fill="#0088fe" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {maintenanceData.costs.length > 1 && (
                    <div className="h-72">
                      <h3 className="text-base font-medium mb-2">Maintenance Costs by Month</h3>
                      <ResponsiveContainer width="100%" height="90%">
                        <RechartsLineChart
                          data={maintenanceData.costs}
                          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip formatter={(value) => [`$${value}`, 'Cost']} />
                          <Line type="monotone" dataKey="cost" name="Maintenance Cost" stroke="#8884d8" />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ChartPieIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>Not enough maintenance data to display trends.</p>
                  <p className="text-sm">Add at least two maintenance records to see the chart.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Notes Section */}
      {pasture.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{pasture.notes}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Status Alerts Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Status Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pasture.fenceCondition === 'poor' && (
              <div className="flex items-start gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Fence needs repair</p>
                  <p className="text-sm text-muted-foreground">Fence condition is marked as poor and may need immediate attention.</p>
                </div>
              </div>
            )}
            
            {pasture.fenceCondition === 'fair' && (
              <div className="flex items-start gap-2 text-amber-500">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Fence maintenance recommended</p>
                  <p className="text-sm text-muted-foreground">Fence condition is marked as fair and should be inspected.</p>
                </div>
              </div>
            )}
            
            {latestEvaluation && latestEvaluation.grassColor === 'yellow' && (
              <div className="flex items-start gap-2 text-amber-500">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Grass health concerns</p>
                  <p className="text-sm text-muted-foreground">The grass appears yellow, which may indicate drought stress or nutrient deficiency.</p>
                </div>
              </div>
            )}
            
            {latestEvaluation && latestEvaluation.grassColor === 'brown' && (
              <div className="flex items-start gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Poor grass health</p>
                  <p className="text-sm text-muted-foreground">The grass is brown, indicating possible severe drought or overgrazing.</p>
                </div>
              </div>
            )}
            
            {pasture.fenceCondition !== 'poor' && pasture.fenceCondition !== 'fair' && 
             (!latestEvaluation || (latestEvaluation.grassColor !== 'yellow' && latestEvaluation.grassColor !== 'brown')) && (
              <div className="flex items-start gap-2 text-green-500">
                <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">No urgent issues detected</p>
                  <p className="text-sm text-muted-foreground">Current pasture conditions appear normal.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PastureDashboard;
