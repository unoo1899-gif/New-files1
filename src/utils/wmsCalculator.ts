import { SKUItem } from '../types';

export interface CalculatedSKU extends SKUItem {
  netDeficit: number;
  reorderQuantity: number;
  isDeficit: boolean;
  totalOrderCost: number;
}

export function calculateItemDeficit(item: SKUItem): CalculatedSKU {
  const netDeficit = item.minRequiredStock - item.stockBalance - item.extraPoStock;
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

export function calculateWarehouseMetrics(items: SKUItem[]) {
  const calculated = items.map(calculateItemDeficit);
  const totalSkus = calculated.length;
  const deficitItems = calculated.filter(item => item.isDeficit);
  const sufficientItems = calculated.filter(item => !item.isDeficit);
  
  const totalMinRequiredValue = calculated.reduce((acc, item) => acc + (item.minRequiredStock * item.unitCost), 0);
  const totalStockValue = calculated.reduce((acc, item) => acc + (item.stockBalance * item.unitCost), 0);
  const totalPoValue = calculated.reduce((acc, item) => acc + (item.extraPoStock * item.unitCost), 0);
  const totalReorderCost = calculated.reduce((acc, item) => acc + item.totalOrderCost, 0);

  return {
    totalSkus,
    deficitCount: deficitItems.length,
    sufficientCount: sufficientItems.length,
    totalMinRequiredValue,
    totalStockValue,
    totalPoValue,
    totalReorderCost,
    calculatedItems: calculated
  };
}
