
import React from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pasture, Lot } from '@/lib/types';
import BasicInfo from './dashboard/BasicInfo';
import Occupancy from './dashboard/Occupancy';
import QualityStatus from './dashboard/QualityStatus';
import DataTrends from './dashboard/DataTrends';
import StatusAlerts from './dashboard/StatusAlerts';
import { prepareQualityData, prepareSoilAnalysisData, prepareMaintenanceData } from './utils/preparePastureData';

interface PastureDashboardProps {
  pasture: Pasture;
}

const PastureDashboard = ({ pasture }: PastureDashboardProps) => {
  const lots = useStore(state => state.lots);
  const soilAnalyses = useStore(state => state.soilAnalyses).filter(a => a.pastureId === pasture.id);
  const maintenanceRecords = useStore(state => state.maintenanceRecords).filter(r => r.pastureId === pasture.id);
  
  const lotsInPasture = lots.filter(lot => lot.currentPastureId === pasture.id);
  const latestEvaluation = pasture.evaluations.length > 0 
    ? [...pasture.evaluations].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0] 
    : null;
  
  const qualityData = prepareQualityData(pasture);
  const soilData = prepareSoilAnalysisData(soilAnalyses);
  const maintenanceData = prepareMaintenanceData(maintenanceRecords);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BasicInfo pasture={pasture} />
        <Occupancy lots={lotsInPasture} pastureSize={pasture.sizeInHectares} />
        <QualityStatus latestEvaluation={latestEvaluation} />
      </div>
      
      <DataTrends 
        qualityData={qualityData}
        soilData={soilData}
        maintenanceData={maintenanceData}
      />
      
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
      
      <StatusAlerts pasture={pasture} latestEvaluation={latestEvaluation} />
    </div>
  );
};

export default PastureDashboard;
