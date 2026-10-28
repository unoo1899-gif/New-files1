import React from 'react';
import { Package, AlertTriangle, CheckCircle2, DollarSign, Calculator, ArrowUpRight } from 'lucide-react';

interface StatsOverviewProps {
  totalSkus: number;
  deficitCount: number;
  sufficientCount: number;
  totalReorderCost: number;
  onNavigateToReorders: () => void;
  onNavigateToIngestion: () => void;
  onNavigateToReport: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalSkus,
  deficitCount,
  sufficientCount,
  totalReorderCost,
  onNavigateToReorders,
  onNavigateToIngestion,
  onNavigateToReport
}) => {
  const healthPercentage = totalSkus > 0 ? Math.round((sufficientCount / totalSkus) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Formula Highlight Banner */}
      <div className="bg-gradient-to-r from-indigo-900/90 via-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
              <Calculator className="w-4 h-4" />
              <span>Phase 1 Replenishment Calculation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Warehouse Stock & Order Management
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Evaluating inventory health by comparing Minimum Required Stock against physical Stock Balance and incoming Extra PO Stock.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToIngestion}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
            >
              <span>Upload Stock / PO Data</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateToReorders}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-all flex items-center space-x-2"
            >
              <span>View Supplier Orders ({deficitCount})</span>
            </button>
          </div>
        </div>

        {/* Formula Display Box */}
        <div className="mt-6 pt-6 border-t border-indigo-500/20 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
            <div className="text-xs text-slate-400 font-medium">Core Formula</div>
            <div className="text-sm sm:text-base font-bold text-indigo-300 mt-1 font-mono">
              Net Deficit = Min Required - Stock - PO
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
            <div className="text-xs text-slate-400 font-medium">Deficit Trigger (&gt; 0)</div>
            <div className="text-sm font-semibold text-rose-400 mt-1 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Flags shortage & calculates exact reorder quantity</span>
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
            <div className="text-xs text-slate-400 font-medium">Sufficient Trigger (&le; 0)</div>
            <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Stock levels adequate; no reorder needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SKUs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total SKUs</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalSkus}</div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Active catalog items</span>
          </div>
        </div>

        {/* Reorder Required (Deficit) */}
        <div 
          onClick={onNavigateToReport}
          className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Reorder Required</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{deficitCount}</div>
            <span className="text-xs text-rose-500 dark:text-rose-400 font-medium group-hover:underline">View shortages &rarr;</span>
          </div>
        </div>

        {/* Sufficient Stock */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Stock Sufficient</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{sufficientCount}</div>
            <div className="flex items-center space-x-1.5">
              <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full" 
                  style={{ width: `${healthPercentage}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{healthPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Total Reorder Cost */}
        <div 
          onClick={onNavigateToReorders}
          className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Total Reorder Cost</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              ${totalReorderCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium group-hover:underline">Generate POs &rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
};
