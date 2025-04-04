import { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export interface TransferCriterion {
  id: string;
  weightValue: number | string;  // Modified to accept both number and string
  condition: 'less-than-or-equal' | 'greater-than';
  destinationLotId: string;
}

interface TransferCriteriaProps {
  criteria: TransferCriterion[];
  onChange: (criteria: TransferCriterion[]) => void;
  availableLots: { id: string; name: string; }[];
  onCreateLot: (lotName: string) => void;
}

export function TransferCriteria({ criteria, onChange, availableLots, onCreateLot }: TransferCriteriaProps) {
  const [newLotName, setNewLotName] = useState('');
  
  const handleAddCriterion = () => {
    const newCriteria = [
      ...criteria,
      {
        id: `criterion-${Date.now()}`,
        weightValue: '', // Empty string as default
        condition: 'greater-than' as const,
        destinationLotId: ''
      }
    ];
    onChange(newCriteria);
  };
  
  const handleRemoveCriterion = (id: string) => {
    const newCriteria = criteria.filter(c => c.id !== id);
    onChange(newCriteria);
  };
  
  const handleCriterionChange = (
    id: string, 
    field: keyof TransferCriterion, 
    value: string | number
  ) => {
    const newCriteria = criteria.map(c => {
      if (c.id === id) {
        // Trim leading zeros for weightValue
        if (field === 'weightValue') {
          const trimmedValue = typeof value === 'string' 
            ? value.replace(/^0+/, '') || '' 
            : value;
          
          return { 
            ...c, 
            [field]: trimmedValue
          };
        }
        return { ...c, [field]: value };
      }
      return c;
    });
    
    onChange(newCriteria);
  };
  
  const handleCreateLot = () => {
    if (newLotName.trim()) {
      onCreateLot(newLotName.trim());
      setNewLotName('');
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Transfer Criteria</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleAddCriterion}
          className="gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Criterion
        </Button>
      </div>
      
      {criteria.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No transfer criteria defined. Animals will remain in the current lot.
        </div>
      ) : (
        <div className="space-y-3">
          {criteria.map((criterion) => (
            <div key={criterion.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-1 text-center">If</div>
              <div className="col-span-3">
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={criterion.weightValue}
                  onChange={(e) => handleCriterionChange(
                    criterion.id, 
                    'weightValue', 
                    e.target.value
                  )}
                  placeholder="Weight"
                />
              </div>
              <div className="col-span-3">
                <Select
                  value={criterion.condition}
                  onValueChange={(value) => handleCriterionChange(
                    criterion.id, 
                    'condition', 
                    value as 'less-than-or-equal' | 'greater-than'
                  )}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less-than-or-equal">≤ (less than or equal)</SelectItem>
                    <SelectItem value="greater-than">&gt; (greater than)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1 text-center">→</div>
              <div className="col-span-3">
                <Select
                  value={criterion.destinationLotId}
                  onValueChange={(value) => handleCriterionChange(
                    criterion.id, 
                    'destinationLotId', 
                    value
                  )}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Destination lot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLots.map(lot => (
                      <SelectItem key={lot.id} value={lot.id}>
                        {lot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveCriterion(criterion.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="pt-2 border-t">
        <Label className="mb-2 block">Create New Lot</Label>
        <div className="flex gap-2">
          <Input
            placeholder="New lot name/number"
            value={newLotName}
            onChange={(e) => setNewLotName(e.target.value)}
          />
          <Button 
            type="button" 
            onClick={handleCreateLot}
            disabled={!newLotName.trim()}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
