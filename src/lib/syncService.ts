
import { useStore } from './store';
import { useToast } from '@/hooks/use-toast';

// Simulated API endpoints for real backend
const API_ENDPOINTS = {
  inventory: '/api/inventory',
  lots: '/api/lots',
  pastures: '/api/pastures',
  weighings: '/api/weighings',
  consumptions: '/api/consumptions',
};

// Generic sync function for any data model
const syncData = async (type: string, id: string) => {
  const store = useStore.getState();
  
  // Get the data to sync based on type
  let dataToSync;
  switch (type) {
    case 'inventory':
      dataToSync = store.inventory.find(item => item.id === id);
      break;
    case 'lots':
      dataToSync = store.lots.find(lot => lot.id === id);
      break;
    case 'pastures':
      dataToSync = store.pastures.find(pasture => pasture.id === id);
      break;
    case 'weighings':
      dataToSync = store.weighings.find(record => record.id === id);
      break;
    case 'consumptions':
      dataToSync = store.consumptions.find(record => record.id === id);
      break;
    case 'soilAnalyses':
      dataToSync = store.soilAnalyses.find(analysis => analysis.id === id);
      break;
    case 'maintenanceRecords':
      dataToSync = store.maintenanceRecords.find(record => record.id === id);
      break;
    default:
      throw new Error(`Unknown data type: ${type}`);
  }
  
  if (!dataToSync) {
    throw new Error(`Item with id ${id} not found in ${type}`);
  }
  
  // For demo purposes, we'll just simulate a successful sync
  // In a real app, this would be an API call
  return new Promise<void>((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Mark as synced in the store
      store.updateSyncStatus(type, id, 'synced');
      
      // Update last sync time
      store.setSyncTime(new Date());
      
      resolve();
    }, 800); // Simulate network delay
  });
};

// Hook for syncing pending data
export const useSyncService = () => {
  const { toast } = useToast();
  const isOnline = useStore(state => state.isOnline);
  const getPendingSyncs = useStore(state => state.getPendingSyncs);
  const pendingCount = getPendingSyncs();
  
  // Get all data collections with their types for sync operations
  const inventory = useStore(state => state.inventory);
  const lots = useStore(state => state.lots);
  const pastures = useStore(state => state.pastures);
  const weighings = useStore(state => state.weighings);
  const consumptions = useStore(state => state.consumptions);
  const soilAnalyses = useStore(state => state.soilAnalyses);
  const maintenanceRecords = useStore(state => state.maintenanceRecords);
  
  // Sync all pending items
  const syncPending = async () => {
    if (!isOnline) {
      toast({
        title: 'Sync Failed',
        description: "You're currently offline. Data will sync automatically when connection is restored.",
        variant: 'destructive',
      });
      return;
    }
    
    const pendingCount = getPendingSyncs();
    if (pendingCount === 0) {
      toast({
        title: 'Sync Complete',
        description: 'All data is already synchronized.',
      });
      return;
    }
    
    toast({
      title: 'Sync Started',
      description: `Synchronizing ${pendingCount} pending items...`,
    });
    
    // Get all pending items from each collection
    const pendingInventory = inventory.filter(i => i.syncStatus === 'pending');
    const pendingLots = lots.filter(i => i.syncStatus === 'pending');
    const pendingPastures = pastures.filter(i => i.syncStatus === 'pending');
    const pendingWeighings = weighings.filter(i => i.syncStatus === 'pending');
    const pendingConsumptions = consumptions.filter(i => i.syncStatus === 'pending');
    const pendingSoilAnalyses = soilAnalyses.filter(i => i.syncStatus === 'pending');
    const pendingMaintenanceRecords = maintenanceRecords.filter(i => i.syncStatus === 'pending');
    
    // Create sync promises for all pending items
    const syncPromises = [
      ...pendingInventory.map(item => syncData('inventory', item.id)),
      ...pendingLots.map(item => syncData('lots', item.id)),
      ...pendingPastures.map(item => syncData('pastures', item.id)),
      ...pendingWeighings.map(item => syncData('weighings', item.id)),
      ...pendingConsumptions.map(item => syncData('consumptions', item.id)),
      ...pendingSoilAnalyses.map(item => syncData('soilAnalyses', item.id)),
      ...pendingMaintenanceRecords.map(item => syncData('maintenanceRecords', item.id)),
    ];
    
    try {
      // Wait for all syncs to complete
      await Promise.all(syncPromises);
      
      // Force a refresh of the pending count
      const newPendingCount = getPendingSyncs();
      
      toast({
        title: 'Sync Complete',
        description: `Successfully synchronized ${pendingCount} items.`,
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'Sync Error',
        description: 'Some items failed to synchronize. Please try again later.',
        variant: 'destructive',
      });
    }
  };
  
  // Try to sync a single item
  const syncItem = async (type: string, id: string) => {
    if (!isOnline) {
      toast({
        title: 'Sync Failed',
        description: "You're currently offline. The item will sync when connection is restored.",
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Syncing',
      description: 'Synchronizing item...',
    });
    
    try {
      await syncData(type, id);
      toast({
        title: 'Sync Complete',
        description: 'Item successfully synchronized.',
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'Sync Error',
        description: 'Failed to synchronize the item. Please try again later.',
        variant: 'destructive',
      });
    }
  };
  
  return {
    syncPending,
    syncItem,
    pendingCount,
    isOnline,
  };
};
