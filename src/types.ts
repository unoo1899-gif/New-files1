export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  isbn: string;
  title: string;
  category: string;
  unit: string;
  unitCost: number;
  minimumQty: number;
  stockBalance: number;
  extraPoStock: number;
  supplier: string;
  leadTimeDays: number;
  lastUpdated: string;
}

export interface StockBalanceUploadRow {
  isbn: string;
  stockBalance: number;
}

export interface ExtraPoUploadRow {
  isbn: string;
  extraPoStock: number;
}

export type ViewMode = 'dashboard' | 'inventory' | 'ingestion' | 'reorders' | 'settings' | 'users' | 'eta';
