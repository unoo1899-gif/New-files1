export interface SKUItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  unitCost: number;
  minRequiredStock: number;
  stockBalance: number;
  extraPoStock: number;
  supplier: string;
  leadTimeDays: number;
  lastUpdated: string;
}

export interface StockBalanceUploadRow {
  sku: string;
  stockBalance: number;
}

export interface ExtraPoUploadRow {
  sku: string;
  extraPoStock: number;
}

export type ViewMode = 'dashboard' | 'inventory' | 'ingestion' | 'reorders' | 'settings';
