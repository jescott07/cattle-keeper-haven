
import { Pasture, SoilAnalysis, MaintenanceRecord } from '@/lib/types';
import { format } from 'date-fns';

export const prepareQualityData = (pasture: Pasture) => {
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

export const prepareSoilAnalysisData = (analyses: SoilAnalysis[]) => {
  if (!analyses || analyses.length === 0) return [];
  
  // Sort analyses by date (oldest to newest)
  const sortedAnalyses = [...analyses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  return sortedAnalyses.map(analysis => ({
    date: format(new Date(analysis.date), 'MMM d, yy'),
    pH: analysis.phLevel,
    P: analysis.phosphorus,
    K: analysis.potassium,
    Ca: analysis.calcium,
    Mg: analysis.magnesium,
    S: analysis.sulfur
  }));
};

export const prepareMaintenanceData = (records: MaintenanceRecord[]) => {
  if (!records || records.length === 0) return { timeline: [], costs: [] };
  
  // Count maintenance by type
  const typeCount = records.reduce((acc, record) => {
    acc[record.type] = (acc[record.type] || 0) + 1;
    return acc;
  }, {} as {[key: string]: number});
  
  // Prepare timeline data
  // Group by month-year
  const monthlyData: {[key: string]: {[key: string]: number}} = {};
  
  records.forEach(record => {
    const monthYear = format(new Date(record.scheduledDate), 'MMM yy');
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
  const costData = records
    .filter(record => record.cost !== undefined)
    .reduce((acc, record) => {
      const monthYear = format(new Date(record.scheduledDate), 'MMM yy');
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
