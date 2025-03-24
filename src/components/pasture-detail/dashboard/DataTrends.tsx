
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartPieIcon, LineChart } from 'lucide-react';
import { useStore } from '@/lib/store';
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

interface DataTrendsProps {
  qualityData: any[];
  soilData: any[];
  maintenanceData: {
    timeline: any[];
    costs: any[];
  };
  pastureId: string;
}

const DataTrends = ({ qualityData, soilData, maintenanceData, pastureId }: DataTrendsProps) => {
  const lots = useStore(state => state.lots);
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const lotMovements = useStore(state => state.lotMovements);
  
  // Prepare occupancy data on component mount
  useEffect(() => {
    // Get movements involving this pasture (entries and exits)
    const relevantMovements = lotMovements.filter(
      m => m.toPastureId === pastureId || m.fromPastureId === pastureId
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (relevantMovements.length === 0) return;
    
    const occupancyOverTime: any[] = [];
    let currentOccupancy = 0;
    
    // Calculate animal count after each movement
    relevantMovements.forEach(movement => {
      const date = new Date(movement.date);
      
      // If animals entered this pasture
      if (movement.toPastureId === pastureId) {
        currentOccupancy += movement.animalCount;
      }
      
      // If animals left this pasture
      if (movement.fromPastureId === pastureId) {
        currentOccupancy -= movement.animalCount;
      }
      
      // Don't allow negative occupancy
      currentOccupancy = Math.max(0, currentOccupancy);
      
      occupancyOverTime.push({
        date: date.toISOString().split('T')[0],
        occupancy: currentOccupancy
      });
    });
    
    setOccupancyData(occupancyOverTime);
  }, [pastureId, lotMovements, lots]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <LineChart className="h-5 w-5 text-primary" />
          Data Trends
        </CardTitle>
        <CardDescription>
          Track the evolution of pasture quality, soil composition, maintenance, and occupancy over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-10">
          {/* Occupancy Chart */}
          <div>
            <h3 className="text-base font-medium mb-4">Pasture Occupancy Evolution</h3>
            {occupancyData.length > 1 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={occupancyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="occupancy" 
                      name="Number of Animals"
                      stroke="#3b82f6" 
                      activeDot={{ r: 8 }} 
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ChartPieIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Not enough occupancy data to display trends.</p>
                <p className="text-sm">Transfer animals to and from this pasture to see occupancy trends.</p>
              </div>
            )}
          </div>
          
          {/* Quality Metrics Section */}
          <div>
            <h3 className="text-base font-medium mb-4">Quality Metrics</h3>
            {qualityData.length > 1 ? (
              <div className="space-y-8">
                {/* Grass Height Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Grass Height (cm)</h4>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={qualityData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="height" 
                          name="Grass Height (cm)"
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* NDVI Value Chart (Only if data exists) */}
                {qualityData.some(d => d.ndvi !== null) && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">NDVI Value</h4>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart
                          data={qualityData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="ndvi" 
                            name="NDVI Value"
                            stroke="#82ca9d" 
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                
                {/* Grass Color Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Grass Color (1-5 scale)</h4>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={qualityData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 5]} />
                        <RechartsTooltip 
                          formatter={(value, name) => {
                            if (name === 'Grass Color') {
                              const entry = qualityData.find(e => e.color === value);
                              return [entry?.colorName || '', 'Grass Color'];
                            }
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="color" 
                          name="Grass Color"
                          stroke="#ff7300" 
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ChartPieIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Not enough quality data to display trends.</p>
                <p className="text-sm">Add at least two quality evaluations to see the chart.</p>
              </div>
            )}
          </div>
          
          {/* Soil Analysis Section */}
          <div>
            <h3 className="text-base font-medium mb-4">Soil Analysis</h3>
            {soilData.length > 1 ? (
              <div className="space-y-8">
                {/* pH Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Soil pH</h4>
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
                        <Line type="monotone" dataKey="pH" name="pH" stroke="#8884d8" />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Macronutrients Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Macronutrients (P, K, Ca, Mg, S)</h4>
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
                        <Line type="monotone" dataKey="P" name="Phosphorus" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="K" name="Potassium" stroke="#ffc658" />
                        <Line type="monotone" dataKey="Ca" name="Calcium" stroke="#ff8042" />
                        <Line type="monotone" dataKey="Mg" name="Magnesium" stroke="#0088fe" />
                        <Line type="monotone" dataKey="S" name="Sulfur" stroke="#00C49F" />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ChartPieIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Not enough soil analysis data to display trends.</p>
                <p className="text-sm">Add at least two soil analyses to see the chart.</p>
              </div>
            )}
          </div>
          
          {/* Maintenance Section */}
          <div>
            <h3 className="text-base font-medium mb-4">Maintenance</h3>
            {maintenanceData.timeline.length > 0 ? (
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-medium mb-2">Maintenance Activities by Month</h4>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
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
                        <Bar dataKey="water-system" name="Water System" fill="#ff8042" />
                        <Bar dataKey="planting" name="Planting" fill="#0088fe" />
                        <Bar dataKey="harvesting" name="Harvesting" fill="#00C49F" />
                        <Bar dataKey="other" name="Other" fill="#FFBB28" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {maintenanceData.costs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Maintenance Costs by Month</h4>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart
                          data={maintenanceData.costs}
                          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip formatter={(value) => [`$${value}`, 'Cost']} />
                          <Legend />
                          <Line type="monotone" dataKey="cost" name="Maintenance Cost" stroke="#8884d8" />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ChartPieIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>No completed maintenance records to display.</p>
                <p className="text-sm">Add maintenance records and mark them as completed to see the charts.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataTrends;
