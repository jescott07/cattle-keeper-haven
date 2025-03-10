
import { useState } from 'react';
import { Package, Calendar, AlertCircle, Edit, Trash, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';
import { InventoryItem as InventoryItemType, InventoryType } from '@/lib/types';

interface InventoryItemProps {
  item: InventoryItemType;
  onEdit: (item: InventoryItemType) => void;
  onDelete: (id: string) => void;
}

// Inventory type color mapping
export const typeColorMap: Record<InventoryType, { bg: string; text: string; icon: JSX.Element }> = {
  'feed': { 
    bg: 'bg-emerald-500/10', 
    text: 'text-emerald-500', 
    icon: <Package className="h-4 w-4" />
  },
  'mineral': { 
    bg: 'bg-blue-500/10', 
    text: 'text-blue-500', 
    icon: <Package className="h-4 w-4" />
  },
  'medication': { 
    bg: 'bg-amber-500/10', 
    text: 'text-amber-500', 
    icon: <Package className="h-4 w-4" />
  },
  'equipment': { 
    bg: 'bg-gray-500/10', 
    text: 'text-gray-500', 
    icon: <Package className="h-4 w-4" />
  },
  'other': { 
    bg: 'bg-purple-500/10', 
    text: 'text-purple-500', 
    icon: <Package className="h-4 w-4" />
  }
};

export const InventoryItem = ({ item, onEdit, onDelete }: InventoryItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { bg, text, icon } = typeColorMap[item.type];
  
  const isNearExpiry = item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(item.id);
    } else {
      setShowDeleteConfirm(true);
    }
  };
  
  return (
    <Card 
      className="overflow-hidden card-hover-effect"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowDeleteConfirm(false);
      }}
    >
      <CardHeader className="p-4 pb-3">
        <div className="flex justify-between items-start">
          <Badge className={`${bg} ${text} h-6`}>
            {icon}
            <span className="ml-1 capitalize">{item.type}</span>
          </Badge>
          
          {item.purchaseDate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(item.purchaseDate), 'MMM d, yyyy')}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Purchase Date</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <CardTitle className="text-lg mt-1 flex items-center gap-2">
          {item.name}
          {isNearExpiry && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Expires soon: {format(new Date(item.expiryDate!), 'MMM d, yyyy')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 pb-2">
        <div className="flex justify-between text-sm">
          <div className="font-medium">
            {item.quantity} {item.unit}
          </div>
          
          <div className="text-muted-foreground">
            ${item.costPerUnit.toFixed(2)} per {item.unit}
          </div>
        </div>
        
        {item.notes && (
          <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {item.notes}
          </div>
        )}
        
        {item.properties && item.properties.length > 0 && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {item.properties.length} properties
            </Badge>
          </div>
        )}
      </CardContent>
      
      <CardFooter className={`p-4 pt-2 grid grid-cols-3 gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => onEdit(item)}
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
        
        <Button 
          variant={showDeleteConfirm ? "destructive" : "outline"} 
          size="sm" 
          className="gap-2"
          onClick={handleDelete}
        >
          <Trash className="h-4 w-4" />
          {showDeleteConfirm ? "Confirm" : "Delete"}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          asChild
        >
          <Link to={`/inventory/${item.id}`}>
            <FileText className="h-4 w-4" />
            Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
