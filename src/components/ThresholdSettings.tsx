import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Settings, Save, Search, AlertCircle, Plus } from 'lucide-react';

interface ThresholdSettingsProps {
  items: InventoryItem[];
  onUpdateThresholds: (updatedItems: InventoryItem[]) => void;
  onOpenAddModal: () => void;
}

export const ThresholdSettings: React.FC<ThresholdSettingsProps> = ({
  items,
  onUpdateThresholds,
  onOpenAddModal
}) => {
  const [editableItems, setEditableItems] = useState<InventoryItem[]>([...items]);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedMessage, setSavedMessage] = useState(false);

  const handleFieldChange = (id: string, field: keyof InventoryItem, value: any) => {
    setEditableItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSaveAll = () => {
    onUpdateThresholds(editableItems);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const filteredItems = editableItems.filter(item => 
    item.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Minimum Qty Thresholds & Baseline Configuration</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure baseline <span className="font-semibold text-slate-700 dark:text-slate-300">Minimum Qty</span> thresholds (default 50) and publisher lead times for each ISBN.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Title</span>
            </button>
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Thresholds</span>
            </button>
          </div>
        </div>

        {savedMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>All ISBN minimum quantity thresholds successfully updated across the WMS engine!</span>
          </div>
        )}

        {/* Search */}
        <div className="mt-6 flex items-center space-x-2">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ISBNs to configure thresholds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Threshold Editor Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">ISBN & Title</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4 text-center">Minimum Qty (Baseline)</th>
                <th className="py-3.5 px-4 text-center">Lead Time (Months)</th>
                <th className="py-3.5 px-4 text-right">Unit Cost ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 max-w-md">
                    <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">{item.isbn}</div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">{item.title}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium text-xs">
                    {item.supplier}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="number"
                      min={0}
                      value={item.minimumQty}
                      onChange={(e) => handleFieldChange(item.id, 'minimumQty', Number(e.target.value))}
                      className="w-28 px-3 py-1.5 text-center font-mono rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-indigo-500/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="number"
                      min={1}
                      value={item.leadTimeDays}
                      onChange={(e) => handleFieldChange(item.id, 'leadTimeDays', Number(e.target.value))}
                      className="w-20 px-3 py-1.5 text-center font-mono rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                    ${item.unitCost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
