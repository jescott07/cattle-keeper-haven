
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
  MaintenanceRecord,
  PasturePlanning,
  MortalityRecord,
  Plantation,
  PestControl,
  PlantationExpense,
  PlantationMaintenance,
  ProductivityRecord,
  PlantationTask,
  HarvestRecord,
  SaleRecord,
  DietRecord
} from './types';
import { convertUnits } from './constants';

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
  mortalityRecords: MortalityRecord[];
  dietRecords: DietRecord[];
  
  // Plantation Management collections
  plantations: Plantation[];
  pestControls: PestControl[];
  plantationExpenses: PlantationExpense[];
  plantationMaintenances: PlantationMaintenance[];
  productivityRecords: ProductivityRecord[];
  plantationTasks: PlantationTask[];
  harvestRecords: HarvestRecord[];
  
  // Sale records collection
  saleRecords: SaleRecord[];
  
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
  
  // Pasture transfer action
  schedulePastureTransfer: (planning: Omit<PasturePlanning, 'id'>) => void;
  
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
  
  // Actions for mortality records
  addMortalityRecord: (record: Omit<MortalityRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  
  // Actions for diet records
  addDietRecord: (record: DietRecord) => void;
  updateDietRecord: (id: string, updates: Partial<DietRecord>) => void;
  removeDietRecord: (id: string) => void;
  
  // Actions for plantations
  addPlantation: (plantation: Omit<Plantation, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updatePlantation: (id: string, updates: Partial<Plantation>) => void;
  removePlantation: (id: string) => void;
  
  // Actions for pest controls
  addPestControl: (control: Omit<PestControl, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updatePestControl: (id: string, updates: Partial<PestControl>) => void;
  removePestControl: (id: string) => void;
  
  // Actions for plantation expenses
  addPlantationExpense: (expense: Omit<PlantationExpense, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updatePlantationExpense: (id: string, updates: Partial<PlantationExpense>) => void;
  removePlantationExpense: (id: string) => void;
  
  // Actions for plantation maintenances
  addPlantationMaintenance: (maintenance: Omit<PlantationMaintenance, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updatePlantationMaintenance: (id: string, updates: Partial<PlantationMaintenance>) => void;
  removePlantationMaintenance: (id: string) => void;
  
  // Actions for productivity records
  addProductivityRecord: (record: Omit<ProductivityRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updateProductivityRecord: (id: string, updates: Partial<ProductivityRecord>) => void;
  removeProductivityRecord: (id: string) => void;
  
  // Actions for plantation tasks
  addPlantationTask: (task: Omit<PlantationTask, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'inventoryItemProcessed'>) => void;
  updatePlantationTask: (id: string, updates: Partial<PlantationTask>) => void;
  removePlantationTask: (id: string) => void;
  completePlantationTask: (id: string, completedDate: Date) => void;
  
  // Actions for harvest records
  addHarvestRecord: (record: Omit<HarvestRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'addedToInventory'>) => void;
  updateHarvestRecord: (id: string, updates: Partial<HarvestRecord>) => void;
  removeHarvestRecord: (id: string) => void;
  
  // Actions for sale records
  addSaleRecord: (record: Omit<SaleRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updateSaleRecord: (id: string, updates: Partial<SaleRecord>) => void;
  removeSaleRecord: (id: string) => void;
  
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
      mortalityRecords: [],
      dietRecords: [],
      plantations: [],
      pestControls: [],
      plantationExpenses: [],
      plantationMaintenances: [],
      productivityRecords: [],
      plantationTasks: [],
      harvestRecords: [],
      saleRecords: [],
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
      
      // Pasture transfer action
      schedulePastureTransfer: (planning) => {
        const { lotId, fromPastureId, toPastureId, scheduledDate, completed, notes } = planning;
        
        set(state => {
          const lotToUpdate = state.lots.find(lot => lot.id === lotId);
          
          if (!lotToUpdate) return state;
          
          const transfer: PasturePlanning = {
            ...planning,
            completedDate: completed ? scheduledDate : undefined,
          };
          
          if (completed) {
            return {
              lots: state.lots.map(lot => 
                lot.id === lotId 
                  ? { 
                      ...lot, 
                      currentPastureId: toPastureId,
                      plannedTransfers: [...lot.plannedTransfers, transfer],
                      updatedAt: new Date(), 
                      syncStatus: 'pending' 
                    } 
                  : lot
              )
            };
          } else {
            return {
              lots: state.lots.map(lot => 
                lot.id === lotId 
                  ? { 
                      ...lot, 
                      plannedTransfers: [...lot.plannedTransfers, transfer],
                      updatedAt: new Date(), 
                      syncStatus: 'pending' 
                    } 
                  : lot
              )
            };
          }
        });
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
      
      // Mortality record actions
      addMortalityRecord: (record) => {
        const now = new Date();
        const newRecord: MortalityRecord = {
          ...record,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending'
        };
        
        set(state => ({
          mortalityRecords: [...state.mortalityRecords, newRecord]
        }));
        
        // Also update the lot's animal count
        const { lotId } = record;
        const lot = get().lots.find(l => l.id === lotId);
        
        if (lot) {
          set(state => ({
            lots: state.lots.map(lot => 
              lot.id === lotId 
                ? { 
                    ...lot, 
                    numberOfAnimals: Math.max(0, lot.numberOfAnimals - 1),
                    updatedAt: new Date(), 
                    syncStatus: 'pending' 
                  } 
                : lot
            )
          }));
        }
      },
      
      // Diet record actions
      addDietRecord: (record) => {
        set(state => ({
          dietRecords: [...state.dietRecords, record]
        }));
        
        // If the record has a lastConsumptionDate, deduct from inventory immediately
        if (record.lastConsumptionDate) {
          const { inventoryItemId, totalQuantity, unit } = record;
          const inventory = get().inventory;
          const item = inventory.find(i => i.id === inventoryItemId);
          
          if (item) {
            // Convert if units don't match
            let consumptionInItemUnit = totalQuantity;
            if (unit !== item.unit) {
              const consumptionInKg = convertUnits(totalQuantity, unit, 'kg');
              consumptionInItemUnit = convertUnits(consumptionInKg, 'kg', item.unit);
            }
            
            // Update inventory with reduced quantity
            set(state => ({
              inventory: state.inventory.map(i => 
                i.id === inventoryItemId 
                  ? { 
                      ...i, 
                      quantity: Math.max(0, i.quantity - consumptionInItemUnit),
                      updatedAt: new Date(),
                      syncStatus: 'pending'
                    } 
                  : i
              )
            }));
          }
        }
      },
      
      updateDietRecord: (id, updates) => {
        set(state => ({
          dietRecords: state.dietRecords.map(record => 
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
      
      removeDietRecord: (id) => {
        set(state => ({
          dietRecords: state.dietRecords.filter(record => record.id !== id)
        }));
      },
      
      // Plantation actions
      addPlantation: (plantation) => {
        const now = new Date();
        const newPlantation: Plantation = {
          ...plantation,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending'
        };
        
        set(state => ({
          plantations: [...state.plantations, newPlantation]
        }));
      },
      
      updatePlantation: (id, updates) => {
        set(state => ({
          plantations: state.plantations.map(plantation => 
            plantation.id === id 
              ? { 
                  ...plantation, 
                  ...updates, 
                  updatedAt: new Date(), 
                  syncStatus: 'pending' 
                } 
              : plantation
          )
        }));
      },
      
      removePlantation: (id) => {
        set(state => ({
          plantations: state.plantations.filter(plantation => plantation.id !== id)
        }));
      },
      
      // Pest control actions
      addPestControl: (control) => {
        const now = new Date();
        const newControl: PestControl = {
          ...control,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending'
        };
        
        set(state => ({
          pestControls: [...state.pestControls, newControl]
        }));
      },
      
      updatePestControl: (id, updates) => {
        set(state => ({
          pestControls: state.pestControls.map(control => 
            control.id === id 
              ? { 
                  ...control, 
                  ...updates, 
                  updatedAt: new Date(), 
                  syncStatus: 'pending' 
                } 
              : control
          )
        }));
      },
      
      removePestControl: (id) => {
        set(state => ({
          pestControls: state.pestControls.filter(control => control.id !== id)
        }));
      },
      
      // Plantation expense actions
      addPlantationExpense: (expense) => {
        const now = new Date();
        const newExpense: PlantationExpense = {
          ...expense,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending'
        };
        
        set(state => ({
          plantationExpenses: [...state.plantationExpenses, newExpense]
        }));
      },
      
      updatePlantationExpense: (id, updates) => {
        set(state => ({
          plantationExpenses: state.plantationExpenses.map(expense => 
            expense.id === id 
              ? { 
                  ...expense, 
                  ...updates, 
                  updatedAt: new Date(), 
                  syncStatus: 'pending' 
                } 
              : expense
          )
        }));
      },
      
      removePlantationExpense: (id) => {
        set(state => ({
          plantationExpenses: state.plantationExpenses.filter(expense => expense.id !== id)
        }));
      },
      
      // Plantation maintenance actions
      addPlantationMaintenance: (maintenance) => {
        const now = new Date();
        const newMaintenance: PlantationMaintenance = {
          ...maintenance,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending'
        };
        
        set(state => ({
          plantationMaintenances: [...state.plantationMaintenances, newMaintenance]
        }));
      },
      
      updatePlantationMaintenance: (id, updates) => {
        set(state => ({
          plantationMaintenances: state.plantationMaintenances.map(maintenance => 
            maintenance.id === id 
              ? { 
                  ...maintenance, 
                  ...updates, 
                  updatedAt: new Date(), 
                  syncStatus: 'pending' 
                } 
              : maintenance
          )
        }));
      },
      
      removePlantationMaintenance: (id) => {
        set(state => ({
          plantationMaintenances: state.plantationMaintenances.filter(maintenance => maintenance.id !== id)
        }));
      },
      
      // Productivity record actions
      addProductivityRecord: (record) => {
        const now = new Date();
        const newRecord: ProductivityRecord = {
          ...record,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending'
        };
        
        set(state => ({
          productivityRecords: [...state.productivityRecords, newRecord]
        }));
      },
      
      updateProductivityRecord: (id, updates) => {
        set(state => ({
          productivityRecords: state.productivityRecords.map(record => 
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
      
      removeProductivityRecord: (id) => {
        set(state => ({
          productivityRecords: state.productivityRecords.filter(record => record.id !== id)
        }));
      },
      
      // Actions for plantation tasks
      addPlantationTask: (task) => {
        const now = new Date();
        const newTask: PlantationTask = {
          ...task,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending',
          inventoryItemProcessed: false
        };
        
        set(state => ({
          plantationTasks: [...state.plantationTasks, newTask]
        }));
        
        // If the task is already completed and uses inventory, update inventory
        if (task.status === 'completed' && task.inventoryItemId && task.inventoryItemQuantity) {
          const { inventoryItemId, inventoryItemQuantity } = task;
          const inventory = get().inventory;
          const item = inventory.find(i => i.id === inventoryItemId);
          
          if (item) {
            set(state => ({
              inventory: state.inventory.map(i => 
                i.id === inventoryItemId 
                  ? { 
                      ...i, 
                      quantity: Math.max(0, i.quantity - inventoryItemQuantity),
                      updatedAt: new Date(),
                      syncStatus: 'pending'
                    } 
                  : i
              ),
              plantationTasks: state.plantationTasks.map(t => 
                t.id === newTask.id 
                  ? { ...t, inventoryItemProcessed: true } 
                  : t
              )
            }));
          }
        }
      },
      
      updatePlantationTask: (id, updates) => {
        set(state => ({
          plantationTasks: state.plantationTasks.map(task => 
            task.id === id 
              ? { 
                  ...task, 
                  ...updates, 
                  updatedAt: new Date(), 
                  syncStatus: 'pending' 
                } 
              : task
          )
        }));
      },
      
      removePlantationTask: (id) => {
        set(state => ({
          plantationTasks: state.plantationTasks.filter(task => task.id !== id)
        }));
      },
      
      completePlantationTask: (id, completedDate) => {
        const task = get().plantationTasks.find(t => t.id === id);
        
        if (!task) return;
        
        set(state => ({
          plantationTasks: state.plantationTasks.map(t => 
            t.id === id 
              ? { 
                  ...t, 
                  status: 'completed',
                  date: completedDate,
                  updatedAt: new Date(), 
                  syncStatus: 'pending' 
                } 
              : t
          )
        }));
        
        // Process inventory if not already processed
        if (task.inventoryItemId && task.inventoryItemQuantity && !task.inventoryItemProcessed) {
          const { inventoryItemId, inventoryItemQuantity } = task;
          const inventory = get().inventory;
          const item = inventory.find(i => i.id === inventoryItemId);
          
          if (item) {
            set(state => ({
              inventory: state.inventory.map(i => 
                i.id === inventoryItemId 
                  ? { 
                      ...i, 
                      quantity: Math.max(0, i.quantity - inventoryItemQuantity),
                      updatedAt: new Date(),
                      syncStatus: 'pending'
                    } 
                  : i
              ),
              plantationTasks: state.plantationTasks.map(t => 
                t.id === id 
                  ? { ...t, inventoryItemProcessed: true } 
                  : t
              )
            }));
          }
        }
      },
      
      // Actions for harvest records
      addHarvestRecord: (record) => {
        const now = new Date();
        const newRecord: HarvestRecord = {
          ...record,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending',
          addedToInventory: false
        };
        
        set(state => ({
          harvestRecords: [...state.harvestRecords, newRecord]
        }));
        
        // Add the harvest to inventory as a new item
        const plantation = get().plantations.find(p => p.id === record.plantationId);
        
        if (plantation) {
          const newInventoryItem: InventoryItem = {
            id: uuidv4(),
            name: `Harvest of ${plantation.name} - ${new Date(record.harvestDate).toLocaleDateString()}`,
            type: 'other',
            quantity: record.yield,
            unit: 'kg',
            purchaseDate: new Date(record.harvestDate),
            costPerUnit: 0, // This could be calculated from expenses if needed
            createdAt: now,
            updatedAt: now,
            syncStatus: 'pending',
            properties: []
          };
          
          set(state => ({
            inventory: [...state.inventory, newInventoryItem],
            harvestRecords: state.harvestRecords.map(r => 
              r.id === newRecord.id ? { ...r, addedToInventory: true } : r
            )
          }));
        }
      },
      
      updateHarvestRecord: (id, updates) => {
        set(state => ({
          harvestRecords: state.harvestRecords.map(record => 
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
      
      removeHarvestRecord: (id) => {
        set(state => ({
          harvestRecords: state.harvestRecords.filter(record => record.id !== id)
        }));
      },
      
      // Actions for sale records
      addSaleRecord: (record) => {
        const now = new Date();
        const newRecord: SaleRecord = {
          ...record,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending'
        };
        
        set(state => ({
          saleRecords: [...state.saleRecords, newRecord]
        }));
      },
      
      updateSaleRecord: (id, updates) => {
        set(state => ({
          saleRecords: state.saleRecords.map(record => 
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
      
      removeSaleRecord: (id) => {
        set(state => ({
          saleRecords: state.saleRecords.filter(record => record.id !== id)
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
            case 'mortalityRecords':
              return {
                mortalityRecords: state.mortalityRecords.map(record => 
                  record.id === id ? { ...record, syncStatus: status } : record
                )
              };
            case 'dietRecords':
              return {
                dietRecords: state.dietRecords.map(record => 
                  record.id === id ? { ...record, syncStatus: status } : record
                )
              };
            case 'plantations':
              return {
                plantations: state.plantations.map(plantation => 
                  plantation.id === id ? { ...plantation, syncStatus: status } : plantation
                )
              };
            case 'pestControls':
              return {
                pestControls: state.pestControls.map(control => 
                  control.id === id ? { ...control, syncStatus: status } : control
                )
              };
            case 'plantationExpenses':
              return {
                plantationExpenses: state.plantationExpenses.map(expense => 
                  expense.id === id ? { ...expense, syncStatus: status } : expense
                )
              };
            case 'plantationMaintenances':
              return {
                plantationMaintenances: state.plantationMaintenances.map(maintenance => 
                  maintenance.id === id ? { ...maintenance, syncStatus: status } : maintenance
                )
              };
            case 'productivityRecords':
              return {
                productivityRecords: state.productivityRecords.map(record => 
                  record.id === id ? { ...record, syncStatus: status } : record
                )
              };
            case 'plantationTasks':
              return {
                plantationTasks: state.plantationTasks.map(task => 
                  task.id === id ? { ...task, syncStatus: status } : task
                )
              };
            case 'harvestRecords':
              return {
                harvestRecords: state.harvestRecords.map(record => 
                  record.id === id ? { ...record, syncStatus: status } : record
                )
              };
            case 'saleRecords':
              return {
                saleRecords: state.saleRecords.map(record => 
                  record.id === id ? { ...record, syncStatus: status } : record
                )
              };
            default:
              return state;
          }
        });
      },
      
      // Utility functions
      getFarmSummary: () => {
        const state = get();
        
        // Count active lots and animals
        const activeLots = state.lots.filter(lot => !lot.sold && !lot.archived);
        const totalAnimals = activeLots.reduce((sum, lot) => sum + lot.numberOfAnimals, 0);
        
        // Calculate total area
        const totalPastureArea = state.pastures.reduce((sum, pasture) => sum + pasture.area, 0);
        
        // Get latest weighing data
        const latestWeighings = state.weighings.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 10);
        
        // Count inventory by category
        const inventoryByCategory = state.inventory.reduce((acc, item) => {
          const category = item.type || 'other';
          if (!acc[category]) acc[category] = 0;
          acc[category]++;
          return acc;
        }, {} as Record<string, number>);
        
        return {
          totalLots: activeLots.length,
          totalAnimals,
          totalPastureArea,
          latestWeighings,
          inventoryByCategory,
          lastUpdated: new Date()
        };
      },
      
      getPendingSyncs: () => {
        const state = get();
        let count = 0;
        
        // Count all entities with pending sync status
        count += state.inventory.filter(i => i.syncStatus === 'pending').length;
        count += state.lots.filter(i => i.syncStatus === 'pending').length;
        count += state.pastures.filter(i => i.syncStatus === 'pending').length;
        count += state.weighings.filter(i => i.syncStatus === 'pending').length;
        count += state.consumptions.filter(i => i.syncStatus === 'pending').length;
        count += state.soilAnalyses.filter(i => i.syncStatus === 'pending').length;
        count += state.maintenanceRecords.filter(i => i.syncStatus === 'pending').length;
        count += state.mortalityRecords.filter(i => i.syncStatus === 'pending').length;
        count += state.plantations.filter(i => i.syncStatus === 'pending').length;
        count += state.pestControls.filter(i => i.syncStatus === 'pending').length;
        count += state.plantationExpenses.filter(i => i.syncStatus === 'pending').length;
        count += state.plantationMaintenances.filter(i => i.syncStatus === 'pending').length;
        count += state.productivityRecords.filter(i => i.syncStatus === 'pending').length;
        count += state.plantationTasks.filter(i => i.syncStatus === 'pending').length;
        count += state.harvestRecords.filter(i => i.syncStatus === 'pending').length;
        count += state.saleRecords.filter(i => i.syncStatus === 'pending').length;
        
        return count;
      }
    }),
    {
      name: 'farm-manager-storage',
      partialize: (state) => ({
        inventory: state.inventory,
        inventoryTemplates: state.inventoryTemplates,
        lots: state.lots,
        pastures: state.pastures,
        weighings: state.weighings,
        consumptions: state.consumptions,
        soilAnalyses: state.soilAnalyses,
        maintenanceRecords: state.maintenanceRecords,
        mortalityRecords: state.mortalityRecords,
        dietRecords: state.dietRecords,
        plantations: state.plantations,
        pestControls: state.pestControls,
        plantationExpenses: state.plantationExpenses,
        plantationMaintenances: state.plantationMaintenances,
        productivityRecords: state.productivityRecords,
        plantationTasks: state.plantationTasks,
        harvestRecords: state.harvestRecords,
        saleRecords: state.saleRecords,
        lastSyncTime: state.lastSyncTime
      })
    }
  )
);
