
import React from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { CircleDollarSign, Users, Weight, User } from 'lucide-react';

interface SaleHistoryProps {
  lotId: string;
}

export const SaleHistory = ({ lotId }: SaleHistoryProps) => {
  const saleRecords = useStore(state => 
    state.saleRecords.filter(record => record.lotId === lotId)
  );

  if (saleRecords.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-green-500" />
            Sale History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No sales recorded for this lot.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort records by date (most recent first)
  const sortedRecords = [...saleRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate totals
  const totalAnimals = saleRecords.reduce((sum, record) => sum + record.numberOfAnimals, 0);
  const totalValue = saleRecords.reduce((sum, record) => sum + record.totalValue, 0);
  const totalWeight = saleRecords.reduce((sum, record) => sum + record.finalWeight, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CircleDollarSign className="h-5 w-5 text-green-500" />
          Sale History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Sale summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 p-3 rounded-md flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-xs text-muted-foreground">Animals Sold</div>
                <div className="font-medium">{totalAnimals}</div>
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-md flex items-center gap-2">
              <Weight className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-xs text-muted-foreground">Total Weight</div>
                <div className="font-medium">{totalWeight.toFixed(2)} kg</div>
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-md flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-xs text-muted-foreground">Total Value</div>
                <div className="font-medium">{totalValue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}</div>
              </div>
            </div>
          </div>

          {/* Sale records */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Sale Records</h3>
            <div className="space-y-3">
              {sortedRecords.map((sale) => (
                <div key={sale.id} className="border rounded-md p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{format(new Date(sale.date), 'PPP')}</div>
                    <div className="text-green-600 font-medium">
                      {sale.totalValue.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{sale.numberOfAnimals} animals</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <span>{sale.finalWeight.toFixed(2)} kg</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Buyer: {sale.buyer}</span>
                    </div>
                  </div>
                  
                  {sale.notes && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {sale.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
