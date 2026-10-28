import React from 'react';
import { ViewMode } from '../types';
import { Warehouse, LayoutDashboard, Database, UploadCloud, Truck, Settings, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenAiInsights: () => void;
  onResetData: () => void;
  deficitCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenAiInsights,
  onResetData,
  deficitCount
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Warehouse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight">WMS Pro</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  Phase 1: Order Management
                </span>
              </div>
              <p className="text-xs text-slate-400">Inventory Replenishment & Shortage Calculation Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onViewChange('inventory')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'inventory'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Shortage Report</span>
              {deficitCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-rose-500 text-white rounded-full font-bold animate-pulse">
                  {deficitCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onViewChange('ingestion')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'ingestion'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Data Ingestion Hub</span>
            </button>

            <button
              onClick={() => onViewChange('reorders')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'reorders'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Supplier Reorders</span>
            </button>

            <button
              onClick={() => onViewChange('settings')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'settings'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>SKU Thresholds</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenAiInsights}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
              title="Analyze inventory health with Gemini AI"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span className="hidden sm:inline">AI Insights</span>
            </button>

            <button
              onClick={onResetData}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset to default mock data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded ${currentView === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            Dashboard
          </button>
          <button
            onClick={() => onViewChange('inventory')}
            className={`flex flex-col items-center py-1 px-2 rounded relative ${currentView === 'inventory' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            <Database className="w-4 h-4 mb-0.5" />
            Report
            {deficitCount > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {deficitCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onViewChange('ingestion')}
            className={`flex flex-col items-center py-1 px-2 rounded ${currentView === 'ingestion' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            <UploadCloud className="w-4 h-4 mb-0.5" />
            Upload
          </button>
          <button
            onClick={() => onViewChange('reorders')}
            className={`flex flex-col items-center py-1 px-2 rounded ${currentView === 'reorders' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            <Truck className="w-4 h-4 mb-0.5" />
            Reorders
          </button>
          <button
            onClick={() => onViewChange('settings')}
            className={`flex flex-col items-center py-1 px-2 rounded ${currentView === 'settings' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            <Settings className="w-4 h-4 mb-0.5" />
            Thresholds
          </button>
        </div>
      </div>
    </header>
  );
};
