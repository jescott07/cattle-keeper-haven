
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
  );
};

export default DataTrends;
