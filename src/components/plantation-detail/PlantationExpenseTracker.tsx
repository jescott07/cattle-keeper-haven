
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Plus, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// This is a placeholder component to be expanded in the future with full expense tracking functionality

interface PlantationExpenseTrackerProps {
  plantationId: string;
}

export function PlantationExpenseTracker({ plantationId }: PlantationExpenseTrackerProps) {
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const plantation = useStore(state => state.plantations.find(p => p.id === plantationId));
  const expenses = useStore(state => state.plantationExpenses.filter(e => e.plantationId === plantationId));
  
  if (!plantation) return null;
  
  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0) + (plantation.seedCost || 0);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Plantation Expenses</h2>
        <Button onClick={() => setIsAddExpenseDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Record Expense
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Total Expenses
          </CardTitle>
          <CardDescription>
            All plantation expenses including seed costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalExpenses.toFixed(2)}</div>
          <p className="text-muted-foreground">
            ${(plantation.areaInHectares > 0 ? totalExpenses / plantation.areaInHectares : 0).toFixed(2)} per hectare
          </p>
        </CardContent>
      </Card>
      
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          This is a placeholder for the full expense tracking functionality.
        </p>
        <p className="text-muted-foreground">
          In the complete implementation, you'll be able to add, edit, and categorize expenses,
          as well as view expense trends and reports.
        </p>
      </div>
    </div>
  );
}
