// Sync status for all data models
export type SyncStatus = 'synced' | 'pending' | 'error';

// Base type for all models that need syncing
export interface SyncableModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
}

// Inventory Item Types
export type InventoryType = 'feed' | 'mineral' | 'medication' | 'equipment' | 'other';

export interface InventoryItemProperty {
  id: string;
  name: string;
  value: string;
  unit: string;
  propertyType: 'min' | 'max' | 'exact';
}

export interface InventoryItemTemplate {
  id: string;
  name: string;
  type: InventoryType;
  properties: InventoryItemProperty[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem extends SyncableModel {
  name: string;
  type: InventoryType;
  quantity: number;
  unit: string;
  purchaseDate?: Date;
  expiryDate?: Date;
  costPerUnit: number;
  notes?: string;
  templateId?: string;
  properties: InventoryItemProperty[];
}

export interface InventoryFormValues {
  name: string;
  type: InventoryType;
  quantity: number;
  unit: string;
  purchaseDate?: string;
  expiryDate?: string;
  costPerUnit: number;
  notes?: string;
  templateId?: string;
  properties: InventoryItemProperty[];
}

// Lot Management Types
export type LotStatus = 'active' | 'sold' | 'treatment';
export type AnimalSource = 'auction' | 'another-farmer' | 'born-on-farm' | 'other';
export type BreedType = 'nelore' | 'anelorada' | 'cruzamento-industrial';

export interface Lot extends SyncableModel {
  name: string;
  numberOfAnimals: number;
  source: AnimalSource;
  status: LotStatus;
  purchaseDate: Date;
  currentPastureId: string;
  plannedTransfers: PasturePlanning[];
  averageWeight?: number;
  breed?: BreedType;
  notes?: string;
}

// Pasture Management Types
export type WaterSourceType = 'river' | 'well' | 'lake' | 'tank' | 'other';
export type FenceCondition = 'excellent' | 'good' | 'fair' | 'poor';
export type GrassType = 'bermuda' | 'fescue' | 'bluegrass' | 'ryegrass' | 'other';
export type GrassColor = 'deep-green' | 'green' | 'yellow-green' | 'yellow' | 'brown';

export interface Pasture extends SyncableModel {
  name: string;
  waterSource: WaterSourceType;
  sizeInHectares: number;
  fenceCondition: FenceCondition;
  grassType: GrassType;
  evaluations: PastureEvaluation[];
  notes?: string;
}

export interface PastureEvaluation {
  date: Date;
  ndviValue?: number;
  grassColor: GrassColor;
  grassHeightCm: number;
  notes?: string;
}

// Pasture Transfer Planning
export interface PasturePlanning {
  lotId: string;
  fromPastureId: string;
  toPastureId: string;
  scheduledDate: Date;
  completed: boolean;
  completedDate?: Date;
  notes?: string;
}

// Weighing Records
export interface WeighingRecord extends SyncableModel {
  date: Date;
  lotId: string;
  numberOfAnimals: number;
  totalWeight: number;
  averageWeight: number;
  destinationLotId?: string; // For transfers after weighing
  notes?: string;
}

// Consumption Record for Feed/Minerals
export interface ConsumptionRecord extends SyncableModel {
  date: Date;
  inventoryItemId: string;
  lotId: string;
  quantity: number;
  notes?: string;
}

// Farm Summary Statistics
export interface FarmSummary {
  totalAnimals: number;
  totalPastures: number;
  totalLots: number;
  activeLots: number;
  totalPastureArea: number;
  inventoryValue: number;
  pendingSyncs: number;
}

// NEW TYPES FOR SOIL ANALYSIS
export interface SoilAnalysis {
  id: string;
  pastureId: string;
  date: Date;
  labName: string;
  
  // Chemical properties
  phLevel: number;
  organicMatter: number; // percentage
  phosphorus: number; // ppm
  potassium: number; // ppm
  calcium: number; // ppm
  magnesium: number; // ppm
  sulfur: number; // ppm
  
  // Micronutrients
  zinc?: number; // ppm
  copper?: number; // ppm
  manganese?: number; // ppm
  
  // Physical properties
  clayContent?: number; // percentage
  sandContent?: number; // percentage
  siltContent?: number; // percentage
  cec?: number; // Cation Exchange Capacity
  baseSaturation?: number; // percentage
  
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
}

// PLANTATION MANAGEMENT TYPES
export type PlantationType = 'corn' | 'soybean' | 'grass' | 'wheat' | 'silage' | 'other';
export type PlantationStatus = 'planned' | 'planted' | 'growing' | 'harvested' | 'failed';
export type PestType = 'insect' | 'fungus' | 'weed' | 'rodent' | 'other';
export type ExpenseCategory = 'seeds' | 'fertilizer' | 'pesticide' | 'labor' | 'equipment' | 'irrigation' | 'other';

export interface Plantation extends SyncableModel {
  name: string;
  type: PlantationType;
  areaInHectares: number;
  status: PlantationStatus;
  plantingDate?: Date;
  estimatedHarvestDate?: Date;
  actualHarvestDate?: Date;
  seedCost?: number;
  seedsPerHectare?: number;
  notes?: string;
  pastureId?: string; // If plantation is on a pasture
  expectedYieldPerHectare?: number;
  actualYieldPerHectare?: number;
  actualYield?: number; // Adding the missing property
}

export interface PestControl extends SyncableModel {
  plantationId: string;
  date: Date;
  pestType: PestType;
  treatment: string;
  productUsed?: string;
  quantityUsed?: number;
  unitOfMeasure?: string;
  cost?: number;
  effectiveness?: number; // 1-10 rating
  notes?: string;
}

export interface PlantationExpense extends SyncableModel {
  plantationId: string;
  date: Date;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receipt?: string; // URL or file path to receipt image
  notes?: string;
}

export interface PlantationMaintenance extends SyncableModel {
  plantationId: string;
  date: Date;
  type: string;
  description: string;
  cost?: number;
  notes?: string;
}

export interface ProductivityRecord extends SyncableModel {
  plantationId: string;
  date: Date;
  growthStage: string;
  plantHeight?: number; // in cm
  plantHealth: number; // 1-10 rating
  notes?: string;
  images?: string[]; // URLs or file paths to images
}

// MAINTENANCE TYPES
export type MaintenanceType = 'fertilization' | 'weed-control' | 'fence-repair' | 'water-system' | 'planting' | 'harvesting' | 'other';
export type MaintenanceStatus = 'scheduled' | 'completed' | 'canceled';

export interface MaintenanceRecord {
  id: string;
  pastureId: string;
  type: MaintenanceType;
  title: string;
  description?: string;
  scheduledDate: Date;
  completedDate?: Date;
  status: MaintenanceStatus;
  cost?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
}

export type MortalityCause = 'disease' | 'injury' | 'predator' | 'unknown' | 'other';

export interface MortalityRecord extends SyncableModel {
  lotId: string;
  date: Date;
  cause: MortalityCause;
  breed: BreedType;
  notes?: string;
}

// NEW TYPES FOR PLANTATION TASKS AND HARVESTS
export type TaskType = 'pest-control' | 'fertilization' | 'irrigation' | 'weeding' | 'other';
export type TaskStatus = 'scheduled' | 'completed' | 'canceled';

export interface PlantationTask extends SyncableModel {
  plantationId: string;
  title: string;
  type: TaskType;
  date: Date;
  status: TaskStatus;
  description?: string;
  cost?: number;
  notes?: string;
}

export interface HarvestRecord extends SyncableModel {
  plantationId: string;
  harvestDate: Date;
  yield: number; // Total yield in kg
  yieldPerHectare?: number;
  quality?: number; // Scale 1-10
  notes?: string;
  expenses?: number;
}
