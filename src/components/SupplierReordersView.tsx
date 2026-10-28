import React, { useState } from 'react';
import { CalculatedItem } from '../utils/wmsCalculator';
import { sendReorderReportEmail, ADMIN_EMAIL } from '../services/emailService';
import { Truck, DollarSign, Send, CheckCircle2, FileText, Printer, Building2, Package, Mail } from 'lucide-react';

interface SupplierReordersViewProps {
  items: CalculatedItem[];
  onSimulatePoPlacement: (items: { isbn: string; orderedQty: number }[]) => void;
}

export const SupplierReordersView: React.FC<SupplierReordersViewProps> = ({
  items,
  onSimulatePoPlacement
}) => {
  const [orderedSuppliers, setOrderedSuppliers] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);

  // Filter only items with deficit
  const deficitItems = items.filter(item => item.isDeficit);

  // Group by supplier
  const supplierGroups = deficitItems.reduce((acc, item) => {
    if (!acc[item.supplier]) {
      acc[item.supplier] = {
        supplier: item.supplier,
        leadTimeDays: item.leadTimeDays,
        items: [],
        totalCost: 0,
        totalUnits: 0
      };
    }
    acc[item.supplier].items.push(item);
    acc[item.supplier].totalCost += item.totalOrderCost;
    acc[item.supplier].totalUnits += item.reorderQuantity;
    return acc;
  }, {} as Record<string, { supplier: string; leadTimeDays: number; items: CalculatedItem[]; totalCost: number; totalUnits: number }>);

  const suppliersList = Object.values(supplierGroups);

  const handlePlaceOrder = (supplierName: string, supplierItems: CalculatedItem[], poNumber: string) => {
    const updates = supplierItems.map(i => ({ isbn: i.isbn, orderedQty: i.reorderQuantity }));
    onSimulatePoPlacement(updates);
    setOrderedSuppliers(prev => ({ ...prev, [supplierName]: true }));
    setSuccessMessage(`Purchase Order ${poNumber} successfully generated and transmitted to ${supplierName}! (Added to Extra PO Stock buffer)`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleEmailReport = async () => {
    setEmailSending(true);
    try {
      await sendReorderReportEmail(items);
      setSuccessMessage(`Reorder report successfully dispatched via email to Admin (${ADMIN_EMAIL})!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e) {
      setSuccessMessage('Failed to send email notification.');
    } finally {
      setEmailSending(false);
    }
  };

  const downloadPoCsv = (supplierName: string, poNumber: string, itemsList: CalculatedItem[], leadTime: number) => {
    const headers = ['PO Number', 'Supplier', 'ISBN', 'Title', 'Lead Time (Days)', 'Reorder Quantity', 'Unit Cost ($)', 'Line Total ($)'];
    const rows = itemsList.map(item => [
      poNumber,
      `"${supplierName}"`,
      item.isbn,
      `"${item.title}"`,
      leadTime,
      item.reorderQuantity,
      item.unitCost,
      item.totalOrderCost.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${poNumber}_${supplierName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const grandTotalCost = suppliersList.reduce((acc, s) => acc + s.totalCost, 0);
  const grandTotalUnits = suppliersList.reduce((acc, s) => acc + s.totalUnits, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Supplier Reorder Management (Emo Book Service Sdn Bhd)</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Aggregating items with positive deficit values (&gt; 0) and grouping by publisher to generate purchase orders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              disabled={emailSending || deficitItems.length === 0}
              onClick={handleEmailReport}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium text-sm shadow-md shadow-purple-600/20 transition-all flex items-center space-x-2 cursor-pointer"
              title={`Send report to ${ADMIN_EMAIL}`}
            >
              <Mail className="w-4 h-4" />
              <span>{emailSending ? 'Sending Email...' : `Email Report to Admin (${ADMIN_EMAIL})`}</span>
            </button>

            <div className="flex items-center space-x-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 px-4 py-2.5 rounded-2xl">
              <div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium uppercase tracking-wider">Total Investment</div>
                <div className="text-lg font-extrabold text-indigo-700 dark:text-indigo-300">
                  ${grandTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {grandTotalUnits}
              </div>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center space-x-3 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Supplier Groups */}
      {suppliersList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Stock Levels are Sufficient!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            There are currently no titles with a positive net deficit against the minimum quantity threshold of 50.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {suppliersList.map((group) => {
            const isOrdered = orderedSuppliers[group.supplier];
            const poNumber = `PO-${Math.floor(100000 + Math.random() * 900000)}`;

            return (
              <div 
                key={group.supplier}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Supplier Card Header */}
                <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{group.supplier}</h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                          {poNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Estimated Lead Time: <span className="font-semibold text-slate-700 dark:text-slate-300">{group.leadTimeDays} business days</span> &bull; {group.items.length} titles requiring replenishment
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Order Subtotal</div>
                      <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                        ${group.totalCost.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadPoCsv(group.supplier, poNumber, group.items, group.leadTimeDays)}
                        className="px-3 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-sm font-medium transition-all flex items-center space-x-1.5 cursor-pointer"
                        title="Download Purchase Order CSV"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Download PO</span>
                      </button>

                      <button
                        onClick={() => handlePlaceOrder(group.supplier, group.items, poNumber)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all flex items-center space-x-2 cursor-pointer ${
                          isOrdered
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>{isOrdered ? 'PO Transmitted (Resend)' : 'Generate & Transmit PO'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items Table for Supplier */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white dark:bg-slate-900">
                        <th className="py-3 px-5">ISBN & Title</th>
                        <th className="py-3 px-5 text-center">Minimum Qty</th>
                        <th className="py-3 px-5 text-center">Current Stock</th>
                        <th className="py-3 px-5 text-center">Extra PO Buffer</th>
                        <th className="py-3 px-5 text-center">Deficit Qty (To Order)</th>
                        <th className="py-3 px-5 text-right">Unit Price</th>
                        <th className="py-3 px-5 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                      {group.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-5 max-w-md">
                            <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">{item.isbn}</div>
                            <div className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">{item.title}</div>
                          </td>
                          <td className="py-3 px-5 text-center font-mono">{item.minimumQty}</td>
                          <td className="py-3 px-5 text-center font-mono text-slate-600 dark:text-slate-400">{item.stockBalance}</td>
                          <td className="py-3 px-5 text-center font-mono text-indigo-600 dark:text-indigo-400">+{item.extraPoStock}</td>
                          <td className="py-3 px-5 text-center font-mono font-bold text-rose-600 dark:text-rose-400">
                            {item.reorderQuantity} {item.unit}
                          </td>
                          <td className="py-3 px-5 text-right font-mono text-slate-600 dark:text-slate-400">
                            ${item.unitCost.toFixed(2)}
                          </td>
                          <td className="py-3 px-5 text-right font-mono font-bold text-slate-900 dark:text-white">
                            ${item.totalOrderCost.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer notes */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <Package className="w-4 h-4 text-indigo-500" />
                    <span>Transmitting this PO automatically converts reorder units into incoming Extra PO buffer stock.</span>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print PO</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
