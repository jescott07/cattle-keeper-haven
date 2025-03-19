import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  InventoryItem, 
  Lot, 
  Pasture, 
  WeighingRecord, 
  ConsumptionRecord, 
  PasturePlanning, 
  SoilAnalysis,
  Plantation,
  PestControl,
  PlantationExpense,
  PlantationMaintenance,
  ProductivityRecord,
  MaintenanceRecord,
  MortalityRecord,
  SanitaryTreatment
} from './types';

interface StoreState {
  inventoryItems: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  lots: Lot[];
  addLot: (lot: Omit<Lot, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updateLot: (id: string, lot: Partial<Lot>) => void;
  deleteLot: (id: string) => void;

  pastures: Pasture[];
  addPasture: (pasture: Omit<Pasture, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updatePasture: (id: string, pasture: Partial<Pasture>) => void;
  deletePasture: (id: string) => void;

  weighingRecords: WeighingRecord[];
  addWeighingRecord: (record: Omit<WeighingRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updateWeighingRecord: (id: string, record: Partial<WeighingRecord>) => void;
  deleteWeighingRecord: (id: string) => void;

  consumptionRecords: ConsumptionRecord[];
  addConsumptionRecord: (record: Omit<ConsumptionRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updateConsumptionRecord: (id: string, record: Partial<ConsumptionRecord>) => void;
  deleteConsumptionRecord: (id: string) => void;

  pasturePlannings: PasturePlanning[];
  addPasturePlanning: (planning: Omit<PasturePlanning, 'completed' | 'completedDate' | 'notes'>) => void;
  updatePasturePlanning: (lotId: string, planning: Partial<PasturePlanning>) => void;
  deletePasturePlanning: (lotId: string, toPastureId: string) => void;

  soilAnalyses: SoilAnalysis[];
  addSoilAnalysis: (analysis: Omit<SoilAnalysis, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updateSoilAnalysis: (id: string, analysis: Partial<SoilAnalysis>) => void;
  deleteSoilAnalysis: (id: string) => void;

  plantations: Plantation[];
  addPlantation: (plantation: Omit<Plantation, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updatePlantation: (id: string, plantation: Partial<Plantation>) => void;
  deletePlantation: (id: string) => void;

  pestControls: PestControl[];
  addPestControl: (pestControl: Omit<PestControl, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updatePestControl: (id: string, pestControl: Partial<PestControl>) => void;
  deletePestControl: (id: string) => void;

  plantationExpenses: PlantationExpense[];
  addPlantationExpense: (expense: Omit<PlantationExpense, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updatePlantationExpense: (id: string, expense: Partial<PlantationExpense>) => void;
  deletePlantationExpense: (id: string) => void;

  plantationMaintenances: PlantationMaintenance[];
  addPlantationMaintenance: (maintenance: Omit<PlantationMaintenance, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updatePlantationMaintenance: (id: string, maintenance: Partial<PlantationMaintenance>) => void;
  deletePlantationMaintenance: (id: string) => void;

  productivityRecords: ProductivityRecord[];
  addProductivityRecord: (record: Omit<ProductivityRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updateProductivityRecord: (id: string, record: Partial<ProductivityRecord>) => void;
  deleteProductivityRecord: (id: string) => void;

  maintenanceRecords: MaintenanceRecord[];
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updateMaintenanceRecord: (id: string, record: Partial<MaintenanceRecord>) => void;
  deleteMaintenanceRecord: (id: string) => void;

  mortalityRecords: MortalityRecord[];
  addMortalityRecord: (record: Omit<MortalityRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updateMortalityRecord: (id: string, record: Partial<MortalityRecord>) => void;
  deleteMortalityRecord: (id: string) => void;

  // Sanitary Control
  sanitaryTreatments: SanitaryTreatment[];
  addSanitaryTreatment: (treatment: Omit<SanitaryTreatment, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
  updateSanitaryTreatment: (id: string, treatment: Partial<SanitaryTreatment>) => void;
  deleteSanitaryTreatment: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      inventoryItems: [],
      addInventoryItem: (item) => set((state) => ({ inventoryItems: [...state.inventoryItems, { id: uuidv4(), ...item, createdAt: new Date(), updatedAt: new Date(), syncStatus: 'pending' }] })),
      updateInventoryItem: (id, item) => set((state) => ({
        inventoryItems: state.inventoryItems.map((inv) =>
          inv.id === id ? { ...inv, ...item, updatedAt: new Date(), syncStatus: 'pending' } : inv
        )
      })),
      deleteInventoryItem: (id) => set((state) => ({ inventoryItems: state.inventoryItems.filter((item) => item.id !== id) })),

      lots: [],
      addLot: (lot) => set((state) => ({ lots: [...state.lots, { id: uuidv4(), ...lot, createdAt: new Date(), updatedAt: new Date(), syncStatus: 'pending' }] })),
      updateLot: (id, lot) => set((state) => ({
        lots: state.lots.map((l) =>
          l.id === id ? { ...l, ...lot, updatedAt: new Date(), syncStatus: 'pending' } : l
        )
      })),
      deleteLot: (id) => set((state) => ({ lots: state.lots.filter((lot) => lot.id !== id) })),

      pastures: [],
      addPasture: (pasture) => set((state) => ({ pastures: [...state.pastures, { id: uuidv4(), ...pasture, evaluations: [], createdAt: new Date(), updatedAt: new Date(), syncStatus: 'pending' }] })),
      updatePasture: (id, pasture) => set((state) => ({
        pastures: state.pastures.map((p) =>
          p.id === id ? { ...p, ...pasture, updatedAt: new Date(), syncStatus: 'pending' } : p
        )
      })),
      deletePasture: (id) => set((state) => ({ pastures: state.pastures.filter((pasture) => pasture.id !== id) })),

      weighingRecords: [],
      addWeighingRecord: (record) => set((state) => ({ weighingRecords: [...state.weighingRecords, { id: uuidv4(), ...record, createdAt: new Date(), updatedAt: new Date(), syncStatus: 'pending' }] })),
      updateWeighingRecord: (id, record) => set((state) => ({
        weighingRecords: state.weighingRecords.map((w) =>
          w.id === id ? { ...w, ...record, updatedAt: new Date(), syncStatus: 'pending' } : w
        )
      })),
      deleteWeighingRecord: (id) => set((state) => ({ weighingRecords: state.weighingRecords.filter((record) => record.id !== id) })),

      consumptionRecords: [],
      addConsumptionRecord: (record) => set((state) => ({ consumptionRecords: [...state.consumptionRecords, { id: uuidv4(), ...record, createdAt: new Date(), updatedAt: new Date(), syncStatus: 'pending' }] })),
      updateConsumptionRecord: (id, record) => set((state) => ({
        consumptionRecords: state.consumptionRecords.map((c) =>
          c.id === id ? { ...c, ...record, updatedAt: new Date(), syncStatus: 'pending' } : c
        )
      })),
      deleteConsumptionRecord: (id) => set((state) => ({ consumptionRecords: state.consumptionRecords.filter((record) => record.id !== id) })),

      pasturePlannings: [],
      addPasturePlanning: (planning) => set((state) => {
        const newPlanning: PasturePlanning = {
          lotId: planning.lotId,
          fromPastureId: planning.fromPastureId,
          toPastureId: planning.toPastureId,
          scheduledDate: planning.scheduledDate,
          completed: false,
          notes: '',
        };
        return { pasturePlannings: [...state.pasturePlannings, newPlanning] };
      }),
      updatePasturePlanning: (lotId, planning) => set((state) => ({
        pasturePlannings: state.pasturePlannings.map((p) =>
          p.lotId === lotId && p.toPastureId === planning.toPastureId ? { ...p, ...planning } : p
        )
      })),
      deletePasturePlanning: (lotId, toPastureId) => set((state) => ({
        pasturePlannings: state.pasturePlannings.filter((p) => !(p.lotId === lotId && p.toPastureId === toPastureId))
      })),

      soilAnalyses: [],
      addSoilAnalysis: (analysis) => set((state) => ({ soilAnalyses: [...state.soilAnalyses, { id: uuidv4(), ...analysis, createdAt: new Date(), updatedAt: new Date(), syncStatus: 'pending' }] })),
      updateSoilAnalysis: (id, analysis) => set((state) => ({
        soilAnalyses: state.soilAnalyses.map((s) =>
          s.id === id ? { ...s, ...analysis, updatedAt: new Date(), syncStatus: 'pending' } : s
        )
      })),
      deleteSoilAnalysis: (id) => set((state) => ({ soilAnalyses: state.soilAnalyses.filter((analysis) => analysis.id !== id) })),

      plantations: [],
      addPlantation: (plantation) => set((state) => ({ 
        plantations: [...state.plantations, { 
          id: uuidv4(), 
          ...plantation, 
          createdAt: new Date(), 
          updatedAt: new Date(), 
          syncStatus: 'pending' 
        }] 
      })),
      updatePlantation: (id, plantation) => set((state) => ({
        plantations: state.plantations.map((p) =>
          p.id === id ? { ...p, ...plantation, updatedAt: new Date(), syncStatus: 'pending' } : p
        )
      })),
      deletePlantation: (id) => set((state) => ({ plantations: state.plantations.filter((plantation) => plantation.id !== id) })),

      pestControls: [],
      addPestControl: (pestControl) => set((state) => ({ 
        pestControls: [...state.pestControls, { 
          id: uuidv4(), 
          ...pestControl, 
          createdAt: new Date(), 
          updatedAt: new Date(), 
          syncStatus: 'pending' 
        }] 
      })),
      updatePestControl: (id, pestControl) => set((state) => ({
        pestControls: state.pestControls.map((p) =>
          p.id === id ? { ...p, ...pestControl, updatedAt: new Date(), syncStatus: 'pending' } : p
        )
      })),
      deletePestControl: (id) => set((state) => ({ pestControls: state.pestControls.filter((pestControl) => pestControl.id !== id) })),

      plantationExpenses: [],
      addPlantationExpense: (expense) => set((state) => ({ 
        plantationExpenses: [...state.plantationExpenses, { 
          id: uuidv4(), 
          ...expense, 
          createdAt: new Date(), 
          updatedAt: new Date(), 
          syncStatus: 'pending' 
        }] 
      })),
      updatePlantationExpense: (id, expense) => set((state) => ({
        plantationExpenses: state.plantationExpenses.map((p) =>
          p.id === id ? { ...p, ...expense, updatedAt: new Date(), syncStatus: 'pending' } : p
        )
      })),
      deletePlantationExpense: (id) => set((state) => ({ plantationExpenses: state.plantationExpenses.filter((expense) => expense.id !== id) })),

      plantationMaintenances: [],
      addPlantationMaintenance: (maintenance) => set((state) => ({ 
        plantationMaintenances: [...state.plantationMaintenances, { 
          id: uuidv4(), 
          ...maintenance, 
          createdAt: new Date(), 
          updatedAt: new Date(), 
          syncStatus: 'pending' 
        }] 
      })),
      updatePlantationMaintenance: (id, maintenance) => set((state) => ({
        plantationMaintenances: state.plantationMaintenances.map((p) =>
          p.id === id ? { ...p, ...maintenance, updatedAt: new Date(), syncStatus: 'pending' } : p
        )
      })),
      deletePlantationMaintenance: (id) => set((state) => ({ plantationMaintenances: state.plantationMaintenances.filter((maintenance) => maintenance.id !== id) })),

      productivityRecords: [],
      addProductivityRecord: (record) => set((state) => ({ 
        productivityRecords: [...state.productivityRecords, { 
          id: uuidv4(), 
          ...record, 
          createdAt: new Date(), 
          updatedAt: new Date(), 
          syncStatus: 'pending' 
        }] 
      })),
      updateProductivityRecord: (id, record) => set((state) => ({
        productivityRecords: state.productivityRecords.map((p) =>
          p.id === id ? { ...p, ...record, updatedAt: new Date(), syncStatus: 'pending' } : p
        )
      })),
      deleteProductivityRecord: (id) => set((state) => ({ productivityRecords: state.productivityRecords.filter((record) => record.id !== id) })),

      maintenanceRecords: [],
      addMaintenanceRecord: (record) => set((state) => ({
        maintenanceRecords: [...state.maintenanceRecords, {
          id: uuidv4(),
          ...record,
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: 'pending'
        }]
      })),
      updateMaintenanceRecord: (id, record) => set((state) => ({
        maintenanceRecords: state.maintenanceRecords.map((m) =>
          m.id === id ? { ...m, ...record, updatedAt: new Date(), syncStatus: 'pending' } : m
        )
      })),
      deleteMaintenanceRecord: (id) => set((state) => ({
        maintenanceRecords: state.maintenanceRecords.filter((record) => record.id !== id)
      })),

      mortalityRecords: [],
      addMortalityRecord: (record) => set((state) => ({
        mortalityRecords: [...state.mortalityRecords, {
          id: uuidv4(),
          ...record,
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: 'pending'
        }]
      })),
      updateMortalityRecord: (id, record) => set((state) => ({
        mortalityRecords: state.mortalityRecords.map((m) =>
          m.id === id ? { ...m, ...record, updatedAt: new Date(), syncStatus: 'pending' } : m
        )
      })),
      deleteMortalityRecord: (id) => set((state) => ({
        mortalityRecords: state.mortalityRecords.filter((record) => record.id !== id)
      })),

      // Sanitary Control State
      sanitaryTreatments: [],
      
      // Sanitary Control Actions
      addSanitaryTreatment: (treatment) => set((state) => {
        const newTreatment: SanitaryTreatment = {
          id: uuidv4(),
          ...treatment,
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: 'pending'
        };
        
        return {
          sanitaryTreatments: [...state.sanitaryTreatments, newTreatment]
        };
      }),
      
      updateSanitaryTreatment: (id, treatment) => set((state) => ({
        sanitaryTreatments: state.sanitaryTreatments.map((t) =>
          t.id === id ? { ...t, ...treatment, updatedAt: new Date(), syncStatus: 'pending' } : t
        )
      })),
      
      deleteSanitaryTreatment: (id) => set((state) => ({
        sanitaryTreatments: state.sanitaryTreatments.filter((t) => t.id !== id)
      })),
    }),
    {
      name: 'farm-management',
      partialize: (state) => ({
        inventoryItems: state.inventoryItems,
        lots: state.lots,
        pastures: state.pastures,
        weighingRecords: state.weighingRecords,
        consumptionRecords: state.consumptionRecords,
        pasturePlannings: state.pasturePlannings,
        soilAnalyses: state.soilAnalyses,
        plantations: state.plantations,
        pestControls: state.pestControls,
        plantationExpenses: state.plantationExpenses,
        plantationMaintenances: state.plantationMaintenances,
        productivityRecords: state.productivityRecords,
        maintenanceRecords: state.maintenanceRecords,
        mortalityRecords: state.mortalityRecords,
        sanitaryTreatments: state.sanitaryTreatments,
      }),
    }
  )
);

