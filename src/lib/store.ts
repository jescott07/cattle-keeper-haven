import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  SyncableModel,
  InventoryItem,
  InventoryItemTemplate,
  Lot,
  Pasture,
  WeighingRecord,
  ConsumptionRecord,
  FarmSummary,
  SoilAnalysis,
  MaintenanceRecord
} from './types';

interface StoreState {
  // Data collections
  inventory: InventoryItem[];
  inventoryTemplates: InventoryItemTemplate[];
  lots: Lot[];
  pastures: Pasture[];
  weighings: WeighingRecord[];
  consumptions: ConsumptionRecord[];
  soilAnalyses: SoilAnalysis[];
  maintenanceRecords: MaintenanceRecord[];
  
  // Connection status
  isOnline: boolean;
  lastSyncTime: Date | null;
  
  // Actions for inventory
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeInventoryItem: (id: string) => void;
  
  // Actions for inventory templates
  addInventoryTemplate: (template: Omit<InventoryItemTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventoryTemplate: (id: string, updates: Partial<InventoryItemTemplate>) => void;
  removeInventoryTemplate: (id: string) => void;
  
  // Actions for lots
  addLot: (lot: Omit<Lot, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'plannedTransfers'>) => void;
  updateLot: (id: string, updates: Partial<Lot>) => void;
  removeLot: (id: string) => void;
  
  // Actions for pastures
  addPasture: (pasture: Omit<Pasture, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'evaluations'>) => void;
  updatePasture: (id: string, updates: Partial<Pasture>) => void;
  removePasture: (id: string) => void;
  addPastureEvaluation: (pastureId: string, evaluation: Omit<Pasture['evaluations'][0], 'id'>) => void;
  
  // Actions for weighings
  addWeighingRecord: (record: Omit<WeighingRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  
  // Actions for consumption
  addConsumptionRecord: (record: Omit<ConsumptionRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  
  // Actions for soil analyses
  addSoilAnalysis: (analysis: Omit<SoilAnalysis, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updateSoilAnalysis: (id: string, updates: Partial<SoilAnalysis>) => void;
  removeSoilAnalysis: (id: string) => void;
  
  // Actions for maintenance records
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => void;
  removeMaintenanceRecord: (id: string) => void;
  completeMaintenanceRecord: (id: string, completedDate: Date, notes?: string) => void;
  
  // Sync actions
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncTime: (time: Date) => void;
  updateSyncStatus: (modelType: string, id: string, status: SyncableModel['syncStatus']) => void;
  
  // Utility functions
  getFarmSummary: () => FarmSummary;
  getPendingSyncs: () => number;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial data
      inventory: [],
      inventoryTemplates: [],
      lots: [],
      pastures: [],
      weighings: [],
      consumptions: [],
      soilAnalyses: [],
      maintenanceRecords: [],
      isOnline: navigator.onLine,
      lastSyncTime: null,
      
      // Inventory actions
      addInventoryItem: (item) => {
        const now = new Date();
        const newItem: InventoryItem = {
          ...item,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending',
          properties: item.properties || []
        };
        
        set(state => ({
          inventory: [...state.inventory, newItem]
        }));
      },
      
      updateInventoryItem: (id, updates) => {
        set(state => ({
          inventory: state.inventory.map(item => 
            item.id === id 
              ? { 
                  ...item, 
                  ...updates, 
                  updatedAt: new Date(), 
                  syncStatus: 'pending' 
                } 
              : item
          )
        }));
      },
      
      removeInventoryItem: (id) => {
        set(state => ({
          inventory: state.inventory.filter(item => item.id !== id)
        }));
      },
      
      // Inventory template actions
      addInventoryTemplate: (template) => {
        const now = new Date();
        const newTemplate: InventoryItemTemplate = {
          ...template,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        };
        
        set(state => ({
          inventoryTemplates: [...state.inventoryTemplates, newTemplate]
        }));
      },
      
      updateInventoryTemplate: (id, updates) => {
        set(state => ({
          inventoryTemplates: state.inventoryTemplates.map(template => 
            template.id === id 
              ? { 
                  ...template, 
                  ...updates, 
                  updatedAt: new Date()
                } 
              : template
          )
        }));
      },
      
      removeInventoryTemplate: (id) => {
        set(state => ({
          inventoryTemplates: state.inventoryTemplates.filter(template => template.id !== id)
        }));
      },
      
      // Lot actions
      addLot: (lot) => {
        const now = new Date();
        const newLot: Lot = {
          ...lot,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending',
          plannedTransfers: []
        };
        
        set(state => ({
          lots: [...state.lots, newLot]
        }));
      },
      
      updateLot: (id, updates) => {
        set(state => ({
          lots: state.lots.map(lot => 
            lot.id === id 
              ? { 
                  ...lot, 
                  ...updates, 
                  updatedAt: new Date(), 
                  syncStatus: 'pending' 
                } 
              : lot
          )
        }));
      },
      
      removeLot: (id) => {
        set(state => ({
          lots: state.lots.filter(lot => lot.id !== id)
        }));
      },
      
      // Pasture actions
      addPasture: (pasture) => {
        const now = new Date();
        const newPasture: Pasture = {
          ...pasture,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending',
          evaluations: []
        };
        
        set(state => ({
          pastures: [...state.pastures, newPasture]
        }));
      },
      
      updatePasture: (id, updates) => {
        set(state => ({
          pastures: state.pastures.map(pasture => 
            pasture.id === id 
              ? { 
                  ...pasture, 
                  ...updates, 
                  updatedAt: new Date(), 
                  syncStatus: 'pending' 
                } 
              : pasture
          )
        }));
      },
      
      removePasture: (id) => {
        set(state => ({
          pastures: state.pastures.filter(pasture => pasture.id !== id)
        }));
      },
      
      addPastureEvaluation: (pastureId, evaluation) => {
        set(state => ({
          pastures: state.pastures.map(pasture => 
            pasture.id === pastureId 
              ? { 
                  ...pasture, 
                  evaluations: [...pasture.evaluations, evaluation],
                  updatedAt: new Date(), 
                  syncStatus: 'pending' 
                } 
              : pasture
          )
        }));
      },
      
      // Weighing actions
      addWeighingRecord: (record) => {
        const now = new Date();
        const newRecord: WeighingRecord = {
          ...record,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending'
        };
        
        set(state => ({
          weighings: [...state.weighings, newRecord]
        }));
      },
      
      // Consumption actions
      addConsumptionRecord: (record) => {
        const now = new Date();
        const newRecord: ConsumptionRecord = {
          ...record,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending'
        };
        
        set(state => ({
          consumptions: [...state.consumptions, newRecord]
        }));
      },
      
      // Soil Analysis actions
      addSoilAnalysis: (analysis) => {
        const now = new Date();
        const newAnalysis: SoilAnalysis = {
          ...analysis,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending'
        };
        
        set(state => ({
          soilAnalyses: [...state.soilAnalyses, newAnalysis]
        }));
      },
      
      updateSoilAnalysis: (id, updates) => {
        set(state => ({
          soilAnalyses: state.soilAnalyses.map(analysis => 
            analysis.id === id 
              ? { 
                  ...analysis, 
                  ...updates, 
                  updatedAt: new Date(), 
                  syncStatus: 'pending' 
                } 
              : analysis
          )
        }));
      },
      
      removeSoilAnalysis: (id) => {
        set(state => ({
          soilAnalyses: state.soilAnalyses.filter(analysis => analysis.id !== id)
        }));
      },
      
      // Maintenance Record actions
      addMaintenanceRecord: (record) => {
        const now = new Date();
        const newRecord: MaintenanceRecord = {
          ...record,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending'
        };
        
        set(state => ({
          maintenanceRecords: [...state.maintenanceRecords, newRecord]
        }));
      },
      
      updateMaintenanceRecord: (id, updates) => {
        set(state => ({
          maintenanceRecords: state.maintenanceRecords.map(record => 
            record.id === id 
              ? { 
                  ...record, 
                  ...updates, 
                  updatedAt: new Date(), 
                  syncStatus: 'pending' 
                } 
              : record
          )
        }));
      },
      
      removeMaintenanceRecord: (id) => {
        set(state => ({
          maintenanceRecords: state.maintenanceRecords.filter(record => record.id !== id)
        }));
      },
      
      completeMaintenanceRecord: (id, completedDate, notes) => {
        set(state => ({
          maintenanceRecords: state.maintenanceRecords.map(record => 
            record.id === id 
              ? { 
                  ...record,
                  status: 'completed',
                  completedDate,
                  notes: notes || record.notes,
                  updatedAt: new Date(),
                  syncStatus: 'pending'
                } 
              : record
          )
        }));
      },
      
      // Sync actions
      setOnlineStatus: (isOnline) => {
        set({ isOnline });
      },
      
      setSyncTime: (time) => {
        set({ lastSyncTime: time });
      },
      
      updateSyncStatus: (modelType, id, status) => {
        set(state => {
          // Determine which collection to update based on modelType
          switch (modelType) {
            case 'inventory':
              return {
                inventory: state.inventory.map(item => 
                  item.id === id ? { ...item, syncStatus: status } : item
                )
              };
            case 'lots':
              return {
                lots: state.lots.map(lot => 
                  lot.id === id ? { ...lot, syncStatus: status } : lot
                )
              };
            case 'pastures':
              return {
                pastures: state.pastures.map(pasture => 
                  pasture.id === id ? { ...pasture, syncStatus: status } : pasture
                )
              };
            case 'weighings':
              return {
                weighings: state.weighings.map(record => 
                  record.id === id ? { ...record, syncStatus: status } : record
                )
              };
            case 'consumptions':
              return {
                consumptions: state.consumptions.map(record => 
                  record.id === id ? { ...record, syncStatus: status } : record
                )
              };
            case 'soilAnalyses':
              return {
                soilAnalyses: state.soilAnalyses.map(analysis => 
                  analysis.id === id ? { ...analysis, syncStatus: status } : analysis
                )
              };
            case 'maintenanceRecords':
              return {
                maintenanceRecords: state.maintenanceRecords.map(record => 
                  record.id === id ? { ...record, syncStatus: status } : record
                )
              };
            default:
              return {};
          }
        });
      },
      
      // Utility functions
      getFarmSummary: () => {
        const state = get();
        
        const totalAnimals = state.lots
          .filter(lot => lot.status === 'active')
          .reduce((sum, lot) => sum + lot.numberOfAnimals, 0);
          
        const totalPastures = state.pastures.length;
        
        const totalLots = state.lots.length;
        
        const activeLots = state.lots.filter(lot => lot.status === 'active').length;
        
        const totalPastureArea = state.pastures.reduce(
          (sum, pasture) => sum + pasture.sizeInHectares, 
          0
        );
        
        const inventoryValue = state.inventory.reduce(
          (sum, item) => sum + (item.quantity * item.costPerUnit), 
          0
        );
        
        const pendingSyncs = state.getPendingSyncs();
        
        return {
          totalAnimals,
          totalPastures,
          totalLots,
          activeLots,
          totalPastureArea,
          inventoryValue,
          pendingSyncs
        };
      },
      
      getPendingSyncs: () => {
        const state = get();
        
        const pendingInventory = state.inventory.filter(i => i.syncStatus === 'pending').length;
        const pendingLots = state.lots.filter(i => i.syncStatus === 'pending').length;
        const pendingPastures = state.pastures.filter(i => i.syncStatus === 'pending').length;
        const pendingWeighings = state.weighings.filter(i => i.syncStatus === 'pending').length;
        const pendingConsumptions = state.consumptions.filter(i => i.syncStatus === 'pending').length;
        const pendingSoilAnalyses = state.soilAnalyses.filter(i => i.syncStatus === 'pending').length;
        const pendingMaintenanceRecords = state.maintenanceRecords.filter(i => i.syncStatus === 'pending').length;
        
        return pendingInventory + pendingLots + pendingPastures + 
               pendingWeighings + pendingConsumptions + 
               pendingSoilAnalyses + pendingMaintenanceRecords;
      }
    }),
    {
      name: 'cattle-keeper-storage',
      // Only persist these properties
      partialize: (state) => ({
        inventory: state.inventory,
        inventoryTemplates: state.inventoryTemplates,
        lots: state.lots,
        pastures: state.pastures,
        weighings: state.weighings,
        consumptions: state.consumptions,
        soilAnalyses: state.soilAnalyses,
        maintenanceRecords: state.maintenanceRecords,
        lastSyncTime: state.lastSyncTime
      })
    }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useStore.getState().setOnlineStatus(true);
  });
  
  window.addEventListener('offline', () => {
    useStore.getState().setOnlineStatus(false);
  });
}
