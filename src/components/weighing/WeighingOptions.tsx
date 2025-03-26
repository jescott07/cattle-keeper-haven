
import { ScaleIcon, Weight, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WeighingOptionsProps {
  onSelectManual: () => void;
  onSelectAutomatic: () => void;
}

export function WeighingOptions({ onSelectManual, onSelectAutomatic }: WeighingOptionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/50"
        onClick={onSelectManual}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Weight className="h-5 w-5 text-primary" />
            Individual Weighing
          </CardTitle>
          <CardDescription>
            Manually record weights one animal at a time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Perfect for recording individual weights when weighing animals one by one. Simple and quick recording process.
            </p>
            <Button 
              className="w-full mt-4"
              variant="outline"
              onClick={onSelectManual}
            >
              <Weight className="mr-2 h-4 w-4" />
              Start Manual Weighing
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/50"
        onClick={onSelectAutomatic}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ListFilter className="h-5 w-5 text-primary" />
            Automatic Weighing
          </CardTitle>
          <CardDescription>
            Weigh and automatically transfer animals based on criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Advanced weighing with automatic transfer options. Sort animals into different lots based on weight criteria.
            </p>
            <Button 
              className="w-full mt-4"
              variant="outline"
              onClick={onSelectAutomatic}
            >
              <ListFilter className="mr-2 h-4 w-4" />
              Start Automatic Weighing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
