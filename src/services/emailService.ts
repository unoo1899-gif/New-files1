import { CalculatedItem } from '../utils/wmsCalculator';

export const ADMIN_EMAIL = 'unoo1899@gmail.com';

export interface EmailReportPayload {
  recipient: string;
  subject: string;
  totalCost: number;
  deficitItemsCount: number;
  timestamp: string;
}

export function sendReorderReportEmail(items: CalculatedItem[]): Promise<EmailReportPayload> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const deficitItems = items.filter(i => i.isDeficit);
      const totalCost = deficitItems.reduce((acc, i) => acc + i.totalOrderCost, 0);

      const payload: EmailReportPayload = {
        recipient: ADMIN_EMAIL,
        subject: `[WMS Alert] Publisher Reorder Report - Emo Book Service Sdn Bhd (${new Date().toLocaleDateString()})`,
        totalCost,
        deficitItemsCount: deficitItems.length,
        timestamp: new Date().toISOString()
      };

      console.log(`[Email Service] Successfully dispatched reorder report to ${ADMIN_EMAIL}`, payload);
      resolve(payload);
    }, 800);
  });
}
