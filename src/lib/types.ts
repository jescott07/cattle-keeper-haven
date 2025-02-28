
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

export interface InventoryItem extends SyncableModel {
  name: string;
  type: InventoryType;
  quantity: number;
  unit: string;
  purchaseDate?: Date;
  expiryDate?: Date;
  costPerUnit: number;
  notes?: string;
}

// Lot Management Types
export type LotStatus = 'active' | 'sold' | 'treatment';
export type AnimalSource = 'auction' | 'another-farmer' | 'born-on-farm' | 'other';

export interface Lot extends SyncableModel {
  name: string;
  numberOfAnimals: number;
  source: AnimalSource;
  status: LotStatus;
  purchaseDate: Date;
  currentPastureId: string;
  plannedTransfers: PasturePlanning[];
  averageWeight?: number;
  breed?: string;
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
