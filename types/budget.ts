export interface SectorBudget {
  id: string;
  category: string;
  allocatedAmount: number; // in Millions/Billions
  priorYearAmount?: number;
  growthPercentage?: number;
  percentageOfTotal: number;
  description?: string;
}

export interface BudgetDataset {
  id: string;
  country: string;
  year: number;
  currency: string;
  unit?: string; // e.g. "Lakh Cr", "Billion", "Trillion"
  totalBudget: number;
  sectors: SectorBudget[];
}

export interface AIExplainRequest {
  budgetId: string;
  sectorId?: string;
  category?: string;
  allocatedAmount?: number;
  priorYearAmount?: number;
  growthPercentage?: number;
  customPrompt?: string;
}

export interface AIExplainResponse {
  explanation: string;
  cached: boolean;
  timestamp: string;
}

export interface SimulationDelta {
  sectorId: string;
  category?: string;
  baselineAmount?: number;
  newAmount: number;
  deltaPercentage: number;
}

export interface SimulatedSector extends SectorBudget {
  simulatedAmount: number;
  simulatedPercentage: number;
  deltaAmount: number;
  deltaPercentage: number;
  isLocked: boolean;
}

export interface SimulationState {
  datasetId: string;
  country: string;
  year: number;
  currency: string;
  unit: string;
  baselineTotalBudget: number;
  simulatedTotalBudget: number;
  sectors: SimulatedSector[];
}

export interface TradeoffExplainPayload {
  country: string;
  year: number;
  currency: string;
  unit: string;
  baselineTotalBudget: number;
  simulationDeltas: SimulationDelta[];
}

export interface SectorComparisonItem {
  id: string;
  category: string;
  amountA: number;
  amountB: number;
  delta: number;
  percentageChange: number;
  inflationAdjustedDelta: number;
  status: 'increased' | 'decreased' | 'unchanged' | 'new' | 'discontinued';
}

export interface CompareRequest {
  countryA: string;
  yearA: number;
  countryB: string;
  yearB: number;
  inflationRate?: number; // annual % rate (default e.g. 5%)
}

export interface ComparisonResponse {
  datasetA: {
    country: string;
    year: number;
    currency: string;
    unit?: string;
    totalBudget: number;
  };
  datasetB: {
    country: string;
    year: number;
    currency: string;
    unit?: string;
    totalBudget: number;
  };
  isIdentical: boolean;
  zeroDeltaNotice?: string;
  totalDelta: number;
  totalPercentageChange: number;
  inflationRate: number;
  sectorDeltas: SectorComparisonItem[];
  cached?: boolean;
}

export type BookmarkItemType = 'sector' | 'comparison' | 'simulation';

export interface BookmarkItemMetadata {
  category?: string;
  allocatedAmount?: number;
  priorYearAmount?: number;
  growthPercentage?: number;
  percentageOfTotal?: number;
  country?: string;
  year?: number;
  currency?: string;
  unit?: string;
  countryA?: string;
  yearA?: number;
  countryB?: string;
  yearB?: number;
  totalDelta?: number;
  sectorCount?: number;
  description?: string;
  isOrphaned?: boolean;
  statusNote?: string;
}

export interface BookmarkItem {
  id: string;
  user_id: string;
  item_type: BookmarkItemType;
  item_id: string;
  title: string;
  subtitle: string;
  created_at: string;
  metadata: BookmarkItemMetadata;
}

export interface BookmarkResponse {
  bookmarks?: BookmarkItem[];
  bookmark?: BookmarkItem;
  success?: boolean;
  removedId?: string;
  error?: {
    code: string;
    message: string;
  };
}



