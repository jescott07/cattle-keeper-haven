
import { WifiOff, Cloud, CloudOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SyncStatusProps {
  pendingSyncs: number;
  isOnline: boolean;
}

export const SyncStatus = ({ pendingSyncs, isOnline }: SyncStatusProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <>
                <Cloud className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">Offline</span>
              </>
            )}
            
            {pendingSyncs > 0 && (
              <Badge variant="outline" className="ml-1 h-5 text-xs text-muted-foreground border-amber-500/50">
                {pendingSyncs} pending
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isOnline 
            ? 'Connected. Your data will sync automatically.' 
            : 'Currently offline. Your data is saved locally and will sync when you reconnect.'}
          {pendingSyncs > 0 && (
            <p className="text-xs mt-1">{`${pendingSyncs} item${pendingSyncs === 1 ? '' : 's'} waiting to sync`}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
