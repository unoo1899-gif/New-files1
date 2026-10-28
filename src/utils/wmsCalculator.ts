import { InventoryItem } from '../types';

export interface CalculatedItem extends InventoryItem {
  netDeficit: number;
  reorderQuantity: number;
  isDeficit: boolean;
  totalOrderCost: number;
}

export function calculateItemDeficit(item: InventoryItem): CalculatedItem {
  const netDeficit = item.minimumQty - item.stockBalance - item.extraPoStock;
  const reorderQuantity = netDeficit > 0 ? netDeficit : 0;
  const isDeficit = netDeficit > 0;
  const totalOrderCost = reorderQuantity * item.unitCost;

  return {
    ...item,
    netDeficit,
    reorderQuantity,
    isDeficit,
    totalOrderCost
  };
}

export function calculateWarehouseMetrics(items: InventoryItem[]) {
  const calculated = items.map(calculateItemDeficit);
  const totalItems = calculated.length;
  const deficitItems = calculated.filter(item => item.isDeficit);
  const sufficientItems = calculated.filter(item => !item.isDeficit);
  
  const totalMinRequiredValue = calculated.reduce((acc, item) => acc + (item.minimumQty * item.unitCost), 0);
  const totalStockValue = calculated.reduce((acc, item) => acc + (item.stockBalance * item.unitCost), 0);
  const totalPoValue = calculated.reduce((acc, item) => acc + (item.extraPoStock * item.unitCost), 0);
  const totalReorderCost = calculated.reduce((acc, item) => acc + item.totalOrderCost, 0);

  return {
    totalSkus: totalItems,
    deficitCount: deficitItems.length,
    sufficientCount: sufficientItems.length,
    totalMinRequiredValue,
    totalStockValue,
    totalPoValue,
    totalReorderCost,
    calculatedItems: calculated
  };
}
