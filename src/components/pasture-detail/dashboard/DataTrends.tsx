
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartPieIcon, LineChart } from 'lucide-react';
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
}

const DataTrends = ({ qualityData, soilData, maintenanceData }: DataTrendsProps) => {
  return (
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
              <div className="space-y-8">
                {/* Grass Height Chart */}
                <div>
                  <h3 className="text-base font-medium mb-2">Grass Height (cm)</h3>
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
                    <h3 className="text-base font-medium mb-2">NDVI Value</h3>
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
                  <h3 className="text-base font-medium mb-2">Grass Color (1-5 scale)</h3>
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
          </TabsContent>
          
          <TabsContent value="soil">
            {soilData.length > 1 ? (
              <div className="space-y-8">
                {/* pH Chart */}
                <div>
                  <h3 className="text-base font-medium mb-2">Soil pH</h3>
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
                  <h3 className="text-base font-medium mb-2">Macronutrients (P, K, Ca, Mg, S)</h3>
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
          </TabsContent>
          
          <TabsContent value="maintenance">
            {maintenanceData.timeline.length > 0 ? (
              <div className="space-y-8">
                <div>
                  <h3 className="text-base font-medium mb-2">Maintenance Activities by Month</h3>
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
                    <h3 className="text-base font-medium mb-2">Maintenance Costs by Month</h3>
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataTrends;
