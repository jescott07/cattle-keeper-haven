
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wheat } from 'lucide-react';

interface NutritionHistoryProps {
  lotId: string;
}

export function NutritionHistory({ lotId }: NutritionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Wheat className="h-5 w-5" />
          Nutrition History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid place-content-center h-[300px] text-center">
          <div className="text-muted-foreground">
            <p>Nutrition tracking will be available in future updates</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
