import React, { useState } from 'react';
import { CalculatedItem } from '../utils/wmsCalculator';
import { Search, Filter, AlertTriangle, CheckCircle2, Download, Printer, Plus, Edit3 } from 'lucide-react';

interface InventoryTableProps {
  items: CalculatedItem[];
  onUpdateItemStock: (id: string, newBalance: number, newPo: number) => void;
  onOpenAddModal: () => void;
  onNavigateToIngestion: () => void;
  onNavigateToReorders: () => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onUpdateItemStock,
  onOpenAddModal,
  onNavigateToIngestion,
  onNavigateToReorders
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'deficit' | 'sufficient'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editPo, setEditPo] = useState<number>(0);

  // Extract unique categories
  const categories = Array.from(new Set(items.map(item => item.category)));

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    let matchesFilter = true;
    if (filterMode === 'deficit') matchesFilter = item.isDeficit;
    if (filterMode === 'sufficient') matchesFilter = !item.isDeficit;

    return matchesSearch && matchesCategory && matchesFilter;
  });

  const handleStartEdit = (item: CalculatedItem) => {
    setEditingId(item.id);
    setEditBalance(item.stockBalance);
    setEditPo(item.extraPoStock);
  };

  const handleSaveEdit = (id: string) => {
    onUpdateItemStock(id, Number(editBalance), Number(editPo));
    setEditingId(null);
  };

  const exportCsv = () => {
    const headers = ['ISBN', 'Title', 'Category', 'Supplier', 'Minimum Qty', 'Stock Balance', 'Extra PO Stock', 'Net Deficit (Not Sufficient)', 'Unit Cost ($)', 'Total Reorder Cost ($)'];
    const rows = filteredItems.map(item => [
      item.isbn,
      `"${item.title}"`,
      item.category,
      `"${item.supplier}"`,
      item.minimumQty,
      item.stockBalance,
      item.extraPoStock,
      item.reorderQuantity,
      item.unitCost,
      item.totalOrderCost.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wms_minimum_qty_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deficitCount = items.filter(i => i.isDeficit).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Inventory Shortage & Replenishment Report</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
                Minimum Qty.xlsx Data
              </span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Net Deficit = Minimum Qty - Stock Balance - Extra PO Stock
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Title</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          {/* Tabs filter */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-sm font-medium">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Titles ({items.length})
            </button>
            <button
              onClick={() => setFilterMode('deficit')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                filterMode === 'deficit'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Reorder Required ({deficitCount})</span>
            </button>
            <button
              onClick={() => setFilterMode('sufficient')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                filterMode === 'sufficient'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sufficient ({items.length - deficitCount})</span>
            </button>
          </div>

          {/* Search & Category filter */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ISBN, title, supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2 pl-3 pr-8 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-4">ISBN & Title</th>
              <th className="py-3.5 px-4">Supplier</th>
              <th className="py-3.5 px-4 text-center">Minimum Qty</th>
              <th className="py-3.5 px-4 text-center">Stock Balance</th>
              <th className="py-3.5 px-4 text-center">Extra PO Stock</th>
              <th className="py-3.5 px-4 text-center">Net Deficit (Not Sufficient)</th>
              <th className="py-3.5 px-4 text-right">Unit Cost</th>
              <th className="py-3.5 px-4 text-right">Reorder Cost</th>
              <th className="py-3.5 px-4 text-center">Status / Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <p className="text-base font-medium">No inventory items match your current filter.</p>
                  <p className="text-xs mt-1">Try resetting search criteria or uploading new stock data.</p>
                </td>
              </tr>
            ) : (
              filteredItems.map(item => {
                const isEditing = editingId === item.id;
                return (
                  <tr 
                    key={item.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                      item.isDeficit ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                    }`}
                  >
                    {/* ISBN & Title */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">{item.isbn}</div>
                      <div className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5 truncate" title={item.title}>
                        {item.title}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item.category}
                      </span>
                    </td>

                    {/* Supplier */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 dark:text-slate-300 font-medium text-xs">{item.supplier}</div>
                      <div className="text-[11px] text-slate-400">2 months lead time</div>
                    </td>

                    {/* Minimum Qty */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                      {item.minimumQty}
                    </td>

                    {/* Stock Balance (editable) */}
                    <td className="py-3.5 px-4 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editBalance}
                          onChange={(e) => setEditBalance(Number(e.target.value))}
                          className="w-20 px-2 py-1 text-center font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-indigo-500 text-sm focus:outline-none"
                        />
                      ) : (
                        <span className="font-mono text-slate-700 dark:text-slate-300">{item.stockBalance} {item.unit}</span>
                      )}
                    </td>

                    {/* Extra PO Stock (editable) */}
                    <td className="py-3.5 px-4 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPo}
                          onChange={(e) => setEditPo(Number(e.target.value))}
                          className="w-20 px-2 py-1 text-center font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-indigo-500 text-sm focus:outline-none"
                        />
                      ) : (
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">+{item.extraPoStock}</span>
                      )}
                    </td>

                    {/* Net Deficit Qty */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      {item.isDeficit ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                          {item.reorderQuantity} {item.unit} needed
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">
                          0 (Sufficient)
                        </span>
                      )}
                    </td>

                    {/* Unit Cost */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                      ${item.unitCost.toFixed(2)}
                    </td>

                    {/* Total Reorder Cost */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {item.isDeficit ? `$${item.totalOrderCost.toFixed(2)}` : '$0.00'}
                    </td>

                    {/* Status & Action */}
                    <td className="py-3.5 px-4 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-2 py-1 rounded bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Quick edit stock & PO"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {item.isDeficit ? (
                            <button
                              onClick={onNavigateToReorders}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-colors"
                            >
                              Reorder
                            </button>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                              OK
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div>
          Showing {filteredItems.length} of {items.length} total inventory items from Minimum Qty.xlsx
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onNavigateToIngestion} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            Upload new Stock/PO CSVs &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
